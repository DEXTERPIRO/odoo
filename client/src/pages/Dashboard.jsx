import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { tripsAPI } from '../api/trips';
import { N, card, cardSm, btnPrimary, badge } from '../neu';

const DESTINATIONS = [
  { name: 'Goa',        tag: 'Beach',     color: N.accentSecondary },
  { name: 'Jaipur',     tag: 'Heritage',  color: N.accent },
  { name: 'Manali',     tag: 'Mountains', color: '#3B82F6' },
  { name: 'Kerala',     tag: 'Nature',    color: N.accentSecondary },
  { name: 'Varanasi',   tag: 'Spiritual', color: N.warning },
  { name: 'Ladakh',     tag: 'Adventure', color: '#8B5CF6' },
];

const QUICK_LINKS = [
  { label: 'Plan a Trip',  to: '/trips/new',   desc: 'Start a new journey'      },
  { label: 'My Trips',     to: '/trips',       desc: 'View all your plans'      },
  { label: 'Browse Cities',to: '/cities',      desc: 'Discover destinations'    },
  { label: 'Activities',   to: '/activities',  desc: 'Find things to do'        },
  { label: 'Community',    to: '/community',   desc: 'See what others planned'  },
];

export default function Dashboard() {
  const { user }   = useAuthStore();
  const navigate   = useNavigate();
  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoverCard, setHoverCard]   = useState(null);
  const [hoverDest, setHoverDest]   = useState(null);
  const [hoverQuick, setHoverQuick] = useState(null);
  const [newTripHov, setNewTripHov] = useState(false);

  useEffect(() => {
    tripsAPI.getAll().then(data => { setTrips((data || []).slice(0, 3)); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const statusColor = (s) => s === 'UPCOMING' ? N.accent : s === 'ONGOING' ? N.accentSecondary : N.muted;

  return (
    <div style={{ fontFamily: N.font, color: N.fg }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <div style={{ ...card, marginBottom: 32, padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative nested circles */}
        <div style={{
          position: 'absolute', right: -80, top: '50%', transform: 'translateY(-50%)',
          width: 360, height: 360, borderRadius: '50%',
          boxShadow: N.shadowInset, background: N.bg, opacity: 0.6,
        }}>
          <div style={{
            position: 'absolute', top: 40, left: 40, right: 40, bottom: 40,
            borderRadius: '50%', boxShadow: N.shadow, background: N.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 140, height: 140, borderRadius: '50%',
              boxShadow: N.shadowInsetDeep, background: N.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, animation: 'float 4s ease-in-out infinite',
            }}>✈</div>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 520 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: N.accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
            Welcome back
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: N.fg, letterSpacing: -1, margin: '0 0 12px', lineHeight: 1.15, fontFamily: N.fontDisplay }}>
            {user?.firstName ? `Hello, ${user.firstName}` : 'Welcome to Traveloop'}
          </h1>
          <p style={{ fontSize: 16, color: N.muted, marginBottom: 28, lineHeight: 1.6 }}>
            Plan your next adventure across Incredible India. From Himalayan peaks to tropical backwaters.
          </p>
          <button
            onClick={() => navigate('/trips/new')}
            onMouseEnter={() => setNewTripHov(true)}
            onMouseLeave={() => setNewTripHov(false)}
            style={{
              ...btnPrimary,
              padding:    '14px 32px',
              fontSize:   15,
              fontWeight: 800,
              borderRadius: N.radiusBtn,
              boxShadow:  newTripHov ? `${N.shadowHover}, 0 0 24px rgba(108,99,255,0.35)` : N.shadow,
              transform:  newTripHov ? 'translateY(-2px)' : 'none',
              transition: N.transition,
            }}>
            Plan New Trip  →
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28, marginBottom: 28 }}>

        {/* ── Recent Trips ─────────────────────────────── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: N.fontDisplay }}>Recent Trips</h2>
            <Link to="/trips" style={{ fontSize: 13, color: N.accent, fontWeight: 700 }}>View all →</Link>
          </div>

          {loading && (
            <div style={{ ...card, padding: '40px', textAlign: 'center', color: N.muted, fontSize: 14 }}>Loading...</div>
          )}
          {!loading && trips.length === 0 && (
            <div style={{ ...card, padding: '48px 32px', textAlign: 'center' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: N.bg,
                boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 20px', fontSize: 32,
              }}>✈</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: N.fg, marginBottom: 8, fontFamily: N.fontDisplay }}>No trips yet</div>
              <div style={{ color: N.muted, fontSize: 14, marginBottom: 24 }}>Start planning your first Indian adventure</div>
              <button onClick={() => navigate('/trips/new')} style={{
                ...btnPrimary, padding: '12px 28px', borderRadius: N.radiusBtn,
              }}>
                Plan a Trip →
              </button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {trips.map((trip, i) => (
              <div key={trip.id}
                onMouseEnter={() => setHoverCard(i)}
                onMouseLeave={() => setHoverCard(null)}
                onClick={() => navigate(`/trips/${trip.id}/build`)}
                style={{
                  ...card,
                  padding:    '22px 26px',
                  cursor:     'pointer',
                  boxShadow:  hoverCard === i ? N.shadowHover : N.shadow,
                  transform:  hoverCard === i ? 'translateY(-2px)' : 'none',
                  display:    'flex',
                  alignItems: 'center',
                  gap:        20,
                }}>
                {/* Icon well */}
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: N.bg,
                  boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 22, flexShrink: 0,
                }}>✈</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: N.fg, marginBottom: 4, fontFamily: N.fontDisplay }}>{trip.name}</div>
                  <div style={{ fontSize: 13, color: N.muted }}>{trip.description || 'India Trip'}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ ...badge(statusColor(trip.status)), marginBottom: 6 }}>{trip.status}</div>
                  <div style={{ fontSize: 12, color: N.muted }}>
                    {trip.totalBudget ? `₹${Number(trip.totalBudget).toLocaleString()}` : 'No budget'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Quick Links ──────────────────────────────── */}
        <div>
          <h2 style={{ margin: '0 0 20px', fontSize: 20, fontWeight: 700, fontFamily: N.fontDisplay }}>Quick Access</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {QUICK_LINKS.map((q, i) => (
              <Link key={q.to} to={q.to}
                onMouseEnter={() => setHoverQuick(i)}
                onMouseLeave={() => setHoverQuick(null)}
                style={{
                  textDecoration: 'none',
                  ...cardSm,
                  padding:    '16px 20px',
                  display:    'flex',
                  alignItems: 'center',
                  gap:        14,
                  boxShadow:  hoverQuick === i ? N.shadowHover : N.shadow,
                  transform:  hoverQuick === i ? 'translateY(-1px)' : 'none',
                }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: N.bg,
                  boxShadow: N.shadowInset, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 16, flexShrink: 0, color: N.accent,
                }}>◆</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: N.fg }}>{q.label}</div>
                  <div style={{ fontSize: 12, color: N.muted, marginTop: 1 }}>{q.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', color: N.muted, fontSize: 16 }}>→</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Destinations ─────────────────────────────── */}
      <h2 style={{ margin: '0 0 20px', fontFamily: N.fontDisplay }}>Popular Destinations</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {DESTINATIONS.map((d, i) => (
          <div key={d.name}
            onMouseEnter={() => setHoverDest(i)}
            onMouseLeave={() => setHoverDest(null)}
            onClick={() => navigate('/cities')}
            style={{
              ...card,
              padding:   '24px 22px',
              cursor:    'pointer',
              boxShadow: hoverDest === i ? N.shadowHover : N.shadow,
              transform: hoverDest === i ? 'translateY(-2px)' : 'none',
              textAlign: 'center',
            }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: N.bg,
              boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 24, margin: '0 auto 14px',
            }}>◆</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: N.fg, marginBottom: 6, fontFamily: N.fontDisplay }}>{d.name}</div>
            <div style={{ ...badge(d.color) }}>{d.tag}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
