import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import AdminPage from './pages/AdminPage';
import BookingsPage from './pages/BookingsPage';
import BrowseListPage from './pages/BrowseListPage';
import LoginPage from './pages/LoginPage';
import MembershipPage from './pages/MembershipPage';
import PartnerApplyPage from './pages/PartnerApplyPage';
import PartnerDetailPage from './pages/PartnerDetailPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import TermsPage from './pages/TermsPage';
import BottomNav from './components/BottomNav';
import { productCopy } from './copy/productCopy';

function Shell() {
  const { me, logout, loading } = useAuth();
  const { pathname } = useLocation();
  const hideBottomNav = pathname === '/login' || pathname === '/register' || pathname === '/admin';

  return (
    <div className="app app-v3">
      <header className="v3-topbar">
        <Link to="/" className="v3-brand">
          <span className="v3-brand-mark" aria-hidden="true">
            P
          </span>
          <span>PacaRent</span>
        </Link>
        <div className="v3-topbar-actions">
          <Link to="/syarat">S&amp;K</Link>
          {me?.role === 'Admin' && <Link to="/admin">Admin</Link>}
          {me && me.role !== 'Partner' && <Link to="/mitra/daftar">Jadi pendamping</Link>}
          {me && <Link to="/membership">{productCopy.membership.navLabel}</Link>}
          {loading ? (
            <span className="v3-muted">...</span>
          ) : me ? (
            <>
              <Link to="/profile">Profil</Link>
              <button type="button" onClick={logout}>
                Keluar
              </button>
            </>
          ) : (
            <Link to="/login">Masuk</Link>
          )}
        </div>
      </header>
      <main className={`v3-main${hideBottomNav ? '' : ' v3-main--nav'}`}>
        <Routes>
          <Route path="/" element={<BrowseListPage />} />
          <Route path="/cari" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/syarat" element={<TermsPage />} />
          <Route path="/mitra/:id" element={<PartnerDetailPage />} />
          <Route path="/mitra/daftar" element={<RequireAuth><PartnerApplyPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/membership" element={<RequireAuth><MembershipPage /></RequireAuth>} />
          <Route path="/bookings" element={<RequireAuth><BookingsPage /></RequireAuth>} />
          <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        </Routes>
      </main>
      {!hideBottomNav && <BottomNav />}
      <footer className="v3-footer">{productCopy.brandTag} · Early access</footer>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="v3-muted">Memuat...</p>;
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
  if (loading) return <p className="v3-muted">Memuat...</p>;
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
