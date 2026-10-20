/**
 * ============================================================
 * 工具层：大模型 Function Calling 的定义 + 本地执行
 * ------------------------------------------------------------
 * 工作流程：
 *   1. TOOLS：告诉模型"有哪些工具、怎么传参"（模型靠这个做决策）
 *   2. executeTool：模型说"我要用 XX 工具"后，由我们的代码真正执行
 *
 * 安全设计：
 *   - send_preview 会校验 doc_id 是否真实存在 → 防幻觉发错文件
 *   - 返回给模型的文档信息中剔除了 full_url → 完整版链接不泄露给 AI
 * ============================================================
 */
import type OpenAI from "openai";
import { searchKnowledgeBase, getDocById, Doc } from "./knowledgeBase";

// -------------------- 1. 工具定义（给模型看的） --------------------
// 格式是 OpenAI 标准，智谱同样兼容
// 后面的类型标注是给 TypeScript 看的：保证这个数组能直接传给 SDK 的 tools 参数
export const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_knowledge_base",
      description:
        "从店铺知识库检索匹配的学生笔记。仅当买家的学科与年级都明确后调用，教材版本不知道就传 unknown。检索无结果时不要编造文档，直接转人工。",
      parameters: {
        type: "object",
        properties: {
          subject: { type: "string", description: "学科，如：数学、英语、物理" },
          grade: { type: "string", description: "年级，如：高二、高三、初三" },
          version: {
            type: "string",
            description: "教材版本，如：人教A版；买家没说就传 unknown",
          },
          purpose: {
            type: "string",
            description: "用途，如：期末复习、导数专项；没有就传空字符串",
          },
        },
        required: ["subject", "grade"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_preview",
      description:
        "给买家发送指定笔记的预览版 PDF。doc_id 必须来自 search_knowledge_base 的返回结果，严禁编造。",
      parameters: {
        type: "object",
        properties: {
          doc_id: { type: "string", description: "文档ID，必须来自检索结果" },
          doc_title: { type: "string", description: "笔记标题" },
        },
        required: ["doc_id", "doc_title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "notify_seller",
      description: "买家明确表示已付款后，通知卖家发送完整版。",
      parameters: {
        type: "object",
        properties: {
          buyer_id: { type: "string", description: "买家平台ID" },
          doc_title: { type: "string", description: "已购笔记标题" },
          amount: { type: "number", description: "实付金额" },
          pay_screenshot: { type: "boolean", description: "买家是否已发付款截图" },
        },
        required: ["buyer_id", "doc_title", "amount"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "escalate_to_human",
      description:
        "转接人工客服。触发条件：知识库无匹配、需求超范围、追问3轮未解决、买家情绪激动、退款/发票/批量采购等特殊要求、买家主动要求真人、任何不确定的情况。",
      parameters: {
        type: "object",
        properties: {
          reason: { type: "string", description: "转人工原因，如：知识库无匹配" },
          detail: { type: "string", description: "对话摘要，供人工快速接手" },
        },
        required: ["reason"],
      },
    },
  },
];

// -------------------- 2. 本地执行工具 --------------------

// 工具执行后要返回的两样东西：
//   tool_result: 给模型看的执行结果（文本）
//   marker:     需要展示给买家的特殊内容（PDF 卡片 / 转人工提示），可选
export type ToolExecutionResult = {
  tool_result: string;
  marker?: string;
};

/**
 * 执行工具
 * @param name     工具名（模型决定的）
 * @param rawArgs  模型传来的参数（JSON 字符串）
 */
export function executeTool(name: string, rawArgs: string): ToolExecutionResult {
  // 模型偶尔会传畸形的 JSON，解析失败时按空对象处理，保证不崩溃
  let args: any = {};
  try {
    args = JSON.parse(rawArgs || "{}");
  } catch {
    console.warn("工具参数解析失败:", rawArgs);
  }

  switch (name) {
    // ---------- 检索知识库 ----------
    case "search_knowledge_base": {
      const docs = searchKnowledgeBase({
        subject: args.subject,
        grade: args.grade,
        version: args.version,
        purpose: args.purpose,
      });

      // 没检索到：明确告诉模型"没有"，并提示按兜底规则处理
      if (docs.length === 0) {
        return {
          tool_result:
            "知识库未找到匹配笔记。请勿编造任何文档；可询问买家是否接受相近推荐，或按兜底规则转人工。",
        };
      }

      // 检索到了：只把必要信息给模型（注意剔除 full_url，完整版链接不外泄）
      return {
        tool_result: JSON.stringify(
          docs.map((d: Doc) => ({
            doc_id: d.doc_id,
            title: d.title,
            subject: d.subject,
            grade: d.grade,
            version: d.version,
            price: d.price,
            pages: d.pages,
            preview_url: d.preview_url,
          }))
        ),
      };
    }

    // ---------- 发送预览版 ----------
    case "send_preview": {
      const doc = getDocById(args.doc_id);

      // 幻觉防线：模型给的 doc_id 在知识库里不存在 → 拒绝发送
      if (!doc) {
        return {
          tool_result: `doc_id「${args.doc_id}」不存在，已拒绝发送。只能发送检索结果中出现过的文档，请重新检索或转人工。`,
        };
      }

      return {
        tool_result: `已向买家发送《${doc.title}》预览版（${doc.pages} 页）。请提醒买家确认内容，并介绍完整版价格 ${doc.price} 元。`,
        // marker 会随回复一起流式发给前端，前端解析后渲染成 PDF 卡片
        marker: `[[PDF:${doc.title}|${doc.preview_url}]]`,
      };
    }

    // ---------- 通知卖家发货 ----------
    case "notify_seller": {
      // MVP 阶段先打日志；以后换成企业微信 / 飞书 Webhook 推送给卖家
      console.log("【通知卖家发货】", args);
      return {
        tool_result: "已通知卖家发送完整版。请告知买家：完整版将在 10 分钟内发送，请留意消息。",
      };
    }

    // ---------- 转人工 ----------
    case "escalate_to_human": {
      // MVP 阶段先打日志；以后换成 Webhook 推送给卖家，并标记会话为人工接管
      console.log("【转人工】", args);
      return {
        tool_result: "已转接人工客服。请按系统提示词中的固定话术告知买家，不要再多说别的。",
        marker: `[[HUMAN:${args.reason || "未知原因"}]]`,
      };
    }

    // ---------- 未知工具 ----------
    default:
      return { tool_result: `未知工具：${name}，本次调用无效。` };
  }
}
