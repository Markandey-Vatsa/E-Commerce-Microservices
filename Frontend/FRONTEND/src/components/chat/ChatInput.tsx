import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Spinner } from '../ui';

export function ChatInput({ disabled, onSend }: { disabled: boolean; onSend: (text: string) => Promise<boolean> }) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);

  // Grow with content up to ~6 lines.
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
  }, [value]);

  const submit = async () => {
    if (disabled || !value.trim()) return;
    const ok = await onSend(value);
    if (ok) { setValue(''); ref.current?.focus(); }
  };
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void submit(); }
  };

  return (
    <div className="flex items-end gap-2 rounded-2xl border border-hair bg-surface p-2 transition focus-within:border-brand" style={{ boxShadow: 'none' }}>
      <label htmlFor="chat-input" className="sr-only">Message the shopping assistant</label>
      <textarea
        id="chat-input" ref={ref} rows={1} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKeyDown}
        placeholder="Ask about products, budgets or recommendations…"
        className="max-h-36 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-subtle"
        style={{ outline: 'none' }}
      />
      <button type="button" className="btn-primary !h-10 !w-10 shrink-0 !p-0" onClick={() => void submit()} disabled={disabled || !value.trim()} aria-label="Send message">
        {disabled ? <Spinner /> : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        )}
      </button>
    </div>
  );
}
