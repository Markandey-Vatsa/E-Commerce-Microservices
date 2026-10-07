import client from './client';
import type { VerifyPaymentRequest } from '../types';

/** Backend verification is authoritative. Never call /payments/webhook or /payments/create from the browser. */
export const verifyPayment = (body: VerifyPaymentRequest) =>
  client.post('/payments/verify', body).then((r) => (r.data ?? {}) as Record<string, unknown>);
