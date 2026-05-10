import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { N, card, btn, btnPrimary, input, label } from '../neu';

const FEATURES = [
  ['Route Planner',      'Map-based From → To routing'],
  ['AI Itineraries',     'Day-by-day plans in seconds'],
  ['Budget Tracker',     'Real-time cost breakdown in INR'],
  ['Live Collaboration', 'Plan together, in real-time'],
  ['Community',          'Share trips, get inspired'],
];

export default function Login() {
  const [form, setForm]               = useState({ email: '', password: '' });
  const [loading, setLoading]         = useState(false);
  const [showPass, setShowPass]       = useState(false);
  const [showForgot, setShowForgot]   = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent]   = useState(false);
  const [errors, setErrors]           = useState({});
  const [focused, setFocused]         = useState(null);
  const [btnHov, setBtnHov]           = useState(false);
  const { setAuth }                   = useAuthStore();
  const navigate                      = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email.includes('@')) e.email = 'Enter a valid email address';
    if (form.password.length < 6)  e.password = 'Minimum 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const onChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(ev => ({ ...ev, [e.target.name]: '' }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api.post('/auth/login', form);
      setAuth(data.token, data.user);
      toast.success(`Welcome back, ${data.user.firstName}`);
      navigate('/');
    } catch (err) {
      toast.error(err.error || 'Invalid credentials');
    } finally { setLoading(false); }
  };

  const onForgotSubmit = e => {
    e.preventDefault();
    if (!forgotEmail.includes('@')) { toast.error('Enter a valid email'); return; }
    setForgotSent(true);
    setTimeout(() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); }, 3500);
  };

  const inpStyle = (name) => ({
    ...input,
    boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset,
    color:     N.fg,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: N.bg, fontFamily: N.font }}>

      {/* ── Left decorative panel ───────────────────────────── */}
      <div style={{
        flex:           1,
        background:     N.bg,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        alignItems:     'center',
        padding:        48,
        position:       'relative',
        overflow:       'hidden',
      }}>
        {/* Nested depth circles — the visual signature of neumorphism */}
        <div style={{
          position:    'absolute',
          top:         '50%',
          left:        '50%',
          transform:   'translate(-50%, -50%)',
          width:       460,
          height:      460,
          borderRadius:'50%',
          boxShadow:   N.shadow,
          background:  N.bg,
        }}>
          <div style={{
            position:       'absolute',
            top:            40, left: 40, right: 40, bottom: 40,
            borderRadius:   '50%',
            boxShadow:      N.shadowInset,
            background:     N.bg,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width:          220,
              height:         220,
              borderRadius:   '50%',
              boxShadow:      N.shadowSm,
              background:     N.bg,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              animation:      'float 4s ease-in-out infinite',
            }}>
              <div style={{
                width:          140,
                height:         140,
                borderRadius:   '50%',
                boxShadow:      N.shadowInsetDeep,
                background:     N.bg,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: 44, filter: 'grayscale(0.2)' }}>✈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content above circles */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: 280 }}>
          <div style={{ fontFamily: N.fontDisplay, fontSize: 36, fontWeight: 800, color: N.fg, letterSpacing: -1, lineHeight: 1.1 }}>
            Traveloop
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: N.accent, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>
            India
          </div>
        </div>

        {/* Feature list below circles */}
        <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', width: '100%', maxWidth: 360 }}>
          <div style={{ ...card, padding: '24px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: N.muted, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
              What you get
            </div>
            {FEATURES.map(([title, desc]) => (
              <div key={title} style={{ display: 'flex', gap: 14, marginBottom: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: N.accent,
                  boxShadow: `0 0 8px ${N.accent}`,
                  flexShrink: 0, marginTop: 6,
                }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: N.fg }}>{title}</div>
                  <div style={{ fontSize: 12, color: N.muted, marginTop: 1 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────── */}
      <div style={{
        width:          460,
        background:     N.bg,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        '48px 44px',
        overflowY:      'auto',
        boxShadow:      '-8px 0 32px rgb(163,177,198,0.3)',
      }}>
        {/* Logo mark */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            width:          56, height: 56,
            borderRadius:   '50%',
            background:     N.bg,
            boxShadow:      N.shadow,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       24,
            marginBottom:   20,
          }}>✈</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: N.fg, margin: 0, letterSpacing: -0.5 }}>
            {showForgot ? 'Reset Password' : 'Welcome back'}
          </h1>
          <p style={{ color: N.muted, marginTop: 6, fontSize: 14 }}>
            {showForgot ? 'Enter your email to receive a reset link.' : 'Sign in to your Traveloop account.'}
          </p>
        </div>

        {showForgot ? (
          forgotSent ? (
            <div style={{ ...card, textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>✉</div>
              <div style={{ fontWeight: 800, fontSize: 18, color: N.fg, fontFamily: N.fontDisplay }}>Check your inbox</div>
              <div style={{ color: N.muted, marginTop: 8, fontSize: 14 }}>Reset link sent to<br /><strong style={{ color: N.fg }}>{forgotEmail}</strong></div>
            </div>
          ) : (
            <form onSubmit={onForgotSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={label}>Email address</label>
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                  placeholder="you@example.com" required
                  onFocus={() => setFocused('forgot')} onBlur={() => setFocused(null)}
                  style={{ ...input, boxShadow: focused === 'forgot' ? N.shadowInsetDeep : N.shadowInset }} />
              </div>
              <button type="submit" style={{ ...btnPrimary, width: '100%', padding: '14px', fontSize: 15, borderRadius: N.radiusBtn }}>
                Send Reset Link
              </button>
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <span onClick={() => setShowForgot(false)} style={{ fontSize: 13, color: N.accent, cursor: 'pointer', fontWeight: 600 }}>
                  ← Back to Sign In
                </span>
              </div>
            </form>
          )
        ) : (
          <form onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...label, marginBottom: 0 }}>Email address</label>
              </div>
              <input type="email" name="email" value={form.email} onChange={onChange}
                placeholder="you@example.com" required
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                style={inpStyle('email')} />
              {errors.email && <div style={{ fontSize: 12, color: N.danger, marginTop: 6, fontWeight: 500 }}>{errors.email}</div>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ ...label, marginBottom: 0 }}>Password</label>
                <span onClick={() => setShowForgot(true)} style={{ fontSize: 12, color: N.accent, cursor: 'pointer', fontWeight: 600 }}>
                  Forgot password?
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={onChange}
                  placeholder="••••••••" required
                  onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                  style={{ ...inpStyle('password'), paddingRight: 48 }} />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: N.muted, fontSize: 16,
                }}>
                  {showPass ? '○' : '●'}
                </button>
              </div>
              {errors.password && <div style={{ fontSize: 12, color: N.danger, marginTop: 6, fontWeight: 500 }}>{errors.password}</div>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              onMouseEnter={() => setBtnHov(true)}
              onMouseLeave={() => setBtnHov(false)}
              style={{
                ...btnPrimary,
                width:        '100%',
                padding:      '15px',
                fontSize:     15,
                fontWeight:   800,
                borderRadius: N.radiusBtn,
                opacity:      loading ? 0.7 : 1,
                cursor:       loading ? 'not-allowed' : 'pointer',
                boxShadow:    btnHov && !loading ? `${N.shadowHover}, 0 0 24px rgba(108,99,255,0.3)` : N.shadow,
                transform:    btnHov && !loading ? 'translateY(-1px)' : 'none',
                transition:   N.transition,
              }}>
              {loading ? 'Signing in...' : 'Sign In  →'}
            </button>
          </form>
        )}

        {/* Divider + register link */}
        {!showForgot && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgb(163,177,198,0.4)' }} />
              <span style={{ margin: '0 14px', fontSize: 12, color: N.muted, fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgb(163,177,198,0.4)' }} />
            </div>
            <div style={{ textAlign: 'center', fontSize: 14, color: N.muted }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: N.accent, fontWeight: 700 }}>Create one free →</Link>
            </div>
          </>
        )}

        <div style={{
          marginTop:    32,
          padding:      '12px 16px',
          borderRadius: N.radiusBtn,
          boxShadow:    N.shadowInsetSm,
          background:   N.bg,
          textAlign:    'center',
          fontSize:     11,
          color:        N.muted,
          fontWeight:   500,
        }}>
          Secured with JWT · Your data is private
        </div>
      </div>
    </div>
  );
}
