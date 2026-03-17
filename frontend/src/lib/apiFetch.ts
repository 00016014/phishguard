const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export { API_BASE_URL };

// ---------------------------------------------------------------------------
// Simple in-memory TTL cache for GET requests
// ---------------------------------------------------------------------------
const _cache = new Map<string, { data: any; expiry: number }>();

export function invalidateCache(urlFragment?: string) {
  if (!urlFragment) { _cache.clear(); return; }
  for (const key of _cache.keys()) {
    if (key.includes(urlFragment)) _cache.delete(key);
  }
}

// ---------------------------------------------------------------------------
// CSRF helpers
// ---------------------------------------------------------------------------
let _csrfTokenMemory = '';

function isValidCsrfToken(token: string): boolean {
  return /^[A-Za-z0-9]{32}$|^[A-Za-z0-9]{64}$/.test(token);
}

function getCsrfCookie(): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export async function ensureCsrfToken(): Promise<string> {
  if (isValidCsrfToken(_csrfTokenMemory)) {
    return _csrfTokenMemory;
  }

  let token = getCsrfCookie().trim();
  if (isValidCsrfToken(token)) {
    _csrfTokenMemory = token;
    return token;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/csrf/`, { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    token = typeof data?.csrf_token === 'string' ? data.csrf_token.trim() : '';
  } catch {
    token = '';
  }

  if (!isValidCsrfToken(token)) {
    token = getCsrfCookie().trim();
  }

  if (!isValidCsrfToken(token)) {
    return '';
  }

  _csrfTokenMemory = token;
  return token;
}

// ---------------------------------------------------------------------------
// Drop-in fetch wrapper: credentials + Content-Type + auto CSRF header
// ---------------------------------------------------------------------------
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase();
  const needsCsrf = !['GET', 'HEAD', 'OPTIONS'].includes(method);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  const existingCsrfHeader = Object.keys(headers).find((k) => k.toLowerCase() === 'x-csrftoken');
  if (existingCsrfHeader && !isValidCsrfToken(String(headers[existingCsrfHeader] || '').trim())) {
    delete headers[existingCsrfHeader];
  }

  if (needsCsrf) {
    const token = await ensureCsrfToken();
    if (isValidCsrfToken(token)) {
      headers['X-CSRFToken'] = token;
    }
  }

  return fetch(url, { ...options, credentials: 'include', headers });
}

// ---------------------------------------------------------------------------
// Cached GET — returns parsed JSON, caches for `ttlMs` (default 30 s)
// ---------------------------------------------------------------------------
export async function cachedGet<T = any>(url: string, ttlMs = 30_000): Promise<T | null> {
  const now = Date.now();
  const hit = _cache.get(url);
  if (hit && hit.expiry > now) return hit.data as T;

  const res = await apiFetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  _cache.set(url, { data, expiry: now + ttlMs });
  return data as T;
}
