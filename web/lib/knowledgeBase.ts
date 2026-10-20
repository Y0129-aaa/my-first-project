/**
 * ============================================================
 * 知识库模块（MVP 阶段：假数据）
 * ------------------------------------------------------------
 * 真实环境中，这些数据应该来自：
 *   1. 数据库（如 PostgreSQL / MongoDB）存文档元信息
 *   2. 向量检索（如 Milvus / pgvector）做语义匹配
 * MVP 阶段先用内存假数据跑通流程，接口保持不变，以后无缝替换
 * ============================================================
 */

// 一篇笔记文档的数据结构
export type Doc = {
  doc_id: string;        // 文档唯一 ID（发文件时只认这个，防止 AI 幻觉）
  title: string;         // 笔记标题
  subject: string;       // 学科，如：数学
  grade: string;         // 年级，如：高二
  version: string;       // 教材版本，如：人教A版
  purpose: string[];     // 适用用途标签，如：["期末", "导数"]
  price: number;         // 完整版价格（元）
  pages: number;         // 页数
  preview_url: string;   // 预览版 PDF 链接（AI 可以发给买家）
  full_url: string;      // 完整版 PDF 链接（只能由卖家发送，不暴露给 AI）
};

// -------------------- 假数据（3 篇测试笔记） --------------------
// PDF 文件请放到 web/public/files/ 目录下，链接才能生效
// 没有真实 PDF 也能跑：点击卡片会 404，但不影响聊天流程
export const KNOWLEDGE_BASE: Doc[] = [
  {
    doc_id: "SX-G2-RJ-A-004",
    title: "高二数学·导数专项冲刺笔记（期末版）",
    subject: "数学",
    grade: "高二",
    version: "人教A版",
    purpose: ["期末", "导数", "专项突破"],
    price: 19.9,
    pages: 28,
    preview_url: "/files/sx-gao2-daoshu-preview.pdf",
    full_url: "/files/sx-gao2-daoshu-full.pdf",
  },
  {
    doc_id: "YY-G1-RJ-001",
    title: "高一英语·必修一词汇语境记忆手册",
    subject: "英语",
    grade: "高一",
    version: "人教版",
    purpose: ["期中", "单词", "基础"],
    price: 12.9,
    pages: 36,
    preview_url: "/files/yy-gao1-bixiu1-preview.pdf",
    full_url: "/files/yy-gao1-bixiu1-full.pdf",
  },
  {
    doc_id: "WL-G3-RJ-012",
    title: "高三物理·电磁学一轮复习宝典",
    subject: "物理",
    grade: "高三",
    version: "人教版",
    purpose: ["一轮复习", "电磁学", "高考"],
    price: 29.9,
    pages: 52,
    preview_url: "/files/wl-gao3-dcixue-preview.pdf",
    full_url: "/files/wl-gao3-dcixue-full.pdf",
  },
];

// -------------------- 内部工具函数 --------------------

/**
 * 清洗学科名称
 * 模型可能传"高中数学"，数据库里存的是"数学"，统一去掉学段前缀再比
 */
function normalizeSubject(s: string): string {
  return (s || "").replace(/高中|初中|中学/g, "").trim();
}

/**
 * 清洗年级名称
 * 模型可能传"高中二年级""高二下""高三党"，统一归一成"高二""高三"这类写法
 */
function normalizeGrade(g: string): string {
  const raw = (g || "").trim();
  // 优先匹配"初二/初三/高二/高三"这类标准写法
  const short = raw.match(/[初高][一二三]/);
  if (short) return short[0];
  // 再匹配"初中二年级""高中三年级"这类写法
  const long = raw.match(/([初高])中?\s*([一二三])年级/);
  if (long) return `${long[1]}${long[2]}`;
  return raw;
}

// -------------------- 对外暴露的两个函数 --------------------

/**
 * 检索知识库
 * @param params 买家需求：学科 / 年级 / 教材版本 / 用途
 * @returns 匹配到的文档数组（按相关度排序）
 *
 * MVP 检索策略（够用就好）：
 *   1. 学科 + 年级必须匹配（硬条件）
 *   2. 版本一致加分，用途命中关键词加分，按分数排序
 * 以后升级：把这一步换成向量语义检索，匹配会更智能
 */
export function searchKnowledgeBase(params: {
  subject: string;
  grade: string;
  version?: string;
  purpose?: string;
}): Doc[] {
  const subject = normalizeSubject(params.subject);
  const grade = normalizeGrade(params.grade);
  const version = (params.version || "").trim();
  const purpose = (params.purpose || "").trim();

  // 第一步：硬条件过滤（学科 + 年级必须命中，年级已做归一化）
  const matched = KNOWLEDGE_BASE.filter(
    (d) => d.subject === subject && normalizeGrade(d.grade) === grade
  );
  if (matched.length === 0) return [];

  // 第二步：软条件打分排序
  const scored = matched.map((d) => {
    let score = 0;
    // 版本一致 +3 分（"unknown" 是买家没说版本时的占位符，不参与打分）
    if (version && version !== "unknown" && d.version.includes(version)) {
      score += 3;
    }
    // 用途命中一个关键词 +2 分
    if (purpose && d.purpose.some((p) => purpose.includes(p) || p.includes(purpose))) {
      score += 2;
    }
    return { doc: d, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.doc);
}

/**
 * 根据 doc_id 精确查找文档
 * 用于 send_preview 时校验：AI 只能发检索结果里真实存在的文档
 * 这是「防止幻觉发错文件」的关键防线！
 */
export function getDocById(doc_id: string): Doc | undefined {
  return KNOWLEDGE_BASE.find((d) => d.doc_id === doc_id);
}
