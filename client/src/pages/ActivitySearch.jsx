import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { N, card, btnPrimary, btn, input, label } from '../neu';

const TYPES = ['All','SIGHTSEEING','FOOD','ADVENTURE','SHOPPING','TRANSPORT','OTHER'];
const TYPE_COLORS = {
  SIGHTSEEING: N.accent,
  FOOD:        N.warning,
  ADVENTURE:   N.danger,
  SHOPPING:    '#DB2777',
  TRANSPORT:   N.muted,
  OTHER:       N.accentSecondary,
};

const CITIES = ['All','Agra','Varanasi','Rishikesh','Jaipur','Manali','Goa','Delhi','Mumbai','Ladakh','Munnar','Andaman','Mysore','Darjeeling','Ranthambore','Hampi','Shimla','Kolkata','Kerala'];

/* ── Add-to-trip modal ─────────────────────────────────────────────────────── */
function AddToTripModal({ activity, onClose }) {
  const [trips, setTrips]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedTrip, setSelectedTrip] = useState('');
  const [selectedStop, setSelectedStop] = useState('');
  const [saving, setSaving]           = useState(false);
  const [focused, setFocused]         = useState(null);
  const [confirmHov, setConfirmHov]   = useState(false);

  useEffect(() => {
    tripsAPI.getAll()
      .then(data => {
        setTrips(data);
        if (data.length) {
          setSelectedTrip(data[0].id);
          if (data[0].stops?.length) setSelectedStop(data[0].stops[0].id);
        }
      })
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  const handleTripChange = e => {
    const id = e.target.value;
    setSelectedTrip(id);
    const trip = trips.find(t => t.id === id);
    setSelectedStop(trip?.stops?.[0]?.id || '');
  };

  const handleAdd = async () => {
    if (!selectedTrip) return toast.error('Select a trip');
    if (!selectedStop) return toast.error('Select a stop');
    setSaving(true);
    try {
      await tripsAPI.addActivity({ stopId: selectedStop, name: activity.name, type: activity.type, cost: activity.cost, duration: activity.duration });
      const trip = trips.find(t => t.id === selectedTrip);
      const stop = trip?.stops?.find(s => s.id === selectedStop);
      toast.success(`${activity.name} added to ${stop?.city}!`);
      onClose();
    } catch { toast.error('Failed to add'); setSaving(false); }
  };

  const trip = trips.find(t => t.id === selectedTrip);
  const sel  = { ...input, cursor: 'pointer' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ ...card, width: 440, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontFamily: N.fontDisplay, fontSize: 20, fontWeight: 700, color: N.fg }}>Add Activity</h3>
            <p style={{ margin: 0, fontSize: 13, color: N.muted }}>{activity.name}</p>
          </div>
          <button onClick={onClose} style={{ ...btn, padding: '8px 12px', fontSize: 18, color: N.muted, boxShadow: N.shadowSm }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: N.muted }}>Loading...</div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: N.danger, fontSize: 14, fontWeight: 600 }}>No trips found. Create one first!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={label}>Select Trip</label>
              <select value={selectedTrip} onChange={handleTripChange} style={sel}>
                {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {trip && (
              <div>
                <label style={label}>Select Stop</label>
                {trip.stops?.length ? (
                  <select value={selectedStop} onChange={e => setSelectedStop(e.target.value)} style={sel}>
                    {trip.stops.map(s => <option key={s.id} value={s.id}>{s.city} ({new Date(s.startDate).toLocaleDateString('en-IN')})</option>)}
                  </select>
                ) : (
                  <div style={{ fontSize: 13, color: N.danger, fontWeight: 600, padding: '8px 0' }}>No stops in this trip. Add a city stop first.</div>
                )}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={onClose} style={{ ...btn, flex: 1, padding: '12px' }}>Cancel</button>
              <button onClick={handleAdd} disabled={saving || !selectedStop}
                onMouseEnter={() => setConfirmHov(true)}
                onMouseLeave={() => setConfirmHov(false)}
                style={{ ...btnPrimary, flex: 2, padding: '12px', opacity: !selectedStop || saving ? 0.6 : 1, cursor: !selectedStop || saving ? 'not-allowed' : 'pointer', boxShadow: confirmHov && selectedStop ? N.shadowHover : N.shadow, transform: confirmHov && selectedStop ? 'translateY(-1px)' : 'none' }}>
                {saving ? 'Adding...' : 'Add to Trip →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
export default function ActivitySearch() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch]         = useState('');
  const [city, setCity]             = useState('All');
  const [type, setType]             = useState('All');
  const [maxCost, setMaxCost]       = useState(5000);
  const [maxDuration, setMaxDuration] = useState('');
  const [sortBy, setSortBy]         = useState('rating');
  const [adding, setAdding]         = useState(null);
  const [hover, setHover]           = useState(null);
  const [addHov, setAddHov]         = useState(null);
  const [focused, setFocused]       = useState(null);

  useEffect(() => {
    const fn = async () => {
      try { const d = await tripsAPI.searchActivities({ search, city, type, maxCost, maxDuration, sortBy }); setActivities(Array.isArray(d) ? d : []); }
      catch { toast.error('Failed to load activities'); }
    };
    const t = setTimeout(fn, 300);
    return () => clearTimeout(t);
  }, [search, city, type, maxCost, maxDuration, sortBy]);

  const fmtDur = m => `${Math.floor(m/60)}h${m%60 ? ` ${m%60}m` : ''}`;
  const stars  = r => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
  const sel    = { ...input, cursor: 'pointer' };

  return (
    <div style={{ fontFamily: N.font, color: N.fg, paddingBottom: 60 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>Discover Activities</h1>
          <p style={{ margin: 0, color: N.muted, fontSize: 14 }}>Find experiences across India</p>
        </div>
        <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, padding: '8px 18px', fontSize: 13, fontWeight: 700, color: N.accent }}>
          {activities.length} activities
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...card, marginBottom: 28, padding: '24px 28px' }}>
        <input type="text" placeholder="Search activities..." value={search} onChange={e => setSearch(e.target.value)}
          onFocus={() => setFocused('search')} onBlur={() => setFocused(null)}
          style={{ ...input, boxShadow: focused === 'search' ? N.shadowInsetDeep : N.shadowInset, fontSize: 16, marginBottom: 16 }} />

        {/* Type chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              background:   N.bg,
              border:       'none',
              cursor:       'pointer',
              borderRadius: N.radiusPill,
              padding:      '7px 16px',
              fontSize:     12,
              fontWeight:   700,
              fontFamily:   N.font,
              color:        type === t ? (t === 'All' ? N.fg : TYPE_COLORS[t] || N.accent) : N.muted,
              boxShadow:    type === t ? N.shadowInset : N.shadowSm,
              transition:   N.transition,
            }}>
              {t === 'All' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {/* Selects + range */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={city} onChange={e => setCity(e.target.value)} onFocus={() => setFocused('city')} onBlur={() => setFocused(null)}
            style={{ ...sel, flex: 1, minWidth: 130, boxShadow: focused === 'city' ? N.shadowInsetDeep : N.shadowInset }}>
            {CITIES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>)}
          </select>

          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              <span>Max Cost</span><span>₹{Number(maxCost).toLocaleString()}</span>
            </div>
            <input type="range" min="0" max="5000" step="100" value={maxCost} onChange={e => setMaxCost(e.target.value)}
              style={{ width: '100%', accentColor: N.accent, cursor: 'pointer' }} />
          </div>

          <select value={maxDuration} onChange={e => setMaxDuration(e.target.value)} onFocus={() => setFocused('dur')} onBlur={() => setFocused(null)}
            style={{ ...sel, flex: 1, minWidth: 130, boxShadow: focused === 'dur' ? N.shadowInsetDeep : N.shadowInset }}>
            {[['','Any Duration'],['60','Under 1 hr'],['180','1–3 hrs'],['360','3–6 hrs'],['480','Full Day']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>

          <select value={sortBy} onChange={e => setSortBy(e.target.value)} onFocus={() => setFocused('sort')} onBlur={() => setFocused(null)}
            style={{ ...sel, flex: 1, minWidth: 130, boxShadow: focused === 'sort' ? N.shadowInsetDeep : N.shadowInset }}>
            {[['rating','Rating'],['cost-low','Cost: Low → High'],['cost-high','Cost: High → Low'],['duration','Duration']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Activity grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {activities.map((a, i) => (
          <div key={a.id}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ ...card, display: 'flex', flexDirection: 'column', padding: '24px', boxShadow: hover === i ? N.shadowHover : N.shadow, transform: hover === i ? 'translateY(-2px)' : 'none' }}>

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: TYPE_COLORS[a.type] || N.muted }}>
                {a.type}
              </span>
              <span style={{ fontSize: 13, color: N.warning, fontWeight: 700 }}>
                {stars(a.rating)} <span style={{ color: N.muted, fontWeight: 500, fontSize: 11 }}>({a.rating})</span>
              </span>
            </div>

            {/* Icon well */}
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>◆</div>

            <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, fontFamily: N.fontDisplay, color: N.fg }}>{a.name}</h2>
            <div style={{ fontSize: 13, color: N.muted, marginBottom: 16 }}>
              ◆ {a.city}
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              {[
                ['Cost',     a.cost === 0 ? 'FREE' : `₹${a.cost.toLocaleString('en-IN')}`, a.cost === 0 ? N.accentSecondary : N.fg],
                ['Duration', fmtDur(a.duration), N.fg],
                ['Level',    a.difficulty, N.muted],
              ].map(([k, v, c]) => (
                <div key={k} style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: N.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: c }}>{v}</div>
                </div>
              ))}
            </div>

            {a.description && (
              <p style={{ margin: '0 0 16px', fontSize: 13, color: N.muted, lineHeight: 1.5, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {a.description}
              </p>
            )}

            <button onClick={() => setAdding(a)}
              onMouseEnter={() => setAddHov(i)}
              onMouseLeave={() => setAddHov(null)}
              style={{ ...btnPrimary, width: '100%', padding: '12px', fontSize: 14, boxShadow: addHov === i ? N.shadowHover : N.shadow, transform: addHov === i ? 'translateY(-1px)' : 'none' }}>
              + Add to Trip
            </button>
          </div>
        ))}
      </div>

      {adding && <AddToTripModal activity={adding} onClose={() => setAdding(null)} />}
    </div>
  );
}
