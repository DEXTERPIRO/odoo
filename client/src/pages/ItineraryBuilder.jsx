import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import TripHealthScore from '../components/ui/TripHealthScore';
import LiveCollaborators from '../components/ui/LiveCollaborators';
import CityMapPicker from '../components/ui/CityMapPicker';
import { useAuthStore } from '../store/authStore';
import api from '../api/client';
import { N, card, cardSm, btnPrimary, btnDanger, btn, input, label } from '../neu';

const ACTIVITY_TYPES = ['SIGHTSEEING','FOOD','TRANSPORT','ACCOMMODATION','ADVENTURE','SHOPPING','OTHER'];
const TYPE_COLOR = { SIGHTSEEING: N.accent, FOOD: N.warning, TRANSPORT: N.muted, ACCOMMODATION: '#8B5CF6', ADVENTURE: N.danger, SHOPPING: '#DB2777', OTHER: N.accentSecondary };

/* ── Add Stop Modal ────────────────────────────────────────────────────────── */
function AddStopModal({ tripId, onClose, onAdded }) {
  const [f, setF]           = useState({ city: '', country: '', startDate: '', endDate: '' });
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [focused, setFocused] = useState(null);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try { const s = await tripsAPI.addStop({ ...f, tripId }); onAdded(s); onClose(); toast.success('Stop added'); }
    catch (err) { toast.error(err.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const inp = (name, type = 'text', ph = '') => ({
    ...input, boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset,
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ ...card, width: 440, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ margin: 0, fontFamily: N.fontDisplay, fontSize: 20, fontWeight: 700, color: N.fg }}>Add Stop</h3>
          <button onClick={onClose} style={{ ...btn, padding: '6px 12px', boxShadow: N.shadowSm, fontSize: 16, minHeight: 'auto' }}>✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <div style={{ marginBottom: 16 }}>
            <label style={label}>City *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input required value={f.city} onChange={e => setF(x => ({ ...x, city: e.target.value }))} placeholder="e.g. Jaipur"
                onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
                style={{ ...inp('city'), flex: 1 }} />
              <button type="button" onClick={() => setShowMap(true)} style={{ ...btn, padding: '12px 16px', minHeight: 'auto', boxShadow: N.shadowSm, color: N.accent, fontSize: 13, fontWeight: 700 }}>
                Map
              </button>
            </div>
            {f.city && <div style={{ fontSize: 11, color: N.accent, marginTop: 6, fontWeight: 700 }}>◆ {f.city}{f.country ? `, ${f.country}` : ''}</div>}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={label}>State / Country *</label>
            <input required value={f.country} onChange={e => setF(x => ({ ...x, country: e.target.value }))} placeholder="e.g. Rajasthan"
              onFocus={() => setFocused('country')} onBlur={() => setFocused(null)}
              style={inp('country')} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[['Start Date', 'startDate'], ['End Date', 'endDate']].map(([l, n]) => (
              <div key={n}>
                <label style={label}>{l}</label>
                <input type="date" required value={f[n]} onChange={e => setF(x => ({ ...x, [n]: e.target.value }))}
                  onFocus={() => setFocused(n)} onBlur={() => setFocused(null)}
                  style={inp(n)} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ ...btn, flex: 1, padding: '12px', minHeight: 'auto' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 2, padding: '12px', minHeight: 'auto', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Adding...' : 'Add Stop →'}
            </button>
          </div>
        </form>
      </div>
      {showMap && <CityMapPicker onSelect={p => setF(x => ({ ...x, city: p.city || p.displayName, country: p.country || 'India' }))} onClose={() => setShowMap(false)} />}
    </div>
  );
}

/* ── Activity Input Field — top-level to avoid remount on keystroke ─────── */
function ActInpField({ lbl, name, type = 'text', ph = '', f, setF, focused, setFocused }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={label}>{lbl}</label>
      <input type={type} value={f[name] ?? ''} onChange={e => setF(x => ({ ...x, [name]: e.target.value }))} placeholder={ph}
        onFocus={() => setFocused(name)} onBlur={() => setFocused(null)}
        style={{ ...input, boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset }} />
    </div>
  );
}

/* ── Add Activity Modal ────────────────────────────────────────────────────── */
function AddActivityModal({ stop, onClose, onAdded }) {
  const [f, setF]           = useState({ name: '', type: 'SIGHTSEEING', cost: '', duration: '60', notes: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try { const a = await tripsAPI.addActivity({ ...f, stopId: stop.id }); onAdded(stop.id, a.activity || a); onClose(); toast.success('Activity added'); }
    catch (err) { toast.error(err.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ ...card, width: 420, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: '0 0 2px', fontFamily: N.fontDisplay, fontSize: 18, fontWeight: 700, color: N.fg }}>Add Activity</h3>
            <div style={{ fontSize: 12, color: N.accent, fontWeight: 600 }}>{stop.city}</div>
          </div>
          <button onClick={onClose} style={{ ...btn, padding: '6px 12px', boxShadow: N.shadowSm, fontSize: 16, minHeight: 'auto' }}>✕</button>
        </div>
        <form onSubmit={submit} noValidate>
          <ActInpField lbl="Activity Name *" name="name" ph="e.g. Taj Mahal Visit" f={f} setF={setF} focused={focused} setFocused={setFocused} />
          <div style={{ marginBottom: 14 }}>
            <label style={label}>Type</label>
            <select value={f.type} onChange={e => setF(x => ({ ...x, type: e.target.value }))}
              onFocus={() => setFocused('type')} onBlur={() => setFocused(null)}
              style={{ ...input, boxShadow: focused === 'type' ? N.shadowInsetDeep : N.shadowInset, cursor: 'pointer' }}>
              {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ActInpField lbl="Cost (₹)" name="cost" type="number" ph="500" f={f} setF={setF} focused={focused} setFocused={setFocused} />
            <ActInpField lbl="Duration (min)" name="duration" type="number" ph="120" f={f} setF={setF} focused={focused} setFocused={setFocused} />
          </div>
          <ActInpField lbl="Notes" name="notes" ph="Optional tip or note" f={f} setF={setF} focused={focused} setFocused={setFocused} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ ...btn, flex: 1, padding: '12px', minHeight: 'auto' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ ...btnPrimary, flex: 2, padding: '12px', minHeight: 'auto', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Adding...' : 'Add Activity →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function ItineraryBuilder() {
  const { id }   = useParams();
  const { user } = useAuthStore();
  const [trip, setTrip]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [budget, setBudget]     = useState(null);
  const [showAddStop, setShowAddStop] = useState(false);
  const [actModal, setActModal]       = useState(null);
  const [aiLoading, setAiLoading]         = useState(false);
  const [aiResult, setAiResult]           = useState(null);
  const [addedDays, setAddedDays]         = useState(new Set());
  const [stopsLoading, setStopsLoading]   = useState(false);
  const [stopsResult, setStopsResult]     = useState(null);
  const [addedStops, setAddedStops]       = useState(new Set());
  const [viewers, setViewers]             = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [aiHov, setAiHov]                 = useState(false);
  const [stopsHov, setStopsHov]           = useState(false);
  const [addStopHov, setAddStopHov]       = useState(false);
  const socketRef = useRef(null);

  const loadCollaborators = useCallback(() => {
    api.get(`/trips/${id}/collaborators`).then(setCollaborators).catch(() => {});
  }, [id]);

  useEffect(() => {
    tripsAPI.getOne(id).then(t => { setTrip(t); setLoading(false); }).catch(() => { toast.error('Failed to load trip'); setLoading(false); });
    tripsAPI.getBudget(id).then(setBudget).catch(() => {});
    loadCollaborators();

    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join-trip', { tripId: id, userId: user?.id, userName: user?.firstName || 'Guest' });
    socket.on('budget-updated', b => setBudget(b));
    socket.on('viewers-updated', vs => setViewers(vs));
    socket.on('activity-added-live', ({ activity, stopId, userName }) => {
      setTrip(t => t ? { ...t, stops: t.stops.map(s => s.id === stopId ? { ...s, activities: [...s.activities, activity] } : s) } : t);
      toast(`${userName} added "${activity.name}"`, { duration: 3000 });
    });
    socket.on('stop-added-live', ({ stop, userName }) => {
      setTrip(t => t ? { ...t, stops: [...t.stops, { ...stop, activities: [] }] } : t);
      toast(`${userName} added stop: ${stop.city}`, { duration: 3000 });
    });
    return () => { socket.emit('leave-trip', id); socket.disconnect(); };
  }, [id, user]);

  const handleStopAdded     = stop => { setTrip(t => ({ ...t, stops: [...t.stops, { ...stop, activities: [] }] })); socketRef.current?.emit('stop-added-live', { tripId: id, stop, userName: user?.firstName || 'You' }); };
  const handleActivityAdded = (stopId, activity) => { setTrip(t => ({ ...t, stops: t.stops.map(s => s.id === stopId ? { ...s, activities: [...s.activities, activity] } : s) })); socketRef.current?.emit('activity-added-live', { tripId: id, activity, stopId, userName: user?.firstName || 'You' }); };
  const handleDeleteActivity = async (actId, stopId) => {
    try { await tripsAPI.deleteActivity(actId); setTrip(t => ({ ...t, stops: t.stops.map(s => s.id === stopId ? { ...s, activities: s.activities.filter(a => a.id !== actId) } : s) })); toast.success('Removed'); }
    catch { toast.error('Failed'); }
  };
  const handleDeleteStop = async stopId => {
    if (!confirm('Remove this stop?')) return;
    try { await tripsAPI.deleteStop(stopId); setTrip(t => ({ ...t, stops: t.stops.filter(s => s.id !== stopId) })); toast.success('Stop removed'); }
    catch { toast.error('Failed'); }
  };
  const handleAiSuggest = async () => {
    if (!trip) return;
    if (!trip.stops || trip.stops.length === 0) {
      toast('Add at least one stop first so AI can personalise your itinerary!', { icon: '◆' });
      return;
    }
    setAiLoading(true);
    try { const r = await tripsAPI.aiSuggest(id); setAiResult(r); }
    catch { toast.error('AI suggestion failed'); }
    finally { setAiLoading(false); }
  };

  const handleAddDayToTrip = async (day) => {
    const matchedStop = trip.stops.find(s => s.city?.toLowerCase() === day.city?.toLowerCase()) || trip.stops[0];
    if (!matchedStop) return toast.error('No stops to add activities to');
    let added = 0;
    for (const a of (day.activities || [])) {
      try {
        const resp = await tripsAPI.addActivity({
          stopId: matchedStop.id,
          name: a.name,
          type: a.type || 'SIGHTSEEING',
          cost: a.estimatedCost ?? 0,
          duration: a.duration || 60,
          notes: a.tip || ''
        });
        // Server returns { activity, budget } — extract the activity
        const newAct = resp?.activity || resp;
        handleActivityAdded(matchedStop.id, newAct);
        added++;
      } catch { /* skip failed */ }
    }
    toast.success(`Added ${added} activit${added !== 1 ? 'ies' : 'y'} to ${matchedStop.city}!`);
    setAddedDays(prev => new Set(prev).add(day.dayNumber));
  };
  const handleAiSuggestStops = async () => {
    if (!trip?.stops?.length) {
      toast('Add at least one stop first so AI knows what is nearby!', { icon: '◆' });
      return;
    }
    setStopsLoading(true);
    try { const r = await tripsAPI.aiSuggestStops(id); setStopsResult(r); }
    catch { toast.error('AI stop suggestion failed'); }
    finally { setStopsLoading(false); }
  };

  const handleAddSuggestedStop = async (suggestion) => {
    try {
      const refStop = trip.stops.find(s => s.city?.toLowerCase() === suggestion.nearestStop?.toLowerCase()) || trip.stops[0];
      const stopData = {
        tripId: id,
        city: suggestion.name,
        country: refStop?.country || 'India',
        startDate: refStop?.startDate || trip.startDate,
        endDate: refStop?.endDate || trip.endDate,
      };
      const newStop = await tripsAPI.addStop(stopData);
      handleStopAdded(newStop);
      // Add activities to the new stop
      let added = 0;
      for (const a of (suggestion.activities || [])) {
        try {
          const resp = await tripsAPI.addActivity({
            stopId: newStop.id,
            name: a.name,
            type: a.type || 'SIGHTSEEING',
            cost: a.estimatedCost ?? 0,
            duration: a.duration || 60,
            notes: ''
          });
          // Server returns { activity, budget } — extract the activity
          const newAct = resp?.activity || resp;
          handleActivityAdded(newStop.id, newAct);
          added++;
        } catch { /* skip */ }
      }
      toast.success(`Added stop: ${suggestion.name} with ${added} activit${added !== 1 ? 'ies' : 'y'}!`);
      setAddedStops(prev => new Set(prev).add(suggestion.name));
    } catch (err) {
      toast.error('Failed to add stop');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: N.muted, fontFamily: N.font }}>Loading itinerary...</div>;
  if (!trip)   return <div style={{ textAlign: 'center', padding: 60, color: N.danger,  fontFamily: N.font }}>Trip not found</div>;

  const pct      = budget ? Math.min(budget.percentUsed, 100) : 0;
  const barColor = budget?.status === 'over' ? N.danger : budget?.status === 'warning' ? N.warning : N.accentSecondary;
  const fmt      = d => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ fontFamily: N.font, display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
      <div>
        {/* Live collaborators bar */}
        <LiveCollaborators tripId={id} viewers={viewers} collaborators={collaborators} onRefresh={loadCollaborators} />

        {/* Trip header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: '0 0 4px', fontFamily: N.fontDisplay, fontSize: 26, fontWeight: 800, color: N.fg, letterSpacing: -0.5 }}>{trip.name}</h1>
            <p style={{ margin: 0, color: N.muted, fontSize: 13 }}>
              {fmt(trip.startDate)} → {fmt(trip.endDate)}
              {trip.description && <span style={{ margin: '0 8px', color: N.muted }}>·</span>}
              {trip.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleAiSuggest} disabled={aiLoading}
              onMouseEnter={() => setAiHov(true)} onMouseLeave={() => setAiHov(false)}
              style={{ ...btnPrimary, padding: '10px 18px', fontSize: 13, minHeight: 'auto', boxShadow: aiHov && !aiLoading ? N.shadowHover : N.shadow, transform: aiHov && !aiLoading ? 'translateY(-1px)' : 'none', opacity: aiLoading ? 0.7 : 1 }}>
              {aiLoading ? 'AI thinking...' : 'AI Suggest →'}
            </button>
            <button onClick={handleAiSuggestStops} disabled={stopsLoading}
              onMouseEnter={() => setStopsHov(true)} onMouseLeave={() => setStopsHov(false)}
              style={{ ...btn, padding: '10px 18px', fontSize: 13, minHeight: 'auto', color: N.accentSecondary, boxShadow: stopsHov && !stopsLoading ? N.shadowHover : N.shadow, transform: stopsHov && !stopsLoading ? 'translateY(-1px)' : 'none', opacity: stopsLoading ? 0.7 : 1 }}>
              {stopsLoading ? 'Searching...' : '◆ Nearby Stops →'}
            </button>
            <Link to={`/trips/${id}/budget`} style={{ ...btn, padding: '10px 18px', fontSize: 13, minHeight: 'auto', textDecoration: 'none', color: N.accentSecondary }}>Budget</Link>
            <Link to={`/trips/${id}/packing`} style={{ ...btn, padding: '10px 18px', fontSize: 13, minHeight: 'auto', textDecoration: 'none', color: N.muted }}>Packing</Link>
          </div>
        </div>

        {/* Budget bar */}
        {budget && (
          <div style={{ ...cardSm, marginBottom: 20, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: N.muted, fontWeight: 600 }}>Budget: <strong style={{ color: N.fg }}>₹{budget.totalBudget?.toLocaleString()}</strong></span>
              <span style={{ color: barColor, fontWeight: 700 }}>₹{budget.totalSpent?.toLocaleString()} spent ({budget.percentUsed}%)</span>
            </div>
            <div style={{ height: 8, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: N.radiusPill, transition: 'width 600ms ease-out' }} />
            </div>
          </div>
        )}

        {/* Stops */}
        {(trip.stops || []).map((stop, i) => (
          <div key={stop.id} style={{ ...card, padding: '24px', marginBottom: 16 }}>
            {/* Stop header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: N.fontDisplay, fontWeight: 800, fontSize: 15, color: N.accent, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div>
                  <h2 style={{ margin: '0 0 3px', fontSize: 18, fontWeight: 700, color: N.fg, fontFamily: N.fontDisplay }}>
                    {stop.city}, {stop.country}
                  </h2>
                  <p style={{ margin: 0, fontSize: 12, color: N.muted }}>{fmt(stop.startDate)} → {fmt(stop.endDate)}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setActModal(stop)} style={{ ...btn, padding: '8px 16px', fontSize: 12, minHeight: 'auto', boxShadow: N.shadowSm, color: N.accent }}>
                  + Activity
                </button>
                <button onClick={() => handleDeleteStop(stop.id)} style={{ ...btn, padding: '8px 14px', fontSize: 12, minHeight: 'auto', boxShadow: N.shadowSm, color: N.danger }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Activities */}
            {(stop.activities || []).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stop.activities.map(a => (
                  <div key={a.id} style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: TYPE_COLOR[a.type] || N.muted, flexShrink: 0 }} />
                    <div style={{ flex: 1, fontWeight: 600, fontSize: 14, color: N.fg }}>{a.name}</div>
                    <span style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, padding: '3px 10px', fontSize: 10, fontWeight: 700, color: TYPE_COLOR[a.type] || N.muted }}>{a.type}</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: a.cost > 0 ? N.fg : N.accentSecondary, minWidth: 60, textAlign: 'right' }}>
                      {a.cost > 0 ? `₹${a.cost}` : 'Free'}
                    </div>
                    <div style={{ fontSize: 12, color: N.muted, minWidth: 50, textAlign: 'right' }}>{a.duration}m</div>
                    <button onClick={() => handleDeleteActivity(a.id, stop.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: N.muted, fontSize: 16, padding: '0 4px', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, color: N.muted, fontSize: 13 }}>
                No activities planned yet
              </div>
            )}
          </div>
        ))}

        {/* Add stop button */}
        <button onClick={() => setShowAddStop(true)}
          onMouseEnter={() => setAddStopHov(true)}
          onMouseLeave={() => setAddStopHov(false)}
          style={{ ...btn, width: '100%', padding: '18px', fontSize: 15, fontWeight: 700, color: N.accent, boxShadow: addStopHov ? N.shadowHover : N.shadow, transform: addStopHov ? 'translateY(-1px)' : 'none', border: `2px dashed ${addStopHov ? N.accent : 'rgb(163,177,198,0.5)'}`, transition: N.transition, borderRadius: N.radiusMd }}>
          + Add Stop
        </button>

        {showAddStop && <AddStopModal tripId={id} onClose={() => setShowAddStop(false)} onAdded={handleStopAdded} />}
        {actModal    && <AddActivityModal stop={actModal} onClose={() => setActModal(null)} onAdded={handleActivityAdded} />}

        {/* AI Result modal */}
        {aiResult && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
            <div style={{ ...card, maxWidth: 620, width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontFamily: N.fontDisplay, fontSize: 20, fontWeight: 700, color: N.fg }}>AI Suggested Itinerary</h3>
                <button onClick={() => setAiResult(null)} style={{ ...btn, padding: '8px 12px', boxShadow: N.shadowSm, fontSize: 16, minHeight: 'auto' }}>✕</button>
              </div>

              {/* Trip context used by AI */}
              <div style={{ background: N.bg, boxShadow: N.shadowInset, borderRadius: N.radiusInner, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: N.muted, fontWeight: 600 }}>
                <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: N.muted, marginBottom: 8 }}>Context sent to AI</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 16px' }}>
                  <span>◆ <strong style={{ color: N.fg }}>{trip.name}</strong></span>
                  <span>◆ {new Date(trip.startDate).toLocaleDateString('en-IN', { day:'numeric',month:'short' })} → {new Date(trip.endDate).toLocaleDateString('en-IN', { day:'numeric',month:'short',year:'numeric' })}</span>
                  <span>◆ Budget: <strong style={{ color: N.fg }}>₹{trip.totalBudget?.toLocaleString()}</strong></span>
                  <span>◆ Stops: <strong style={{ color: N.accent }}>{trip.stops.map(s => s.city).join(' → ') || 'None'}</strong></span>
                </div>
              </div>

              {/* Budget summary */}
              <div style={{ ...cardSm, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontWeight: 700, color: N.fg }}>Est. Total: ₹{aiResult.totalEstimatedCost?.toLocaleString()}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: aiResult.budgetStatus === 'within' ? N.accentSecondary : N.danger }}>
                  {aiResult.budgetStatus === 'within' ? '✓ Within budget' : '! Over budget'}
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 11, color: N.muted, fontWeight: 600 }}>
                  {aiResult.days?.length} day{aiResult.days?.length !== 1 ? 's' : ''} planned
                </div>
              </div>


              {/* Days */}
              {(aiResult.days || []).map(day => {
                const dayAdded = addedDays.has(day.dayNumber);
                return (
                  <div key={day.dayNumber} style={{ marginBottom: 24, opacity: dayAdded ? 0.7 : 1, transition: 'opacity 0.3s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: dayAdded ? N.accentSecondary : N.accent, flexShrink: 0 }}>{day.dayNumber}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: N.fg, fontSize: 15 }}>Day {day.dayNumber} — {day.city}</div>
                          <div style={{ fontSize: 12, color: N.muted, fontStyle: 'italic' }}>{day.theme}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => !dayAdded && handleAddDayToTrip(day)}
                        disabled={dayAdded}
                        style={{ ...btn, padding: '6px 14px', fontSize: 11, minHeight: 'auto', fontWeight: 700,
                          boxShadow: dayAdded ? 'none' : N.shadowSm,
                          background: 'transparent',
                          color: dayAdded ? N.accentSecondary : N.accent,
                          cursor: dayAdded ? 'default' : 'pointer',
                        }}>
                        {dayAdded ? '✓ Added' : '+ Add to Trip'}
                      </button>
                    </div>
                    <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, overflow: 'hidden' }}>
                      {(day.activities || []).map((a, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: idx < day.activities.length - 1 ? `1px solid rgb(163,177,198,0.2)` : 'none', fontSize: 13, color: N.fg, alignItems: 'flex-start', gap: 10 }}>
                          <div>
                            <span style={{ fontWeight: 600 }}>{a.time} · {a.name}</span>
                            {a.tip && <div style={{ fontSize: 11, color: N.muted, marginTop: 2 }}>💡 {a.tip}</div>}
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontWeight: 700, color: a.estimatedCost > 0 ? N.fg : N.accentSecondary }}>₹{a.estimatedCost || 0}</div>
                            <div style={{ fontSize: 10, color: N.muted }}>{a.duration}m</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {day.budgetTip && <div style={{ fontSize: 12, color: N.warning, marginTop: 8, fontWeight: 600, paddingLeft: 4 }}>◆ {day.budgetTip}</div>}
                    <div style={{ fontSize: 11, color: N.muted, marginTop: 6, textAlign: 'right', fontWeight: 600 }}>Est. day cost: ₹{day.estimatedDayCost?.toLocaleString()}</div>
                  </div>
                );
              })}

              {/* General tips */}
              {(aiResult.generalTips || []).length > 0 && (
                <div style={{ ...cardSm, padding: '16px 20px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: N.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>General Tips</div>
                  {aiResult.generalTips.map((t, i) => (
                    <div key={i} style={{ fontSize: 13, color: N.fg, paddingLeft: 12, marginBottom: 6, display: 'flex', gap: 8 }}>
                      <span style={{ color: N.accent, flexShrink: 0 }}>◆</span>{t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Nearby Stops Modal ──────────────────────────────────────── */}
        {stopsResult && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
            <div style={{ ...card, maxWidth: 640, width: '100%', maxHeight: '88vh', overflowY: 'auto', padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontFamily: N.fontDisplay, fontSize: 20, fontWeight: 700, color: N.fg }}>◆ Nearby Famous Places</h3>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: N.muted, fontWeight: 600 }}>AI-suggested stops within 20–30 km of your route</p>
                </div>
                <button onClick={() => setStopsResult(null)} style={{ ...btn, padding: '8px 12px', boxShadow: N.shadowSm, fontSize: 16, minHeight: 'auto' }}>✕</button>
              </div>

              {/* Context */}
              <div style={{ background: N.bg, boxShadow: N.shadowInset, borderRadius: N.radiusInner, padding: '10px 14px', marginBottom: 20, fontSize: 11, color: N.muted, fontWeight: 600 }}>
                Based on your stops: <strong style={{ color: N.accent }}>{trip.stops.map(s => s.city).join(' → ')}</strong>
              </div>

              {/* Suggestions */}
              {(stopsResult.suggestions || []).map((s, i) => {
                const stopAdded = addedStops.has(s.name);
                return (
                <div key={i} style={{ ...cardSm, padding: '18px 20px', marginBottom: 16, opacity: stopAdded ? 0.75 : 1, transition: 'opacity 0.3s', position: 'relative' }}>
                  {stopAdded && (
                    <div style={{ position: 'absolute', top: 12, right: 12, background: N.bg, boxShadow: N.shadowInset, borderRadius: N.radiusPill, padding: '3px 12px', fontSize: 11, fontWeight: 800, color: N.accentSecondary }}>
                      ✓ Added to Trip
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontFamily: N.fontDisplay, fontWeight: 800, fontSize: 16, color: N.fg }}>{s.name}</span>
                        <span style={{ background: N.bg, boxShadow: N.shadowInset, borderRadius: N.radiusPill, padding: '2px 10px', fontSize: 10, fontWeight: 800, color: N.accentSecondary }}>{s.distance}</span>
                      </div>
                      <div style={{ fontSize: 11, color: N.muted, fontWeight: 600, marginBottom: 6 }}>Near: {s.nearestStop}</div>
                      <div style={{ fontSize: 13, color: N.fg, lineHeight: 1.5 }}>{s.description}</div>
                    </div>
                    {!stopAdded && (
                      <button onClick={() => handleAddSuggestedStop(s)}
                        style={{ ...btnPrimary, padding: '8px 16px', fontSize: 12, minHeight: 'auto', flexShrink: 0, marginLeft: 14, fontWeight: 700 }}>
                        + Add as Stop
                      </button>
                    )}
                  </div>

                  {/* Meta row */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 11, color: N.fg, fontWeight: 600, display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ color: N.accent }}>⏰</span> {s.bestTime}
                    </div>
                    <div style={{ fontSize: 11, color: N.fg, fontWeight: 600, display: 'flex', gap: 5, alignItems: 'center' }}>
                      <span style={{ color: N.warning }}>🛺</span> {s.travelTip}
                    </div>
                  </div>

                  {/* Activities */}
                  {(s.activities || []).length > 0 && (
                    <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, overflow: 'hidden' }}>
                      {s.activities.map((a, j) => (
                        <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderBottom: j < s.activities.length - 1 ? `1px solid rgba(163,177,198,0.2)` : 'none', fontSize: 12, alignItems: 'center', gap: 10 }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_COLOR[a.type] || N.muted, flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, color: N.fg }}>{a.name}</span>
                            <span style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, padding: '1px 8px', fontSize: 9, fontWeight: 800, color: TYPE_COLOR[a.type] || N.muted }}>{a.type}</span>
                          </div>
                          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                            <span style={{ color: a.estimatedCost > 0 ? N.fg : N.accentSecondary, fontWeight: 700 }}>₹{a.estimatedCost || 0}</span>
                            <span style={{ color: N.muted }}>{a.duration}m</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );})}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div style={{ position: 'sticky', top: 80 }}>
        <TripHealthScore tripId={id} />
      </div>
    </div>
  );
}
