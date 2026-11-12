import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR, initialOf } from '../utils/format';
import type { Product } from '../types';

// [tile background, shape colour]. Each product keeps the same pair, picked from its id.
const TONES: [string, string][] = [
  ['#DDDAFF', '#4637D4'], ['#FFE6AE', '#F2A413'], ['#FFD9CF', '#E5533D'],
  ['#CFF2E4', '#0F7B5F'], ['#D3E8FF', '#2272DB'], ['#F8D5EB', '#BA3590'],
];

/** The Product entity has no image field, so each product gets a typographic cover. */
export function ProductCover({ product, className = 'h-44' }: { product: Pick<Product, 'id' | 'name'>; className?: string }) {
  const n = Math.abs(product.id);
  const [bg, shape] = TONES[n % TONES.length];
  const variant = n % 3;
  return (
    <div className={`relative flex items-end overflow-hidden p-5 ${className}`} style={{ backgroundColor: bg }} aria-hidden>
      {variant === 0 && <span className="absolute -right-8 -top-8 h-36 w-36 rounded-full" style={{ backgroundColor: shape, opacity: .92 }} />}
      {variant === 1 && <span className="absolute -right-2 top-0 h-full w-1/3" style={{ backgroundImage: `repeating-linear-gradient(135deg, ${shape} 0 6px, transparent 6px 16px)`, opacity: .85 }} />}
      {variant === 2 && <span className="absolute -right-10 bottom-[-40px] h-40 w-40 rotate-45 rounded-3xl" style={{ backgroundColor: shape, opacity: .9 }} />}
      <span className="relative font-display text-7xl font-bold leading-[.8] text-fg">{initialOf(product.name)}</span>
    </div>
  );
}

export function StockLabel({ stock }: { stock: number }) {
  const [cls, dot, text] = stock <= 0 ? ['text-danger', 'bg-danger', 'Out of stock']
    : stock <= 5 ? ['text-warn', 'bg-sun-deep', `Only ${stock} left`]
    : ['text-ok', 'bg-ok', `In stock (${stock})`];
  return <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${cls}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden />{text}</span>;
}

export const useCanShop = () => { const { user } = useAuth(); return !user || user.role === 'CUSTOMER'; };

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const toast = useToast();
  const canShop = useCanShop();
  const out = product.stock <= 0;
  return (
    <article className="card lift flex flex-col overflow-hidden">
      <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`} className="relative block">
        <div className={out ? 'opacity-50 saturate-50' : ''}><ProductCover product={product} /></div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-snug"><Link to={`/products/${product.id}`} className="hover:text-brand">{product.name}</Link></h3>
        <p className="mt-1 line-clamp-2 text-sm text-subtle">{product.description}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="font-display text-xl font-bold">{formatINR(product.price)}</span>
          <StockLabel stock={product.stock} />
        </div>
        <div className="mt-5 flex gap-2">
          <Link to={`/products/${product.id}`} className="btn-secondary flex-1 !px-3">Details</Link>
          {canShop && (
            <button className="btn-primary flex-1 !px-3" disabled={out}
              onClick={() => { cart.add(product, 1); toast.success(`${product.name} added to cart`); }}>
              Add to cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
