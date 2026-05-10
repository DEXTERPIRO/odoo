import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/client';
import { N, card, btnPrimary, btn, input, label } from '../../neu';

/* ── Avatar circle ─────────────────────────────────────────────────────────── */
function Avatar({ name, isActive, index, size = 36 }) {
  const initials = name ? name.trim()[0].toUpperCase() : '?';
  const [showTip, setShowTip] = useState(false);
  // Cycle through hue rotations for variety (neumorphic stays monochrome, hue just affects text/ring)
  const hues = [N.accent, N.accentSecondary, N.warning, '#8B5CF6', N.danger, '#DB2777'];
  const color = hues[index % hues.length];

  return (
    <div style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
      onMouseEnter={() => setShowTip(true)} onMouseLeave={() => setShowTip(false)}>
      {/* Neumorphic extruded circle */}
      <div style={{
        width:          size, height: size, borderRadius: '50%',
        background:     N.bg,
        boxShadow:      `${N.shadowSm}, 0 0 0 2px ${color}44`,
        display:        'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight:     800,
        fontSize:       size * 0.36,
        color,
        fontFamily:     N.fontDisplay,
        cursor:         'default',
        transition:     N.transition,
      }}>
        {initials}
      </div>
      {/* Live pulse dot */}
      {isActive && (
        <span style={{
          position:     'absolute', bottom: 0, right: 0,
          width:        10, height: 10, borderRadius: '50%',
          background:   '#22c55e',
          boxShadow:    `0 0 0 2px ${N.bg}`,
          animation:    'pulse-green 1.5s infinite',
        }} />
      )}
      {/* Tooltip */}
      {showTip && (
        <div style={{
          position:   'absolute', bottom: size + 8, left: '50%', transform: 'translateX(-50%)',
          background: N.bg, boxShadow: N.shadowSm, borderRadius: N.radiusBtn,
          color:      N.fg, fontSize: 11, padding: '4px 10px',
          whiteSpace: 'nowrap', zIndex: 99, pointerEvents: 'none',
          fontFamily: N.font, fontWeight: 600,
        }}>
          {name} {isActive ? '· online' : ''}
        </div>
      )}
      <style>{`
        @keyframes pulse-green {
          0%, 100% { box-shadow: 0 0 0 2px ${N.bg}, 0 0 0 0 rgba(34,197,94,0.5); }
          50%       { box-shadow: 0 0 0 2px ${N.bg}, 0 0 0 5px rgba(34,197,94,0);  }
        }
      `}</style>
    </div>
  );
}

/* ── Invite Modal ──────────────────────────────────────────────────────────── */
function InviteModal({ tripId, onClose, onInvited }) {
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [submitHov, setSubmitHov] = useState(false);

  const submit = async e => {
    e.preventDefault(); setLoading(true);
    try { const r = await api.post(`/trips/${tripId}/invite`, { email }); toast.success(r.message); setEmail(''); onInvited(); onClose(); }
    catch (err) { toast.error(err.error || 'User not found'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,72,82,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ ...card, width: 400, maxWidth: '90vw' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontFamily: N.fontDisplay, fontSize: 18, fontWeight: 700, color: N.fg }}>Invite Collaborator</h3>
          <button onClick={onClose} style={{ ...btn, padding: '6px 12px', boxShadow: N.shadowSm, fontSize: 16, minHeight: 'auto' }}>✕</button>
        </div>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: N.muted }}>They can view and edit this trip in real time.</p>
        <form onSubmit={submit} noValidate>
          <label style={label}>Email address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="priya@example.com"
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{ ...input, boxShadow: focused ? N.shadowInsetDeep : N.shadowInset, marginBottom: 20 }} />
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ ...btn, flex: 1, padding: '12px', minHeight: 'auto' }}>Cancel</button>
            <button type="submit" disabled={loading}
              onMouseEnter={() => setSubmitHov(true)}
              onMouseLeave={() => setSubmitHov(false)}
              style={{ ...btnPrimary, flex: 2, padding: '12px', minHeight: 'auto', opacity: loading ? 0.7 : 1, boxShadow: submitHov && !loading ? N.shadowHover : N.shadow, transform: submitHov && !loading ? 'translateY(-1px)' : 'none' }}>
              {loading ? 'Inviting...' : 'Send Invite →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────────────── */
export default function LiveCollaborators({ tripId, viewers = [], collaborators = [], onRefresh }) {
  const [showModal, setShowModal] = useState(false);
  const [inviteHov, setInviteHov] = useState(false);

  const viewerNames   = viewers.map(v => v.userName).filter(Boolean);
  const storedCollabs = collaborators.map((c, i) => ({
    name:     `${c.user.firstName} ${c.user.lastName}`,
    index:    i + 1,
    isActive: viewerNames.includes(c.user.firstName),
  }));
  const liveOnlyViewers = viewers
    .filter(v => !collaborators.some(c => c.user.firstName === v.userName))
    .map((v, i) => ({ name: v.userName, index: i, isActive: true }));
  const allAvatars = [...storedCollabs, ...liveOnlyViewers];

  return (
    <>
      <div style={{
        background:   N.bg,
        boxShadow:    N.shadowSm,
        borderRadius: N.radiusMd,
        padding:      '10px 18px',
        display:      'flex',
        alignItems:   'center',
        gap:          14,
        flexWrap:     'wrap',
        marginBottom: 16,
        fontFamily:   N.font,
      }}>
        {/* Live indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', display: 'inline-block', animation: 'pulse-green 1.5s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 0.5 }}>Live</span>
          <span style={{ fontSize: 12, color: N.muted }}>· {viewers.length} online</span>
        </div>

        {/* Stacked avatars */}
        {allAvatars.length > 0 && (
          <div style={{ display: 'flex' }}>
            {allAvatars.slice(0, 6).map((a, i) => (
              <div key={i} style={{ marginLeft: i > 0 ? -10 : 0, zIndex: allAvatars.length - i }}>
                <Avatar name={a.name} isActive={a.isActive} index={a.index} size={34} />
              </div>
            ))}
            {allAvatars.length > 6 && (
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInsetSm, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: N.muted, marginLeft: -10 }}>
                +{allAvatars.length - 6}
              </div>
            )}
          </div>
        )}

        {allAvatars.length === 0 && (
          <span style={{ fontSize: 12, color: N.muted }}>No collaborators yet</span>
        )}

        {/* Invite button */}
        <button onClick={() => setShowModal(true)}
          onMouseEnter={() => setInviteHov(true)}
          onMouseLeave={() => setInviteHov(false)}
          style={{
            marginLeft:   'auto',
            background:   N.bg,
            border:       'none',
            borderRadius: N.radiusPill,
            padding:      '7px 16px',
            fontSize:     12,
            fontWeight:   700,
            cursor:       'pointer',
            color:        N.accent,
            boxShadow:    inviteHov ? N.shadowHover : N.shadowSm,
            transform:    inviteHov ? 'translateY(-1px)' : 'none',
            transition:   N.transition,
            fontFamily:   N.font,
          }}>
          + Invite
        </button>
      </div>

      {showModal && <InviteModal tripId={tripId} onClose={() => setShowModal(false)} onInvited={onRefresh} />}
    </>
  );
}
