import { Link } from 'react-router-dom';
export function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="container-page flex flex-col gap-3 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p><span className="font-display font-bold text-ink">Mercato</span> &middot; Stock is held for 30 minutes while you pay.</p>
        <div className="flex gap-4"><Link to="/products" className="hover:text-ink">Products</Link><Link to="/orders" className="hover:text-ink">Orders</Link></div>
      </div>
    </footer>
  );
}
