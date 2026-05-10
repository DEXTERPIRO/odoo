import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import TripHealthScore from '../components/ui/TripHealthScore';
import TripTimeline from '../components/ui/TripTimeline';
import { N, card, cardSm, btn, btnPrimary, btnDanger } from '../neu';

const TYPE_COLOR = { SIGHTSEEING: N.accent, FOOD: N.warning, TRANSPORT: N.muted, ACCOMMODATION: '#8B5CF6', ADVENTURE: N.danger, SHOPPING: '#DB2777', OTHER: N.accentSecondary };

function ShareModal({ tripId, onClose, tripPublicStatus, tripName }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [isPublic, setIsPublic] = useState(tripPublicStatus);
  const publicLink = `http://localhost:5173/trip/public/${tripId}`;

  useEffect(() => {
    async function initShare() {
      try {
        if (!isPublic) {
          await tripsAPI.shareTrip(tripId, { caption: `Check out my trip to ${tripName}!` });
          setIsPublic(true);
        }
        const res = await tripsAPI.getTripSummary(tripId);
        setSummary(res.data);
      } catch (err) {
        toast.error('Failed to generate sharing summary');
      } finally {
        setLoading(false);
      }
    }
    initShare();
  }, [tripId, isPublic, tripName]);

  const togglePrivate = async () => {
    try {
      await tripsAPI.update(tripId, { isPublic: !isPublic });
      setIsPublic(!isPublic);
      toast.success(isPublic ? 'Trip is now private' : 'Trip is public again');
    } catch {
      toast.error('Failed to update visibility');
    }
  };

  const copyLink = () => { navigator.clipboard.writeText(publicLink); toast.success('Link copied!'); };
  const shareWhatsApp = () => window.location.href = `whatsapp://send?text=Check out my trip: ${encodeURIComponent(publicLink)}`;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ ...card, width: 480, maxWidth: '100%', padding: '32px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, fontFamily: N.fontDisplay, color: N.fg }}>Share Trip</h2>
          <button onClick={onClose} style={{ ...btn, padding: '6px 12px', fontSize: 16, minHeight: 'auto' }}>✕</button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: N.muted, fontWeight: 600 }}>Generating AI Summary...</div>
        ) : (
          <>
            {summary && (
              <div style={{ ...cardSm, padding: 20, marginBottom: 24, borderLeft: `4px solid ${N.accent}` }}>
                <p style={{ margin: '0 0 14px', fontStyle: 'italic', color: N.fg, lineHeight: 1.5 }}>"{summary.summary}"</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {summary.highlights?.map(h => <span key={h} style={{ background: N.bg, boxShadow: N.shadowInsetSm, color: N.accent, padding: '4px 12px', borderRadius: N.radiusPill, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>◆ {h}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {summary.hashtags?.map(h => <span key={h} style={{ color: N.muted, fontSize: 12, fontWeight: 600 }}>{h}</span>)}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', marginBottom: 8 }}>Public Link</label>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="text" readOnly value={publicLink} style={{ flex: 1, padding: '12px 16px', borderRadius: N.radiusInner, border: 'none', background: N.bg, boxShadow: N.shadowInsetDeep, color: N.fg, fontFamily: N.font, fontSize: 14 }} />
                <button onClick={copyLink} disabled={!isPublic} style={{ ...btnPrimary, padding: '0 20px', minHeight: 'auto', opacity: isPublic ? 1 : 0.5 }}>Copy</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button onClick={shareWhatsApp} disabled={!isPublic} style={{ ...btn, flex: 1, padding: 14, color: isPublic ? '#25D366' : N.muted, opacity: isPublic ? 1 : 0.5, minHeight: 'auto' }}>
                Share on WhatsApp
              </button>
            </div>

            <div style={{ textAlign: 'center', borderTop: `1px solid rgb(163,177,198,0.2)`, paddingTop: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={isPublic} onChange={togglePrivate} style={{ accentColor: N.accent }} />
                <span style={{ fontSize: 13, color: N.muted, fontWeight: 600 }}>Allow anyone with the link to view this trip</span>
              </label>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ItineraryView() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('timeline');
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    Promise.all([tripsAPI.getOne(id), tripsAPI.getBudget(id)])
      .then(([t, b]) => { setTrip(t); setBudget(b); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
    const socket = io('http://localhost:5000');
    socket.emit('join-trip', id);
    socket.on('budget-updated', b => setBudget(b));
    return () => { socket.emit('leave-trip', id); socket.disconnect(); };
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: N.muted, fontFamily: N.font, fontWeight: 600 }}>Loading itinerary...</div>;
  if (!trip) return <div style={{ textAlign: 'center', padding: 60, color: N.danger, fontFamily: N.font, fontWeight: 600 }}>Trip not found</div>;

  const pct = budget ? Math.min(budget.percentUsed, 100) : 0;
  const barColor = budget?.status === 'over' ? N.danger : budget?.status === 'warning' ? N.warning : N.accentSecondary;
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ fontFamily: N.font, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>{trip.name}</h1>
            <p style={{ margin: 0, color: N.muted, fontSize: 13, fontWeight: 500 }}>
              {fmt(trip.startDate)} → {fmt(trip.endDate)}
              {trip.description && <span style={{ margin: '0 8px' }}>·</span>}
              {trip.description && <span>{trip.description}</span>}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setShowShareModal(true)} style={{ ...btnPrimary, padding: '10px 18px', fontSize: 13, minHeight: 'auto' }}>Share Trip</button>
            <Link to={`/trips/${id}/build`} style={{ ...btn, padding: '10px 18px', fontSize: 13, minHeight: 'auto', textDecoration: 'none', color: N.accentSecondary }}>Edit</Link>
            <Link to={`/trips/${id}/budget`} style={{ ...btn, padding: '10px 18px', fontSize: 13, minHeight: 'auto', textDecoration: 'none' }}>Budget</Link>
            <Link to={`/trips/${id}/invoice`} style={{ ...btn, padding: '10px 18px', fontSize: 13, minHeight: 'auto', textDecoration: 'none' }}>Invoice</Link>
          </div>
        </div>

        {/* Budget Overview */}
        {budget && (
          <div style={{ ...card, padding: 24, marginBottom: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Total Budget', value: `₹${budget.totalBudget.toLocaleString()}`, color: N.accentSecondary },
              { label: 'Total Spent', value: `₹${budget.totalSpent.toLocaleString()}`, color: barColor },
              { label: 'Remaining', value: `₹${budget.remaining.toLocaleString()}`, color: budget.remaining >= 0 ? N.accentSecondary : N.danger },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color, fontFamily: N.fontDisplay }}>{value}</div>
                <div style={{ fontSize: 11, color: N.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{label}</div>
              </div>
            ))}
            <div style={{ gridColumn: '1 / -1', height: 8, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden', marginTop: 10 }}>
              <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: N.radiusPill, transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button 
            onClick={() => setViewMode('timeline')}
            style={{ ...btn, padding: '10px 20px', minHeight: 'auto', background: viewMode === 'timeline' ? N.bg : N.bg, boxShadow: viewMode === 'timeline' ? N.shadowInsetDeep : N.shadowSm, color: viewMode === 'timeline' ? N.accent : N.muted, border: 'none', fontWeight: 700, fontSize: 13 }}
          >
            Timeline View
          </button>
          <button 
            onClick={() => setViewMode('list')}
            style={{ ...btn, padding: '10px 20px', minHeight: 'auto', background: viewMode === 'list' ? N.bg : N.bg, boxShadow: viewMode === 'list' ? N.shadowInsetDeep : N.shadowSm, color: viewMode === 'list' ? N.accent : N.muted, border: 'none', fontWeight: 700, fontSize: 13 }}
          >
            Day View
          </button>
        </div>

        {/* Content */}
        {viewMode === 'timeline' ? (
          <TripTimeline trip={trip} />
        ) : (
          <>
            {(trip.stops || []).map((stop, si) => (
              <div key={stop.id} style={{ ...card, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', color: N.accent, fontWeight: 900, fontFamily: N.fontDisplay, fontSize: 16 }}>{si + 1}</div>
                  <div>
                    <h2 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>{stop.city}, {stop.country}</h2>
                    <p style={{ margin: 0, fontSize: 12, color: N.muted, fontWeight: 500 }}>{fmt(stop.startDate)} → {fmt(stop.endDate)}</p>
                  </div>
                </div>
                
                {(stop.activities || []).length > 0 ? (
                  <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr 1fr', gap: 12, paddingBottom: 12, borderBottom: `1px solid rgb(163,177,198,0.2)`, fontSize: 11, fontWeight: 800, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      <div>Activity</div>
                      <div>Type</div>
                      <div style={{ textAlign: 'right' }}>Expense</div>
                      <div style={{ textAlign: 'right' }}>Duration</div>
                    </div>
                    {stop.activities.map((a, idx) => (
                      <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1.5fr 1fr 1fr', gap: 12, padding: '12px 0', borderBottom: idx < stop.activities.length - 1 ? `1px dashed rgb(163,177,198,0.3)` : 'none', alignItems: 'center', fontSize: 13 }}>
                        <div style={{ fontWeight: 600, color: N.fg }}>
                          {a.name}
                          {a.notes && <div style={{ fontSize: 11, color: N.muted, marginTop: 4, fontWeight: 500 }}>{a.notes}</div>}
                        </div>
                        <div>
                          <span style={{ background: N.bg, boxShadow: N.shadowSm, color: TYPE_COLOR[a.type] || N.muted, fontSize: 10, padding: '4px 10px', borderRadius: N.radiusPill, fontWeight: 800, textTransform: 'uppercase' }}>{a.type}</span>
                        </div>
                        <div style={{ textAlign: 'right', fontWeight: 800, color: a.cost > 0 ? N.fg : N.muted }}>{a.cost > 0 ? `₹${a.cost}` : 'Free'}</div>
                        <div style={{ textAlign: 'right', color: N.muted, fontWeight: 600 }}>{a.duration}m</div>
                      </div>
                    ))}
                    <div style={{ display: 'grid', gridTemplateColumns: '4.5fr 1fr 1fr', gap: 12, paddingTop: 16, marginTop: 4, borderTop: `2px solid rgb(163,177,198,0.2)`, alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, color: N.muted, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>Stop Total</div>
                      <div style={{ textAlign: 'right', fontWeight: 900, color: N.accentSecondary, fontSize: 15 }}>
                        ₹{stop.activities.reduce((s, a) => s + a.cost, 0).toLocaleString()}
                      </div>
                      <div style={{ textAlign: 'right', color: N.muted, fontWeight: 700, fontSize: 13 }}>
                        {stop.activities.reduce((s, a) => s + a.duration, 0)}m
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: 24, textAlign: 'center', color: N.muted, fontSize: 13, fontWeight: 600 }}>No activities planned for this stop</div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Bottom Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 12 }}>
          <Link to={`/trips/${id}/packing`} style={{ ...btn, textAlign: 'center', textDecoration: 'none', color: N.accent }}>Packing List</Link>
          <Link to={`/trips/${id}/notes`} style={{ ...btn, textAlign: 'center', textDecoration: 'none' }}>Notes</Link>
          <Link to={`/trips/${id}/invoice`} style={{ ...btnPrimary, textAlign: 'center', textDecoration: 'none' }}>Invoice</Link>
        </div>
      </div>

      {/* Sidebar — Trip Health Score */}
      <div style={{ position: 'sticky', top: 80 }}>
        <TripHealthScore tripId={id} />
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          tripId={id} 
          tripPublicStatus={trip.isPublic} 
          tripName={trip.name}
          onClose={() => {
            setShowShareModal(false);
            tripsAPI.getOne(id).then(setTrip);
          }} 
        />
      )}
    </div>
  );
}
