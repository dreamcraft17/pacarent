# PacaRent Web — Design v3

> **Author:** Dozer  
> **Date:** 2026-10-17

## Ringkas

Satu sistem UI **v3** untuk seluruh SPA: marketplace editorial (cream/teal, Fraunces + DM Sans), **tanpa** sidebar discover lama, **tanpa** mode kartu, **tanpa** `App.css` di runtime.

## Sumber CSS

| Layer | Path |
|-------|------|
| Tokens (legacy compat) | `web/src/styles/design-tokens.css`, `pacarent-theme.css` |
| **v3 (aktif)** | `web/src/styles/v3/index.css` → `01-shell`, `02-browse`, `03-pages` |

`web/src/App.css` — legacy, **tidak di-import** (referensi historis saja).

## Komponen layout

- `PageShell` — judul + dek + lebar (`narrow` / `default` / `wide`)
- `Panel` — kartu konten v3
- `AuthLayout` — login / register split
- `BrowseTrustRail` — chip keamanan di home

## Halaman

| Route | Pola |
|-------|------|
| `/` | `browse-home` masthead + grid |
| `/mitra/:id` | `v3-booking` 2 kolom |
| `/bookings`, `/profile`, `/mitra/daftar`, `/admin` | `PageShell` + `Panel` |
| `/login`, `/register` | `AuthLayout` |
| `/syarat` | `terms-page` (v3-styled) |

## Copy

`web/src/copy/discover-marketing.ts` — masthead, trust rail, launch panel, meta.
