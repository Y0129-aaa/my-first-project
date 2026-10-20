import type { Metadata } from "next";
import "./globals.css";

// 网站元信息
export const metadata: Metadata = {
  title: "AI学习工作台 - 让学习更智能",
  description: "AI驱动的笔记管理与智能客服工作台，为卖家提供高效工具，为买家提供优质服务",
  keywords: ["AI", "笔记", "学习", "智能客服", "教育科技"],
};

// 根布局
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-gradient-to-br from-violet-50 via-pink-50 to-sky-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}
