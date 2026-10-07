import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Field, Spinner } from './ui';
import type { ProductInput } from '../types';

export function ProductForm({ initial, submitLabel, submitting, cancelTo, onSubmit }: {
  initial?: ProductInput; submitLabel: string; submitting: boolean; cancelTo: string; onSubmit: (v: ProductInput) => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [stock, setStock] = useState(initial ? String(initial.stock) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!name.trim()) er.name = 'Enter a product name.'; else if (name.length > 120) er.name = 'Keep the name under 120 characters.';
    if (!description.trim()) er.description = 'Add a short description.'; else if (description.length > 1000) er.description = 'Keep the description under 1000 characters.';
    const p = Number(price); if (price === '' || !Number.isFinite(p) || p <= 0) er.price = 'Enter a price greater than 0.';
    const s = Number(stock); if (stock === '' || !Number.isInteger(s) || s < 0) er.stock = 'Enter a whole number, 0 or more.';
    setErrors(er);
    if (Object.keys(er).length) return;
    onSubmit({ name: name.trim(), description: description.trim(), price: Math.round(p * 100) / 100, stock: s });
  };

  return (
    <form onSubmit={submit} className="card max-w-2xl space-y-5 p-6" noValidate>
      <Field label="Name" htmlFor="pf-name" error={errors.name}>
        <input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={submitting} />
      </Field>
      <Field label="Description" htmlFor="pf-desc" error={errors.description}>
        <textarea id="pf-desc" rows={4} className="input" value={description} onChange={(e) => setDescription(e.target.value)} disabled={submitting} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Price (INR)" htmlFor="pf-price" error={errors.price}>
          <input id="pf-price" inputMode="decimal" className="input" value={price} onChange={(e) => setPrice(e.target.value)} disabled={submitting} />
        </Field>
        <Field label="Stock" htmlFor="pf-stock" error={errors.stock}>
          <input id="pf-stock" inputMode="numeric" className="input" value={stock} onChange={(e) => setStock(e.target.value)} disabled={submitting} />
        </Field>
      </div>
      <div className="flex justify-end gap-3">
        <Link to={cancelTo} className="btn-secondary">Cancel</Link>
        <button className="btn-primary" disabled={submitting}>{submitting && <Spinner />}{submitLabel}</button>
      </div>
    </form>
  );
}
