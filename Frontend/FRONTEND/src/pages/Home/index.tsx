import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

const TRUST = [
  ['Stock held for 30 minutes', 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  ['Pay securely with Razorpay', 'M12 3 4 6v5c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-3Zm-3 9 2.2 2.2L15.5 10'],
  ['Straight from the seller', 'M3 9l1.5-5h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6'],
];

/** A demo of a held order. The clock is illustrative: it shows what the 30 minute hold feels like. */
function HoldTicket() {
  const TOTAL = 30 * 60;
  const [left, setLeft] = useState(TOTAL - 19);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s <= 1 ? TOTAL : s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className="ticket-in relative mx-auto w-full max-w-sm text-fg" role="img" aria-label="Example of a held order: stock reserved for about 30 minutes while payment is pending">
      <div className="rounded-[28px] bg-surface p-7 pb-6 shadow-[0_30px_60px_-20px_rgba(10,6,70,.55)]">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-subtle">How a held order looks</p>
          <span className="chip bg-warn-tint text-warn"><span className="h-1.5 w-1.5 rounded-full bg-sun-deep" />Pending payment</span>
        </div>
        <div className="mt-6 flex items-center gap-6">
          <svg width="124" height="124" viewBox="0 0 124 124" className="shrink-0" aria-hidden>
            <circle cx="62" cy="62" r={R} fill="none" stroke="var(--hair)" strokeWidth="10" />
            <circle cx="62" cy="62" r={R} fill="none" stroke="var(--sun)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - left / TOTAL)} transform="rotate(-90 62 62)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            <text x="62" y="68" textAnchor="middle" className="font-display" fontSize="25" fontWeight="700" fill="var(--fg)">{mm}:{ss}</text>
          </svg>
          <div>
            <p className="font-display text-2xl font-bold leading-tight">Order in progress</p>
            <p className="mt-1.5 text-sm text-subtle">Stock reserved for you for about 30 minutes.</p>
          </div>
        </div>
      </div>
      {/* perforation */}
      <div className="relative h-0">
        <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-brand" aria-hidden />
        <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-brand" aria-hidden />
        <div className="mx-6 border-t-2 border-dashed border-hair" aria-hidden />
      </div>
      <div className="rounded-b-[28px] bg-surface px-7 pb-6 pt-5 text-sm text-subtle shadow-[0_30px_60px_-20px_rgba(10,6,70,.55)]">
        Pay to confirm. Unpaid reservations are released.
      </div>
    </div>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const { data, loading, error } = useAsync(getProducts, []);
  const featured = (data ?? []).filter((p) => p.stock > 0).slice(0, 4);

  const search = (e: FormEvent) => {
    e.preventDefault();
    nav(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products');
  };

  return (
    <>
      <section className="relative overflow-hidden bg-brand text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border-[70px] border-white/[0.06]" aria-hidden />
        <div className="pointer-events-none absolute -bottom-52 left-1/3 h-[420px] w-[420px] rounded-full bg-white/[0.05]" aria-hidden />
        <div className="container-page relative grid items-center gap-14 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
          <div>
            <h1 className="text-5xl font-bold leading-[1.02] sm:text-7xl">Buy it now.<br />We hold the stock while you pay.</h1>
            <p className="mt-6 max-w-lg text-lg text-white/80">Mercato connects shoppers directly to sellers. When you place an order, your items are reserved so nobody can buy them out from under you.</p>
            <form onSubmit={search} role="search" className="mt-9 flex max-w-xl items-center gap-2 rounded-full bg-surface p-1.5 pl-5 shadow-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--subtle)" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
              <label htmlFor="hero-q" className="sr-only">Search products</label>
              <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or description"
                className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-sm text-fg outline-none placeholder:text-subtle" />
              <button className="btn-sun">Search</button>
            </form>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <Link to="/products" className="font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white">Browse all products</Link>
              {!isAuthenticated && <Link to="/register" className="font-semibold underline decoration-white/40 underline-offset-4 hover:decoration-white">Sell on Mercato</Link>}
            </div>
          </div>
          <HoldTicket />
        </div>
      </section>

      <section className="border-b border-hair bg-surface">
        <ul className="container-page grid divide-hair sm:grid-cols-3 sm:divide-x">
          {TRUST.map(([t, d]) => (
            <li key={t} className="flex items-center gap-3 py-5 sm:justify-center">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-tint text-brand" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
              </span>
              <span className="text-sm font-semibold">{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="text-3xl font-bold">In stock now</h2>
          <Link to="/products" className="btn-secondary">All products</Link>
        </div>
        {loading ? <ProductGridSkeleton count={4} /> : error ? (
          <p className="panel p-8 text-sm text-subtle">{error.status === 401 ? <>Sign in to see the catalogue. <Link to="/login" className="font-semibold text-brand underline">Log in</Link></> : error.message}</p>
        ) : featured.length ? <ProductGrid products={featured} /> : <p className="panel p-8 text-sm text-subtle">No products available yet.</p>}
      </section>

      <section className="container-page pb-4">
        <div className="panel px-6 py-12 sm:px-12">
          <h2 className="text-3xl font-bold">How checkout works</h2>
          <ol className="relative mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <span className="absolute left-0 right-0 top-[19px] hidden border-t-2 border-dashed border-hair lg:block" aria-hidden />
            {STEPS.map(([t, b], i) => (
              <li key={t} className="relative">
                <span className={`relative grid h-10 w-10 place-items-center rounded-full font-display text-base font-bold ${i === 1 ? 'bg-sun text-fg' : 'bg-brand text-white'}`}>{i + 1}</span>
                <h3 className="mt-4 text-lg font-bold">{t}</h3>
                <p className="mt-1 text-sm text-subtle">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
