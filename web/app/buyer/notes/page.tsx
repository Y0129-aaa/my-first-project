// ============================================================
// 买家笔记库 - 搜索 + 分类筛选
// ============================================================

"use client";

import Link from "next/link";
import { useState, useMemo } from "react";

// 模拟笔记数据（带图片）
const ALL_NOTES = [
  { id: 1, title: "高中数学 - 导数总结", subject: "数学", grade: "高三", views: 1234, price: 9.9, image: "https://picsum.photos/seed/math1/400/300" },
  { id: 2, title: "初中物理 - 力学笔记", subject: "物理", grade: "初三", views: 892, price: 7.9, image: "https://picsum.photos/seed/physics1/400/300" },
  { id: 3, title: "高中英语 - 语法大全", subject: "英语", grade: "高二", views: 2156, price: 12.9, image: "https://picsum.photos/seed/english1/400/300" },
  { id: 4, title: "初中化学 - 方程式汇总", subject: "化学", grade: "初三", views: 1567, price: 8.9, image: "https://picsum.photos/seed/chem1/400/300" },
  { id: 5, title: "高中语文 - 作文素材", subject: "语文", grade: "高三", views: 3421, price: 15.9, image: "https://picsum.photos/seed/chinese1/400/300" },
  { id: 6, title: "初中数学 - 几何证明", subject: "数学", grade: "初二", views: 1089, price: 9.9, image: "https://picsum.photos/seed/math2/400/300" },
  { id: 7, title: "高中物理 - 电磁学", subject: "物理", grade: "高三", views: 1876, price: 11.9, image: "https://picsum.photos/seed/physics2/400/300" },
  { id: 8, title: "初中英语 - 词汇手册", subject: "英语", grade: "初二", views: 2345, price: 8.9, image: "https://picsum.photos/seed/english2/400/300" },
];

const SUBJECTS = ["全部", "数学", "物理", "化学", "英语", "语文"];
const GRADES = ["全部", "初一", "初二", "初三", "高一", "高二", "高三"];

export default function BuyerNotes() {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("全部");
  const [grade, setGrade] = useState("全部");
  const [selectedNote, setSelectedNote] = useState<typeof ALL_NOTES[0] | null>(null);

  // 筛选笔记
  const filteredNotes = useMemo(() => {
    return ALL_NOTES.filter(note => {
      const matchSearch = note.title.toLowerCase().includes(search.toLowerCase());
      const matchSubject = subject === "全部" || note.subject === subject;
      const matchGrade = grade === "全部" || note.grade === grade;
      return matchSearch && matchSubject && matchGrade;
    });
  }, [search, subject, grade]);

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <header className="glass-effect border-b border-white/40 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/buyer" className="text-gray-600 hover:text-gray-900 text-lg">←</Link>
              <span className="text-2xl">📚</span>
              <h1 className="text-lg font-bold warm-gradient-text">笔记库</h1>
            </div>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">买家视角</span>
          </div>
        </header>

        <main className="flex-1 py-6 px-4">
          <div className="max-w-6xl mx-auto">
            {/* 搜索框 */}
            <div className="glass-effect rounded-2xl p-4 mb-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder=" 搜索笔记关键词..."
                className="w-full bg-white/70 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
              />
            </div>

            {/* 分类筛选 */}
            <div className="glass-effect rounded-2xl p-4 mb-6">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-700 mb-2 block">学科</span>
                <div className="flex flex-wrap gap-2">
                  {SUBJECTS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSubject(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        subject === tag
                          ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white"
                          : "bg-white/70 hover:bg-white text-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 block">年级</span>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setGrade(tag)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        grade === tag
                          ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                          : "bg-white/70 hover:bg-white text-gray-700"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 结果统计 */}
            <div className="mb-4 text-sm text-gray-600">
              找到 <span className="font-bold text-violet-600">{filteredNotes.length}</span> 个笔记
            </div>

            {/* 笔记网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredNotes.map((note) => (
                <div key={note.id} className="friendly-card rounded-2xl overflow-hidden">
                  <div className="relative h-40 overflow-hidden bg-gradient-to-br from-violet-200 to-pink-200">
                    <img src={note.image} alt={note.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                      <span className="text-emerald-600 font-bold text-sm">¥{note.price}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-1">{note.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-600 text-xs">{note.subject}</span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 text-xs">{note.grade}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>{note.views} 次浏览</span>
                      <button onClick={() => setSelectedNote(note)} className="text-violet-600 font-semibold hover:text-violet-700">预览 →</button>
                    </div>
                    <button className="w-full btn-warm rounded-lg py-2 text-sm font-semibold">立即购买</button>
                  </div>
                </div>
              ))}
            </div>

            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600">没有找到匹配的笔记</p>
                <button onClick={() => { setSearch(""); setSubject("全部"); setGrade("全部"); }} className="mt-4 text-violet-600 font-semibold">清除筛选</button>
              </div>
            )}
          </div>
        </main>

        {/* 预览弹窗 */}
        {selectedNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedNote(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="relative h-64 bg-gradient-to-br from-violet-200 to-pink-200">
                <img src={selectedNote.image} alt={selectedNote.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <button onClick={() => setSelectedNote(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-600 hover:bg-white">✕</button>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-3">{selectedNote.title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-600 text-sm">{selectedNote.subject}</span>
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-600 text-sm">{selectedNote.grade}</span>
                  <span className="text-gray-500 text-sm">{selectedNote.views} 次浏览</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <h3 className="font-semibold text-gray-700 mb-2">📖 内容预览</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• 核心知识点总结</p>
                    <p>• 典型例题解析</p>
                    <p>• 解题技巧归纳</p>
                    <p>• 常见错误分析</p>
                    <p className="text-violet-600 font-medium">... 购买后查看完整内容</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-emerald-600">¥{selectedNote.price}</span>
                  <button className="btn-warm rounded-xl px-6 py-3 font-semibold">立即购买</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
