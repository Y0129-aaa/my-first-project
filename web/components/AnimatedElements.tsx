"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

// ============================================================
// 动画组件集合
// ============================================================

/**
 * 渐入上浮容器
 */
export const FadeInUp = motion.div;

/**
 * 渐入缩放容器
 */
export const ScaleIn = motion.div;

/**
 * 侧边栏动画
 */
export const SlideIn = motion.div;

/**
 * 列表项动画
 */
export const ListItem = motion.div;

/**
 * 进度条动画
 */
export const AnimatedBar = motion.div;

/**
 * 数字动画
 */
export const AnimatedNumber = motion.span;

/**
 * 悬浮卡片效果
 */
export const HoverCard = motion.div;

/**
 * 脉冲圆环
 */
export const PulseRing = motion.div;

/**
 * 浮动动画
 */
export const Floating = motion.div;

// ============================================================
// 动画变体
// ============================================================

export const fadeInUpVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const staggerContainerVariant = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const scaleInVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export const slideInLeftVariant = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export const barFillVariant = {
  hidden: { width: 0 },
  visible: (custom: number) => ({
    width: `${custom}%`,
    transition: { duration: 0.8, ease: "easeOut", delay: 0.2 }
  })
};

// ============================================================
// 卡片悬浮效果组件
// ============================================================

interface HoverCardProps extends HTMLMotionProps<"div"> {
  hoverScale?: number;
  hoverShadow?: string;
}

export const InteractiveCard = forwardRef<HTMLDivElement, HoverCardProps>(
  ({ hoverScale = 1.02, hoverShadow = "0 12px 24px rgba(0,0,0,0.08)", children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{
          scale: hoverScale,
          boxShadow: hoverShadow,
          y: -2
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

InteractiveCard.displayName = "InteractiveCard";

// ============================================================
// 呼吸动画
// ============================================================

export const Breathing = motion.div;

// ============================================================
// 页面过渡
// ============================================================

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: "easeInOut" }
};
