import { Link } from 'react-router-dom';
import { ProductCover, StockLabel } from '../ProductCard';
import { formatINR } from '../../utils/format';
import type { ChatProduct } from '../../types';

/** Compact recommendation card. Shows only the fields the backend returned; nothing is invented. */
export function ChatProductCard({ product }: { product: ChatProduct }) {
  const { id, name, description, price, stock } = product;
  return (
    <article className="card lift flex w-full flex-col overflow-hidden sm:w-[220px] sm:shrink-0">
      <Link to={`/products/${id}`} aria-label={`View ${name}`} className="block">
        <div className={stock !== undefined && stock <= 0 ? 'opacity-50 saturate-50' : ''}>
          <ProductCover product={{ id, name }} className="h-24 !p-4 [&>span:last-child]:!text-5xl" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="line-clamp-2 text-sm font-bold leading-snug">{name}</h4>
        {description && <p className="mt-1 line-clamp-2 text-xs text-subtle">{description}</p>}
        {(price !== undefined || stock !== undefined) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            {price !== undefined && <span className="font-display text-base font-bold">{formatINR(price)}</span>}
            {stock !== undefined && <StockLabel stock={stock} />}
          </div>
        )}
        <Link to={`/products/${id}`} className="btn-secondary mt-4 !py-2 text-xs">View product</Link>
      </div>
    </article>
  );
}
