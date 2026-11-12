import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct } from '../../api/productApi';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { QuantityStepper } from '../../components/CartItem';
import { ProductCover, StockLabel, useCanShop } from '../../components/ProductCard';
import { ErrorState, Skeleton } from '../../components/ui';
import { formatINR } from '../../utils/format';

export default function ProductDetails() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const toast = useToast();
  const canShop = useCanShop();
  const { data: p, loading, error, reload } = useAsync(() => getProduct(id), [id]);
  const [qty, setQty] = useState(1);

  if (loading) return <div className="container-page grid gap-10 py-10 md:grid-cols-2"><Skeleton className="h-96 rounded-3xl" /><div className="space-y-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-20" /><Skeleton className="h-10 w-40" /></div></div>;
  if (error) return <div className="container-page py-10"><ErrorState error={error.status === 404 ? { message: 'This product could not be found. It may have been removed.', status: 404 } : error} onRetry={reload} /></div>;
  if (!p) return null;

  const out = p.stock <= 0;
  const q = Math.min(qty, Math.max(p.stock, 1));
  const owns = user?.role === 'SELLER' && user.username === p.sellerEmail;
  const base = user?.role === 'ADMIN' ? '/admin' : '/seller';

  return (
    <div className="container-page py-10">
      <Link to="/products" className="inline-flex items-center gap-1.5 text-sm font-semibold text-subtle hover:text-brand">&larr; All products</Link>
      <div className="mt-5 grid gap-10 md:grid-cols-2">
        <div className="overflow-hidden rounded-3xl md:sticky md:top-24 md:h-fit"><ProductCover product={p} className="h-80 !p-8 md:h-[460px] [&>span:last-child]:!text-[170px]" /></div>
        <div>
          <h1 className="text-4xl leading-tight sm:text-5xl">{p.name}</h1>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-canvas px-3 py-1 text-sm text-subtle">Sold by <span className="font-semibold text-fg">{p.sellerEmail}</span></p>
          <div className="mt-6 flex items-baseline gap-4">
            <p className="font-display text-4xl font-bold">{formatINR(p.price)}</p>
            <StockLabel stock={p.stock} />
          </div>
          <p className="mt-6 max-w-prose whitespace-pre-line leading-relaxed text-subtle">{p.description}</p>

          {canShop ? (
            <div className="panel mt-8 space-y-5 p-6">
              {out ? <p className="rounded-xl bg-danger-tint px-4 py-3 text-sm font-medium text-danger">This product is out of stock.</p> : (
                <>
                  <div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold">Quantity</span><QuantityStepper value={q} max={p.stock} onChange={setQty} label="Quantity" /></div>
                  {q >= p.stock && <p className="text-xs text-subtle">That is all we have in stock.</p>}
                  <div className="flex items-center justify-between border-t border-hair pt-5">
                    <span className="text-sm text-subtle">Total</span><span className="font-display text-2xl font-bold">{formatINR(p.price * q)}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-secondary flex-1 px-6 py-3" onClick={() => { cart.add(p, q); toast.success('Added to cart'); }}>Add to cart</button>
                    <button className="btn-sun flex-1 px-6 py-3" onClick={() => nav('/checkout', { state: { productId: p.id, quantity: q } })}>Buy now</button>
                  </div>
                  <p className="text-xs text-subtle">Placing an order reserves your stock for about 30 minutes while you pay.</p>
                </>
              )}
            </div>
          ) : (
            (user?.role === 'ADMIN' || owns) && <Link to={`${base}/products/edit/${p.id}`} className="btn-secondary mt-8">Edit this product</Link>
          )}
        </div>
      </div>
    </div>
  );
}
