import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { ApiError } from '../api/client';
import { sendChatMessage } from '../api/chatApi';
import type { ChatMessage } from '../types';

interface ChatValue {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  send: (text: string) => Promise<boolean>;
  retry: () => void;
  newConversation: () => void;
  clearConversation: () => void;
}
const ChatContext = createContext<ChatValue | null>(null);

/** RFC 4122 v4 UUID. crypto.randomUUID only exists in secure contexts (https/localhost), so fall back to getRandomValues. */
function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const uid = uuid; // message ids

function ChatInner({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);            // blocks duplicate submits synchronously
  const epoch = useRef(0);               // bumps on reset so late replies are discarded
  const abort = useRef<AbortController | null>(null);
  const failedText = useRef<string | null>(null);
  // One id per conversation: reused for every message, replaced only by New chat / Clear. A new provider
  // instance (login, logout, session expiry) starts with a fresh id, so ids are never shared across customers.
  const conversationId = useRef<string>(uuid());

  const request = useCallback(async (text: string) => {
    busy.current = true; setLoading(true); setError(null);
    const myEpoch = epoch.current;
    const convId = conversationId.current;
    const ctrl = new AbortController();
    abort.current = ctrl;
    try {
      const reply = await sendChatMessage(convId, text, ctrl.signal);
      if (myEpoch !== epoch.current) return;
      failedText.current = null;
      setMessages((m) => [...m, {
        id: uid(), role: 'assistant', createdAt: Date.now(), products: reply.products.length ? reply.products : undefined,
        text: reply.text || 'Here is what I found:',
      }]);
    } catch (e) {
      if (myEpoch !== epoch.current || ctrl.signal.aborted) return;
      failedText.current = text;
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      if (myEpoch === epoch.current) { busy.current = false; setLoading(false); }
    }
  }, []);

  const send = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || busy.current) return false;
    setMessages((m) => [...m, { id: uid(), role: 'user', text, createdAt: Date.now() }]);
    void request(text);
    return true;
  }, [request]);

  const retry = useCallback(() => {
    if (busy.current || !failedText.current) return;
    void request(failedText.current);
  }, [request]);

  const reset = useCallback(() => {
    epoch.current += 1; abort.current?.abort(); abort.current = null;
    busy.current = false; failedText.current = null;
    conversationId.current = uuid();   // fresh memory on the backend; old context is never reused
    setMessages([]); setLoading(false); setError(null);
  }, []);

  // Leaving the provider (logout / session expiry remounts it) cancels any in-flight request.
  useEffect(() => () => { epoch.current += 1; abort.current?.abort(); }, []);

  const value = useMemo<ChatValue>(() => ({
    messages, loading, error, send, retry, newConversation: reset, clearConversation: reset,
  }), [messages, loading, error, send, retry, reset]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

/** In-memory only. Remounts per signed-in account, so logging out (or a 401) wipes the chat from the frontend. */
export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  return <ChatInner key={user?.username || 'guest'}>{children}</ChatInner>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
}
