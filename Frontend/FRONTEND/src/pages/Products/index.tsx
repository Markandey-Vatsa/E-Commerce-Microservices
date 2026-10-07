import { useMemo, useState } from 'react';
import { getProducts } from '../../api/productApi';
import { useAsync } from '../../hooks/useAsync';
import { ProductGrid } from '../../components/ProductCard';
import { EmptyState, ErrorState, PageHeader, ProductGridSkeleton } from '../../components/ui';

type Sort = 'default' | 'price-asc' | 'price-desc' | 'name' | 'stock';

export default function Products() {
  const { data, loading, error, reload } = useAsync(getProducts, []);
  const [q, setQ] = useState('');
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
      <div className="card mb-6 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end">
        <div><label htmlFor="q" className="label">Search</label><input id="q" type="search" className="input" placeholder="Name or description" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div><label htmlFor="sort" className="label">Sort by</label>
          <select id="sort" className="input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="default">Default</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option>
            <option value="name">Name</option><option value="stock">Most stock</option>
          </select></div>
        <div><label htmlFor="min" className="label">Min price</label><input id="min" inputMode="decimal" className="input" value={min} onChange={(e) => setMin(e.target.value.replace(/[^\d.]/g, ''))} /></div>
        <div><label htmlFor="max" className="label">Max price</label><input id="max" inputMode="decimal" className="input" value={max} onChange={(e) => setMax(e.target.value.replace(/[^\d.]/g, ''))} /></div>
        <label className="flex items-center gap-2 pb-2.5 text-sm"><input type="checkbox" className="accent-pine" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />In stock only</label>
      </div>
      {loading ? <ProductGridSkeleton /> : error ? <ErrorState error={error} onRetry={reload} /> : !data?.length ? (
        <EmptyState title="No products available." body="Check back soon." />
      ) : !shown.length ? (
        <EmptyState title="No products match" body="Try a different search or loosen the filters." action={filtered ? <button className="btn-secondary" onClick={clear}>Clear filters</button> : undefined} />
      ) : <ProductGrid products={shown} />}
    </div>
  );
}
