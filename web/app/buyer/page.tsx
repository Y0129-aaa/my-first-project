// ============================================================
// 买家首页 - 完全独立版本
// 买家只能看到：笔记、知识图谱、客服、推文、付款
// 不能看到卖家数据（订单、收益等）
// ============================================================

"use client";

import Link from "next/link";

export default function BuyerHome() {
  return (
    <div className="relative min-h-screen">
      {/* 动态渐变背景 */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />

      {/* 波浪背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 w-full h-48 opacity-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#a78bfa" />
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" fill="#ec4899" opacity="0.5" />
        </svg>
      </div>

      {/* 浮动装饰 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-violet-300/20 blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-48 h-48 rounded-full bg-pink-300/20 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-40 left-1/4 w-40 h-40 rounded-full bg-sky-300/20 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 right-1/3 w-36 h-36 rounded-full bg-emerald-300/20 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      </div>

      {/* 主内容 */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <header className="glass-effect border-b border-white/40 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-wave inline-block">🎓</span>
              <div>
                <h1 className="text-lg font-bold warm-gradient-text">AI学习工作台</h1>
                <p className="text-xs text-gray-500">买家专属</p>
              </div>
            </div>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              买家视角
            </span>
          </div>
        </header>

        {/* 主要内容 */}
        <main className="flex-1 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            {/* 欢迎区域 */}
            <div className="text-center mb-10">
              <div className="text-6xl mb-4 inline-block animate-bounce-custom"></div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
                欢迎来到 <span className="warm-gradient-text">AI学习工作台</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                发现优质笔记，享受智能服务，让学习更高效
              </p>
            </div>

            {/* 功能卡片网格 - 买家专属功能 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* 笔记库 */}
              <Link href="/buyer/notes" className="block group">
                <div className="friendly-card rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">📚</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">笔记库</h3>
                      <p className="text-gray-600 text-sm mb-3">浏览精选学习笔记，涵盖各学科</p>
                      <div className="flex items-center gap-2 text-sky-600 text-sm font-semibold">
                        <span>浏览笔记</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* 知识图谱 - 买家专属 */}
              <Link href="/buyer/graph" className="block group">
                <div className="friendly-card rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">🧠</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">知识图谱</h3>
                      <p className="text-gray-600 text-sm mb-3">可视化知识网络，发现知识关联</p>
                      <div className="flex items-center gap-2 text-violet-600 text-sm font-semibold">
                        <span>探索图谱</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* AI 客服 */}
              <Link href="/buyer/chat" className="block group">
                <div className="friendly-card rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">💬</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">AI 客服</h3>
                      <p className="text-gray-600 text-sm mb-3">7x24小时在线，随时解答疑问</p>
                      <div className="flex items-center gap-2 text-pink-600 text-sm font-semibold">
                        <span>立即咨询</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* 评价 */}
              <Link href="/buyer/posts" className="block group">
                <div className="friendly-card rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">📝</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">评价</h3>
                      <p className="text-gray-600 text-sm mb-3">查看用户评价和使用心得</p>
                      <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold">
                        <span>浏览评价</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* 付款中心 */}
              <Link href="/buyer/payment" className="block group">
                <div className="friendly-card rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">💳</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">付款中心</h3>
                      <p className="text-gray-600 text-sm mb-3">安全便捷的支付体验</p>
                      <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                        <span>去付款</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>

              {/* 我的订单 */}
              <Link href="/buyer/orders" className="block group">
                <div className="friendly-card rounded-2xl p-6 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">📋</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-2">我的订单</h3>
                      <p className="text-gray-600 text-sm mb-3">查看已购买的笔记</p>
                      <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold">
                        <span>查看订单</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* 为什么选择我们 */}
            <div className="glass-effect rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">🌟 为什么选择我们</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center group cursor-pointer">
                  <div className="text-4xl mb-2 group-hover:scale-125 transition-transform inline-block">✨</div>
                  <div className="font-semibold text-gray-700">优质内容</div>
                  <div className="text-xs text-gray-500">精选笔记</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-4xl mb-2 group-hover:scale-125 transition-transform inline-block"></div>
                  <div className="font-semibold text-gray-700">快速响应</div>
                  <div className="text-xs text-gray-500">AI秒回</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-4xl mb-2 group-hover:scale-125 transition-transform inline-block">💎</div>
                  <div className="font-semibold text-gray-700">专业服务</div>
                  <div className="text-xs text-gray-500">品质保障</div>
                </div>
              </div>
            </div>

            {/* 二维码区域 */}
            <div className="glass-effect rounded-2xl p-6 text-center">
              <h3 className="text-base font-bold text-gray-800 mb-3">📱 分享给朋友</h3>
              <p className="text-sm text-gray-600 mb-3">扫码即可进入买家页面</p>
              <Link href="/buyer-qrcode.png" target="_blank">
                <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200">
                  查看二维码图片 →
                </button>
              </Link>
            </div>
          </div>
        </main>

        {/* 底部 */}
        <footer className="glass-effect border-t border-white/40 py-4">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-gray-600 text-sm mb-2">
              💝 用心服务每一位买家 · AI 技术驱动 · 品质保证
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>🔒 安全支付</span>
              <span> 即时交付</span>
              <span>🎯 精准匹配</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
