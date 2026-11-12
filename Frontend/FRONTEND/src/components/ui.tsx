import { useEffect, useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ApiError } from '../api/client';

export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden />;
}

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-hair ${className}`} aria-hidden />
);

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card overflow-hidden">
          <Skeleton className="h-44 rounded-none" />
          <div className="space-y-3 p-4"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /><Skeleton className="h-10 w-full rounded-full" /></div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
    </div>
  );
}

const Glyph = ({ d }: { d: string }) => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
);

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-16 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-tint text-brand">
        <Glyph d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9ZM4 7.5l8 4.5m0 0 8-4.5M12 12v9" />
      </span>
      <h3 className="text-xl font-bold">{title}</h3>
      {body && <p className="mt-1.5 max-w-md text-sm text-subtle">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiError | { message: string; status?: number }; onRetry?: () => void }) {
  const unauth = error.status === 401;
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center" role="alert">
      <span className={`mb-4 grid h-14 w-14 place-items-center rounded-2xl ${unauth ? 'bg-brand-tint text-brand' : 'bg-danger-tint text-danger'}`}>
        <Glyph d={unauth ? 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z' : 'M12 8v5m0 3.5h.01M10.3 3.9 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z'} />
      </span>
      <h3 className="text-xl font-bold">{unauth ? 'Sign in to continue' : 'This did not load'}</h3>
      <p className="mt-1.5 max-w-md text-sm text-subtle">
        {unauth ? 'The catalogue requires an account on this server. Sign in and we will load it for you.' : error.message}
      </p>
      <div className="mt-6 flex gap-3">
        {unauth && <Link to="/login" className="btn-primary">Sign in</Link>}
        {onRetry && <button onClick={onRetry} className="btn-secondary">Try again</button>}
      </div>
    </div>
  );
}

const STATUS_STYLE: Record<string, { box: string; dot: string }> = {
  PENDING_PAYMENT: { box: 'bg-warn-tint text-warn', dot: 'bg-sun-deep' },
  PLACED: { box: 'bg-brand-tint text-brand-ink', dot: 'bg-brand' },
  CONFIRMED: { box: 'bg-ok-tint text-ok', dot: 'bg-ok' },
  DISPATCHED: { box: 'bg-brand-tint text-brand-ink', dot: 'bg-brand' },
  DELIVERED: { box: 'bg-ok-tint text-ok', dot: 'bg-ok' },
  CANCELLED: { box: 'bg-danger-tint text-danger', dot: 'bg-danger' },
};
export function StatusBadge({ status }: { status: string }) {
  const label = status.toLowerCase().replace(/_/g, ' ');
  const s = STATUS_STYLE[status] ?? { box: 'bg-canvas text-subtle', dot: 'bg-subtle' };
  return (
    <span className={`chip capitalize ${s.box}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden />{label}
    </span>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center p-4 backdrop-blur-sm sm:items-center" style={{ background: 'rgba(22,20,46,.5)' }} onMouseDown={onClose}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        className="toast-in w-full max-w-md rounded-3xl bg-surface p-7 shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold">{title}</h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmationDialog({ open, title, body, confirmLabel, busy, onConfirm, onCancel }: {
  open: boolean; title: string; body: string; confirmLabel: string; busy?: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-subtle">{body}</p>
      <div className="mt-7 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>{busy && <Spinner />}{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; htmlFor: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {error && <p className="mt-1.5 text-xs font-medium text-danger" role="alert">{error}</p>}
    </div>
  );
}

export function Alert({ kind, children }: { kind: 'error' | 'success' | 'info'; children: ReactNode }) {
  const s = {
    error: 'bg-danger-tint text-danger',
    success: 'bg-ok-tint text-ok',
    info: 'bg-brand-tint text-brand-ink',
  }[kind];
  const bar = { error: 'bg-danger', success: 'bg-ok', info: 'bg-brand' }[kind];
  return (
    <div role={kind === 'error' ? 'alert' : 'status'} className={`relative overflow-hidden rounded-xl py-3 pl-5 pr-4 text-sm ${s}`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${bar}`} aria-hidden />{children}
    </div>
  );
}

export const PageHeader = ({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div><h1 className="text-4xl leading-tight">{title}</h1>{sub && <p className="mt-1.5 text-sm text-subtle">{sub}</p>}</div>
    {action}
  </div>
);
