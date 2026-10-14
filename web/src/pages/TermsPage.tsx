export default function TermsPage() {
  return (
    <div className="card terms-page">
      <h1>Syarat &amp; Ketentuan</h1>
      <p className="muted terms-updated">Ringkasan untuk pengguna. Versi lengkap dapat diperbarui seiring fitur platform.</p>

      <section>
        <h2>1. Peran PacaRent</h2>
        <p>
          PacaRent menyediakan platform digital yang mempertemukan <strong>pengguna</strong> dengan{' '}
          <strong>mitra</strong> untuk sewa pacar, teman kencan, nongkrong, dan damping acara. PacaRent{' '}
          <strong>bukan</strong> pihak dalam perjanjian layanan antara pengguna dan mitra, tidak mengawasi
          pertemuan secara langsung, dan tidak menjamin hasil atau kepuasan dari interaksi di lapangan.
        </p>
      </section>

      <section>
        <h2>2. Syarat umum</h2>
        <ul>
          <li>Pengguna dan mitra wajib berusia minimal 18 tahun dan memberikan data yang benar.</li>
          <li>Semua pihak wajib saling hormat; pelecehan, ancaman, penipuan, atau pelanggaran hukum dapat berujung pemblokiran dan laporan ke pihak berwenang.</li>
          <li>Lokasi, waktu, dan bentuk pertemuan disepakati saat booking; pilih tempat umum yang aman bila memungkinkan.</li>
          <li>Data pribadi diproses sesuai kebijakan privasi dan peraturan perlindungan data pribadi yang berlaku di Indonesia.</li>
        </ul>
      </section>

      <section>
        <h2>3. Pertemuan, perjanjian, dan tanggung jawab setelah booking</h2>
        <ul>
          <li>
            Segala <strong>perilaku, komunikasi, transaksi, atau perjanjian</strong> yang terjadi saat atau setelah
            pertemuan fisik maupun di luar fitur resmi aplikasi (misalnya chat/transfer di luar PacaRent, perpanjangan
            waktu, imbalan tambahan, atau hubungan pribadi) adalah{' '}
            <strong>sepenuhnya tanggung jawab pengguna dan mitra</strong> yang bersangkutan.
          </li>
          <li>
            PacaRent <strong>tidak bertanggung jawab</strong> atas cedera, kerugian materiil atau immateriil, sengketa,
            penipuan, pelanggaran hukum, atau kerusakan yang timbul dari interaksi antar pengguna, termasuk kejadian
            setelah booking ditandai selesai atau setelah pengguna berhenti menggunakan platform.
          </li>
          <li>
            Fitur laporan dan moderasi PacaRent membantu menindak pelanggaran aturan platform, tetapi{' '}
            <strong>tidak menggantikan</strong> tanggung jawab pribadi masing-masing pihak dan tidak menjamin ganti
            rugi atau penyelesaian sengketa di luar lingkup layanan platform.
          </li>
          <li>
            Apabila terjadi perselisihan, pengguna dan mitra diminta menyelesaikannya secara damai terlebih dahulu;
            PacaRent dapat, tanpa kewajiban, membantu mediasi administratif sejauh kebijakan internal mengizinkan.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Pembayaran</h2>
        <p>
          Pada fase <strong>early access</strong>, pembayaran online melalui platform dapat belum aktif. Tarif atau
          imbalan yang disepakati antara pengguna dan mitra di luar fitur bayar resmi menjadi tanggung jawab para
          pihak. Apabila pembayaran melalui gateway (misalnya DOKU) diaktifkan later, ketentuan biaya dan refund akan
          diumumkan di aplikasi.
        </p>
      </section>

      <section>
        <h2>5. Penerimaan</h2>
        <p>
          Dengan mendaftar atau menggunakan PacaRent, Anda menyatakan telah membaca, memahami, dan menyetujui ringkasan
          ini. Ketentuan dapat diperbarui; perubahan material akan diinformasikan melalui platform.
        </p>
        <p className="muted">
          Bukan nasihat hukum. Untuk sengketa serius atau kerugian besar, konsultasikan penasihat hukum dan laporkan ke
          aparat sesuai peraturan yang berlaku.
        </p>
      </section>
    </div>
  );
}
