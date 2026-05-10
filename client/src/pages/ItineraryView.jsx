import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import TripHealthScore from '../components/ui/TripHealthScore';
import TripTimeline from '../components/ui/TripTimeline';

const TYPE_EMOJI = { SIGHTSEEING: '🏛️', FOOD: '🍽️', TRANSPORT: '🚌', ACCOMMODATION: '🏨', ADVENTURE: '🧗', SHOPPING: '🛍️', OTHER: '📌' };

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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, width: 480, maxWidth: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Share Trip</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Generating AI Summary... ✨</div>
        ) : (
          <>
            {summary && (
              <div style={{ background: '#f8faf9', padding: 20, borderRadius: 12, marginBottom: 24, borderLeft: '4px solid #1D9E75' }}>
                <p style={{ margin: '0 0 12px', fontStyle: 'italic', color: '#333', lineHeight: 1.5 }}>"{summary.summary}"</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {summary.highlights?.map(h => <span key={h} style={{ background: '#e8f5f0', color: '#1D9E75', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>✨ {h}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {summary.hashtags?.map(h => <span key={h} style={{ color: '#888', fontSize: 12 }}>{h}</span>)}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#555', display: 'block', marginBottom: 8 }}>Public Link</label>
              <div style={{ display: 'flex', gap: 10 }}>
                <input type="text" readOnly value={publicLink} style={{ flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid #e0e0e0', background: '#f5f5f5', color: '#555' }} />
                <button onClick={copyLink} disabled={!isPublic} style={{ padding: '0 16px', background: isPublic ? '#1a1a1a' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: isPublic ? 'pointer' : 'not-allowed' }}>Copy</button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <button onClick={shareWhatsApp} disabled={!isPublic} style={{ flex: 1, padding: 12, background: isPublic ? '#25D366' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: isPublic ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                💬 WhatsApp
              </button>
            </div>

            <div style={{ textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={isPublic} onChange={togglePrivate} />
                <span style={{ fontSize: 14, color: '#555', fontWeight: 500 }}>Allow anyone with the link to view this trip</span>
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

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading…</div>;
  if (!trip) return <div style={{ textAlign: 'center', padding: 60, color: '#e53e3e' }}>Trip not found</div>;

  const pct = budget ? Math.min(budget.percentUsed, 100) : 0;
  const barColor = budget?.status === 'over' ? '#e53e3e' : budget?.status === 'warning' ? '#EF9F27' : '#1D9E75';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
      <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 800, color: '#1a1a1a' }}>{trip.name}</h1>
          <p style={{ margin: 0, color: '#888', fontSize: 13 }}>
            {new Date(trip.startDate).toLocaleDateString()} → {new Date(trip.endDate).toLocaleDateString()}
            {trip.description && <span> · {trip.description}</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowShareModal(true)} style={{ padding: '9px 18px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>🌐 Share Trip</button>
          <Link to={`/trips/${id}/build`} style={{ padding: '9px 18px', background: '#1D9E75', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>✏️ Edit</Link>
          <Link to={`/trips/${id}/budget`} style={{ padding: '9px 18px', background: '#fff', color: '#333', border: '1.5px solid #e0e0e0', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>💰 Budget</Link>
          <Link to={`/trips/${id}/invoice`} style={{ padding: '9px 18px', background: '#fff', color: '#333', border: '1.5px solid #e0e0e0', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>🧾 Invoice</Link>
        </div>
      </div>

      {budget && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Budget', value: `$${budget.totalBudget.toLocaleString()}`, color: '#1D9E75' },
            { label: 'Total Spent', value: `$${budget.totalSpent.toLocaleString()}`, color: barColor },
            { label: 'Remaining', value: `$${budget.remaining.toLocaleString()}`, color: budget.remaining >= 0 ? '#1D9E75' : '#e53e3e' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{label}</div>
            </div>
          ))}
          <div style={{ gridColumn: '1 / -1', height: 8, background: '#f0f0f0', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '2px solid #f0f0f0', paddingBottom: 16 }}>
        <button 
          onClick={() => setViewMode('timeline')}
          style={{ padding: '8px 16px', border: 'none', background: viewMode === 'timeline' ? '#1D9E75' : '#f0f0f0', color: viewMode === 'timeline' ? '#fff' : '#555', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          ⏱️ Timeline View
        </button>
        <button 
          onClick={() => setViewMode('list')}
          style={{ padding: '8px 16px', border: 'none', background: viewMode === 'list' ? '#1D9E75' : '#f0f0f0', color: viewMode === 'list' ? '#fff' : '#555', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          📋 Day View
        </button>
      </div>

      {viewMode === 'timeline' ? (
        <TripTimeline trip={trip} />
      ) : (
        <>
          {(trip.stops || []).map((stop, si) => (
        <div key={stop.id} style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, background: '#1D9E75', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>{si + 1}</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{stop.city}, {stop.country}</h2>
              <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{new Date(stop.startDate).toLocaleDateString()} → {new Date(stop.endDate).toLocaleDateString()}</p>
            </div>
          </div>
          {(stop.activities || []).length > 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#f8faf9' }}>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Activity</th>
                    <th style={{ padding: '10px 16px', textAlign: 'left', color: '#666', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', color: '#666', fontWeight: 600 }}>Expense</th>
                    <th style={{ padding: '10px 16px', textAlign: 'right', color: '#666', fontWeight: 600 }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {stop.activities.map(a => (
                    <tr key={a.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                      <td style={{ padding: '10px 16px', fontWeight: 500, color: '#1a1a1a' }}>
                        {TYPE_EMOJI[a.type] || '📌'} {a.name}
                        {a.notes && <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{a.notes}</div>}
                      </td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ background: '#f0f4ff', color: '#4a5568', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{a.type}</span>
                      </td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: a.cost > 0 ? '#1a1a1a' : '#aaa' }}>{a.cost > 0 ? `$${a.cost}` : 'Free'}</td>
                      <td style={{ padding: '10px 16px', textAlign: 'right', color: '#888' }}>{a.duration} min</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: '#f8faf9', borderTop: '2px solid #e0e0e0' }}>
                    <td colSpan={2} style={{ padding: '10px 16px', fontWeight: 700, color: '#555' }}>Stop Total</td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: '#1D9E75' }}>
                      ${stop.activities.reduce((s, a) => s + a.cost, 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'right', color: '#888' }}>
                      {stop.activities.reduce((s, a) => s + a.duration, 0)} min
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, textAlign: 'center', color: '#aaa', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>No activities planned for this stop</div>
          )}
        </div>
      ))}
        </>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Link to={`/trips/${id}/packing`} style={{ flex: 1, padding: 14, background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 10, textAlign: 'center', textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: 14 }}>🎒 Packing List</Link>
        <Link to={`/trips/${id}/notes`} style={{ flex: 1, padding: 14, background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 10, textAlign: 'center', textDecoration: 'none', color: '#333', fontWeight: 600, fontSize: 14 }}>📝 Notes</Link>
        <Link to={`/trips/${id}/invoice`} style={{ flex: 1, padding: 14, background: '#1D9E75', color: '#fff', borderRadius: 10, textAlign: 'center', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>🧾 Invoice</Link>
      </div>
      </div>

      {/* Sidebar — Trip Health Score */}
      <div style={{ position: 'sticky', top: 80 }}>
        <TripHealthScore tripId={id} />
      </div>

      {showShareModal && (
        <ShareModal 
          tripId={id} 
          tripPublicStatus={trip.isPublic} 
          tripName={trip.name}
          onClose={() => {
            setShowShareModal(false);
            // Reload trip to get updated isPublic status if changed
            tripsAPI.getOne(id).then(setTrip);
          }} 
        />
      )}
    </div>
  );
}
