import WorkbenchLayout from "@/components/WorkbenchLayout";
import ServiceDesk from "@/components/ServiceDesk";

// ============================================================
// 页面三：AI 客服工作台（核心展示页）
// 左边：买家与 AI 的聊天记录
// 右边：接单通知 + 手动介入回复输入框
// ============================================================
export default function ServicePage() {
  return (
    <WorkbenchLayout>
      <ServiceDesk />
    </WorkbenchLayout>
  );
}
