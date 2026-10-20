"use client";

import Link from "next/link";
import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiBall from "@/components/AiBall";
import { KNOWLEDGE_BASE } from "@/lib/knowledgeBase";
import { WECHAT_ID, copyWechatId, emitConversionSignal, nowHHMM } from "@/lib/conversionSignal";

// ============================================================
// 类型定义
// ============================================================
type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;              // 气泡文字（行为标记已被剔除）
  card?: "preview" | "wechat";  // 气泡下方渲染的卡片
  time: string;
};

// ============================================================
// 一、前端意图拦截（硬编码，强制触发，不经过大模型）
// ------------------------------------------------------------
// 命中"买 / 资料 / 要 / 多少钱"这类【模糊购买意向】时，直接本地回话术，
// 立即结束本次发送，完全不调用大模型。
// ============================================================
const INTERCEPT_KEYWORDS = ["买", "资料", "要", "多少钱"];

// 拦截后的固定话术（与后端提示词状态1 保持一致）
const INTERCEPT_REPLY =
  "收到您的消息啦~ 告诉我年级和科目（比如：高二数学），我马上给您找对应的资料~";

// 年级 / 科目识别：命中说明买家已经给出具体需求，
// 这种消息必须放行给大模型（否则永远等不到 [SEND_PREVIEW]）
const GRADE_RE = /高[一二三]|初[一二三]|大一|大二|大三|大四|考研|小学/;
const SUBJECT_RE = /数学|语文|英语|物理|化学|生物|政治|历史|地理/;

/**
 * 是否命中"年级 + 科目"（买家已给出具体需求）
 */
function hasGradeAndSubject(text: string): boolean {
  return GRADE_RE.test(text) && SUBJECT_RE.test(text);
}

/**
 * 对话历史里是否已经拿到过「年级 + 科目」
 * 拿到过 → 说明已经进入过状态2，之后再说"购买"属于状态3（直接进付款），
 * 此时绝不能拦截，否则买家永远等不到付款卡片。
 */
function hasGradeAndSubjectInHistory(history: Message[]): boolean {
  return history.some((m) => m.role === "user" && hasGradeAndSubject(m.content));
}

/**
 * 是否应该被前端拦截（只覆盖状态1）
 * 条件：命中购买关键词 + 对话历史里从没出现过年级科目
 */
function shouldIntercept(text: string, history: Message[]): boolean {
  if (!text) return false;
  // 已经知道年级科目了 → 交给大模型走状态2/状态3
  if (hasGradeAndSubjectInHistory(history)) return false;
  // 本条消息自己就带年级科目 → 同样是状态2，交给大模型
  if (hasGradeAndSubject(text)) return false;
  return INTERCEPT_KEYWORDS.some((k) => text.includes(k));
}

// ============================================================
// 二、解析大模型回复里的行为标记
// ------------------------------------------------------------
// [SEND_PREVIEW] → 渲染带水印的 PDF 预览图
// [SEND_QRCODE] → 渲染微信二维码名片
// 标记本身从文字里剔除，不展示给买家
// ============================================================
function parseMarkers(raw: string) {
  let text = raw;
  let card: "preview" | "wechat" | undefined;

  if (text.includes("[SEND_PREVIEW]")) {
    card = "preview";
    text = text.split("[SEND_PREVIEW]").join("");
  }
  if (text.includes("[SEND_QRCODE]")) {
    card = "wechat";
    text = text.split("[SEND_QRCODE]").join("");
  }

  return { text: text.trim(), card };
}

/** 当前时间 HH:mm */
function hhmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ============================================================
// 主组件
// ============================================================
export default function BuyerChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "来啦～我是店铺助理小笔记📚 想找哪个年级、哪门科目的资料呢？",
      time: hhmm(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // 是否正在等 AI 回复
  const [toast, setToast] = useState("");        // Toast 文案（空 = 不显示）

  const listRef = useRef<HTMLDivElement>(null);

  // 消息变化时自动滚到底部
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ------------------------------------------------------------
  // 追加一条消息
  // ------------------------------------------------------------
  function push(msg: Omit<Message, "id" | "time"> & { time?: string }) {
    setMessages((prev) => [
      ...prev,
      { ...msg, id: Date.now() + Math.random(), time: msg.time ?? hhmm() },
    ]);
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
  // 发送主流程
  // ------------------------------------------------------------
  async function sendMessage(text: string) {
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text,
      time: hhmm(),
    };

    // 1. 先把买家消息上屏
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // 2. 【硬编码拦截】只有状态1（还没说清年级科目）才本地回话术，不调大模型
    if (shouldIntercept(text, messages)) {
      await new Promise((r) => setTimeout(r, 400)); // 一点点"思考"停顿
      push({ role: "assistant", content: INTERCEPT_REPLY });
      setLoading(false);
      return; // ← 立即结束本次发送
    }

    // 3. 放行给大模型：带上完整对话历史
    const history = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const assistantId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", time: hhmm() },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) throw new Error("后端返回错误");

      // 4. 流式读取，边读边解析标记
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const { text: cleanText, card } = parseMarkers(buffer);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: cleanText, card: card ?? m.card }
              : m
          )
        );
      }

      // 5. 如果这次回复推了二维码卡片，同步提醒卖家端准备原版文件
      if (parseMarkers(buffer).card === "wechat") {
        emitConversionSignal({
          id: "buyer-chat-" + Date.now(),
          keyword: "[SEND_QRCODE]",
          text,
          time: nowHHMM(),
        });
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

  // 演示用笔记（预览卡片取知识库第一条）
  const demoDoc = KNOWLEDGE_BASE[0];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* ---------- 顶部导航 ---------- */}
        <header className="glass-effect border-b border-white/40 sticky top-0 z-50">
          <div className="mx-auto max-w-4xl px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/buyer" className="text-gray-600 hover:text-gray-900 text-lg">←</Link>
              <span className="text-2xl">💬</span>
              <h1 className="text-lg font-bold warm-gradient-text">AI 客服</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-medium">
                🤖 AI 客服
              </span>
              <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">买家视角</span>
            </div>
          </div>
        </header>

        {/* ---------- 消息列表 ---------- */}
        <main className="flex-1 flex flex-col">
          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-2xl space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-start gap-2 ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* 头像 */}
                  {msg.role === "user" ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-300 text-base">
                      🧑‍🎓
                    </div>
                  ) : (
                    <AiBall size={32} />
                  )}

                  {/* 气泡 */}
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "rounded-tr-none bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                        : "rounded-tl-none bg-white/85 backdrop-blur-sm text-gray-800"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* ---------- [SEND_PREVIEW]：带水印的 PDF 预览图 ---------- */}
                    {msg.card === "preview" && (
                      <a
                        href={demoDoc.preview_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block overflow-hidden rounded-lg border border-gray-200 bg-white"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/preview-watermark.svg"
                          alt="带水印的预览版"
                          className="h-36 w-full object-cover"
                        />
                        <div className="flex items-center gap-2 p-2">
                          <span className="text-xl">📄</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-medium text-gray-900">
                              {demoDoc.title}（预览版 · 带满屏水印）
                            </span>
                            <span className="block text-[11px] text-gray-500">
                              {demoDoc.pages} 页 · 点击查看完整预览 PDF
                            </span>
                          </span>
                          <span className="text-gray-400">›</span>
                        </div>
                      </a>
                    )}

                    {/* ---------- [SEND_QRCODE]：微信二维码名片 ---------- */}
                    {msg.card === "wechat" && (
                      <button
                        type="button"
                        onClick={handleCopyWechat}
                        className="mt-2 flex w-full items-center gap-3 rounded-lg bg-gradient-to-r from-[#07c160] to-[#0aa855] p-2 text-left"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/wechat-qr-placeholder.svg"
                          alt="微信二维码"
                          className="h-12 w-12 shrink-0 rounded bg-white p-0.5"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13px] font-semibold leading-snug text-white">
                            长按识别二维码添加客服微信
                          </span>
                          <span className="mt-0.5 block truncate text-[11px] text-white/85">
                            微信号：{WECHAT_ID} · 点击自动复制
                          </span>
                        </span>
                        <span className="shrink-0 text-white/80">›</span>
                      </button>
                    )}

                    <div
                      className={`mt-1 text-[11px] ${
                        msg.role === "user" ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* ---------- "正在输入"动画 ---------- */}
              {loading && (
                <div className="flex items-start gap-2">
                  <AiBall size={32} />
                  <div className="rounded-2xl rounded-tl-none bg-white/85 px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0s" }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
                      <div className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---------- 输入区 ---------- */}
          <div className="glass-effect border-t border-white/40 px-4 py-4">
            <div className="mx-auto max-w-2xl flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="输入您的问题..."
                className="flex-1 bg-white/70 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="btn-warm rounded-xl px-6 py-3 text-sm font-semibold disabled:opacity-50"
              >
                发送
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ---------- Toast ---------- */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="pointer-events-none fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-black/80 px-4 py-2.5 text-[13px] text-white shadow-lg"
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
