import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getOrder } from '../../api/orderApi';
import { useAsync } from '../../hooks/useAsync';
import { PaymentPanel } from '../../components/PaymentPanel';
import { ErrorState, ListSkeleton, StatusBadge } from '../../components/ui';
import { extraFields, getAddress, getAmount, getOrderId, getProductId, getQuantity, getStatus } from '../../utils/order';
import { formatINR } from '../../utils/format';

export default function OrderDetails() {
  const { id = '' } = useParams();
  const { data: o, loading, error, reload } = useAsync(() => getOrder(id), [id]);
  const [paying, setPaying] = useState(false);

  if (loading) return <div className="container-page py-10"><ListSkeleton rows={3} /></div>;
  if (error) return <div className="container-page py-10"><ErrorState error={error.status === 404 ? { message: 'Order not found.', status: 404 } : error} onRetry={reload} /></div>;
  if (!o) return null;

  const status = getStatus(o), qty = getQuantity(o), amount = getAmount(o), pid = getProductId(o), addr = getAddress(o);
  const rows: [string, React.ReactNode][] = [
    ['Order ID', <span className="font-mono text-sm">{getOrderId(o) || id}</span>],
    ...(qty !== undefined ? [['Quantity', qty] as [string, React.ReactNode]] : []),
    ...(amount !== undefined ? [['Amount', formatINR(amount)] as [string, React.ReactNode]] : []),
    ...(pid ? [['Product', <Link className="text-pine underline" to={`/products/${pid}`}>View product</Link>] as [string, React.ReactNode]] : []),
    ...extraFields(o).map(([k, v]) => [k, v] as [string, React.ReactNode]),
  ];

  return (
    <div className="container-page max-w-3xl py-10">
      <Link to="/orders" className="text-sm text-muted hover:text-ink">&larr; Orders</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Order details</h1>
        <div className="flex items-center gap-3"><StatusBadge status={status} /><button className="btn-ghost" onClick={reload}>Refresh</button></div>
      </div>
      <dl className="card mt-6 divide-y divide-line">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm"><dt className="capitalize text-muted">{k}</dt><dd className="text-right">{v}</dd></div>)}
        {addr && (
          <div className="px-5 py-3 text-sm"><dt className="text-muted">Delivery address</dt>
            <dd className="mt-1">{[addr.houseNumber, addr.street, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}</dd></div>
        )}
      </dl>
      {status === 'PENDING_PAYMENT' && (
        <div className="mt-6">
          {paying ? <PaymentPanel orderId={getOrderId(o) || id} onSuccess={reload} /> : (
            <div className="card p-6">
              <h2 className="text-lg font-bold">Waiting for payment</h2>
              <p className="mt-1 text-sm text-muted">Your stock is reserved for about 30 minutes from when the order was placed. After that the reservation may be released.</p>
              <button className="btn-primary mt-4" onClick={() => setPaying(true)}>Pay now</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
