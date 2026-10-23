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

  if (!data) return <p className="v3-muted">Lagi muat profil…</p>;
  const partner = data.partner;
  const photoSrc = apiAssetUrl(partner.profile?.photoUrl);
  const chatCopy = productCopy.chat;

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
        <Panel title={productCopy.booking.detailPanel}>
          <form className="v3-form" onSubmit={startChat}>
          <p className="v3-conversation-lead">{productCopy.booking.form.openingLead}</p>
            <label htmlFor="opening-message">{productCopy.booking.form.notes}</label>
            <textarea id="opening-message" value={openingMessage} onChange={(e) => setOpeningMessage(e.target.value)} placeholder={productCopy.booking.form.openingPlaceholder} rows={5} />
            <div className="booking-opening-prompts" aria-label="Pilihan pembuka chat">
              <span>{chatCopy.openingPrompt}</span>
              <div className="booking-chat-starters">
                {chatCopy.starters.map((starter) => (
                  <button key={starter} type="button" className="booking-chat-starter" onClick={() => setOpeningMessage(starter)}>
                    {starter}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit">{productCopy.booking.submit}</button>
            <ul className="booking-policy">
              <li>{productCopy.booking.form.policyChat}</li>
              <li>{productCopy.booking.form.policySafety}</li>
              <li>{productCopy.booking.form.policySchedule}</li>
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
