import crypto from 'crypto';

export const SESSION_COOKIE = 'totem_session';
export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function getSecret(): string {
  const secret = process.env.SITE_PASSWORD;
  if (!secret) {
    throw new Error('SITE_PASSWORD env variable not set');
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

/**
 * Constant-time string comparison. Hashes both inputs to a fixed-length
 * digest first so unequal-length inputs (e.g. a wrong-length password guess)
 * can't be distinguished by comparison time before timingSafeEqual even runs.
 */
export function safeCompare(a: string, b: string): boolean {
  const bufA = crypto.createHash('sha256').update(a).digest();
  const bufB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Creates a signed, expiring session token to store in an httpOnly cookie. */
export function createSessionToken(): string {
  const expires = String(Date.now() + SESSION_TTL_MS);
  return `${expires}.${sign(expires)}`;
}

/** Verifies a session token's signature and expiry. */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;

  let expected: string;
  try {
    expected = sign(payload);
  } catch {
    return false;
  }

  if (!safeCompare(sig, expected)) return false;

  const expires = Number(payload);
  if (!expires || Date.now() > expires) return false;

  return true;
}
