"use client"; // 标记这是客户端组件（需要浏览器交互：输入、滚动、 fetch）

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

// 一条聊天消息
type Message = {
  id: number;
  role: "user" | "assistant"; // 买家 或 AI
  content: string;           // 文字内容
  pdf?: { title: string; url: string }; // 解析出的 PDF 卡片（可选）
  human?: boolean;           // 是否已转人工（显示黄色提示条）
  previewCard?: boolean;     // 命中 [SEND_PREVIEW]：渲染带水印预览图
  qrCard?: boolean;          // 命中 [SEND_QRCODE]：渲染微信二维码名片
};

// ============================================================
// 内部函数：解析后端发来的特殊标记
// ------------------------------------------------------------
// 后端会在文字流里混入这些标记：
//   [SEND_PREVIEW]        → 渲染带水印的预览版图片
//   [SEND_QRCODE]         → 渲染微信二维码名片
//   [[PDF:标题|链接]]     → 渲染成 PDF 卡片
//   [[HUMAN:原因]]        → 渲染成"已转人工"提示条
// 这个函数负责把它们从文字里"抠出来"，剩下的才是纯聊天文字
// ============================================================
function parseMarkers(raw: string) {
  let text = raw;
  let pdf: { title: string; url: string } | undefined;
  let human = false;
  let previewCard = false;
  let qrCard = false;

  // 匹配 [SEND_PREVIEW] / [SEND_QRCODE]（销售话术的行为标记）
  if (text.includes("[SEND_PREVIEW]")) {
    previewCard = true;
    text = text.split("[SEND_PREVIEW]").join("");
  }
  if (text.includes("[SEND_QRCODE]")) {
    qrCard = true;
    text = text.split("[SEND_QRCODE]").join("");
  }

  // 匹配 [[PDF:标题|链接]]
  const pdfMatch = text.match(/\[\[PDF:([^|\]]+)\|([^\]]+)\]\]/);
  if (pdfMatch) {
    pdf = { title: pdfMatch[1].trim(), url: pdfMatch[2].trim() };
    text = text.replace(pdfMatch[0], ""); // 从文字里删掉标记本身
  }

  // 匹配 [[HUMAN:原因]]
  const humanMatch = text.match(/\[\[HUMAN:([^\]]*)\]\]/);
  if (humanMatch) {
    human = true;
    text = text.replace(humanMatch[0], "");
  }

  return { text: text.trim(), pdf, human, previewCard, qrCard };
}

// ============================================================
// 主组件：聊天窗口
// ============================================================
export default function ChatWindow() {
  // ---- 状态（数据） ----
  // 消息列表。初始放一条 AI 的欢迎语，让聊天界面不至于空白
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "在的呀～欢迎光临！我是店铺助理小笔记📚 看到你来啦，是想找哪科的复习资料呢？",
    },
  ]);
  const [input, setInput] = useState("");   // 输入框里的文字
  const [loading, setLoading] = useState(false); // 是否正在等 AI 回复（锁住发送按钮）

  // ---- 终极转化：扫码加微信卡片 ----
  const [showCard, setShowCard] = useState(false); // 是否展示底部高亮卡片
  const [toast, setToast] = useState("");          // Toast 文案（空字符串 = 不显示）

  // ---- 引用（拿到页面上的真实 DOM 元素） ----
  const listRef = useRef<HTMLDivElement>(null); // 消息列表容器，用于自动滚动

  // ---- 副作用：每当消息变化（或卡片弹出时），自动滚动到最底部（像微信一样） ----
  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, showCard]);

  // ============================================================
  // 发送消息 + 接收流式回复（核心逻辑）
  // ============================================================
  async function doSend(text: string) {
    if (!text || loading) return; // 空消息或正在等待时，直接忽略

    // 0. 先看这句是不是"购买意图"（我要买 / 怎么付款 / 发原版 …）
    //    是的话，等 AI 回复完再弹出扫码卡片，同时通知卖家端
    const hitKeyword = matchConversionKeyword(text);

    // 1. 把买家消息加到列表里显示出来
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: text,
    };
    // history = 目前为止的完整对话 + 本次买家消息（稍后发给后端）
    const history = [...messages, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // 2. 先放一条"空的" AI 消息占位，等流式文字到了再往里填
    const assistantId = Date.now() + 1;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      // 3. 请求我们自己的后端接口 /api/chat
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // 只把 role 和 content 发给后端（pdf/human 这些展示字段不带）
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("后端返回错误");
      }

      // 4. 读取流式响应：像排队取快递一样，一段一段地读
      const reader = res.body.getReader();
      const decoder = new TextDecoder(); // 把二进制数据解码成文字
      let buffer = ""; // 累积已收到的全部文字

      for (;;) {
        const { done, value } = await reader.read(); // 读一段
        if (done) break; // 读完了，退出循环

        buffer += decoder.decode(value, { stream: true });

        // 解析这一帧里的 PDF 卡片 / 转人工标记
        const parsed = parseMarkers(buffer);

        // 更新那条占位的 AI 消息（用 map 精准替换，不动其他消息）
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: parsed.text,        // 纯文字（标记已被抠掉）
                  pdf: parsed.pdf ?? m.pdf,    // 有新卡片就用新的
                  human: parsed.human || m.human,
                  previewCard: parsed.previewCard || m.previewCard,
                  qrCard: parsed.qrCard || m.qrCard,
                }
              : m
          )
        );
      }
    } catch (error) {
      // 网络或后端出错：把占位消息改成错误提示
      console.error(error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "网络出了点问题，请稍后再试～" }
            : m
        )
      );
    } finally {
      setLoading(false); // 无论如何，最后都解除"等待中"状态

      // ---- 终极转化：AI 说完客气话后，弹出扫码加微信卡片 ----
      if (hitKeyword) {
        setShowCard(true);
        // 同步给卖家工作台（右侧接单通知会提示"请准备好原版文件"）
        emitConversionSignal({
          id: "cv-" + Date.now(),
          keyword: hitKeyword,
          text,
          time: nowHHMM(),
        });
      }
    }
  }

  // ============================================================
  // 渲染界面
  // ============================================================
  // 表单提交处理
  function handleSend(e: FormEvent) {
    e.preventDefault();
    doSend(input.trim());
  }

  // 转人工处理
  function handleTransfer() {
    doSend("转人工");
  }

  // 点击二维码名片：复制微信号 + 弹 Toast
  async function handleCopyWechat() {
    await copyWechatId();
    setToast("微信号已复制，请打开微信添加");
    window.setTimeout(() => setToast(""), 2200);
  }

  // 点击扫码卡片：复制微信号 + 弹 Toast
  async function handleCardClick() {
    await copyWechatId();
    setToast("微信号已复制，请打开微信添加");
    window.setTimeout(() => setToast(""), 2200); // 2.2 秒后自动消失
  }

  return (
    <div className="relative mx-auto flex h-dvh max-w-md flex-col bg-[#ededed]">
      {/* ---------- 顶部标题栏（模仿微信） ---------- */}
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
            // 买家消息靠右（flex-row-reverse 把头像和气泡左右互换）
            className={`flex items-start gap-2 ${
              msg.role === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* 头像：买家是学生 emoji，AI 助理是小圆球 */}
            {msg.role === "user" ? (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-300 text-lg">
                🧑‍🎓
              </div>
            ) : (
              <AiBall size={36} />
            )}

            {/* 气泡 */}
            <div
              className={`max-w-[70%] rounded-lg px-3 py-2 text-[15px] leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "rounded-tr-none bg-[#95ec69] text-gray-900" // 微信绿 + 右上角直角（小尾巴效果）
                  : "rounded-tl-none bg-white text-gray-900"     // 白色 + 左上角直角
              }`}
            >
              {/* 转人工提示条 */}
              {msg.human && (
                <div className="mb-2 rounded-md bg-yellow-50 px-2 py-1 text-[13px] text-yellow-700">
                  ⚠️ 已为你转接人工客服，请稍等，老板马上来处理～
                </div>
              )}

              {/* 文字内容（whitespace-pre-wrap 保留换行） */}
              <span className="whitespace-pre-wrap">{msg.content}</span>

              {/* PDF 卡片（后端下发 [[PDF:...]] 标记时渲染） */}
              {msg.pdf && (
                <a
                  href={msg.pdf.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-2"
                >
                  <span className="text-2xl">📄</span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-medium text-gray-900">
                      {msg.pdf.title}
                    </span>
                    <span className="block text-[12px] text-gray-500">
                      点击查看预览版 PDF
                    </span>
                  </span>
                  <span className="text-gray-400">›</span>
                </a>
              )}

              {/* [SEND_PREVIEW]：带水印的预览版图片 */}
              {msg.previewCard && (
                <a
                  href={KNOWLEDGE_BASE[0].preview_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block overflow-hidden rounded-md border border-gray-200 bg-white"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/preview-watermark.svg"
                    alt="带水印的预览版"
                    className="h-32 w-full object-cover"
                  />
                  <div className="flex items-center gap-2 p-2">
                    <span className="text-xl">📄</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-gray-900">
                        {KNOWLEDGE_BASE[0].title}（预览版 · 带满屏水印）
                      </span>
                      <span className="block text-[11px] text-gray-500">
                        {KNOWLEDGE_BASE[0].pages} 页 · 点击查看 PDF
                      </span>
                    </span>
                    <span className="text-gray-400">›</span>
                  </div>
                </a>
              )}

              {/* [SEND_QRCODE]：微信二维码名片 */}
              {msg.qrCard && (
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
                      长按识别二维码添加客服微信
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-white/85">
                      微信号：{WECHAT_ID} · 点击自动复制
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
                {/* 三个跳动的小圆点，用 animation-delay 做出波浪感 */}
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ---------- 终极转化卡片（输入框上方，高亮弹出） ---------- */}
      <AnimatePresence>
        {showCard && (
          <motion.div
            className="border-t border-black/5 bg-[#f7f7f7] px-3 pb-2 pt-1"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <motion.div
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#07c160] to-[#0aa855] shadow-lg ring-2 ring-[#07c160]/30"
              // 轻微呼吸发光，强化"高亮"感
              animate={{ boxShadow: [
                "0 6px 18px rgba(7,193,96,0.28)",
                "0 8px 26px rgba(7,193,96,0.45)",
                "0 6px 18px rgba(7,193,96,0.28)",
              ] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <button
                type="button"
                onClick={handleCardClick}
                className="flex w-full items-center gap-3 p-2.5 text-left"
              >
                {/* 微信二维码占位图 */}
                <span className="shrink-0 rounded-md bg-white p-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/wechat-qr-placeholder.svg"
                    alt="微信二维码"
                    className="h-14 w-14"
                  />
                </span>

                {/* 提示文字 */}
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold leading-snug text-white">
                    扫码添加客服获取无水印原版
                  </span>
                  <span className="mt-0.5 block truncate text-[12px] text-white/85">
                    微信号：{WECHAT_ID} · 点击复制
                  </span>
                </span>

                <span className="shrink-0 text-lg text-white/80">›</span>
              </button>

              {/* 关闭卡片 */}
              <button
                type="button"
                onClick={() => setShowCard(false)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[12px] text-white/70 hover:bg-white/20"
                aria-label="关闭卡片"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- 底部输入栏 ---------- */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-black/5 bg-[#f7f7f7] px-3 py-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)} // 输入时更新状态
          placeholder="说点什么…"
          className="flex-1 rounded-full bg-white px-4 py-2 text-[15px] outline-none"
        />
        <button
          type="button"
          onClick={handleTransfer}
          className="rounded-full bg-[#ff9500] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#e08900] transition-colors"
        >
          转人工
        </button>
        <button
          type="submit"
          // 等待中或输入为空时禁用按钮（并变浅色）
          disabled={loading || !input.trim()}
          className="rounded-full bg-[#07c160] px-4 py-2 text-[15px] font-medium text-white disabled:bg-[#a8e6c1]"
        >
          发送
        </button>
      </form>

      {/* ---------- Toast 提示（点击卡片后弹出） ---------- */}
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
