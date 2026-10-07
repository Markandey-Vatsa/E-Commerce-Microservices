import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { getProduct } from '../../api/productApi';
import { createOrder } from '../../api/orderApi';
import { ApiError } from '../../api/client';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { PaymentPanel } from '../../components/PaymentPanel';
import { QuantityStepper } from '../../components/CartItem';
import { Alert, ErrorState, Field, Skeleton, Spinner } from '../../components/ui';
import { UserIdLimitation } from '../Orders';
import { formatINR } from '../../utils/format';
import type { DeliveryAddress } from '../../types';

const EMPTY: DeliveryAddress = { houseNumber: '', street: '', city: '', state: '', postalCode: '' };
const FIELDS: [keyof DeliveryAddress, string, string][] = [
  ['houseNumber', 'House number', 'address-line2'], ['street', 'Street', 'address-line1'],
  ['city', 'City', 'address-level2'], ['state', 'State', 'address-level1'], ['postalCode', 'Postal code', 'postal-code'],
];

export default function Checkout() {
  const st = useLocation().state as { productId?: number; quantity?: number } | null;
  const { user } = useAuth();
  const cart = useCart();
  const productId = st?.productId;
  const { data: p, loading, error, reload } = useAsync(() => getProduct(productId ?? 0), [productId]);
  const [qty, setQty] = useState(st?.quantity ?? 1);
  const [addr, setAddr] = useState<DeliveryAddress>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof DeliveryAddress, string>>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!productId) return <Navigate to="/cart" replace />;
  if (loading) return <div className="container-page grid gap-6 py-10 md:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-64" /></div>;
  if (error) return <div className="container-page py-10"><ErrorState error={error} onRetry={reload} /></div>;
  if (!p) return null;

  const q = Math.min(Math.max(qty, 1), Math.max(p.stock, 1));
  const insufficient = p.stock <= 0 || q > p.stock;
  const total = p.price * q;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (user?.userId == null) return;
    const er: typeof errors = {};
    FIELDS.forEach(([k, label]) => { if (!addr[k].trim()) er[k] = `Enter ${label.toLowerCase()}.`; });
    if (addr.postalCode && !/^\d{6}$/.test(addr.postalCode.trim())) er.postalCode = 'Enter a 6-digit postal code.';
    setErrors(er); setApiError(null);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const res = await createOrder({
        userId: user.userId, productId: p.id, quantity: q,
        deliveryAddressDTO: Object.fromEntries(Object.entries(addr).map(([k, v]) => [k, v.trim()])) as unknown as DeliveryAddress,
      });
      if (!res.success || !res.orderId) { setApiError(res.message || 'We could not place this order.'); return; }
      cart.remove(p.id);
      setOrderId(res.orderId);
    } catch (x) {
      const err = x as ApiError;
      setApiError(err.status === 409
        ? 'The quantity you asked for is no longer available. Lower the quantity or pick another product, then try again.'
        : err.message);
      reload();   // refresh the stock figure shown on this page
    } finally { setBusy(false); }
  };

  if (orderId) {
    return (
      <div className="container-page max-w-2xl py-10">
        <h1 className="text-3xl font-bold">Order placed</h1>
        <p className="mt-2 text-sm text-muted">Your stock is reserved for about 30 minutes. Complete payment to confirm the order.</p>
        <p className="mt-4 text-sm">Order <span className="font-mono">{orderId}</span> &middot; {p.name} &times; {q} &middot; {formatINR(total)}</p>
        <div className="mt-6"><PaymentPanel orderId={orderId} autoStart /></div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-6 text-3xl font-bold">Checkout</h1>
      {user?.userId == null && <div className="mb-6"><UserIdLimitation /></div>}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="card space-y-4 p-6" noValidate>
          <h2 className="text-lg font-bold">Delivery address</h2>
          {apiError && <Alert kind="error">{apiError}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map(([k, label, ac]) => (
              <Field key={k} label={label} htmlFor={`a-${k}`} error={errors[k]}>
                <input id={`a-${k}`} autoComplete={ac} className="input" value={addr[k]} disabled={busy}
                  inputMode={k === 'postalCode' ? 'numeric' : undefined} onChange={(e) => setAddr((a) => ({ ...a, [k]: e.target.value }))} />
              </Field>
            ))}
          </div>
          <button className="btn-primary w-full sm:w-auto" disabled={busy || insufficient || user?.userId == null}>
            {busy && <Spinner />}Place order
          </button>
        </form>

        <aside className="card h-fit p-6">
          <h2 className="text-lg font-bold">Order summary</h2>
          <p className="mt-4 font-medium">{p.name}</p>
          <p className="text-sm text-muted">{formatINR(p.price)} each</p>
          <div className="mt-4"><QuantityStepper value={q} max={Math.max(p.stock, 1)} onChange={setQty} label="Quantity" /></div>
          {insufficient && <p className="mt-3 text-sm text-red-700">{p.stock <= 0 ? 'This product is out of stock.' : `Only ${p.stock} in stock.`}</p>}
          <div className="mt-5 flex justify-between border-t border-line pt-4 font-bold"><span>Total</span><span className="font-display">{formatINR(total)}</span></div>
          <p className="mt-3 text-xs text-muted">Placing the order reserves your stock. The final amount is confirmed by the server at payment.</p>
          <Link to="/cart" className="mt-4 inline-block text-sm text-pine underline">Back to cart</Link>
        </aside>
      </div>
    </div>
  );
}
