# Plan: Adaptasi UX Bumble/Tinder untuk PacaRent

> **Author:** Dozer  
> **Date:** 2026-10-13  
> **Genre:** decision + validation

## Keputusan yang diinformasi

Apakah PacaRent MVP adopt **card-stack discovery** ala Tinder/Bumble untuk **sewa pacar / teman kencan** (bukan chat-match dating)?

## Hipotesis (falsifiable)

1. **H1:** Card-stack + tombol biner (lewati / lihat booking) ↑ conversion **mulai booking** vs grid list.  
2. **H2:** Bottom nav 3 tab ↑ retention session vs top-nav saja.  
3. **H3:** Trust signals (verifikasi, escrow, S&K) + kategori jelas ↑ perceived safety vs swipe saja tanpa konteks booking.

## Scope in / out

| In (MVP) | Out |
|----------|-----|
| Satu kartu fokus, stack berikutnya di belakang | Super Like, blur “who liked you” paywall |
| Tombol + swipe opsional | Chat pre-match |
| Overlay profil (sheet) tanpa leave stack | Infinite engagement loops |

## Sourcing strategy

- UX audit dating apps (secondary)
- PRD PacaRent (primary product)
- Market segmentation tool (methodology)

## Risk register

| Risk | Mitigasi UI |
|------|-------------|
| Diblokir gateway / regulasi | Badge verifikasi, S&K, escrow; legal review sebelum produksi |
| Photo-first bias | Tampilkan kategori acara + rating di kartu |
| Dark pattern dating | Tidak ada FOMO match 24h |

## Stop criteria

Implementasi cukup jika: Discover + bottom nav + overlay profil shipped & build pass.
