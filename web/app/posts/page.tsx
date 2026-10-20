"use client";

import { useState } from "react";
import WorkbenchLayout from "@/components/WorkbenchLayout";
import { noteLibrary } from "@/lib/mockData";

// ============================================================
// 推文工厂页
// 选择笔记 → 选择平台 → AI 生成多平台文案
// ============================================================

const PLATFORMS = [
  { id: "xiaohongshu", name: "小红书", icon: "", desc: "种草笔记 · emoji 标题 · 话题标签", color: "from-red-500 to-pink-500" },
  { id: "zhihu", name: "知乎", icon: "💡", desc: "深度长文 · 专业分析 · 经验分享", color: "from-blue-500 to-cyan-500" },
  { id: "wechat", name: "公众号", icon: "💬", desc: "深度文章 · 小标题分段 · 400-600 字", color: "from-green-500 to-emerald-500" },
  { id: "weibo", name: "微博", icon: "", desc: "热点短打 · 140 字以内 · 话题引流", color: "from-amber-500 to-orange-500" },
];

// 各平台文案风格模板
const STYLE_TEMPLATES: Record<string, (title: string, subject: string, grade: string) => string> = {
  xiaohongshu: (title, subject, grade) =>
    `姐妹们！整理了一份超详细的${subject}笔记 📚\n\n"${title}"\n\n适合${grade}的同学收藏！\n\n✅ 核心知识点全收录\n✅ 考试重点标注\n✅ 经典例题 + 详细解析\n✅ 易错点提醒\n\n考前突击完全来得及！需要的宝子评论区扣 1～\n\n#${subject} #${grade} #笔记分享 #学霸笔记 #提分技巧 #期末复习`,
  zhihu: (title, subject, grade) =>
    `## 作为${grade}学生，如何高效学习${subject}？\n\n我整理了这份笔记：《${title}》\n\n### 核心内容\n- 重点知识梳理，覆盖考试范围 90%+\n- 典型例题解析，举一反三\n- 易错点总结，避开丢分陷阱\n\n### 适用人群\n${grade}学生，${subject}基础薄弱或想冲刺高分的同学\n\n### 使用方法\n1. 先通读一遍，建立知识框架\n2. 对照课本标记不熟悉的知识点\n3. 重点刷例题，总结解题套路\n\n希望能帮到正在备考的同学！有问题评论区问我～`,
  wechat: (title, subject, grade) =>
    `【学霸笔记】${subject}核心知识点总结\n\n今天给大家分享一份精心整理的笔记：《${title}》\n\n📌 适合人群：${grade}学生\n📌 内容涵盖：核心概念 + 例题解析 + 易错点\n📌 使用方法：配合课本复习使用\n\n### 为什么需要这份笔记？\n\n${subject}是${grade}阶段最重要的学科之一。很多同学上课听懂了，但一做题就懵，问题往往出在：\n\n1. 知识点没有系统化，东一榔头西一棒子\n2. 题型见得不够多，考试遇到变式就慌\n3. 易错点没有总结，反复在同一个地方丢分\n\n这份笔记帮你把以上三个问题一次解决。\n\n完整版已上架，需要的同学可以私信我获取。`,
  weibo: (title, subject, grade) =>
    `🔥${grade}${subject}期末冲刺！《${title}》学霸笔记来啦！核心公式+例题解析+易错点全覆盖，需要的同学转评赞走一波～ #${subject} #期末复习 #学霸笔记`,
};

const TRENDING_TAGS = [
  { tag: "#高考复习", heat: 9800, trend: "up" },
  { tag: "#笔记分享", heat: 8500, trend: "up" },
  { tag: "#学霸笔记", heat: 7200, trend: "stable" },
  { tag: "#高中数学", heat: 6800, trend: "up" },
  { tag: "#提分技巧", heat: 5500, trend: "up" },
  { tag: "#期末复习", heat: 5200, trend: "down" },
  { tag: "#知识总结", heat: 4800, trend: "stable" },
  { tag: "#学习方法", heat: 4500, trend: "up" },
];

export default function PostsPage() {
  const [selectedNoteId, setSelectedNoteId] = useState(noteLibrary[0].id);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["xiaohongshu"]);
  const [generatedPosts, setGeneratedPosts] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const selectedNote = noteLibrary.find((n) => n.id === selectedNoteId) ?? noteLibrary[0];

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (selectedPlatforms.length === 0) return;
    setIsGenerating(true);

    // 模拟 AI 生成
    setTimeout(() => {
      const posts: Record<string, string> = {};
      selectedPlatforms.forEach((platformId) => {
        const template = STYLE_TEMPLATES[platformId];
        if (template) {
          posts[platformId] = template(selectedNote.title, selectedNote.subject, selectedNote.grade);
        }
      });
      setGeneratedPosts(posts);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = async (platformId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPlatform(platformId);
      setTimeout(() => setCopiedPlatform(null), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <WorkbenchLayout>
      <div className="flex h-full flex-col">
        {/* 顶部 */}
        <div className="border-b border-neutral-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold">📣 推文工厂</h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            选择笔记 → 选择平台 → AI 一键生成多平台推广文案
          </p>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* 左栏：配置区 */}
          <div className="w-80 shrink-0 space-y-4 overflow-y-auto border-r border-neutral-200 bg-white p-5">
            {/* 选择笔记 */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-neutral-400">选择要推广的笔记</label>
              <select
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-neutral-400"
              >
                {noteLibrary
                  .filter((n) => n.status === "已上架")
                  .map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.title}
                    </option>
                  ))}
              </select>
              <div className="mt-2 rounded-lg bg-neutral-50 p-3">
                <p className="text-[12px] font-medium text-neutral-700">{selectedNote.title}</p>
                <div className="mt-1 flex gap-1.5">
                  <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-600">
                    {selectedNote.subject}
                  </span>
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] text-blue-600">
                    {selectedNote.grade}
                  </span>
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
                    {selectedNote.pages}页
                  </span>
                </div>
              </div>
            </div>

            {/* 选择平台 */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-neutral-400">选择发布平台（可多选）</label>
              <div className="space-y-2">
                {PLATFORMS.map((p) => {
                  const selected = selectedPlatforms.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`w-full rounded-lg border p-3 text-left transition-all ${
                        selected
                          ? "border-emerald-300 bg-emerald-50"
                          : "border-neutral-200 bg-white hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.icon}</span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-neutral-900">{p.name}</div>
                          <div className="text-[11px] text-neutral-400">{p.desc}</div>
                        </div>
                        <div
                          className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            selected
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-neutral-300"
                          }`}
                        >
                          {selected && (
                            <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || selectedPlatforms.length === 0}
              className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:bg-neutral-300"
            >
              {isGenerating ? "AI 正在生成…" : `✨ 生成 ${selectedPlatforms.length} 个平台文案`}
            </button>

            {/* 热门话题 */}
            <div>
              <label className="mb-2 block text-[12px] font-medium text-neutral-400">🔥 热门话题</label>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_TAGS.map((t) => (
                  <span
                    key={t.tag}
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      t.trend === "up"
                        ? "bg-red-50 text-red-600"
                        : t.trend === "down"
                        ? "bg-neutral-100 text-neutral-500"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {t.tag} {t.trend === "up" ? "📈" : t.trend === "down" ? "" : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 右栏：生成结果 */}
          <div className="flex-1 overflow-y-auto bg-neutral-50 p-5">
            {Object.keys(generatedPosts).length === 0 && !isGenerating && (
              <div className="flex h-full flex-col items-center justify-center text-neutral-300">
                <div className="text-5xl">📣</div>
                <p className="mt-3 text-sm">选择笔记和平台后，AI 生成的文案会显示在这里</p>
              </div>
            )}

            {isGenerating && (
              <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                <div className="text-4xl">⏳</div>
                <p className="mt-3 animate-pulse text-sm">AI 正在按各平台风格生成文案…</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {Object.entries(generatedPosts).map(([platformId, content]) => {
                const platform = PLATFORMS.find((p) => p.id === platformId);
                return (
                  <div key={platformId} className="rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{platform?.icon}</span>
                        <span className="text-sm font-bold text-neutral-900">{platform?.name}风格</span>
                      </div>
                      <button
                        onClick={() => handleCopy(platformId, content)}
                        className="rounded-md border border-neutral-200 px-3 py-1 text-[12px] text-neutral-500 hover:bg-neutral-50"
                      >
                        {copiedPlatform === platformId ? "已复制 ✓" : "复制"}
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap p-4 font-sans text-sm leading-relaxed text-neutral-700">
                      {content}
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </WorkbenchLayout>
  );
}
