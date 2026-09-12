import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET_KEY = process.env.JWT_SECRET || 'ppwr-secret-key-change-in-prod';
const COOKIE_NAME = 'ppwr_session';

export interface UserSession {
  username: string;
  role: 'ADMIN' | 'MANAGER' | 'VIEWER';
}

export function createSessionToken(username: string, role: string = 'ADMIN'): string {
  const payload = JSON.stringify({
    username,
    role,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  const encodedPayload = Buffer.from(payload).toString('base64url');
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${hmac}`;
}

export function verifySessionToken(token: string): UserSession | null {
  try {
    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(encodedPayload).digest('base64url');
    if (signature !== expectedHmac) return null;

    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null;

    return {
      username: payload.username,
      role: (payload.role as any) || 'ADMIN',
    };
  } catch {
    return null;
  }
}

export function setSessionCookie(username: string, role: string = 'ADMIN') {
  const token = createSessionToken(username, role);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  });
}

export function removeSessionCookie() {
  cookies().delete(COOKIE_NAME);
}

export function getCurrentUser(): UserSession | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
