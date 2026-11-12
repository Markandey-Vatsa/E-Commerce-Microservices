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
    ...(pid ? [['Product', <Link className="font-semibold text-brand underline" to={`/products/${pid}`}>View product</Link>] as [string, React.ReactNode]] : []),
    ...extraFields(o).map(([k, v]) => [k, v] as [string, React.ReactNode]),
  ];

  return (
    <div className="container-page max-w-3xl py-10">
      <Link to="/orders" className="text-sm font-semibold text-subtle hover:text-brand">&larr; Orders</Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">Order details</h1>
        <div className="flex items-center gap-3"><StatusBadge status={status} /><button className="btn-ghost" onClick={reload}>Refresh</button></div>
      </div>
      <dl className="panel mt-7 divide-y divide-hair overflow-hidden">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-6 py-4 text-sm"><dt className="capitalize text-subtle">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
        {addr && (
          <div className="px-6 py-4 text-sm"><dt className="text-subtle">Delivery address</dt>
            <dd className="mt-1 font-medium">{[addr.houseNumber, addr.street, addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}</dd></div>
        )}
      </dl>
      {status === 'PENDING_PAYMENT' && (
        <div className="mt-6">
          {paying ? <PaymentPanel orderId={getOrderId(o) || id} onSuccess={reload} /> : (
            <div className="panel border-[var(--sun)] bg-sun-tint p-7" style={{ borderColor: "var(--sun)" }}>
              <h2 className="text-xl font-bold">Waiting for payment</h2>
              <p className="mt-1.5 text-sm text-fg/80">Your stock is reserved for about 30 minutes from when the order was placed. After that the reservation may be released.</p>
              <button className="btn-sun mt-5 px-7" style={{ boxShadow: "0 0 0 1.5px var(--sun-deep) inset" }} onClick={() => setPaying(true)}>Pay now</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
