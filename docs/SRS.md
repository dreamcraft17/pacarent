# SRS: PacaRent (MVP Web)

**Versi:** 0.1
**Tanggal:** 12 Oktober 2026
**Author:** Dozer
**Referensi:** PRD v0.1

---

## 1. Pendahuluan

### 1.1 Tujuan
Mendefinisikan kebutuhan fungsional dan non-fungsional MVP PacaRent.

### 1.2 Cakupan
Aplikasi web untuk pengguna, mitra, dan admin. Tidak mencakup aplikasi mobile native.

### 1.3 Definisi
- **KYC:** Know Your Customer, verifikasi identitas.
- **OTP:** kode sekali pakai untuk verifikasi.
- **Escrow:** dana pembayaran ditahan platform sebelum diteruskan ke mitra.
- **UU PDP:** Undang-Undang No. 27 Tahun 2022 tentang Perlindungan Data Pribadi.

## 2. Deskripsi Umum

### 2.1 Aktor
- Pengguna (customer)
- Mitra
- Admin
- Payment gateway (sistem eksternal)
- Layanan OTP dan email (sistem eksternal)

### 2.2 Asumsi
- Pengguna memakai browser modern dan koneksi internet.
- Payment gateway, layanan OTP, dan layanan email tersedia.

### 2.3 Ketergantungan
- Payment gateway: Xendit atau Midtrans **[asumsi, belum final]**
- OTP: SMS atau WhatsApp **[asumsi]**
- Email transaksional **[asumsi]**

## 3. Kebutuhan Fungsional

**FR-01 Autentikasi**
- FR-01.1 Registrasi dengan email atau nomor HP.
- FR-01.2 Sistem mengirim OTP 6 digit dengan masa berlaku **[TBD, misal 5 menit]**.
- FR-01.3 Login terkunci setelah **[TBD, misal 5]** kali gagal.
- FR-01.4 Pengguna wajib menyetujui S&K dan kebijakan privasi saat registrasi.

**FR-02 Profil Pengguna**
- FR-02.1 Pengguna dapat mengubah nama, foto, dan kota.
- FR-02.2 Pengguna dapat menambah kontak darurat (opsional).
- FR-02.3 Sistem memverifikasi usia minimal 18 tahun dari tanggal lahir.

**FR-03 Pendaftaran dan Verifikasi Mitra**
- FR-03.1 Calon mitra mengunggah KTP dan selfie.
- FR-03.2 Admin dapat menyetujui atau menolak dengan alasan tertulis.
- FR-03.3 Mitra berstatus "Pending" sampai disetujui dan tidak tampil di pencarian.
- FR-03.4 Mitra dapat memilih satu atau lebih kategori layanan.

**FR-04 Pencarian**
- FR-04.1 Pencarian berdasarkan kategori, kota, tanggal, dan rentang harga.
- FR-04.2 Hasil hanya menampilkan mitra berstatus "Aktif".
- FR-04.3 Halaman profil mitra menampilkan rating, ulasan, dan kategori.

**FR-05 Booking**
- FR-05.1 Pengguna memilih mitra, tanggal, durasi, dan lokasi pertemuan.
- FR-05.2 Lokasi pertemuan wajib diisi (min. panjang teks); disepakati pengguna dan mitra saat booking.
- FR-05.3 Mitra menerima atau menolak booking dalam **[TBD, misal 2 jam]**.
- FR-05.4 Booking yang tidak direspons dibatalkan otomatis dan dana dikembalikan.

**FR-06 Pembayaran**
- FR-06.1 Pembayaran melalui payment gateway.
- FR-06.2 Dana berstatus "Ditahan" setelah pembayaran berhasil.
- FR-06.3 Sistem mencatat komisi platform per transaksi.
- FR-06.4 Dana dicairkan ke mitra setelah status "Selesai" dikonfirmasi atau batas klaim berakhir.

**FR-07 Penyelesaian dan Pembatalan**
- FR-07.1 Pengguna atau mitra dapat menandai layanan "Selesai".
- FR-07.2 Pembatalan mengikuti kebijakan yang ditampilkan sebelum pembayaran.
- FR-07.3 Pengembalian dana diproses sesuai kebijakan, dengan status tercatat.

**FR-08 Ulasan**
- FR-08.1 Ulasan hanya bisa dibuat setelah status "Selesai".
- FR-08.2 Rating 1 sampai 5 dengan komentar opsional.
- FR-08.3 Ulasan dapat dilaporkan dan ditinjau admin.

**FR-09 Pelaporan dan Moderasi**
- FR-09.1 Pengguna dapat melaporkan booking atau akun dengan kategori dan deskripsi.
- FR-09.2 Admin menerima antrean laporan dengan status Baru, Diproses, atau Selesai.
- FR-09.3 Admin dapat memblokir akun dan membatalkan booking terkait.

**FR-10 Panel Admin**
- FR-10.1 Admin meninjau antrean verifikasi mitra.
- FR-10.2 Admin mengelola laporan, blacklist, dan pencairan dana.
- FR-10.3 Setiap aksi admin tercatat di audit log.

**FR-11 Notifikasi**
- FR-11.1 Email untuk konfirmasi registrasi, booking, dan pembayaran.
- FR-11.2 Notifikasi in-app untuk status booking dan verifikasi.

## 4. Kebutuhan Non-Fungsional

**NFR-01 Keamanan**
- Password di-hash dengan bcrypt atau Argon2.
- Dokumen KTP dan selfie disimpan terenkripsi dan hanya bisa diakses admin.
- Seluruh komunikasi wajib HTTPS.
- Perlindungan dasar OWASP Top 10: validasi input, proteksi CSRF, rate limiting.

**NFR-02 Privasi (UU PDP)**
- Persetujuan eksplisit untuk pemrosesan data pribadi.
- Pengguna dapat meminta akses, koreksi, dan penghapusan data.
- Kebijakan retensi dokumen identitas **[TBD]**.

**NFR-03 Kinerja**
- Halaman utama dan pencarian memuat di bawah **[TBD, misal 3 detik]** pada koneksi 4G.
- Target ketersediaan **[TBD, misal 99%]** per bulan.

**NFR-04 Skalabilitas**
- Penambahan kategori dan kota tidak memerlukan perubahan struktur utama.

**NFR-05 Backup dan Pemulihan**
- Backup database harian dengan retensi **[TBD]**.

**NFR-06 Kegunaan**
- Antarmuka responsif untuk mobile browser dan desktop.
- Bahasa Indonesia sebagai bahasa utama.

**NFR-07 Audit**
- Log untuk login, perubahan status booking, pembayaran, dan aksi admin.

## 5. Batasan Desain
- Positioning produk: sewa pacar, teman kencan, dan teman acara (Bahasa Indonesia, mobile-first).
- Dokumen identitas tidak boleh tampil di antarmuka publik.
