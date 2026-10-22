import { Link } from 'react-router-dom';

export default function CommunityGuidelinesPage() {
  return (
    <article className="terms-page">
      <header className="terms-header">
        <p className="terms-eyebrow">Aturan main</p>
        <h1>Aturan Komunitas</h1>
        <p className="terms-lead">
          Aturan ini wajib dipatuhi setiap pengguna dan pendamping. Pelanggaran dapat berujung pada peringatan,
          pembatasan fitur, penangguhan, pemblokiran permanen, dan/atau pelaporan kepada pihak berwenang.
        </p>
        <p className="terms-updated">
          Berlaku bersama <Link to="/syarat">Syarat &amp; Ketentuan</Link> PacaRent — diperbarui 22 Oktober 2026
        </p>
      </header>

      <div className="terms-layout">
        <nav className="terms-nav" aria-label="Daftar isi Aturan Komunitas">
          <p className="terms-nav-title">Di halaman ini</p>
          <a href="#syarat-dasar">Syarat dasar</a>
          <a href="#larangan-mutlak">Larangan mutlak</a>
          <a href="#larangan-perilaku">Larangan perilaku</a>
          <a href="#chat-jadwal">Chat &amp; jadwal</a>
          <a href="#keselamatan">Keselamatan pertemuan</a>
          <a href="#pelaporan">Pelaporan &amp; moderasi</a>
          <a href="#sanksi">Sanksi</a>
          <a href="#tanggung-jawab">Tanggung jawab pengguna</a>
          <a href="#pembaruan">Pembaruan aturan</a>
        </nav>

        <div className="terms-content">
          <section id="syarat-dasar" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">01</span>
              <h2>Syarat dasar</h2>
            </div>
            <ul>
              <li>Usia minimal <strong>18 tahun</strong>. Akun yang terindikasi dimiliki oleh pengguna di bawah umur akan langsung dinonaktifkan.</li>
              <li>Satu orang hanya boleh memiliki <strong>satu akun</strong>.</li>
              <li>Data yang diberikan harus <strong>benar dan terkini</strong>. Identitas palsu atau profil yang menyamar sebagai orang lain dilarang.</li>
              <li>Akun tidak boleh dipindahtangankan.</li>
            </ul>
          </section>

          <section id="larangan-mutlak" className="terms-section terms-section-callout">
            <div className="terms-section-heading">
              <span className="terms-section-number">02</span>
              <h2>Larangan mutlak</h2>
            </div>
            <p className="terms-callout-lead">
              Pelanggaran berikut <strong>langsung</strong> berujung pada pemblokiran permanen, tanpa peringatan
              terlebih dahulu:
            </p>
            <ul>
              <li><strong>Transaksi atau tawaran seksual</strong> dalam bentuk apa pun, termasuk ajakan, permintaan, atau kesepakatan yang melibatkan imbalan untuk layanan seksual.</li>
              <li><strong>Pengguna atau konten yang melibatkan anak</strong> atau siapa pun di bawah 18 tahun, dalam bentuk apa pun, termasuk konten seksual dan konten yang mengarah pada eksploitasi.</li>
              <li><strong>Kekerasan, ancaman kekerasan, atau pemerasan</strong> terhadap pengguna lain.</li>
              <li><strong>Perdagangan orang, eksploitasi, atau kerja paksa</strong>, termasuk tekanan untuk bertemu atau menerima pembayaran.</li>
              <li><strong>Penipuan</strong>, termasuk meminta uang, transfer, atau data pribadi dengan dalih apa pun.</li>
              <li><strong>Penyalahgunaan narkotika, minuman keras untuk menjebak, atau memberi zat tanpa persetujuan.</strong></li>
              <li><strong>Penyebaran data pribadi</strong> orang lain tanpa izin (doxing), termasuk foto, alamat, nomor telepon, atau tempat kerja.</li>
            </ul>
          </section>

          <section id="larangan-perilaku" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">03</span>
              <h2>Larangan perilaku</h2>
            </div>
            <h3>Pelecehan &amp; perilaku tidak pantas</h3>
            <ul>
              <li>Pelecehan seksual, komentar, gambar, atau pesan bernuansa seksual yang tidak diminta.</li>
              <li>Merendahkan, menghina, atau menyerang orang lain berdasarkan ras, agama, suku, gender, orientasi seksual, disabilitas, atau kondisi fisik.</li>
              <li>Menguntit (stalking), mengintai, atau terus menghubungi setelah diminta berhenti.</li>
              <li>Mengancam atau memaksa pengguna lain untuk bertemu.</li>
            </ul>
            <h3>Konten</h3>
            <ul>
              <li>Konten vulgar, pornografi, atau eksploitatif, termasuk foto dan video.</li>
              <li>Konten kekerasan atau yang menampilkan kekerasan.</li>
              <li>Ujaran kebencian, provokasi SARA, atau propaganda kekerasan.</li>
              <li>Konten yang melanggar hak cipta atau hak privasi orang lain.</li>
            </ul>
            <h3>Spam &amp; penyalahgunaan fitur</h3>
            <ul>
              <li>Spam, promosi produk atau jasa lain, dan pesan massal.</li>
              <li>Mengirim tautan berbahaya, phishing, atau tautan ke situs di luar platform untuk tujuan yang tidak sah.</li>
              <li>Membuat banyak akun untuk menghindari pemblokiran atau memanipulasi laporan.</li>
              <li>Menggunakan bot, skrip, atau alat otomatis tanpa izin tertulis.</li>
              <li>Melaporkan pengguna lain secara palsu atau sebagai bentuk balas dendam.</li>
            </ul>
          </section>

          <section id="chat-jadwal" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">04</span>
              <h2>Aturan chat &amp; jadwal</h2>
            </div>
            <ul>
              <li>Komunikasi harus <strong>sopan dan jelas</strong>.</li>
              <li>Ajakan harus disampaikan dengan <strong>jelas</strong>, dan penolakan harus <strong>dihormati</strong>. Jangan mendesak atau terus mengirim pesan setelah ditolak.</li>
              <li>Jadwal harus mencantumkan <strong>tanggal, waktu, dan lokasi</strong>. Lokasi wajib berupa <strong>tempat umum</strong> untuk pertemuan pertama.</li>
              <li>Perubahan atau pembatalan jadwal harus <strong>diberitahukan</strong> secepat mungkin.</li>
              <li>Dilarang mencantumkan <strong>nominal, tarif, atau imbalan</strong> dalam chat atau jadwal yang berkaitan dengan layanan seksual. Pelanggaran akan langsung ditangani sesuai bagian Larangan mutlak.</li>
              <li>Dilarang memaksa atau mengarahkan pengguna lain untuk pindah ke platform lain sebagai syarat pertemuan.</li>
            </ul>
          </section>

          <section id="keselamatan" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">05</span>
              <h2>Keselamatan pertemuan</h2>
            </div>
            <ul>
              <li>Pertemuan pertama harus di <strong>tempat umum yang ramai</strong>.</li>
              <li>Beri tahu <strong>orang tepercaya</strong> tentang rencana, lokasi, dan waktu pertemuan.</li>
              <li>Pengguna berhak menghentikan pertemuan kapan saja dan <strong>tidak wajib memberi alasan</strong>.</li>
              <li>Jika merasa terancam, hubungi <strong>112</strong> atau kepolisian setempat, lalu laporkan melalui fitur laporan PacaRent.</li>
            </ul>
          </section>

          <section id="pelaporan" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">06</span>
              <h2>Pelaporan &amp; moderasi</h2>
            </div>
            <ul>
              <li>Gunakan fitur <strong>Laporkan</strong> untuk setiap pelanggaran. Laporan yang jujur dan lengkap membantu tim menindaklanjuti dengan cepat.</li>
              <li>Laporan darurat (ancaman langsung, kekerasan, eksploitasi anak) ditangani sebagai prioritas tertinggi.</li>
              <li>Tim moderasi dapat meminta bukti tambahan dan mengambil tindakan sementara sambil menunggu investigasi.</li>
              <li>Keputusan moderasi dicatat. Pengguna dapat mengajukan keberatan sesuai prosedur yang tersedia di aplikasi.</li>
              <li>PacaRent dapat bekerja sama dengan aparat penegak hukum sesuai peraturan yang berlaku.</li>
            </ul>
          </section>

          <section id="sanksi" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">07</span>
              <h2>Sanksi</h2>
            </div>
            <table className="terms-table">
              <thead>
                <tr>
                  <th>Tingkat pelanggaran</th>
                  <th>Contoh</th>
                  <th>Sanksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ringan</td>
                  <td>Spam kecil, kata kasar, pelanggaran jadwal</td>
                  <td>Peringatan tertulis</td>
                </tr>
                <tr>
                  <td>Sedang</td>
                  <td>Pelecehan verbal berulang, konten tidak pantas, pelanggaran aturan chat</td>
                  <td>Pembatasan fitur sementara atau penangguhan</td>
                </tr>
                <tr>
                  <td>Berat</td>
                  <td>Pelecehan seksual, ancaman, penipuan, doxing</td>
                  <td>Pemblokiran permanen</td>
                </tr>
                <tr>
                  <td>Sangat berat</td>
                  <td>Eksploitasi anak, transaksi seksual, kekerasan, perdagangan orang</td>
                  <td>Pemblokiran permanen dan pelaporan kepada aparat penegak hukum</td>
                </tr>
              </tbody>
            </table>
            <p className="terms-callout-lead" style={{ marginTop: '0.85rem' }}>
              PacaRent dapat menjatuhkan sanksi langsung pada tingkat mana pun jika dianggap perlu demi keselamatan
              pengguna.
            </p>
          </section>

          <section id="tanggung-jawab" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">08</span>
              <h2>Tanggung jawab pengguna</h2>
            </div>
            <ul>
              <li>Setiap pengguna <strong>bertanggung jawab penuh</strong> atas perilaku, komunikasi, dan keputusan pribadinya.</li>
              <li>Aktivitas di luar aplikasi, termasuk setelah pertemuan, berada <strong>di luar kendali PacaRent</strong>. Pengguna wajib mematuhi hukum yang berlaku.</li>
              <li>Pelanggaran yang dilakukan oleh atau terhadap pengguna dalam pertemuan tetap menjadi tanggung jawab pihak yang terlibat, sebagaimana diatur dalam Syarat &amp; Ketentuan.</li>
            </ul>
          </section>

          <section id="pembaruan" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">09</span>
              <h2>Pembaruan aturan</h2>
            </div>
            <ul>
              <li>Aturan ini dapat diperbarui sewaktu-waktu. Perubahan penting akan diinformasikan melalui aplikasi.</li>
              <li>Dengan terus menggunakan PacaRent setelah pembaruan, pengguna dianggap menyetujui aturan yang berlaku.</li>
            </ul>
            <p className="terms-disclaimer">
              Dokumen ini bukan nasihat hukum. Untuk sengketa serius atau kerugian besar, konsultasikan penasihat
              hukum dan laporkan kepada aparat yang berwenang.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
