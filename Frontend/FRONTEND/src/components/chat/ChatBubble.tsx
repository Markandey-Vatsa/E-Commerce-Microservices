import type { ChatMessage } from '../../types';
import { ChatText } from './ChatText';
import { ChatProductCard } from './ChatProductCard';

export const AssistantAvatar = () => (
  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-tint text-brand" aria-hidden>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm7 11l.9 2.6 2.6.9-2.6.9L19 20l-.9-2.6-2.6-.9 2.6-.9L19 13z" /></svg>
  </span>
);

const time = (t: number) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function ChatBubble({ message }: { message: ChatMessage }) {
  const mine = message.role === 'user';
  if (mine) {
    return (
      <div className="toast-in flex flex-col items-end gap-1">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[15px] leading-relaxed text-white sm:max-w-[75%]">{message.text}</div>
        <time className="px-1 text-[11px] text-subtle" dateTime={new Date(message.createdAt).toISOString()}>{time(message.createdAt)}</time>
      </div>
    );
  }
  return (
    <div className="toast-in flex gap-3">
      <AssistantAvatar />
      <div className="min-w-0 max-w-[90%] flex-1 sm:max-w-[85%]">
        <div className="inline-block max-w-full rounded-2xl rounded-tl-md border border-hair bg-surface px-4 py-3">
          <ChatText text={message.text} />
        </div>
        {message.products && (
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:overflow-x-auto sm:pb-2" aria-label="Recommended products">
            {message.products.map((p) => <ChatProductCard key={p.id} product={p} />)}
          </div>
        )}
        <time className="mt-1 block px-1 text-[11px] text-subtle" dateTime={new Date(message.createdAt).toISOString()}>{time(message.createdAt)}</time>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3" role="status" aria-live="polite" aria-label="Assistant is typing">
      <AssistantAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-md border border-hair bg-surface px-4 py-4">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${i * 150}ms`, opacity: .7 }} />
        ))}
      </div>
    </div>
  );
}
