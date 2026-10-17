import { Link } from 'react-router-dom';
import { discoverMarketing } from '../copy/discover-marketing';

export default function BrowseTrustRail() {
  return (
    <div className="browse-trust-rail" aria-label="Keamanan booking">
      <ul className="browse-trust-list">
        {discoverMarketing.trustRail.map((item) => (
          <li key={item}>{item}</li>
        ))}
        <li>
          <Link to="/syarat">Syarat &amp; ketentuan</Link>
        </li>
      </ul>
    </div>
  );
}
