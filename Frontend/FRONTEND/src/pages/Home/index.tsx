import { Link } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { ProductGrid } from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/ui';

const STEPS = [
  ['Choose', 'Pick a product and a quantity from any seller.'],
  ['We hold it', 'Placing the order reserves your stock for about 30 minutes.'],
  ['Pay', 'Complete payment securely in Razorpay.'],
  ['Server confirms', 'Your order moves forward only after the backend verifies the payment.'],
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data, loading, error } = useAsync(getProducts, []);
  const featured = (data ?? []).filter((p) => p.stock > 0).slice(0, 4);

  return (
    <>
      <section className="border-b border-line">
        <div className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.2fr_1fr] lg:py-20">
          <div>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-6xl">Buy it now.<br />We hold the stock while you pay.</h1>
            <p className="mt-5 max-w-lg text-lg text-muted">Mercato connects shoppers directly to sellers. When you place an order, your items are reserved so nobody can buy them out from under you.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary px-6 py-3">Browse products</Link>
              {!isAuthenticated && <Link to="/register" className="btn-secondary px-6 py-3">Sell on Mercato</Link>}
            </div>
          </div>
          <div className="card border-dashed p-6" aria-label="Example of a held order">
            <p className="text-sm text-muted">How a held order looks</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-display text-xl font-bold">Order in progress</span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800">Pending payment</span>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-line"><div className="h-full w-2/3 bg-pine" /></div>
            <p className="mt-2 text-sm text-muted">Stock reserved for you for about 30 minutes.</p>
            <div className="mt-5 border-t border-dashed border-line pt-4 text-sm text-muted">Pay to confirm. Unpaid reservations are released.</div>
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="mb-6 flex items-end justify-between"><h2 className="text-2xl font-bold">In stock now</h2><Link to="/products" className="text-sm font-medium text-pine underline">All products</Link></div>
        {loading ? <ProductGridSkeleton count={4} /> : error ? (
          <p className="card p-6 text-sm text-muted">{error.status === 401 ? <>Sign in to see the catalogue. <Link to="/login" className="text-pine underline">Log in</Link></> : error.message}</p>
        ) : featured.length ? <ProductGrid products={featured} /> : <p className="card p-6 text-sm text-muted">No products available yet.</p>}
      </section>

      <section className="border-t border-line bg-white">
        <div className="container-page py-14">
          <h2 className="text-2xl font-bold">How checkout works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, b], i) => (
              <li key={t}><span className="font-display text-sm font-bold text-pine">{i + 1}</span><h3 className="mt-1 text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-muted">{b}</p></li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
