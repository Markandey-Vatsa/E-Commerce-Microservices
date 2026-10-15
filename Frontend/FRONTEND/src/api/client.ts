import axios, { AxiosError } from 'axios';

/** The API Gateway is the ONLY backend entry point. Never use ports 8081-8085. */
export const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : 'https://inch-charm-colony-jones.trycloudflare.com';

const TOKEN_KEY = 'mercato.token';
export const tokenStore = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t: string) => { try { localStorage.setItem(TOKEN_KEY, t); } catch { /* storage unavailable */ } },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ } },
};

let onUnauthorized: (() => void) | null = null;
export const setUnauthorizedHandler = (fn: (() => void) | null) => { onUnauthorized = fn; };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name = 'ApiError'; this.status = status; }
}

const PUBLIC_AUTH = ['/auth/login', '/auth/register', '/auth/forgot-password', '/auth/verify-otp', '/auth/reset-password'];
const isPublicAuth = (url?: string) => !!url && PUBLIC_AUTH.some((p) => url.startsWith(p));

/** Use backend text only when it looks like a human message, never a stack trace. */
function safeBackendMessage(data: unknown): string | null {
  const raw = typeof data === 'string' ? data
    : data && typeof data === 'object' ? ((data as Record<string, unknown>).message ?? (data as Record<string, unknown>).error) : null;
  if (typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s || s.length > 160 || /exception|\bat [\w.$]+\(|\n|<html/i.test(s)) return null;
  return s;
}

function messageFor(status: number, data: unknown, url?: string): string {
  const backend = safeBackendMessage(data);
  if (url?.startsWith('/auth/login') && (status === 401 || status === 403)) return 'Incorrect email or password.';
  switch (status) {
    case 400: return backend ?? 'Please check the details you entered and try again.';
    case 401: return 'Session expired. Please log in again.';
    case 403: return 'You do not have permission to perform this action.';
    case 404: return backend ?? 'We could not find what you were looking for.';
    case 409: return backend ?? 'Insufficient stock.';
    default: return status >= 500 ? 'Something went wrong. Please try again.' : backend ?? 'Request failed. Please try again.';
  }
}

const client = axios.create({ baseURL: API_BASE_URL, timeout: 20000, headers: { 'Content-Type': 'application/json' } });

client.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token && !isPublicAuth(config.url)) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (!err.response) {
      throw new ApiError('Cannot reach the server. Check your connection and that the API Gateway is running.', 0);
    }
    const { status, data } = err.response;
    // Only treat 401 as "session ended" if we actually sent a token.
    if (status === 401 && tokenStore.get() && !isPublicAuth(err.config?.url)) {
      tokenStore.clear();
      onUnauthorized?.();
    }
    throw new ApiError(messageFor(status, data, err.config?.url), status);
  },
);

export default client;
