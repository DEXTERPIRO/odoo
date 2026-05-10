import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { N } from '../../neu';

const LINKS = [
  { to: '/',           label: 'Home' },
  { to: '/trips',      label: 'My Trips' },
  { to: '/cities',     label: 'Cities' },
  { to: '/activities', label: 'Activities' },
  { to: '/community',  label: 'Community' },
];

export default function Navbar() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const { user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(null);
  const [logoutHover, setLogoutHover] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const active = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <header style={{
      background:   N.bg,
      boxShadow:    '0 4px 20px rgb(163,177,198,0.5), 0 -1px 0 rgba(255,255,255,0.8)',
      position:     'sticky',
      top:          0,
      zIndex:       1000,
      fontFamily:   N.font,
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', height: 68 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, marginRight: 40 }}>
          <div style={{
            width: 38, height: 38,
            background:   N.bg,
            borderRadius: '50%',
            boxShadow:    N.shadowSm,
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontSize:     18,
            fontFamily:   N.fontDisplay,
            fontWeight:   800,
            color:        N.accent,
            letterSpacing: -1,
          }}>T</div>
          <div>
            <div style={{ fontFamily: N.fontDisplay, fontWeight: 800, fontSize: 16, color: N.fg, letterSpacing: -0.5, lineHeight: 1.1 }}>Traveloop</div>
            <div style={{ fontSize: 10, color: N.muted, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>India</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1 }}>
          {LINKS.map((link, i) => (
            <Link key={link.to} to={link.to}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                textDecoration: 'none',
                padding:        '8px 16px',
                borderRadius:   N.radiusBtn,
                fontSize:       14,
                fontWeight:     active(link.to) ? 700 : 500,
                color:          active(link.to) ? N.accent : hoverIdx === i ? N.fg : N.muted,
                boxShadow:      active(link.to) ? N.shadowInsetSm : hoverIdx === i ? N.shadowSm : 'none',
                background:     N.bg,
                transition:     N.transition,
                display:        'block',
              }}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side — user + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user && (
            <Link to="/profile" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                  width:          36, height: 36,
                  borderRadius:   '50%',
                background:     N.bg,
                boxShadow:      N.shadowInset,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       13,
                fontWeight:     800,
                color:          N.accent,
                flexShrink:     0,
              }}>
                {user.firstName?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: N.fg }}>{user.firstName}</span>
                <span style={{ fontSize: 10, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>Profile</span>
              </div>
            </Link>
          )}
          <button
            onClick={handleLogout}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
            style={{
              background:   N.bg,
              border:       'none',
              borderRadius: N.radiusBtn,
              padding:      '8px 16px',
              fontSize:     13,
              fontWeight:   600,
              color:        logoutHover ? N.danger : N.muted,
              cursor:       'pointer',
              boxShadow:    logoutHover ? N.shadowSm : N.shadowInsetSm,
              transition:   N.transition,
              fontFamily:   N.font,
            }}>
            Sign Out
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display:    'none',
              background: N.bg,
              border:     'none',
              borderRadius: N.radiusBtn,
              padding:    '10px 12px',
              cursor:     'pointer',
              boxShadow:  N.shadowSm,
              color:      N.fg,
              fontSize:   18,
              lineHeight: 1,
              fontFamily: N.font,
            }}
            aria-label="Toggle navigation">
            {menuOpen ? '✕' : '≡'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          borderTop: `1px solid rgba(163,177,198,0.3)`,
          padding:   '12px 20px',
          background: N.bg,
          boxShadow: '0 8px 20px rgb(163,177,198,0.4)',
        }}>
          {LINKS.map(link => (
            <Link key={link.to} to={link.to}
              onClick={() => setMenuOpen(false)}
              style={{
                display:      'block',
                padding:      '12px 16px',
                borderRadius: N.radiusBtn,
                fontSize:     15,
                fontWeight:   active(link.to) ? 700 : 500,
                color:        active(link.to) ? N.accent : N.fg,
                textDecoration: 'none',
                boxShadow:    active(link.to) ? N.shadowInsetSm : 'none',
                marginBottom: 4,
                background:   N.bg,
              }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
