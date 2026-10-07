import { NavLink, Route, Routes } from 'react-router-dom';
import { Overview, ProductTable, ProductEditor } from './Parts';

export type Scope = 'seller' | 'admin';

export function DashboardShell({ scope }: { scope: Scope }) {
  const base = `/${scope}`;
  const title = scope === 'admin' ? 'Administration' : 'Seller dashboard';
  const items = [{ to: base, label: 'Overview', end: true }, { to: `${base}/products`, label: scope === 'admin' ? 'All products' : 'My products', end: false }, { to: `${base}/products/create`, label: 'New product', end: true }];
  const cls = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-ink text-white' : 'text-ink hover:bg-pine-tint'}`;
  return (
    <div className="container-page grid gap-6 py-8 md:grid-cols-[200px_1fr]">
      <aside className="md:sticky md:top-24 md:h-fit">
        <p className="mb-3 hidden font-display text-lg font-bold md:block">{title}</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label={title}>
          {items.map((i) => <NavLink key={i.to} to={i.to} end={i.end} className={cls}>{i.label}</NavLink>)}
        </nav>
      </aside>
      <div className="min-w-0">
        <Routes>
          <Route index element={<Overview scope={scope} />} />
          <Route path="products" element={<ProductTable scope={scope} />} />
          <Route path="products/create" element={<ProductEditor scope={scope} />} />
          <Route path="products/edit/:id" element={<ProductEditor scope={scope} />} />
          <Route path="*" element={<p className="text-muted">Page not found.</p>} />
        </Routes>
      </div>
    </div>
  );
}
