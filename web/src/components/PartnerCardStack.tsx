import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { trackBookingStarted, trackDiscoveryAction } from '../lib/analytics';
import { partnerBackdrop } from '../lib/partnerVisual';
import { setBookingSource } from '../lib/viewport';
import { IconCalendar, IconClose, IconInfo } from './DatingIcons';
import LaunchEmptyState from './LaunchEmptyState';

export type StackPartner = {
  id: string;
  fullName: string;
  city: string;
  hourlyRate: number;
  bio: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  verified?: boolean;
  photoUrl?: string | null;
};

type Props = {
  partners: StackPartner[];
  loading?: boolean;
  fetchFailed?: boolean;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  onReload?: () => void;
};

export default function PartnerCardStack({
  partners,
  loading = false,
  fetchFailed = false,
  hasActiveFilters = false,
  onResetFilters,
  onReload,
}: Props) {
  const nav = useNavigate();
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const dragStart = useRef(0);
  const dragXRef = useRef(0);
  const dragging = useRef(false);

  const current = partners[index];
  const next = partners[index + 1];

  const advance = useCallback(() => {
    dragXRef.current = 0;
    setDragX(0);
    setExpanded(false);
    setIndex((i) => Math.min(i + 1, partners.length));
  }, [partners.length]);

  const skip = useCallback(() => {
    trackDiscoveryAction('skip', 'card');
    advance();
  }, [advance]);

  const interested = useCallback(() => {
    if (!current) return;
    setBookingSource('card');
    trackDiscoveryAction('interested', 'card');
    trackBookingStarted('card', current.id);
    nav(`/mitra/${current.id}`);
  }, [current, nav]);

  useEffect(() => {
    setIndex(0);
    setExpanded(false);
    setDragX(0);
  }, [partners]);

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
      if (e.key === 'Escape') {
        setExpanded(false);
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        skip();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        interested();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, interested, skip]);

  const onPointerDown = (e: ReactPointerEvent) => {
    dragging.current = true;
    dragStart.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current;
    dragXRef.current = dx;
    setDragX(dx);
  };

  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const dx = dragXRef.current;
    if (dx > 80) {
      trackDiscoveryAction('swipe_interested', 'card');
      interested();
    } else if (dx < -80) {
      trackDiscoveryAction('swipe_skip', 'card');
      advance();
    }
    else {
      dragXRef.current = 0;
      setDragX(0);
    }
  };

  if (loading) {
    return (
      <div className="discover-stage discover-loading" aria-busy="true" aria-label="Memuat profil">
        <div className="swipe-card swipe-card-front swipe-card-skeleton" />
      </div>
    );
  }

  if (!current) {
    const exhausted = partners.length > 0;

    if (fetchFailed) {
      return (
        <div className="discover-empty-state">
          <h2>Tidak bisa memuat profil</h2>
          <p className="discover-empty-copy">Cek koneksi atau coba lagi sebentar.</p>
          <div className="discover-empty-actions">
            {onReload && (
              <button type="button" className="discover-empty-primary" onClick={onReload}>
                Coba lagi
              </button>
            )}
          </div>
        </div>
      );
    }

    if (!exhausted && !hasActiveFilters) {
      return (
        <LaunchEmptyState
          id="discover-launch-title"
          secondaryHref="/cari"
          secondaryLabel="Mode daftar"
          showUserRegister
        />
      );
    }

    return (
      <div className="discover-empty-state">
        <h2>{exhausted ? 'Profil habis' : 'Belum ada mitra'}</h2>
        <p className="discover-empty-copy">
          {exhausted
            ? 'Ganti filter atau balik lagi nanti.'
            : 'Filter kepanjangan—coba semua kategori/kota.'}
        </p>
        <div className="discover-empty-actions">
          {hasActiveFilters && onResetFilters && (
            <button type="button" className="discover-empty-primary" onClick={onResetFilters}>
              Reset filter
            </button>
          )}
          {onReload && (
            <button type="button" className="discover-empty-secondary" onClick={onReload}>
              Muat ulang
            </button>
          )}
        </div>
      </div>
    );
  }

  const rotate = dragX * 0.05;
  const stamp = dragX > 40 ? 'stamp-yes' : dragX < -40 ? 'stamp-no' : '';

  return (
    <div className="discover-stage" aria-label="Kartu profil mitra">
      {next && (
        <div className="swipe-card swipe-card-back" aria-hidden>
          <CardFace partner={next} />
        </div>
      )}

      <div
        className={`swipe-card swipe-card-front ${stamp}`}
        style={{ transform: `translateX(${dragX}px) rotate(${rotate}deg)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <CardFace partner={current} />
        {expanded && (
          <div className="swipe-card-sheet">
            <p>{current.bio}</p>
            <p className="muted">Kategori: {current.categories.join(' · ')}</p>
            <p className="muted">Kencan, nongkrong, atau acara—sesuai kesepakatan di booking.</p>
          </div>
        )}
      </div>

      <div className="swipe-actions">
        <button type="button" className="swipe-btn swipe-btn-no" onClick={skip} aria-label="Lewati profil">
          <IconClose />
        </button>
        <button
          type="button"
          className="swipe-btn swipe-btn-info"
          onClick={() => setExpanded((v) => !v)}
          aria-label="Baca bio"
          aria-pressed={expanded}
        >
          <IconInfo />
        </button>
        <button type="button" className="swipe-btn swipe-btn-yes" onClick={interested} aria-label="Tertarik, buat booking">
          <IconCalendar />
        </button>
      </div>
      <p className="swipe-hint swipe-hint--touch">Geser kartu atau pilih aksi di bawah</p>
      <p className="swipe-hint swipe-hint--keyboard">Tombol di bawah, atau ← lewati · → tertarik</p>
    </div>
  );
}

function CardFace({ partner }: { partner: StackPartner }) {
  const initial = partner.fullName.charAt(0).toUpperCase();
  const bioTeaser = partner.bio.trim().slice(0, 72);
  const photoStyle = partner.photoUrl
    ? { backgroundImage: `url(${partner.photoUrl})` }
    : { backgroundColor: partnerBackdrop(partner.fullName) };

  return (
    <>
      <div
        className={`swipe-card-photo${partner.photoUrl ? '' : ' swipe-card-photo--placeholder'}`}
        style={photoStyle}
      >
        <div className="swipe-card-gradient" />
        <div className="swipe-card-meta">
          <div className="swipe-card-head">
            {!partner.photoUrl && <span className="swipe-card-avatar">{initial}</span>}
            <div className="swipe-card-head-text">
              <h2>
                {partner.fullName}
                <span className="swipe-card-city">, {partner.city}</span>
              </h2>
              <p className="swipe-card-stats">
                Rp {partner.hourlyRate.toLocaleString('id-ID')}/jam · ★ {partner.rating.toFixed(1)}
                {partner.reviewCount > 0 ? ` (${partner.reviewCount})` : ''}
              </p>
            </div>
          </div>
          <div className="swipe-card-badges">
            {partner.verified && <span className="badge badge-verified">✓ Terverifikasi</span>}
            {partner.categories[0] && <span className="badge badge-category">{partner.categories[0]}</span>}
          </div>
          {bioTeaser && <p className="swipe-card-teaser">{bioTeaser}{partner.bio.length > 72 ? '…' : ''}</p>}
        </div>
      </div>
    </>
  );
}
