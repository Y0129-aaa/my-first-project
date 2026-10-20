"use client";

import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { OPTIONS } from "@/lib/mockData";

// ============================================================
// 笔记处理页主体
// 左侧：上传图片 / 输入文字 + 笔记信息
// 右侧：AI 处理结果（排版文档 / 推广推文，Tab 切换）
// ============================================================

// AI 处理结果的类型
type ProcessResult = {
  formatted: string; // 排版后的文档
  tweet: string; // 推广推文
  highlights: string[]; // 核心要点
  mock?: boolean; // true 表示这是兜底示例数据（AI 不可用时返回）
};

// 顶部三步流程条
const STEPS = ["① 上传 / 输入", "② AI 处理", "③ 预览导出"];

export default function NoteProcessor() {
  // ---------- 输入区状态 ----------
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]); // 已选图片
  const [text, setText] = useState(""); // 原始笔记文字
  const [subject, setSubject] = useState(OPTIONS.subjects[0]);
  const [grade, setGrade] = useState(OPTIONS.grades[1]);
  const [version, setVersion] = useState(OPTIONS.versions[1]);
  const [purpose, setPurpose] = useState(OPTIONS.purposes[1]);
  const [style, setStyle] = useState(OPTIONS.styles[0]);

  // ---------- 处理过程状态 ----------
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [tab, setTab] = useState<"doc" | "tweet">("doc");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------- 选择图片 ----------
  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []).map((f) => ({
      name: f.name,
      // 创建本地预览地址（图片存在浏览器内存里，刷新后消失）
      url: URL.createObjectURL(f),
    }));
    setFiles((prev) => [...prev, ...picked]);
  }

  // ---------- 调用 AI 接口 ----------
  async function handleProcess() {
    if (!text.trim()) {
      setError("请先输入或粘贴笔记内容");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/notes/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, subject, grade, version, purpose, style }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "处理失败");
      setResult(data);
      setTab("doc");
    } catch (e: any) {
      setError(e?.message || "网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  // ---------- 复制当前 Tab 的内容 ----------
  async function handleCopy() {
    if (!result) return;
    const content = tab === "doc" ? result.formatted : result.tweet;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("复制失败，请手动选择文本复制");
    }
  }

  // ---------- 导出 Markdown 文件 ----------
  function handleDownload() {
    if (!result) return;
    const blob = new Blob([result.formatted], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${subject}-${grade}-${purpose}-排版版.md`;
    a.click();
  }

  return (
    <div className="flex h-full flex-col">
      {/* ---------- 顶部标题 + 步骤条 ---------- */}
      <motion.div
        className="border-b border-neutral-200 bg-white px-6 py-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <motion.h1
            className="text-lg font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            笔记处理
          </motion.h1>
          <div className="flex items-center gap-2 text-[12px] text-neutral-400">
            {STEPS.map((s, i) => (
              <motion.span
                key={s}
                className={
                  (i === 0 && !result) ||
                  (i === 1 && loading) ||
                  (i === 2 && result)
                    ? "rounded bg-neutral-900 px-2 py-0.5 text-white"
                    : "rounded bg-neutral-100 px-2 py-0.5"
                }
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 + 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ---------- 主体：左右两栏 ---------- */}
      <div className="grid flex-1 grid-cols-1 gap-5 overflow-y-auto p-6 lg:grid-cols-2">
        {/* ===== 左栏：输入 ===== */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* 上传区 */}
          <motion.div
            className="rounded-xl border border-neutral-200 bg-white p-5 card-hover"
            whileHover={{ scale: 1.01 }}
          >
            <div className="mb-3 flex items-center justify-between">
              <motion.span
                className="font-bold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                ① 上传笔记图片
              </motion.span>
              <motion.span
                className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                MVP 提示：图片 OCR 为二期能力
              </motion.span>
            </div>

            {/* 点击选择文件（隐藏的原生文件选择框） */}
            <motion.div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-lg border-2 border-dashed border-neutral-200 p-6 text-center transition-colors hover:border-neutral-400 hover:bg-neutral-50"
              whileHover={{ scale: 1.02, borderColor: "#9ca3af" }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="text-3xl"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📷
              </motion.div>
              <div className="mt-2 text-sm text-neutral-500">
                点击上传手写笔记 / 截图（支持多选）
              </div>
            </motion.div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFiles}
            />

            {/* 已选图片缩略图 */}
            <AnimatePresence>
              {files.length > 0 && (
                <motion.div
                  className="mt-3 flex flex-wrap gap-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  {files.map((f, i) => (
                    <motion.div
                      key={i}
                      className="relative"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={f.url}
                        alt={f.name}
                        className="h-16 w-16 rounded-lg border border-neutral-200 object-cover"
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <p className="mt-2 text-[12px] text-neutral-400">
              当前版本请同时在下方粘贴笔记文字，AI 会基于文字进行排版。
            </p>
          </motion.div>

          {/* 文字输入 + 笔记信息 */}
          <motion.div
            className="rounded-xl border border-neutral-200 bg-white p-5 card-hover"
            whileHover={{ scale: 1.01 }}
          >
            <motion.div
              className="mb-3 font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              ② 原始笔记内容
            </motion.div>
            <motion.textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"把笔记内容粘贴到这里，例如：\n导数：f'(x)=lim... \n常见题型：1. 求切线方程 ..."}
              className="h-48 w-full resize-none rounded-lg border border-neutral-200 p-3 text-sm outline-none focus:border-neutral-400 transition-all focus:ring-2 focus:ring-emerald-500/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileFocus={{ scale: 1.01 }}
            />

            {/* 笔记信息（与接单助理的槽位保持一致） */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Select label="学科" value={subject} options={OPTIONS.subjects} onChange={setSubject} />
              <Select label="年级" value={grade} options={OPTIONS.grades} onChange={setGrade} />
              <Select label="教材版本" value={version} options={OPTIONS.versions} onChange={setVersion} />
              <Select label="用途" value={purpose} options={OPTIONS.purposes} onChange={setPurpose} />
              <div className="col-span-2">
                <Select label="推文风格" value={style} options={OPTIONS.styles} onChange={setStyle} />
              </div>
            </div>

            {/* 错误提示 */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600"
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 开始处理按钮 */}
            <motion.button
              onClick={handleProcess}
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:bg-neutral-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {loading ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  AI 正在处理…
                </motion.span>
              ) : (
                "✨ 开始 AI 处理"
              )}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ===== 右栏：结果 ===== */}
        <motion.div
          className="flex flex-col rounded-xl border border-neutral-200 bg-white"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Tab 切换 */}
          <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3">
            <div className="flex gap-1">
              {[
                { key: "doc" as const, label: "📄 排版文档" },
                { key: "tweet" as const, label: "📣 推广推文" },
              ].map((t, i) => (
                <motion.button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    tab === t.key
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 + 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t.label}
                </motion.button>
              ))}
            </div>
            <AnimatePresence>
              {result && (
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <motion.button
                    onClick={handleCopy}
                    className="rounded-lg border border-neutral-200 px-3 py-1 text-[13px] hover:bg-neutral-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? "已复制 ✓" : "复制"}
                  </motion.button>
                  {tab === "doc" && (
                    <motion.button
                      onClick={handleDownload}
                      className="rounded-lg border border-neutral-200 px-3 py-1 text-[13px] hover:bg-neutral-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      导出 .md
                    </motion.button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 内容区 */}
          <div className="flex-1 overflow-y-auto p-5">
            <AnimatePresence mode="wait">
              {/* 空状态 */}
              {!result && !loading && (
                <motion.div
                  key="empty"
                  className="flex h-full flex-col items-center justify-center text-neutral-300"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-5xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    📄
                  </motion.div>
                  <p className="mt-3 text-sm">AI 处理结果会显示在这里</p>
                </motion.div>
              )}

              {/* 加载动画 */}
              {loading && (
                <motion.div
                  key="loading"
                  className="flex h-full flex-col items-center justify-center text-neutral-400"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className="text-4xl"
                    animate={{
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1.5, repeat: Infinity },
                    }}
                  >
                    ⏳
                  </motion.div>
                  <motion.p
                    className="mt-3 text-sm"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    AI 正在排版并撰写推文…
                  </motion.p>
                </motion.div>
              )}

              {/* 结果展示 */}
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* mock 提示（没配 API Key 时展示示例数据） */}
                  {result.mock && (
                    <motion.div
                      className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-[13px] text-amber-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      ⚠️ 当前为示例数据（AI 接口未配置或不可用）。配置
                      .env.local 中的 API Key 后即可生成真实结果。
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {tab === "doc" ? (
                      <motion.pre
                        key="doc"
                        className="whitespace-pre-wrap font-sans text-sm leading-relaxed"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {result.formatted}
                      </motion.pre>
                    ) : (
                      <motion.div
                        key="tweet"
                        className="whitespace-pre-wrap text-sm leading-relaxed"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        {result.tweet}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 核心要点（仅文档 Tab 显示） */}
                  {tab === "doc" && result.highlights?.length > 0 && (
                    <motion.div
                      className="mt-5 rounded-lg bg-neutral-50 p-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="mb-2 text-[13px] font-bold text-neutral-600">
                        🔑 核心要点（AI 提炼）
                      </div>
                      <ul className="space-y-1 text-sm text-neutral-600">
                        {result.highlights.map((h, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 + 0.4 }}
                          >
                            · {h}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// 小组件：带标签的下拉选择框
// ============================================================
function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <motion.label
      className="block"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <span className="mb-1 block text-[12px] text-neutral-400">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-neutral-400 transition-all focus:ring-2 focus:ring-emerald-500/20"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </motion.label>
  );
}
