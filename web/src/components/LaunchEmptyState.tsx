import { Link } from 'react-router-dom';
import { discoverMarketing } from '../copy/discover-marketing';

type Props = {
  id?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showUserRegister?: boolean;
};

/** Empty inventory — complements masthead hook (no duplicate hero copy). */
export default function LaunchEmptyState({
  id = 'launch-empty-title',
  secondaryHref,
  secondaryLabel,
  showUserRegister = false,
}: Props) {
  const showSecondary = Boolean(secondaryHref && secondaryLabel);

  return (
    <section className="launch-panel" aria-labelledby={id}>
      <div className="launch-panel-head">
        <p className="launch-panel-kicker">{discoverMarketing.launchEmpty.eyebrow}</p>
        <h2 id={id}>{discoverMarketing.launchEmpty.title}</h2>
        <p className="launch-panel-lead">{discoverMarketing.launchEmpty.lead}</p>
      </div>

      <ol className="launch-flow" aria-label="Cara kerja PacaRent">
        <li>
          <span className="launch-flow-n">1</span>
          <div>
            <strong>Pilih profil</strong>
            <span>Bio, tarif, kota</span>
          </div>
        </li>
        <li>
          <span className="launch-flow-n">2</span>
          <div>
            <strong>Atur jadwal</strong>
            <span>Tanggal, durasi, lokasi</span>
          </div>
        </li>
        <li>
          <span className="launch-flow-n">3</span>
          <div>
            <strong>Booking aman</strong>
            <span>Status di akunmu</span>
          </div>
        </li>
      </ol>

      <div className="launch-panel-actions">
        {showUserRegister && (
          <Link className="launch-btn launch-btn-primary" to="/register">
            Daftar sebagai pengguna
          </Link>
        )}
        <Link className="launch-btn launch-btn-secondary" to="/mitra/daftar">
          Daftar jadi pendamping
        </Link>
        {showSecondary && (
          <Link className="launch-btn launch-btn-ghost" to={secondaryHref!}>
            {secondaryLabel}
          </Link>
        )}
      </div>
    </section>
  );
}
