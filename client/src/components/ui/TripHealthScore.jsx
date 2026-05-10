import { useEffect, useState, useCallback } from 'react';
import api from '../../api/client';
import { N, card, cardSm } from '../../neu';

const FACTORS = [
  { key: 'budget',    label: 'Budget',    max: 25 },
  { key: 'itinerary', label: 'Itinerary', max: 25 },
  { key: 'packing',   label: 'Packing',   max: 20 },
  { key: 'notes',     label: 'Notes',     max: 15 },
  { key: 'diversity', label: 'Diversity', max: 15 },
];

const getColor = s => s >= 80 ? N.accentSecondary : s >= 60 ? N.warning : N.danger;

/* ── SVG circular score ────────────────────────────────────────────────────── */
function CircularScore({ score, grade, color }) {
  const r    = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0 16px' }}>
      {/* Neumorphic outer ring */}
      <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          position:     'absolute',
          inset:        0,
          borderRadius: '50%',
          background:   N.bg,
          boxShadow:    N.shadow,
        }} />
        <div style={{
          position:     'absolute',
          inset:        12,
          borderRadius: '50%',
          background:   N.bg,
          boxShadow:    N.shadowInset,
        }} />
        {/* SVG arc */}
        <svg width={116} height={116} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
          <circle cx={58} cy={58} r={44} fill="none" stroke="rgb(163,177,198,0.3)" strokeWidth={8} />
          <circle cx={58} cy={58} r={44} fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={`${(score / 100) * 2 * Math.PI * 44} ${2 * Math.PI * 44}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        </svg>
        {/* Score text */}
        <div style={{ position: 'relative', textAlign: 'center', zIndex: 2 }}>
          <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: N.fontDisplay, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: 10, color: N.muted, marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>out of 100</div>
        </div>
      </div>

      {/* Grade badge — extruded pill */}
      <div style={{
        marginTop:      16,
        background:     N.bg,
        borderRadius:   '50%',
        boxShadow:      `${N.shadow}, 0 0 0 3px ${color}33`,
        width:          44,
        height:         44,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       18,
        fontWeight:     900,
        color,
        fontFamily:     N.fontDisplay,
      }}>{grade}</div>
    </div>
  );
}

/* ── Breakdown bar ─────────────────────────────────────────────────────────── */
function BreakdownBar({ label, score, max }) {
  const pct   = max > 0 ? (score / max) * 100 : 0;
  const color = getColor((score / max) * 100);
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
        <span style={{ color: N.muted, fontWeight: 600 }}>{label}</span>
        <span style={{ fontWeight: 800, color }}>{score}<span style={{ color: N.muted, fontWeight: 400 }}>/{max}</span></span>
      </div>
      <div style={{ height: 7, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: N.radiusPill, transition: 'width 700ms ease-out' }} />
      </div>
    </div>
  );
}

export default function TripHealthScore({ tripId }) {
  const [health, setHealth]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refHov, setRefHov]       = useState(false);

  const fetchHealth = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try { const data = await api.get(`/trips/${tripId}/health`); setHealth(data); }
    catch (err) { console.error('Health score error:', err); }
    finally { setLoading(false); setRefreshing(false); }
  }, [tripId]);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  if (loading) return (
    <div style={{ ...card, padding: '32px', textAlign: 'center', color: N.muted, fontSize: 13 }}>Calculating score...</div>
  );
  if (!health) return null;

  const color = getColor(health.score);

  return (
    <div style={{ ...card, padding: 0, overflow: 'hidden', fontFamily: N.font }}>

      {/* Header — inset strip */}
      <div style={{ background: N.bg, boxShadow: N.shadowInset, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: N.fg, fontFamily: N.fontDisplay }}>Trip Health Score</div>
          <div style={{ fontSize: 11, color: N.muted, marginTop: 1 }}>{health.totalDays} days · {health.totalActivities} activities</div>
        </div>
        <button onClick={() => fetchHealth(true)} disabled={refreshing}
          onMouseEnter={() => setRefHov(true)}
          onMouseLeave={() => setRefHov(false)}
          style={{
            background:   N.bg,
            border:       'none',
            borderRadius: N.radiusBtn,
            padding:      '7px 14px',
            fontSize:     11,
            fontWeight:   700,
            cursor:       'pointer',
            color:        color,
            boxShadow:    refHov ? N.shadowHover : N.shadowSm,
            transform:    refHov ? 'translateY(-1px)' : 'none',
            transition:   N.transition,
            fontFamily:   N.font,
            opacity:      refreshing ? 0.6 : 1,
          }}>
          {refreshing ? '...' : '↻ Refresh'}
        </button>
      </div>

      {/* Circular Score */}
      <div style={{ padding: '0 20px' }}>
        <CircularScore score={health.score} grade={health.grade} color={color} />
      </div>

      {/* Breakdown */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12 }}>Score Breakdown</div>
        {FACTORS.map(f => (
          <BreakdownBar key={f.key} label={f.label} score={health.breakdown[f.key] ?? 0} max={f.max} />
        ))}
      </div>

      {/* Suggestions */}
      {health.suggestions.length > 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>Suggestions</div>
          {health.suggestions.map((s, i) => (
            <div key={i} style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '10px 14px', marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: N.warning, fontSize: 14, flexShrink: 0, marginTop: 1 }}>◆</span>
              <span style={{ fontSize: 12, color: N.fg, lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </div>
      )}

      {health.suggestions.length === 0 && (
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '12px 16px', textAlign: 'center', fontSize: 12, color: N.accentSecondary, fontWeight: 700 }}>
            ✓ Trip is well-planned!
          </div>
        </div>
      )}
    </div>
  );
}
