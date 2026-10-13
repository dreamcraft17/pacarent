# Deploy PacaRent — Vercel / Netlify (+ API)

> **Author:** Dozer  
> **Date:** 2026-10-13  
> **Status:** Active

## Ringkasan

PacaRent terdiri dari **dua bagian**:

| Bagian | Stack | Cocok di Vercel / Netlify? |
|--------|--------|----------------------------|
| **Web** | React + Vite → file statis (`web/dist/`) | **Ya** |
| **API** | ASP.NET Core 8 + PostgreSQL + background job | **Tidak** (bukan static/Node serverless default) |

**Arsitektur produksi yang disarankan (hybrid):**

- **Frontend:** Vercel *atau* Netlify (domain utama, mis. `app.pacarent.id`)
- **Backend:** VPS + Nginx + systemd (sesuai [`docs/SDD.md`](../SDD.md)), *atau* host .NET lain (Railway, Azure App Service, Fly.io — **TBD** pilihan tim)
- **Database:** PostgreSQL (bukan in-memory dev)

Tanpa API yang hidup, halaman web bisa tampil tapi **login, mitra, booking gagal**.

---

## Prasyarat

- Repo `pacarent/` sudah di GitHub (atau GitLab/Bitbucket terhubung ke Vercel/Netlify)
- Domain (opsional) + DNS
- **API sudah deploy** di URL HTTPS, mis. `https://api.pacarent.id`
- PostgreSQL produksi + file env API (lihat [`deploy/scripts/api.env.example`](../../deploy/scripts/api.env.example))

Build lokal (sanity check):

```bash
cd pacarent
./deploy/scripts/deploy.sh
# Artefak: publish/api + publish/web
```

---

## Bagian A — Deploy API (wajib sebelum web produksi)

### Opsi A1 — VPS (referensi resmi repo)

1. Siapkan Ubuntu/Debian, PostgreSQL, Nginx, .NET 8 runtime.
2. Jalankan `./deploy/scripts/deploy.sh` di mesin build/CI.
3. Unggah `publish/api` ke `/opt/pacarent/api`, `publish/web` ke `/var/www/pacarent/web` (atau hanya API jika web di Vercel).
4. Salin env:

   ```bash
   sudo cp deploy/scripts/api.env.example /etc/pacarrent/api.env
   sudo chmod 600 /etc/pacarrent/api.env
   # Edit: ConnectionStrings, Jwt__Secret, DOKU, SMTP, dll.
   ```

5. Pasang systemd + Nginx dari [`deploy/systemd/`](../../deploy/systemd/) dan [`deploy/nginx/`](../../deploy/nginx/).
6. Migrasi DB (non in-memory):

   ```bash
   cd /opt/pacarent/api
   ASPNETCORE_ENVIRONMENT=Production dotnet PacaRent.Api.dll -- # sekali: gunakan ef tools jika dipisah
   # Atau saat startup: MigrateAsync() jika Database:UseInMemory = false
   ```

7. Pastikan `appsettings.Production.json` / env: **`Database:UseInMemory` = false**.
8. Tes: `curl https://api.pacarent.id/health` dan `curl https://api.pacarent.id/api/categories`.

Detail langkah VPS: [`docs/SDD.md` §13](../SDD.md), [`README.md`](../../README.md).

### Opsi A2 — Host .NET managed

**TBD** — pilih provider (Railway, Render, Azure, dll.), set `ASPNETCORE_URLS`, connection string Postgres, volume untuk upload KTP. Prinsip sama: URL publik HTTPS untuk `/api/*`.

---

## Bagian B — Deploy web di Netlify

### B1. Siapkan konfigurasi repo

Di root folder **`pacarent/`**, buat `netlify.toml` (atau salin dari contoh di bawah). **Ganti** URL API:

```toml
[build]
  base = "web"
  command = "npm ci && npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"

# Proxy API → backend (browser tetap memanggil /api/... same-origin)
[[redirects]]
  from = "/api/*"
  to = "https://api.pacarent.id/api/:splat"
  status = 200
  force = true

# SPA React Router
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### B2. Langkah di dashboard Netlify

1. Login [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Hubungkan repo Git; **Base directory:** kosong (root repo = `pacarent`) — Netlify membaca `netlify.toml` → `base = "web"`.
3. **Build command** / **Publish directory:** otomatis dari `netlify.toml`.
4. **Site configuration → Environment variables:** biasanya tidak perlu untuk web jika proxy `/api` dipakai.
5. **Deploy site**.
6. **Domain:** Site settings → Domain management → custom domain + HTTPS.
7. Verifikasi:
   - Buka `https://<site-netlify>/` → halaman Jelajahi.
   - DevTools → Network → request ke `/api/categories` status 200 (bukan 404 Netlify).

### B3. CORS

API sudah `AllowAnyOrigin` di [`Program.cs`](../../api/PacaRent.Api/Program.cs). Untuk produksi, pertimbangkan restrict origin ke domain Netlify (**TBD** hardening).

---

## Bagian C — Deploy web di Vercel

### C1. Konfigurasi repo (sudah ada)

- [`web/vercel.json`](../../web/vercel.json) — build Vite, cache assets
- [`web/.env.example`](../../web/.env.example) — `VITE_API_BASE`
- [`web/src/api/client.ts`](../../web/src/api/client.ts) — prefix API dari env saat build

**Tidak** perlu rewrite `/api` di `vercel.json`: set **`VITE_API_BASE`** di dashboard Vercel ke origin API (HTTPS).

### C2. Langkah di dashboard Vercel

1. Login [Vercel](https://vercel.com) → **Add New… → Project** → import repo.
2. **Root Directory:** `web` (penting — monorepo).
3. Framework Preset: **Vite** (terdeteksi otomatis).
4. **Build Command:** `npm run build` · **Output Directory:** `dist`.
5. **Environment Variables → Production & Preview:** `VITE_API_BASE` = `https://<api-host>` (wajib jika API di domain lain).
6. **Deploy**.
7. Custom domain + cek `/api/categories`.

### C3. CLI (opsional)

```bash
cd pacarent/web
npm i -g vercel
vercel login
vercel --prod
```

---

## Bagian D — Satu domain penuh (tanpa Vercel/Netlify)

Jika ingin **semua** di VPS (paling sederhana operasional untuk MVP):

1. Nginx `root` → `web/dist`, `location /api/` → Kestrel `:5000` (sudah di [`deploy/nginx/pacarrent.conf`](../../deploy/nginx/pacarrent.conf)).
2. Tidak perlu Vercel/Netlify.
3. Build: `./deploy/scripts/deploy.sh`, sync `publish/web` + `publish/api`.

---

## Checklist sebelum go-live

| # | Item |
|---|------|
| 1 | `Database:UseInMemory` = **false** di produksi |
| 2 | JWT secret ≥ 32 karakter, disimpan aman |
| 3 | PostgreSQL backup + migrasi sukses |
| 4 | DOKU / SMTP: mock dimatikan atau gateway live (**TBD** legal/MCC) |
| 5 | HTTPS di frontend dan API |
| 6 | Rewrite `/api/*` ke backend benar (tes login + daftar mitra) |
| 7 | Upload dokumen mitra: path writable (`PacaRent__DocumentStoragePath`) |

---

## Troubleshooting

| Gejala | Penyebab umum | Tindakan |
|--------|----------------|----------|
| UI kosong / “API belum nyala” | API mati atau rewrite salah | Cek URL API langsung; perbaiki `netlify.toml` / `vercel.json` |
| 404 pada refresh `/bookings` | SPA fallback missing | Pastikan redirect/rewrite ke `index.html` |
| CORS error | API dipanggil langsung ke domain lain tanpa rewrite | Pakai proxy `/api` same-origin |
| Kategori cuma 3 | DB lama / API dev in-memory | Restart API produksi; pastikan seed/migrasi `Sewa pacar` |
| Build Netlify gagal | Node versi | Set `NODE_VERSION = "20"` |

---

## Keputusan: Netlify vs Vercel?

| Kriteria | Netlify | Vercel |
|----------|---------|--------|
| Setup SPA + proxy | `netlify.toml` redirects | `vercel.json` rewrites |
| Monorepo `web/` | `base = "web"` di toml | Root Directory = `web` |
| Cocok untuk PacaRent MVP | **Ya** (frontend saja) | **Ya** (frontend saja) |

Pilih salah satu untuk **web**; **API tetap di VPS/host .NET** kecuali tim migrasi arsitektur.

---

## Referensi internal

- [`docs/SDD.md`](../SDD.md) — arsitektur & deployment VPS  
- [`deploy/scripts/deploy.sh`](../../deploy/scripts/deploy.sh) — build artefak  
- [`web/vite.config.ts`](../../web/vite.config.ts) — proxy dev `:5050` (hanya lokal)
