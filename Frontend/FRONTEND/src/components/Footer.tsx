import { Link } from 'react-router-dom';
import { Logo } from './Navbar';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-hair bg-surface">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-subtle">Stock is held for 30 minutes while you pay.</p>
        </div>
        <nav className="flex gap-6 text-sm font-semibold" aria-label="Footer">
          <Link to="/products" className="text-subtle hover:text-brand">Products</Link>
          <Link to="/cart" className="text-subtle hover:text-brand">Cart</Link>
          <Link to="/orders" className="text-subtle hover:text-brand">Orders</Link>
        </nav>
      </div>
    </footer>
  );
}
