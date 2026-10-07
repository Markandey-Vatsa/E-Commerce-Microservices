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

  if (loading) return <div className="container-page grid gap-8 py-10 md:grid-cols-2"><Skeleton className="h-80" /><div className="space-y-4"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-20" /><Skeleton className="h-10 w-40" /></div></div>;
  if (error) return <div className="container-page py-10"><ErrorState error={error.status === 404 ? { message: 'This product could not be found. It may have been removed.', status: 404 } : error} onRetry={reload} /></div>;
  if (!p) return null;

  const out = p.stock <= 0;
  const q = Math.min(qty, Math.max(p.stock, 1));
  const owns = user?.role === 'SELLER' && user.username === p.sellerEmail;
  const base = user?.role === 'ADMIN' ? '/admin' : '/seller';

  return (
    <div className="container-page py-10">
      <Link to="/products" className="text-sm text-muted hover:text-ink">&larr; All products</Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="card overflow-hidden"><ProductCover product={p} className="h-80" /></div>
        <div>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <p className="mt-1 text-sm text-muted">Sold by {p.sellerEmail}</p>
          <p className="mt-4 font-display text-3xl font-bold">{formatINR(p.price)}</p>
          <div className="mt-2"><StockLabel stock={p.stock} /></div>
          <p className="mt-5 whitespace-pre-line text-muted">{p.description}</p>

          {canShop ? (
            <div className="mt-8 space-y-4">
              {out ? <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">This product is out of stock.</p> : (
                <>
                  <div className="flex items-center gap-3"><span className="text-sm font-medium">Quantity</span><QuantityStepper value={q} max={p.stock} onChange={setQty} label="Quantity" /></div>
                  {q >= p.stock && <p className="text-xs text-muted">That is all we have in stock.</p>}
                  <div className="flex flex-wrap gap-3">
                    <button className="btn-secondary px-6" onClick={() => { cart.add(p, q); toast.success('Added to cart'); }}>Add to cart</button>
                    <button className="btn-primary px-6" onClick={() => nav('/checkout', { state: { productId: p.id, quantity: q } })}>Buy now</button>
                  </div>
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
