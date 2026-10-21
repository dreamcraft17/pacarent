/** Dev: kosong → Vite proxy /api. Vercel: set VITE_API_BASE ke origin API (https://…). */
function apiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '';
  return base ? `${base}${normalized}` : normalized;
}

export function apiAssetUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  const base = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '';
  return base ? `${base}${normalized}` : normalized;
}

/**
 * The access token lives in an httpOnly cookie the API sets on login/register/
 * refresh — never in localStorage, which any injected script could read.
 * `credentials: 'include'` makes the browser attach it automatically.
 */
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(apiUrl(path), { ...options, headers, credentials: 'include' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.Message || 'Nggak bisa diproses');
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
