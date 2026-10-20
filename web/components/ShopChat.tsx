"use client"; // 客户端组件：需要处理输入、点击、滚动、流式请求

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiBall from "./AiBall";
import type { ShopProduct } from "@/lib/shopProducts";
import {
  WECHAT_ID,
  matchConversionKeyword,
  emitConversionSignal,
  copyWechatId,
  nowHHMM,
} from "@/lib/conversionSignal";

// ============================================================
// 类型定义
// ============================================================

// 气泡下方可渲染的卡片
type Card =
  | {
      kind: "preview"; // 带水印的预览版（图片 + PDF 链接）
      title: string;
      desc: string;
      cover: string;
      url: string;
    }
  | {
      kind: "wechat"; // 微信二维码名片
      title: string;
      desc: string;
    };

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  card?: Card;
  human?: boolean;
};

// 从商品卡片跳进来时带的"种子消息"
export type ChatSeed = {
  id: string; // 唯一标识，用于防重复发送
  product: ShopProduct;
  message: string;
};

type Props = {
  /** 从商品卡片点进来时自动发送的消息 */
  seed?: ChatSeed | null;
  /** 买家确认付款后回调（写入购买记录） */
  onPurchase?: (product: ShopProduct) => void;
};

// ============================================================
// 一、前端意图拦截（硬编码，不经过大模型）
// ------------------------------------------------------------
// 只有「状态1」（买家表达购买意向、但对话里从没出现过年级科目）才本地回话术
// ============================================================
const INTERCEPT_KEYWORDS = ["买", "资料", "要", "多少钱"];

// 拦截后的固定话术（与后端提示词状态1 保持一致）
const INTERCEPT_REPLY =
  "收到您的消息啦~ 告诉我年级和科目（比如：高二数学），我马上给您找对应的资料~";

// 年级 / 科目识别
const GRADE_RE = /高[一二三]|初[一二三]|大一|大二|大三|大四|考研|小学/;
const SUBJECT_RE = /数学|语文|英语|物理|化学|生物|政治|历史|地理/;

function hasGradeAndSubject(text: string): boolean {
  return GRADE_RE.test(text) && SUBJECT_RE.test(text);
}

function hasGradeAndSubjectInHistory(history: Message[]): boolean {
  return history.some((m) => m.role === "user" && hasGradeAndSubject(m.content));
}

/**
 * 是否应该被前端拦截（只覆盖状态1）
 * 历史里或本条消息出现过「年级 + 科目」→ 一律放行给大模型（状态2 / 状态3）
 */
function shouldIntercept(text: string, history: Message[]): boolean {
  if (!text) return false;
  if (hasGradeAndSubjectInHistory(history)) return false;
  if (hasGradeAndSubject(text)) return false;
  return INTERCEPT_KEYWORDS.some((k) => text.includes(k));
}

// 付款确认：命中直接本地成交，不再打扰大模型
const PAYMENT_DONE_RE =
  /已付款|付款了|付好了|已支付|支付完了|已拍|拍好了|已下单|我买了|买了|付过了/;

// ============================================================
// 二、快捷操作按钮（类似淘宝客服的快捷回复）
// ------------------------------------------------------------
// 「预览版」「付款」两个按钮走本地函数，不经过大模型
// ============================================================
const QUICK_ACTIONS = [
  { label: "我想要买资料", icon: "🛒", text: "我想要买资料" },
  { label: "直接看预览版", icon: "📄", text: "直接看预览版" },
  { label: "怎么付款？", icon: "💳", text: "怎么付款？" },
] as const;

// ============================================================
// 三、解析大模型回复里的行为标记
// ------------------------------------------------------------
// [SEND_PREVIEW] → 渲染带水印的预览版卡片
// [SEND_QRCODE]  → 渲染微信二维码名片
// 标记本身从文字里剔除，买家看不到
// ============================================================
function parseMarkers(raw: string, product?: ShopProduct | null) {
  let text = raw;
  let card: Card | undefined;

  if (text.includes("[SEND_PREVIEW]")) {
    text = text.split("[SEND_PREVIEW]").join("");
    if (product) {
      // 从商品卡片进来的：用该商品的预览信息
      card = {
        kind: "preview",
        title: `${product.title}（预览版 · 带满屏水印）`,
        desc: `${product.pages} 页 · 点击查看 PDF`,
        cover: "/preview-watermark.svg",
        url: product.previewUrl,
      };
    } else {
      card = {
        kind: "preview",
        title: "学霸手写笔记（预览版 · 带满屏水印）",
        desc: "点击查看 PDF",
        cover: "/preview-watermark.svg",
        url: "/files/sx-gao2-daoshu-preview.pdf",
      };
    }
  }
  if (text.includes("[SEND_QRCODE]")) {
    text = text.split("[SEND_QRCODE]").join("");
    card = {
      kind: "wechat",
      title: "长按识别二维码添加客服微信",
      desc: `微信号：${WECHAT_ID} · 点击卡片自动复制`,
    };
  }

  return { text: text.trim(), card };
}

/** 当前时间 HH:mm */
function hhmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ============================================================
// 主组件：/shop 的【AI 客服】模块
// ============================================================
export default function ShopChat({ seed, onPurchase }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "来啦～我是店铺助理小笔记📚 想找哪个年级、哪门科目的资料呢？",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // 当前会话围绕的商品（从商品卡片进来时才有）
  const [contextProduct, setContextProduct] = useState<ShopProduct | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const handledSeedRef = useRef<string | null>(null); // 已处理过的种子消息 id

  // 消息变化时自动滚到底部
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ------------------------------------------------------------
  // 种子消息：从商品卡片点进来时自动发一条并触发 AI 回复
  // ------------------------------------------------------------
  useEffect(() => {
    if (!seed || handledSeedRef.current === seed.id) return;
    handledSeedRef.current = seed.id;
    setContextProduct(seed.product);
    sendMessage(seed.message, { skipIntercept: true, autoSeed: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  // ------------------------------------------------------------
  // 追加一条消息
  // ------------------------------------------------------------
  function push(msg: Omit<Message, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  }

  // ------------------------------------------------------------
  // 本地函数 1：推送「带水印的预览版」卡片
  // ------------------------------------------------------------
  function pushPreviewCard() {
    const doc = contextProduct;
    push({
      role: "assistant",
      content: doc
        ? `给你发《${doc.title}》的预览版👇 满屏水印仅供确认内容，完整版付款后由老板发送～`
        : "给你发一份手写笔记的预览版👇 满屏水印仅供确认内容～",
      card: parseMarkers("[SEND_PREVIEW]", doc).card,
    });
  }

  // ------------------------------------------------------------
  // 本地函数 2：推送「微信二维码」卡片（不经过大模型，直接弹）
  // ------------------------------------------------------------
  function pushWechatCard() {
    push({
      role: "assistant",
      content: "付款很简单～扫码加我微信就行，我给你发收款码和无水印原版📚",
      card: parseMarkers("[SEND_QRCODE]").card,
    });

    // 同步通知卖家端：右侧接单提醒"请准备好原版文件"
    emitConversionSignal({
      id: "shop-wechat-" + Date.now(),
      keyword: "怎么付款？",
      text: contextProduct ? `咨询商品：${contextProduct.title}` : "咨询购买",
      time: nowHHMM(),
    });
  }

  // ------------------------------------------------------------
  // 点击二维码名片：复制微信号 + Toast
  // ------------------------------------------------------------
  async function handleCopyWechat() {
    await copyWechatId();
    setToast("微信号已复制，请打开微信添加");
    window.setTimeout(() => setToast(""), 2200);
  }

  // ------------------------------------------------------------
  // 快捷按钮：预览 / 付款走本地函数；"我想要买资料"走正常发送
  // ------------------------------------------------------------
  async function runQuickAction(text: string) {
    if (loading) return;

    if (text.includes("预览版")) {
      push({ role: "user", content: text });
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      pushPreviewCard();
      setLoading(false);
      return;
    }
    if (text.includes("付款")) {
      push({ role: "user", content: text });
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      pushWechatCard();
      setLoading(false);
      return;
    }
    // "我想要买资料"：直接当成买家输入发送（会命中前端拦截）
    push({ role: "user", content: text });
    await new Promise((r) => setTimeout(r, 50));
    sendMessage(text, { skipUserPush: true });
  }

  // ------------------------------------------------------------
  // 发送主流程
  // ------------------------------------------------------------
  async function sendMessage(
    text: string,
    opts: { skipUserPush?: boolean; skipIntercept?: boolean; autoSeed?: boolean } = {}
  ) {
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now(), role: "user", content: text };

    if (!opts.skipUserPush) {
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
    }

    setLoading(true);

    // 0. 付款确认 → 本地成交，写入购买记录（不再走大模型）
    if (PAYMENT_DONE_RE.test(text) && contextProduct && onPurchase) {
      await new Promise((r) => setTimeout(r, 400));
      onPurchase(contextProduct);
      push({
        role: "assistant",
        content: `收到～《${contextProduct.title}》已为你登记！完整版马上发你，注意查收微信～有问题随时找我😊`,
      });
      emitConversionSignal({
        id: "order-" + Date.now(),
        keyword: "已付款",
        text: `已付款：${contextProduct.title}`,
        time: nowHHMM(),
      });
      setLoading(false);
      return;
    }

    // 1. 【硬编码拦截】状态1 → 本地直接回话术，不调大模型
    if (!opts.skipIntercept && shouldIntercept(text, messages)) {
      await new Promise((r) => setTimeout(r, 400));
      push({ role: "assistant", content: INTERCEPT_REPLY });
      setLoading(false);
      return;
    }

    // 2. 放行给大模型
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const assistantId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error("后端返回错误");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { text: cleanText, card } = parseMarkers(buffer, contextProduct);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: cleanText, card: card ?? m.card }
              : m
          )
        );
      }

      const finalCard = parseMarkers(buffer, contextProduct).card;

      // 3. 推了二维码卡片 → 同步提醒卖家端准备原版文件
      if (finalCard?.kind === "wechat") {
        emitConversionSignal({
          id: "buyer-chat-" + Date.now(),
          keyword: "[SEND_QRCODE]",
          text: contextProduct
            ? `即将加微信：${contextProduct.title}`
            : text.slice(0, 20),
          time: nowHHMM(),
        });
      } else if (matchConversionKeyword(text) && !finalCard) {
        // 4. 命中购买意图但模型没给卡片 → 底部补一张扫码卡片
        window.setTimeout(() => pushWechatCard(), 600);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "网络出了点问题，请稍后再试～" }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e?: FormEvent) {
    e?.preventDefault();
    sendMessage(input.trim());
  }

  // ============================================================
  // 渲染界面（全屏聊天）
  // ============================================================
  return (
    <div className="relative mx-auto flex h-full w-full max-w-md flex-col bg-[#ededed]">
      {/* ---------- 顶部标题栏 ---------- */}
      <header className="flex items-center gap-2 border-b border-black/5 bg-[#ededed] px-3 py-3">
        <span className="w-6 text-lg text-gray-500">‹</span>
        <div className="flex-1 text-center">
          <div className="text-[15px] font-medium text-gray-900">学霸笔记 AI 客服</div>
          <div className="text-[11px] text-gray-500">AI 助理 · 在线</div>
        </div>
        <span className="w-6 text-right text-lg text-gray-500">···</span>
      </header>

      {/* ---------- 消息列表 ---------- */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {msg.role === "user" ? (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-300 text-lg">
                🧑‍🎓
              </div>
            ) : (
              <AiBall size={36} />
            )}

            <div
              className={`max-w-[78%] rounded-lg px-3 py-2 text-[15px] leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "rounded-tr-none bg-[#95ec69] text-gray-900"
                  : "rounded-tl-none bg-white text-gray-900"
              }`}
            >
              {msg.human && (
                <div className="mb-2 rounded-md bg-yellow-50 px-2 py-1 text-[13px] text-yellow-700">
                  ⚠️ 已为你转接人工客服，请稍等，老板马上来处理～
                </div>
              )}

              <span className="whitespace-pre-wrap">{msg.content}</span>

              {/* ---------- 带水印预览版卡片 ---------- */}
              {msg.card?.kind === "preview" && (
                <a
                  href={msg.card.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block overflow-hidden rounded-md border border-gray-200 bg-gray-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={msg.card.cover}
                    alt="预览版（带满屏水印）"
                    className="h-32 w-full object-cover"
                  />
                  <div className="flex items-center gap-2 p-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium text-gray-900">
                        {msg.card.title}
                      </div>
                      <div className="text-[11px] text-gray-500">{msg.card.desc}</div>
                    </div>
                    <span className="text-gray-400">›</span>
                  </div>
                </a>
              )}

              {/* ---------- 微信二维码名片 ---------- */}
              {msg.card?.kind === "wechat" && (
                <button
                  type="button"
                  onClick={handleCopyWechat}
                  className="mt-2 flex w-full items-center gap-3 rounded-md bg-gradient-to-r from-[#07c160] to-[#0aa855] p-2 text-left"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/wechat-qr-placeholder.svg"
                    alt="微信二维码"
                    className="h-12 w-12 shrink-0 rounded bg-white p-0.5"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold leading-snug text-white">
                      {msg.card.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-white/85">
                      {msg.card.desc}
                    </span>
                  </span>
                  <span className="shrink-0 text-white/80">›</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* ---------- "正在输入"动画 ---------- */}
        {loading && (
          <div className="flex items-start gap-2">
            <AiBall size={36} />
            <div className="rounded-lg rounded-tl-none bg-white px-4 py-3 shadow-sm">
              <span className="flex gap-1">
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ---------- 快捷操作按钮（输入框上方） ---------- */}
      <div className="flex flex-wrap gap-2 border-t border-black/5 bg-[#f7f7f7] px-3 pb-2 pt-2">
        {QUICK_ACTIONS.map((a, i) => (
          <motion.button
            key={a.text}
            type="button"
            disabled={loading}
            onClick={() => runQuickAction(a.text)}
            className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-[13px] text-gray-700 shadow-sm transition-colors hover:border-[#07c160] hover:text-[#07c160] disabled:opacity-50"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="mr-1">{a.icon}</span>
            {a.label}
          </motion.button>
        ))}
      </div>

      {/* ---------- 底部输入栏 ---------- */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-black/5 bg-[#f7f7f7] px-3 py-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="说点什么…"
          className="flex-1 rounded-full bg-white px-4 py-2 text-[15px] outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-full bg-[#07c160] px-4 py-2 text-[15px] font-medium text-white disabled:bg-[#a8e6c1]"
        >
          发送
        </button>
      </form>

      {/* ---------- Toast ---------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/80 px-4 py-2.5 text-[13px] text-white shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            ✅ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
