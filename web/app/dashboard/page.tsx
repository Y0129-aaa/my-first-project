"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import WorkbenchLayout from "@/components/WorkbenchLayout";
import {
  currentUser,
  dashboardStats,
  recentOrders,
  conversionFunnel,
  earningsTrend,
  resolutionStats,
  subjectDistribution,
} from "@/lib/mockData";

// ============================================================
// 动画变体
// ============================================================
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 }
  }
};

// ============================================================
// 增强版 Dashboard：数据概览 + 转化漏斗 + 收益趋势 + 学科分布
// ============================================================
export default function DashboardPage() {
  const statusColor: Record<string, string> = {
    待发货: "bg-red-50 text-red-600",
    已发货: "bg-green-50 text-green-600",
    售后中: "bg-amber-50 text-amber-600",
  };

  const maxFunnel = conversionFunnel.stages[0].value;
  const maxEarnings = Math.max(...earningsTrend.map((d) => d.amount));

  return (
    <WorkbenchLayout>
      <div className="h-full overflow-y-auto p-6">
        {/* 欢迎语 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl font-bold">下午好，{currentUser.nickname} 👋</h1>
          <p className="mt-1 text-sm text-neutral-500">
            今天已有 {dashboardStats.todayInquiries} 位买家进线，AI 正在自动接待，你有 {dashboardStats.pendingOrders} 笔订单待发货。
          </p>
        </motion.div>

        {/* 核心指标卡片 */}
        <motion.div
          className="mt-5 grid grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: "今日进线", value: dashboardStats.todayInquiries, icon: "💬", trend: "+12%", color: "from-emerald-500 to-teal-500" },
            { label: "AI 解决率", value: dashboardStats.aiResolveRate, icon: "🤖", trend: "+5%", color: "from-violet-500 to-purple-500" },
            { label: "待发货", value: dashboardStats.pendingOrders, icon: "📦", trend: "需处理", color: "from-amber-500 to-orange-500" },
            { label: "本周收益", value: `¥${dashboardStats.weekEarnings}`, icon: "", trend: "+23%", color: "from-rose-500 to-pink-500" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="rounded-xl border border-neutral-200 bg-white p-5 card-hover cursor-pointer"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <motion.span
                  className="text-2xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {stat.icon}
                </motion.span>
                <motion.span
                  className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  {stat.trend}
                </motion.span>
              </div>
              <motion.p
                className="mt-3 text-2xl font-bold text-neutral-900"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                {stat.value}
              </motion.p>
              <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* 快捷操作 */}
        <motion.div
          className="mt-5 grid grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Link href="/dashboard/notes">
            <motion.div
              className="rounded-xl border border-neutral-200 bg-white p-4 card-hover cursor-pointer"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-3xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  📚
                </motion.span>
                <div>
                  <p className="text-sm font-bold text-neutral-900">笔记管理</p>
                  <p className="text-xs text-neutral-500">上传/下架笔记</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/note-processor">
            <motion.div
              className="rounded-xl border border-neutral-200 bg-white p-4 card-hover cursor-pointer"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-3xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  📝
                </motion.span>
                <div>
                  <p className="text-sm font-bold text-neutral-900">AI 笔记处理</p>
                  <p className="text-xs text-neutral-500">智能生成笔记</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/service">
            <motion.div
              className="rounded-xl border border-neutral-200 bg-white p-4 card-hover cursor-pointer"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-3xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  💬
                </motion.span>
                <div>
                  <p className="text-sm font-bold text-neutral-900">客服管理</p>
                  <p className="text-xs text-neutral-500">查看对话记录</p>
                </div>
              </div>
            </motion.div>
          </Link>

          <Link href="/graph">
            <motion.div
              className="rounded-xl border border-neutral-200 bg-white p-4 card-hover cursor-pointer"
              variants={fadeInUp}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-3xl"
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  🧠
                </motion.span>
                <div>
                  <p className="text-sm font-bold text-neutral-900">知识图谱</p>
                  <p className="text-xs text-neutral-500">可视化知识网络</p>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* 第二行：漏斗 + 收益趋势 */}
        <motion.div
          className="mt-5 grid grid-cols-2 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* 转化漏斗 */}
          <motion.div
            className="rounded-xl border border-neutral-200 bg-white p-5 card-hover"
            variants={fadeInUp}
          >
            <h3 className="text-sm font-bold text-neutral-900"> 转化漏斗（近 7 天）</h3>
            <div className="mt-4 space-y-3">
              {conversionFunnel.stages.map((stage, i) => (
                <motion.div
                  key={stage.label}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <span className="w-16 text-[12px] text-neutral-500">{stage.label}</span>
                  <div className="flex-1">
                    <div className="h-6 overflow-hidden rounded-full bg-neutral-100">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: stage.color,
                          minWidth: "24px",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.value / maxFunnel) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.3, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <motion.span
                    className="w-10 text-right text-[12px] font-medium text-neutral-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                  >
                    {stage.value}
                  </motion.span>
                  {i < conversionFunnel.stages.length - 1 && (
                    <span className="w-14 text-right text-[10px] text-neutral-400">
                      {((conversionFunnel.stages[i + 1].value / stage.value) * 100).toFixed(0)}%
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span className="text-[12px] text-neutral-500">整体转化率</span>
              <motion.span
                className="text-sm font-bold text-emerald-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: "spring" }}
              >
                {((conversionFunnel.stages[conversionFunnel.stages.length - 1].value / conversionFunnel.stages[0].value) * 100).toFixed(1)}%
              </motion.span>
            </motion.div>
          </motion.div>

          {/* 收益趋势 */}
          <motion.div
            className="rounded-xl border border-neutral-200 bg-white p-5 card-hover"
            variants={fadeInUp}
          >
            <h3 className="text-sm font-bold text-neutral-900">📈 近 7 天收益</h3>
            <div className="mt-4 flex items-end justify-between gap-2" style={{ height: "140px" }}>
              {earningsTrend.map((day, i) => (
                <motion.div
                  key={day.day}
                  className="flex flex-1 flex-col items-center gap-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 + 0.3 }}
                >
                  <motion.span
                    className="text-[10px] text-neutral-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 + 0.5 }}
                  >
                    ¥{day.amount}
                  </motion.span>
                  <motion.div
                    className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 transition-all cursor-pointer"
                    style={{ minHeight: "8px" }}
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.amount / maxEarnings) * 100}px` }}
                    transition={{ duration: 0.6, delay: i * 0.08 + 0.3, ease: "easeOut" }}
                    whileHover={{ scale: 1.05 }}
                  />
                  <span className="text-[10px] text-neutral-500">{day.day}</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="mt-3 flex items-center justify-between border-t border-neutral-100 pt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <span className="text-[12px] text-neutral-500">本周总计</span>
              <motion.span
                className="text-sm font-bold text-emerald-600"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.2, type: "spring" }}
              >
                ¥{earningsTrend.reduce((sum, d) => sum + d.amount, 0).toFixed(1)}
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 第三行：AI 效率 + 学科分布 */}
        <motion.div
          className="mt-4 grid grid-cols-2 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* AI 效率指标 */}
          <motion.div
            className="rounded-xl border border-neutral-200 bg-white p-5 card-hover"
            variants={fadeInUp}
          >
            <h3 className="text-sm font-bold text-neutral-900">🤖 AI 效率</h3>
            <div className="mt-4 space-y-4">
              {/* AI vs 人工环形图（CSS 实现） */}
              <div className="flex items-center gap-6">
                <motion.div
                  className="relative h-24 w-24"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.8, type: "spring" }}
                >
                  <svg viewBox="0 0 36 36" className="h-24 w-24 -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="4"
                    />
                    <motion.path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${resolutionStats.aiResolved}, 100` }}
                      transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                      className="text-lg font-bold text-neutral-900"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1, type: "spring" }}
                    >
                      {resolutionStats.aiResolved}%
                    </motion.span>
                    <span className="text-[10px] text-neutral-500">AI 解决</span>
                  </div>
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="h-2.5 w-2.5 rounded-full bg-emerald-500"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                    />
                    <span className="text-[12px] text-neutral-600">AI 独立解决 {resolutionStats.aiResolved}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="h-2.5 w-2.5 rounded-full bg-neutral-200"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: "spring" }}
                    />
                    <span className="text-[12px] text-neutral-600">转人工 {resolutionStats.humanEscalated}%</span>
                  </div>
                  <div className="mt-2 text-[11px] text-neutral-400">
                    平均响应 <span className="font-medium text-neutral-600">{resolutionStats.avgResponseTime}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    平均转化 <span className="font-medium text-neutral-600">{resolutionStats.avgConversionTime}</span>
                  </div>
                </motion.div>
              </div>
              {/* 满意度 */}
              <motion.div
                className="border-t border-neutral-100 pt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-500">买家满意度</span>
                  <span className="text-sm font-bold text-emerald-600">{resolutionStats.satisfied}%</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-100">
                  <motion.div
                    className="h-full rounded-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${resolutionStats.satisfied}%` }}
                    transition={{ duration: 1, delay: 1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 学科分布 */}
          <motion.div
            className="rounded-xl border border-neutral-200 bg-white p-5 card-hover"
            variants={fadeInUp}
          >
            <h3 className="text-sm font-bold text-neutral-900">📚 热门学科</h3>
            <div className="mt-4 space-y-3">
              {subjectDistribution.map((item, i) => (
                <motion.div
                  key={item.subject}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                >
                  <motion.div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.4, type: "spring" }}
                  />
                  <span className="w-10 text-[12px] text-neutral-600">{item.subject}</span>
                  <div className="flex-1">
                    <div className="h-5 overflow-hidden rounded-full bg-neutral-100">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: item.color,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percent}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 + 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <motion.span
                    className="w-16 text-right text-[11px] text-neutral-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 + 0.7 }}
                  >
                    {item.count}单 · {item.percent}%
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* 最近订单 */}
        <motion.div
          className="mt-5 rounded-xl border border-neutral-200 bg-white p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">📋 最近订单</h3>
            <Link href="/service" className="text-[12px] text-emerald-600 hover:text-emerald-700 transition-colors">
              查看全部 →
            </Link>
          </div>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-[12px] text-neutral-400">
                <th className="pb-2 text-left font-medium">订单号</th>
                <th className="pb-2 text-left font-medium">笔记</th>
                <th className="pb-2 text-left font-medium">买家</th>
                <th className="pb-2 text-right font-medium">金额</th>
                <th className="pb-2 text-center font-medium">状态</th>
                <th className="pb-2 text-right font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, i) => (
                <motion.tr
                  key={order.id}
                  className="border-b border-neutral-50 last:border-0 table-row-hover"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.9 }}
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                >
                  <td className="py-2.5 text-[12px] font-mono text-neutral-500">{order.id}</td>
                  <td className="py-2.5">{order.title}</td>
                  <td className="py-2.5 text-neutral-600">{order.buyer}</td>
                  <td className="py-2.5 text-right font-medium">¥{order.amount}</td>
                  <td className="py-2.5 text-center">
                    <motion.span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColor[order.status]}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 + 1, type: "spring" }}
                    >
                      {order.status}
                    </motion.span>
                  </td>
                  <td className="py-2.5 text-right text-[12px] text-neutral-400">{order.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* 快捷入口 */}
        <motion.div
          className="mt-5 grid grid-cols-3 gap-4 pb-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            { href: "/notes", label: "上传笔记", icon: "📝", desc: "AI 自动排版 + 打标签" },
            { href: "/service", label: "AI 客服工作台", icon: "💬", desc: "2 个会话进行中", badge: true },
            { href: "/graph", label: "知识图谱", icon: "🧠", desc: "可视化知识网络" },
          ].map((item, i) => (
            <motion.div
              key={item.href}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                href={item.href}
                className="group rounded-xl border border-neutral-200 bg-white p-5 transition-all hover:border-emerald-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    className="text-2xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item.icon}
                  </motion.span>
                  <div>
                    <div className="text-sm font-bold text-neutral-900">{item.label}</div>
                    <div className="text-[12px] text-neutral-400">{item.desc}</div>
                  </div>
                  {item.badge && (
                    <motion.span
                      className="ml-auto rounded-full bg-red-500 px-1.5 text-[11px] leading-4 text-white"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      2
                    </motion.span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </WorkbenchLayout>
  );
}
