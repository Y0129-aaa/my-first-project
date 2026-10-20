/**
 * ============================================================
 * 终极转化信号（买家端 → 卖家端 联动）
 * ------------------------------------------------------------
 * 用途：买家在聊天里说出"我要买 / 怎么付款 / 发原版"等购买意图关键词时，
 *       买家端弹出「扫码添加客服」卡片，同时把这个信号同步给卖家工作台，
 *       让右侧「接单通知」立刻提醒老板准备原版文件。
 *
 * 为什么用 localStorage + 自定义事件：
 *   买家聊天室（/shop）和卖家工作台（/ 或 /service）是两个页面，很可能开在两个标签页。
 *   - 同页面内通信：CustomEvent 足够；
 *   - 跨标签页通信：靠 localStorage 的 storage 事件；
 *   两者都监听，就能同时覆盖"同一页面"和"两个标签页"两种玩法。
 * ============================================================
 */

// 客服微信号（点击卡片时复制到剪贴板）
export const WECHAT_ID = "ruizi_notes_2026";

// -------------------- 1. 购买意图关键词 --------------------
// 命中任意一个，就认为买家到了"准备付钱"的阶段，触发终极转化
export const CONVERSION_KEYWORDS: string[] = [
  // 明确的购买表达
  "我要买", "我要下单", "我买了", "买了", "下单了", "拍下了", "已拍",
  "买一份", "来一份", "要一份", "想要这个", "就这个",
  // 询问付款/购买方式
  "怎么买", "怎么购买", "如何购买", "怎么付款", "如何付款",
  "怎么支付", "如何支付", "怎么下单", "如何下单", "怎么转账", "如何转账",
  "付款方式", "支付方式", "购买方式", "哪里买", "哪里付款",
  "收款码", "付款码", "二维码", "加微信", "微信多少",
  // 索要原版/无水印
  "发原版", "要原版", "原版", "无水印", "高清版", "完整版", "发完整版",
  // 已付款
  "已付款", "付款了", "付好了", "付过了", "已经付",
];

/**
 * 判断买家消息是否命中购买意图
 * @returns 命中的关键词；没命中返回 null
 */
export function matchConversionKeyword(text: string): string | null {
  if (!text) return null;
  // 归一化：去空格、转小写，避免"我要 买"、全角半角导致漏判
  const normalized = text.replace(/\s+/g, "").toLowerCase();
  for (const kw of CONVERSION_KEYWORDS) {
    if (normalized.includes(kw.toLowerCase())) return kw;
  }
  return null;
}

// -------------------- 2. 信号结构 --------------------
export type ConversionSignal = {
  id: string;      // 唯一 ID（防重复消费）
  keyword: string; // 命中的关键词
  text: string;    // 买家原话
  time: string;    // 发生时间 HH:mm
};

const STORAGE_KEY = "conversion_signal";
const EVENT_NAME = "conversion-signal";
// 认为信号仍然"新鲜"的时间窗（10 分钟）：卖家端后打开时也能补一条提醒
const FRESH_MS = 10 * 60 * 1000;

/** 当前时间 HH:mm */
export function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// -------------------- 3. 发送信号（买家端调用） --------------------
export function emitConversionSignal(signal: ConversionSignal): void {
  if (typeof window === "undefined") return;

  // 写 localStorage：触发其它标签页的 storage 事件
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...signal, ts: Date.now() })
    );
  } catch {
    // 隐私模式下 localStorage 可能不可写，忽略即可（同页面通信仍可用）
  }

  // 同页面内直接派发事件
  window.dispatchEvent(new CustomEvent<ConversionSignal>(EVENT_NAME, { detail: signal }));
}

// -------------------- 4. 订阅信号（卖家端调用） --------------------
/**
 * 订阅转化信号
 * @param cb 收到信号时的回调
 * @returns 取消订阅的函数（在 useEffect 里 return 出去）
 */
export function subscribeConversionSignal(
  cb: (signal: ConversionSignal) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  // 已处理过的信号 ID，避免 storage + CustomEvent 重复触发
  const handled = new Set<string>();

  const handle = (signal: ConversionSignal | null) => {
    if (!signal?.id || handled.has(signal.id)) return;
    handled.add(signal.id);
    cb(signal);
  };

  // 同页面
  const onCustom = (e: Event) => handle((e as CustomEvent<ConversionSignal>).detail);
  // 跨标签页
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      handle(JSON.parse(e.newValue) as ConversionSignal);
    } catch {
      // 解析失败忽略
    }
  };

  window.addEventListener(EVENT_NAME, onCustom);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(EVENT_NAME, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

// -------------------- 5. 读取最近一次信号 --------------------
/**
 * 卖家页面后打开时，读一条"还算新鲜"的信号补上提醒
 * @returns 10 分钟内的信号；没有或已过期返回 null
 */
export function readFreshConversionSignal(): ConversionSignal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConversionSignal & { ts?: number };
    if (!parsed?.id || !parsed.ts) return null;
    if (Date.now() - parsed.ts > FRESH_MS) return null;
    return { id: parsed.id, keyword: parsed.keyword, text: parsed.text, time: parsed.time };
  } catch {
    return null;
  }
}

// -------------------- 6. 复制微信号 --------------------
/**
 * 复制客服微信号到剪贴板
 * 优先用 clipboard API，失败时退回 execCommand（兼容 http 环境）
 */
export async function copyWechatId(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(WECHAT_ID);
      return;
    }
  } catch {
    // 继续走下面的兜底方案
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = WECHAT_ID;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  } catch {
    // 复制失败不打断转化流程，Toast 照常提示
  }
}
