"use client";

import { useState } from "react";
import WorkbenchLayout from "@/components/WorkbenchLayout";
import { noteLibrary, type NoteStatus, OPTIONS } from "@/lib/mockData";

// ============================================================
// 笔记库管理页
// 列表/网格视图 · 多维筛选 · 状态管理
// ============================================================
export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filterSubject, setFilterSubject] = useState("全部");
  const [filterStatus, setFilterStatus] = useState("全部");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState(noteLibrary);

  const statusColors: Record<NoteStatus, string> = {
    草稿: "bg-neutral-100 text-neutral-500",
    已排版: "bg-blue-50 text-blue-600",
    已上架: "bg-emerald-50 text-emerald-600",
    已下架: "bg-red-50 text-red-500",
  };

  const statusFlow: NoteStatus[] = ["草稿", "已排版", "已上架", "已下架"];

  // 筛选逻辑
  const filtered = notes.filter((n) => {
    if (filterSubject !== "全部" && n.subject !== filterSubject) return false;
    if (filterStatus !== "全部" && n.status !== filterStatus) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleStatusChange = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const idx = statusFlow.indexOf(n.status);
        const next = statusFlow[(idx + 1) % statusFlow.length];
        return { ...n, status: next };
      })
    );
  };

  const counts = {
    全部: notes.length,
    草稿: notes.filter((n) => n.status === "草稿").length,
    已排版: notes.filter((n) => n.status === "已排版").length,
    已上架: notes.filter((n) => n.status === "已上架").length,
    已下架: notes.filter((n) => n.status === "已下架").length,
  };

  return (
    <WorkbenchLayout>
      <div className="flex h-full flex-col">
        {/* 顶部栏 */}
        <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold">📚 笔记库</h2>
            <p className="mt-0.5 text-sm text-neutral-500">共 {notes.length} 篇笔记 · 管理你的笔记资产</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-neutral-200 p-0.5">
              {(["list", "grid"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-md px-3 py-1 text-sm ${
                    viewMode === mode
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {mode === "list" ? "列表" : "网格"}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="搜索笔记标题..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 rounded-lg border border-neutral-200 px-3 py-1.5 text-sm outline-none focus:border-neutral-400"
            />
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="flex items-center gap-4 border-b border-neutral-100 bg-white px-6 py-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-neutral-400">学科：</span>
            {["全部", ...OPTIONS.subjects].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSubject(s)}
                className={`rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
                  filterSubject === s
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="h-5 w-px bg-neutral-200" />
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-neutral-400">状态：</span>
            {(["全部", "草稿", "已排版", "已上架", "已下架"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-md px-2 py-1 text-[12px] font-medium transition-colors ${
                  filterStatus === s
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                }`}
              >
                {s}
                {counts[s as keyof typeof counts] !== undefined && (
                  <span className="ml-1 text-[10px] opacity-60">({counts[s as keyof typeof counts]})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto bg-neutral-50 p-6">
          {filtered.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center text-neutral-300">
              <div className="text-4xl">📭</div>
              <p className="mt-2 text-sm">没有找到匹配的笔记</p>
            </div>
          )}

          {viewMode === "list" ? (
            /* 列表视图 */
            <div className="rounded-xl border border-neutral-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 text-[12px] text-neutral-400">
                    <th className="px-5 py-2.5 text-left font-medium">标题</th>
                    <th className="py-2.5 text-left font-medium">学科</th>
                    <th className="py-2.5 text-left font-medium">年级</th>
                    <th className="py-2.5 text-left font-medium">版本</th>
                    <th className="py-2.5 text-center font-medium">页数</th>
                    <th className="py-2.5 text-center font-medium">售价</th>
                    <th className="py-2.5 text-center font-medium">销量</th>
                    <th className="py-2.5 text-center font-medium">状态</th>
                    <th className="px-5 py-2.5 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((note) => (
                    <tr key={note.id} className="border-t border-neutral-50 transition-colors hover:bg-neutral-50">
                      <td className="px-5 py-3 font-medium text-neutral-900">{note.title}</td>
                      <td className="py-3">
                        <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[11px] text-violet-600">
                          {note.subject}
                        </span>
                      </td>
                      <td className="py-3 text-neutral-600">{note.grade}</td>
                      <td className="py-3 text-neutral-500">{note.version}</td>
                      <td className="py-3 text-center text-neutral-600">{note.pages}</td>
                      <td className="py-3 text-center font-medium">¥{note.price}</td>
                      <td className="py-3 text-center text-neutral-600">{note.sales}</td>
                      <td className="py-3 text-center">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColors[note.status]}`}>
                          {note.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleStatusChange(note.id)}
                          className="rounded-md border border-neutral-200 px-2.5 py-1 text-[12px] text-neutral-500 hover:bg-neutral-50"
                        >
                          流转状态 →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* 网格视图 */
            <div className="grid grid-cols-3 gap-4">
              {filtered.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-neutral-900 line-clamp-2">{note.title}</h4>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[11px] text-violet-600">
                          {note.subject}
                        </span>
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] text-blue-600">
                          {note.grade}
                        </span>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColors[note.status]}`}>
                      {note.status}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <div className="text-[12px] text-neutral-400">
                      {note.pages}页 · {note.version}
                    </div>
                    <div className="text-sm font-bold text-neutral-900">¥{note.price}</div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-400">销量 {note.sales}</span>
                    <span className="text-[11px] text-neutral-400">{note.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkbenchLayout>
  );
}
