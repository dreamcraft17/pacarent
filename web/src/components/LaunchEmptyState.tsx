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
      <div className="launch-panel-head">
        <p className="launch-panel-kicker">{copy.eyebrow}</p>
        <h2 id={id}>{copy.title}</h2>
        <p className="launch-panel-lead">{copy.lead}</p>
      </div>

      <ol className="launch-flow" aria-label="Cara kerja PacaRent">
        {copy.steps.map((step, i) => (
          <li key={step.title}>
            <span className="launch-flow-n">{i + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <span>{step.sub}</span>
            </div>
          </li>
        ))}
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
    </section>
  );
}
