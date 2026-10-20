/**
 * ============================================================
 * /shop 买家端商品数据
 * ------------------------------------------------------------
 * MVP 阶段用假数据，接口形状与真实商品一致，
 * 以后接数据库 / 对象存储只要保证字段不变即可。
 * ============================================================
 */

export type ShopProduct = {
  id: string;
  title: string;        // 商品标题
  subject: string;      // 科目
  grade: string;        // 年级
  cover: string;        // 封面图
  price: number;        // 价格（元）
  originalPrice?: number; // 划线价（营销用）
  pages: number;        // 页数
  sales: number;        // 已售份数
  tags: string[];       // 卖点标签
  previewUrl: string;   // 带水印预览版（买家可看）
  fullUrl: string;      // 完整版（付款后由客服通过微信发送）
};

// 店铺信息
export const SHOP_INFO = {
  name: "学霸笔记铺",
  slogan: "专注初高中提分资料",
  avatar: "📚",
  intro: "清北复交学霸手写整理，覆盖语数英物化生，已帮 12000+ 同学提分。",
  badges: ["官方认证", "24h 自动发货", "不满意包更新"],
};

// 商品列表
export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "p-english-chu2",
    title: "初二英语重点复习笔记",
    subject: "英语",
    grade: "初二",
    cover: "/covers/english.svg",
    price: 19.9,
    originalPrice: 39.9,
    pages: 36,
    sales: 326,
    tags: ["语法全梳理", "高频词汇"],
    previewUrl: "/files/yy-gao1-bixiu1-preview.pdf",
    fullUrl: "/files/yy-gao1-bixiu1-full.pdf",
  },
  {
    id: "p-math-gao2",
    title: "高二数学·导数专项冲刺笔记",
    subject: "数学",
    grade: "高二",
    cover: "/covers/math.svg",
    price: 19.9,
    originalPrice: 39.9,
    pages: 28,
    sales: 512,
    tags: ["期末提分", "题型大全"],
    previewUrl: "/files/sx-gao2-daoshu-preview.pdf",
    fullUrl: "/files/sx-gao2-daoshu-full.pdf",
  },
  {
    id: "p-physics-gao3",
    title: "高三物理·电磁学一轮复习宝典",
    subject: "物理",
    grade: "高三",
    cover: "/covers/physics.svg",
    price: 29.9,
    originalPrice: 59.9,
    pages: 52,
    sales: 288,
    tags: ["高考冲刺", "真题拆解"],
    previewUrl: "/files/wl-gao3-dcixue-preview.pdf",
    fullUrl: "/files/wl-gao3-dcixue-full.pdf",
  },
  {
    id: "p-chemistry-chu3",
    title: "初三化学·方程式汇总速记",
    subject: "化学",
    grade: "初三",
    cover: "/covers/chemistry.svg",
    price: 16.9,
    originalPrice: 29.9,
    pages: 40,
    sales: 197,
    tags: ["中考必背", "速记卡"],
    previewUrl: "/files/sx-gao2-daoshu-preview.pdf",
    fullUrl: "/files/sx-gao2-daoshu-full.pdf",
  },
  {
    id: "p-chinese-gao1",
    title: "高一语文·文言文实词虚词手册",
    subject: "语文",
    grade: "高一",
    cover: "/covers/chinese.svg",
    price: 12.9,
    originalPrice: 25.9,
    pages: 22,
    sales: 164,
    tags: ["古文提分", "实词虚词"],
    previewUrl: "/files/yy-gao1-bixiu1-preview.pdf",
    fullUrl: "/files/yy-gao1-bixiu1-full.pdf",
  },
  {
    id: "p-biology-gao3",
    title: "高三生物·遗传专题难点突破",
    subject: "生物",
    grade: "高三",
    cover: "/covers/biology.svg",
    price: 22.9,
    originalPrice: 45.9,
    pages: 45,
    sales: 131,
    tags: ["二轮复习", "遗传专题"],
    previewUrl: "/files/wl-gao3-dcixue-preview.pdf",
    fullUrl: "/files/wl-gao3-dcixue-full.pdf",
  },
];

/** 根据 id 找商品 */
export function getProductById(id: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.id === id);
}
