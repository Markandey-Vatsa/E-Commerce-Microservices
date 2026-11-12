import { useEffect, useRef, useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Alert, ConfirmationDialog } from '../../components/ui';
import { ChatBubble, TypingIndicator } from '../../components/chat/ChatBubble';
import { ChatInput } from '../../components/chat/ChatInput';
import { ChatWelcome } from '../../components/chat/ChatWelcome';

export default function Chatbot() {
  const { messages, loading, error, send, retry, newConversation, clearConversation } = useChat();
  const [confirmClear, setConfirmClear] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the newest message in view (scroll the panel, not the page).
  useEffect(() => {
    const el = scroller.current; if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length, loading, error]);

  const empty = messages.length === 0;
  return (
    <div className="container-page flex h-[calc(100dvh-68px)] min-h-[560px] flex-col py-4 sm:py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl">Shopping assistant</h1>
          <p className="hidden text-sm text-subtle sm:block">AI-powered product discovery across the live catalogue.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary !px-4 !py-2" onClick={newConversation} disabled={empty && !loading}>New chat</button>
          <button className="btn-ghost !px-4 !py-2" onClick={() => setConfirmClear(true)} disabled={empty}>Clear</button>
        </div>
      </div>

      <div className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <div ref={scroller} className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite" aria-label="Conversation">
          {empty && !loading ? <ChatWelcome disabled={loading} onPick={(t) => void send(t)} /> : messages.map((m) => <ChatBubble key={m.id} message={m} />)}
          {loading && <TypingIndicator />}
          {error && (
            <div className="flex items-start gap-3">
              <div className="flex-1"><Alert kind="error">{error}</Alert></div>
              {error !== 'Session expired. Please log in again.' && <button className="btn-secondary !px-4 !py-2" onClick={retry}>Retry</button>}
            </div>
          )}
        </div>
        <div className="border-t border-hair bg-canvas p-3 sm:p-4">
          <ChatInput disabled={loading} onSend={send} />
          <p className="mt-2 text-center text-[11px] text-subtle">Press Enter to send, Shift+Enter for a new line. Check price and stock on the product page before buying.</p>
        </div>
      </div>

      <ConfirmationDialog open={confirmClear} title="Clear this conversation?" body="All messages in the current chat will be removed. This cannot be undone."
        confirmLabel="Clear" onCancel={() => setConfirmClear(false)}
        onConfirm={() => { clearConversation(); setConfirmClear(false); }} />
    </div>
  );
}
