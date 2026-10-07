import { Link } from 'react-router-dom';
import { formatINR } from '../utils/format';
import type { CartLine } from '../types';

export function QuantityStepper({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center rounded-md border border-line bg-white" role="group" aria-label={label}>
      <button type="button" className="px-3 py-2 text-lg leading-none disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">&minus;</button>
      <span className="min-w-8 text-center text-sm font-medium" aria-live="polite">{value}</span>
      <button type="button" className="px-3 py-2 text-lg leading-none disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">+</button>
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
    <li className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/products/${line.productId}`} className="font-bold hover:underline">{line.name}</Link>
          <p className="text-sm text-muted">{formatINR(line.price)} each</p>
          {unavailable && <p className="mt-1 text-xs font-medium text-red-700">This product is no longer available.</p>}
          {!unavailable && out && <p className="mt-1 text-xs font-medium text-red-700">Out of stock right now.</p>}
          {!unavailable && !out && over && <p className="mt-1 text-xs font-medium text-amber-700">Only {line.stock} in stock. Lower the quantity to continue.</p>}
        </div>
        <p className="font-display text-lg font-bold">{formatINR(line.price * line.quantity)}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <QuantityStepper value={line.quantity} max={Math.max(line.stock, 1)} onChange={onQty} label={`Quantity for ${line.name}`} />
        <div className="flex gap-2">
          <button className="btn-ghost text-red-700" onClick={onRemove}>Remove</button>
          <button className="btn-primary" onClick={onCheckout} disabled={blocked}>Checkout this item</button>
        </div>
      </div>
    </li>
  );
}
