import { NextRequest } from "next/server";
import { getClient, MODEL } from "@/lib/llm";

// ============================================================
// 笔记处理 API：AI 排版 + 生成推广推文
// ------------------------------------------------------------
// 前端（笔记处理页）POST 原始笔记文字和笔记信息过来，
// 这里调用大模型，返回 JSON：
//   { formatted: "排版后的文档", tweet: "推文文案", highlights: ["要点", ...] }
//
// 容错设计：AI 不可用（没配 Key / 网络错误）时，
// 返回示例数据并标记 mock: true，保证答辩演示不中断。
// ============================================================
export const runtime = "nodejs";

// AI 不可用时的兜底示例数据
const MOCK_RESULT = {
  formatted: `# 高二数学 · 导数专项冲刺笔记（期末版）

## 一、核心公式
- 导数定义：f'(x₀) = lim(Δx→0) [f(x₀+Δx) - f(x₀)] / Δx
- 运算法则：(fg)' = f'g + fg'；(f/g)' = (f'g - fg') / g²

## 二、六大常考题型
1. 求切线方程 → 先求导，再代入点斜式
2. 单调性讨论 → 导函数正负区间
3. 极值最值 → f'(x)=0 的根 + 两侧符号
4. 零点个数 → 单调性 + 端点值夹逼
5. 恒成立问题 → 参变分离
6. 证明不等式 → 构造辅助函数

## 三、易错点清单
⚠️ 忽略定义域 ｜ ⚠️ 切线方程与切线长混淆 ｜ ⚠️ 极值点与驻点关系

## 四、真题精练
收录近 5 年期末真题 18 道，按题型分组，附详细步骤。`,
  tweet: `期末数学还想冲一波的宝子看过来📚

这份《高二数学·导数专项冲刺笔记》真的救大命：
✅ 公式大全 + 6大题型逐一拆解
✅ 近5年期末真题精练，期末考什么练什么
✅ 易错点清单，避开90%人会踩的坑

排版清爽，打印出来直接背👇 永久可看，更新免费同步
#高二数学 #导数 #期末复习 #学霸笔记`,
  highlights: [
    "六大常考题型全覆盖，按步骤拆解",
    "近 5 年期末真题 18 道分组精练",
    "易错点清单，避开高频扣分点",
  ],
};

export async function POST(req: NextRequest) {
  try {
    const { text, subject, grade, version, purpose, style } =
      await req.json();

    // 参数校验：内容太短就不值得调 AI
    if (!text || text.trim().length < 10) {
      return Response.json(
        { error: "笔记内容太短，请至少输入 10 个字符" },
        { status: 400 }
      );
    }

    // ---------- 组装提示词 ----------
    const prompt = `你是一位学生笔记整理与自媒体运营助手。请把下面的原始笔记整理成结构化文档，并生成一篇推广推文。

【笔记信息】学科：${subject}｜年级：${grade}｜版本：${version}｜用途：${purpose}
【推文风格】${style}

【原始笔记】
${text.slice(0, 4000)}

【输出要求】严格输出一个 JSON 对象（不要输出 markdown 代码块标记），包含三个字段：
1. formatted：排版后的完整文档（markdown 格式，要有标题层级、分点、易错点标注）
2. tweet：${style}风格推文（带 emoji、话题标签、购买引导，不超过 200 字）
3. highlights：3 条核心要点（字符串数组）`;

    // ---------- 调用大模型 ----------
    const client = getClient();
    const resp = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = resp.choices[0]?.message?.content ?? "";

    // ---------- 健壮地解析 JSON ----------
    // 模型有时会在 JSON 外面包 ```json 代码块，先整体试，再正则提取
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          /* 解析失败走兜底 */
        }
      }
    }

    // 解析失败也走兜底
    if (!parsed?.formatted || !parsed?.tweet) {
      throw new Error("模型返回格式无法解析");
    }

    return Response.json(parsed);
  } catch (error) {
    // ---------- 兜底：返回示例数据 ----------
    console.error("notes process error:", error);
    return Response.json({ ...MOCK_RESULT, mock: true });
  }
}
