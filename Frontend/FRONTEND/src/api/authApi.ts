import client, { ApiError } from './client';
import type { RegisterRequest } from '../types';

export async function login(username: string, password: string): Promise<string> {
  const { data } = await client.post('/auth/login', { username, password });
  const token = typeof data === 'string' ? data : data?.token ?? data?.jwt ?? data?.accessToken;
  if (typeof token !== 'string' || !token) throw new ApiError('Unexpected response from the login service.', 500);
  return token.replace(/^Bearer\s+/i, '').trim();
}
export const register = (body: RegisterRequest) => client.post('/auth/register', body).then((r) => r.data);
export const forgotPassword = (email: string) => client.post('/auth/forgot-password', null, { params: { email } }).then((r) => r.data);
export const verifyOtp = (email: string, otp: string) => client.post('/auth/verify-otp', null, { params: { email, otp } }).then((r) => r.data);
export const resetPassword = (username: string, password: string) => client.post('/auth/reset-password', { username, password }).then((r) => r.data);
// POST /auth/createAdmin is intentionally not exposed (admin-only, no public UI).
