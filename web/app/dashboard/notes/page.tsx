// ============================================================
// 卖家笔记管理 - 上传/下架/编辑
// ============================================================

"use client";

import Link from "next/link";
import { useState } from "react";

type Note = {
  id: number;
  title: string;
  subject: string;
  grade: string;
  price: number;
  status: "上架" | "下架";
  views: number;
  sales: number;
  createdAt: string;
};

const INITIAL_NOTES: Note[] = [
  { id: 1, title: "高中数学 - 导数总结", subject: "数学", grade: "高三", price: 9.9, status: "上架", views: 1234, sales: 56, createdAt: "2024-10-15" },
  { id: 2, title: "初中物理 - 力学笔记", subject: "物理", grade: "初三", price: 7.9, status: "上架", views: 892, sales: 34, createdAt: "2024-10-12" },
  { id: 3, title: "高中英语 - 语法大全", subject: "英语", grade: "高二", price: 12.9, status: "下架", views: 2156, sales: 89, createdAt: "2024-09-20" },
];

export default function SellerNotes() {
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [showUpload, setShowUpload] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    subject: "数学",
    grade: "高三",
    price: "",
    content: "",
  });

  // 切换上下架
  const toggleStatus = (id: number) => {
    setNotes(notes.map(note => {
      if (note.id === id) {
        return { ...note, status: note.status === "上架" ? "下架" : "上架" };
      }
      return note;
    }));
  };

  // 删除笔记
  const deleteNote = (id: number) => {
    if (confirm("确定要删除这条笔记吗？")) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  // 上传笔记
  const uploadNote = () => {
    if (!newNote.title || !newNote.price || !newNote.content) {
      alert("请填写完整信息");
      return;
    }

    const note: Note = {
      id: Date.now(),
      title: newNote.title,
      subject: newNote.subject,
      grade: newNote.grade,
      price: parseFloat(newNote.price),
      status: "上架",
      views: 0,
      sales: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setNotes([note, ...notes]);
    setNewNote({ title: "", subject: "数学", grade: "高三", price: "", content: "" });
    setShowUpload(false);
    alert("上传成功！");
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <header className="glass-effect border-b border-white/40 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 text-lg">←</Link>
              <span className="text-2xl">📚</span>
              <h1 className="text-lg font-bold warm-gradient-text">笔记管理</h1>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="btn-warm rounded-lg px-4 py-2 text-sm font-semibold"
            >
              {showUpload ? "取消" : "+ 上传笔记"}
            </button>
          </div>
        </header>

        <main className="flex-1 py-6 px-4">
          <div className="max-w-6xl mx-auto">
            {/* 上传表单 */}
            {showUpload && (
              <div className="friendly-card rounded-2xl p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">上传新笔记</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
                    <input
                      type="text"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      placeholder="例：高中数学 - 导数总结"
                      className="w-full bg-white/70 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">学科</label>
                      <select
                        value={newNote.subject}
                        onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                        className="w-full bg-white/70 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                      >
                        <option>数学</option>
                        <option>物理</option>
                        <option>化学</option>
                        <option>英语</option>
                        <option>语文</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">年级</label>
                      <select
                        value={newNote.grade}
                        onChange={(e) => setNewNote({ ...newNote, grade: e.target.value })}
                        className="w-full bg-white/70 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                      >
                        <option>初一</option>
                        <option>初二</option>
                        <option>初三</option>
                        <option>高一</option>
                        <option>高二</option>
                        <option>高三</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">价格（元）</label>
                    <input
                      type="number"
                      value={newNote.price}
                      onChange={(e) => setNewNote({ ...newNote, price: e.target.value })}
                      placeholder="9.9"
                      step="0.1"
                      className="w-full bg-white/70 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                    <textarea
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      placeholder="请输入笔记内容..."
                      rows={6}
                      className="w-full bg-white/70 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-300 resize-none"
                    />
                  </div>
                  <button
                    onClick={uploadNote}
                    className="w-full btn-warm rounded-xl py-3 font-semibold"
                  >
                    确认上传
                  </button>
                </div>
              </div>
            )}

            {/* 统计信息 */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="friendly-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-violet-600">{notes.length}</div>
                <div className="text-sm text-gray-600 mt-1">总笔记数</div>
              </div>
              <div className="friendly-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{notes.filter(n => n.status === "上架").length}</div>
                <div className="text-sm text-gray-600 mt-1">上架中</div>
              </div>
              <div className="friendly-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-bold text-gray-600">{notes.filter(n => n.status === "下架").length}</div>
                <div className="text-sm text-gray-600 mt-1">已下架</div>
              </div>
            </div>

            {/* 笔记列表 */}
            <div className="friendly-card rounded-2xl p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">我的笔记</h2>
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white/50 rounded-xl p-4 hover:bg-white/70 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{note.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-600">{note.subject}</span>
                          <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-600">{note.grade}</span>
                          <span>¥{note.price}</span>
                          <span>·</span>
                          <span>{note.createdAt}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        note.status === "上架"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {note.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span>👁 {note.views} 次浏览</span>
                      <span>💰 {note.sales} 次销售</span>
                      <span>💵 收入 ¥{(note.price * note.sales).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(note.id)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          note.status === "上架"
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {note.status === "上架" ? "下架" : "上架"}
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="flex-1 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
