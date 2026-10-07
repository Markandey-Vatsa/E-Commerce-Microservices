import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { clamp } from '../utils/format';
import type { CartLine, Product } from '../types';

interface CartValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  add: (p: Product, qty?: number) => void;
  setQuantity: (productId: number, qty: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
  syncSnapshots: (products: Product[]) => void;
}
const CartContext = createContext<CartValue | null>(null);

function load(key: string): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function CartInner({ storageKey, children }: { storageKey: string; children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => load(storageKey));
  useEffect(() => { try { localStorage.setItem(storageKey, JSON.stringify(items)); } catch { /* ignore */ } }, [items, storageKey]);

  const add = useCallback((p: Product, qty = 1) => {
    setItems((cur) => {
      const max = Math.max(p.stock, 0);
      if (max === 0) return cur;
      const existing = cur.find((l) => l.productId === p.id);
      if (existing) {
        return cur.map((l) => l.productId === p.id
          ? { ...l, price: p.price, stock: p.stock, quantity: clamp(l.quantity + qty, 1, max) } : l);
      }
      return [...cur, { productId: p.id, name: p.name, price: p.price, stock: p.stock, quantity: clamp(qty, 1, max), sellerEmail: p.sellerEmail }];
    });
  }, []);
  const setQuantity = useCallback((id: number, qty: number) =>
    setItems((cur) => cur.map((l) => l.productId === id ? { ...l, quantity: clamp(qty, 1, Math.max(l.stock, 1)) } : l)), []);
  const remove = useCallback((id: number) => setItems((cur) => cur.filter((l) => l.productId !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const syncSnapshots = useCallback((products: Product[]) => {
    const byId = new Map(products.map((p) => [p.id, p]));
    setItems((cur) => cur.map((l) => {
      const p = byId.get(l.productId);
      return p ? { ...l, name: p.name, price: p.price, stock: p.stock } : l;
    }));
  }, []);

  const value = useMemo<CartValue>(() => ({
    items,
    count: items.reduce((n, l) => n + l.quantity, 0),
    subtotal: items.reduce((n, l) => n + l.price * l.quantity, 0),
    add, setQuantity, remove, clear, syncSnapshots,
  }), [items, add, setQuantity, remove, clear, syncSnapshots]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** One cart per signed-in account (remounts on login/logout so carts never leak between users). */
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `mercato.cart.${user?.username || 'guest'}`;
  return <CartInner key={key} storageKey={key}>{children}</CartInner>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
