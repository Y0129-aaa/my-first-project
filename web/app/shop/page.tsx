"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ShopHome, { type Purchase } from "@/components/ShopHome";
import ShopChat, { type ChatSeed } from "@/components/ShopChat";
import {
  SHOP_PRODUCTS,
  SHOP_INFO,
  type ShopProduct,
} from "@/lib/shopProducts";
import { emitConversionSignal, nowHHMM } from "@/lib/conversionSignal";

// ============================================================
// /shop 买家微型店铺（C 端，移动端优先）
// ------------------------------------------------------------
// 两个主模块，底部 Tab 切换：
//   【店铺首页】店铺信息 + 商品卡片 + 我的购买记录
//   【AI 客服】聊天室（从商品卡片进来会自动带入咨询消息）
// ============================================================

type TabKey = "home" | "chat";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "home", label: "店铺首页", icon: "🏪" },
  { key: "chat", label: "AI 客服", icon: "💬" },
];

export default function ShopPage() {
  const [tab, setTab] = useState<TabKey>("home");
  const [seed, setSeed] = useState<ChatSeed | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  // ------------------------------------------------------------
  // 点击商品卡片的「联系客服购买」
  // ------------------------------------------------------------
  const handleContact = useCallback((product: ShopProduct) => {
    // 构造一条种子消息，切到客服 Tab 后由 ShopChat 自动发送
    setSeed({
      id: `seed-${product.id}-${Date.now()}`,
      product,
      message: `你好，我想买这份《${product.title}》`,
    });
    setTab("chat");

    // 同步提醒卖家端：有买家正在咨询商品
    emitConversionSignal({
      id: "contact-" + Date.now(),
      keyword: "联系客服购买",
      text: `买家咨询商品：${product.title}`,
      time: nowHHMM(),
    });
  }, []);

  // ------------------------------------------------------------
  // 买家确认付款 → 写入购买记录
  // ------------------------------------------------------------
  const handlePurchase = useCallback((product: ShopProduct) => {
    setPurchases((prev) =>
      prev.some((p) => p.product.id === product.id)
        ? prev // 已购买过就不重复添加
        : [...prev, { product, time: nowHHMM() }]
    );
  }, []);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col bg-neutral-50">
      {/* ---------- 内容区：两个模块都常驻挂载，用 hidden 切换，保留聊天状态 ---------- */}
      <div className="relative min-h-0 flex-1">
        <div className={tab === "home" ? "flex h-full flex-col" : "hidden"}>
          <ShopHome
            products={SHOP_PRODUCTS}
            purchases={purchases}
            onContact={handleContact}
          />
        </div>
        <div className={tab === "chat" ? "flex h-full flex-col" : "hidden"}>
          <ShopChat seed={seed} onPurchase={handlePurchase} />
        </div>
      </div>

      {/* ---------- 底部 Tab 导航栏 ---------- */}
      <nav className="shrink-0 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="flex">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <motion.button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="relative flex flex-1 flex-col items-center gap-0.5 py-2"
                whileTap={{ scale: 0.94 }}
              >
                <span className={`text-xl ${active ? "" : "opacity-45 grayscale"}`}>
                  {t.icon}
                </span>
                <span
                  className={`text-[11px] font-medium ${
                    active ? "text-violet-600" : "text-neutral-400"
                  }`}
                >
                  {t.label}
                </span>
                {/* 激活指示条 */}
                {active && (
                  <motion.span
                    layoutId="shop-tab-indicator"
                    className="absolute -top-px h-0.5 w-10 rounded-full bg-violet-600"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* ---------- 全局 Toast（购买成功提示） ---------- */}
      <PurchaseToast purchases={purchases} shopName={SHOP_INFO.name} />
    </div>
  );
}

// ============================================================
// 购买成功 Toast：监听购买记录变化，新增时弹一下
// ============================================================
function PurchaseToast({
  purchases,
  shopName,
}: {
  purchases: Purchase[];
  shopName: string;
}) {
  const [visible, setVisible] = useState(false);
  const lastCount = useRef(purchases.length);

  useEffect(() => {
    if (purchases.length > lastCount.current) {
      setVisible(true);
      const timer = window.setTimeout(() => setVisible(false), 2600);
      lastCount.current = purchases.length;
      return () => window.clearTimeout(timer);
    }
    lastCount.current = purchases.length;
  }, [purchases]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-black/85 px-5 py-3 text-center shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-2xl">🎉</p>
          <p className="mt-1 text-[13px] font-medium text-white">购买成功！</p>
          <p className="mt-0.5 text-[11px] text-white/75">
            {shopName} 正在为你准备无水印完整版
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
