import type { Role, SessionUser } from '../types';

type Claims = Record<string, unknown>;

export function decodeJwt(token: string): Claims | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(b64).split('').map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    );
    return JSON.parse(json) as Claims;
  } catch {
    return null;
  }
}

function flatten(v: unknown): string[] {
  if (typeof v === 'string') return v.split(/[\s,]+/);
  if (Array.isArray(v)) return v.flatMap(flatten);
  if (v && typeof v === 'object') return flatten((v as Claims).authority ?? (v as Claims).role ?? (v as Claims).name);
  return [];
}

function extractRole(c: Claims): Role | null {
  const values = [c.role, c.roles, c.authorities, c.authority, c.scope, c.scopes]
    .flatMap(flatten)
    .map((s) => s.replace(/^ROLE_/i, '').toUpperCase());
  for (const r of ['ADMIN', 'SELLER', 'CUSTOMER'] as Role[]) if (values.includes(r)) return r;
  return null;
}

function extractUserId(c: Claims): number | null {
  for (const k of ['userId', 'user_id', 'uid', 'id']) {
    const n = Number(c[k]);
    if (c[k] !== undefined && c[k] !== null && c[k] !== '' && Number.isFinite(n)) return n;
  }
  return null;
}

export function isExpired(token: string): boolean {
  const exp = Number(decodeJwt(token)?.exp);
  return Number.isFinite(exp) && exp * 1000 <= Date.now();
}

export function sessionFromToken(token: string): SessionUser | null {
  const c = decodeJwt(token);
  if (!c || isExpired(token)) return null;
  const role = extractRole(c);
  const exp = Number(c.exp);
  return {
    username: String(c.sub ?? c.username ?? c.email ?? ''),
    role: role ?? 'CUSTOMER',
    roleFromToken: role !== null,
    userId: extractUserId(c),
    expiresAt: Number.isFinite(exp) ? exp * 1000 : null,
  };
}
