import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { Alert, Field, Spinner } from '../../components/ui';
import { AuthLayout, isEmail } from './AuthLayout';

export default function Login() {
  const { login, sessionExpired, clearExpired } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: { pathname: string; search?: string; state?: unknown } } | null)?.from;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!isEmail(username)) er.username = 'Enter a valid email address.';
    if (!password) er.password = 'Enter your password.';
    setErrors(er); setApiError(null);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      const token = await loginApi(username.trim(), password);
      if (!login(token)) { setApiError('The server returned a session we could not read. Please try again.'); return; }
      clearExpired();
      nav(from ? `${from.pathname}${from.search ?? ''}` : '/', { replace: true, state: from?.state });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); setPassword(''); }
  };

  return (
    <AuthLayout title="Log in" sub="Welcome back." footer={<>New here? <Link className="font-medium text-pine underline" to="/register">Create an account</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {sessionExpired && <Alert kind="info">Session expired. Please log in again.</Alert>}
        {apiError && <Alert kind="error">{apiError}</Alert>}
        <Field label="Email" htmlFor="username" error={errors.username}>
          <input id="username" type="email" autoComplete="username" className="input" value={username} onChange={(e) => setUsername(e.target.value)} disabled={busy} />
        </Field>
        <Field label="Password" htmlFor="password" error={errors.password}>
          <input id="password" type="password" autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} disabled={busy} />
        </Field>
        <div className="text-right text-sm"><Link to="/forgot-password" className="text-pine underline">Forgot password?</Link></div>
        <button className="btn-primary w-full" disabled={busy || !username || !password}>{busy && <Spinner />}Log in</button>
      </form>
    </AuthLayout>
  );
}
