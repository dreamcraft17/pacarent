import { Link } from 'react-router-dom';
import { discoverMarketing } from '../copy/discover-marketing';

export default function DiscoverTrustSidebar() {
  return (
    <aside className="discover-sidebar" aria-label="Keamanan dan cara booking">
      <p className="discover-sidebar-crumb">{discoverMarketing.sidebar.crumb}</p>
      <p className="discover-sidebar-eyebrow">{discoverMarketing.sidebar.eyebrow}</p>
      <h2 className="discover-sidebar-title">{discoverMarketing.sidebar.title}</h2>
      <p className="discover-sidebar-lead">{discoverMarketing.sidebar.lead}</p>
      <ul className="discover-sidebar-trust">
        <li>Profil pendamping &amp; verifikasi identitas</li>
        <li>Tertarik → isi tanggal &amp; lokasi pertemuan</li>
        <li>Dana ditahan sampai layanan selesai</li>
        <li>
          <Link to="/syarat">Syarat &amp; ketentuan</Link> wajib saat daftar
        </li>
      </ul>
    </aside>
  );
}
