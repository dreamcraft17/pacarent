import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { productCopy } from '../copy/productCopy';
import { IconCalendar, IconChat, IconDiscover, IconLogin, IconUser } from './DatingIcons';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { me } = useAuth();
  const n = productCopy.nav;

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
      {item('/', n.explore, <IconDiscover />)}
      {me ? item('/bookings', n.bookings, <IconCalendar />) : item('/login', n.login, <IconLogin />)}
      {me && item('/chat', n.chat, <IconChat />)}
      {me ? item('/profile', n.profile, <IconUser />) : item('/register', n.register, <IconUser />)}
    </nav>
  );
}
