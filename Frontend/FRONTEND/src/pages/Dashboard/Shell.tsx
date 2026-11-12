import { NavLink, Route, Routes } from 'react-router-dom';
import { Overview, ProductTable, ProductEditor } from './Parts';

export type Scope = 'seller' | 'admin';

export function DashboardShell({ scope }: { scope: Scope }) {
  const base = `/${scope}`;
  const title = scope === 'admin' ? 'Administration' : 'Seller dashboard';
  const items = [{ to: base, label: 'Overview', end: true }, { to: `${base}/products`, label: scope === 'admin' ? 'All products' : 'My products', end: false }, { to: `${base}/products/create`, label: 'New product', end: true }];
  const cls = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-brand text-white' : 'text-fg hover:bg-brand-tint'}`;
  return (
    <div className="container-page grid gap-8 py-10 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-24 md:h-fit">
        <p className="mb-4 hidden px-1 font-display text-xl font-bold md:block">{title}</p>
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
          <Route path="*" element={<p className="text-subtle">Page not found.</p>} />
        </Routes>
      </div>
    </div>
  );
}
