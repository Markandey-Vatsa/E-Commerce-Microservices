import client from './client';
import type { Product, ProductInput, ProductUpdate } from '../types';

const clean = (p: Product): Product => ({
  ...p, name: p.name ?? 'Untitled product', description: p.description ?? '',
  price: Number(p.price) || 0, stock: Number(p.stock) || 0, sellerEmail: p.sellerEmail ?? '',
});
const list = (data: unknown): Product[] => (Array.isArray(data) ? (data as Product[]).filter(Boolean).map(clean) : []);

export const getProducts = () => client.get('/products/getProducts').then((r) => list(r.data));
export const getProduct = (id: string | number) => client.get<Product>(`/products/getProduct/${id}`).then((r) => clean(r.data));
export const getMyProducts = () => client.get('/products/my-products').then((r) => list(r.data));
// sellerEmail is never sent: the backend derives it from the JWT.
export const createProduct = (p: ProductInput) => client.post('/products/createProduct', p).then((r) => r.data);
export const updateProduct = (p: ProductUpdate) => client.put('/products/updateProduct', p).then((r) => r.data);
export const deleteProduct = (id: number) => client.delete(`/products/deleteProduct/${id}`).then((r) => r.data);
