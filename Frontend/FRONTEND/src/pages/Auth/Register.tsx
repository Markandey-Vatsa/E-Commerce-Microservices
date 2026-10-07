import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import { Alert, Field, Spinner } from '../../components/ui';
import { AuthLayout, isEmail } from './AuthLayout';

export default function Register() {
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ firstName: '', lastName: '', username: '', password: '' });
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (!f.firstName.trim()) er.firstName = 'Enter your first name.';
    if (!f.lastName.trim()) er.lastName = 'Enter your last name.';
    if (!isEmail(f.username)) er.username = 'Enter a valid email address.';
    if (f.password.length < 6) er.password = 'Use at least 6 characters.';
    setErrors(er); setApiError(null);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await register({ firstName: f.firstName.trim(), lastName: f.lastName.trim(), username: f.username.trim(), password: f.password, role });
      toast.success('Account created. Log in to continue.');
      nav('/login', { replace: true });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  };

  return (
    <AuthLayout title="Create your account" footer={<>Already registered? <Link className="font-medium text-pine underline" to="/login">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {apiError && <Alert kind="error">{apiError}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor="firstName" error={errors.firstName}><input id="firstName" autoComplete="given-name" className="input" value={f.firstName} onChange={set('firstName')} disabled={busy} /></Field>
          <Field label="Last name" htmlFor="lastName" error={errors.lastName}><input id="lastName" autoComplete="family-name" className="input" value={f.lastName} onChange={set('lastName')} disabled={busy} /></Field>
        </div>
        <Field label="Email" htmlFor="reg-email" error={errors.username}><input id="reg-email" type="email" autoComplete="username" className="input" value={f.username} onChange={set('username')} disabled={busy} /></Field>
        <Field label="Password" htmlFor="reg-password" error={errors.password}><input id="reg-password" type="password" autoComplete="new-password" className="input" value={f.password} onChange={set('password')} disabled={busy} /></Field>
        <fieldset>
          <legend className="label">I want to</legend>
          <div className="grid grid-cols-2 gap-3">
            {([['CUSTOMER', 'Buy products'], ['SELLER', 'Sell products']] as const).map(([v, l]) => (
              <label key={v} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2.5 text-sm ${role === v ? 'border-pine bg-pine-tint' : 'border-line bg-white'}`}>
                <input type="radio" name="role" className="accent-pine" checked={role === v} onChange={() => setRole(v)} disabled={busy} />{l}
              </label>
            ))}
          </div>
        </fieldset>
        <button className="btn-primary w-full" disabled={busy}>{busy && <Spinner />}Create account</button>
      </form>
    </AuthLayout>
  );
}
