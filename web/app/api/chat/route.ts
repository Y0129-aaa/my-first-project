import { NextRequest } from "next/server";
import type OpenAI from "openai";
import { SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { getClient, MODEL } from "@/lib/llm";

// ============================================================
// 模拟回复（没配 API Key 时的降级方案）
// ------------------------------------------------------------
// 同样遵守"话术 + 行为标记"的约定，保证前端解析逻辑在无 Key 时也能演示
// ============================================================
const MOCK_REPLIES: { keywords: string[]; reply: string }[] = [
  // 状态3：已买过/要付款
  {
    keywords: ["购买", "买", "付款", "支付", "收款码", "二维码", "微信", "转账", "满意", "不错", "要了", "已拍", "下单"],
    reply: "好的！您刚才查看的是这份资料，请直接点击下方链接进行支付~付款后请把截图发给我，我会马上把完整版发给您！ [SEND_QRCODE]",
  },
  // 状态2：给了年级科目（数学/英语等任意科目都算）
  {
    keywords: ["数学", "英语", "物理", "化学", "语文", "生物", "历史", "地理", "政治"],
    reply: "好的，为您找到了这份资料。这是带水印的预览版，请查看~如果您满意，回复'购买'即可获取无水印完整版。 [SEND_PREVIEW]",
  },
  // 状态1：只要购买意向
  {
    keywords: ["你好", "hi", "hello", "嗨", "在吗", "多少钱", "价格", "费用"],
    reply: "收到您的消息啦~ 告诉我年级和科目（比如：高二数学），我马上给您找对应的资料~",
  },
  {
    keywords: ["谢谢", "感谢"],
    reply: "不客气呀～😊 还有其他科目需要的话随时找我！",
  },
  {
    keywords: ["代写", "答案", "盗版", "人工", "老板", "投诉", "退款"],
    reply: "抱歉，这个问题我帮您转接人工客服，请稍等。",
  },
];

function getMockReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const { keywords, reply } of MOCK_REPLIES) {
    if (keywords.some((k) => lower.includes(k))) return reply;
  }
  return "收到您的消息啦~ 告诉我年级和科目（比如：高二数学），我马上给您找对应的资料~";
}

// ============================================================
// 强制使用 Node.js 运行时（openai 包在 Node 环境下最稳）
// ============================================================
export const runtime = "nodejs";

// ============================================================
// 处理前端发来的聊天请求
// ------------------------------------------------------------
// 前端 POST：{ messages: [{role, content}] }
// 这里只做「System Prompt + 对话历史 → 大模型流式输出」，
// 行为标记（[SEND_PREVIEW] / [SEND_QRCODE]）由提示词驱动，前端解析渲染。
// ============================================================
export async function POST(req: NextRequest) {
  let messages: { role: string; content: string }[] = [];
  try {
    const body = await req.json();
    messages = body.messages ?? [];
  } catch {
    // 请求体解析失败，用空消息
  }

  try {
    const client = getClient();

    const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const stream = await client.chat.completions.create({
      model: MODEL,
      messages: chatMessages,
      stream: true,
      temperature: 0.3,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) controller.enqueue(encoder.encode(text));
          }
        } catch (err) {
          console.error("流式输出出错:", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    // ---- LLM 不可用（没配 Key / 请求失败）时，降级为本地模拟回复 ----
    console.log("[降级] 使用本地模拟回复:", error instanceof Error ? error.message : error);

    const lastUserMsg = messages?.[messages.length - 1]?.content ?? "你好";
    const mockReply = getMockReply(lastUserMsg);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(mockReply));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
}
