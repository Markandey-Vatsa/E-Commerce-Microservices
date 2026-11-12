import client, { ApiError, tokenStore, triggerUnauthorized } from './client';
import { isExpired } from '../utils/jwt';
import type { ChatProduct, ChatReply } from '../types';

/**
 * Contract: POST <gateway>/chat/message  body { conversationId: string, message: string }.
 * The call goes through the shared Axios client, so it uses the gateway base URL (VITE_API_BASE_URL)
 * and sends `Authorization: Bearer <JWT>`. This is the ONLY file that knows the contract.
 * ASSUMPTION: the ChatResponse DTO field names were not provided; normalizeChatReply() accepts the common ones.
 */
const CHAT_PATH = (import.meta.env.VITE_CHAT_ENDPOINT as string | undefined)?.trim() || '/chat/message';

const buildChatRequest = (conversationId: string, message: string) => ({ conversationId, message });

const TEXT_KEYS = ['response', 'reply', 'message', 'answer', 'content', 'text', 'output'] as const;
const PRODUCT_KEYS = ['products', 'items', 'recommendations', 'results'] as const;

const num = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function toProduct(raw: unknown): ChatProduct | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = num(r.id ?? r.productId);
  const name = typeof r.name === 'string' ? r.name.trim() : '';
  if (id === undefined || !name) return null; // never invent a product
  return {
    id, name,
    description: typeof r.description === 'string' && r.description.trim() ? r.description : undefined,
    price: num(r.price),
    stock: num(r.stock),
  };
}

/** Accepts a plain string, or an object with a text field and an optional structured product list. */
export function normalizeChatReply(data: unknown): ChatReply {
  if (typeof data === 'string') return { text: data.trim(), products: [] };
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>;
    const textKey = TEXT_KEYS.find((k) => typeof o[k] === 'string');
    const text = textKey ? (o[textKey] as string).trim() : '';
    const listKey = PRODUCT_KEYS.find((k) => Array.isArray(o[k]));
    const products = listKey ? (o[listKey] as unknown[]).map(toProduct).filter((p): p is ChatProduct => p !== null) : [];
    if (text || products.length) return { text, products };
  }
  throw new ApiError('The assistant sent a reply we could not read. Please try again.', 502);
}

export async function sendChatMessage(conversationId: string, message: string, signal?: AbortSignal): Promise<ChatReply> {
  const token = tokenStore.get();
  // Frontend pre-check only: ChatBotService must validate the JWT itself.
  if (!token || isExpired(token)) {
    triggerUnauthorized();
    throw new ApiError('Session expired. Please log in again.', 401);
  }
  // LLM replies can take longer than the default 20s request timeout.
  const { data } = await client.post(CHAT_PATH, buildChatRequest(conversationId, message), { signal, timeout: 60000 });
  return normalizeChatReply(data);
}
