# Rencana Desain Baru PacaRent

> **Status:** Aktif · **Terakhir diperbarui:** 2026-10-17 · **Penulis:** Dozer

## Ringkasan

PacaRent akan memakai arah desain **quiet confidence / editorial marketplace**: hangat, rapi, manusiawi, dan terasa aman untuk mengatur pertemuan. Desain ini mempertahankan alur produk yang sudah ada—mencari mitra, melihat profil, membuat booking, membayar, dan menyelesaikan layanan—tetapi membangun identitas visual sendiri yang tidak terlihat seperti template SaaS atau aplikasi dating generik.

Dokumen ini menjelaskan alasan, prinsip, ruang lingkup, tahapan, dan ukuran keberhasilan desain baru.

## Masalah desain saat ini

Versi sebelumnya masih terasa seperti halaman kosong yang direntangkan ke layar desktop:

- terlalu banyak ruang kosong tanpa arahan yang kuat;
- header dan navigasi belum memiliki hierarki yang jelas;
- empty state belum cukup menjelaskan apa yang terjadi dan apa langkah berikutnya;
- visual card masih mudah diasosiasikan dengan aplikasi dating;
- trust signal belum menjadi bagian utama dari perjalanan menuju booking.

Masalah utamanya bukan sekadar warna. Pengguna perlu memahami tiga hal dalam beberapa detik:

1. PacaRent digunakan untuk apa.
2. Apakah prosesnya cukup aman untuk dilanjutkan.
3. Apa tindakan berikutnya yang harus dilakukan.

## Tujuan desain

- Membuat PacaRent terlihat seperti kategori produk miliknya sendiri.
- Mengubah discovery dari “mencari kecocokan” menjadi “merencanakan booking”.
- Membangun kepercayaan sebelum pengguna membuka detail atau mengisi form.
- Membuat halaman tetap berguna meskipun jumlah mitra masih nol.
- Menjaga pengalaman mobile-first tanpa membuat desktop terasa seperti versi mobile yang diperbesar.
- Menjaga komponen interaktif tetap mudah disentuh, dibaca, dan dipahami.

## Arah visual

### Konsep: quiet confidence

PacaRent tidak perlu terlihat ramai untuk terlihat menarik. Daya tariknya datang dari komposisi yang tenang, tipografi yang tegas, ruang yang terkontrol, dan detail kecil yang konsisten.

| Elemen | Keputusan desain | Alasan |
|---|---|---|
| Kanvas | Off-white hangat | Mengurangi kesan dashboard steril dan memberi karakter editorial. |
| Teks utama | Deep ink / hijau gelap | Memberi kontras dan rasa stabil tanpa hitam yang terlalu keras. |
| Aksen | Teal | Sudah menjadi warna kepercayaan PacaRent dan cocok untuk CTA/status. |
| Surface | Paper putih dengan border lembut | Membuat content group terbaca tanpa shadow berlebihan. |
| Tipografi | Plus Jakarta Sans untuk heading, Source Sans 3 untuk body | Heading terasa khas; body tetap nyaman dibaca dalam Bahasa Indonesia. |
| Radius | Sedang dan konsisten | Menghindari tampilan terlalu korporat atau terlalu playful. |
| Motion | Singkat dan fungsional | Feedback interaksi diperbolehkan; dekorasi yang tidak membantu dihindari. |

Token semantic utama berada di [`web/src/styles/pacarent-theme.css`](../web/src/styles/pacarent-theme.css):

- `--pr-ink`
- `--pr-ink-soft`
- `--pr-canvas`
- `--pr-paper`
- `--pr-line-warm`
- `--pr-mint`
- `--pr-booking`

## Prinsip UX

### 1. Selalu tunjukkan langkah berikutnya

Loading, empty, error, dan success state harus menjawab “sekarang saya bisa melakukan apa?”. Empty state tidak boleh hanya berbunyi “belum ada data”.

### 2. Trust sebelum charm

Sinyal verifikasi, tarif, kota, jadwal, lokasi, pembayaran, dan status booking harus lebih menonjol daripada dekorasi visual.

### 3. Booking, bukan match

Bahasa dan ikon harus mengikuti pekerjaan pengguna: tertarik, lihat profil, pilih tanggal, tentukan lokasi, dan buat booking. Hindari heart, match, atau mechanic yang membuat produk terasa seperti dating app.

### 4. Satu CTA utama

Setiap surface memiliki satu aksi utama dan satu alternatif yang lebih tenang. Ini menjaga fokus dan mengurangi keraguan.

### 5. Responsive by composition

- Desktop: app bar compact, sidebar trust, content discovery yang lebih lebar.
- Mobile: satu fokus utama, filter ringkas, bottom navigation, dan kontrol minimal 44px bila memungkinkan.

## Rencana halaman utama

### A. App bar

Isi:

- brand mark PacaRent;
- mode `Kartu` / `Daftar`;
- aksi akun bila diperlukan.

Alasan: navigasi utama harus stabil dan mudah dipindai. Header tidak boleh menjadi panel dekoratif yang mengambil perhatian lebih besar daripada konten.

### B. Discovery header

Isi:

- eyebrow singkat;
- headline yang menjelaskan manfaat;
- jumlah profil;
- filter kategori dan kota.

Alasan: pengguna perlu memahami konteks sebelum memilih profil.

### C. Trust sidebar desktop

Isi:

- cara kerja singkat;
- profil terverifikasi;
- tanggal dan lokasi;
- dana/status lewat platform;
- tautan syarat dan ketentuan.

Alasan: ruang desktop dimanfaatkan untuk menjawab keraguan tanpa menambah modal atau tutorial paksa.

### D. Empty state

Isi:

- mark visual PacaRent;
- status bahwa marketplace masih bertumbuh;
- penjelasan singkat tentang booking;
- tiga langkah: pilih profil, atur jadwal, booking aman;
- CTA `Ajukan jadi mitra`;
- alternatif `Mode kartu`.

Alasan: ketika inventory kosong, halaman tetap menjadi onboarding kontekstual dan memberi jalur langsung ke tindakan yang relevan.

### E. Partner card/list

Urutan informasi:

1. Foto atau placeholder identitas.
2. Badge terverifikasi.
3. Nama dan kota.
4. Tarif dan rating.
5. Bio singkat.
6. CTA `Tertarik · booking`.

Alasan: urutan ini mengikuti keputusan pengguna dari trust → relevance → affordability → action.

## Tahapan implementasi

### Tahap 1 — Foundation

- [x] Menetapkan arah visual quiet confidence.
- [x] Menambahkan semantic tokens untuk canvas, ink, paper, line, mint, dan booking.
- [x] Menyusun research pack dan alasan desain.
- [x] Menambahkan brand mark PacaRent.

### Tahap 2 — Discover/list

- [x] Merapikan app bar desktop.
- [x] Membuat sidebar trust.
- [x] Mengurangi dead space pada layout desktop.
- [x] Mendesain empty state dengan tiga langkah.
- [x] Menjaga versi mobile tetap satu fokus.

### Tahap 3 — Booking trust

- [x] Tambahkan ringkasan biaya sebelum submit booking.
- [x] Tambahkan timeline status: `Diajukan → Diterima → Dibayar → Selesai`.
- [x] Tampilkan aturan pembatalan dan lokasi aman di dekat CTA.
- [x] Audit ulang detail partner dan halaman bookings agar memakai token yang sama.

### Tahap 4 — Validasi pengguna

- [x] Siapkan skrip usability test siap-pakai: [2026-10-17_usability-test-script.md](research/pacarent-design-system/2026-10-17_usability-test-script.md) (butuh 5 peserta asli — belum bisa dijalankan otomatis).
- [ ] Uji 5 pengguna target secara moderated remote.
- [ ] Task: “Kamu ingin ditemani ke acara minggu depan. Cari mitra yang cocok dan jelaskan langkah berikutnya.”
- [ ] Ukur apakah pengguna memahami bahwa hasil akhirnya adalah booking, bukan match.
- [ ] Uji preferensi mode kartu vs daftar pada mobile dan desktop.

## Kriteria keberhasilan

### UX

- Minimal 4 dari 5 pengguna dapat menyebutkan tindakan berikutnya tanpa bantuan.
- Minimal 4 dari 5 pengguna memahami bahwa PacaRent berakhir pada booking.
- Completion rate task discovery → detail profil minimal 80% pada usability test.
- Error rate interaksi filter dan CTA di bawah 15%.

### Aksesibilitas

- Kontrol penting memiliki target sentuh minimal 44px jika memungkinkan.
- Semua aksi swipe memiliki tombol alternatif.
- Focus state terlihat jelas.
- Kontras teks normal memenuhi WCAG AA.

### Performa

- Target LCP mobile-4G p75: 2.000 ms.
- Tidak menambah library visual besar hanya untuk empty state.
- Bundle route discover dipantau agar tetap sesuai batas Vite SPA yang sudah dipilih.

## Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Gaya editorial terasa terlalu premium | Produk terasa jauh dari pengguna lokal | Pertahankan copy Bahasa Indonesia yang pendek dan konkret. |
| Empty state terlalu ramai | Pengguna melewati CTA | Jadikan tiga langkah ringkas dan hapus/reduksi setelah inventory tersedia. |
| Teal digunakan terlalu banyak | Hierarki visual menjadi datar | Simpan teal untuk action dan trust; gunakan ink, cream, dan border untuk struktur. |
| Card mode terasa seperti dating app | Positioning produk kabur | Gunakan calendar/check cue dan bahasa booking, bukan heart/match. |
| Visual bagus tetapi conversion rendah | Investasi desain tidak menghasilkan nilai | Ukur profile open, booking started, dan booking completed. |

## Sumber keputusan

- [Research decision 2026-10-17](research/pacarent-design-system/2026-10-17_decision.md)
- [Skrip usability test Tahap 4](research/pacarent-design-system/2026-10-17_usability-test-script.md)
- [Research plan](research/pacarent-design-system/plan.md)
- [UX research brief](UI-RESEARCH-BRIEF.md)
- [Dating UX adaptation decision](research/dating-ux-adaptation/2026-10-13_decision.md)
- [Implementation status](IMPLEMENTATION-STATUS.md)

