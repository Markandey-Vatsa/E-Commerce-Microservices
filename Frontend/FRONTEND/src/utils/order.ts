import type { DeliveryAddress, Order } from '../types';

const first = (o: Order, keys: string[]): unknown => {
  for (const k of keys) { const v = o[k]; if (v !== undefined && v !== null && v !== '') return v; }
  return undefined;
};
const ID = ['id', 'orderId', 'order_id'];
const STATUS = ['status', 'orderStatus', 'order_status'];
const QTY = ['quantity', 'qty'];
const AMOUNT = ['totalPrice', 'totalAmount', 'amount', 'price', 'total'];
const PRODUCT = ['productId', 'product_id'];
const ADDRESS = ['deliveryAddressDTO', 'deliveryAddress', 'address'];

export const getOrderId = (o: Order) => String(first(o, ID) ?? '');
export const getStatus = (o: Order) => String(first(o, STATUS) ?? 'UNKNOWN').toUpperCase();
export const getQuantity = (o: Order) => { const n = Number(first(o, QTY)); return Number.isFinite(n) && n > 0 ? n : undefined; };
export const getAmount = (o: Order) => { const v = first(o, AMOUNT); const n = Number(v); return v !== undefined && Number.isFinite(n) ? n : undefined; };
export const getProductId = (o: Order) => { const v = first(o, PRODUCT); return v !== undefined ? String(v) : undefined; };
export const getAddress = (o: Order): Partial<DeliveryAddress> | undefined => {
  const a = first(o, ADDRESS);
  return a && typeof a === 'object' ? (a as Partial<DeliveryAddress>) : undefined;
};

const KNOWN = new Set([...ID, ...STATUS, ...QTY, ...AMOUNT, ...PRODUCT, ...ADDRESS]);
/** Scalar fields the backend returned that we don't have a dedicated slot for. */
export const extraFields = (o: Order): [string, string][] =>
  Object.entries(o)
    .filter(([k, v]) => !KNOWN.has(k) && v !== null && v !== undefined && typeof v !== 'object')
    .map(([k, v]) => [k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(), String(v)]);

export function normalizeOrders(data: unknown): Order[] {
  if (Array.isArray(data)) return data as Order[];
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    const list = d.orders ?? d.content ?? d.data;
    if (Array.isArray(list)) return list as Order[];
  }
  return [];
}
