import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Markdown renderer for assistant messages (GFM: tables, lists, strikethrough, task lists).
 * Raw HTML in the reply is NOT rendered (react-markdown's default), so LLM output cannot inject markup.
 */
const components: Components = {
  // Wide tables scroll inside the bubble instead of stretching it.
  table: ({ children }) => <div className="chat-md-table"><table>{children}</table></div>,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
};

export function ChatText({ text }: { text: string }) {
  return (
    <div className="chat-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{text}</ReactMarkdown>
    </div>
  );
}
