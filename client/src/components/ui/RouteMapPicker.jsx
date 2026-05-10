import { useState, useEffect, useRef } from 'react';

const POPULAR = [
  { city: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'India', emoji: '🏛️' },
  { city: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India', emoji: '🎬' },
  { city: 'Goa', lat: 15.2993, lon: 74.1240, country: 'India', emoji: '🏖️' },
  { city: 'Jaipur', lat: 26.9124, lon: 75.7873, country: 'India', emoji: '🏰' },
  { city: 'Manali', lat: 32.2432, lon: 77.1892, country: 'India', emoji: '🏔️' },
  { city: 'Agra', lat: 27.1767, lon: 78.0081, country: 'India', emoji: '🕌' },
  { city: 'Varanasi', lat: 25.3176, lon: 82.9739, country: 'India', emoji: '🛕' },
  { city: 'Kolkata', lat: 22.5726, lon: 88.3639, country: 'India', emoji: '🎨' },
  { city: 'Chennai', lat: 13.0827, lon: 80.2707, country: 'India', emoji: '🌊' },
  { city: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'India', emoji: '💻' },
];

const TRANSPORT = [
  { id: 'driving', label: '🚗 Drive', multiplier: 1 },
  { id: 'train', label: '🚆 Train', multiplier: 0.9 },
  { id: 'flight', label: '✈️ Flight', multiplier: 0.15 },
];

export default function RouteMapPicker({ onSelect, onClose }) {
  const [fromPlace, setFromPlace] = useState(null);
  const [toPlace, setToPlace] = useState(null);
  const [activeField, setActiveField] = useState('from');
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [route, setRoute] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [transport, setTransport] = useState('driving');

  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const fromMarker = useRef(null);
  const toMarker = useRef(null);
  const routeLine = useRef(null);
  const debounce = useRef(null);
  const activeFieldRef = useRef('from');

  useEffect(() => { activeFieldRef.current = activeField; }, [activeField]);

  // Load Leaflet
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

  // Init map
  useEffect(() => {
    if (!mapReady || !mapRef.current || leafletMap.current) return;
    const L = window.L;
    const map = L.map(mapRef.current, { zoomControl: true }).setView([22.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    map.on('click', (e) => reverseGeocode(e.latlng.lat, e.latlng.lng));
    leafletMap.current = map;
  }, [mapReady]);

  const makeIcon = (color, label) => window.L.divIcon({
    html: `<div style="width:36px;height:36px;background:${color};border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:#fff;font-weight:900;font-size:13px">${label}</span></div>`,
    iconSize: [36, 36], iconAnchor: [18, 36], className: ''
  });

  const placeMarkerFn = (ref, lat, lon, color, label) => {
    if (!leafletMap.current) return;
    if (ref.current) ref.current.remove();
    ref.current = window.L.marker([lat, lon], { icon: makeIcon(color, label) }).addTo(leafletMap.current);
  };

  const calcRoute = async (from, to) => {
    if (!from || !to || !leafletMap.current) return;
    setRouteLoading(true);
    setRoute(null);
    if (routeLine.current) { routeLine.current.remove(); routeLine.current = null; }
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
      const data = await (await fetch(url)).json();
      if (data.code !== 'Ok') return;
      const leg = data.routes[0];
      const distanceKm = Math.round(leg.distance / 1000);
      const durationMin = Math.round(leg.duration / 60);
      routeLine.current = window.L.geoJSON(leg.geometry, {
        style: { color: '#1D9E75', weight: 5, opacity: 0.9, dashArray: '10,6' }
      }).addTo(leafletMap.current);
      leafletMap.current.fitBounds(routeLine.current.getBounds(), { padding: [48, 48] });
      setRoute({ distanceKm, durationMin });
    } catch { /* silent */ }
    finally { setRouteLoading(false); }
  };

  const setPlace = (field, place) => {
    if (field === 'from') {
      setFromPlace(place); setFromQuery(place.city);
      placeMarkerFn(fromMarker, place.lat, place.lon, '#1D9E75', 'A');
    } else {
      setToPlace(place); setToQuery(place.city);
      placeMarkerFn(toMarker, place.lat, place.lon, '#E53E3E', 'B');
    }
    setSuggestions([]);
    if (leafletMap.current) leafletMap.current.flyTo([place.lat, place.lon], 9, { duration: 1 });
    // trigger route if both set
    if (field === 'from' && toPlace) calcRoute(place, toPlace);
    if (field === 'to' && fromPlace) calcRoute(fromPlace, place);
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || addr.state || '';
      const place = { lat: parseFloat(lat), lon: parseFloat(lon), city, country: addr.country || 'India', displayName: data.display_name };
      setPlace(activeFieldRef.current, place);
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
    const place = { lat: parseFloat(s.lat), lon: parseFloat(s.lon), city, country: addr.country || 'India', displayName: s.display_name };
    setPlace(activeField, place);
  };

  const doSwap = () => {
    const tmpP = fromPlace; const tmpQ = fromQuery;
    setFromPlace(toPlace); setFromQuery(toQuery);
    setToPlace(tmpP); setToQuery(tmpQ);
    if (toPlace) placeMarkerFn(fromMarker, toPlace.lat, toPlace.lon, '#1D9E75', 'A');
    if (tmpP) placeMarkerFn(toMarker, tmpP.lat, tmpP.lon, '#E53E3E', 'B');
    if (toPlace && tmpP) calcRoute(toPlace, tmpP);
  };

  const handleConfirm = () => {
    if (!fromPlace || !toPlace) return;
    onSelect({ from: fromPlace, to: toPlace, ...(route || {}), transport });
    onClose();
  };

  const fmtTime = (min) => {
    if (!min) return '';
    const t = TRANSPORT.find(t => t.id === transport);
    const adj = Math.round(min * (t?.multiplier || 1));
    const h = Math.floor(adj / 60), m = adj % 60;
    if (transport === 'flight') return adj < 60 ? `${adj} min` : `${h}h ${m}m`;
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  const step = !fromPlace ? 1 : !toPlace ? 2 : 3;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '10px' }}>
      {/* Outer card — fixed height, flex column so footer is always visible */}
      <div style={{ background: '#fff', borderRadius: 24, width: 700, maxWidth: '100%', height: 'min(92vh, 700px)', boxShadow: '0 32px 80px rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ background: 'linear-gradient(135deg, #1D9E75 0%, #0a5c3f 100%)', padding: '20px 24px', color: '#fff', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: -0.5 }}>🗺️ Route Planner</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>Search, click the map, or tap a popular city</div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
          </div>
          {/* Step progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14 }}>
            {[['1', 'Set Start', step >= 1], ['→', '', false], ['2', 'Set End', step >= 2], ['→', '', false], ['3', 'Confirm', step >= 3]].map(([num, lbl, active], i) =>
              num === '→'
                ? <div key={i} style={{ flex: 1, height: 2, background: active ? '#fff' : 'rgba(255,255,255,0.25)', borderRadius: 2 }} />
                : <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: active ? '#fff' : 'rgba(255,255,255,0.2)', color: active ? '#1D9E75' : '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{num}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, opacity: active ? 1 : 0.5 }}>{lbl}</span>
                  </div>
            )}
          </div>
        </div>

        {/* ── Scrollable middle: search inputs + popular cities + map ── */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 20px 0', position: 'relative' }}>
          {/* FROM */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, background: '#1D9E75', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13, flexShrink: 0, boxShadow: '0 2px 8px rgba(29,158,117,0.4)' }}>A</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: activeField === 'from' ? '#f0fdf8' : '#f8f8f8', border: `2px solid ${activeField === 'from' ? '#1D9E75' : '#e8e8e8'}`, borderRadius: 12, padding: '9px 14px', transition: 'all 0.2s' }}>
              <input value={fromQuery} onFocus={() => setActiveField('from')} onChange={e => handleInput('from', e.target.value)}
                placeholder="From — Starting city..." style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, outline: 'none', color: '#1a1a1a' }} />
              {fromPlace && <span style={{ fontSize: 12, color: '#1D9E75', fontWeight: 700 }}>✓</span>}
              {fromQuery && <button onClick={() => { setFromQuery(''); setFromPlace(null); setSuggestions([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#bbb', padding: 0, marginLeft: 4 }}>×</button>}
            </div>
          </div>

          {/* Swap + connector */}
          <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 9, marginBottom: 8 }}>
            <div style={{ width: 1, height: 14, background: '#ddd', marginLeft: 14 }} />
            <button onClick={doSwap} title="Swap" style={{ marginLeft: 8, width: 28, height: 28, background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', transition: 'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.background = '#e8f5f0'} onMouseOut={e => e.currentTarget.style.background = '#f5f5f5'}>⇅</button>
          </div>

          {/* TO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 30, height: 30, background: '#E53E3E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13, flexShrink: 0, boxShadow: '0 2px 8px rgba(229,62,62,0.4)' }}>B</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: activeField === 'to' ? '#fff5f5' : '#f8f8f8', border: `2px solid ${activeField === 'to' ? '#E53E3E' : '#e8e8e8'}`, borderRadius: 12, padding: '9px 14px', transition: 'all 0.2s' }}>
              <input value={toQuery} onFocus={() => setActiveField('to')} onChange={e => handleInput('to', e.target.value)}
                placeholder="To — Destination city..." style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 14, outline: 'none', color: '#1a1a1a' }} />
              {toPlace && <span style={{ fontSize: 12, color: '#E53E3E', fontWeight: 700 }}>✓</span>}
              {toQuery && <button onClick={() => { setToQuery(''); setToPlace(null); setSuggestions([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#bbb', padding: 0, marginLeft: 4 }}>×</button>}
            </div>
          </div>

          {/* Suggestions dropdown */}
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', left: 20, right: 20, top: activeField === 'from' ? 66 : 124, background: '#fff', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.18)', zIndex: 50, overflow: 'hidden', border: '1px solid #ececec' }}>
              {searching && <div style={{ padding: '8px 16px', fontSize: 12, color: '#aaa' }}>Searching…</div>}
              {suggestions.map((s, i) => {
                const addr = s.address || {};
                const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || s.name || '';
                const region = [addr.state, addr.country].filter(Boolean).join(', ');
                return (
                  <div key={i} onClick={() => pickSuggestion(s)}
                    style={{ padding: '11px 16px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none', display: 'flex', gap: 12, alignItems: 'center' }}
                    onMouseOver={e => e.currentTarget.style.background = activeField === 'from' ? '#f0fdf8' : '#fff5f5'}
                    onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: activeField === 'from' ? '#e8f5f0' : '#ffeaea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                      {activeField === 'from' ? '🟢' : '🔴'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{city || s.name}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{region}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Popular cities */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
              Popular — tap to set as {activeField === 'from' ? '📍 Start' : '🎯 Destination'}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {POPULAR.map(c => (
                <button key={c.city} onClick={() => setPlace(activeField, { lat: c.lat, lon: c.lon, city: c.city, country: c.country, displayName: c.city + ', India' })}
                  style={{ padding: '5px 12px', background: '#f5f5f5', border: '1.5px solid transparent', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s', color: '#333' }}
                  onMouseOver={e => { e.currentTarget.style.background = activeField === 'from' ? '#e8f5f0' : '#ffeaea'; e.currentTarget.style.borderColor = activeField === 'from' ? '#1D9E75' : '#E53E3E'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = 'transparent'; }}>
                  {c.emoji} {c.city}
                </button>
              ))}
            </div>
          </div>
        </div> {/* end inner search div */}

        {/* ── Map — inside scrollable section ── */}
        <div style={{ position: 'relative', flexShrink: 0, height: 180 }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          {!mapReady && <div style={{ position: 'absolute', inset: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>🗺️ Loading map…</div>}
          {mapReady && !fromPlace && (
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(29,158,117,0.92)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 20, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              🟢 Click map to set <strong>Start</strong>
            </div>
          )}
          {mapReady && fromPlace && !toPlace && (
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', background: 'rgba(229,62,62,0.92)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '5px 14px', borderRadius: 20, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              🔴 Now click to set <strong>Destination</strong>
            </div>
          )}
        </div>

        </div> {/* end scrollable middle */}

        {/* ── Footer — NEVER SHRINKS, always visible ── */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', background: '#fafafa', flexShrink: 0 }}>
          {/* Transport mode */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {TRANSPORT.map(t => (
              <button key={t.id} onClick={() => setTransport(t.id)}
                style={{ flex: 1, padding: '7px 4px', borderRadius: 10, border: `2px solid ${transport === t.id ? '#1D9E75' : '#e0e0e0'}`, background: transport === t.id ? '#e8f5f0' : '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer', color: transport === t.id ? '#1D9E75' : '#666', transition: 'all 0.2s' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Route card — compact */}
          {routeLoading && (
            <div style={{ background: '#fff8e1', borderRadius: 10, padding: '8px 14px', marginBottom: 10, fontSize: 12, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>⏳ Calculating route…</div>
          )}
          {route && !routeLoading && (
            <div style={{ background: 'linear-gradient(120deg, #e8f5f0, #f0fdf8)', borderRadius: 12, padding: '10px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #c8e6d8' }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1D9E75' }}>{route.distanceKm} km</div>
                <div style={{ fontSize: 10, color: '#888' }}>Distance</div>
              </div>
              <div style={{ width: 1, height: 32, background: '#c8e6d8' }} />
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#1D9E75' }}>{fmtTime(route.durationMin)}</div>
                <div style={{ fontSize: 10, color: '#888' }}>Est. Time</div>
              </div>
              <div style={{ width: 1, height: 32, background: '#c8e6d8' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{fromPlace?.city} → {toPlace?.city}</div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>Route ready — click Use Route</div>
              </div>
            </div>
          )}
          {!route && !routeLoading && fromPlace && toPlace && (
            <div style={{ background: '#fff8e1', borderRadius: 10, padding: '8px 14px', marginBottom: 10, fontSize: 12, color: '#92400e' }}>⏳ Calculating…</div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '12px 20px', background: '#f0f0f0', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button onClick={handleConfirm} disabled={!fromPlace || !toPlace}
              style={{ flex: 1, padding: 12, background: (fromPlace && toPlace) ? 'linear-gradient(135deg, #1D9E75, #0f6e52)' : '#e0e0e0', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: (fromPlace && toPlace) ? 'pointer' : 'not-allowed', fontSize: 15, boxShadow: (fromPlace && toPlace) ? '0 4px 14px rgba(29,158,117,0.4)' : 'none', transition: 'all 0.2s' }}>
              {fromPlace && toPlace ? `✅ Use Route: ${fromPlace.city} → ${toPlace.city}` : '⬆ Set both locations first'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
