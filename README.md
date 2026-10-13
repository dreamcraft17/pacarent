# PacaRent

> **Author:** Dozer  
> **Last updated:** 2026-10-13

Platform web **sewa pacar & teman kencan**: daftar → jelajahi mitra → booking → bayar (escrow) → selesai → ulasan. MVP monorepo: API ASP.NET Core + SPA React.

Dokumen produk: [`docs/PRD.md`](docs/PRD.md) · [`docs/SRS.md`](docs/SRS.md) · [`docs/SDD.md`](docs/SDD.md) · status implementasi: [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md)

## Tech stack

| Lapisan | Teknologi |
|---------|-----------|
| API | ASP.NET Core 8, JWT, EF Core |
| DB | PostgreSQL 16 (produksi); in-memory (dev default) |
| Web | React 19, Vite 8, React Router 7, TypeScript |
| Edge (opsional) | Netlify / Vercel untuk static web saja |
| VPS (referensi SDD) | Nginx, systemd, `deploy/` |

## Prasyarat

- **.NET 8 SDK** (`dotnet --version`)
- **Node.js 20+** dan npm (untuk `web/`)
- **Docker** (opsional) — hanya untuk PostgreSQL lokal via `docker compose`
- Di macOS, hindari port **5000** untuk API (sering bentrok AirPlay); dev memakai **5050**

## Struktur repo

| Path | Isi |
|------|-----|
| `api/` | Solution `PacaRent.sln` — Api, Core, Infra, Tests |
| `web/` | Frontend Vite; build → `web/dist/` |
| `deploy/` | Nginx, systemd, `scripts/deploy.sh`, `api.env.example` |
| `docs/` | PRD, SRS, SDD, panduan deploy, riset UX |
| `netlify.toml` | Build Netlify (base `web/`) |
| `docker-compose.yml` | Postgres lokal saja (bukan container app) |

## Konfigurasi

### Development (default)

`api/PacaRent.Api/appsettings.Development.json` mengaktifkan **`Database:UseInMemory: true`** — tidak perlu Postgres untuk preview UI. Seed admin + mitra demo otomatis saat API start.

### Production / Postgres

Variabel utama (lihat [`deploy/scripts/api.env.example`](deploy/scripts/api.env.example)):

| Variabel | Fungsi |
|----------|--------|
| `ConnectionStrings__DefaultConnection` | PostgreSQL |
| `Jwt__Secret` | Signing JWT (min. 32 karakter) |
| `PacaRent__DocumentEncryptionKey` | Enkripsi upload KTP/selfie |
| `PacaRent__DocumentStoragePath` | Folder dokumen di server |
| `Doku__*` | Payment gateway (mock dimatikan di prod) |
| `Smtp__*` | Email OTP (mock dimatikan di prod) |
| `ASPNETCORE_URLS` | Bind Kestrel (contoh `http://127.0.0.1:5000`) |

Jangan commit secret nyata. Override via env file atau secret manager.

## Jalankan lokal

### 1. API

```bash
export DOTNET_ROOT="${DOTNET_ROOT:-$HOME/.dotnet}"
export PATH="$DOTNET_ROOT:$PATH"

cd api/PacaRent.Api
ASPNETCORE_ENVIRONMENT=Development dotnet run --urls http://localhost:5050
```

- Swagger (dev): `http://localhost:5050/swagger`
- Health: `http://localhost:5050/health`

### 2. Web

Terminal kedua:

```bash
cd web
npm install
npm run dev
```

Buka `http://localhost:5173`. Permintaan ke `/api/*` di-proxy ke `http://localhost:5050` ([`web/vite.config.ts`](web/vite.config.ts)).

### 3. PostgreSQL (opsional di lokal)

Dev default **in-memory** (tanpa Postgres). Untuk Postgres lokal, set `Database:UseInMemory` false di `appsettings.Development.json` dan jalankan Postgres sendiri, atau `docker compose up -d` jika memakai Docker.

**VPS produksi (tanpa Docker):** [`docs/guides/VPS-DEPLOY-NO-DOCKER.md`](docs/guides/VPS-DEPLOY-NO-DOCKER.md)

## Akun demo (in-memory dev)

| Peran | Login | Password |
|-------|--------|----------|
| Admin | `admin@pacarent.local` | `Admin123!` |
| Mitra | `mitra@pacarent.local` | `Mitra123!` |

OTP registrasi: kode 6 digit di **log API** (`Smtp:UseMock`). Pembayaran dev: mock DOKU — lihat Swagger / [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md).

## Scripts web

Dijalankan dari folder `web/`:

| Perintah | Fungsi |
|----------|--------|
| `npm run dev` | Dev server port 5173 |
| `npm run build` | `tsc -b && vite build` → `dist/` |
| `npm run preview` | Preview build production |
| `npm run lint` | `oxlint` |

## Tes API

```bash
cd api
dotnet test
```

## Deploy

### Frontend — Vercel atau Netlify

Web saja; **API harus host terpisah** (VPS atau host .NET).

Quickstart Vercel: [`docs/guides/VERCEL-QUICKSTART.md`](docs/guides/VERCEL-QUICKSTART.md)

Panduan lengkap: [`docs/guides/DEPLOY-VERCEL-NETLIFY.md`](docs/guides/DEPLOY-VERCEL-NETLIFY.md)

Di Vercel, set env **`VITE_API_BASE`** ke URL API (lihat [`web/.env.example`](web/.env.example)). Netlify: proxy di [`netlify.toml`](netlify.toml).

### Full stack — VPS (SDD)

```bash
./deploy/scripts/deploy.sh
```

Artefak di `publish/api` dan `publish/web`. Salin ke server, set `/etc/pacarrent/api.env` dari [`deploy/scripts/api.env.example`](deploy/scripts/api.env.example), enable [`deploy/systemd/pacarrent-api.service`](deploy/systemd/pacarrent-api.service), pasang [`deploy/nginx/pacarrent.conf`](deploy/nginx/pacarrent.conf).

## Batasan MVP

Belum siap produksi penuh tanpa setup eksternal: DOKU live, SMTP/SMS-WA nyata, review hukum escrow, beberapa angka target di PRD masih TBD. Rincian: [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md).
