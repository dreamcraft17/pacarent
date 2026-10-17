# Arah UX — Dating app feel, bukan template AI

> **Author:** Dozer  
> **Date:** 2026-10-16

## TL;DR

PacaRent MVP adalah **web mobile-first** (buka di browser HP), bukan app native. Discovery = **grid profil pendamping + bottom nav**—**outcome booking terverifikasi**, bukan match/chat kencan. Identitas editorial + copy **sewa pacar / teman kencan**, bukan klon Tinder atau swipe stack.

## Web MVP vs app kencan

| | App kencan (referensi) | PacaRent web MVP |
|--|------------------------|------------------|
| Channel | Native mobile | SPA Vite, dioptimalkan 4G |
| Outcome | Match → chat | **Tertarik → halaman booking** |
| Desktop | Kolom ponsel / web terbatas | **Grid Jelajahi** (`/`) responsif; `/cari` redirect ke `/` |
| Trust | Profil + match | Verifikasi, S&amp;K, escrow di sheet/booking |

## Persona (UX)

| Persona | Job | Pain | UI |
|---------|-----|------|-----|
| **Customer date** | Cari mitra untuk kencan weekend | Takut tipu / awkward | Kartu foto, badge verifikasi, hati → booking |
| **Mitra** | Terima booking aman | Dana & reputasi | Tab Booking, status escrow |
| **Baru** | Coba tanpa ribet | Filter rumit | Chip kategori + kota collapsible |

## Prioritas (PM — ICE)

| Item | Impact | Confidence | Ease | Catatan |
|------|--------|------------|------|---------|
| Card stack + aksi bulat | 5 | 5 | 4 | North star: mulai booking |
| Chip filter vs form card | 4 | 4 | 5 | Kurangi friksi pre-swipe |
| Trust di sheet/booking | 5 | 5 | 3 | Bukan strip di discover |
| SSR/SEO landing | 3 | 3 | 2 | Fase 2 |

## Design system

- **Primary:** `#0F766E` (kepercayaan, bukan pink dating generik)
- **Like / active nav:** `#c94d66` (coral hangat, kontras dengan teal)
- **Type:** Plus Jakarta Sans + Source Sans 3 (sudah di repo)
- **Radius kartu:** 22px — full-bleed feel mobile
- **Dilarang (anti-slop):** gradient ungu/indigo hero, copy “seamless/innovative”, 3 icon cards identik

## Frontend (vite-spa)

- Perfil: mobile-4G, auth-walled discover → **LCP ≤ 2500ms**, init JS ~290KB gzip (target turunkan lazy route fase 2)
- **A11y:** tombol 44px+, `aria-label` swipe, `prefers-reduced-motion`

## Validasi berikutnya

- Usability test 5 orang: task “booking date dari swipe” completion >80% — protokol: [`guides/USABILITY-DISCOVERY-H1.md`](guides/USABILITY-DISCOVERY-H1.md)
- Funnel H1 (kartu vs daftar): event `discovery_view` / `discovery_action` / `booking_submitted` — [`guides/ANALYTICS-DISCOVERY.md`](guides/ANALYTICS-DISCOVERY.md)
- A/B opsional: chip vs filter panel (H1 di `research/dating-ux-adaptation/plan.md`)
