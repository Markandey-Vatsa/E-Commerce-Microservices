import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts } from '../../api/productApi';
import { useAsync } from '../../hooks/useAsync';
import { ProductGrid } from '../../components/ProductCard';
import { EmptyState, ErrorState, PageHeader, ProductGridSkeleton } from '../../components/ui';

type Sort = 'default' | 'price-asc' | 'price-desc' | 'name' | 'stock';

export default function Products() {
  const { data, loading, error, reload } = useAsync(getProducts, []);
  const [params] = useSearchParams();
  const [q, setQ] = useState(params.get('q') ?? '');
  const [sort, setSort] = useState<Sort>('default');
  const [inStock, setInStock] = useState(false);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  // All search / sort / filter is client-side over GET /products/getProducts.
  const shown = useMemo(() => {
    let list = (data ?? []).filter((p) => {
      const t = q.trim().toLowerCase();
      if (t && !`${p.name} ${p.description}`.toLowerCase().includes(t)) return false;
      if (inStock && p.stock <= 0) return false;
      if (min !== '' && p.price < Number(min)) return false;
      if (max !== '' && p.price > Number(max)) return false;
      return true;
    });
    const by: Record<Sort, ((a: typeof list[number], b: typeof list[number]) => number) | null> = {
      default: null, 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name), stock: (a, b) => b.stock - a.stock,
    };
    const fn = by[sort];
    if (fn) list = [...list].sort(fn);
    return list;
  }, [data, q, sort, inStock, min, max]);

  const filtered = q || inStock || min || max;
  const clear = () => { setQ(''); setInStock(false); setMin(''); setMax(''); setSort('default'); };

  return (
    <div className="container-page py-10">
      <PageHeader title="Products" sub={data ? `${shown.length} of ${data.length} shown` : undefined} />
      <div className="panel mb-8 p-4 sm:p-5">
        <div className="relative">
          <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--subtle)" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <label htmlFor="q" className="sr-only">Search</label>
          <input id="q" type="search" className="input !rounded-full !py-3 !pl-11" placeholder="Search by name or description" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto_auto] lg:items-end">
          <div><label htmlFor="sort" className="label">Sort by</label>
            <select id="sort" className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
              <option value="default">Default</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option>
              <option value="name">Name</option><option value="stock">Most stock</option>
            </select></div>
          <div><label htmlFor="min" className="label">Min price</label><input id="min" inputMode="decimal" placeholder="0" className="input" value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d.]/g, ''))} /></div>
          <div><label htmlFor="max" className="label">Max price</label><input id="max" inputMode="decimal" placeholder="Any" className="input" value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d.]/g, ''))} /></div>
          <label className={`flex h-[44px] cursor-pointer items-center gap-2.5 rounded-full px-4 text-sm font-semibold transition-colors ${inStock ? 'bg-brand-tint text-brand-ink' : 'bg-canvas text-fg'}`}>
            <input type="checkbox" className="h-4 w-4 accent-[#4637D4]" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />In stock only
          </label>
          {filtered ? <button type="button" className="btn-ghost h-[44px]" onClick={clear}>Clear filters</button> : <span className="hidden lg:block" />}
        </div>
      </div>
      {loading ? <ProductGridSkeleton /> : error ? <ErrorState error={error} onRetry={reload} /> : !data?.length ? (
        <EmptyState title="No products available." body="Check back soon." />
      ) : !shown.length ? (
        <EmptyState title="No products match" body="Try a different search or loosen the filters." action={filtered ? <button className="btn-secondary" onClick={clear}>Clear filters</button> : undefined} />
      ) : <ProductGrid products={shown} />}
    </div>
  );
}
