"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// ============================================================
// 首页 - 温暖的入口页面
// 分离买家和卖家入口
// ============================================================

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 动态背景 */}
      <div className="animated-gradient-bg fixed inset-0 opacity-20" />

      {/* 浮动装饰元素 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-br from-violet-400/20 to-pink-400/20 blur-3xl"
            style={{
              width: `${Math.random() * 300 + 200}px`,
              height: `${Math.random() * 300 + 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 主内容 */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        {/* Logo 和标题 */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mb-6 inline-block"
            animate={{
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="text-7xl mb-4">🎓</div>
          </motion.div>
          <h1 className="text-5xl font-bold warm-gradient-text mb-4">
            AI学习工作台
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            让学习更智能，让交易更简单 ✨
          </p>
          <p className="text-base text-gray-500 mt-2">
            AI 驱动的笔记管理与智能客服平台
          </p>
        </motion.div>

        {/* 入口卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          {/* 买家入口 */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/buyer" className="block h-full">
              <div className="friendly-card rounded-3xl p-8 h-full group cursor-pointer">
                {/* 图标 */}
                <motion.div
                  className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 text-white shadow-lg shadow-sky-500/30"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-4xl">🛍️</span>
                </motion.div>

                {/* 标题 */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:warm-gradient-text transition-all">
                  买家入口
                </h2>

                {/* 描述 */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  浏览优质笔记，享受智能客服服务，轻松购买学习资料
                </p>

                {/* 特性列表 */}
                <ul className="space-y-3 mb-6">
                  {[
                    { icon: "📚", text: "浏览精品笔记" },
                    { icon: "💬", text: "AI 智能客服" },
                    { icon: "🛒", text: "便捷购买流程" },
                    { icon: "📖", text: "查看知识图谱" },
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-3 text-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* 按钮 */}
                <div className="flex items-center justify-between">
                  <span className="text-sky-600 font-semibold group-hover:text-sky-700 transition-colors">
                    进入买家视角 →
                  </span>
                  <motion.div
                    className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-sky-600 text-xl">→</span>
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* 卖家入口 */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link href="/dashboard" className="block h-full">
              <div className="friendly-card rounded-3xl p-8 h-full group cursor-pointer">
                {/* 图标 */}
                <motion.div
                  className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-4xl">💼</span>
                </motion.div>

                {/* 标题 */}
                <h2 className="text-2xl font-bold text-gray-800 mb-3 group-hover:warm-gradient-text transition-all">
                  卖家工作台
                </h2>

                {/* 描述 */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  强大的 AI 工具套件，高效管理笔记和客服，提升业务效率
                </p>

                {/* 特性列表 */}
                <ul className="space-y-3 mb-6">
                  {[
                    { icon: "📊", text: "数据仪表盘" },
                    { icon: "🤖", text: "AI 自动客服" },
                    { icon: "✍️", text: "智能笔记排版" },
                    { icon: "📣", text: "推文自动生成" },
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-3 text-gray-700"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.text}</span>
                    </motion.li>
                  ))}
                </ul>

                {/* 按钮 */}
                <div className="flex items-center justify-between">
                  <span className="text-violet-600 font-semibold group-hover:text-violet-700 transition-colors">
                    进入工作台 →
                  </span>
                  <motion.div
                    className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center group-hover:bg-violet-200 transition-colors"
                    whileHover={{ scale: 1.1 }}
                  >
                    <span className="text-violet-600 text-xl">→</span>
                  </motion.div>
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* 底部信息 */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="glass-effect rounded-2xl px-8 py-6 inline-block">
            <p className="text-gray-600 mb-3">
              🎯 为卖家提供智能工具，为买家提供优质服务
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                系统运行正常
              </span>
              <span>🔒 数据安全</span>
              <span>⚡ 响应迅速</span>
            </div>
          </div>
        </motion.div>

        {/* 特色功能展示 */}
        <motion.div
          className="mt-12 grid grid-cols-3 gap-6 max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {[
            { icon: "🧠", title: "AI 驱动", desc: "智能处理" },
            { icon: "⚡", title: "高效便捷", desc: "一键操作" },
            { icon: "🎨", title: "精美设计", desc: "优质体验" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="text-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="font-semibold text-gray-700">{item.title}</div>
              <div className="text-sm text-gray-500">{item.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
