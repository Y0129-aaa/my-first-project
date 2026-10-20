"use client"; // 客户端组件：有点击交互

import { motion } from "framer-motion";
import { SHOP_INFO, type ShopProduct } from "@/lib/shopProducts";

// ============================================================
// /shop 模块一：店铺首页
// ------------------------------------------------------------
// 店铺信息 + 商品卡片列表 + 我的购买记录
// 移动端优先：单列信息 + 双列商品网格
// ============================================================

export type Purchase = {
  product: ShopProduct;
  time: string; // 购买时间 HH:mm
};

type Props = {
  products: ShopProduct[];
  purchases: Purchase[];
  /** 点击「联系客服购买」→ 跳到 AI 客服并带入商品 */
  onContact: (product: ShopProduct) => void;
};

export default function ShopHome({ products, purchases, onContact }: Props) {
  return (
    <div className="flex-1 overflow-y-auto bg-neutral-50 pb-6">
      {/* ---------- 店铺头部 ---------- */}
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 px-4 pb-14 pt-6 text-white">
        <div className="flex items-center gap-3">
          {/* 店铺头像 */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl backdrop-blur-sm">
            {SHOP_INFO.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold">{SHOP_INFO.name}</h1>
            <p className="mt-0.5 text-[13px] text-white/85">{SHOP_INFO.slogan}</p>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/75">
              <span>⭐ 4.9 好评</span>
              <span>·</span>
              <span>已售 1.2w+</span>
            </div>
          </div>
        </div>

        {/* 店铺简介 */}
        <p className="mt-3 text-[12px] leading-relaxed text-white/85">
          {SHOP_INFO.intro}
        </p>

        {/* 服务标签 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SHOP_INFO.badges.map((b) => (
            <span
              key={b}
              className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] backdrop-blur-sm"
            >
              ✓ {b}
            </span>
          ))}
        </div>
      </div>

      {/* ---------- 商品列表 ---------- */}
      <div className="-mt-9 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-neutral-800">📚 精选资料</h2>
          <span className="text-[12px] text-neutral-400">共 {products.length} 件</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.map((p, i) => (
            <motion.div
              key={p.id}
              className="overflow-hidden rounded-xl bg-white shadow-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* 封面图 */}
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.cover}
                  alt={p.title}
                  className="h-28 w-full object-cover"
                />
                <span className="absolute left-1.5 top-1.5 rounded bg-black/55 px-1.5 py-0.5 text-[10px] text-white">
                  {p.grade} · {p.subject}
                </span>
              </div>

              {/* 信息区 */}
              <div className="p-2.5">
                <h3 className="line-clamp-2 min-h-[36px] text-[13px] font-medium leading-snug text-neutral-800">
                  {p.title}
                </h3>

                <div className="mt-1 flex flex-wrap gap-1">
                  {p.tags.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="rounded bg-violet-50 px-1 text-[10px] text-violet-600"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-2 flex items-end gap-1">
                  <span className="text-[15px] font-bold text-red-500">
                    ¥{p.price}
                  </span>
                  {p.originalPrice && (
                    <span className="text-[11px] text-neutral-400 line-through">
                      ¥{p.originalPrice}
                    </span>
                  )}
                </div>

                {/* 联系客服购买 */}
                <motion.button
                  onClick={() => onContact(p)}
                  className="mt-2 w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 py-1.5 text-[12px] font-medium text-white"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                >
                  联系客服购买
                </motion.button>

                <p className="mt-1.5 text-center text-[10px] text-neutral-400">
                  已售 {p.sales} · {p.pages}页
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ---------- 我的购买记录（已购资产） ---------- */}
      <div className="mt-6 px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-neutral-800">🗂️ 我的购买记录</h2>
          {purchases.length > 0 && (
            <span className="text-[12px] text-neutral-400">
              共 {purchases.length} 份
            </span>
          )}
        </div>

        {purchases.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 bg-white py-8 text-center">
            <p className="text-2xl">📭</p>
            <p className="mt-2 text-[13px] text-neutral-400">还没有购买记录</p>
            <p className="mt-1 text-[11px] text-neutral-300">
              点击商品卡片「联系客服购买」即可下单
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {purchases.map((pur, i) => (
              <motion.div
                key={pur.product.id}
                className="flex items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pur.product.cover}
                  alt={pur.product.title}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-neutral-800">
                    {pur.product.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-neutral-400">
                    购买时间 {pur.time} · 已发货
                  </p>
                </div>
                <motion.a
                  href={pur.product.fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 rounded-lg bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  下载/查看
                </motion.a>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ---------- 底部说明 ---------- */}
      <p className="mt-6 px-4 text-center text-[11px] leading-relaxed text-neutral-300">
        所有资料均为学霸原创整理 · 购买后永久有效
        <br />
        如有问题请联系 AI 客服或添加店主微信
      </p>
    </div>
  );
}
