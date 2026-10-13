# UI Research Brief — PacaRent MVP

> **Author:** Dozer  
> **Date:** 2026-10-13  
> **Generated:** Routed fallback (research) + skill synthesis (UX, market, design system, CPO)

## TL;DR

UI PacaRent harus **membangun kepercayaan dua sisi** (pengguna + mitra) dengan sinyal verifikasi, escrow, dan aturan pertemuan yang jelas—bukan tampilan marketplace generik biru/ungu. Positioning produk: **sewa pacar / teman kencan** (PRD v0.2). Warna utama **teal** (#0F766E), copy **Bahasa Indonesia konkret**, mobile-first 4G. North star produk: **booking selesai dengan mitra terverifikasi**, bukan pageview.

## Routing (research)

`classifier.py` → **fallback** (0 specialist signals). Investigasi via WebSearch + PRD/SRS internal.

## Persona & journey (UX)

| Persona | Job utama | Pain | UI implication |
|---------|-----------|------|----------------|
| **Pengguna date/acara** | Sewa pacar, kencan, atau temani acara | Takut penipuan / mitra tidak cocok | Profil jelas (kategori, bio, rating); badge mitra terverifikasi |
| **Mitra** | Income dari teman acara aman | Takut tidak dibayar / reputasi | Timeline dana ditahan → dicairkan; status verifikasi jelas |
| **Admin** | Moderasi & KYC | Volume laporan | Panel terpisah, audit trail visible |

**Journey kritis:** Awareness → Cari (filter) → Profil mitra → Booking → Bayar (escrow) → Pertemuan (darurat) → Selesai → Ulasan.

Opportunity score tinggi: **status transaksi visual** + **trust strip persisten** di booking.

## Segmentasi (market-research lens)

Slice yang **bukan** segment: "siapa saja butuh teman" (gagal substantiality/accessibility gate — analogi sample `segmentation_scorer`).

**Segment MVP yang actionable:**

1. Pengguna urban 25–40, acara keluarga/kantor, budget conscious — **accessible** via SEO + referral.
2. Mitra part-time dengan KTP lengkap — **measurable** via verification funnel.

Sizing angka TBD sampai ada data; UI tidak perlu spurious precision on TAM.

## Desain sistem (ui-design-system)

- Brand: `#0F766E` (teal — trust/calm, bukan dating-app pink/purple)
- Tokens: `web/src/styles/design-tokens.css`
- Typography: Plus Jakarta Sans (display) + Source Sans 3 (body) — lokal, readable
- Semantic: success/warning/error untuk status booking & pembayaran
- WCAG: kontras teks body ≥ 4.5:1 pada `--color-neutral-800` on `--color-surface-50`

## Anti-slop audit (sebelum)

| Fingerprint | Status lama |
|-------------|-------------|
| Indigo CTA #2563eb | Ya — diperbaiki |
| Vite default purple `index.css` | Ya — dihapus |
| Centered `#root` template | Ya — diperbaiki |
| Generic hero | Ya — diganti outcome spesifik PRD |

## Frontend profile (senior-frontend)

**Konteks aktual:** Vite SPA + proxy API (bukan Remix)—acceptable untuk MVP auth-heavy; **SEO** landing cukup dengan meta + konten statis hero.

| Assumption | Nilai |
|------------|-------|
| Device | mobile-4G primary |
| LCP target | 2000ms p75 |
| Bundle | ~87KB gzip JS (build terakhir) — within vite-spa budget |

Rekomendasi fase 2: SSR/SSG untuk halaman publik mitra jika SEO organik jadi channel #1.

## CPO lens

| North star (MVP) | Leading UI metrics |
|------------------|-------------------|
| Booking **completed** / minggu | Conversion profil → booking started |
| | Checkout mock→paid completion |
| | % mitra card dengan badge verified clicked |

**Invest** UI trust + booking timeline. **Maintain** admin tables. **Kill** decorative motion / feature laundry list di landing.

## Sources

1. [Tokopedia checkout case — promo transparency & sticky CTA](https://www.evanyudis.com/p/tokopedia-purchase-flow) — secondary  
2. [Marketplace trust UI — verification, escrow bar](https://gapsystudio.com/blog/marketplace-ui-ux-design/) — secondary  
3. [Fintech Playbook Indonesia — lokalisasi, QRIS, trust](https://www.austrade.gov.au/content/dam/austrade-assets/global/wip/austrade/documents/fintech-playbook-indonesia.pdf) — primary (regional)  
4. PRD/SRS PacaRent v0.1 — primary (product)  

**Audit (fallback):** Queries sent 1 | Sources received 5 | Sources cited 4
