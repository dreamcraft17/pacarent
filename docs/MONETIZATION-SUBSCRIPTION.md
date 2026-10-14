# Monetisasi — model langganan (ala dating app)

> **Author:** Dozer  
> **Date:** 2026-10-14  
> **Status:** Deferred — tidak dipakai di UI rilis awal (2026-10-14)

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

| App | Pola |
|-----|------|
| Tinder | Free + Plus / Gold / Platinum — unlimited like, passport, lihat like, boost |
| Bumble | Free + Premium / Premium+ — filter, spotlight, unlimited swipe |

Sumber umum: halaman langganan masing-masing app & dokumentasi App Store; detail fitur berubah per region.

## Implikasi teknis (fase)

1. **Sekarang:** booking one-shot via **DOKU Checkout** (pola sama dnPeople) — lihat `docs/guides/PAYMENT-DOKU.md`; dev pakai `Doku__UseSandboxMock=true`.
2. **Berikutnya:** entitas `Subscription` / recurring DOKU untuk Plus/Pro (terpisah dari bayar tarif mitra per booking).
3. **Escrow:** bukan value prop; jika regulasi butuh, pisahkan sebagai ops backend admin, bukan headline marketing.

## Non-goals positioning

- Jangan janji “dana aman ditahan platform” di hero/trust strip.
- Do janji: **mitra terverifikasi**, **S&K & laporan**, **langganan untuk fitur premium**.
