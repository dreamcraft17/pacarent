export default function TermsPage() {
  return (
    <article className="terms-page">
      <header className="terms-header">
        <p className="terms-eyebrow">Sebelum mulai</p>
        <h1>Syarat &amp; Ketentuan</h1>
        <p className="terms-lead">
          Ringkasan aturan PacaRent supaya pengguna dan mitra tahu apa yang boleh, apa yang menjadi tanggung jawab
          masing-masing, dan bagaimana menggunakan platform dengan aman.
        </p>
        <p className="terms-updated">Ringkasan · Diperbarui 14 Oktober 2026</p>
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
            <span>Pengguna dan mitra wajib berusia minimal 18 tahun.</span>
          </div>
        </div>
        <div className="terms-summary-item">
          <span className="terms-summary-icon" aria-hidden>
            ✓
          </span>
          <div>
            <strong>Saling menghormati</strong>
            <span>Pelecehan, ancaman, dan penipuan diluar tanggung jawab Platform (PacaRent).</span>
          </div>
        </div>
        <div className="terms-summary-item">
          <span className="terms-summary-icon" aria-hidden>
            !
          </span>
          <div>
            <strong>Pilih pertemuan yang aman</strong>
            <span>Gunakan lokasi publik dan sepakati detail booking dengan jelas.</span>
          </div>
        </div>
      </section>

      <div className="terms-layout">
        <nav className="terms-nav" aria-label="Daftar isi Syarat dan Ketentuan">
          <p className="terms-nav-title">Di halaman ini</p>
          <a href="#peran">Peran PacaRent</a>
          <a href="#syarat-umum">Syarat umum</a>
          <a href="#pertemuan">Pertemuan &amp; tanggung jawab</a>
          <a href="#pembayaran">Pembayaran</a>
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
              <strong>mitra</strong> untuk sewa pacar, teman kencan, nongkrong, dan pendamping acara. PacaRent{' '}
              <strong>bukan</strong> pihak dalam perjanjian layanan antara pengguna dan mitra, tidak mengawasi
              pertemuan secara langsung, dan tidak menjamin hasil atau kepuasan dari interaksi di lapangan.
            </p>
          </section>

          <section id="syarat-umum" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">02</span>
              <h2>Syarat umum</h2>
            </div>
            <ul>
              <li>Pengguna dan mitra wajib berusia minimal 18 tahun dan memberikan data yang benar.</li>
              <li>Semua pihak wajib saling hormat; pelecehan, ancaman, penipuan, atau pelanggaran hukum dapat berujung pemblokiran dan laporan ke pihak berwenang.</li>
              <li>Lokasi, waktu, dan bentuk pertemuan disepakati saat booking; pilih tempat umum yang aman bila memungkinkan.</li>
              <li>Data pribadi diproses sesuai kebijakan privasi dan peraturan perlindungan data pribadi yang berlaku di Indonesia.</li>
            </ul>
          </section>

          <section id="pertemuan" className="terms-section terms-section-callout">
            <div className="terms-section-heading">
              <span className="terms-section-number">03</span>
              <h2>Pertemuan &amp; tanggung jawab</h2>
            </div>
            <p className="terms-callout-lead">Baca bagian ini sebelum menyepakati booking.</p>
            <ul>
              <li>
                Segala <strong>perilaku, komunikasi, transaksi, atau perjanjian</strong> yang terjadi saat atau setelah
                pertemuan fisik maupun di luar fitur resmi aplikasi (misalnya chat/transfer di luar PacaRent,
                perpanjangan waktu, imbalan tambahan, atau hubungan pribadi) adalah{' '}
                <strong>sepenuhnya tanggung jawab pengguna dan mitra</strong> yang bersangkutan.
              </li>
              <li>
                PacaRent <strong>tidak bertanggung jawab</strong> atas cedera, kerugian materiil atau immateriil,
                sengketa, penipuan, pelanggaran hukum, atau kerusakan yang timbul dari interaksi antar pengguna,
                termasuk kejadian setelah booking ditandai selesai atau setelah pengguna berhenti menggunakan platform.
              </li>
              <li>
                Fitur laporan dan moderasi PacaRent membantu menindak pelanggaran aturan platform, tetapi{' '}
                <strong>tidak menggantikan</strong> tanggung jawab pribadi masing-masing pihak dan tidak menjamin
                ganti rugi atau penyelesaian sengketa di luar lingkup layanan platform.
              </li>
              <li>
                Apabila terjadi perselisihan, pengguna dan mitra diminta menyelesaikannya secara damai terlebih dahulu;
                PacaRent dapat, tanpa kewajiban, membantu mediasi administratif sejauh kebijakan internal mengizinkan.
              </li>
            </ul>
          </section>

          <section id="pembayaran" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">04</span>
              <h2>Pembayaran</h2>
            </div>
            <p>
              Pada fase <strong>early access</strong>, pembayaran online melalui platform dapat belum aktif. Tarif atau
              imbalan yang disepakati antara pengguna dan mitra di luar fitur bayar resmi menjadi tanggung jawab para
              pihak. Apabila pembayaran melalui gateway (misalnya DOKU) diaktifkan di kemudian hari, ketentuan biaya
              dan refund akan diumumkan di aplikasi.
            </p>
          </section>

          <section id="penerimaan" className="terms-section">
            <div className="terms-section-heading">
              <span className="terms-section-number">05</span>
              <h2>Penerimaan</h2>
            </div>
            <p>
              Dengan mendaftar atau menggunakan PacaRent, Anda menyatakan telah membaca, memahami, dan menyetujui
              ringkasan ini. Ketentuan dapat diperbarui; perubahan material akan diinformasikan melalui platform.
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
