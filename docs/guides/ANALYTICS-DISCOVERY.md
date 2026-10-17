# Analytics — funnel discovery H1

> **Author:** Dozer  
> **Date:** 2026-10-16

Event ringan di browser untuk funnel **Jelajahi** (`/`) → booking. Implementasi: [`web/src/lib/analytics.ts`](../../web/src/lib/analytics.ts).

## Event

| Name | Payload | Kapan |
|------|---------|--------|
| `discovery_view` | `discovery_mode`: `browse` | Mount halaman Jelajahi |
| `discovery_action` | `action`: `profile_open`, `discovery_mode`: `browse` | Buka profil dari grid |
| `booking_started` | `source`: `browse` \| `detail`, `partnerId` | Navigasi ke `/mitra/:id` |
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

## Booking source

`sessionStorage.pacarent_last_booking_source` = `browse` \| `detail` — diset saat user buka profil dari grid vs langsung ke detail.
