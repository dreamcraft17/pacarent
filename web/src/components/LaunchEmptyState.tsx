import { Link } from 'react-router-dom';
import { productCopy } from '../copy/productCopy';
import { IconCalendar, IconHeart, IconUser } from './DatingIcons';

type Props = {
  id?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  showUserRegister?: boolean;
};

const STEP_ICONS = [IconUser, IconCalendar, IconHeart];

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

          <ol className="launch-flow" aria-label="Cara kerja PacaRent">
            {copy.steps.map((step, i) => {
              const Icon = STEP_ICONS[i] ?? IconUser;
              return (
                <li key={step.title}>
                  <span className="launch-flow-n">
                    <Icon className="launch-flow-icon" />
                  </span>
                  <div className="launch-flow-copy">
                    <strong>{step.title}</strong>
                    <span>{step.sub}</span>
                  </div>
                </li>
              );
            })}
          </ol>

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

        <div className="launch-panel-mark" aria-hidden>
          <span className="launch-mark-avatar launch-mark-avatar--you">Kamu</span>
          <span className="launch-mark-plus">
            <IconHeart className="launch-mark-heart" />
          </span>
          <span className="launch-mark-avatar launch-mark-avatar--plus-one">+1</span>
        </div>
      </div>
    </section>
  );
}
