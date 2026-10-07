import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createProduct, deleteProduct, getMyProducts, getProduct, getProducts, updateProduct } from '../../api/productApi';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ProductForm } from '../../components/ProductForm';
import { ConfirmationDialog, EmptyState, ErrorState, ListSkeleton, PageHeader, Skeleton } from '../../components/ui';
import { formatINR } from '../../utils/format';
import type { Product, ProductInput } from '../../types';
import type { Scope } from './Shell';

const load = (scope: Scope) => (scope === 'admin' ? getProducts() : getMyProducts());

export function Overview({ scope }: { scope: Scope }) {
  const { data, loading, error, reload } = useAsync(() => load(scope), [scope]);
  const base = `/${scope}`;
  const list = data ?? [];
  // All figures are derived on the client from the product list; no analytics API exists.
  const stats: [string, string][] = [
    ['Products', String(list.length)],
    ['Units in stock', String(list.reduce((n, p) => n + Math.max(p.stock, 0), 0))],
    ['Out of stock', String(list.filter((p) => p.stock <= 0).length)],
    ...(scope === 'admin' ? [['Sellers', String(new Set(list.map((p) => p.sellerEmail)).size)] as [string, string]] : [['Low stock (5 or fewer)', String(list.filter((p) => p.stock > 0 && p.stock <= 5).length)] as [string, string]]),
  ];
  const attention = list.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 5);
  return (
    <>
      <PageHeader title={scope === 'admin' ? 'Administration' : 'Seller dashboard'} action={<Link to={`${base}/products/create`} className="btn-primary">New product</Link>} />
      {loading ? <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div> : error ? <ErrorState error={error} onRetry={reload} /> : (
        <>
          <dl className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(([k, v]) => <div key={k} className="card p-4"><dt className="text-sm text-muted">{k}</dt><dd className="mt-1 font-display text-3xl font-bold">{v}</dd></div>)}
          </dl>
          <h2 className="mb-3 mt-10 text-lg font-bold">Needs attention</h2>
          {!attention.length ? <p className="card p-5 text-sm text-muted">{list.length ? 'Everything is well stocked.' : 'No products yet.'}</p> : (
            <ul className="card divide-y divide-line">
              {attention.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                  <span className="truncate font-medium">{p.name}</span>
                  <span className={p.stock <= 0 ? 'text-red-700' : 'text-amber-700'}>{p.stock <= 0 ? 'Out of stock' : `${p.stock} left`}</span>
                  <Link to={`${base}/products/edit/${p.id}`} className="text-pine underline">Edit</Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}

export function ProductTable({ scope }: { scope: Scope }) {
  const { data, loading, error, reload } = useAsync(() => load(scope), [scope]);
  const toast = useToast();
  const base = `/${scope}`;
  const [q, setQ] = useState('');
  const [target, setTarget] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const rows = (data ?? []).filter((p) => `${p.name} ${p.sellerEmail}`.toLowerCase().includes(q.trim().toLowerCase()));

  const confirmDelete = async () => {
    if (!target) return;
    setBusy(true);
    try { await deleteProduct(target.id); toast.success(`Deleted ${target.name}`); setTarget(null); reload(); }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Could not delete this product.'); }
    finally { setBusy(false); }
  };

  const actions = (p: Product) => (
    <div className="flex justify-end gap-2">
      <Link to={`${base}/products/edit/${p.id}`} className="btn-secondary px-3 py-1.5">Edit</Link>
      <button className="btn-ghost px-3 py-1.5 text-red-700" onClick={() => setTarget(p)}>Delete</button>
    </div>
  );

  return (
    <>
      <PageHeader title={scope === 'admin' ? 'All products' : 'My products'} action={<Link to={`${base}/products/create`} className="btn-primary">New product</Link>} />
      {loading ? <ListSkeleton /> : error ? <ErrorState error={error} onRetry={reload} /> : !data?.length ? (
        <EmptyState title={scope === 'admin' ? 'No products in the catalogue yet.' : "You haven't created any products yet."} body="Products you add appear in the catalogue straight away." action={<Link to={`${base}/products/create`} className="btn-primary">Create a product</Link>} />
      ) : (
        <>
          <input type="search" aria-label="Search products" placeholder={scope === 'admin' ? 'Search by name or seller' : 'Search by name'} className="input mb-4 max-w-sm" value={q} onChange={(e) => setQ(e.target.value)} />
          {!rows.length ? <EmptyState title="No products match your search." /> : (
            <>
              <div className="card hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-line text-muted"><tr>
                    <th className="px-4 py-3 font-medium">Product</th>{scope === 'admin' && <th className="px-4 py-3 font-medium">Seller</th>}
                    <th className="px-4 py-3 font-medium">Price</th><th className="px-4 py-3 font-medium">Stock</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th>
                  </tr></thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        {scope === 'admin' && <td className="px-4 py-3 text-muted">{p.sellerEmail}</td>}
                        <td className="px-4 py-3">{formatINR(p.price)}</td>
                        <td className={`px-4 py-3 ${p.stock <= 0 ? 'font-medium text-red-700' : ''}`}>{p.stock <= 0 ? 'Out of stock' : p.stock}</td>
                        <td className="px-4 py-3">{actions(p)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ul className="space-y-3 md:hidden">
                {rows.map((p) => (
                  <li key={p.id} className="card p-4">
                    <p className="font-bold">{p.name}</p>
                    {scope === 'admin' && <p className="text-xs text-muted">{p.sellerEmail}</p>}
                    <p className="mt-1 text-sm">{formatINR(p.price)} &middot; {p.stock <= 0 ? <span className="text-red-700">Out of stock</span> : `${p.stock} in stock`}</p>
                    <div className="mt-3">{actions(p)}</div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
      <ConfirmationDialog open={!!target} busy={busy} title="Delete this product?" confirmLabel="Delete product"
        body={`"${target?.name ?? ''}" will be removed from the catalogue. This cannot be undone.`} onConfirm={confirmDelete} onCancel={() => setTarget(null)} />
    </>
  );
}

export function ProductEditor({ scope }: { scope: Scope }) {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const base = `/${scope}`;
  const { data: product, loading, error, reload } = useAsync(() => (id ? getProduct(id) : Promise.resolve(null)), [id]);
  const [saving, setSaving] = useState(false);

  const save = async (v: ProductInput) => {
    setSaving(true);
    try {
      if (editing && product) { await updateProduct({ id: product.id, ...v }); toast.success('Product updated'); }
      else { await createProduct(v); toast.success('Product created'); }
      nav(`${base}/products`);
    } catch (e) { toast.error(e instanceof Error ? e.message : 'Could not save this product.'); }
    finally { setSaving(false); }
  };

  const notOwner = editing && scope === 'seller' && !!product && product.sellerEmail !== user?.username;
  return (
    <>
      <PageHeader title={editing ? 'Edit product' : 'New product'} sub={editing ? undefined : 'The seller is set automatically from your account.'} />
      {editing && loading ? <ListSkeleton rows={3} /> : editing && error ? <ErrorState error={error.status === 404 ? { message: 'Product not found.', status: 404 } : error} onRetry={reload} /> :
        notOwner ? <EmptyState title="You can only edit your own products." action={<Link to={`${base}/products`} className="btn-secondary">Back to my products</Link>} /> : (
          <ProductForm key={product?.id ?? 'new'} initial={product ? { name: product.name, description: product.description, price: product.price, stock: product.stock } : undefined}
            submitLabel={editing ? 'Save changes' : 'Create product'} submitting={saving} cancelTo={`${base}/products`} onSubmit={save} />
        )}
    </>
  );
}
