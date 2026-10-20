import { productCopy } from '../copy/productCopy';

export default function TrustStrip() {
  return (
    <ul className="trust-strip" aria-label="Keamanan platform">
      {productCopy.trustRail.slice(0, 3).map((line) => (
        <li key={line}>
          <span className="trust-icon" aria-hidden>
            ✓
          </span>
          {line}
        </li>
      ))}
      <li>
        <span className="trust-icon" aria-hidden>
          ✓
        </span>
        Ulasan &amp; laporan
      </li>
    </ul>
  );
}
