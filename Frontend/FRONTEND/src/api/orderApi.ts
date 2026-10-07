import client from './client';
import { normalizeOrders } from '../utils/order';
import type { CreateOrderResponse, Order, OrderRequest, PaymentInit } from '../types';

export const createOrder = (req: OrderRequest) => client.post<CreateOrderResponse>('/orders/createOrder', req).then((r) => r.data);
export const makePayment = (orderId: string) => client.post<PaymentInit>(`/orders/make-payment/${orderId}`).then((r) => r.data);
export const getOrder = (id: string) => client.get<Order>(`/orders/getOrder/${id}`).then((r) => r.data);
export const getMyOrders = (userId: number) => client.get(`/orders/my-order/${userId}`).then((r) => normalizeOrders(r.data));
// Internal endpoints (orderStatusConfirm) and deleteOrder are deliberately not exposed.
