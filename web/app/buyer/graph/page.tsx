// ============================================================
// 买家知识图谱 - 独立页面
// ============================================================

"use client";

import Link from "next/link";
import { useState } from "react";

// 模拟知识图谱数据
const GRAPH_NODES = [
  { id: 1, label: "数学", x: 200, y: 200, size: 60, color: "#3b82f6" },
  { id: 2, label: "代数", x: 100, y: 100, size: 40, color: "#8b5cf6" },
  { id: 3, label: "几何", x: 300, y: 100, size: 40, color: "#8b5cf6" },
  { id: 4, label: "导数", x: 80, y: 50, size: 30, color: "#ec4899" },
  { id: 5, label: "函数", x: 150, y: 30, size: 30, color: "#ec4899" },
  { id: 6, label: "三角形", x: 280, y: 50, size: 30, color: "#ec4899" },
  { id: 7, label: "圆", x: 350, y: 80, size: 30, color: "#ec4899" },
];

const GRAPH_EDGES = [
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 2, to: 5 },
  { from: 3, to: 6 },
  { from: 3, to: 7 },
];

export default function BuyerGraph() {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen">
      {/* 背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <header className="glass-effect border-b border-white/40 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/buyer" className="text-gray-600 hover:text-gray-900 text-lg">←</Link>
              <span className="text-2xl">🧠</span>
              <h1 className="text-lg font-bold warm-gradient-text">知识图谱</h1>
            </div>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">买家视角</span>
          </div>
        </header>

        {/* 内容区 */}
        <main className="flex-1 py-6 px-4">
          <div className="max-w-6xl mx-auto">
            {/* 图谱可视化 */}
            <div className="glass-effect rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📊 知识网络</h2>
              <div className="relative bg-white/50 rounded-xl overflow-hidden" style={{ height: "400px" }}>
                <svg width="100%" height="100%" viewBox="0 0 500 300">
                  {/* 连线 */}
                  {GRAPH_EDGES.map((edge, i) => {
                    const from = GRAPH_NODES.find(n => n.id === edge.from);
                    const to = GRAPH_NODES.find(n => n.id === edge.to);
                    if (!from || !to) return null;
                    return (
                      <line
                        key={i}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        stroke="#a78bfa"
                        strokeWidth="2"
                        opacity="0.4"
                      />
                    );
                  })}
                  {/* 节点 */}
                  {GRAPH_NODES.map((node) => (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNode(node.id)}
                      className="cursor-pointer"
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.size / 2}
                        fill={node.color}
                        opacity={selectedNode === node.id ? 1 : 0.7}
                        className="transition-all hover:opacity-100"
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        {node.label}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* 相关笔记 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "导数总结", subject: "数学", price: 9.9 },
                { title: "函数专题", subject: "数学", price: 12.9 },
                { title: "几何证明", subject: "数学", price: 8.9 },
              ].map((note, i) => (
                <div key={i} className="friendly-card rounded-2xl p-4">
                  <h3 className="font-bold text-gray-800 mb-2">{note.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{note.subject}</span>
                    <span className="text-emerald-600 font-bold">¥{note.price}</span>
                  </div>
                  <button className="w-full mt-3 btn-warm rounded-lg py-2 text-sm font-semibold">
                    查看详情
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
