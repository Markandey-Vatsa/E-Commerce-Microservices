import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePayment, type PaymentPhase } from '../hooks/usePayment';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from './ui';

const COPY: Record<PaymentPhase, string> = {
  idle: 'Ready to pay.',
  preparing: 'Preparing payment...',
  opening: 'Opening payment gateway...',
  processing: 'Processing payment. Complete it in the Razorpay window.',
  verifying: 'Verifying payment with the server...',
  success: 'Payment successful.',
  failed: 'Payment failed.',
  verification_failed: 'Payment verification failed.',
};
const WORKING: PaymentPhase[] = ['preparing', 'opening', 'processing', 'verifying'];

export function PaymentPanel({ orderId, autoStart, onSuccess }: { orderId: string; autoStart?: boolean; onSuccess?: () => void }) {
  const { user } = useAuth();
  const { phase, message, start } = usePayment();
  const working = WORKING.includes(phase);

  useEffect(() => { if (autoStart) void start(orderId, { email: user?.username }); /* once */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { if (phase === 'success') onSuccess?.(); }, [phase, onSuccess]);

  return (
    <section className="card p-6" aria-live="polite">
      <h2 className="text-lg font-bold">Payment</h2>
      <p className="mt-1 flex items-center gap-2 text-sm">
        {working && <Spinner />}<span>{COPY[phase]}</span>
      </p>
      {phase === 'success' && <div className="mt-4"><Alert kind="success">The server confirmed your payment. Your order status will update shortly.</Alert></div>}
      {(phase === 'failed' || phase === 'verification_failed') && (
        <div className="mt-4 space-y-2">
          {message && <Alert kind="error">{message}</Alert>}
          {phase === 'verification_failed' && <p className="text-sm text-muted">If money left your account, do not pay again. Check the order status first.</p>}
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-3">
        {(phase === 'idle' || phase === 'failed') && (
          <button className="btn-primary" onClick={() => start(orderId, { email: user?.username })}>{phase === 'failed' ? 'Try payment again' : 'Pay now'}</button>
        )}
        <Link to={`/orders/${orderId}`} className="btn-secondary">View order</Link>
      </div>
    </section>
  );
}
