import { useState, useEffect, useRef } from 'react';
import { N, card, btn, btnPrimary, input } from '../../neu';

const POPULAR = [
  { city: 'Goa',        lat: 15.2993, lon: 74.1240, country: 'India', tag: 'Beach'      },
  { city: 'Jaipur',     lat: 26.9124, lon: 75.7873, country: 'India', tag: 'Heritage'   },
  { city: 'Manali',     lat: 32.2432, lon: 77.1892, country: 'India', tag: 'Mountains'  },
  { city: 'Varanasi',   lat: 25.3176, lon: 82.9739, country: 'India', tag: 'Spiritual'  },
  { city: 'Munnar',     lat: 10.0889, lon: 77.0595, country: 'India', tag: 'Nature'     },
  { city: 'Agra',       lat: 27.1767, lon: 78.0081, country: 'India', tag: 'Iconic'     },
  { city: 'Rishikesh',  lat: 30.0869, lon: 78.2676, country: 'India', tag: 'Wellness'   },
  { city: 'Ladakh',     lat: 34.1526, lon: 77.5771, country: 'India', tag: 'Adventure'  },
  { city: 'Udaipur',    lat: 24.5854, lon: 73.7125, country: 'India', tag: 'Lakes'      },
  { city: 'Andaman',    lat: 11.7401, lon: 92.6586, country: 'India', tag: 'Islands'    },
  { city: 'Darjeeling', lat: 27.0410, lon: 88.2663, country: 'India', tag: 'Hill Station'},
  { city: 'Coorg',      lat: 12.4244, lon: 75.7382, country: 'India', tag: 'Coffee'     },
];

export default function CityMapPicker({ onSelect, onClose }) {
  const [query, setQuery]           = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected]     = useState(null);
  const [searching, setSearching]   = useState(false);
  const [mapReady, setMapReady]     = useState(false);
  const [focused, setFocused]       = useState(false);
  const mapRef    = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const debounce  = useRef(null);

  useEffect(() => {
    if (window.L) { setMapReady(true); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => setMapReady(true);
    document.head.appendChild(js);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([22.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    map.on('click', (e) => reverseGeocode(e.latlng.lat, e.latlng.lng));
    leafletMap.current = map;
  }, [mapReady]);

  const makeIcon = () => window.L.divIcon({
    html: `<div style="width:32px;height:32px;background:${N.accent};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(108,99,255,0.5);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#fff;font-weight:900;font-size:13px">◆</span></div>`,
    iconSize: [32, 32], iconAnchor: [16, 32], className: ''
  });

  const placePin = (lat, lon) => {
    if (!leafletMap.current) return;
    if (markerRef.current) markerRef.current.remove();
    markerRef.current = window.L.marker([lat, lon], { icon: makeIcon() }).addTo(leafletMap.current);
    leafletMap.current.flyTo([lat, lon], 12, { duration: 1.2 });
  };

  const applyPlace = (place) => {
    setSelected(place);
    setQuery(place.city);
    setSuggestions([]);
    placePin(place.lat, place.lon);
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
      applyPlace({ lat: parseFloat(lat), lon: parseFloat(lon), city, country: addr.country || 'India', displayName: data.display_name });
    } catch { /* silent */ }
  };

  const search = async (q) => {
    if (!q || q.length < 2) { setSuggestions([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6`, { headers: { 'Accept-Language': 'en' } });
      setSuggestions(await res.json());
    } catch { setSuggestions([]); }
    finally { setSearching(false); }
  };

  const handleInput = (val) => {
    setQuery(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val), 350);
  };

  const pickSuggestion = (s) => {
    const addr = s.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || s.name || '';
    applyPlace({ lat: parseFloat(s.lat), lon: parseFloat(s.lon), city, country: addr.country || 'India', displayName: s.display_name });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}>
      <div style={{ ...card, width: 600, maxWidth: '98vw', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: 0 }}>

        {/* Header */}
        <div style={{ padding: '22px 26px 18px', borderBottom: `1px solid rgba(163,177,198,0.25)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: N.fontDisplay, fontWeight: 900, fontSize: 20, color: N.fg, letterSpacing: -0.5 }}>Pick a City</div>
            <div style={{ fontSize: 12, color: N.muted, marginTop: 3, fontWeight: 600 }}>Search, tap a popular city, or click the map</div>
          </div>
          <button onClick={onClose} style={{ ...btn, width: 36, height: 36, padding: 0, minHeight: 'auto', borderRadius: '50%', fontSize: 18, color: N.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '16px 24px 0', flexShrink: 0, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: N.bg, borderRadius: N.radiusMd, boxShadow: focused ? N.shadowInsetDeep : N.shadowInset, padding: '11px 16px', transition: N.transition }}>
            <span style={{ fontSize: 15, color: N.muted, fontWeight: 700 }}>◆</span>
            <input
              value={query}
              onChange={e => handleInput(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Search any city, town, or landmark in India…"
              autoFocus
              style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, outline: 'none', color: N.fg, fontFamily: N.font }}
            />
            {searching && <span style={{ fontSize: 11, color: N.muted, fontWeight: 700 }}>Searching…</span>}
            {query && !searching && (
              <button onClick={() => { setQuery(''); setSuggestions([]); setSelected(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: N.muted, fontSize: 16, padding: 0, lineHeight: 1 }}>✕</button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', left: 24, right: 24, top: '100%', background: N.bg, borderRadius: N.radiusMd, boxShadow: N.shadowHover, zIndex: 50, overflow: 'hidden', marginTop: 6 }}>
              {suggestions.map((s, i) => {
                const addr = s.address || {};
                const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || s.name || '';
                const region = [addr.state, addr.country].filter(Boolean).join(', ');
                return (
                  <div key={i} onClick={() => pickSuggestion(s)}
                    style={{ padding: '11px 16px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? `1px solid rgba(163,177,198,0.2)` : 'none', display: 'flex', gap: 12, alignItems: 'center', transition: N.transition }}
                    onMouseOver={e => e.currentTarget.style.background = 'rgba(163,177,198,0.15)'}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center', color: N.accent, fontSize: 14, fontWeight: 900, flexShrink: 0 }}>◆</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: N.fg }}>{city || s.name}</div>
                      <div style={{ fontSize: 11, color: N.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{region}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular cities */}
        <div style={{ padding: '14px 24px 0', flexShrink: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: N.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Popular Indian Destinations</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {POPULAR.map(c => (
              <button key={c.city}
                onClick={() => applyPlace({ lat: c.lat, lon: c.lon, city: c.city, country: c.country, displayName: `${c.city}, India` })}
                style={{
                  padding: '5px 14px', borderRadius: N.radiusPill, border: 'none',
                  background: N.bg,
                  boxShadow: selected?.city === c.city ? N.shadowInset : N.shadowSm,
                  color: selected?.city === c.city ? N.accent : N.muted,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: N.transition, fontFamily: N.font,
                }}>
                {c.city} <span style={{ opacity: 0.6, fontWeight: 500 }}>· {c.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minHeight: 200, margin: '12px 0 0' }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%', minHeight: 200 }} />
          {!mapReady && <div style={{ position: 'absolute', inset: 0, background: N.bg, boxShadow: N.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center', color: N.muted, fontSize: 14, fontFamily: N.font, fontWeight: 700 }}>Loading map…</div>}
          {mapReady && !selected && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: N.bg, boxShadow: N.shadow, color: N.accent, fontSize: 12, fontWeight: 700, padding: '7px 18px', borderRadius: N.radiusPill, pointerEvents: 'none', whiteSpace: 'nowrap', fontFamily: N.font }}>
              Click the map to pick a location
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: `1px solid rgba(163,177,198,0.25)`, flexShrink: 0 }}>
          {selected ? (
            <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '12px 16px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center', color: N.accent, fontSize: 18, fontWeight: 900, flexShrink: 0 }}>◆</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: N.fg, fontFamily: N.fontDisplay }}>{selected.city}</div>
                <div style={{ fontSize: 11, color: N.muted, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{selected.country}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, color: N.accentSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Selected</span>
            </div>
          ) : (
            <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '11px 16px', marginBottom: 14, fontSize: 13, color: N.muted, fontWeight: 600, fontFamily: N.font }}>
              ◆ No city selected yet — search or click the map
            </div>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={onClose} style={{ ...btn, padding: '12px 20px', minHeight: 'auto', fontSize: 14 }}>Cancel</button>
            <button onClick={() => { if (selected) { onSelect(selected); onClose(); } }} disabled={!selected}
              style={{ ...btnPrimary, flex: 1, padding: '12px', minHeight: 'auto', fontSize: 15, fontWeight: 800, opacity: selected ? 1 : 0.5, cursor: selected ? 'pointer' : 'not-allowed' }}>
              {selected ? `Use ${selected.city} →` : 'Select a city first'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
