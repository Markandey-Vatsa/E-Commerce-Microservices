import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="10" fill="#4637D4" />
        <path d="M8 22V10.5l8 7.5 8-7.5V22" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="24" cy="8" r="3" fill="#FFB62E" />
      </svg>
      <span className={`font-display text-[22px] font-bold tracking-tight ${light ? 'text-white' : 'text-fg'}`}>Mercato</span>
    </span>
  );
}

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 4h2.2l2.1 11h10.1l2-8H6.2" /><circle cx="9" cy="19.5" r="1.3" /><circle cx="17" cy="19.5" r="1.3" />
  </svg>
);

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const nav = useNavigate();
  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const links: { to: string; label: string; badge?: number }[] = [{ to: '/', label: 'Home' }, { to: '/products', label: 'Products' }];
  if (isAuthenticated) links.push({ to: '/chat', label: 'AI Assistant' });
  if (user?.role === 'SELLER') links.push({ to: '/seller', label: 'Seller Dashboard' }, { to: '/seller/products', label: 'My Products' });
  if (user?.role === 'ADMIN') links.push({ to: '/admin', label: 'Admin Dashboard' });
  if (!user || user.role === 'CUSTOMER') links.push({ to: '/cart', label: 'Cart', badge: count });
  if (isAuthenticated) links.push({ to: '/orders', label: user?.role === 'CUSTOMER' ? 'My Orders' : 'Orders' }, { to: '/profile', label: 'Profile' });

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-brand-tint text-brand-ink' : 'text-fg hover:bg-brand-tint'}`;

  const badge = (n?: number) => !!n && (
    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-sun px-1.5 text-[11px] font-bold text-fg" aria-label={`${n} items`}>{n}</span>
  );

  const doLogout = () => { logout(); nav('/'); };

  return (
    <header className="sticky top-0 z-30 border-b border-hair bg-surface/85 backdrop-blur-md">
      <div className="container-page flex h-[68px] items-center justify-between gap-4">
        <Link to="/" aria-label="Mercato home"><Logo /></Link>
        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/' || l.to === '/seller' || l.to === '/admin'} className={linkCls}>
              {l.to === '/cart' && <CartIcon />}{l.label}{badge(l.badge)}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {isAuthenticated ? <button onClick={doLogout} className="btn-secondary">Logout</button> : (
            <><Link to="/login" className="btn-ghost">Log in</Link><Link to="/register" className="btn-primary">Create account</Link></>
          )}
        </div>
        <button className="btn-ghost !px-3 md:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            {open ? <path d="M4 4l12 12M16 4L4 16" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
          </svg>
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" className="border-t border-hair bg-surface px-4 pb-5 pt-3 md:hidden" aria-label="Mobile">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} className={linkCls}>
                {l.to === '/cart' && <CartIcon />}{l.label}{badge(l.badge)}
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
