"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiBall from "./AiBall";
import {
  subscribeConversionSignal,
  readFreshConversionSignal,
  type ConversionSignal,
} from "@/lib/conversionSignal";
import {
  conversations as mockConversations,
  notices as mockNotices,
  type Conversation,
  type Notice,
} from "@/lib/mockData";

// ============================================================
// AI 客服工作台主体（核心展示页）
// 布局：左 = 会话列表 ｜ 中 = 买家与 AI 的聊天记录 ｜ 右 = 接单通知 + 手动介入
// 数据来源：lib/mockData.ts（MVP 假数据，交互全部可用）
// ============================================================

export default function ServiceDesk() {
  // ---------- 状态 ----------
  const [convs, setConvs] = useState<Conversation[]>(mockConversations);
  const [notices, setNotices] = useState<Notice[]>(mockNotices);
  const [activeId, setActiveId] = useState(convs[0].id); // 当前选中的会话
  const [replyText, setReplyText] = useState(""); // 手动回复输入框
  const [filter, setFilter] = useState<"all" | "ai" | "human">("all"); // 会话筛选

  // 当前会话（找不到就退回第一个，保证不会崩）
  const active = convs.find((c) => c.id === activeId) ?? convs[0];

  // ---------- 切换会话（同时清掉未读数） ----------
  function selectConversation(id: string) {
    setActiveId(id);
    setConvs((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }

  // ---------- 手动介入：发送卖家回复 ----------
  function handleSendReply() {
    const text = replyText.trim();
    if (!text) return;

    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");

    // 追加一条"卖家"消息，并把会话标记为人工接管中
    setConvs((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              status: "human",
              messages: [
                ...c.messages,
                { id: "s" + Date.now(), from: "seller", text, time: hh + ":" + mm },
              ],
            }
          : c
      )
    );
    setReplyText("");
  }

  // ---------- 交还给 AI ----------
  function handleBackToAI() {
    setConvs((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, status: "ai" } : c))
    );
  }

  // ---------- 接管会话 ----------
  function handleTakeOver() {
    setConvs((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, status: "human" } : c))
    );
  }

  // ---------- 终极转化：买家端触发"扫码加微信"卡片时，同步提醒老板 ----------
  function pushConversionNotice(signal: ConversionSignal) {
    const notice: Notice = {
      id: signal.id,
      type: "wechat",
      title: "买家可能即将添加微信",
      // 带上买家咨询的商品/原话，方便老板直接准备对应原版文件
      desc: signal.text
        ? `${signal.text}，请准备好原版文件！`
        : "请准备好原版文件！",
      time: signal.time,
      conversationId: convs[0]?.id, // 演示阶段挂到第一个会话上
    };
    // 同一条信号不重复插入
    setNotices((prev) =>
      prev.some((n) => n.id === notice.id) ? prev : [notice, ...prev]
    );
  }

  useEffect(() => {
    // 买家端实时推送过来的信号（同页面 CustomEvent / 跨标签页 storage 都能收到）
    const unsubscribe = subscribeConversionSignal(pushConversionNotice);

    // 如果卖家页面是后打开的，补一条 10 分钟内的信号，方便演示
    const fresh = readFreshConversionSignal();
    if (fresh) pushConversionNotice(fresh);

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- 点击通知：跳到对应会话并移除该通知 ----------
  function handleNoticeClick(n: Notice) {
    if (n.conversationId) selectConversation(n.conversationId);
    setNotices((prev) => prev.filter((x) => x.id !== n.id));
  }

  // 通知图标
  const noticeIcon: Record<Notice["type"], string> = {
    order: "💰",
    escalate: "🚨",
    stock: "📝",
    wechat: "💬",
  };

  // 按筛选条件过滤会话列表
  const filteredConvs = convs.filter((c) =>
    filter === "all" ? true : c.status === filter
  );

  return (
    <div className="flex h-full">
      {/* ============ 左栏：会话列表 ============ */}
      <motion.div
        className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* 搜索 + 筛选 */}
        <div className="border-b border-neutral-100 p-3">
          <motion.input
            placeholder="搜索买家昵称"
            className="w-full rounded-lg border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-neutral-400 transition-all focus:ring-2 focus:ring-emerald-500/20"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          />
          <div className="mt-2 flex gap-1 text-[12px]">
            {[
              { key: "all" as const, label: "全部" },
              { key: "ai" as const, label: "AI 接待中" },
              { key: "human" as const, label: "人工接管" },
            ].map((f, i) => (
              <motion.button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={
                  filter === f.key
                    ? "rounded bg-neutral-900 px-2 py-0.5 text-white"
                    : "rounded bg-neutral-100 px-2 py-0.5 text-neutral-500"
                }
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 + 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {f.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* 会话项列表 */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence>
            {filteredConvs.map((c, i) => (
              <motion.button
                key={c.id}
                onClick={() => selectConversation(c.id)}
                className={
                  c.id === activeId
                    ? "flex w-full gap-2 border-b border-neutral-50 bg-neutral-100 p-3 text-left"
                    : "flex w-full gap-2 border-b border-neutral-50 p-3 text-left transition-colors hover:bg-neutral-50"
                }
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.span
                  className="text-2xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {c.buyerAvatar}
                </motion.span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-medium">
                      {c.buyerName}
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      {c.lastTime}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1">
                    <motion.span
                      className={
                        c.status === "ai"
                          ? "rounded bg-green-50 px-1 text-[10px] text-green-600"
                          : "rounded bg-blue-50 px-1 text-[10px] text-blue-600"
                      }
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {c.status === "ai" ? "AI" : "人工"}
                    </motion.span>
                    <span className="truncate text-[12px] text-neutral-400">
                      {c.messages[c.messages.length - 1]?.text ?? ""}
                    </span>
                  </div>
                </div>
                {c.unread > 0 && (
                  <motion.span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ============ 中栏：聊天记录 ============ */}
      <motion.div
        className="flex min-w-0 flex-1 flex-col bg-neutral-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* 会话头部 */}
        <motion.div
          className="flex items-center gap-3 border-b border-neutral-200 bg-white px-5 py-3"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.span
            className="text-2xl"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {active.buyerAvatar}
          </motion.span>
          <div className="flex-1">
            <div className="text-sm font-bold">{active.buyerName}</div>
            <div className="text-[12px] text-neutral-400">
              来源：{active.source}
            </div>
          </div>
          <motion.span
            className={
              active.status === "ai"
                ? "rounded bg-green-50 px-2 py-0.5 text-[12px] text-green-600"
                : "rounded bg-blue-50 px-2 py-0.5 text-[12px] text-blue-600"
            }
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {active.status === "ai" ? "🤖 AI 接待中" : "🧑‍💼 人工接管中"}
          </motion.span>
          {active.status === "ai" ? (
            <motion.button
              onClick={handleTakeOver}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-[13px] text-white hover:bg-neutral-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              接管会话
            </motion.button>
          ) : (
            <motion.button
              onClick={handleBackToAI}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-[13px] hover:bg-neutral-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              交还给 AI
            </motion.button>
          )}
        </motion.div>

        {/* 消息气泡列表 */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <AnimatePresence>
            {active.messages.map((m, i) => {
              // 系统提示：居中灰字
              if (m.from === "system") {
                return (
                  <motion.div
                    key={m.id}
                    className="text-center text-[12px] text-neutral-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    —— {m.text} · {m.time} ——
                  </motion.div>
                );
              }

              // 买家（左，白气泡）/ AI 和卖家（右，彩色气泡）
              const isBuyer = m.from === "buyer";
              const name =
                m.from === "ai"
                  ? "AI 助理"
                  : m.from === "seller"
                    ? "我（人工）"
                    : active.buyerName;

              return (
                <motion.div
                  key={m.id}
                  className={isBuyer ? "flex items-start gap-2" : "flex flex-row-reverse items-start gap-2"}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                >
                  {/* 头像：AI 消息用小圆球，买家/人工用 emoji */}
                  {m.from === "ai" ? (
                    <AiBall size={32} />
                  ) : (
                    <motion.span
                      className="text-xl"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {isBuyer ? active.buyerAvatar : "🧑‍💼"}
                    </motion.span>
                  )}
                  <div className="max-w-[65%]">
                    <div
                      className={
                        isBuyer
                          ? "text-[11px] text-neutral-400"
                          : "text-right text-[11px] text-neutral-400"
                      }
                    >
                      {name} · {m.time}
                    </div>
                    <motion.div
                      className={
                        "mt-0.5 rounded-lg px-3 py-2 text-sm leading-relaxed shadow-sm " +
                        (isBuyer
                          ? "rounded-tl-none bg-white"
                          : m.from === "ai"
                            ? "rounded-tr-none bg-green-50 text-green-900"
                            : "rounded-tr-none bg-blue-50 text-blue-900")
                      }
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      {m.text}
                      {/* PDF 预览卡片 */}
                      {m.pdf && (
                        <motion.a
                          href={m.pdf.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 flex items-center gap-2 rounded-md border border-neutral-200 bg-white p-2"
                          whileHover={{ scale: 1.02, backgroundColor: "rgba(0,0,0,0.02)" }}
                        >
                          <span className="text-xl">📄</span>
                          <span className="flex-1 text-[13px]">{m.pdf.title}</span>
                          <span className="text-neutral-400">›</span>
                        </motion.a>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ============ 右栏：接单通知 + 手动介入 ============ */}
      <motion.div
        className="flex w-80 shrink-0 flex-col border-l border-neutral-200 bg-white"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {/* 接单通知 */}
        <div className="border-b border-neutral-100 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">🔔 接单通知</span>
            {notices.length > 0 && (
              <motion.span
                className="rounded-full bg-red-500 px-1.5 text-[11px] leading-4 text-white"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {notices.length}
              </motion.span>
            )}
          </div>
        </div>
        <div className="max-h-64 flex-1 space-y-2 overflow-y-auto p-3">
          <AnimatePresence>
            {notices.length === 0 && (
              <motion.p
                className="py-6 text-center text-[13px] text-neutral-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                暂无新通知
              </motion.p>
            )}
            {notices.map((n, i) => (
              <motion.button
                key={n.id}
                onClick={() => handleNoticeClick(n)}
                className={
                  n.type === "wechat"
                    ? "w-full rounded-lg border border-green-300 bg-green-50 p-2.5 text-left transition-colors hover:border-green-400"
                    : "w-full rounded-lg border border-neutral-100 bg-neutral-50 p-2.5 text-left transition-colors hover:border-neutral-300"
                }
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.02, x: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-1.5 text-[13px] font-medium">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    {noticeIcon[n.type]}
                  </motion.span>
                  {n.title}
                  <span className="ml-auto text-[11px] font-normal text-neutral-400">
                    {n.time}
                  </span>
                </div>
                <div className="mt-1 text-[12px] leading-relaxed text-neutral-500">
                  {n.desc}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* 手动介入回复 */}
        <div className="border-t border-neutral-100 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold">✍️ 手动介入回复</span>
            <motion.span
              className={
                active.status === "ai"
                  ? "rounded bg-green-50 px-1.5 py-0.5 text-[11px] text-green-600"
                  : "rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-600"
              }
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {active.status === "ai" ? "AI 自动接待中" : "你已接管"}
            </motion.span>
          </div>

          {/* 快捷回复 */}
          <div className="mb-2 flex flex-wrap gap-1.5">
            {[
              "完整版已发你邮箱，请查收～",
              "稍等，我确认一下内容",
              "抱歉，这个问题我亲自处理",
            ].map((q, i) => (
              <motion.button
                key={q}
                onClick={() => setReplyText(q)}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-[12px] text-neutral-500 hover:bg-neutral-50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 + 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {q}
              </motion.button>
            ))}
          </div>

          <motion.textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              active.status === "ai"
                ? "输入内容后发送，将自动接管该会话…"
                : "以卖家身份回复买家…"
            }
            rows={4}
            className="w-full resize-none rounded-lg border border-neutral-200 p-3 text-sm outline-none focus:border-neutral-400 transition-all focus:ring-2 focus:ring-emerald-500/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          />
          <motion.button
            onClick={handleSendReply}
            disabled={!replyText.trim()}
            className="mt-2 w-full rounded-lg bg-neutral-900 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:bg-neutral-300"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            发送（接管会话）
          </motion.button>
          <p className="mt-2 text-[11px] leading-relaxed text-neutral-400">
            提示：买家情绪激动或提出退款等要求时，AI
            会自动转人工并在此推送通知；你也可以随时主动接管。
          </p>
        </div>
      </motion.div>
    </div>
  );
}
