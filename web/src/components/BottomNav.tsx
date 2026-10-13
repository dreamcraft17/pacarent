import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { IconCalendar, IconDiscover, IconLogin, IconUser } from './DatingIcons';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { me } = useAuth();

  const item = (to: string, label: string, icon: ReactNode) => {
    const active = pathname === to || (to !== '/' && pathname.startsWith(to));
    return (
      <Link to={to} className={`bottom-nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>
        <span className="bottom-nav-icon" aria-hidden>
          {icon}
        </span>
        {label}
      </Link>
    );
  };

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      {item('/', 'Jelajahi', <IconDiscover />)}
      {me ? item('/bookings', 'Booking', <IconCalendar />) : item('/login', 'Masuk', <IconLogin />)}
      {me ? item('/profile', 'Profil', <IconUser />) : item('/register', 'Daftar', <IconUser />)}
    </nav>
  );
}
