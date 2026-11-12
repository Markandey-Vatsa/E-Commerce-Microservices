import { AssistantAvatar } from './ChatBubble';

export const SUGGESTED_PROMPTS = [
  'Find wireless headphones',
  'Show gaming accessories under ₹3,000',
  'Recommend a keyboard for programming',
  'Compare available products',
];

export function ChatWelcome({ disabled, onPick }: { disabled: boolean; onPick: (text: string) => void }) {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-2 py-8 text-center sm:py-14">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-tint text-brand">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm7 11l.9 2.6 2.6.9-2.6.9L19 20l-.9-2.6-2.6-.9 2.6-.9L19 13z" /></svg>
      </span>
      <h2 className="mt-5 text-3xl">How can I help you shop?</h2>
      <p className="mt-2 text-sm text-subtle">I can help you discover products from the Mercato catalogue. Tell me what you need, your budget or what you will use it for.</p>
      <div className="mt-8 grid w-full gap-2.5 sm:grid-cols-2" role="list" aria-label="Suggested prompts">
        {SUGGESTED_PROMPTS.map((p) => (
          <button key={p} role="listitem" disabled={disabled} onClick={() => onPick(p)}
            className="card lift flex items-center gap-3 px-4 py-3 text-left text-sm font-semibold disabled:opacity-50">
            <span className="shrink-0 scale-75"><AssistantAvatar /></span>{p}
          </button>
        ))}
      </div>
    </div>
  );
}
