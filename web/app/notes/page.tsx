import WorkbenchLayout from "@/components/WorkbenchLayout";
import NoteProcessor from "@/components/NoteProcessor";

// ============================================================
// 页面二：笔记处理页
// 上传图片或输入文字 → 调用 AI 接口 → 生成排版文档 / 推文
// ============================================================
export default function NotesPage() {
  return (
    <WorkbenchLayout>
      <NoteProcessor />
    </WorkbenchLayout>
  );
}
