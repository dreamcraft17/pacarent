# Analytics — funnel discovery H1

> **Author:** Dozer  
> **Date:** 2026-10-16

Event ringan di browser untuk membandingkan **mode kartu** (`/`) vs **mode daftar** (`/cari`) sebelum redesign besar. Implementasi: [`web/src/lib/analytics.ts`](../../web/src/lib/analytics.ts).

## Event

| Name | Payload | Kapan |
|------|---------|--------|
| `discovery_view` | `discovery_mode`: `card` \| `list` | Mount halaman Jelajahi / Daftar |
| `discovery_action` | `action`, `discovery_mode` | Lewati, tertarik, swipe, buka profil dari grid |
| `booking_started` | `source`: `card` \| `list` \| `detail`, `partnerId` | Navigasi ke `/mitra/:id` |
| `booking_submitted` | `partnerId`, `source` (dari session) | POST booking sukses |

## Membaca buffer (dev / pre-GA)

Di konsol browser:

```javascript
JSON.parse(localStorage.getItem('pacarent_analytics_v1') || '[]')
```

Filter funnel H1:

```javascript
const ev = JSON.parse(localStorage.getItem('pacarent_analytics_v1') || '[]');
const views = ev.filter((e) => e.name === 'discovery_view');
const submitted = ev.filter((e) => e.name === 'booking_submitted');
console.table({ views: views.length, submitted: submitted.length });
```

## Integrasi produksi (opsional)

Dengarkan `window` event `pacarent-analytics` dan forward ke Plausible/GA4/posthog. Env tambahan tidak wajib untuk MVP.

## Preferensi desktop

`sessionStorage.pacarent_discovery_mode` = `card` \| `list` — set via toggle topbar. Desktop `(min-width: 768px)` + `(pointer: fine)` default redirect `/` → `/cari` kecuali user memilih **Kartu**.
