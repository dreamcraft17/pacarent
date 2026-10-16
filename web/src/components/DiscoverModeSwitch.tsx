import { Link, useLocation } from 'react-router-dom';
import { trackDiscoveryView } from '../lib/analytics';
import { setStoredDiscoveryMode } from '../lib/viewport';

export default function DiscoverModeSwitch() {
  const { pathname } = useLocation();
  const cardActive = pathname === '/';
  const listActive = pathname === '/cari';

  if (!cardActive && !listActive) return null;

  const onCard = () => {
    setStoredDiscoveryMode('card');
    trackDiscoveryView('card');
  };

  const onList = () => {
    setStoredDiscoveryMode('list');
    trackDiscoveryView('list');
  };

  return (
    <nav className="discover-mode-switch" aria-label="Mode pencarian">
      <Link
        to="/"
        className={`discover-mode-tab${cardActive ? ' active' : ''}`}
        aria-current={cardActive ? 'page' : undefined}
        onClick={onCard}
      >
        Kartu
      </Link>
      <Link
        to="/cari"
        className={`discover-mode-tab${listActive ? ' active' : ''}`}
        aria-current={listActive ? 'page' : undefined}
        onClick={onList}
      >
        Daftar
      </Link>
    </nav>
  );
}
