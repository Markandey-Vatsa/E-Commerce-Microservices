import { useCallback, useRef, useState } from 'react';
import { makePayment } from '../api/orderApi';
import { verifyPayment } from '../api/paymentApi';
import { ApiError } from '../api/client';

export type PaymentPhase =
  | 'idle' | 'preparing' | 'opening' | 'processing' | 'verifying' | 'success' | 'failed' | 'verification_failed';

declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance } }
interface RazorpayInstance { open: () => void; on: (evt: string, cb: (r: { error?: { description?: string } }) => void) => void }
interface RazorpayResponse { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }

const SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';
function loadSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement('script');
    s.src = SDK_URL; s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('sdk'));
    document.body.appendChild(s);
  });
}

export function usePayment() {
  const [phase, setPhase] = useState<PaymentPhase>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const busy = useRef(false);        // blocks re-entry while a payment attempt is live
  const verifying = useRef(false);   // blocks duplicate verification submissions
  const settled = useRef(false);     // handler fired; ignore ondismiss

  const start = useCallback(async (orderId: string, prefill?: { email?: string }) => {
    if (busy.current) return;
    busy.current = true; verifying.current = false; settled.current = false;
    setMessage(null);
    try {
      setPhase('preparing');
      const [init] = await Promise.all([makePayment(orderId), loadSdk()]);
      if (!window.Razorpay) throw new Error('sdk');
      setPhase('opening');

      const rzp = new window.Razorpay({
        key: init.keyId, amount: init.amount, currency: init.currency, order_id: init.razorpayOrderId,
        name: 'Mercato', description: `Order ${orderId}`, prefill: { email: prefill?.email },
        theme: { color: '#0E5A4B' },
        handler: async (resp: RazorpayResponse) => {
          if (verifying.current) return;          // never verify twice
          verifying.current = true; settled.current = true;
          setPhase('verifying');
          try {
            const r = await verifyPayment({
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            });
            const rejected = r.verified === false || r.success === false || String(r.status ?? '').toUpperCase() === 'FAILED';
            if (rejected) {
              setPhase('verification_failed');
              setMessage(typeof r.message === 'string' ? r.message : 'We could not verify this payment.');
            } else {
              setPhase('success');
            }
          } catch (e) {
            setPhase('verification_failed');
            setMessage(e instanceof ApiError ? e.message : 'We could not verify this payment.');
          } finally { busy.current = false; }
        },
        modal: {
          ondismiss: () => {
            if (settled.current) return;
            busy.current = false;
            setPhase('failed');
            setMessage('Payment was cancelled. Your order is still waiting for payment.');
          },
        },
      });
      rzp.on('payment.failed', (r) => {
        setPhase('failed');
        setMessage(r.error?.description ?? 'The payment did not go through.');
      });
      rzp.open();
      setPhase('processing');
    } catch (e) {
      busy.current = false;
      setPhase('failed');
      setMessage(e instanceof ApiError ? e.message
        : 'The payment gateway could not be loaded. Check your connection and try again.');
    }
  }, []);

  const reset = useCallback(() => { busy.current = false; setPhase('idle'); setMessage(null); }, []);
  return { phase, message, start, reset };
}
