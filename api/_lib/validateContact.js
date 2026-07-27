/**
 * Contact-detail verification for inbound form submissions.
 *
 * Email  — syntax, throwaway/placeholder domains, then a live DNS check that the
 *          domain can actually receive mail (MX, falling back to an A/AAAA record).
 *          Optionally verified against ZeroBounce when ZEROBOUNCE_API_KEY is set.
 * Phone  — E.164 normalisation plus NANP structural rules (valid area code and
 *          exchange, no reserved/fictional ranges, no filler patterns).
 *          Optionally verified against Twilio Lookup when TWILIO_* is set.
 *
 * All network checks fail OPEN: if DNS or a verification provider is unreachable
 * we accept the value rather than lose a real lead.
 */

const EMAIL_RE = /^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/;

/** Throwaway / burner mail providers. */
const DISPOSABLE_DOMAINS = new Set([
  '0-mail.com', '10minutemail.com', '20minutemail.com', '33mail.com', 'anonaddy.me',
  'burnermail.io', 'dispostable.com', 'emailondeck.com', 'fakeinbox.com', 'getairmail.com',
  'getnada.com', 'guerrillamail.com', 'guerrillamail.info', 'guerrillamail.net',
  'inboxbear.com', 'mailcatch.com', 'maildrop.cc', 'mailinator.com', 'mailnesia.com',
  'mintemail.com', 'moakt.com', 'mohmal.com', 'mytemp.email', 'sharklasers.com',
  'spam4.me', 'temp-mail.io', 'temp-mail.org', 'tempinbox.com', 'tempmail.com',
  'tempmail.net', 'tempmailo.com', 'throwawaymail.com', 'trashmail.com', 'trbvm.com',
  'yopmail.com', 'yopmail.fr', 'yopmail.net',
]);

/** Reserved / documentation domains that can never receive real mail. */
const PLACEHOLDER_DOMAINS = new Set([
  'example.com', 'example.org', 'example.net', 'example.edu',
  'test.com', 'test.net', 'test.test', 'localhost', 'localhost.com',
  'invalid', 'domain.com', 'yourdomain.com', 'mydomain.com', 'company.com',
  'asdf.com', 'aaa.com', 'abc.com', 'nope.com', 'fake.com', 'noemail.com',
]);

/** Obvious filler local-parts. */
const PLACEHOLDER_LOCALS = new Set([
  'test', 'testing', 'test123', 'asdf', 'asdfasdf', 'qwerty', 'fake', 'none', 'na',
  'nobody', 'noone', 'no', 'nothing', 'nomail', 'noemail', 'donotreply', 'do-not-reply',
  'noreply', 'no-reply', 'spam', 'junk', 'aaa', 'aaaa', 'abc', 'abcd', 'xxx', 'xxxx',
  'anonymous', 'unknown', 'idk', 'whatever',
]);

/** Shared mailbox prefixes — legitimate for business inquiries, flagged only as a signal. */
const ROLE_LOCALS = new Set([
  'info', 'sales', 'support', 'admin', 'office', 'contact', 'hello', 'billing',
  'accounts', 'accounting', 'help', 'team', 'service', 'marketing', 'webmaster',
]);

const DOH_ENDPOINT = 'https://cloudflare-dns.com/dns-query';
const DNS_TIMEOUT_MS = 2500;
const PROVIDER_TIMEOUT_MS = 4000;

async function dnsQuery(name, type) {
  const url = `${DOH_ENDPOINT}?name=${encodeURIComponent(name)}&type=${type}`;
  const res = await fetch(url, {
    headers: { accept: 'application/dns-json' },
    signal: AbortSignal.timeout(DNS_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`DoH ${type} responded ${res.status}`);
  return res.json();
}

/**
 * Confirm a domain can receive mail. NXDOMAIN or "no mail exchanger" are hard
 * failures; anything else (timeout, resolver error) is treated as inconclusive.
 */
async function domainAcceptsMail(domain) {
  try {
    const mx = await dnsQuery(domain, 'MX');

    // 3 = NXDOMAIN — the domain does not exist at all.
    if (mx.Status === 3) {
      return { ok: false, method: 'dns', detail: 'domain does not exist' };
    }

    if (mx.Status === 0 && Array.isArray(mx.Answer) && mx.Answer.some((a) => a.type === 15)) {
      return { ok: true, method: 'mx', detail: 'MX record found' };
    }

    // No MX — a bare A/AAAA record still accepts mail under RFC 5321 §5.1.
    const a = await dnsQuery(domain, 'A');
    if (a.Status === 0 && Array.isArray(a.Answer) && a.Answer.some((r) => r.type === 1)) {
      return { ok: true, method: 'a-record', detail: 'implicit MX via A record' };
    }

    return { ok: false, method: 'dns', detail: 'domain has no mail exchanger' };
  } catch (err) {
    console.warn('DNS mail check inconclusive:', domain, err?.message ?? err);
    return { ok: true, method: 'skipped', detail: 'DNS check unavailable' };
  }
}

/** Optional deliverability check. Only runs when ZEROBOUNCE_API_KEY is configured. */
async function zeroBounceCheck(email, ip) {
  const key = process.env.ZEROBOUNCE_API_KEY;
  if (!key) return null;

  try {
    const url = new URL('https://api.zerobounce.net/v2/validate');
    url.searchParams.set('api_key', key);
    url.searchParams.set('email', email);
    if (ip) url.searchParams.set('ip_address', ip);

    const res = await fetch(url, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
    if (!res.ok) return null;

    const data = await res.json();
    // Only "invalid" is treated as a hard fail — catch-all/unknown are inconclusive.
    return {
      status: data.status ?? null,
      subStatus: data.sub_status ?? null,
      ok: data.status !== 'invalid',
    };
  } catch (err) {
    console.warn('ZeroBounce check unavailable:', err?.message ?? err);
    return null;
  }
}

/**
 * @param {string} raw
 * @param {{ ip?: string|null }} [context]
 * @returns {Promise<{ ok: boolean, value: string|null, message: string|null, checks: object }>}
 */
export async function validateEmail(raw, context = {}) {
  const value = String(raw ?? '').trim().toLowerCase().slice(0, 254);
  const checks = { syntax: false, disposable: false, placeholder: false, role: false, dns: null, provider: null };

  if (!value) return { ok: true, value: null, message: null, checks };

  if (!EMAIL_RE.test(value)) {
    return { ok: false, value, message: 'That email address doesn’t look valid. Please double-check it.', checks };
  }
  checks.syntax = true;

  const [local, domain] = value.split('@');

  if (DISPOSABLE_DOMAINS.has(domain)) {
    checks.disposable = true;
    return {
      ok: false,
      value,
      message: 'Please use a permanent email address — disposable inboxes aren’t accepted.',
      checks,
    };
  }

  if (PLACEHOLDER_DOMAINS.has(domain) || PLACEHOLDER_LOCALS.has(local)) {
    checks.placeholder = true;
    return {
      ok: false,
      value,
      message: 'That looks like a placeholder address. Please enter an email you actually check.',
      checks,
    };
  }

  checks.role = ROLE_LOCALS.has(local);

  const dns = await domainAcceptsMail(domain);
  checks.dns = dns;
  if (!dns.ok) {
    return {
      ok: false,
      value,
      message: 'We couldn’t find a mail server for that domain. Please check the spelling of your email.',
      checks,
    };
  }

  const provider = await zeroBounceCheck(value, context.ip);
  checks.provider = provider;
  if (provider && !provider.ok) {
    return {
      ok: false,
      value,
      message: 'That mailbox doesn’t appear to exist. Please check your email address.',
      checks,
    };
  }

  return { ok: true, value, message: null, checks };
}

const N11 = /^[0-9]11$/;

function isFillerPattern(digits) {
  if (/^(\d)\1+$/.test(digits)) return true;              // 5555555555
  const ascending = '01234567890123456789';
  const descending = '98765432109876543210';
  return ascending.includes(digits) || descending.includes(digits);
}

/** Structural validation for a North American Numbering Plan number. */
function validateNanp(national) {
  const npa = national.slice(0, 3);
  const nxx = national.slice(3, 6);
  const line = national.slice(6);

  if (npa[0] < '2') return 'area code cannot start with 0 or 1';
  if (N11.test(npa)) return 'that is a reserved service code, not an area code';
  if (nxx[0] < '2') return 'exchange code cannot start with 0 or 1';
  if (N11.test(nxx)) return 'reserved exchange code';
  if (nxx === '555' && line >= '0100' && line <= '0199') return 'that is a fictional 555 number';
  if (isFillerPattern(national)) return 'that looks like filler digits';
  return null;
}

/** Optional live check. Only runs when TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN are configured. */
async function twilioLookup(e164) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;

  try {
    const url = `https://lookups.twilio.com/v2/PhoneNumbers/${encodeURIComponent(e164)}?Fields=line_type_intelligence`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${btoa(`${sid}:${token}`)}` },
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });

    // 404 from Lookup means the number is not a real, assignable number.
    if (res.status === 404) return { ok: false, valid: false, lineType: null };
    if (!res.ok) return null;

    const data = await res.json();
    return {
      ok: data.valid !== false,
      valid: data.valid ?? null,
      lineType: data.line_type_intelligence?.type ?? null,
      carrier: data.line_type_intelligence?.carrier_name ?? null,
    };
  } catch (err) {
    console.warn('Twilio Lookup unavailable:', err?.message ?? err);
    return null;
  }
}

/**
 * @param {string} raw
 * @returns {Promise<{ ok: boolean, value: string|null, message: string|null, checks: object }>}
 */
export async function validatePhone(raw) {
  const trimmed = String(raw ?? '').trim().slice(0, 40);
  const checks = { format: null, region: null, provider: null };

  if (!trimmed) return { ok: true, value: null, message: null, checks };

  const hasPlus = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) {
    return { ok: false, value: trimmed, message: 'Please enter a phone number we can actually call.', checks };
  }

  let e164 = null;
  let national = null;

  if (digits.length === 10 && !hasPlus) {
    national = digits;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    national = digits.slice(1);
  } else if (hasPlus && digits.length >= 8 && digits.length <= 15) {
    // Non-NANP international number — E.164 length check only.
    checks.region = 'international';
    checks.format = 'e164-length';
    e164 = `+${digits}`;
    const provider = await twilioLookup(e164);
    checks.provider = provider;
    if (provider && !provider.ok) {
      return {
        ok: false,
        value: trimmed,
        message: 'That phone number isn’t in service. Please check the digits.',
        checks,
      };
    }
    return { ok: true, value: e164, message: null, checks };
  } else {
    return {
      ok: false,
      value: trimmed,
      message: 'Please enter a complete phone number — 10 digits for US/Canada, or +country code for international.',
      checks,
    };
  }

  checks.region = 'nanp';
  const structural = validateNanp(national);
  if (structural) {
    checks.format = structural;
    return { ok: false, value: trimmed, message: `That phone number isn’t valid — ${structural}.`, checks };
  }
  checks.format = 'nanp-valid';

  e164 = `+1${national}`;

  const provider = await twilioLookup(e164);
  checks.provider = provider;
  if (provider && !provider.ok) {
    return {
      ok: false,
      value: trimmed,
      message: 'That phone number isn’t in service. Please check the digits.',
      checks,
    };
  }

  return { ok: true, value: e164, message: null, checks };
}
