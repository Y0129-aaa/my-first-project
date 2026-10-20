/**
 * ============================================================
 * 大模型客户端（共享模块）
 * ------------------------------------------------------------
 * 聊天路由（/api/chat）和笔记处理路由（/api/notes/process）都要用，
 * 所以抽到这里统一管理。
 *
 * 当前接的是 DeepSeek（OpenAI 兼容接口）：
 *   baseURL: https://api.deepseek.com
 *   模型：   deepseek-chat（DeepSeek-V3，便宜且快，支持函数调用）
 *            deepseek-reasoner（推理模型，慢，不适合客服场景）
 * 如果换成其它 OpenAI 兼容供应商，只改 .env.local 的 OPENAI_BASE_URL 即可。
 * ============================================================
 */
import OpenAI from "openai";

// 客户端实例（惰性创建，只创建一次）
let client: OpenAI | null = null;

/**
 * 获取大模型客户端
 * 注意：不在模块加载时直接 new OpenAI()，因为没配 Key 时它会直接崩溃，
 * 导致整个服务起不来。改成"第一次请求时才创建"，并且给出人能看懂的报错。
 */
export function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  // 没配 Key（或还是占位符）：抛出带指引的错误
  if (!apiKey || apiKey.includes("替换成") || apiKey.includes("在这里填")) {
    throw new Error(
      "缺少 OPENAI_API_KEY，请先编辑 .env.local 填入 DeepSeek API Key（https://platform.deepseek.com/api_keys）"
    );
  }

  // 只创建一次，之后复用（节省开销）
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.deepseek.com",
    });
  }
  return client;
}

// 使用的模型名称（在 .env.local 里配置）
// DeepSeek 官方客服场景推荐：deepseek-chat
export const MODEL = process.env.MODEL_NAME || "deepseek-chat";
