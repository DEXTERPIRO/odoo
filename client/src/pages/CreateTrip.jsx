import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { N, card, cardSm, btnPrimary, btn, input, label } from '../neu';
import CityMapPicker from '../components/ui/CityMapPicker';
import RouteMapPicker from '../components/ui/RouteMapPicker';

const SUGGESTIONS = [
  { label: 'Goa Beaches',       desc: 'Sun, sand & seafood',         value: 'Goa, Goa'                 },
  { label: 'Royal Rajasthan',   desc: 'Palaces & heritage',          value: 'Jaipur, Rajasthan'         },
  { label: 'Himalayan Escape',  desc: 'Snow peaks & adventure',      value: 'Manali, Himachal Pradesh'  },
  { label: 'Kerala Backwaters', desc: 'Houseboats & tea estates',    value: 'Kerala Backwaters'         },
  { label: 'Ladakh Trek',       desc: 'High altitude road trip',     value: 'Ladakh, J&K'              },
  { label: 'Spiritual Varanasi',desc: 'Ghats & Ganga Aarti',         value: 'Varanasi, UP'              },
  { label: 'City of Lakes',     desc: 'Romantic Udaipur',            value: 'Udaipur, Rajasthan'        },
  { label: 'Island Paradise',   desc: 'Coral reefs & beaches',       value: 'Andaman Islands'           },
  { label: 'Darjeeling Hills',  desc: 'Toy train & tea gardens',     value: 'Darjeeling, WB'            },
];

export default function CreateTrip() {
  const [form, setForm]           = useState({ name: '', description: '', startDate: '', endDate: '', totalBudget: '' });
  const [loading, setLoading]     = useState(false);
  const [showMap, setShowMap]     = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  const [focused, setFocused]     = useState(null);
  const [submitHov, setSubmitHov] = useState(false);
  const [hovSugg, setHovSugg]     = useState(null);
  const [hovCity, setHovCity]     = useState(false);
  const [hovRoute, setHovRoute]   = useState(false);
  const navigate = useNavigate();

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.startDate || !form.endDate) return toast.error('Please fill required fields');
    setLoading(true);
    try {
      const trip = await tripsAPI.create(form);
      toast.success('Trip created!');
      navigate(`/trips/${trip.id}/build`);
    } catch (err) {
      toast.error(err.error || 'Failed to create trip');
    } finally { setLoading(false); }
  };

  const inpStyle = (name) => ({
    ...input,
    boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset,
    flex: 1,
  });

  const days = form.startDate && form.endDate
    ? Math.max(0, Math.ceil((new Date(form.endDate) - new Date(form.startDate)) / 86400000))
    : null;

  return (
    <div style={{ fontFamily: N.font, color: N.fg, maxWidth: 740, margin: '0 auto' }}>

      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>Plan a New Trip</h1>
        <p style={{ color: N.muted, fontSize: 14, margin: 0 }}>Fill in the details and use the map to plan your route.</p>
      </div>

      {/* Main form card */}
      <div style={{ ...card, marginBottom: 24 }}>
        <form onSubmit={onSubmit} noValidate>

          {/* Trip name */}
          <div style={{ marginBottom: 22 }}>
            <label style={label}>Trip Name *</label>
            <input style={inpStyle('name')} name="name" value={form.name} onChange={onChange}
              placeholder="e.g. Golden Triangle Road Trip" required
              onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} />
          </div>

          {/* Destination */}
          <div style={{ marginBottom: 22 }}>
            <label style={label}>Destination</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input style={inpStyle('description')} name="description" value={form.description} onChange={onChange}
                placeholder="e.g. Jaipur → Agra → Delhi"
                onFocus={() => setFocused('description')} onBlur={() => setFocused(null)} />
              <button type="button" onClick={() => setShowMap(true)}
                onMouseEnter={() => setHovCity(true)}
                onMouseLeave={() => setHovCity(false)}
                style={{
                  ...btn,
                  padding:   '12px 16px',
                  boxShadow: hovCity ? N.shadowHover : N.shadow,
                  transform: hovCity ? 'translateY(-1px)' : 'none',
                  fontSize:  13,
                  color:     N.accent,
                  whiteSpace:'nowrap',
                }}>
                City Map
              </button>
              <button type="button" onClick={() => setShowRoute(true)}
                onMouseEnter={() => setHovRoute(true)}
                onMouseLeave={() => setHovRoute(false)}
                style={{
                  ...btn,
                  padding:   '12px 16px',
                  boxShadow: hovRoute ? N.shadowHover : N.shadow,
                  transform: hovRoute ? 'translateY(-1px)' : 'none',
                  fontSize:  13,
                  color:     N.accentSecondary,
                  whiteSpace:'nowrap',
                }}>
                Route Map
              </button>
            </div>

            {/* Route info card */}
            {routeInfo && (
              <div style={{ ...cardSm, marginTop: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ fontSize: 20, color: N.accent }}>◆</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: N.fg }}>
                    {routeInfo.from.city} → {routeInfo.to.city}
                  </div>
                  <div style={{ fontSize: 12, color: N.muted, marginTop: 2 }}>
                    {routeInfo.distanceKm} km · {routeInfo.transport}
                  </div>
                </div>
                <button onClick={() => { setRouteInfo(null); setForm(f => ({ ...f, description: '' })); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: N.muted, fontSize: 18, padding: 0 }}>✕</button>
              </div>
            )}
            {!routeInfo && form.description && (
              <div style={{ fontSize: 12, color: N.accent, marginTop: 8, fontWeight: 600 }}>◆ {form.description}</div>
            )}
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 22 }}>
            {[['startDate', 'Start Date *'], ['endDate', 'End Date *']].map(([name, lbl]) => (
              <div key={name}>
                <label style={label}>{lbl}</label>
                <input type="date" style={inpStyle(name)} name={name} value={form[name]} onChange={onChange} required
                  onFocus={() => setFocused(name)} onBlur={() => setFocused(null)} />
              </div>
            ))}
          </div>

          {/* Duration pill */}
          {days !== null && days > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill,
              padding: '6px 18px', fontSize: 13, fontWeight: 700, color: N.accent, marginBottom: 22,
            }}>
              {days} night{days !== 1 ? 's' : ''} · {days + 1} days
            </div>
          )}

          {/* Budget */}
          <div style={{ marginBottom: 28 }}>
            <label style={label}>Total Budget (INR)</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
                fontWeight: 700, color: N.muted, fontSize: 15, pointerEvents: 'none',
              }}>₹</span>
              <input type="number" style={{ ...inpStyle('budget'), paddingLeft: 36 }} name="totalBudget"
                value={form.totalBudget} onChange={onChange} placeholder="25000" min="0"
                onFocus={() => setFocused('budget')} onBlur={() => setFocused(null)} />
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            onMouseEnter={() => setSubmitHov(true)}
            onMouseLeave={() => setSubmitHov(false)}
            style={{
              ...btnPrimary,
              width:      '100%',
              padding:    '15px',
              fontSize:   15,
              fontWeight: 800,
              borderRadius: N.radiusBtn,
              opacity:    loading ? 0.7 : 1,
              cursor:     loading ? 'not-allowed' : 'pointer',
              boxShadow:  submitHov && !loading ? `${N.shadowHover}, 0 0 24px rgba(108,99,255,0.35)` : N.shadow,
              transform:  submitHov && !loading ? 'translateY(-1px)' : 'none',
              transition: N.transition,
            }}>
            {loading ? 'Creating...' : 'Create Trip  →'}
          </button>
        </form>
      </div>

      {/* Suggestions */}
      <h2 style={{ margin: '0 0 18px', fontFamily: N.fontDisplay, fontSize: 20 }}>Popular India Trips</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {SUGGESTIONS.map((d, i) => (
          <div key={d.value}
            onClick={() => setForm(f => ({ ...f, description: d.value, name: f.name || d.label }))}
            onMouseEnter={() => setHovSugg(i)}
            onMouseLeave={() => setHovSugg(null)}
            style={{
              background:  N.bg,
              borderRadius: '20px',
              boxShadow:   form.description === d.value ? N.shadowInset : hovSugg === i ? N.shadowHover : N.shadow,
              padding:     '18px 14px',
              textAlign:   'center',
              cursor:      'pointer',
              transform:   hovSugg === i && form.description !== d.value ? 'translateY(-1px)' : 'none',
              transition:  N.transition,
              border:      form.description === d.value ? `2px solid ${N.accent}` : '2px solid transparent',
            }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%', background: N.bg,
              boxShadow: N.shadowInset, margin: '0 auto 10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: form.description === d.value ? N.accent : N.muted, fontSize: 18,
            }}>◆</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: N.fg, marginBottom: 3 }}>{d.label}</div>
            <div style={{ fontSize: 11, color: N.muted }}>{d.desc}</div>
          </div>
        ))}
      </div>

      {showMap && (
        <CityMapPicker
          onSelect={(place) => {
            const loc = [place.city, place.country].filter(Boolean).join(', ');
            setForm(f => ({ ...f, description: loc }));
          }}
          onClose={() => setShowMap(false)}
        />
      )}
      {showRoute && (
        <RouteMapPicker
          onSelect={(result) => {
            const { from, to } = result;
            setForm(f => ({ ...f, description: `${from.city} → ${to.city}`, name: f.name || `${from.city} to ${to.city} Trip` }));
            setRouteInfo(result);
            toast.success(`Route set: ${from.city} → ${to.city}`);
          }}
          onClose={() => setShowRoute(false)}
        />
      )}
    </div>
  );
}
