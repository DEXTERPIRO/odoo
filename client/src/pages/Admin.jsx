import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { useAuthStore } from '../store/authStore';
import { N, card, cardSm } from '../neu';

const STATUS_COLOR = { UPCOMING: N.accentSecondary, ONGOING: N.warning, COMPLETED: N.muted };

export default function Admin() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) { navigate('/'); return; }
    Promise.all([tripsAPI.adminStats(), tripsAPI.adminUsers()])
      .then(([s, u]) => { setStats(s); setUsers(u); })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user?.isAdmin) return null;
  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: N.muted, fontFamily: N.font, fontWeight: 600 }}>Loading admin panel…</div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totals.users, color: N.accent },
    { label: 'Total Trips', value: stats.totals.trips, color: N.warning },
    { label: 'Activities', value: stats.totals.activities, color: N.danger },
    { label: 'Community Posts', value: stats.totals.posts, color: '#8B5CF6' },
  ];

  return (
    <div style={{ fontFamily: N.font, maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div style={{ width: 44, height: 44, background: N.bg, boxShadow: N.shadowSm, borderRadius: N.radiusBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', color: N.accent, fontSize: 20, fontWeight: 900, fontFamily: N.fontDisplay, border: `2px solid ${N.bg}` }}>A</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: N.fg, fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>Admin Dashboard</h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: N.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Platform overview and management</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
        {statCards.map(({ label, value, color }) => (
          <div key={label} style={{ ...cardSm, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 36, fontWeight: 900, color, fontFamily: N.fontDisplay, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: N.muted, marginTop: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>Top Destinations</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.topCities} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={`rgb(163,177,198,0.2)`} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: N.muted, fontWeight: 600 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: N.fg, fontWeight: 700 }} width={80} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [`${v} trips`, 'Count']} cursor={{fill: `rgb(163,177,198,0.1)`}} contentStyle={{ borderRadius: N.radiusInner, border: 'none', boxShadow: N.shadow, background: N.bg, fontWeight: 600, fontFamily: N.font }} />
              <Bar dataKey="count" fill={N.accent} radius={[0, 4, 4, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ ...card, padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>Trips by Status</h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {stats.tripsByStatus.map(({ status, count }) => (
              <div key={status} style={{ flex: 1, textAlign: 'center', padding: '20px 12px', background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: STATUS_COLOR[status] || N.muted, fontFamily: N.fontDisplay }}>{count}</div>
                <div style={{ fontSize: 10, color: N.muted, marginTop: 8, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{status}</div>
              </div>
            ))}
          </div>
          
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 800, color: N.fg, textTransform: 'uppercase', letterSpacing: 0.5 }}>Budget Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Average', stats.budgetStats.average], ['Max', stats.budgetStats.max], ['Min', stats.budgetStats.min], ['Total', stats.budgetStats.total]].map(([l, v]) => (
              <div key={l} style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: N.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{l}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: N.accentSecondary }}>₹{Number(v).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid rgb(163,177,198,0.2)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>All Users</h3>
            <span style={{ fontSize: 12, color: N.muted, fontWeight: 800, background: N.bg, boxShadow: N.shadowInsetSm, padding: '4px 12px', borderRadius: N.radiusPill }}>{users.length} Total</span>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto', background: N.bg }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 0.5fr 1fr', gap: 12, padding: '12px 24px', borderBottom: `2px solid rgb(163,177,198,0.2)`, fontSize: 10, fontWeight: 800, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5, position: 'sticky', top: 0, background: N.bg, zIndex: 10 }}>
              <div>Name</div>
              <div>Email</div>
              <div>City</div>
              <div style={{ textAlign: 'center' }}>Trips</div>
              <div style={{ textAlign: 'right' }}>Joined</div>
            </div>
            {users.map((u, idx) => (
              <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 0.5fr 1fr', gap: 12, padding: '14px 24px', borderBottom: idx < users.length - 1 ? `1px dashed rgb(163,177,198,0.3)` : 'none', alignItems: 'center', fontSize: 13 }}>
                <div style={{ fontWeight: 700, color: N.fg, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {u.firstName} {u.lastName}
                  {u.isAdmin && <span style={{ background: N.accent, color: N.bg, fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 800, textTransform: 'uppercase' }}>Admin</span>}
                </div>
                <div style={{ color: N.muted, fontWeight: 500 }}>{u.email}</div>
                <div style={{ color: N.muted, fontWeight: 600 }}>{u.city || '—'}</div>
                <div style={{ textAlign: 'center', fontWeight: 800, color: N.accentSecondary }}>{u._count?.trips || 0}</div>
                <div style={{ textAlign: 'right', color: N.muted, fontWeight: 500, fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid rgb(163,177,198,0.2)'` }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>Recent Trips</h3>
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto', background: N.bg, padding: '12px 24px' }}>
            {stats.recentTrips.map((trip, idx) => (
              <div key={trip.id} style={{ padding: '16px 0', borderBottom: idx < stats.recentTrips.length - 1 ? `1px dashed rgb(163,177,198,0.3)` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: N.fg, marginBottom: 4 }}>{trip.name}</div>
                    <div style={{ fontSize: 12, color: N.muted, fontWeight: 500 }}>{trip.user?.firstName} {trip.user?.lastName} · {trip.user?.email}</div>
                  </div>
                  <span style={{ background: N.bg, boxShadow: N.shadowSm, color: STATUS_COLOR[trip.status] || N.muted, fontSize: 10, padding: '4px 10px', borderRadius: N.radiusPill, fontWeight: 800, textTransform: 'uppercase' }}>{trip.status}</span>
                </div>
              </div>
            ))}
            {stats.recentTrips.length === 0 && (
              <div style={{ textAlign: 'center', color: N.muted, padding: '40px 0', fontSize: 13, fontWeight: 600 }}>No trips created yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
