const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });
export const formatINR = (n: number) => inr.format(Number.isFinite(Number(n)) ? Number(n) : 0);
export const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
export const initialOf = (s?: string | null) => ((s ?? '').trim()[0] ?? '?').toUpperCase();
