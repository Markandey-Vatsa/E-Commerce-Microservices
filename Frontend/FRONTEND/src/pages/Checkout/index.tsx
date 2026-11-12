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
import { ProductCover } from '../../components/ProductCard';
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
  if (loading) return <div className="container-page grid gap-6 py-10 md:grid-cols-2"><Skeleton className="h-96 rounded-3xl" /><Skeleton className="h-64 rounded-3xl" /></div>;
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
        <span className="chip bg-ok-tint text-ok"><span className="h-1.5 w-1.5 rounded-full bg-ok" />Stock reserved</span>
        <h1 className="mt-3 text-4xl">Order placed</h1>
        <p className="mt-2 text-sm text-subtle">Your stock is reserved for about 30 minutes. Complete payment to confirm the order.</p>
        <p className="panel mt-5 px-5 py-4 text-sm">Order <span className="font-mono font-medium">{orderId}</span> &middot; {p.name} &times; {q} &middot; <span className="font-semibold">{formatINR(total)}</span></p>
        <div className="mt-6"><PaymentPanel orderId={orderId} autoStart /></div>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-4xl">Checkout</h1>
      {user?.userId == null && <div className="mb-6"><UserIdLimitation /></div>}
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="panel space-y-5 p-7" noValidate>
          <h2 className="text-xl font-bold">Delivery address</h2>
          {apiError && <Alert kind="error">{apiError}</Alert>}
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map(([k, label, ac]) => (
              <Field key={k} label={label} htmlFor={`a-${k}`} error={errors[k]}>
                <input id={`a-${k}`} autoComplete={ac} className="input" value={addr[k]} disabled={busy}
                  inputMode={k === 'postalCode' ? 'numeric' : undefined} onChange={(e) => setAddr((a) => ({ ...a, [k]: e.target.value }))} />
              </Field>
            ))}
          </div>
          <button className="btn-sun w-full px-8 py-3 sm:w-auto" disabled={busy || insufficient || user?.userId == null}>
            {busy && <Spinner />}Place order
          </button>
        </form>

        <aside className="panel p-7 lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">Order summary</h2>
          <div className="mt-5 flex gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl"><ProductCover product={p} className="h-full w-full !p-2 [&>span:last-child]:!text-3xl" /></div>
            <div className="min-w-0"><p className="font-semibold leading-snug">{p.name}</p><p className="text-sm text-subtle">{formatINR(p.price)} each</p></div>
          </div>
          <div className="mt-5"><QuantityStepper value={q} max={Math.max(p.stock, 1)} onChange={setQty} label="Quantity" /></div>
          {insufficient && <p className="mt-3 text-sm font-medium text-danger">{p.stock <= 0 ? 'This product is out of stock.' : `Only ${p.stock} in stock.`}</p>}
          <div className="mt-6 flex items-baseline justify-between border-t border-hair pt-5 font-bold"><span>Total</span><span className="font-display text-2xl">{formatINR(total)}</span></div>
          <p className="mt-3 text-xs text-subtle">Placing the order reserves your stock. The final amount is confirmed by the server at payment.</p>
          <Link to="/cart" className="mt-4 inline-block text-sm font-semibold text-brand underline">Back to cart</Link>
        </aside>
      </div>
    </div>
  );
}
