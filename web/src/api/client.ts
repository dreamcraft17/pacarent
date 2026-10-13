const TOKEN_KEY = 'pacarent_access';
const REFRESH_KEY = 'pacarent_refresh';

/** Dev: kosong → Vite proxy /api. Vercel: set VITE_API_BASE ke origin API (https://…). */
function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '';
  return base ? `${base}${normalized}` : normalized;
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(apiUrl(path), { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.Message || 'Request gagal');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
