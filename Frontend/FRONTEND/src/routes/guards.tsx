import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

/** UX-only role check. The backend remains the real authority. */
export function RoleGuard({ roles, children, fallback = null }: { roles: Role[]; children: ReactNode; fallback?: ReactNode }) {
  const { user } = useAuth();
  return <>{user && roles.includes(user.role) ? children : fallback}</>;
}

export function ProtectedRoute({ roles, children }: { roles?: Role[]; children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const loc = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (roles) {
    return (
      <RoleGuard roles={roles} fallback={
        <div className="container-page py-20 text-center">
          <h1 className="text-2xl font-bold">You do not have access to this page</h1>
          <p className="mt-2 text-sm text-muted">This area is for {roles.join(' / ').toLowerCase()} accounts.</p>
          <Link to="/" className="btn-primary mt-6">Back to home</Link>
        </div>
      }>{children}</RoleGuard>
    );
  }
  return <>{children}</>;
}
