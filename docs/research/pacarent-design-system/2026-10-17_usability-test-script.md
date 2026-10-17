# Skrip Usability Test — Tahap 4 (Validasi Pengguna)

> **Author:** Dozer
> **Date:** 2026-10-17
> **Status:** Siap dijalankan — menunggu 5 peserta

## Konteks

Dokumen ini adalah protokol siap-pakai untuk item Tahap 4 di [DESIGN-PLAN.md](../../DESIGN-PLAN.md#tahap-4--validasi-pengguna). Tahap ini memerlukan sesi moderated remote dengan pengguna asli dan tidak bisa dijalankan secara otomatis — skrip di bawah disiapkan supaya sesi bisa langsung dimulai begitu 5 peserta tersedia.

## Tujuan sesi

1. Memastikan pengguna memahami tindakan berikutnya di setiap state (loading/empty/error/success).
2. Memastikan pengguna memahami bahwa hasil akhir PacaRent adalah **booking**, bukan **match**.
3. Mengukur completion rate task discovery → detail profil.
4. Membandingkan preferensi mode `Kartu` vs `Daftar` di mobile dan desktop.

## Peserta

- 5 pengguna target (belum pernah memakai PacaRent).
- Campuran device: minimal 2 mobile, minimal 2 desktop.
- Durasi per sesi: 25–30 menit, remote, direkam (layar + audio) dengan izin peserta.

## Skrip sesi

### 1. Pembukaan (2 menit)

> "Terima kasih sudah meluangkan waktu. Saya akan minta kamu menyelesaikan beberapa tugas di sebuah aplikasi bernama PacaRent sambil berpikir keras (think-aloud) — ceritakan apa yang kamu lihat, apa yang kamu pikirkan, dan apa yang mau kamu klik, sebelum kamu klik. Tidak ada jawaban salah; kita sedang menguji aplikasinya, bukan kamu."

### 2. Task utama (10 menit)

**Task:** "Kamu ingin ditemani ke acara minggu depan. Cari mitra yang cocok dan jelaskan langkah berikutnya."

Amati dan catat:
- [ ] Apakah peserta membuka mode `Kartu` atau `Daftar` lebih dulu?
- [ ] Apakah peserta menyebutkan kata "match"/"jodoh" atau "booking"/"pesan"?
- [ ] Apakah peserta menemukan filter kategori/kota tanpa bantuan?
- [ ] Apakah peserta membuka detail profil (klik kartu)?
- [ ] Apakah peserta menyebutkan langkah berikutnya tanpa diminta (mis. "lalu saya isi tanggal dan lokasi")?

**Pertanyaan follow-up (setelah task):**
- "Menurutmu, apa yang terjadi kalau kamu klik tombol itu?"
- "Kalau kamu lanjut, hasil akhirnya kira-kira apa?"

### 3. Task detail booking (8 menit)

**Task:** "Sekarang coba isi form booking untuk mitra ini sampai kamu merasa siap klik kirim — tidak perlu benar-benar kirim."

Amati dan catat:
- [ ] Apakah peserta memperhatikan ringkasan biaya sebelum submit?
- [ ] Apakah peserta membaca kebijakan pembatalan / lokasi aman di dekat tombol?
- [ ] Apakah peserta ragu-ragu di salah satu field — di mana, dan kenapa?
- [ ] Apakah peserta merasa cukup informasi untuk klik tombol booking dengan percaya diri?

**Pertanyaan follow-up:**
- "Apa yang bikin kamu yakin (atau ragu) untuk lanjut booking?"
- "Kalau kamu harus membatalkan nanti, apa yang kamu ingat soal aturannya?"

### 4. Task mode kartu vs daftar (5 menit)

**Task:** "Coba pindah ke mode satunya (kartu ↔ daftar) dan cari mitra yang sama tadi."

- [ ] Mode mana yang terasa lebih cepat untuk peserta ini?
- [ ] Mode mana yang terasa lebih "aman"/"dipercaya"?
- [ ] Apakah preferensi berbeda antara device mobile vs desktop?

### 5. Penutup (3–5 menit)

- "Dalam satu kalimat, menurutmu PacaRent ini untuk apa?"
- "Ada bagian yang terasa membingungkan atau terlalu ramai?"
- "Skala 1–5, seberapa percaya diri kamu untuk benar-benar booking mitra lewat aplikasi ini?"

## Lembar skor (isi per peserta)

| Peserta | Device | Paham next action tanpa bantuan? | Sebut "booking" bukan "match"? | Selesai discovery→detail? | Mode disukai |
|---|---|---|---|---|---|
| P1 | | | | | |
| P2 | | | | | |
| P3 | | | | | |
| P4 | | | | | |
| P5 | | | | | |

## Kriteria keberhasilan (dari DESIGN-PLAN.md)

- Minimal 4/5 peserta paham tindakan berikutnya tanpa bantuan.
- Minimal 4/5 peserta paham bahwa PacaRent berakhir pada booking, bukan match.
- Completion rate discovery → detail profil ≥ 80%.
- Error rate interaksi filter/CTA < 15%.

## Setelah sesi

1. Rekap temuan per task (pola, bukan opini tunggal — minimal 2/5 peserta mengalami hal yang sama baru dicatat sebagai temuan).
2. Bandingkan hasil terhadap kriteria keberhasilan di atas.
3. Tulis keputusan desain di `docs/research/pacarent-design-system/<tanggal>_decision.md` mengikuti format [2026-10-17_decision.md](2026-10-17_decision.md).
4. Update checklist Tahap 4 di `DESIGN-PLAN.md` setelah sesi selesai dan hasil dianalisis.
