import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AdminPage from './pages/AdminPage';
import BookingsPage from './pages/BookingsPage';
import BrowseListPage from './pages/BrowseListPage';
import DiscoverPage from './pages/DiscoverPage';
import LoginPage from './pages/LoginPage';
import PartnerApplyPage from './pages/PartnerApplyPage';
import PartnerDetailPage from './pages/PartnerDetailPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import BottomNav from './components/BottomNav';
import TrustStrip from './components/TrustStrip';
import './App.css';

function Shell() {
  const { me, logout, loading } = useAuth();
  const { pathname } = useLocation();
  const isDiscover = pathname === '/' || pathname.startsWith('/mitra/');
  const hideBottomNav = pathname === '/login' || pathname === '/register' || pathname === '/admin';

  return (
    <div className={`app ${isDiscover ? 'app-discover' : ''}`}>
      <header className={`topbar topbar-compact${isDiscover ? ' topbar-discover' : ''}`}>
        {isDiscover ? (
          <>
            <span className="topbar-discover-spacer" aria-hidden />
            <Link to="/" className="brand brand-discover">
              PacaRent
            </Link>
            <div className="topbar-discover-actions">
              <Link to="/cari" className="topbar-text-link">
                List
              </Link>
            </div>
          </>
        ) : (
          <>
            <Link to="/" className="brand">
              PacaRent
              <span className="brand-tag">Sewa pacar · teman kencan</span>
            </Link>
            <div className="topbar-actions">
              {me?.role === 'Admin' && <Link to="/admin">Admin</Link>}
              {me && me.role !== 'Partner' && <Link to="/mitra/daftar">Jadi mitra</Link>}
              <Link to="/syarat">S&amp;K</Link>
              {loading ? (
                <span className="muted">...</span>
              ) : me ? (
                <button type="button" className="ghost btn-small" onClick={logout}>
                  Keluar
                </button>
              ) : (
                <Link to="/login">Masuk</Link>
              )}
            </div>
          </>
        )}
      </header>
      {!isDiscover && <TrustStrip />}
      <main className={`main ${hideBottomNav ? '' : 'main-with-nav'}`}>
        <Routes>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/cari" element={<BrowseListPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/syarat" element={<TermsPage />} />
          <Route path="/mitra/:id" element={<PartnerDetailPage />} />
          <Route path="/mitra/daftar" element={<RequireAuth><PartnerApplyPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        </Routes>
      </main>
      {!hideBottomNav && <BottomNav />}
      <footer className="footer footer-minimal">
        PT DN Tech · Escrow · Profil mitra aktif
      </footer>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p>Memuat...</p>;
  if (!me) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }
  return children;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { me, loading } = useAuth();
  if (loading) return <p>Memuat...</p>;
  if (!me || me.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
