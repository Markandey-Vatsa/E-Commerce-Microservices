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
      <div className="panel mb-6 flex items-center gap-5 p-6">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand font-display text-3xl font-bold text-white" aria-hidden>{user.username.trim()[0]?.toUpperCase() ?? "?"}</span>
        <div className="min-w-0"><p className="truncate text-lg font-bold">{user.username}</p><span className="chip mt-1 bg-brand-tint capitalize text-brand-ink">{user.role.toLowerCase()}</span></div>
      </div>
      <dl className="panel divide-y divide-hair overflow-hidden">
        {rows.map(([k, v]) => <div key={k} className="flex justify-between gap-4 px-6 py-4 text-sm"><dt className="text-subtle">{k}</dt><dd className="break-all text-right font-medium">{v}</dd></div>)}
      </dl>
      {!user.roleFromToken && <p className="mt-4 text-sm text-subtle">Your token does not state a role, so the app treats you as a customer for navigation. The server still decides what you may do.</p>}
      <p className="mt-4 text-sm text-subtle">There is no profile service yet, so these details cannot be edited here.</p>
      <button className="btn-secondary mt-6" onClick={() => { logout(); nav('/'); }}>Log out</button>
    </div>
  );
}
