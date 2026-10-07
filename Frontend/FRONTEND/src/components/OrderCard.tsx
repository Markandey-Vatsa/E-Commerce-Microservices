import { Link } from 'react-router-dom';
import { StatusBadge } from './ui';
import { formatINR } from '../utils/format';
import { getAmount, getOrderId, getQuantity, getStatus } from '../utils/order';
import type { Order } from '../types';

export function OrderCard({ order }: { order: Order }) {
  const id = getOrderId(order), qty = getQuantity(order), amount = getAmount(order);
  return (
    <Link to={`/orders/${id}`} className="card flex flex-wrap items-center justify-between gap-3 p-4 hover:border-pine">
      <div className="min-w-0">
        <p className="text-xs text-muted">Order</p>
        <p className="truncate font-mono text-sm">{id}</p>
      </div>
      <div className="flex items-center gap-6 text-sm">
        {qty !== undefined && <span className="text-muted">Qty {qty}</span>}
        {amount !== undefined && <span className="font-display font-bold">{formatINR(amount)}</span>}
        <StatusBadge status={getStatus(order)} />
      </div>
    </Link>
  );
}
