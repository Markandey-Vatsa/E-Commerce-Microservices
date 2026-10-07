import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler, tokenStore } from '../api/client';
import { sessionFromToken } from '../utils/jwt';
import type { Role, SessionUser } from '../types';

interface AuthValue {
  user: SessionUser | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  login: (token: string) => boolean;
  logout: () => void;
  clearExpired: () => void;
  hasRole: (...roles: Role[]) => boolean;
}
const AuthContext = createContext<AuthValue | null>(null);

function initialUser(): SessionUser | null {
  const t = tokenStore.get();
  if (!t) return null;
  const s = sessionFromToken(t);
  if (!s) tokenStore.clear();
  return s;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => { setUser(null); setSessionExpired(true); });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback((token: string) => {
    const s = sessionFromToken(token);
    if (!s) return false;
    tokenStore.set(token);
    setUser(s);
    setSessionExpired(false);
    return true;
  }, []);
  const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);
  const clearExpired = useCallback(() => setSessionExpired(false), []);

  const value = useMemo<AuthValue>(() => ({
    user, isAuthenticated: !!user, sessionExpired, login, logout, clearExpired,
    hasRole: (...roles) => !!user && roles.includes(user.role),
  }), [user, sessionExpired, login, logout, clearExpired]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
