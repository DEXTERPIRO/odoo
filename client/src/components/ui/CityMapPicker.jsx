import { useState, useEffect, useRef } from 'react';

const POPULAR = [
  { city: 'Goa', lat: 15.2993, lon: 74.1240, country: 'India', emoji: '🏖️', tag: 'Beach' },
  { city: 'Jaipur', lat: 26.9124, lon: 75.7873, country: 'India', emoji: '🏰', tag: 'Heritage' },
  { city: 'Manali', lat: 32.2432, lon: 77.1892, country: 'India', emoji: '🏔️', tag: 'Mountains' },
  { city: 'Varanasi', lat: 25.3176, lon: 82.9739, country: 'India', emoji: '🛕', tag: 'Spiritual' },
  { city: 'Munnar', lat: 10.0889, lon: 77.0595, country: 'India', emoji: '🌿', tag: 'Nature' },
  { city: 'Agra', lat: 27.1767, lon: 78.0081, country: 'India', emoji: '🕌', tag: 'Iconic' },
  { city: 'Rishikesh', lat: 30.0869, lon: 78.2676, country: 'India', emoji: '🧘', tag: 'Wellness' },
  { city: 'Ladakh', lat: 34.1526, lon: 77.5771, country: 'India', emoji: '🏕️', tag: 'Adventure' },
  { city: 'Udaipur', lat: 24.5854, lon: 73.7125, country: 'India', emoji: '🏯', tag: 'Lakes' },
  { city: 'Andaman', lat: 11.7401, lon: 92.6586, country: 'India', emoji: '🏝️', tag: 'Islands' },
  { city: 'Darjeeling', lat: 27.0410, lon: 88.2663, country: 'India', emoji: '🍵', tag: 'Hill Station' },
  { city: 'Coorg', lat: 12.4244, lon: 75.7382, country: 'India', emoji: '☕', tag: 'Coffee' },
];

export default function CityMapPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searching, setSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const markerRef = useRef(null);
  const debounce = useRef(null);

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
    const map = L.map(mapRef.current).setView([22.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(map);
    map.on('click', (e) => reverseGeocode(e.latlng.lat, e.latlng.lng));
    leafletMap.current = map;
  }, [mapReady]);

  const makeIcon = () => window.L.divIcon({
    html: `<div style="width:38px;height:38px;background:linear-gradient(135deg,#1D9E75,#0f6e52);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 4px 14px rgba(29,158,117,0.5);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:16px">📍</span></div>`,
    iconSize: [38, 38], iconAnchor: [19, 38], className: ''
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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
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
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=6`,
        { headers: { 'Accept-Language': 'en' } }
      );
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div style={{ background: '#fff', borderRadius: 24, width: 620, maxWidth: '98vw', maxHeight: '95vh', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1D9E75, #0a5c3f)', padding: '20px 24px', color: '#fff', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 19, letterSpacing: -0.5 }}>📍 Pick a City</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 3 }}>Search, tap a popular city, or click the map</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {/* Search bar */}
        <div style={{ padding: '16px 20px 0', flexShrink: 0, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafb', border: '2px solid #1D9E75', borderRadius: 14, padding: '11px 16px', transition: 'box-shadow 0.2s', boxShadow: '0 2px 12px rgba(29,158,117,0.12)' }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <input
              value={query}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search any city, town, or landmark in India…"
              style={{ border: 'none', background: 'transparent', flex: 1, fontSize: 15, outline: 'none', color: '#1a1a1a' }}
              autoFocus
            />
            {searching && <span style={{ fontSize: 12, color: '#aaa' }}>Searching…</span>}
            {query && !searching && (
              <button onClick={() => { setQuery(''); setSuggestions([]); setSelected(null); }}
                style={{ background: '#f0f0f0', border: 'none', cursor: 'pointer', width: 24, height: 24, borderRadius: '50%', fontSize: 14, color: '#888', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            )}
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div style={{ position: 'absolute', left: 20, right: 20, top: '100%', background: '#fff', borderRadius: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.16)', zIndex: 50, overflow: 'hidden', border: '1px solid #ececec' }}>
              {suggestions.map((s, i) => {
                const addr = s.address || {};
                const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || s.name || '';
                const region = [addr.state, addr.country].filter(Boolean).join(', ');
                return (
                  <div key={i} onClick={() => pickSuggestion(s)}
                    style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid #f5f5f5' : 'none', display: 'flex', gap: 12, alignItems: 'center' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0fdf8'}
                    onMouseOut={e => e.currentTarget.style.background = '#fff'}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#e8f5f0,#c8e6d8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📍</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#1a1a1a' }}>{city || s.name}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{region}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular cities */}
        <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🇮🇳 Popular Indian Destinations</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {POPULAR.map(c => (
              <button key={c.city}
                onClick={() => applyPlace({ lat: c.lat, lon: c.lon, city: c.city, country: c.country, displayName: `${c.city}, India` })}
                style={{
                  padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${selected?.city === c.city ? '#1D9E75' : 'transparent'}`,
                  background: selected?.city === c.city ? '#e8f5f0' : '#f5f5f5',
                  color: selected?.city === c.city ? '#1D9E75' : '#444',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s'
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#e8f5f0'; e.currentTarget.style.borderColor = '#1D9E75'; e.currentTarget.style.color = '#1D9E75'; }}
                onMouseOut={e => { if (selected?.city !== c.city) { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#444'; } }}>
                {c.emoji} {c.city} <span style={{ opacity: 0.55, fontWeight: 400 }}>· {c.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div style={{ flex: 1, position: 'relative', minHeight: 240, margin: '12px 0 0' }}>
          <div ref={mapRef} style={{ height: '100%', width: '100%', minHeight: 240 }} />
          {!mapReady && <div style={{ position: 'absolute', inset: 0, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14 }}>🗺️ Loading map…</div>}
          {mapReady && !selected && (
            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(29,158,117,0.9)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '7px 18px', borderRadius: 20, pointerEvents: 'none', whiteSpace: 'nowrap', backdropFilter: 'blur(4px)' }}>
              🖱️ Click anywhere on the map to pick
            </div>
          )}
        </div>

        {/* Selected info + Confirm */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f0f0f0', flexShrink: 0, background: '#fafafa' }}>
          {selected ? (
            <div style={{ background: 'linear-gradient(120deg,#e8f5f0,#f0fdf8)', border: '1px solid #c8e6d8', borderRadius: 14, padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#1D9E75,#0f6e52)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: '0 2px 8px rgba(29,158,117,0.3)' }}>📍</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#1a1a1a' }}>{selected.city}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.displayName}</div>
              </div>
              <span style={{ fontSize: 20 }}>✅</span>
            </div>
          ) : (
            <div style={{ background: '#f5f5f5', borderRadius: 12, padding: '11px 14px', marginBottom: 12, fontSize: 13, color: '#aaa', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>📍</span> No city selected yet — search or click the map
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ padding: '12px 20px', background: '#f0f0f0', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button onClick={() => { if (selected) { onSelect(selected); onClose(); } }} disabled={!selected}
              style={{ flex: 1, padding: 12, background: selected ? 'linear-gradient(135deg,#1D9E75,#0f6e52)' : '#e0e0e0', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: selected ? 'pointer' : 'not-allowed', fontSize: 15, boxShadow: selected ? '0 4px 14px rgba(29,158,117,0.4)' : 'none', transition: 'all 0.2s' }}>
              {selected ? `✅ Use ${selected.city}` : 'Select a city first'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
