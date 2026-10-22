import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <article className="terms-page">
      <header className="terms-header">
        <p className="terms-eyebrow">Sebelum mulai</p>
        <h1>Syarat &amp; Ketentuan</h1>
        <p className="terms-lead">
          Ringkasan aturan PacaRent biar lo dan pendamping sama-sama tahu batasnya, tanggung jawabnya, dan cara pakai
          platform ini dengan aman.
        </p>
        <p className="terms-updated">
          Ringkasan · Diperbarui 19 Oktober 2026 · Berlaku bersama <Link to="/aturan">Aturan Komunitas</Link>
        </p>
      </header>

      <section className="terms-summary" aria-labelledby="terms-summary-title">
        <h2 id="terms-summary-title" className="sr-only">
          Hal penting
        </h2>
        <div className="terms-summary-item">
          <span className="terms-summary-icon" aria-hidden>
            18+
          </span>
          <div>
            <strong>Untuk orang dewasa</strong>
            <span>Lo dan pendamping wajib berusia minimal 18 tahun.</span>
          </div>
        </div>
        <div className="terms-summary-item">
          <span className="terms-summary-icon" aria-hidden>
            ✓
          </span>
          <div>
            <strong>Saling menghormati</strong>
              <span>Pelecehan, ancaman, penipuan, dan spam dilarang di PacaRent.</span>
          </div>
        </div>
        <div className="terms-summary-item">
          <span className="terms-summary-icon" aria-hidden>
            !
          </span>
          <div>
            <strong>Pilih pertemuan yang aman</strong>
            <span>Pilih lokasi publik dan sepakati detail jadwal dengan jelas.</span>
          </div>
        </div>
      </section>

      <div className="terms-layout">
        <nav className="terms-nav" aria-label="Daftar isi Syarat dan Ketentuan">
          <p className="terms-nav-title">Di halaman ini</p>
          <a href="#peran">Peran PacaRent</a>
          <a href="#syarat-umum">Syarat umum</a>
          <a href="#interaksi">Chat, jadwal &amp; ketemuan</a>
          <a href="#kesepakatan">Kesepakatan &amp; pembayaran</a>
          <a href="#penerimaan">Penerimaan</a>
        </nav>

        <div className="terms-content">
          <section id="peran" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">01</span>
              <h2>Peran PacaRent</h2>
            </div>
            <p>
              PacaRent menyediakan platform digital yang mempertemukan <strong>pengguna</strong> dengan{' '}
              <strong>pendamping</strong> untuk event, nongkrong, dinner, dan aktivitas sosial yang disepakati. PacaRent{' '}
              <strong>bukan</strong> pihak dalam kesepakatan pribadi antara pengguna dan pendamping, tidak mengawasi
              pertemuan secara langsung, dan tidak menjamin hasil, kecocokan, ketersediaan, atau kepuasan dari interaksi
              di lapangan.
            </p>
          </section>

          <section id="syarat-umum" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">02</span>
              <h2>Syarat umum</h2>
            </div>
            <ul>
              <li>Lo dan pendamping wajib berusia minimal 18 tahun dan kasih data yang benar.</li>
              <li>Semua pihak wajib saling hormat; pelecehan, ancaman, penipuan, atau pelanggaran hukum dapat berujung pemblokiran dan laporan ke pihak berwenang.</li>
              <li>Gunakan chat dan fitur jadwal PacaRent buat mulai ngobrol dan menyusun rencana dengan jelas.</li>
              <li>Lokasi, waktu, dan bentuk pertemuan perlu disepakati bersama; pilih tempat umum yang aman bila memungkinkan.</li>
              <li>Data pribadi diproses sesuai kebijakan privasi dan peraturan perlindungan data pribadi yang berlaku di Indonesia.</li>
            </ul>
          </section>

          <section id="interaksi" className="terms-section terms-section-callout">
            <div className="terms-section-heading">
              <span className="terms-section-number">03</span>
              <h2>Chat, jadwal &amp; ketemuan</h2>
            </div>
            <p className="terms-callout-lead">Baca bagian ini sebelum mulai chat atau ketemuan.</p>
            <ul>
              <li>
                Lo bisa mulai chat langsung tanpa nunggu match atau persetujuan awal. Pendamping bisa membalas,
                menyepakati jadwal, atau menolak ajakan sesuai ketersediaan dan kenyamanannya.
              </li>
              <li>
                Chat atau jadwal yang disepakati <strong>bukan jaminan</strong> bahwa pertemuan pasti terjadi atau
                bahwa kedua pihak cocok. Komunikasikan perubahan, pembatalan, dan batasan dengan jelas.
              </li>
              <li>
                Ketemu di tempat umum, kasih tahu orang tepercaya tentang rencana, gunakan fitur bagikan rencana bila
                tersedia, dan hentikan interaksi bila merasa tidak aman. Untuk keadaan darurat, hubungi layanan darurat.
              </li>
              <li>
                Fitur laporan dan moderasi PacaRent membantu menindak pelanggaran aturan platform, tetapi{' '}
                <strong>tidak menggantikan</strong> tanggung jawab pribadi masing-masing pihak dan tidak menjamin
                ganti rugi atau penyelesaian sengketa di luar lingkup layanan platform.
              </li>
            </ul>
          </section>

          <section id="kesepakatan" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">04</span>
              <h2>Kesepakatan &amp; pembayaran</h2>
            </div>
            <p>
              PacaRent tidak menetapkan, menjamin, atau menampilkan nominal kesepakatan pribadi antara pengguna dan
              pendamping. Detail kesepakatan, bila ada, harus dipahami dan disetujui kedua pihak sebelum pertemuan.
              PacaRent saat ini berada dalam fase early access; fitur pembayaran resmi dapat belum aktif. Jika fitur
              pembayaran melalui platform diaktifkan, ketentuan biaya, refund, dan prosesnya akan diumumkan di aplikasi.
            </p>
          </section>

          <section id="penerimaan" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">05</span>
              <h2>Penerimaan</h2>
            </div>
            <p>
              Dengan mendaftar atau menggunakan PacaRent, lo menyatakan sudah membaca, memahami, dan menyetujui
              ringkasan ini. Ketentuan bisa diperbarui; perubahan penting akan dikabarkan lewat platform.
            </p>
            <p className="terms-disclaimer">
              Bukan nasihat hukum. Untuk sengketa serius atau kerugian besar, konsultasikan penasihat hukum dan laporkan
              ke aparat sesuai peraturan yang berlaku.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
