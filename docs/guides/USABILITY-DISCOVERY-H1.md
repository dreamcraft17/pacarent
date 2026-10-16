# Usability test — booking dari discovery (n=5)

> **Author:** Dozer  
> **Date:** 2026-10-16

Validasi hipotesis H1 ([`research/dating-ux-adaptation/plan.md`](../research/dating-ux-adaptation/plan.md)): card-stack vs daftar untuk **mulai booking**.

## Rekrut

- 5 partisipan, usia 18+, target persona PRD (urban, butuh teman date/acara).
- Campur perangkat: minimal 3 HP, 1–2 laptop (untuk uji mode daftar default).

## Task (moderated, 30–40 menit)

**Skenario:** “Kamu butuh teman untuk nongkrong akhir pekan di Jakarta. Pakai PacaRent sampai kamu yakin sudah mengirim permintaan booking (login dummy jika perlu).”

**Success:** halaman konfirmasi booking atau daftar booking terbuka setelah submit.

**Metrik:**

| Metrik | Target |
|--------|--------|
| Task completion | ≥ 80% (4/5) |
| Waktu ke `booking_started` | Catat; bandingkan kartu vs daftar |
| Error / bantuan moderator | ≤ 1 intervensi besar per orang |

## Variasi (between-subjects ringkas)

- **Kelompok A (3 orang):** mulai di `/` mode kartu (paksa lewat toggle jika desktop).
- **Kelompok B (2 orang):** mulai di `/cari` mode daftar.

Catat `discovery_mode` dari analytics buffer setelah sesi.

## Pertanyaan pasca-task

1. Apakah produk terasa seperti app kencan atau layanan booking? (harapkan “booking”)
2. Mode mana lebih nyaman di perangkatmu?
3. Apa yang bikin ragu sebelum booking?

## Stop / iterate

- Jika completion &lt; 60%: prioritaskan trust di halaman booking, bukan ganti card stack dulu.
- Jika desktop ≥ 2/2 gagal di kartu: pertahankan default daftar (sudah shipped).

## Checklist moderator

- [ ] Akun test / OTP siap
- [ ] Mitra dummy tersedia di API
- [ ] Screen + audio rekam (izin)
- [ ] Export `pacarent_analytics_v1` setelah sesi
