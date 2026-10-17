# Monetisasi — model langganan (ala dating app)

> **Author:** Dozer  
> **Date:** 2026-10-14 · **Updated:** 2026-10-17  
> **Status:** Implemented (mock billing) — scaffold backend + UI sudah jalan, harga masih TBD, belum ada integrasi recurring billing asli.

## Ringkasan

PacaRent **bukan** marketplace escrow “dana ditahan sampai selesai” sebagai janji utama ke pengguna. Monetisasi platform mengikuti pola **Bumble / Tinder**: **gratis + langganan (Plus / Pro)** untuk fitur discovery & booking, bukan penahan dana sebagai produk.

Pembayaran **ke mitra** (tarif per jam) tetap bisa lewat booking; yang dijual platform adalah **akses & fitur**, seperti unlimited swipe, filter, boost, prioritas.

## Tier (MVP → produksi)

| Tier | Pengguna | Contoh fitur (roadmap) |
|------|----------|-------------------------|
| **Gratis** | Customer | Jelajahi terbatas, booking dasar, ulasan |
| **Plus** | Customer | Filter kota/kategori penuh, booking unlimited, badge Plus |
| **Pro** | Customer | Boost profil di stack, prioritas respons mitra, (opsional) lihat siapa tertarik |
| **Mitra** | Partner | Gratis daftar; opsional **Mitra Pro** — boost listing, analytics (fase 2) |

Harga **[TBD]** — uji willingness-to-pay setelah ada traksi.

## Perbandingan singkat (industri)

| App | Ladder | Consumables | Inti yang dijual |
|-----|--------|-------------|------------------|
| **Tinder** | Plus → Gold → Platinum | Boost, Super Like | Unlimited + Passport → **see who likes you** → **prioritized likes** |
| **Bumble** | Boost → Premium → Premium+ | Spotlight, SuperSwipe, Notes | Smooth swiping → **Liked You + filters** → feed priority + insights |
| **TanTan** | VIP → Premium → Ultra | Extra super likes | Cap 120 likes/hari → **see admirers** → instant match / continuous boost |

Detail + mapping ke tier PacaRent: `docs/research/dating-app-membership-patterns-2026-10-17.md`.

Sumber: help center masing-masing app (Agu–Okt 2026); fitur & harga beda per region dan plan length.

## Implikasi teknis (fase)

1. **Sekarang:** booking one-shot via **DOKU Checkout** (pola sama dnPeople) — lihat `docs/guides/PAYMENT-DOKU.md`; dev pakai `Doku__UseSandboxMock=true`.
2. **Sekarang (2026-10-17):** entitas `Subscription` (Plus/Pro/PendampingPro) sudah ada — `api/PacaRent.Core/Entities/PacaRentEntities.cs`, migrasi `AddMembershipSubscriptions`, `SubscriptionsController` (`GET /api/subscriptions/plans`, `GET /me`, `POST /checkout`, `POST /mock/complete/{id}`, `POST /cancel`, `POST /boost`, `GET /stats`). Pembayaran berulang memakai pola mock yang sama dengan booking (`Doku__UseSandboxMock`) — belum ada integrasi recurring billing DOKU asli, jadi `POST /checkout` menolak request kalau mock dimatikan.
   - Fitur yang jalan: cap 2 booking aktif untuk tier Gratis (`BusinessRules.FreeTierActiveBookingCap`), badge "Prioritas" di booking customer Pro, boost listing 24 jam untuk mitra Pendamping Pro (1×/bulan), badge "Verified+", stats agregat (jumlah view profil + booking — bukan daftar identitas, demi privasi per hipotesis #3 di `docs/research/dating-app-membership-patterns-2026-10-17.md`).
   - UI: halaman `/membership` (`web/src/pages/MembershipPage.tsx`).
   - **Belum diimplementasikan:** "filter penuh" sebagai Plus-gate (sengaja dilewati — gating filter pencarian bertentangan dengan UX discovery yang sudah di-ship), dan "rewind cancel window" (ambigu secara produk, perlu didefinisikan ulang sebelum dibangun karena menyentuh logika refund).
3. **Escrow:** bukan value prop; jika regulasi butuh, pisahkan sebagai ops backend admin, bukan headline marketing.

## Non-goals positioning

- Jangan janji “dana aman ditahan platform” di hero/trust strip.
- Do janji: **mitra terverifikasi**, **S&K & laporan**, **langganan untuk fitur premium**.
