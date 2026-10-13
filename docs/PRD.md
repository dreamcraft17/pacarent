# PRD: PacaRent (MVP Web)

**Versi:** 0.2
**Tanggal:** 13 Oktober 2026
**Author:** Dozer
**Pemilik:** Dozer, PT DN Tech
**Status:** Draf awal

---

## 1. Ringkasan

- Platform web yang mempertemukan **pengguna** (customer) dengan **mitra** (individu yang mendaftar sendiri) untuk **sewa pacar**, teman kencan, nongkrong, dan teman acara.
- Pembayaran dilakukan lewat platform. Dana diteruskan ke mitra setelah layanan selesai.

## 2. Tujuan

- Meluncurkan MVP yang bisa menyelesaikan satu siklus transaksi penuh: daftar, cari, booking, bayar, selesai, ulasan.
- Membangun kepercayaan lewat verifikasi identitas dan mekanisme pelaporan.
- Target awal: **[TBD]** transaksi selesai dalam 30 hari pertama setelah launch.

## 3. Non-Tujuan (di luar MVP)

- Aplikasi mobile native.
- Chat in-app dengan fitur media.
- Langganan atau membership.
- Kategori konser, nonton, dan belanja (dijadwalkan fase 2).

## 4. Persona

- **Pengguna (customer):** orang dewasa yang butuh teman kencan, sewa pacar untuk date, atau pendamping acara.
- **Mitra:** orang dewasa yang ingin penghasilan dari menemani kencan, nongkrong, atau acara.
- **Admin:** tim internal yang memverifikasi mitra, menangani laporan, dan memproses pencairan dana.

## 5. Kategori Layanan (MVP)

- Teman nongkrong
- Teman jalan
- Teman acara (nikahan, reuni, acara kantor)
- Sewa pacar

## 6. Fitur Utama

- **Autentikasi:** daftar dan login via email atau nomor HP, dengan OTP.
- **Profil pengguna:** data dasar, kontak darurat opsional.
- **Pendaftaran mitra:** isi profil, unggah KTP, selfie verifikasi, pilih kategori layanan.
- **Verifikasi mitra:** admin meninjau dokumen, lalu menyetujui atau menolak. Mitra hanya bisa menerima booking setelah disetujui.
- **Pencarian mitra:** filter kategori, kota, tanggal, dan rentang harga.
- **Booking:** pilih mitra, tanggal, durasi, lokasi pertemuan, dan catatan singkat.
- **Pembayaran:** bayar lewat payment gateway. Dana ditahan platform sampai layanan selesai.
- **Konfirmasi selesai:** pengguna atau mitra menandai layanan selesai, lalu dana dicairkan ke mitra.
- **Pembatalan:** aturan pembatalan dan pengembalian dana sesuai kebijakan.
- **Ulasan dan rating:** kedua pihak saling menilai setelah layanan selesai.
- **Pelaporan:** pengguna atau mitra dapat melaporkan pelanggaran. Admin menindaklanjuti.
- **Tombol darurat:** nomor atau tautan bantuan yang mudah diakses saat pertemuan.
- **Blacklist:** admin bisa memblokir akun yang melanggar aturan.
- **Syarat dan ketentuan:** wajib disetujui saat daftar (usia 18+, larangan pelecehan).

## 7. Aturan Bisnis

- Mitra wajib lulus verifikasi sebelum aktif.
- Lokasi pertemuan wajib diisi saat booking (disepakati kedua pihak).
- Usia pengguna dan mitra minimal 18 tahun.
- Dana ditahan platform sampai layanan selesai atau batas klaim berakhir **[TBD, misal 24 jam]**.
- Komisi platform: **[TBD]** persen per transaksi.
- Pelanggaran berat (pelecehan, kekerasan, tidak hadir berulang) berujung blacklist permanen.

## 8. Metrik Keberhasilan

- Jumlah mitra terverifikasi
- Jumlah booking dan tingkat booking selesai
- Rasio pembatalan
- Rata-rata rating
- Jumlah laporan per 100 transaksi

*Angka target sengaja dikosongkan. Tentukan setelah ada data awal.*

## 9. Risiko dan Mitigasi

- **Diblokir payment gateway:** konsultasi gateway dan model MCC sebelum launch.
- **Penyalahgunaan untuk hal ilegal:** verifikasi, moderasi laporan, blacklist.
- **Keselamatan pengguna dan mitra:** tombol darurat, verifikasi, rating, pelaporan.
- **Kebocoran data pribadi (KTP, selfie):** enkripsi, akses terbatas, retensi sesuai UU PDP.
- **Status hukum model bisnis:** konsultasi hukum sebelum rilis publik.

## 10. Keputusan Terbuka

- Nama final: PacaRent, Temanin, atau Kawanin?
- Model dana: split payment atau dana ditampung platform? Perlu dicek dengan gateway dan konsultan hukum.
- Batas usia dan metode verifikasi detail.
- Stack final (lihat SDD bagian 3.2).
