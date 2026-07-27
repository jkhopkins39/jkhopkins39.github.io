/**
 * Request metadata for inbound form submissions (Edge runtime).
 * Used for abuse rate-limiting, audit trail, and as context for the screening agent.
 */

const IPV4 = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6 = /^[0-9a-f:]+$/i;

function looksLikeIp(value) {
  if (!value) return false;
  const v = value.trim();
  if (IPV4.test(v)) return v.split('.').every((o) => Number(o) <= 255);
  return v.includes(':') && IPV6.test(v);
}

/** Client IP, preferring the left-most (original client) entry of X-Forwarded-For. */
export function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    for (const part of forwarded.split(',')) {
      const candidate = part.trim();
      if (looksLikeIp(candidate)) return candidate;
    }
  }

  const real = req.headers.get('x-real-ip');
  if (looksLikeIp(real)) return real.trim();

  return null;
}

function decode(value) {
  if (!value) return null;
  try {
    return decodeURIComponent(value) || null;
  } catch {
    return value || null;
  }
}

/**
 * @returns {{ ip: string|null, userAgent: string|null, referer: string|null,
 *             geo: string|null, country: string|null, region: string|null, city: string|null }}
 */
export function getClientMeta(req) {
  const country = decode(req.headers.get('x-vercel-ip-country'));
  const region = decode(req.headers.get('x-vercel-ip-country-region'));
  const city = decode(req.headers.get('x-vercel-ip-city'));

  const geo = [city, region, country].filter(Boolean).join(', ') || null;

  return {
    ip: getClientIp(req),
    userAgent: (req.headers.get('user-agent') ?? '').slice(0, 500) || null,
    referer: (req.headers.get('referer') ?? '').slice(0, 500) || null,
    geo,
    country,
    region,
    city,
  };
}
