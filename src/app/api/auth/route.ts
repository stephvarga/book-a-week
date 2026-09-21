import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, safeCompare, SESSION_COOKIE, SESSION_TTL_MS, verifySessionToken } from '@/lib/auth';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!rateLimit(`auth:${ip}`, MAX_ATTEMPTS, WINDOW_MS)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  const correctPassword = process.env.SITE_PASSWORD;
  if (!correctPassword) {
    console.error('SITE_PASSWORD env variable not set');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  if (!password || !safeCompare(password, correctPassword)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
  return res;
}

/** Lets the client check whether it already has a valid session, without re-entering the password. */
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return NextResponse.json({ authed: verifySessionToken(token) });
}
