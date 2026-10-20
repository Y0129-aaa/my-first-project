"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { currentUser } from "@/lib/mockData";

// ============================================================
// 卖家工作台公共框架（B 端）：左侧导航 + 顶部标题栏 + 内容区
// 控制台、笔记处理、AI 客服工作台等页面共用
// 说明：买家聊天室已独立到 /shop，导航里不再出现买家相关入口
// ============================================================

// 导航项配置（badge 是右上角红色未读数，core 标记核心页面）
const NAV: {
  href: string;
  label: string;
  icon: string;
  badge?: number;
  core?: boolean;
}[] = [
  { href: "/dashboard", label: "控制台", icon: "🏠" },
  { href: "/service", label: "AI 客服工作台", icon: "💬", badge: 2, core: true },
  { href: "/notes", label: "笔记处理", icon: "📝" },
  { href: "/library", label: "笔记库", icon: "📚" },
  { href: "/posts", label: "推文工厂", icon: "📣" },
  { href: "/graph", label: "知识图谱", icon: "🧠" },
];

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 当前页标题：用最长匹配的菜单项，匹配不到就显示默认值
  const current =
    NAV.filter((item) => pathname.startsWith(item.href)).sort(
      (a, b) => b.href.length - a.href.length
    )[0] ?? NAV[0];

  return (
    <div className="flex h-dvh flex-col bg-neutral-100 text-neutral-800">
      {/* ---------- 顶部标题栏 ---------- */}
      <header className="flex shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-5 py-2.5">
        <div className="flex items-center gap-3">
          <span className="text-lg">💼</span>
          <span className="text-sm font-bold">{current.label}</span>
          <span className="text-[11px] text-neutral-400">卖家工作台</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[12px] font-medium text-green-600">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            AI 自动接待中
          </span>
          <span className="text-[12px] text-neutral-400">
            {currentUser.shopName}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* ---------- 左侧导航栏 ---------- */}
        <motion.aside
          className="flex w-56 shrink-0 flex-col border-r border-neutral-200 bg-white"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Logo 区 */}
          <motion.div
            className="flex items-center gap-2 border-b border-neutral-100 px-4 py-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              📚
            </motion.span>
            <div>
              <div className="text-sm font-bold">AI 笔记工作台</div>
              <div className="text-[11px] text-neutral-400">MVP v0.1</div>
            </div>
          </motion.div>

          {/* 菜单 */}
          <nav className="flex-1 space-y-1 p-2">
            {NAV.map((item, i) => {
              // 当前路径以菜单链接开头 → 高亮（选中态）
              const active = pathname.startsWith(item.href);
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 + 0.3 }}
                >
                  <Link
                    href={item.href}
                    className={`nav-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                      active
                        ? "bg-neutral-900 text-white"
                        : "text-neutral-600 hover:bg-neutral-100"
                    }`}
                  >
                    <motion.span
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {item.icon}
                    </motion.span>
                    <span className="flex-1">{item.label}</span>
                    {/* 核心标记 */}
                    {item.core && (
                      <motion.span
                        className={`rounded px-1 text-[10px] ${
                          active
                            ? "bg-white/20 text-white"
                            : "bg-amber-100 text-amber-700"
                        }`}
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        核心
                      </motion.span>
                    )}
                    {/* 未读红色角标 */}
                    {item.badge ? (
                      <motion.span
                        className="rounded-full bg-red-500 px-1.5 text-[11px] leading-4 text-white"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {item.badge}
                      </motion.span>
                    ) : null}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* 底部：当前用户信息 */}
          <motion.div
            className="flex items-center gap-2 border-t border-neutral-100 p-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.span
              className="text-2xl"
              whileHover={{ scale: 1.2, rotate: 5 }}
            >
              {currentUser.avatar}
            </motion.span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">
                {currentUser.nickname}的店铺
              </div>
              <div className="truncate text-[11px] text-neutral-400">
                {currentUser.shopName}
              </div>
            </div>
          </motion.div>
        </motion.aside>

        {/* ---------- 右侧主内容区 ---------- */}
        <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
