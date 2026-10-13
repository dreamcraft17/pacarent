# PacaRent (MVP Web)

> **Author:** Dozer  
> **Date:** 2026-10-12

Platform web **sewa pacar & teman kencan**: daftar → cari → booking → bayar → selesai → ulasan.

Dokumen produk: [`docs/PRD.md`](docs/PRD.md), [`docs/SRS.md`](docs/SRS.md), [`docs/SDD.md`](docs/SDD.md).

## Struktur

| Folder | Isi |
|--------|-----|
| `api/` | ASP.NET Core 8 — `PacaRent.Api`, `PacaRent.Core`, `PacaRent.Infra`, `PacaRent.Tests` |
| `web/` | React + Vite (bahasa Indonesia, responsif) |
| `deploy/` | Nginx, systemd, skrip deploy, contoh env |
| `docs/` | PRD, SRS, SDD |

## Jalankan lokal

```bash
# Database
docker compose up -d

# API (port 5000)
export DOTNET_ROOT="$HOME/.dotnet"
export PATH="$DOTNET_ROOT:$PATH"
cd api/PacaRent.Api
dotnet run --urls http://localhost:5050

# Web (port 5173, proxy /api)
cd web && npm install && npm run dev
```

Akun admin seed: `admin@pacarent.local` / `Admin123!`

OTP dev: kode 6 digit muncul di **log API** (mock SMS/email).

Pembayaran dev: endpoint mock DOKU (`POST /api/payments/mock/complete/{bookingId}`) — ganti ke webhook DOKU produksi setelah akun gateway disetujui.

## Deploy frontend (Vercel / Netlify)

Panduan langkah demi langkah (hybrid: web di edge, API di VPS): [`docs/guides/DEPLOY-VERCEL-NETLIFY.md`](docs/guides/DEPLOY-VERCEL-NETLIFY.md).

File siap pakai: [`netlify.toml`](netlify.toml), [`web/vercel.json`](web/vercel.json) — **ganti URL API** sebelum produksi.

## Deploy VPS (tanpa Docker app)

```bash
./deploy/scripts/deploy.sh
# rsync publish/ ke /opt/pacarent, salin deploy/scripts/api.env.example → /etc/pacarrent/api.env
sudo systemctl enable --now pacarrent-api
```

## Cakupan SRS (MVP)

Lihat [`docs/IMPLEMENTATION-STATUS.md`](docs/IMPLEMENTATION-STATUS.md) untuk pemetaan FR/NFR ke kode.

**Belum produksi-ready tanpa konfigurasi eksternal:** integrasi DOKU live (signature + disbursement), SMTP/OTP SMS-WA nyata, konsultasi hukum escrow, target metrik/TBD di PRD.
# pacarent
