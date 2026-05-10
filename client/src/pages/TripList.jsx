import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tripsAPI } from '../api/trips';
import { N, card, cardSm, btnPrimary, btn, badge, input } from '../neu';
import toast from 'react-hot-toast';

const STATUS_COLORS = { UPCOMING: N.accent, ONGOING: N.accentSecondary, COMPLETED: N.muted };

export default function TripList() {
  const [trips, setTrips]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [hover, setHover]         = useState(null);
  const [delHov, setDelHov]       = useState(null);
  const [newHov, setNewHov]       = useState(false);
  const [editBudget, setEditBudget] = useState(null); // tripId being edited
  const [budgetVal, setBudgetVal]   = useState('');
  const [savingBudget, setSavingBudget] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    tripsAPI.getAll()
      .then(data => { setTrips(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this trip?')) return;
    try { await tripsAPI.delete(id); toast.success('Trip deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleBudgetSave = async (e, tripId) => {
    e.stopPropagation();
    const val = parseFloat(budgetVal);
    if (isNaN(val) || val < 0) { toast.error('Enter a valid amount'); return; }
    setSavingBudget(true);
    try {
      await tripsAPI.update(tripId, { totalBudget: val });
      setTrips(ts => ts.map(t => t.id === tripId ? { ...t, totalBudget: val } : t));
      setEditBudget(null);
      toast.success(`Budget updated to ₹${val.toLocaleString()}`);
    } catch { toast.error('Failed to update budget'); }
    finally { setSavingBudget(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const nights = (a, b) => a && b ? Math.max(0, Math.ceil((new Date(b) - new Date(a)) / 86400000)) : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: N.muted, fontFamily: N.font }}>
      Loading...
    </div>
  );

  return (
    <div style={{ fontFamily: N.font, color: N.fg }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>My Trips</h1>
          <p style={{ margin: 0, color: N.muted, fontSize: 14 }}>
            {trips.length} trip{trips.length !== 1 ? 's' : ''} planned
          </p>
        </div>
        <button onClick={() => navigate('/trips/new')}
          onMouseEnter={() => setNewHov(true)}
          onMouseLeave={() => setNewHov(false)}
          style={{
            ...btnPrimary, padding: '12px 24px', fontSize: 14,
            boxShadow: newHov ? N.shadowHover : N.shadow,
            transform: newHov ? 'translateY(-1px)' : 'none',
          }}>
          + New Trip
        </button>
      </div>

      {/* Empty state */}
      {trips.length === 0 && (
        <div style={{ ...card, padding: '64px 32px', textAlign: 'center' }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', background: N.bg,
            boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 40, margin: '0 auto 24px',
          }}>✈</div>
          <h2 style={{ margin: '0 0 10px', fontFamily: N.fontDisplay, fontSize: 22 }}>No trips yet</h2>
          <p style={{ color: N.muted, marginBottom: 28, fontSize: 15 }}>Plan your first adventure across Incredible India</p>
          <button onClick={() => navigate('/trips/new')} style={{ ...btnPrimary, padding: '14px 32px' }}>
            Plan a Trip →
          </button>
        </div>
      )}

      {/* Trip grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {trips.map((trip, i) => {
          const n = nights(trip.startDate, trip.endDate);
          const isEditingBudget = editBudget === trip.id;
          return (
            <div key={trip.id}
              onClick={() => !isEditingBudget && navigate(`/trips/${trip.id}/build`)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                ...card,
                padding:   '26px',
                cursor:    isEditingBudget ? 'default' : 'pointer',
                boxShadow: hover === i ? N.shadowHover : N.shadow,
                transform: hover === i ? 'translateY(-2px)' : 'none',
                display:   'flex',
                flexDirection: 'column',
                gap: 16,
              }}>

              {/* Top row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: N.fontDisplay, fontWeight: 700, fontSize: 18, color: N.fg, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {trip.name}
                  </div>
                  <div style={{ ...badge(STATUS_COLORS[trip.status] || N.muted) }}>{trip.status}</div>
                </div>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: N.bg,
                  boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 20, flexShrink: 0, marginLeft: 12,
                }}>✈</div>
              </div>

              {/* Description */}
              {trip.description && (
                <div style={{ fontSize: 13, color: N.muted, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {trip.description}
                </div>
              )}

              {/* Meta row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  ['Dates', `${fmt(trip.startDate)}`],
                  ['Duration', n !== null ? `${n} nights` : '—'],
                ].map(([lbl, val]) => (
                  <div key={lbl} style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, color: N.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>{lbl}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: N.fg }}>{val}</div>
                  </div>
                ))}
                {/* Budget — editable */}
                <div
                  style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '10px 12px', cursor: 'pointer' }}
                  onClick={e => { e.stopPropagation(); setBudgetVal(trip.totalBudget || ''); setEditBudget(trip.id); }}
                  title="Click to edit budget"
                >
                  <div style={{ fontSize: 10, color: N.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 3 }}>Budget</div>
                  {isEditingBudget ? (
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                      <input
                        autoFocus
                        type="number"
                        value={budgetVal}
                        onChange={e => setBudgetVal(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleBudgetSave(e, trip.id); if (e.key === 'Escape') setEditBudget(null); }}
                        style={{ width: '100%', fontSize: 11, fontWeight: 700, border: 'none', background: 'transparent', outline: `1px solid ${N.accent}`, borderRadius: 4, padding: '2px 4px', color: N.fg }}
                      />
                      <button
                        onClick={e => handleBudgetSave(e, trip.id)}
                        disabled={savingBudget}
                        style={{ ...btnPrimary, padding: '2px 8px', fontSize: 10, minHeight: 'auto', height: 22, fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {savingBudget ? '...' : 'OK'}
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 12, fontWeight: 700, color: N.fg, display: 'flex', alignItems: 'center', gap: 4 }}>
                      {trip.totalBudget ? `₹${Number(trip.totalBudget).toLocaleString()}` : '—'}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={N.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={e => { e.stopPropagation(); navigate(`/trips/${trip.id}/build`); }}
                  style={{ ...btn, flex: 1, padding: '10px', fontSize: 13, boxShadow: N.shadowSm }}>
                  Build →
                </button>
                <button onClick={e => { e.stopPropagation(); navigate(`/trips/${trip.id}/view`); }}
                  style={{ ...btn, flex: 1, padding: '10px', fontSize: 13, boxShadow: N.shadowSm }}>
                  View →
                </button>
                <button
                  onMouseEnter={() => setDelHov(trip.id)}
                  onMouseLeave={() => setDelHov(null)}
                  onClick={e => handleDelete(e, trip.id)}
                  style={{ ...btn, padding: '10px 16px', fontSize: 13, boxShadow: N.shadowSm, color: delHov === trip.id ? N.danger : N.muted }}>
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

