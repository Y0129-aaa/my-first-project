import Link from "next/link";
import ChatWindow from "@/components/ChatWindow";

// ============================================================
// 买家视角演示页
// 就是原来的聊天页：用于演示/测试买家端的真实对话体验
// （控制台导航里的「买家视角演示」指向这里）
// ============================================================
export default function DemoPage() {
  return (
    <div className="relative h-dvh bg-neutral-200">
      {/* 返回工作台的悬浮按钮 */}
      <Link
        href="/dashboard"
        className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-xs text-neutral-600 shadow hover:bg-white"
      >
        返回工作台 ›
      </Link>
      <ChatWindow />
    </div>
  );
}
