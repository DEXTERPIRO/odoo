import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { N, card, cardSm, btn, btnPrimary, input, label } from '../neu';

const STATUS = {
  UPCOMING:  { bg: N.bg, color: N.accentSecondary, label: 'Upcoming' },
  ONGOING:   { bg: N.bg, color: N.warning, label: 'Ongoing' },
  COMPLETED: { bg: N.bg, color: N.muted,    label: 'Completed' },
};

export default function Profile() {
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState(null);

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

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: N.muted, fontFamily: N.font, fontWeight: 600 }}>Loading profile…</div>;
  if (!profile) return null;

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();
  const allTrips = profile.trips || [];
  const recent = allTrips.slice(0, 6);

  const inp = (name) => ({
    ...input, boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset,
  });

  return (
    <div style={{ fontFamily: N.font, maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>
      <div style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: 32 }}>
        <div style={{ background: N.accent, height: 120 }} />
        <div style={{ padding: '0 32px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: -40 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: N.bg, boxShadow: N.shadow, display: 'flex', alignItems: 'center', justifyContent: 'center', color: N.accentSecondary, fontWeight: 900, fontSize: 28, fontFamily: N.fontDisplay }}>{initials}</div>
            <button onClick={() => setEditing(e => !e)} style={{ ...(editing ? btn : btnPrimary), padding: '10px 24px', minHeight: 'auto', fontSize: 13 }}>
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {editing ? (
            <form onSubmit={save} style={{ marginTop: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {[['First Name', 'firstName'], ['Last Name', 'lastName'], ['Phone', 'phone'], ['City', 'city'], ['Country', 'country']].map(([l, n]) => (
                  <div key={n}>
                    <label style={label}>{l}</label>
                    <input value={form[n]} onChange={e => setForm(f => ({ ...f, [n]: e.target.value }))}
                      onFocus={() => setFocused(n)} onBlur={() => setFocused(null)}
                      style={inp(n)} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={label}>Additional Info</label>
                <textarea value={form.additionalInfo} onChange={e => setForm(f => ({ ...f, additionalInfo: e.target.value }))} rows={4}
                  onFocus={() => setFocused('additionalInfo')} onBlur={() => setFocused(null)}
                  style={{ ...inp('additionalInfo'), resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={saving} style={{ ...btnPrimary, padding: '12px 32px', minHeight: 'auto', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <div style={{ marginTop: 20 }}>
              <h2 style={{ margin: '0 0 6px', fontSize: 26, fontWeight: 900, color: N.fg, fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>{profile.firstName} {profile.lastName}</h2>
              <p style={{ margin: '0 0 16px', color: N.muted, fontSize: 14, fontWeight: 600 }}>{profile.email}</p>
              
              <div style={{ display: 'flex', gap: 24, fontSize: 13, color: N.muted, fontWeight: 600, flexWrap: 'wrap' }}>
                {profile.city && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: N.accent }}>◆</span> {profile.city}{profile.country ? `, ${profile.country}` : ''}</span>}
                {profile.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: N.accent }}>◆</span> {profile.phone}</span>}
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: N.accent }}>◆</span> {profile._count?.trips || 0} trips</span>
              </div>
              
              {profile.additionalInfo && (
                <div style={{ marginTop: 24, padding: 20, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner }}>
                  <p style={{ margin: 0, fontSize: 13, color: N.muted, lineHeight: 1.6, fontStyle: 'italic', fontWeight: 600 }}>"{profile.additionalInfo}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: N.fg, marginBottom: 20, fontFamily: N.fontDisplay }}>My Recent Trips</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {recent.map(trip => {
              const st = STATUS[trip.status] || STATUS.UPCOMING;
              return (
                <div key={trip.id} style={{ ...cardSm, padding: 20, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay, lineHeight: 1.2 }}>{trip.name}</h3>
                    <span style={{ background: st.bg, boxShadow: N.shadowInsetSm, color: st.color, fontSize: 10, padding: '4px 10px', borderRadius: N.radiusPill, fontWeight: 800, whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: 0.5, marginLeft: 12 }}>{st.label}</span>
                  </div>
                  <p style={{ margin: '0 0 20px', fontSize: 12, color: N.muted, fontWeight: 600 }}>{new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <Link to={`/trips/${trip.id}/view`} style={{ ...btn, display: 'block', textAlign: 'center', textDecoration: 'none', color: N.accentSecondary, fontSize: 13, minHeight: 'auto', padding: '10px' }}>View Trip</Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
