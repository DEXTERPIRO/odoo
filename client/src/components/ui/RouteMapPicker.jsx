import { useState, useEffect, useRef } from 'react';
import { N, card, cardSm, btn, btnPrimary, input } from '../../neu';

const POPULAR = [
  { city: 'Delhi',     lat: 28.6139, lon: 77.2090, country: 'India' },
  { city: 'Mumbai',    lat: 19.0760, lon: 72.8777, country: 'India' },
  { city: 'Goa',       lat: 15.2993, lon: 74.1240, country: 'India' },
  { city: 'Jaipur',    lat: 26.9124, lon: 75.7873, country: 'India' },
  { city: 'Manali',    lat: 32.2432, lon: 77.1892, country: 'India' },
  { city: 'Agra',      lat: 27.1767, lon: 78.0081, country: 'India' },
  { city: 'Varanasi',  lat: 25.3176, lon: 82.9739, country: 'India' },
  { city: 'Kolkata',   lat: 22.5726, lon: 88.3639, country: 'India' },
  { city: 'Chennai',   lat: 13.0827, lon: 80.2707, country: 'India' },
  { city: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'India' },
];

const TRANSPORT = [
  { id: 'driving', label: 'Drive',  icon: '▶' },
  { id: 'train',   label: 'Train',  icon: '▶' },
  { id: 'flight',  label: 'Flight', icon: '▶' },
];

export default function RouteMapPicker({ onSelect, onClose }) {
  const [fromPlace, setFromPlace]   = useState(null);
  const [toPlace, setToPlace]       = useState(null);
  const [activeField, setActiveField] = useState('from');
  const [fromQuery, setFromQuery]   = useState('');
  const [toQuery, setToQuery]       = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching]   = useState(false);
  const [route, setRoute]           = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapReady, setMapReady]     = useState(false);
  const [transport, setTransport]   = useState('driving');
  const [fromFocused, setFromFocused] = useState(false);
  const [toFocused, setToFocused]   = useState(false);

  const mapRef       = useRef(null);
  const leafletMap   = useRef(null);
  const fromMarker   = useRef(null);
  const toMarker     = useRef(null);
  const routeLine    = useRef(null);
  const debounce     = useRef(null);
  const activeFieldRef = useRef('from');

  useEffect(() => { activeFieldRef.current = activeField; }, [activeField]);

  useEffect(() => {
    if (window.L) { setMapReady(true); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.onload = () => setMapReady(true);
    document.head.appendChild(js);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([22.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
    map.on('click', (e) => reverseGeocode(e.latlng.lat, e.latlng.lng));
    leafletMap.current = map;
  }, [mapReady]);

  const makeIcon = (color, label) => window.L.divIcon({
    html: `<div style="width:32px;height:32px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#fff;font-weight:900;font-size:12px">${label}</span></div>`,
    iconSize: [32, 32], iconAnchor: [16, 32], className: ''
  });

  const placeMarkerFn = (ref, lat, lon, color, label) => {
    if (!leafletMap.current) return;
    if (ref.current) ref.current.remove();
    ref.current = window.L.marker([lat, lon], { icon: makeIcon(color, label) }).addTo(leafletMap.current);
  };

  const calcRoute = async (from, to) => {
    if (!from || !to || !leafletMap.current) return;
    setRouteLoading(true); setRoute(null);
    if (routeLine.current) { routeLine.current.remove(); routeLine.current = null; }
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
      const data = await (await fetch(url)).json();
      if (data.code !== 'Ok') return;
      const leg = data.routes[0];
      routeLine.current = window.L.geoJSON(leg.geometry, { style: { color: N.accent, weight: 4, opacity: 0.9, dashArray: '8,5' } }).addTo(leafletMap.current);
      leafletMap.current.fitBounds(routeLine.current.getBounds(), { padding: [48, 48] });
      setRoute({ distanceKm: Math.round(leg.distance / 1000), durationMin: Math.round(leg.duration / 60) });
    } catch { /* silent */ }
    finally { setRouteLoading(false); }
  };

  const setPlace = (field, place) => {
    if (field === 'from') {
      setFromPlace(place); setFromQuery(place.city);
      placeMarkerFn(fromMarker, place.lat, place.lon, N.accent, 'A');
    } else {
      setToPlace(place); setToQuery(place.city);
      placeMarkerFn(toMarker, place.lat, place.lon, N.danger, 'B');
    }
    setSuggestions([]);
    if (leafletMap.current) leafletMap.current.flyTo([place.lat, place.lon], 9, { duration: 1 });
    if (field === 'from' && toPlace) calcRoute(place, toPlace);
    if (field === 'to' && fromPlace) calcRoute(fromPlace, place);
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || addr.state || '';
      setPlace(activeFieldRef.current, { lat: parseFloat(lat), lon: parseFloat(lon), city, country: addr.country || 'India', displayName: data.display_name });
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

  const handleInput = (field, val) => {
    field === 'from' ? setFromQuery(val) : setToQuery(val);
    setActiveField(field);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => search(val), 350);
  };

  const pickSuggestion = (s) => {
    const addr = s.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || s.name || '';
    setPlace(activeField, { lat: parseFloat(s.lat), lon: parseFloat(s.lon), city, country: addr.country || 'India', displayName: s.display_name });
  };

  const doSwap = () => {
    const tmpP = fromPlace; const tmpQ = fromQuery;
    setFromPlace(toPlace); setFromQuery(toQuery);
    setToPlace(tmpP); setToQuery(tmpQ);
    if (toPlace) placeMarkerFn(fromMarker, toPlace.lat, toPlace.lon, N.accent, 'A');
    if (tmpP) placeMarkerFn(toMarker, tmpP.lat, tmpP.lon, N.danger, 'B');
    if (toPlace && tmpP) calcRoute(toPlace, tmpP);
  };

  const handleConfirm = () => {
    if (!fromPlace || !toPlace) return;
    onSelect({ from: fromPlace, to: toPlace, ...(route || {}), transport });
    onClose();
  };

  const fmtTime = (min) => {
    if (!min) return '';
    const multipliers = { driving: 1, train: 0.9, flight: 0.15 };
    const adj = Math.round(min * (multipliers[transport] || 1));
    const h = Math.floor(adj / 60), m = adj % 60;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  const step = !fromPlace ? 1 : !toPlace ? 2 : 3;
  const ready = fromPlace && toPlace;

  const inpStyle = (focused) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    background: N.bg, borderRadius: N.radiusMd,
    boxShadow: focused ? N.shadowInsetDeep : N.shadowInset,
    padding: '10px 14px', transition: N.transition,
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}>
      <div style={{ ...card, width: 680, maxWidth: '100%', height: 'min(92vh, 680px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: `1px solid rgba(163,177,198,0.25)`, flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: N.fontDisplay, fontWeight: 900, fontSize: 20, color: N.fg, letterSpacing: -0.5 }}>Route Planner</div>
              <div style={{ fontSize: 12, color: N.muted, marginTop: 3, fontWeight: 600 }}>Search, click the map, or tap a popular city</div>
            </div>
            <button onClick={onClose} style={{ ...btn, width: 36, height: 36, padding: 0, minHeight: 'auto', borderRadius: '50%', fontSize: 16, color: N.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          {/* Step progress — neumorphic */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[['1', 'Set Start', step >= 1], ['2', 'Set End', step >= 2], ['3', 'Confirm', step >= 3]].map(([num, lbl, active], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: i < 2 ? 1 : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: N.bg, boxShadow: active ? N.shadowInset : N.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: active ? N.accent : N.muted, transition: N.transition }}>{num}</div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: active ? N.fg : N.muted, transition: N.transition }}>{lbl}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 2, background: N.bg, boxShadow: 'inset 1px 1px 2px rgba(163,177,198,0.5)', borderRadius: 2 }}><div style={{ height: '100%', width: step > i + 1 ? '100%' : '0%', background: N.accent, borderRadius: 2, transition: 'width 0.4s ease' }} /></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable middle */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 24px 0', position: 'relative' }}>
            {/* FROM */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: N.fontDisplay, fontWeight: 900, fontSize: 12, color: N.accent, flexShrink: 0 }}>A</div>
              <div style={inpStyle(fromFocused && activeField === 'from')} onClick={() => setActiveField('from')}>
                <input value={fromQuery} onFocus={() => { setActiveField('from'); setFromFocused(true); }} onBlur={() => setFromFocused(false)}
                  onChange={e => handleInput('from', e.target.value)}
                  placeholder="From — Starting city…"
                  style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, outline: 'none', color: N.fg, fontFamily: N.font }} />
                {fromPlace && <span style={{ fontSize: 11, color: N.accentSecondary, fontWeight: 800 }}>✓</span>}
                {fromQuery && <button onClick={() => { setFromQuery(''); setFromPlace(null); setSuggestions([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: N.muted, padding: 0 }}>✕</button>}
              </div>
            </div>

            {/* Swap */}
            <div style={{ paddingLeft: 9, marginBottom: 8, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 1, height: 12, background: 'rgba(163,177,198,0.4)', marginLeft: 14 }} />
              <button onClick={doSwap} style={{ ...btn, marginLeft: 8, width: 28, height: 28, padding: 0, minHeight: 'auto', borderRadius: N.radiusInner, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>⇅</button>
            </div>

            {/* TO */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: N.fontDisplay, fontWeight: 900, fontSize: 12, color: N.danger, flexShrink: 0 }}>B</div>
              <div style={inpStyle(toFocused && activeField === 'to')} onClick={() => setActiveField('to')}>
                <input value={toQuery} onFocus={() => { setActiveField('to'); setToFocused(true); }} onBlur={() => setToFocused(false)}
                  onChange={e => handleInput('to', e.target.value)}
                  placeholder="To — Destination city…"
                  style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, outline: 'none', color: N.fg, fontFamily: N.font }} />
                {toPlace && <span style={{ fontSize: 11, color: N.accentSecondary, fontWeight: 800 }}>✓</span>}
                {toQuery && <button onClick={() => { setToQuery(''); setToPlace(null); setSuggestions([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: N.muted, padding: 0 }}>✕</button>}
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div style={{ position: 'absolute', left: 24, right: 24, top: activeField === 'from' ? 60 : 118, background: N.bg, borderRadius: N.radiusMd, boxShadow: N.shadowHover, zIndex: 50, overflow: 'hidden', marginTop: 4 }}>
                {searching && <div style={{ padding: '8px 16px', fontSize: 12, color: N.muted, fontWeight: 600 }}>Searching…</div>}
                {suggestions.map((s, i) => {
                  const addr = s.address || {};
                  const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || s.name || '';
                  const region = [addr.state, addr.country].filter(Boolean).join(', ');
                  return (
                    <div key={i} onClick={() => pickSuggestion(s)}
                      style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? `1px solid rgba(163,177,198,0.2)` : 'none', display: 'flex', gap: 12, alignItems: 'center' }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(163,177,198,0.15)'}
                      onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInset, display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeField === 'from' ? N.accent : N.danger, fontSize: 11, fontWeight: 900, flexShrink: 0 }}>{activeField === 'from' ? 'A' : 'B'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: N.fg }}>{city || s.name}</div>
                        <div style={{ fontSize: 11, color: N.muted, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{region}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Popular cities */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: N.muted, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 8 }}>
                Popular — tap to set as {activeField === 'from' ? 'Start' : 'Destination'}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {POPULAR.map(c => (
                  <button key={c.city}
                    onClick={() => setPlace(activeField, { lat: c.lat, lon: c.lon, city: c.city, country: c.country, displayName: `${c.city}, India` })}
                    style={{ padding: '5px 14px', background: N.bg, border: 'none', borderRadius: N.radiusPill, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: N.transition, color: N.muted, boxShadow: N.shadowSm, fontFamily: N.font }}>
                    {c.city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map */}
          <div style={{ position: 'relative', flexShrink: 0, height: 180 }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            {!mapReady && <div style={{ position: 'absolute', inset: 0, background: N.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: N.muted, fontSize: 14, fontFamily: N.font, fontWeight: 700 }}>Loading map…</div>}
            {mapReady && !fromPlace && (
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: N.bg, boxShadow: N.shadow, color: N.accent, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: N.radiusPill, pointerEvents: 'none', whiteSpace: 'nowrap', fontFamily: N.font }}>
                Click map to set Start
              </div>
            )}
            {mapReady && fromPlace && !toPlace && (
              <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: N.bg, boxShadow: N.shadow, color: N.danger, fontSize: 11, fontWeight: 700, padding: '5px 14px', borderRadius: N.radiusPill, pointerEvents: 'none', whiteSpace: 'nowrap', fontFamily: N.font }}>
                Now click to set Destination
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px', borderTop: `1px solid rgba(163,177,198,0.25)`, flexShrink: 0 }}>
          {/* Transport toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {TRANSPORT.map(t => (
              <button key={t.id} onClick={() => setTransport(t.id)}
                style={{ flex: 1, padding: '8px', borderRadius: N.radiusInner, border: 'none', background: N.bg, fontWeight: 700, fontSize: 12, cursor: 'pointer', color: transport === t.id ? N.accent : N.muted, boxShadow: transport === t.id ? N.shadowInset : N.shadowSm, transition: N.transition, fontFamily: N.font }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Route info */}
          {routeLoading && (
            <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '8px 14px', marginBottom: 10, fontSize: 12, color: N.muted, fontWeight: 600 }}>Calculating route…</div>
          )}
          {route && !routeLoading && (
            <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '10px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: N.fg, fontFamily: N.fontDisplay }}>{route.distanceKm} km</div>
                <div style={{ fontSize: 10, color: N.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Distance</div>
              </div>
              <div style={{ width: 1, height: 32, background: 'rgba(163,177,198,0.4)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: N.fg, fontFamily: N.fontDisplay }}>{fmtTime(route.durationMin)}</div>
                <div style={{ fontSize: 10, color: N.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Est. Time</div>
              </div>
              <div style={{ width: 1, height: 32, background: 'rgba(163,177,198,0.4)' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: N.fg }}>{fromPlace?.city} → {toPlace?.city}</div>
                <div style={{ fontSize: 11, color: N.muted, marginTop: 2, fontWeight: 600 }}>Route ready</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ ...btn, padding: '12px 20px', minHeight: 'auto', fontSize: 14 }}>Cancel</button>
            <button onClick={handleConfirm} disabled={!ready}
              style={{ ...btnPrimary, flex: 1, padding: '12px', minHeight: 'auto', fontSize: 14, fontWeight: 800, opacity: ready ? 1 : 0.5, cursor: ready ? 'pointer' : 'not-allowed' }}>
              {ready ? `Use Route: ${fromPlace.city} → ${toPlace.city} →` : 'Set both locations first'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
