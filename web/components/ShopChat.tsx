"use client"; // 客户端组件：需要处理输入、点击、滚动、流式请求

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiBall from "./AiBall";
import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
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

// 聊天流里可以推送的两种卡片
type Card =
  | {
      kind: "preview"; // 带水印的预览版（图片 + PDF 链接）
      title: string;
      desc: string;
      cover: string; // 预览图（带满屏水印）
      url: string;   // PDF 链接
    }
  | {
      kind: "wechat"; // 微信二维码卡片（收款转化）
      title: string;
      desc: string;
    };

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  card?: Card;   // 卡片（渲染在气泡里）
  human?: boolean; // 是否已转人工
};

// ============================================================
// 快捷操作按钮（类似淘宝客服的快捷回复）
// ------------------------------------------------------------
// 三个按钮都走「本地函数」，不经过大模型，保证点击即得、话术可控
// ============================================================
const QUICK_ACTIONS = [
  { label: "我想要买资料", icon: "🛒", text: "我想要买资料" },
  { label: "直接看预览版", icon: "📄", text: "直接看预览版" },
  { label: "怎么付款？", icon: "💳", text: "怎么付款？" },
] as const;

// 按钮 1 的固定追问话术
const ASK_GRADE_SUBJECT = "请问需要哪个年级和科目的呢？";

// ============================================================
// 解析后端流式返回里的特殊标记（[[PDF:...]] / [[HUMAN:...]]）
// ============================================================
function parseMarkers(raw: string) {
  let text = raw;
  let pdf: { title: string; url: string } | undefined;
  let human = false;
  let markerCard: Card | undefined;

  // 销售话术的行为标记：优先于 PDF 标记
  if (text.includes("[SEND_PREVIEW]")) {
    text = text.split("[SEND_PREVIEW]").join("");
    markerCard = { kind: "preview", title: "", desc: "", cover: "", url: "" };
  }
  if (text.includes("[SEND_QRCODE]")) {
    text = text.split("[SEND_QRCODE]").join("");
    markerCard = { kind: "wechat", title: "", desc: "" };
  }

  const pdfMatch = text.match(/\[\[PDF:([^|\]]+)\|([^\]]+)\]\]/);
  if (pdfMatch) {
    pdf = { title: pdfMatch[1].trim(), url: pdfMatch[2].trim() };
    text = text.replace(pdfMatch[0], "");
  }

  const humanMatch = text.match(/\[\[HUMAN:([^\]]*)\]\]/);
  if (humanMatch) {
    human = true;
    text = text.replace(humanMatch[0], "");
  }

  return { text: text.trim(), pdf, human, markerCard };
}

// ============================================================
// 主组件：/shop 买家聊天窗口
// ============================================================
export default function ShopChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "在的呀～欢迎光临！我是店铺助理小笔记📚 想找哪一科的复习资料呢？",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // 正在等 AI 回复
  const [toast, setToast] = useState("");        // Toast 文案（空 = 不显示）

  const listRef = useRef<HTMLDivElement>(null);

  // 消息变化（或推送卡片）时自动滚到底部
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ------------------------------------------------------------
  // 工具函数：往聊天流里追加一条消息
  // ------------------------------------------------------------
  function pushMessage(msg: Omit<Message, "id">) {
    setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random() }]);
  }

  // 延迟执行（模拟"对方正在输入"的自然停顿）
  function delay(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  // ------------------------------------------------------------
  // 本地函数 1：推送「带水印的预览版」卡片
  // ------------------------------------------------------------
  function pushPreviewCard() {
    // 演示取知识库第一条笔记；真实场景换成买家当前咨询的那篇
    const doc = KNOWLEDGE_BASE[0];

    pushMessage({
      role: "assistant",
      content: `给你发《${doc.title}》的预览版👇 满屏水印仅供确认内容，完整版付款后由老板发送～`,
      card: {
        kind: "preview",
        title: `${doc.title}（预览版 · 带满屏水印）`,
        desc: `${doc.pages} 页 · 完整版 ¥${doc.price} · 点击可查看 PDF`,
        cover: "/preview-watermark.svg",
        url: doc.preview_url,
      },
    });
  }

  // ------------------------------------------------------------
  // 本地函数 2：推送「微信二维码」卡片（不经过大模型，直接弹）
  // ------------------------------------------------------------
  function pushWechatCard() {
    pushMessage({
      role: "assistant",
      content: "付款很简单～扫码加我微信就行，我给你发收款码和无水印原版📚",
      card: {
        kind: "wechat",
        title: "扫码添加客服获取无水印原版",
        desc: `微信号：${WECHAT_ID} · 点击卡片自动复制`,
      },
    });

    // 同步通知卖家端：右侧接单提醒"请准备好原版文件"
    emitConversionSignal({
      id: "shop-wechat-" + Date.now(),
      keyword: "怎么付款？",
      text: "怎么付款？",
      time: nowHHMM(),
    });
  }

  // ------------------------------------------------------------
  // 点击卡片：复制微信号 + Toast
  // ------------------------------------------------------------
  async function handleCardClick() {
    await copyWechatId();
    setToast("微信号已复制，请打开微信添加");
    window.setTimeout(() => setToast(""), 2200);
  }

  // ------------------------------------------------------------
  // 快捷按钮点击：三个按钮都走本地逻辑，不调大模型
  // ------------------------------------------------------------
  async function runQuickAction(text: string) {
    if (loading) return;

    // 1. 先把买家的话原样发进聊天流（点击 = 发送这句话）
    pushMessage({ role: "user", content: text });
    setLoading(true);

    await delay(500); // 一点点"思考"停顿，交互更自然

    // 2. 按按钮类型走不同分支
    if (text.includes("预览版")) {
      pushPreviewCard();          // 直接推带水印预览卡片
    } else if (text.includes("付款")) {
      pushWechatCard();           // 直接推微信二维码卡片
    } else {
      pushMessage({               // 我要买资料 → 固定话术追问年级 + 科目
        role: "assistant",
        content: ASK_GRADE_SUBJECT,
      });
    }

    setLoading(false);
  }

  // ------------------------------------------------------------
  // 手动输入：走大模型（/api/chat 流式）
  // ------------------------------------------------------------
  async function doSend(text: string) {
    if (!text || loading) return;

    const hitKeyword = matchConversionKeyword(text);

    const userMessage: Message = { id: Date.now(), role: "user", content: text };
    const history = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

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
        const parsed = parseMarkers(buffer);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: parsed.text,
                  card:
                    // [SEND_PREVIEW] / [SEND_QRCODE] 标记优先
                    parsed.markerCard?.kind === "preview"
                      ? {
                          kind: "preview",
                          title: `${KNOWLEDGE_BASE[0].title}（预览版 · 带满屏水印）`,
                          desc: `${KNOWLEDGE_BASE[0].pages} 页 · 点击查看 PDF`,
                          cover: "/preview-watermark.svg",
                          url: KNOWLEDGE_BASE[0].preview_url,
                        }
                      : parsed.markerCard?.kind === "wechat"
                      ? {
                          kind: "wechat",
                          title: "长按识别二维码添加客服微信",
                          desc: `微信号：${WECHAT_ID} · 点击卡片自动复制`,
                        }
                      : parsed.pdf
                      ? {
                          kind: "preview",
                          title: parsed.pdf.title,
                          desc: "点击查看带水印预览版 PDF",
                          cover: "/preview-watermark.svg",
                          url: parsed.pdf.url,
                        }
                      : m.card,
                  human: parsed.human || m.human,
                }
              : m
          )
        );
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

      // 手动输入命中购买意图时，底部弹出扫码加微信卡片 + 通知卖家
      if (hitKeyword) {
        emitConversionSignal({
          id: "cv-" + Date.now(),
          keyword: hitKeyword,
          text,
          time: nowHHMM(),
        });
        setTimeout(() => pushWechatCard(), 600);
      }
    }
  }

  function handleSend(e: FormEvent) {
    e.preventDefault();
    doSend(input.trim());
  }

  // ============================================================
  // 渲染界面
  // ============================================================
  return (
    <div className="relative mx-auto flex h-dvh max-w-md flex-col bg-[#ededed]">
      {/* ---------- 顶部标题栏 ---------- */}
      <header className="flex items-center gap-2 border-b border-black/5 bg-[#ededed] px-3 py-3">
        <span className="w-6 text-lg text-gray-500">‹</span>
        <div className="flex-1 text-center">
          <div className="text-[15px] font-medium text-gray-900">瑞子的笔记小铺</div>
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

              {/* ---------- 微信二维码卡片 ---------- */}
              {msg.card?.kind === "wechat" && (
                <button
                  type="button"
                  onClick={handleCardClick}
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
