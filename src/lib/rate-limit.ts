// Lightweight in-memory rate limiter.
//
// Note: on serverless platforms (Vercel) this state is per-instance and
// resets on cold start, so it's a best-effort speed bump against casual
// scripted abuse — not a hard guarantee. For stronger protection, put this
// behind Vercel's Firewall or a shared store (e.g. Upstash Redis).

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically drop stale buckets so the map doesn't grow unbounded across
// a warm instance's lifetime.
function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/** Returns true if the request under `key` is allowed, false if rate-limited. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) sweep(now);

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export function getClientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}
