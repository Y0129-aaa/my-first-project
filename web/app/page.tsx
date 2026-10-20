import WorkbenchLayout from "@/components/WorkbenchLayout";
import ServiceDesk from "@/components/ServiceDesk";

// ============================================================
// 卖家后台（B 端）首页
// ------------------------------------------------------------
// 根目录 / 现在只保留卖家视角：会话列表 + 聊天记录 + 接单通知 + 手动接管。
// 买家聊天室已独立到 /shop，两边彻底分离。
// ============================================================
export default function SellerDashboard() {
  return (
    <WorkbenchLayout>
      <ServiceDesk />
    </WorkbenchLayout>
  );
}
