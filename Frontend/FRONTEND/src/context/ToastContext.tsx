import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type Kind = 'success' | 'error' | 'info';
interface ToastItem { id: number; kind: Kind; message: string }
interface ToastApi { success: (m: string) => void; error: (m: string) => void; info: (m: string) => void }
const ToastContext = createContext<ToastApi | null>(null);

const styles: Record<Kind, string> = {
  success: 'bg-fg text-white',
  error: 'bg-danger text-white',
  info: 'bg-fg text-white',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((kind: Kind, message: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, kind, message }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 4500);
  }, []);
  const api = useMemo<ToastApi>(() => ({
    success: (m) => push('success', m), error: (m) => push('error', m), info: (m) => push('info', m),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-full px-5 py-3 text-sm font-medium shadow-xl ${styles[t.kind]}`}>
            <span className={`h-2 w-2 shrink-0 rounded-full ${t.kind === 'error' ? 'bg-white' : t.kind === 'success' ? 'bg-sun' : 'bg-brand-tint'}`} aria-hidden />{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
