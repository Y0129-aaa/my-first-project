import Link from "next/link";
import ShopChat from "@/components/ShopChat";

// ============================================================
// /shop 买家聊天页
// ------------------------------------------------------------
// 买家视角的店铺聊天窗口：
//   - 输入框上方一排快捷操作按钮（类似淘宝客服快捷回复）
//   - 手动输入仍然走大模型 /api/chat
// ============================================================
export default function ShopPage() {
  return (
    <div className="relative h-dvh bg-neutral-200">
      <Link
        href="/buyer"
        className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs text-neutral-600 shadow hover:bg-white"
      >
        返回买家首页 ›
      </Link>
      <ShopChat />
    </div>
  );
}
