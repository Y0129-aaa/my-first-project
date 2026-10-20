"use client";

import { motion } from "framer-motion";

// ============================================================
// AI 助理形象：小圆球
// ------------------------------------------------------------
// 用在两个地方：
//   1. 买家聊天页（ChatWindow）—— AI 助理"小笔记"的头像
//   2. 客服工作台（ServiceDesk）—— AI 消息的头像
// 纯 CSS 绘制：渐变圆球 + 高光 + 两只眼睛，无需图片资源
// ============================================================

export default function AiBall({
  size = 36,
  animated = true,
}: {
  size?: number; // 圆球直径（像素）
  animated?: boolean; // 是否启用动画
}) {
  // 眼睛大小随圆球尺寸等比缩放（最小 2px）
  const eye = Math.max(2, Math.round(size * 0.15));

  return (
    <motion.span
      className="relative inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-teal-400 to-cyan-500 shadow-md shadow-emerald-500/30 ring-1 ring-white/25"
      style={{ width: size, height: size }}
      role="img"
      aria-label="AI 助理"
      animate={
        animated
          ? {
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0],
            }
          : {}
      }
      transition={
        animated
          ? {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }
          : {}
      }
      whileHover={{
        scale: 1.1,
        rotate: 5,
        transition: { duration: 0.3 },
      }}
    >
      {/* 左上角高光，让球体更立体 */}
      <motion.span
        className="absolute rounded-full bg-white/70"
        style={{
          width: eye * 0.9,
          height: eye * 0.9,
          left: size * 0.2,
          top: size * 0.16,
        }}
        animate={
          animated
            ? {
                opacity: [0.7, 0.9, 0.7],
              }
            : {}
        }
        transition={
          animated
            ? {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : {}
        }
      />
      {/* 两只眼睛（居中略偏下） */}
      <span
        className="flex items-center"
        style={{ gap: eye * 1.2, marginTop: eye * 0.5 }}
      >
        <motion.span
          className="rounded-full bg-white"
          style={{ width: eye, height: eye }}
          animate={
            animated
              ? {
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={
            animated
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : {}
          }
        />
        <motion.span
          className="rounded-full bg-white"
          style={{ width: eye, height: eye }}
          animate={
            animated
              ? {
                  scale: [1, 1.1, 1],
                }
              : {}
          }
          transition={
            animated
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.2,
                }
              : {}
          }
        />
      </span>
    </motion.span>
  );
}
