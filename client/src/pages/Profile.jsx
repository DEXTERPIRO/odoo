import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { tripsAPI } from '../api/trips';
import { useAuthStore } from '../store/authStore';

const STATUS = {
  UPCOMING:  { bg: '#e8f5f0', color: '#1D9E75', label: 'Upcoming' },
  ONGOING:   { bg: '#fff4e0', color: '#EF9F27', label: 'Ongoing' },
  COMPLETED: { bg: '#f0f0f0', color: '#888',    label: 'Completed' },
};

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/users/profile').then(p => {
      setProfile(p);
      setForm({ firstName: p.firstName, lastName: p.lastName, phone: p.phone || '', city: p.city || '', country: p.country || '', additionalInfo: p.additionalInfo || '' });
    }).catch(() => toast.error('Failed to load profile')).finally(() => setLoading(false));
  }, []);

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const updated = await api.put('/users/profile', form);
      setProfile(p => ({ ...p, ...updated }));
      updateUser({ ...user, ...updated });
      setEditing(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading…</div>;
  if (!profile) return null;

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  const allTrips = profile.trips || [];
  const recent = allTrips.slice(0, 6);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(135deg, #1D9E75, #0f6e52)', height: 100 }} />
        <div style={{ padding: '0 28px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -36 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#EF9F27', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24 }}>{initials}</div>
            <button onClick={() => setEditing(e => !e)} style={{ padding: '8px 20px', background: editing ? '#f0f0f0' : '#1D9E75', color: editing ? '#333' : '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
              {editing ? '✕ Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={save} style={{ marginTop: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                {[['First Name', 'firstName'], ['Last Name', 'lastName'], ['Phone', 'phone'], ['City', 'city'], ['Country', 'country']].map(([l, n]) => (
                  <div key={n}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>{l}</label>
                    <input value={form[n]} onChange={e => setForm(f => ({ ...f, [n]: e.target.value }))}
                      style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Additional Info</label>
                <textarea value={form.additionalInfo} onChange={e => setForm(f => ({ ...f, additionalInfo: e.target.value }))} rows={3}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <button type="submit" disabled={saving} style={{ padding: '10px 24px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div style={{ marginTop: 16 }}>
              <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1a1a1a' }}>{profile.firstName} {profile.lastName}</h2>
              <p style={{ margin: '0 0 12px', color: '#888', fontSize: 14 }}>{profile.email}</p>
              <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#666' }}>
                {profile.city && <span>📍 {profile.city}{profile.country ? `, ${profile.country}` : ''}</span>}
                {profile.phone && <span>📞 {profile.phone}</span>}
                <span>🧳 {profile._count?.trips || 0} trips</span>
              </div>
              {profile.additionalInfo && <p style={{ margin: '12px 0 0', fontSize: 13, color: '#555', lineHeight: 1.6 }}>{profile.additionalInfo}</p>}
            </div>
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>🧳 My Trips</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {recent.map(trip => {
              const st = STATUS[trip.status] || STATUS.UPCOMING;
              return (
                <div key={trip.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 18 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a1a', flex: 1, marginRight: 8 }}>{trip.name}</h3>
                    <span style={{ background: st.bg, color: st.color, fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 600, whiteSpace: 'nowrap' }}>{st.label}</span>
                  </div>
                  <p style={{ margin: '0 0 12px', fontSize: 11, color: '#aaa' }}>{new Date(trip.startDate).toLocaleDateString()}</p>
                  <Link to={`/trips/${trip.id}/view`} style={{ display: 'block', background: '#e8f5f0', color: '#1D9E75', textAlign: 'center', padding: '7px', borderRadius: 6, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>View Trip</Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
