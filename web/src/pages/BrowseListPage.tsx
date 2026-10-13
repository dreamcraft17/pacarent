import { Link } from 'react-router-dom';
import HomePage from './HomePage';

/** Grid/list discovery — secondary to card stack (Tinder “Discovery” list mode). */
export default function BrowseListPage() {
  return (
    <div>
      <p className="muted" style={{ marginBottom: '0.75rem' }}>
        <Link to="/">← Kembali ke mode kartu</Link>
      </p>
      <HomePage />
    </div>
  );
}
