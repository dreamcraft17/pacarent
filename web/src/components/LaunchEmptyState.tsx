import { Link } from 'react-router-dom';
import { productCopy } from '../copy/productCopy';

type Props = {
  id?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showUserRegister?: boolean;
};

export default function LaunchEmptyState({
  id = 'launch-empty-title',
  secondaryHref,
  secondaryLabel,
  showUserRegister = false,
}: Props) {
  const { launchEmpty: copy } = productCopy;
  const showSecondary = Boolean(secondaryHref && secondaryLabel);

  return (
    <section className="launch-panel" aria-labelledby={id}>
      <div className="launch-panel-grid">
        <div className="launch-panel-content">
          <div className="launch-panel-head">
            <p className="launch-panel-kicker">{copy.eyebrow}</p>
            <h2 id={id}>{copy.title}</h2>
            <p className="launch-panel-lead">{copy.lead}</p>
          </div>

          <p className="launch-trail" aria-label="Cara kerja PacaRent">
            {copy.steps.map((step) => step.title).join(' → ')}
          </p>

          <div className="launch-panel-actions">
            {showUserRegister && (
              <Link className="launch-btn launch-btn-primary" to="/register">
                {copy.ctaUser}
              </Link>
            )}
            <Link className="launch-btn launch-btn-secondary" to="/mitra/daftar">
              {copy.ctaCompanion}
            </Link>
            {showSecondary && (
              <Link className="launch-btn launch-btn-ghost" to={secondaryHref!}>
                {secondaryLabel ?? copy.ctaTerms}
              </Link>
            )}
          </div>
        </div>

        {/* A real preview of what a listing card will look like, not an
           abstract mark — ties the empty state to the actual product. */}
        <div className="launch-preview" aria-hidden>
          <span className="launch-preview-ribbon">Segera hadir</span>
          <div className="launch-preview-media">
            <span className="launch-preview-initial">?</span>
            <div className="launch-preview-media-foot">
              <span className="browse-chip browse-chip-verified">Verified</span>
              <span className="browse-chip">{productCopy.discover.defaultCategoryLabel}</span>
            </div>
          </div>
          <div className="launch-preview-body">
            <div className="launch-preview-topline">
              <span className="browse-card-vibe">{productCopy.discover.defaultCategoryLabel}</span>
            </div>
            <p className="launch-preview-name">Nama pendamping</p>
            <p className="launch-preview-rate">
              Rp 000.000<span>/jam</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
