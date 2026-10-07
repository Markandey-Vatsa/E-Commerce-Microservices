import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatINR, initialOf } from '../utils/format';
import type { Product } from '../types';

const TONES = ['#DCE8E2', '#E6E2D3', '#DBE2EB', '#EADFDF', '#E1DFEB', '#E2E8D6'];

/** The Product entity has no image field, so each product gets a typographic cover. */
export function ProductCover({ product, className = 'h-40' }: { product: Product; className?: string }) {
  return (
    <div className={`flex items-end justify-between p-4 ${className}`} style={{ backgroundColor: TONES[Math.abs(product.id) % TONES.length] }} aria-hidden>
      <span className="font-display text-6xl font-bold leading-none text-ink/80">{initialOf(product.name)}</span>
    </div>
  );
}

export function StockLabel({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="text-xs font-medium text-red-700">Out of stock</span>;
  if (stock <= 5) return <span className="text-xs font-medium text-amber-700">Only {stock} left</span>;
  return <span className="text-xs font-medium text-pine">In stock ({stock})</span>;
}

export const useCanShop = () => { const { user } = useAuth(); return !user || user.role === 'CUSTOMER'; };

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const toast = useToast();
  const canShop = useCanShop();
  const out = product.stock <= 0;
  return (
    <article className="card flex flex-col overflow-hidden">
      <Link to={`/products/${product.id}`} aria-label={`View ${product.name}`}><ProductCover product={product} /></Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-bold leading-snug"><Link to={`/products/${product.id}`} className="hover:underline">{product.name}</Link></h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{product.description}</p>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-display text-lg font-bold">{formatINR(product.price)}</span>
          <StockLabel stock={product.stock} />
        </div>
        <div className="mt-4 flex gap-2">
          <Link to={`/products/${product.id}`} className="btn-secondary flex-1">View details</Link>
          {canShop && (
            <button className="btn-primary flex-1" disabled={out}
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
