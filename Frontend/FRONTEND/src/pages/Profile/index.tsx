import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/ui';

export default function Profile() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  if (!user) return null;
  const rows: [string, string][] = [
    ['Email', user.username], ['Role', user.role.toLowerCase()],
    ...(user.userId != null ? [['User ID', String(user.userId)] as [string, string]] : []),
    ...(user.expiresAt ? [['Session ends', new Date(user.expiresAt).toLocaleString()] as [string, string]] : []),
  ];
  return (
    <div className="container-page max-w-2xl py-10">
      <PageHeader title="Profile" sub="Details from your current session." />
      <dl className="card divide-y divide-line">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-5 py-3 text-sm"><dt className="text-muted">{k}</dt><dd className="capitalize-none break-all text-right">{v}</dd></div>)}
      </dl>
      {!user.roleFromToken && <p className="mt-4 text-sm text-muted">Your token does not state a role, so the app treats you as a customer for navigation. The server still decides what you may do.</p>}
      <p className="mt-4 text-sm text-muted">There is no profile service yet, so these details cannot be edited here.</p>
      <button className="btn-secondary mt-6" onClick={() => { logout(); nav('/'); }}>Log out</button>
    </div>
  );
}
