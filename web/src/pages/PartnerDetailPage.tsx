import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Panel from '../components/layout/Panel';
import { api, apiAssetUrl } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { productCopy } from '../copy/productCopy';

export default function PartnerDetailPage() {
  const { id } = useParams();
  const { me } = useAuth();
  const nav = useNavigate();
  const [data, setData] = useState<any>(null);
  const [openingMessage, setOpeningMessage] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    api(`/api/partners/${id}`).then(setData).catch(console.error);
  }, [id]);

  const startChat = async (e: FormEvent) => {
    e.preventDefault();
    if (!me) {
      nav('/login', { state: { from: `/mitra/${id}` } });
      return;
    }
    try {
      const conversation = await api<{ id: string }>('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({ partnerId: id, openingMessage: openingMessage.trim() || null }),
      });
      nav(`/chat?conversation=${conversation.id}`);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Chat belum bisa dibuka');
    }
  };

  if (!data) return <p className="v3-muted">Memuat profil…</p>;
  const partner = data.partner;
  const photoSrc = apiAssetUrl(partner.profile?.photoUrl);

  return (
    <div className="v3-booking v3-conversation-start">
      <aside className="v3-booking-profile">
        {photoSrc && <div className="v3-booking-profile-photo" style={{ backgroundImage: `url(${photoSrc})` }} />}
        <div className="v3-booking-profile-copy">
          <div className="v3-booking-profile-badges">
            <span className="badge badge-verified">✓ {productCopy.booking.profileVerified}</span>
            {data.pendampingPro && <span className="badge badge-verified">★ Verified+</span>}
          </div>
          <p className="v3-booking-profile-kicker">Kenalan dulu</p>
          <h1>{partner.profile?.fullName}</h1>
          <p className="v3-muted">{partner.profile?.city}</p>
          <p>{partner.partnerProfile?.bio}</p>
          <div className="profile-services">
            <span className="profile-services-label">Bisa diajak buat</span>
            {partner.partnerProfile?.serviceDescription && <p className="profile-services-description">{partner.partnerProfile.serviceDescription}</p>}
            <div className="profile-services-list">
              {(partner.partnerProfile?.services?.length ? partner.partnerProfile.services : partner.partnerProfile?.categories ?? []).map((service: string) => (
                <span key={service}>{service.toLowerCase() === 'sewa pacar' ? 'Teman jalan' : service}</span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div className="v3-booking-form-col">
        <Panel title="Chat aja dulu">
          <form className="v3-form" onSubmit={startChat}>
            <p className="v3-conversation-lead">Belum perlu tentuin tanggal, durasi, atau tempat. Kenalan dulu, bahas maunya apa, baru atur detail kalau udah sama-sama oke.</p>
            <label htmlFor="opening-message">Mau bilang apa? <span className="v3-muted">(opsional)</span></label>
            <textarea id="opening-message" value={openingMessage} onChange={(e) => setOpeningMessage(e.target.value)} placeholder="Hai, lagi available buat nemenin ngopi atau nongkrong?" rows={5} />
            <button type="submit">Chat sekarang</button>
            <ul className="booking-policy">
              <li>Jadwal, durasi, tempat, dan deal dibahas langsung di chat.</li>
              <li>Ketemuan pertama? Pilih tempat umum yang ramai.</li>
              <li>Kalau udah sepakat, baru lanjut bikin jadwal di PacaRent.</li>
              <li>Sebelum gas, baca <Link to="/syarat" className="v3-link">S&amp;K</Link>.</li>
            </ul>
          </form>
          {msg && <p className="v3-error">{msg}</p>}
        </Panel>

        <Panel title={productCopy.booking.reviewsTitle}>
          {(data.reviews as any[]).length === 0 && <p className="v3-muted">{productCopy.booking.reviewsEmpty}</p>}
          {(data.reviews as any[]).map((r) => <p key={r.id}>★ {r.rating} — {r.comment}</p>)}
        </Panel>
      </div>
    </div>
  );
}
