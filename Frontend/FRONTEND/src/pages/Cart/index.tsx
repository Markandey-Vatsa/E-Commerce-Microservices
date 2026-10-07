import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProduct } from '../../api/productApi';
import { ApiError } from '../../api/client';
import { useCart } from '../../context/CartContext';
import { CartItem } from '../../components/CartItem';
import { Alert, EmptyState, PageHeader, Spinner } from '../../components/ui';
import { formatINR } from '../../utils/format';
import type { Product } from '../../types';

export default function Cart() {
  const cart = useCart();
  const nav = useNavigate();
  const [checking, setChecking] = useState(false);
  const [gone, setGone] = useState<Set<number>>(new Set());
  const [netErr, setNetErr] = useState(false);

  // Cart stock is a snapshot. Re-read each product so stale quantities are flagged before checkout.
  const ids = cart.items.map((l) => l.productId).join(',');
  const refresh = useCallback(async () => {
    if (!ids) return;
    setChecking(true); setNetErr(false);
    const ls = ids.split(',').map(Number);
    const res = await Promise.allSettled(ls.map((id) => getProduct(id)));
    const fresh: Product[] = []; const missing = new Set<number>(); let failed = false;
    res.forEach((r, i) => {
      if (r.status === 'fulfilled') fresh.push(r.value);
      else if (r.reason instanceof ApiError && r.reason.status === 404) missing.add(ls[i]);
      else failed = true;
    });
    cart.syncSnapshots(fresh); setGone(missing); setNetErr(failed); setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);
  useEffect(() => { void refresh(); }, [refresh]);

  if (!cart.items.length) {
    return <div className="container-page py-10"><PageHeader title="Cart" /><EmptyState title="Your cart is empty." body="Add something from the catalogue to get started." action={<Link to="/products" className="btn-primary">Browse products</Link>} /></div>;
  }

  return (
    <div className="container-page py-10">
      <PageHeader title="Cart" sub={`${cart.count} item${cart.count === 1 ? '' : 's'}`}
        action={<button className="btn-ghost" onClick={cart.clear}>Clear cart</button>} />
      <div className="mb-5"><Alert kind="info">Each order covers one product, so you check out one cart item at a time. Stock is only held once you place an order.</Alert></div>
      {netErr && <div className="mb-5"><Alert kind="error">We could not refresh stock for some items. Availability will be checked again at checkout.</Alert></div>}
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {cart.items.map((l) => (
            <CartItem key={l.productId} line={l} unavailable={gone.has(l.productId)}
              onQty={(n) => cart.setQuantity(l.productId, n)} onRemove={() => cart.remove(l.productId)}
              onCheckout={() => nav('/checkout', { state: { productId: l.productId, quantity: l.quantity } })} />
          ))}
        </ul>
        <aside className="card h-fit p-5">
          <h2 className="text-lg font-bold">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatINR(cart.subtotal)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd className="font-display">{formatINR(cart.subtotal)}</dd></div>
          </dl>
          <p className="mt-3 flex items-center gap-2 text-xs text-muted">{checking && <Spinner className="h-3 w-3" />}{checking ? 'Checking stock...' : 'Prices and stock were just refreshed.'}</p>
        </aside>
      </div>
    </div>
  );
}
