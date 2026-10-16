import { useEffect } from 'react';
import HomePage from './HomePage';
import { trackDiscoveryView } from '../lib/analytics';

/** Grid/list discovery — default on desktop; peer to card stack on mobile. */
export default function BrowseListPage() {
  useEffect(() => {
    trackDiscoveryView('list');
  }, []);

  return (
    <div className="browse-list-page">
      <HomePage />
    </div>
  );
}
