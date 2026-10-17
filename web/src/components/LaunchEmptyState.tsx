import { Link } from 'react-router-dom';

type Props = {
  id?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showUserRegister?: boolean;
};

/** Onboarding empty state — shared browse + card discover. */
export default function LaunchEmptyState({
  id = 'launch-empty-title',
  secondaryHref = '/',
  secondaryLabel = 'Mode kartu',
  showUserRegister = false,
}: Props) {
  return (
    <section
      className="discover-empty-state discover-empty-state--launch"
      aria-labelledby={id}
    >
      <div className="empty-state-mark" aria-hidden="true">
        <span>PR</span>
      </div>
      <p className="discover-empty-eyebrow">Mulai dari momenmu</p>
      <h2 id={id} className="discover-empty-hero">
        Temukan teman untuk momen yang kamu rencanakan.
      </h2>
      <p className="discover-empty-copy">
        Pilih profil yang cocok, tentukan tanggal dan lokasi, lalu booking dengan alur yang jelas.
      </p>
      <div className="empty-state-steps" aria-label="Cara kerja PacaRent">
        <div>
          <span>01</span>
          <strong>Pilih profil</strong>
          <small>lihat bio, tarif, dan kota</small>
        </div>
        <div>
          <span>02</span>
          <strong>Atur jadwal</strong>
          <small>tanggal, durasi, lokasi</small>
        </div>
        <div>
          <span>03</span>
          <strong>Booking aman</strong>
          <small>status tercatat di akunmu</small>
        </div>
      </div>
      <div className="discover-empty-actions discover-empty-actions--stack">
        <Link className="discover-empty-primary discover-empty-link" to="/mitra/daftar">
          Ajukan jadi mitra
        </Link>
        <Link className="discover-empty-secondary discover-empty-link" to={secondaryHref}>
          {secondaryLabel}
        </Link>
        {showUserRegister && (
          <Link className="discover-empty-tertiary" to="/register">
            Daftar sebagai pengguna
          </Link>
        )}
      </div>
    </section>
  );
}
