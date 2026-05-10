import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { useAuthStore } from '../store/authStore';

const STATUS_COLOR = { UPCOMING: '#1D9E75', ONGOING: '#EF9F27', COMPLETED: '#888' };

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
  }, [user]);

  if (!user?.isAdmin) return null;
  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading admin panel…</div>;
  if (!stats) return null;

  const statCards = [
    { label: 'Total Users', value: stats.totals.users, icon: '👥', color: '#1D9E75' },
    { label: 'Total Trips', value: stats.totals.trips, icon: '✈️', color: '#EF9F27' },
    { label: 'Activities', value: stats.totals.activities, icon: '🎯', color: '#3182ce' },
    { label: 'Community Posts', value: stats.totals.posts, icon: '🌍', color: '#805ad5' },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ width: 36, height: 36, background: '#1D9E75', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>⚙️</div>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>Admin Panel</h1>
          <p style={{ margin: 0, fontSize: 13, color: '#888' }}>Platform overview and management</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>🏙️ Top Destinations</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.topCities} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={v => [`${v} trips`, 'Count']} />
              <Bar dataKey="count" fill="#1D9E75" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>📊 Trips by Status</h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {stats.tripsByStatus.map(({ status, count }) => (
              <div key={status} style={{ flex: 1, textAlign: 'center', padding: '20px 12px', background: '#f8faf9', borderRadius: 10 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: STATUS_COLOR[status] || '#888' }}>{count}</div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{status}</div>
              </div>
            ))}
          </div>
          <h3 style={{ margin: '20px 0 12px', fontSize: 15, fontWeight: 700 }}>💰 Budget Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Average', stats.budgetStats.average], ['Max', stats.budgetStats.max], ['Min', stats.budgetStats.min], ['Total', stats.budgetStats.total]].map(([l, v]) => (
              <div key={l} style={{ background: '#f8faf9', borderRadius: 8, padding: '10px 12px' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1D9E75' }}>${Number(v).toLocaleString()}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{l} Budget</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>👥 All Users ({users.length})</h3>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: 340, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f8faf9' }}>
                <tr>{['Name', 'Email', 'City', 'Trips', 'Joined'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', color: '#666', fontWeight: 600 }}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{u.firstName} {u.lastName}{u.isAdmin && <span style={{ marginLeft: 6, background: '#1D9E75', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 4 }}>Admin</span>}</td>
                    <td style={{ padding: '10px 14px', color: '#888' }}>{u.email}</td>
                    <td style={{ padding: '10px 14px', color: '#888' }}>{u.city || '—'}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#1D9E75' }}>{u._count?.trips || 0}</td>
                    <td style={{ padding: '10px 14px', color: '#aaa' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>✈️ Recent Trips</h3>
          </div>
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {stats.recentTrips.map(trip => (
              <div key={trip.id} style={{ padding: '12px 20px', borderBottom: '1px solid #f8f8f8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#1a1a1a' }}>{trip.name}</div>
                    <div style={{ fontSize: 11, color: '#aaa' }}>{trip.user?.firstName} {trip.user?.lastName} · {trip.user?.email}</div>
                  </div>
                  <span style={{ background: '#e8f5f0', color: '#1D9E75', fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>{trip.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
