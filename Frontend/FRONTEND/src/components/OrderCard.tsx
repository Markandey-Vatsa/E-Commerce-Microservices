import { Link } from 'react-router-dom';
import { StatusBadge } from './ui';
import { formatINR } from '../utils/format';
import { getAmount, getOrderId, getQuantity, getStatus } from '../utils/order';
import type { Order } from '../types';

export function OrderCard({ order }: { order: Order }) {
  const id = getOrderId(order), qty = getQuantity(order), amount = getAmount(order);
  return (
    <Link to={`/orders/${id}`} className="card lift flex flex-wrap items-center justify-between gap-4 p-5">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9ZM4 7.5l8 4.5m0 0 8-4.5M12 12v9" /></svg>
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-subtle">Order</p>
          <p className="truncate font-mono text-sm font-medium">{id}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        {qty !== undefined && <span className="text-subtle">Qty {qty}</span>}
        {amount !== undefined && <span className="font-display text-lg font-bold">{formatINR(amount)}</span>}
        <StatusBadge status={getStatus(order)} />
      </div>
    </Link>
  );
}
