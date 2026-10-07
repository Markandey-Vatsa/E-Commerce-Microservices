import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const links: { to: string; label: string; badge?: number }[] = [{ to: '/', label: 'Home' }, { to: '/products', label: 'Products' }];
  if (user?.role === 'SELLER') links.push({ to: '/seller', label: 'Seller Dashboard' }, { to: '/seller/products', label: 'My Products' });
  if (user?.role === 'ADMIN') links.push({ to: '/admin', label: 'Admin Dashboard' });
  if (!user || user.role === 'CUSTOMER') links.push({ to: '/cart', label: 'Cart', badge: count });
  if (isAuthenticated) links.push({ to: '/orders', label: user?.role === 'CUSTOMER' ? 'My Orders' : 'Orders' }, { to: '/profile', label: 'Profile' });

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-pine-tint text-pine-dark' : 'text-ink hover:bg-pine-tint'}`;

  const doLogout = () => { logout(); nav('/'); };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-tight">Mercato</Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/' || l.to === '/seller' || l.to === '/admin'} className={linkCls}>
              {l.label}
              {!!l.badge && <span className="rounded-full bg-pine px-1.5 text-xs text-white" aria-label={`${l.badge} items`}>{l.badge}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? <button onClick={doLogout} className="btn-secondary">Logout</button> : (
            <><Link to="/login" className="btn-ghost">Log in</Link><Link to="/register" className="btn-primary">Create account</Link></>
          )}
        </div>
        <button className="btn-ghost md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-line bg-paper px-4 pb-4 pt-2 md:hidden" aria-label="Mobile">
          <div className="flex flex-col">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkCls}>
                {l.label}{!!l.badge && <span className="rounded-full bg-pine px-1.5 text-xs text-white">{l.badge}</span>}
              </NavLink>
            ))}
            <div className="mt-3 flex gap-2">
              {isAuthenticated ? <button onClick={doLogout} className="btn-secondary w-full">Logout</button> : (
                <><Link to="/login" className="btn-secondary flex-1">Log in</Link><Link to="/register" className="btn-primary flex-1">Create account</Link></>
              )}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
