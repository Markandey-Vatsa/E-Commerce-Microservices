import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword, verifyOtp } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { Alert, Field, Spinner } from '../../components/ui';
import { AuthLayout, isEmail } from './AuthLayout';

const STEPS = ['Email', 'Code', 'New password'];
function Steps({ current }: { current: number }) {
  return (
    <ol className="mb-5 flex gap-2 text-xs" aria-label="Password recovery steps">
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === current ? 'step' : undefined}
          className={`flex-1 rounded-md border px-2 py-1.5 text-center ${i === current ? 'border-pine bg-pine-tint font-medium text-pine-dark' : i < current ? 'border-line text-muted line-through' : 'border-line text-muted'}`}>
          {i + 1}. {s}
        </li>
      ))}
    </ol>
  );
}
const msg = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong. Please try again.');

export function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setErr('Enter a valid email address.');
    setBusy(true); setErr(null);
    try { await forgotPassword(email.trim()); nav('/verify-otp', { state: { email: email.trim(), sent: true } }); }
    catch (x) { setErr(msg(x)); } finally { setBusy(false); }
  };
  return (
    <AuthLayout title="Reset your password" sub="We will email you a one-time code." footer={<Link to="/login" className="text-pine underline">Back to log in</Link>}>
      <Steps current={0} />
      <form onSubmit={submit} className="space-y-4" noValidate>
        {err && <Alert kind="error">{err}</Alert>}
        <Field label="Email" htmlFor="fp-email"><input id="fp-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} /></Field>
        <button className="btn-primary w-full" disabled={busy || !email}>{busy && <Spinner />}Send code</button>
      </form>
    </AuthLayout>
  );
}

export function VerifyOtp() {
  const nav = useNavigate();
  const st = useLocation().state as { email?: string; sent?: boolean } | null;
  const [email, setEmail] = useState(st?.email ?? '');
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setErr('Enter a valid email address.');
    if (!/^\d{4,8}$/.test(otp.trim())) return setErr('Enter the numeric code from your email.');
    setBusy(true); setErr(null);
    try { await verifyOtp(email.trim(), otp.trim()); nav('/reset-password', { state: { email: email.trim(), verified: true } }); }
    catch (x) { setErr(msg(x)); } finally { setBusy(false); }
  };
  return (
    <AuthLayout title="Enter your code" sub={st?.sent ? 'We sent a code to your email.' : 'Enter the code we emailed you.'} footer={<Link to="/forgot-password" className="text-pine underline">Send a new code</Link>}>
      <Steps current={1} />
      <form onSubmit={submit} className="space-y-4" noValidate>
        {err && <Alert kind="error">{err}</Alert>}
        <Field label="Email" htmlFor="vo-email"><input id="vo-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} /></Field>
        <Field label="Code" htmlFor="vo-otp"><input id="vo-otp" inputMode="numeric" autoComplete="one-time-code" className="input tracking-widest" value={otp} onChange={(e) => setOtp(e.target.value)} disabled={busy} /></Field>
        <button className="btn-primary w-full" disabled={busy || !email || !otp}>{busy && <Spinner />}Verify code</button>
      </form>
    </AuthLayout>
  );
}

export function ResetPassword() {
  const nav = useNavigate();
  const toast = useToast();
  const st = useLocation().state as { email?: string; verified?: boolean } | null;
  const [email, setEmail] = useState(st?.email ?? '');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  if (!st?.verified) return <Navigate to="/forgot-password" replace />;
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setErr('Enter a valid email address.');
    if (pw.length < 6) return setErr('Use at least 6 characters.');
    if (pw !== pw2) return setErr('The passwords do not match.');
    setBusy(true); setErr(null);
    try { await resetPassword(email.trim(), pw); toast.success('Password updated. Log in with your new password.'); nav('/login', { replace: true }); }
    catch (x) { setErr(msg(x)); } finally { setBusy(false); setPw(''); setPw2(''); }
  };
  return (
    <AuthLayout title="Choose a new password">
      <Steps current={2} />
      <form onSubmit={submit} className="space-y-4" noValidate>
        {err && <Alert kind="error">{err}</Alert>}
        <Field label="Email" htmlFor="rp-email"><input id="rp-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} disabled={busy} /></Field>
        <Field label="New password" htmlFor="rp-pw"><input id="rp-pw" type="password" autoComplete="new-password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} disabled={busy} /></Field>
        <Field label="Confirm new password" htmlFor="rp-pw2"><input id="rp-pw2" type="password" autoComplete="new-password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} disabled={busy} /></Field>
        <button className="btn-primary w-full" disabled={busy || !pw || !pw2}>{busy && <Spinner />}Update password</button>
      </form>
    </AuthLayout>
  );
}
