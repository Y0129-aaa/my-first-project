/**
 * ============================================================
 * 演示用假数据（Mock Data）
 * ------------------------------------------------------------
 * 控制台和客服工作台的数据源。
 * 真实环境中这些数据来自数据库，MVP 阶段用假数据先把界面和交互跑通。
 * ============================================================
 */

// ---------- 当前登录用户（学生卖家） ----------
export const currentUser = {
  nickname: "瑞子",
  shopName: "瑞子的笔记小铺",
  avatar: "🧑‍🎓",
  tagline: "大二 · 经管院 · 学霸笔记供给商",
  verified: true, // 是否通过平台认证
  level: "Pro 卖家",
};

// ---------- 控制台概览数据 ----------
export const dashboardStats = {
  todayInquiries: 23, // 今日进线买家
  aiResolveRate: "78%", // AI 独立解决率
  pendingOrders: 2, // 待发货订单
  weekEarnings: 356.5, // 本周收益（元）
};

// ---------- 最近订单 ----------
export type Order = {
  id: string;
  title: string;
  buyer: string;
  amount: number;
  status: "待发货" | "已发货" | "售后中";
  time: string;
};

export const recentOrders: Order[] = [
  {
    id: "NO20261018-01",
    title: "高二数学·导数专项冲刺笔记",
    buyer: "考研的松鼠",
    amount: 16.9,
    status: "待发货",
    time: "14:32",
  },
  {
    id: "NO20261018-02",
    title: "高一英语·必修一词汇语境记忆手册",
    buyer: "橘子海",
    amount: 12.9,
    status: "待发货",
    time: "13:05",
  },
  {
    id: "NO20261017-08",
    title: "高三物理·电磁学一轮复习宝典",
    buyer: "芋泥波波",
    amount: 29.9,
    status: "已发货",
    time: "昨天 21:14",
  },
  {
    id: "NO20261016-05",
    title: "高二数学·导数专项冲刺笔记",
    buyer: "早八睡不醒",
    amount: 19.9,
    status: "售后中",
    time: "昨天 10:26",
  },
];

// ---------- 客服会话 ----------
export type ChatMessage = {
  id: string;
  // buyer=买家 ai=AI助理 seller=卖家（人工介入） system=系统提示
  from: "buyer" | "ai" | "seller" | "system";
  text: string;
  time: string;
  // 消息里附带的 PDF 卡片（AI 发的预览版）
  pdf?: { title: string; url: string };
};

export type Conversation = {
  id: string;
  buyerName: string;
  buyerAvatar: string;
  source: string; // 买家来源渠道
  status: "ai" | "human"; // ai=AI 接待中 human=人工接管中
  unread: number; // 未读数
  lastTime: string;
  messages: ChatMessage[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    buyerName: "考研的松鼠",
    buyerAvatar: "🐿️",
    source: "小红书",
    status: "ai",
    unread: 2,
    lastTime: "14:32",
    messages: [
      { id: "m1", from: "buyer", text: "在吗？刷到你们小红书发的数学笔记", time: "14:20" },
      {
        id: "m2",
        from: "ai",
        text: "在的呀～欢迎光临！我是店铺助理小笔记📚 看到你来啦，是想找数学方面的复习资料吗？",
        time: "14:20",
      },
      { id: "m3", from: "buyer", text: "对，我数学特别差，快期末了", time: "14:21" },
      {
        id: "m4",
        from: "ai",
        text: "别慌，期末前突击完全来得及！先问一句，你是哪个年级的呀？",
        time: "14:21",
      },
      { id: "m5", from: "buyer", text: "高二，人教A版，下周考导数那块", time: "14:22" },
      {
        id: "m6",
        from: "ai",
        text: "找到啦！给你发预览版看看👇 这是《高二数学·导数专项冲刺笔记》的前3页 + 完整目录，先看看排版和内容合不合你胃口～",
        time: "14:22",
        pdf: {
          title: "高二数学·导数专项冲刺笔记（预览版）",
          url: "/files/sx-gao2-daoshu-preview.pdf",
        },
      },
      { id: "m7", from: "buyer", text: "看着不错，多少钱？能便宜点吗", time: "14:32" },
    ],
  },
  {
    id: "c2",
    buyerName: "早八睡不醒",
    buyerAvatar: "😴",
    source: "知乎",
    status: "human",
    unread: 1,
    lastTime: "13:58",
    messages: [
      { id: "m1", from: "buyer", text: "昨天买的数学笔记里面第 12 页有处错误！", time: "13:50" },
      {
        id: "m2",
        from: "ai",
        text: "非常抱歉给您带来不好的体验！我马上处理～",
        time: "13:51",
      },
      {
        id: "m3",
        from: "system",
        text: "买家情绪激动，AI 已触发转人工规则",
        time: "13:52",
      },
      {
        id: "m4",
        from: "ai",
        text: "抱歉，这个问题我帮您转接人工客服，请稍等。",
        time: "13:52",
      },
    ],
  },
  {
    id: "c3",
    buyerName: "橘子海",
    buyerAvatar: "🍊",
    source: "小红书",
    status: "ai",
    unread: 0,
    lastTime: "12:41",
    messages: [
      { id: "m1", from: "buyer", text: "高一英语必修一的词汇手册还有吗", time: "12:30" },
      {
        id: "m2",
        from: "ai",
        text: "有的！给你发预览版👇 先看看内容合不合你心意～",
        time: "12:31",
        pdf: {
          title: "高一英语·必修一词汇语境记忆手册（预览版）",
          url: "/files/yy-gao1-bixiu1-preview.pdf",
        },
      },
      { id: "m3", from: "buyer", text: "可以，已拍，付好了！", time: "12:40" },
      {
        id: "m4",
        from: "ai",
        text: "收到！恭喜上岸成功🎉 我马上通知老板给你发完整版～ 完整版会在 10 分钟内发到你手上，请注意查收消息～",
        time: "12:41",
      },
      { id: "m5", from: "seller", text: "完整版已经发你邮箱啦，记得查收，有不懂的随时问我～", time: "12:55" },
    ],
  },
];

// ---------- 接单通知 ----------
export type Notice = {
  id: string;
  // order=新订单 escalate=转人工告警 stock=缺货登记 wechat=买家即将加微信（终极转化）
  type: "order" | "escalate" | "stock" | "wechat";
  title: string;
  desc: string;
  time: string;
  conversationId?: string; // 点击通知跳转到对应会话
};

export const notices: Notice[] = [
  {
    id: "n1",
    type: "order",
    title: "新订单待发货",
    desc: "「考研的松鼠」付款 ¥16.90 · 高二数学导数冲刺笔记",
    time: "14:32",
    conversationId: "c1",
  },
  {
    id: "n2",
    type: "escalate",
    title: "买家要求人工介入",
    desc: "「早八睡不醒」售后纠纷 + 情绪激动，等待你接管",
    time: "13:58",
    conversationId: "c2",
  },
  {
    id: "n3",
    type: "stock",
    title: "缺货登记",
    desc: "3 位买家询问「高三化学有机专项」，知识库暂无",
    time: "11:20",
  },
];

// ---------- 下拉选项常量 ----------
export const OPTIONS = {
  subjects: ["数学", "英语", "物理", "化学", "语文"],
  grades: ["高一", "高二", "高三", "大一"],
  versions: ["人教版", "人教A版", "北师大版", "外研版"],
  purposes: ["期中复习", "期末复习", "月考冲刺", "专项突破", "一轮复习"],
  styles: ["小红书", "知乎", "公众号"],
};

// ---------- 数据分析图表数据（新增） ----------

// 转化漏斗
export const conversionFunnel = {
  stages: [
    { label: "买家进线", value: 156, color: "#10b981" },
    { label: "需求明确", value: 124, color: "#06b6d4" },
    { label: "匹配笔记", value: 98, color: "#8b5cf6" },
    { label: "发送预览", value: 87, color: "#f59e0b" },
    { label: "完成支付", value: 42, color: "#ef4444" },
  ],
};

// 近 7 天收益趋势
export const earningsTrend = [
  { day: "周一", amount: 35.7 },
  { day: "周二", amount: 52.8 },
  { day: "周三", amount: 41.3 },
  { day: "周四", amount: 68.9 },
  { day: "周五", amount: 45.2 },
  { day: "周六", amount: 89.4 },
  { day: "周日", amount: 23.2 },
];

// AI 解决率 vs 转人工率
export const resolutionStats = {
  aiResolved: 78,
  humanEscalated: 22,
  avgResponseTime: "3.2s",
  avgConversionTime: "8.5min",
  totalConversations: 156,
  satisfied: 92,
};

// 热门学科分布
export const subjectDistribution = [
  { subject: "数学", count: 45, percent: 36, color: "#7c3aed" },
  { subject: "英语", count: 32, percent: 26, color: "#059669" },
  { subject: "物理", count: 24, percent: 19, color: "#2563eb" },
  { subject: "化学", count: 15, percent: 12, color: "#f59e0b" },
  { subject: "语文", count: 9, percent: 7, color: "#ef4444" },
];

// 笔记库扩展数据（用于 library 页面）
export type NoteStatus = "草稿" | "已排版" | "已上架" | "已下架";

export const noteLibrary = [
  {
    id: "note-001",
    title: "高二数学·导数专项冲刺笔记",
    subject: "数学",
    grade: "高二",
    version: "人教A版",
    status: "已上架" as NoteStatus,
    pages: 28,
    price: 19.9,
    sales: 15,
    createdAt: "2026-10-15",
  },
  {
    id: "note-002",
    title: "高一英语·必修一词汇语境记忆手册",
    subject: "英语",
    grade: "高一",
    version: "人教版",
    status: "已上架" as NoteStatus,
    pages: 36,
    price: 12.9,
    sales: 8,
    createdAt: "2026-10-14",
  },
  {
    id: "note-003",
    title: "高三物理·电磁学一轮复习宝典",
    subject: "物理",
    grade: "高三",
    version: "人教版",
    status: "已上架" as NoteStatus,
    pages: 52,
    price: 29.9,
    sales: 5,
    createdAt: "2026-10-13",
  },
  {
    id: "note-004",
    title: "高三化学·有机化学重难点突破",
    subject: "化学",
    grade: "高三",
    version: "人教版",
    status: "已排版" as NoteStatus,
    pages: 40,
    price: 24.9,
    sales: 0,
    createdAt: "2026-10-18",
  },
  {
    id: "note-005",
    title: "高一语文·文言文实词虚词手册",
    subject: "语文",
    grade: "高一",
    version: "人教版",
    status: "草稿" as NoteStatus,
    pages: 22,
    price: 9.9,
    sales: 0,
    createdAt: "2026-10-18",
  },
  {
    id: "note-006",
    title: "高二数学·三角函数题型大全",
    subject: "数学",
    grade: "高二",
    version: "人教A版",
    status: "已下架" as NoteStatus,
    pages: 35,
    price: 16.9,
    sales: 22,
    createdAt: "2026-10-10",
  },
];
