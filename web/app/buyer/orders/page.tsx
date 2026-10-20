// ============================================================
// 买家订单页面 - 独立页面
// ============================================================

"use client";

import Link from "next/link";

const ORDERS = [
  { id: "ORD001", title: "高中数学 - 导数总结", price: 9.9, status: "已完成", date: "2024-10-18" },
  { id: "ORD002", title: "初中物理 - 力学笔记", price: 7.9, status: "已完成", date: "2024-10-15" },
  { id: "ORD003", title: "高中英语 - 语法大全", price: 12.9, status: "进行中", date: "2024-10-20" },
];

export default function BuyerOrders() {
  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="glass-effect border-b border-white/40 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/buyer" className="text-gray-600 hover:text-gray-900">←</Link>
              <span className="text-2xl"></span>
              <h1 className="text-lg font-bold warm-gradient-text">我的订单</h1>
            </div>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">买家视角</span>
          </div>
        </header>

        <main className="flex-1 py-6 px-4">
          <div className="max-w-4xl mx-auto space-y-4">
            {ORDERS.map((order) => (
              <div key={order.id} className="friendly-card rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{order.id}</div>
                    <h3 className="text-lg font-bold text-gray-800">{order.title}</h3>
                  </div>
                  <span className="text-emerald-600 font-bold">¥{order.price}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{order.date}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      order.status === "已完成"
                        ? "bg-green-100 text-green-600"
                        : "bg-amber-100 text-amber-600"
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <button className="text-sm text-violet-600 font-semibold hover:text-violet-700">
                    查看详情 →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
