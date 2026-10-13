# Vercel — quickstart PacaRent web

> **Author:** Dozer  
> **Date:** 2026-10-13

## Apa yang di-deploy

Hanya folder **`web/`** (SPA Vite). API .NET **tidak** jalan di Vercel — host API di VPS/Railway/dll. dan arahkan frontend ke sana.

## Langkah

1. Push repo ke GitHub (path proyek: `pacarent/` jika monorepo).
2. [vercel.com/new](https://vercel.com/new) → Import repository.
3. **Root Directory:** `pacarent/web` (sesuaikan jika repo hanya berisi isi `pacarent`).
4. Framework: **Vite** (auto dari `vercel.json`).
5. **Environment Variables** (Production + Preview):

   | Name | Value |
   |------|--------|
   | `VITE_API_BASE` | `https://<host-api-kamu>` tanpa `/` di akhir |

6. Deploy.

## Verifikasi

- Buka URL Vercel → tab Jelajahi memuat mitra.
- DevTools → Network: request ke `https://<host-api>/api/categories` status 200.
- Refresh deep link (`/bookings`, `/login`) tidak 404 (routing SPA handled Vercel + Vite).

## CLI

```bash
cd pacarent/web
npm i -g vercel
vercel login
vercel link
vercel env add VITE_API_BASE production
vercel --prod
```

## Troubleshooting

| Masalah | Fix |
|---------|-----|
| UI kosong / gagal fetch | `VITE_API_BASE` salah atau API down / CORS |
| Build gagal Node | Vercel → Node 20.x (lihat `engines` di `package.json`) |
| Env tidak ke-build | `VITE_*` harus ada **sebelum** build; redeploy setelah set env |

Panduan lengkap hybrid: [`DEPLOY-VERCEL-NETLIFY.md`](DEPLOY-VERCEL-NETLIFY.md).
