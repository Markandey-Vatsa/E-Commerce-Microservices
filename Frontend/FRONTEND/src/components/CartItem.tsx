import { Link } from 'react-router-dom';
import { formatINR } from '../utils/format';
import { ProductCover } from './ProductCard';
import type { CartLine } from '../types';

export function QuantityStepper({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  const btn = 'grid h-9 w-9 place-items-center rounded-full text-lg leading-none transition-colors hover:bg-brand-tint hover:text-brand-ink disabled:opacity-35 disabled:hover:bg-transparent';
  return (
    <div className="inline-flex items-center gap-1 rounded-full border-[1.5px] border-hair bg-surface p-0.5" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">&minus;</button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">+</button>
    </div>
  );
}

export function CartItem({ line, unavailable, onQty, onRemove, onCheckout }: {
  line: CartLine; unavailable?: boolean; onQty: (n: number) => void; onRemove: () => void; onCheckout: () => void;
}) {
  const over = line.quantity > line.stock;
  const out = line.stock <= 0;
  const blocked = unavailable || over || out;
  return (
    <li className="card flex gap-4 p-4 sm:gap-5 sm:p-5">
      <Link to={`/products/${line.productId}`} className="block h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-28 sm:w-28" aria-label={`View ${line.name}`}>
        <ProductCover product={{ id: line.productId, name: line.name }} className="h-full w-full !p-3 [&>span:last-child]:!text-5xl" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link to={`/products/${line.productId}`} className="text-lg font-bold hover:text-brand">{line.name}</Link>
            <p className="text-sm text-subtle">{formatINR(line.price)} each</p>
          </div>
          <p className="font-display text-xl font-bold">{formatINR(line.price * line.quantity)}</p>
        </div>
        {unavailable && <p className="mt-1 text-xs font-semibold text-danger">This product is no longer available.</p>}
        {!unavailable && out && <p className="mt-1 text-xs font-semibold text-danger">Out of stock right now.</p>}
        {!unavailable && !out && over && <p className="mt-1 text-xs font-semibold text-warn">Only {line.stock} in stock. Lower the quantity to continue.</p>}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
          <QuantityStepper value={line.quantity} max={Math.max(line.stock, 1)} onChange={onQty} label={`Quantity for ${line.name}`} />
          <div className="flex gap-1.5">
            <button className="btn-ghost !px-3.5 text-danger hover:!bg-danger-tint hover:!text-danger" onClick={onRemove}>Remove</button>
            <button className="btn-primary" onClick={onCheckout} disabled={blocked}>Checkout this item</button>
          </div>
        </div>
      </div>
    </li>
  );
}
