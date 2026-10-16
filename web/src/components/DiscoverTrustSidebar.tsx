import { Link } from 'react-router-dom';

/** Desktop sidebar (plan C) — fills dead space with trust + booking context. */
export default function DiscoverTrustSidebar() {
  return (
    <aside className="discover-sidebar" aria-label="Keamanan dan cara booking">
      <p className="discover-sidebar-eyebrow">Mobile-first web</p>
      <h2 className="discover-sidebar-title">Booking mitra terverifikasi</h2>
      <p className="discover-sidebar-lead">
        Bukan app match—setiap langkah menuju jadwal, lokasi, dan pembayaran lewat platform.
      </p>
      <ul className="discover-sidebar-trust">
        <li>Profil mitra &amp; verifikasi identitas</li>
        <li>Tertarik → isi tanggal &amp; lokasi pertemuan</li>
        <li>Dana ditahan sampai layanan selesai</li>
        <li>
          <Link to="/syarat">Syarat &amp; ketentuan</Link> wajib saat daftar
        </li>
      </ul>
    </aside>
  );
}
