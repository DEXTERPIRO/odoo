import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { N, card, cardSm, btnPrimary, btn, input, label } from '../neu';

/* ── Add-to-trip modal ─────────────────────────────────────────────────────── */
function AddToTripModal({ city, onClose }) {
  const [trips, setTrips]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedTrip, setSelected] = useState('');
  const [startDate, setStart]       = useState('');
  const [endDate, setEnd]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [focused, setFocused]       = useState(null);
  const [confirmHov, setConfirmHov] = useState(false);

  useEffect(() => {
    tripsAPI.getAll()
      .then(data => { setTrips(data); if (data.length) setSelected(data[0].id); })
      .catch(() => toast.error('Failed to load trips'))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!selectedTrip || !startDate || !endDate) return toast.error('Fill all fields');
    if (new Date(startDate) > new Date(endDate)) return toast.error('Start must be before end');
    setSaving(true);
    try {
      const trip = trips.find(t => t.id === selectedTrip);
      await tripsAPI.addStop({ tripId: selectedTrip, city: city.name, country: city.country, startDate, endDate, orderIndex: trip?._count?.stops || 0 });
      toast.success(`${city.name} added to ${trip.name}!`);
      onClose();
    } catch { toast.error('Failed to add stop'); setSaving(false); }
  };

  const sel = { ...input, cursor: 'pointer' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <div style={{ ...card, width: 440, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontFamily: N.fontDisplay, fontSize: 20, fontWeight: 700, color: N.fg }}>Add {city.name}</h3>
            <p style={{ margin: 0, fontSize: 13, color: N.muted }}>to one of your trips</p>
          </div>
          <button onClick={onClose} style={{ ...btn, padding: '8px 12px', fontSize: 18, color: N.muted, boxShadow: N.shadowSm }}>✕</button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: N.muted }}>Loading trips...</div>
        ) : trips.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 24, color: N.danger, fontSize: 14, fontWeight: 600 }}>No trips found. Create one first!</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={label}>Select Trip</label>
              <select value={selectedTrip} onChange={e => setSelected(e.target.value)} style={sel}>
                {trips.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[['Start Date', startDate, setStart, 'start'], ['End Date', endDate, setEnd, 'end']].map(([lbl, val, setFn, key]) => (
                <div key={key}>
                  <label style={label}>{lbl}</label>
                  <input type="date" value={val} onChange={e => setFn(e.target.value)}
                    onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                    style={{ ...input, boxShadow: focused === key ? N.shadowInsetDeep : N.shadowInset }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button onClick={onClose} style={{ ...btn, flex: 1, padding: '12px' }}>Cancel</button>
              <button onClick={handleAdd} disabled={saving}
                onMouseEnter={() => setConfirmHov(true)}
                onMouseLeave={() => setConfirmHov(false)}
                style={{ ...btnPrimary, flex: 2, padding: '12px', boxShadow: confirmHov ? N.shadowHover : N.shadow, transform: confirmHov ? 'translateY(-1px)' : 'none' }}>
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
export default function CitySearch() {
  const [cities, setCities]     = useState([]);
  const [search, setSearch]     = useState('');
  const [region, setRegion]     = useState('All');
  const [maxCost, setMaxCost]   = useState('');
  const [sortBy, setSortBy]     = useState('popularity');
  const [addingCity, setAdding] = useState(null);
  const [hover, setHover]       = useState(null);
  const [addHov, setAddHov]     = useState(null);
  const [focused, setFocused]   = useState(null);

  useEffect(() => {
    const fn = async () => {
      try { const d = await tripsAPI.searchCities({ search, region, maxCost, sortBy }); setCities(Array.isArray(d) ? d : []); }
      catch { toast.error('Failed to load cities'); }
    };
    const t = setTimeout(fn, 300);
    return () => clearTimeout(t);
  }, [search, region, maxCost, sortBy]);

  const selStyle = { ...input, cursor: 'pointer', flex: 1 };

  return (
    <div style={{ fontFamily: N.font, color: N.fg }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>Explore Cities</h1>
          <p style={{ margin: 0, color: N.muted, fontSize: 14 }}>Discover incredible Indian destinations</p>
        </div>
        <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, padding: '8px 18px', fontSize: 13, fontWeight: 700, color: N.accent }}>
          {cities.length} cities
        </div>
      </div>

      {/* Filter card */}
      <div style={{ ...card, marginBottom: 28, padding: '24px 28px' }}>
        <input type="text" placeholder="Search cities..." value={search} onChange={e => setSearch(e.target.value)}
          onFocus={() => setFocused('search')} onBlur={() => setFocused(null)}
          style={{ ...input, boxShadow: focused === 'search' ? N.shadowInsetDeep : N.shadowInset, fontSize: 16, marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            ['region', region, setRegion, [['All','All Regions'],['North India','North India'],['South India','South India'],['West India','West India'],['East India','East India'],['Northeast India','Northeast India'],['Island','Islands']]],
            ['maxCost', maxCost, setMaxCost, [['','Any Budget'],['1','Budget (₹)'],['2','Moderate (₹₹)'],['3','Premium (₹₹₹)']]],
            ['sortBy', sortBy, setSortBy, [['popularity','Popularity'],['cost-low','Cost: Low → High'],['cost-high','Cost: High → Low'],['name','Name A–Z']]],
          ].map(([key, val, set, opts]) => (
            <select key={key} value={val} onChange={e => set(e.target.value)}
              onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
              style={{ ...selStyle, boxShadow: focused === key ? N.shadowInsetDeep : N.shadowInset, minWidth: 160 }}>
              {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* City grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {cities.map((c, i) => (
          <div key={c.id}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            style={{ ...card, display: 'flex', flexDirection: 'column', padding: '26px', boxShadow: hover === i ? N.shadowHover : N.shadow, transform: hover === i ? 'translateY(-2px)' : 'none' }}>

            {/* Icon well */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px' }}>
              ◆
            </div>

            <h2 style={{ margin: '0 0 2px', fontSize: 20, textAlign: 'center', fontFamily: N.fontDisplay }}>{c.name}</h2>
            <div style={{ color: N.muted, fontSize: 13, textAlign: 'center', marginBottom: 16 }}>{c.country}</div>

            {/* Tags */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {[c.region, c.state].filter(Boolean).map(t => (
                <span key={t} style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: N.muted }}>{t}</span>
              ))}
              <span style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, padding: '4px 12px', fontSize: 11, fontWeight: 700, color: N.accentSecondary }}>
                {'₹'.repeat(c.costIndex)}
              </span>
            </div>

            {/* Popularity bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>
                <span>Popularity</span><span>{c.popularity}%</span>
              </div>
              <div style={{ height: 8, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${c.popularity}%`, background: N.accent, borderRadius: N.radiusPill, transition: 'width 600ms ease-out' }} />
              </div>
            </div>

            {/* Info rows */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {[['Best Time', c.bestTime], ['Language', c.language]].map(([k, v]) => (
                <div key={k} style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '8px 12px' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: N.fg }}>{v || '—'}</div>
                </div>
              ))}
            </div>

            {c.description && (
              <div style={{ fontSize: 12, color: N.muted, lineHeight: 1.5, marginBottom: 16, flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {c.description}
              </div>
            )}

            <button onClick={() => setAdding(c)}
              onMouseEnter={() => setAddHov(i)}
              onMouseLeave={() => setAddHov(null)}
              style={{ ...btnPrimary, width: '100%', padding: '12px', fontSize: 14, boxShadow: addHov === i ? N.shadowHover : N.shadow, transform: addHov === i ? 'translateY(-1px)' : 'none' }}>
              + Add to Trip
            </button>
          </div>
        ))}
      </div>

      {addingCity && <AddToTripModal city={addingCity} onClose={() => setAdding(null)} />}
    </div>
  );
}
