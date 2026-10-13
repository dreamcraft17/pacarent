# SDD: PacaRent (MVP Web)

**Versi:** 0.1
**Tanggal:** 12 Oktober 2026
**Author:** Dozer
**Referensi:** PRD v0.1, SRS v0.1

---

## 1. Tujuan dan Lingkup

- Menjelaskan arsitektur, komponen, data, dan alur MVP PacaRent.
- Desain ini dibuat agar ringan dijalankan di satu VPS dan mudah dideploy **tanpa Docker**.

## 2. Prinsip Desain

- **Sesedikit mungkin komponen.** Satu proses API, satu database, satu web server.
- **Deploy manual yang bisa diulang.** Build lokal, unggah artefak, restart service.
- **Ramah ke tim .NET.** Backend memakai ekosistem yang sudah dikuasai.

## 3. Tech Stack

### 3.1 Ringkasan

- **Backend:** ASP.NET Core Web API (.NET 8 LTS)
- **Frontend:** React + Vite, dibangun menjadi file statis
- **Database:** PostgreSQL
- **Web server dan reverse proxy:** Nginx
- **Proses backend:** systemd
- **Background job:** BackgroundService di dalam proses API (tanpa Hangfire, tanpa Redis)
- **Penyimpanan dokumen KTP dan selfie:** folder terenkripsi di luar web root, dengan rencana pindah ke object storage bila sudah diperlukan
- **Autentikasi:** JWT access token pendek plus refresh token
- **Payment:** DOKU (lihat bagian 3.3)

### 3.2 Alasan Pemilihan

- ASP.NET Core menghasilkan satu folder publish yang bisa langsung dijalankan di Linux. Tidak perlu runtime tambahan selain .NET runtime.
- React + Vite menghasilkan file statis. Nginx cukup untuk melayaninya, tanpa proses Node.js yang berjalan terus.
- PostgreSQL dan Nginx dipasang langsung di VPS dengan paket sistem, sehingga mudah dipantau dan di-backup.
- Background job cukup dijalankan di dalam API. Antrean eksternal baru diperlukan jika volume transaksi sudah besar.

**Alternatif yang juga ringan:** SQLite untuk tahap paling awal, lalu migrasi ke PostgreSQL. Namun data pembayaran dan verifikasi sebaiknya langsung di PostgreSQL.

### 3.3 Payment Gateway: DOKU

- Gateway yang dipakai: DOKU. Integrasi mengikuti dokumentasi DOKU versi terbaru, dan detail endpoint, signature, serta callback **[perlu dicek ulang ke dokumentasi DOKU sebelum coding]**.
- Metode pembayaran (VA, e-wallet, kartu) mengikuti yang aktif di akun DOKU.
- **Yang belum dipastikan:** (a) apakah akun DOKU untuk kategori layanan ini disetujui, (b) apakah fitur split payment atau penahanan dana (escrow) tersedia untuk akun kami. Ini harus dikonfirmasi ke tim DOKU sebelum desain pencairan final.
- Jika split atau escrow tidak tersedia, model alternatifnya: dana masuk ke rekening platform, lalu pencairan ke mitra dilakukan manual atau lewat disbursement terpisah. Keputusan ini mempengaruhi `payments.status` dan job pencairan di bagian 8.1.

## 4. Arsitektur Tingkat Tinggi

```
[Browser]
   |
   v
[Nginx :443]  --- /         --> file statis React (dist/)
   |          --- /api/*    --> reverse proxy --> [ASP.NET Core API :5000]
   |                                                 |        |
   |                                                 |        +--> [PostgreSQL :5432]
   |                                                 |        +--> [Folder dokumen terenkripsi]
   |                                                 |        +--> [Payment Gateway] <--> webhook /api/payments/webhook
   |                                                 |        +--> [SMTP / OTP provider]
   |                                                 +--> [BackgroundService: pencairan, auto-cancel, pengingat]
```

## 5. Struktur Proyek

```
pacarrent/
├── api/                    # ASP.NET Core solution
│   ├── PacaRent.Api/       # Controller, middleware, Program.cs
│   ├── PacaRent.Core/      # Entity, enum, aturan bisnis
│   └── PacaRent.Infra/     # EF Core, repository, integrasi gateway, email
├── web/                    # React + Vite
│   ├── src/
│   └── dist/               # hasil build, diunggah ke server
├── deploy/
│   ├── nginx/pacarrent.conf
│   ├── systemd/pacarrent-api.service
│   └── scripts/deploy.sh
└── docs/                   # PRD, SRS, SDD
```

## 6. Komponen Utama (Modul Backend)

- **Auth:** registrasi, login, OTP, JWT, refresh token.
- **User dan Profile:** data pengguna dan mitra.
- **Verification:** antrean dan status verifikasi mitra.
- **Search:** query mitra dengan filter berbasis SQL.
- **Booking:** siklus status dan validasi aturan lokasi.
- **Payment:** integrasi gateway, escrow, komisi, pencairan, webhook.
- **Review:** rating dan ulasan.
- **Moderation:** laporan, blacklist, audit log.
- **Notification:** email dan notifikasi in-app.

## 7. Model Data

**users**
- id, email, phone, password_hash, role (user / partner / admin), status, created_at

**user_profiles**
- user_id, full_name, birth_date, city, photo_url, emergency_contact (opsional)

**partner_profiles**
- user_id, verification_status (pending / approved / rejected), rejection_reason, ktp_file_ref, selfie_file_ref, verified_at

**categories**
- id, name, is_active

**partner_categories**
- partner_id, category_id

**bookings**
- id, user_id, partner_id, category_id, scheduled_at, duration_hours, meeting_location, notes, status, created_at

**Status booking:** pending_partner, accepted, paid, in_progress, completed, cancelled, refunded, disputed

**payments**
- id, booking_id, gateway_ref, amount, platform_fee, status (held / released / refunded), held_at, released_at

**reviews**
- id, booking_id, reviewer_id, target_id, rating, comment, created_at

**reports**
- id, reporter_id, target_type, target_id, reason, description, status, handled_by, created_at

**audit_logs**
- id, actor_id, action, entity, entity_id, payload (JSON), created_at

## 8. Alur Utama

### 8.1 Booking dan Pembayaran
1. Pengguna membuat booking. Status: `pending_partner`.
2. Mitra menerima. Status: `accepted`. Jika tidak direspons dalam batas waktu, booking dibatalkan otomatis.
3. Pengguna membayar. Webhook gateway diverifikasi, status menjadi `paid`, payment menjadi `held`.
4. Saat hari layanan, status `in_progress`.
5. Pengguna atau mitra menandai `completed`.
6. BackgroundService mencairkan dana (`released`) setelah batas klaim, dikurangi komisi.
7. Pengguna dapat memberi ulasan.

### 8.2 Verifikasi Mitra
1. Calon mitra mengunggah KTP dan selfie. Status `pending`.
2. Admin meninjau. Setujui (`approved`) atau tolak dengan alasan (`rejected`).
3. Mitra `approved` tampil di pencarian.

### 8.3 Laporan
1. Pengguna membuat laporan.
2. Admin meninjau dan mengambil tindakan (peringatan, pembatalan, blacklist).
3. Setiap tindakan tercatat di audit log.

## 9. Desain API (contoh)

- `POST /api/auth/register`, `POST /api/auth/verify-otp`, `POST /api/auth/login`, `POST /api/auth/refresh`
- `GET /api/partners?category=&city=&date=&minPrice=&maxPrice=`
- `GET /api/partners/{id}`
- `POST /api/partners/apply`
- `POST /api/admin/partners/{id}/approve`, `POST /api/admin/partners/{id}/reject`
- `POST /api/bookings`, `POST /api/bookings/{id}/accept`, `POST /api/bookings/{id}/complete`, `POST /api/bookings/{id}/cancel`
- `POST /api/payments/webhook` (wajib validasi signature)
- `POST /api/reviews`
- `POST /api/reports`
- `GET /api/admin/reports`, `POST /api/admin/users/{id}/block`

## 10. Keamanan

- JWT access token berumur pendek, refresh token disimpan aman.
- Role-based access control: user, partner, admin.
- Validasi signature pada webhook payment gateway.
- Dokumen identitas dienkripsi saat disimpan. Akses hanya lewat endpoint admin, bukan URL publik.
- Rate limiting untuk OTP dan login (`AddRateLimiter` bawaan ASP.NET Core).
- Validasi dan sanitasi input untuk ulasan dan laporan.
- Secret disimpan di file environment dengan izin baca terbatas (`/etc/pacarrent/*.env`), tidak di repository.

## 11. Penanganan Error dan Logging

- Format error API konsisten: kode, pesan, detail.
- Log terstruktur ke file dan journald (via systemd).
- Log khusus untuk alur pembayaran dan webhook.
- Notifikasi (email ke admin) saat webhook gagal atau job pencairan gagal.

## 12. Pengujian

- **Unit test:** status booking, perhitungan komisi, aturan pembatalan.
- **Integration test:** alur pembayaran dengan sandbox gateway.
- **E2E test:** daftar, booking, bayar, selesai, ulasan.
- **Uji keamanan dasar** sebelum launch.

## 13. Deployment (tanpa Docker)

### 13.1 Kebutuhan VPS
- Ubuntu 22.04 atau 24.04 LTS
- .NET 8 runtime (ASP.NET Core)
- PostgreSQL 15 atau lebih baru
- Nginx
- Certbot untuk sertifikat TLS (Let's Encrypt)

### 13.2 Langkah Deploy
1. Build backend: `dotnet publish -c Release -o publish/api`
2. Build frontend: `npm run build`, hasilnya di `web/dist`
3. Unggah `publish/api` dan `web/dist` ke VPS, misalnya via `rsync` atau `scp`.
4. Jalankan migrasi database: `dotnet ef database update` atau bundle migrasi.
5. Restart service: `sudo systemctl restart pacarrent-api`
6. Reload Nginx: `sudo systemctl reload nginx`

### 13.3 Konfigurasi
- `deploy/systemd/pacarrent-api.service`: menjalankan `dotnet PacaRent.Api.dll` sebagai user khusus, dengan `Restart=always`.
- `deploy/nginx/pacarrent.conf`: melayani file statis dan meneruskan `/api` ke port 5000.
- Environment dan secret di `/etc/pacarrent/api.env`.

### 13.4 Lingkungan
- Development (lokal)
- Staging (VPS terpisah atau subdomain)
- Production (VPS produksi)

### 13.5 Backup
- Backup PostgreSQL harian dengan `pg_dump`, disimpan di luar VPS.
- Folder dokumen terenkripsi ikut di-backup dengan jadwal yang sama.

## 14. Hal yang Perlu Dikonfirmasi

- Stack di bagian 3 sudah disetujui. Prioritas: mudah dimigrasi dan ringan.
- DOKU: konfirmasi akun untuk kategori layanan ini, serta ketersediaan split payment atau escrow (bagian 3.3).
- Spesifikasi VPS: menyamakan dengan VPS project DnPeople/DnTech. **[TBD, spesifikasi belum tercatat di project]**
- Konsultasi hukum sebelum launch, terutama soal dana yang ditahan platform.
