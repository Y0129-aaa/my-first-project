// ============================================================
// 买家付款中心 - 模拟支付
// ============================================================

"use client";

import Link from "next/link";
import { useState } from "react";

type PaymentStatus = "idle" | "processing" | "success" | "failed";

export default function BuyerPayment() {
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [amount, setAmount] = useState<string>("9.9");

  // 模拟支付流程
  const handlePay = () => {
    if (!selectedMethod) {
      alert("请选择支付方式");
      return;
    }

    setStatus("processing");

    // 模拟支付过程
    setTimeout(() => {
      // 90% 概率成功，10% 概率失败（模拟）
      const success = Math.random() > 0.1;
      setStatus(success ? "success" : "failed");
    }, 2000);
  };

  // 重置
  const reset = () => {
    setStatus("idle");
    setSelectedMethod("");
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-violet-100 via-pink-50 to-sky-100" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部导航 */}
        <header className="glass-effect border-b border-white/40 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/buyer" className="text-gray-600 hover:text-gray-900 text-lg">←</Link>
              <span className="text-2xl">💳</span>
              <h1 className="text-lg font-bold warm-gradient-text">付款中心</h1>
            </div>
            <span className="text-sm text-gray-500 bg-white/50 px-3 py-1 rounded-full">买家视角</span>
          </div>
        </header>

        <main className="flex-1 py-8 px-4">
          <div className="max-w-2xl mx-auto">
            {/* 支付中 */}
            {status === "processing" && (
              <div className="friendly-card rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4 animate-spin">⏳</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">支付处理中...</h2>
                <p className="text-gray-600">请稍候，正在完成支付</p>
              </div>
            )}

            {/* 支付成功 */}
            {status === "success" && (
              <div className="friendly-card rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4 animate-bounce">✅</div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">支付成功！</h2>
                <p className="text-gray-600 mb-4">您的订单已支付完成</p>
                <div className="bg-green-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-1">支付金额</div>
                  <div className="text-3xl font-bold text-green-600">¥{amount}</div>
                </div>
                <div className="space-y-3">
                  <Link href="/buyer/orders">
                    <button className="w-full btn-warm rounded-xl py-3 font-semibold">
                      查看订单
                    </button>
                  </Link>
                  <button
                    onClick={reset}
                    className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
                  >
                    继续购买
                  </button>
                </div>
              </div>
            )}

            {/* 支付失败 */}
            {status === "failed" && (
              <div className="friendly-card rounded-2xl p-8 text-center">
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">支付失败</h2>
                <p className="text-gray-600 mb-4">请稍后重试或更换支付方式</p>
                <button
                  onClick={reset}
                  className="w-full btn-warm rounded-xl py-3 font-semibold"
                >
                  重新支付
                </button>
              </div>
            )}

            {/* 正常支付界面 */}
            {status === "idle" && (
              <>
                {/* 订单信息 */}
                <div className="friendly-card rounded-2xl p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">订单信息</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-gray-600">商品名称</span>
                      <span className="font-semibold text-gray-800">高中数学 - 导数总结</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <span className="text-gray-600">数量</span>
                      <span className="font-semibold text-gray-800">1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">支付金额</span>
                      <span className="text-2xl font-bold text-emerald-600">¥{amount}</span>
                    </div>
                  </div>
                </div>

                {/* 选择支付方式 */}
                <div className="friendly-card rounded-2xl p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">选择支付方式</h2>
                  <div className="space-y-3">
                    {[
                      { name: "微信支付", icon: "💚", desc: "推荐使用" },
                      { name: "支付宝", icon: "🔵", desc: "快速支付" },
                      { name: "银行卡", icon: "💳", desc: "安全便捷" },
                    ].map((method) => (
                      <button
                        key={method.name}
                        onClick={() => setSelectedMethod(method.name)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all border-2 ${
                          selectedMethod === method.name
                            ? "border-violet-500 bg-violet-50"
                            : "border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-3xl">{method.icon}</span>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-gray-800">{method.name}</div>
                          <div className="text-xs text-gray-500">{method.desc}</div>
                        </div>
                        {selectedMethod === method.name && (
                          <span className="text-violet-600 text-xl">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 支付按钮 */}
                <button
                  onClick={handlePay}
                  disabled={!selectedMethod}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    selectedMethod
                      ? "btn-warm shadow-lg hover:shadow-xl"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  立即支付 ¥{amount}
                </button>

                {/* 安全提示 */}
                <div className="glass-effect rounded-2xl p-4 text-center mt-6">
                  <div className="text-2xl mb-2">🔒</div>
                  <p className="text-sm text-gray-600">安全支付保障</p>
                  <p className="text-xs text-gray-500 mt-1">所有交易均加密处理，请放心支付</p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
