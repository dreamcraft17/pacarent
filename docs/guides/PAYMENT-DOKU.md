# Pembayaran DOKU (PacaRent)

> **Author:** Dozer  
> **Date:** 2026-10-14

Pola integrasi **sama dengan dnPeople**: DOKU **Checkout Non-SNAP** (`POST /checkout/v1/payment`), webhook dengan header `Client-Id` / `Request-Id` / `Request-Timestamp` / `Signature`, redirect ke halaman hosted DOKU.

Referensi implementasi dnPeople: `dnpeople/backend/src/lib/doku.ts` · setup merchant: [PG/README.md](https://github.com/dntech/company-wiki/blob/main/docs/products/dnPeople/docs/PG/README.md) (wiki).

## Env API (VPS)

Salin dari `deploy/scripts/api.env.example`:

| Variabel | Contoh |
|----------|--------|
| `Doku__UseSandboxMock` | `false` di prod |
| `Doku__IsProduction` | `false` sandbox, `true` live |
| `Doku__ClientId` | `MCH-...` (Back Office DOKU) |
| `Doku__SecretKey` | Active Secret Key |
| `Doku__ApiPublicUrl` | `https://api.pacarent.dntech.id` |
| `Doku__NotificationUrl` | `https://api.pacarent.dntech.id/api/payments/webhook/doku` |
| `Doku__WebCallbackUrl` | `https://<vercel-app>/bookings` |

**Jangan** set `Doku__PaymentMethodTypes` kecuali channel sudah aktif di Back Office (sama rekomendasi dnPeople).

## Alur user

1. Mitra **terima** booking → status `Accepted`.
2. User **Bayar via DOKU** → API buat invoice `PR-{bookingId}` → redirect ke URL checkout DOKU.
3. DOKU **webhook** → `POST /api/payments/webhook/doku` → booking `Paid`.
4. Setelah redirect, web memanggil `POST /api/payments/sync/{bookingId}` (Check Status API) jika webhook belum sampai.

## Early release (sekarang)

`PacaRent__SkipBookingPayment=true` (default) — **tidak wajib bayar**; setelah mitra terima, status langsung siap **Tandai selesai**. Matikan flag ini saat DOKU live.

## Dev

`Doku__UseSandboxMock=true` → tombol **Bayar (mock DOKU)** tanpa call gateway (hanya jika `SkipBookingPayment=false`).
