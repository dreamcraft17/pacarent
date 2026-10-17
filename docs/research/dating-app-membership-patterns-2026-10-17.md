# Pola membership — Bumble, Tinder, TanTan

> **Author:** Dozer  
> **Date:** 2026-10-17  
> **Routed:** research → fallback (competitive patterns, bukan specialist dossier)

## TL;DR

Ketiga app pakai **freemium + ladder langganan** (2–4 tier) plus **consumable** (boost / super-like). Yang dibayar user bukan “match”-nya, tapi **hapus batas**, **lihat intent orang lain**, dan **tampil lebih dulu**. PacaRent bisa mirror ladder ini ke **discovery + booking**, bukan swipe.

## Pola bersama (cross-app)

| Kategori fitur | Contoh industri | Analog PacaRent (booking) |
|----------------|-----------------|---------------------------|
| **Hapus friction** | Unlimited like/swipe, rewind | Unlimited booking / lihat lebih banyak profil per hari |
| **Discovery power** | Filter advanced, passport/roaming | Filter kota/kategori/event, “cari di luar domisili” |
| **Intent reveal** | See who likes you | Lihat siapa yang mark tertarik / viewed profile (hati-hati privasi) |
| **Visibility** | Boost, Spotlight, prioritized likes | Boost listing pendamping di grid kondangan season |
| **Status** | VIP badge, incognito | Badge Plus, mode low-profile |
| **Consumable** | Beli boost/SuperSwipe satuan | Boost 24 jam jelang weekend / Super “prioritas balas” |

**Billing:** auto-renew (cancel ≥24 jam sebelum renew); harga region-specific; fitur bisa beda per plan length (Tinder: Boost bulanan tidak di weekly plan).

## Per app

### Bumble — Boost → Premium → Premium+

Sumber: [Bumble Support — paid features](https://support.bumble.com/hc/en-us/articles/32668790872733-Understanding-Bumble-s-paid-features-and-subscription-plans)

- **Boost:** unlimited likes, SuperSwipe/Spotlight quota mingguan, extend match, rematch, backtrack.
- **Premium:** semua Boost + **Liked You**, advanced filters, incognito, travel mode.
- **Premium+:** semua Premium + photo insights, **fast-track likes**, prioritas feed, quota Notes/SuperSwipe/Spotlight lebih besar.
- **Consumables:** SuperSwipe, Spotlight, Notes (single-use).

Tone produk: “optional — Bumble works great even without them.”

### Tinder — Plus → Gold → Platinum

Sumber: [Tinder Help — subscriptions](https://www.help.tinder.com/hc/en-us/articles/115004487406-Tinder-subscriptions), [Subscription tiers](https://tinder.com/feature/subscription-tiers)

- **Plus:** unlimited likes, rewinds, Passport, ad-free, incognito.
- **Gold:** Plus + **See Who Likes You**, weekly Super Likes, monthly Boost (syarat plan).
- **Platinum:** Gold + **Prioritized Likes** (FAQ juga sebut message-before-match di beberapa region — cek app lokal).
- Copy ladder: “freedom” → “see who said yes” → “be seen everywhere.”

### TanTan — VIP → Premium → Ultra

Sumber: [TanTan Buy](https://thetantanapp.com/buy), [Terms of Use](https://thetantanapp.com/terms-of-use), [App Store CN VIP copy](https://apps.apple.com/cn/app/%E6%8E%A2%E6%8E%A2-%E6%8E%A2%E7%B4%A2%E7%B2%BE%E5%BD%A9%E6%8E%A2%E7%B4%A2%E7%88%B1/id861891048)

- **VIP:** unlimited likes (free ~120/hari di CN FAQ), 5 super likes/hari, rewind, roam location, badge, ad-free, hide last seen.
- **Premium:** VIP + see who likes you, advanced filter, read receipts, monthly boost, dll.
- **Ultra:** instant matches harian, continuous boost, unlimited super likes.
- **Add-on:** “See Who Likes Me” bisa layer di atas VIP (terms).

## Rekomendasi tier PacaRent (sel selaras `MONETIZATION-SUBSCRIPTION.md`)

| Tier | Positioning (casual) | Fitur inti |
|------|----------------------|------------|
| **Gratis** | “Coba dulu — booking dasar” | Browse terbatas, 1–2 booking aktif, filter basic |
| **Plus** (~Bumble Boost / Tinder Plus) | “Minus one fix, tanpa batas” | Unlimited booking interest, filter penuh, rewind cancel window, badge Plus |
| **Pro** (~Gold/Premium) | “Tau siapa kepo sama kamu” | Lihat views/interest queue, prioritas notif ke pendamping, 1× boost listing/bulan |
| **Pendamping Pro** | “Muncul pas kondangan season” | Boost grid, stats sederhana, badge verified+ |

**Tetap pisahkan:** langganan platform ≠ bayar tarif pendamping per booking (DOKU one-shot).

**Jangan copy:** unlimited swipe romantis, “match chat”, passport untuk hookup — ganti ke **event + jadwal + lokasi public**.

## Hipotesis (falsifiable)

1. User akan bayar **Plus** untuk hapus cap booking/browse sebelum bayar **Pro**.
2. **Boost consumable** (weekend kondangan) monetizes lebih baik di ID daripada tier Platinum-style.
3. “See who interested” raises privacy complaints — perlu opt-in / aggregate di PacaRent.

## Audit

- Queries sent: 4 | Sources received: 8+ | Sources cited: 6  
- Failures: 0  
- Primary: Bumble Support, Tinder Help, TanTan terms/buy  
- Secondary: Tinder marketing page, App Store listings  
