import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { N, card, btnPrimary, btn, input, label } from '../neu';

const STEPS = [
  { title: 'Personal Info',       desc: 'Your name and contact' },
  { title: 'Account Setup',       desc: 'Email and password'    },
  { title: 'Travel Preferences',  desc: 'City and about you'    },
];

const strengthInfo = (pw) => {
  if (!pw)      return { pct: 0,   color: N.bg,              text: '' };
  if (pw.length < 6)    return { pct: 30,  color: N.danger,          text: 'Weak' };
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
                         return { pct: 65,  color: N.warning,         text: 'Fair' };
  return                  { pct: 100, color: N.accentSecondary, text: 'Strong' };
};

function Field({ name, type, placeholder, lbl, showPass, setShowPass, form = {}, onChange, focused, setFocused, errors = {}, strength = {} }) {
  const isPassword = name === 'password';
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : (type || 'text');

  return (
    <div style={{ marginBottom: 18 }}>
      <label style={label}>{lbl}</label>
      <div style={{ position: 'relative' }}>
        <input
          name={name}
          type={inputType}
          value={form[name] ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={isPassword ? 'new-password' : 'off'}
          onFocus={() => setFocused && setFocused(name)}
          onBlur={() => setFocused && setFocused(null)}
          style={{ ...input, boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset, paddingRight: isPassword ? 48 : undefined }}
        />
        {isPassword && (
          <button type="button" onClick={() => setShowPass && setShowPass(v => !v)} style={{
            position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', color: N.muted, fontSize: 16,
          }}>
            {showPass ? '○' : '●'}
          </button>
        )}
      </div>
      {isPassword && form.password && (
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 6, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${strength.pct || 0}%`, background: strength.color || N.bg, borderRadius: N.radiusPill, transition: 'width 400ms ease-out, background 400ms ease-out' }} />
          </div>
          {strength.text && <div style={{ fontSize: 11, color: strength.color, marginTop: 4, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{strength.text}</div>}
        </div>
      )}
      {errors[name] && <div style={{ fontSize: 12, color: N.danger, marginTop: 5, fontWeight: 500 }}>{errors[name]}</div>}
    </div>
  );
}

export default function Register() {
  const [step, setStep]     = useState(0);
  const [form, setForm]     = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', city: '', country: 'India', additionalInfo: '' });
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState({});
  const [focused, setFocused]   = useState(null);
  const [submitHov, setSubmitHov] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const onChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(ev => ({ ...ev, [e.target.name]: '' }));
  };

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.firstName.trim() || form.firstName.trim().length < 2) e.firstName = 'At least 2 characters required';
      if (!form.lastName.trim()  || form.lastName.trim().length  < 2) e.lastName  = 'At least 2 characters required';
    }
    if (step === 1) {
      if (!form.email.includes('@')) e.email    = 'Valid email required';
      if (form.password.length < 6)  e.password = 'Min. 6 characters';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 2)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const onSubmit = async e => {
    e.preventDefault();
    if (step < 2) { nextStep(); return; }
    setLoading(true);
    try {
      const data = await api.post('/auth/register', form);
      setAuth(data.token, data.user);
      toast.success(`Welcome to Traveloop India, ${data.user.firstName}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const inp = (name, type, placeholder) => ({
    ...input,
    boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset,
  });

  const strength = strengthInfo(form.password);



  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: N.bg, fontFamily: N.font }}>

      {/* ── Left panel ─────────────────────────────────── */}
      <div style={{
        width:          340,
        background:     N.bg,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        '48px 36px',
        boxShadow:      '4px 0 24px rgb(163,177,198,0.25)',
      }}>
        <div style={{ fontFamily: N.fontDisplay, fontSize: 28, fontWeight: 800, color: N.fg, letterSpacing: -0.5, marginBottom: 6 }}>
          Join Traveloop India
        </div>
        <div style={{ fontSize: 14, color: N.muted, marginBottom: 40, lineHeight: 1.6 }}>
          Your AI-powered companion for Incredible India travel.
        </div>

        {/* Step indicators */}
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
            {/* Circle */}
            <div style={{
              width:          36, height: 36,
              borderRadius:   '50%',
              background:     N.bg,
              boxShadow:      i < step ? N.shadowInset : i === step ? N.shadow : N.shadowInsetSm,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              fontSize:       13,
              fontWeight:     800,
              color:          i < step ? N.accentSecondary : i === step ? N.accent : N.muted,
              flexShrink:     0,
              transition:     N.transition,
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontWeight: i === step ? 700 : 500, fontSize: 14, color: i === step ? N.fg : N.muted, transition: N.transition }}>
                {s.title}
              </div>
              <div style={{ fontSize: 12, color: N.muted, marginTop: 2 }}>{s.desc}</div>
            </div>
          </div>
        ))}

        {/* Progress bar */}
        <div style={{ marginTop: 8 }}>
          <div style={{ height: 8, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden' }}>
            <div style={{
              height:     '100%',
              width:      `${((step + 1) / 3) * 100}%`,
              background: N.accent,
              borderRadius: N.radiusPill,
              transition: 'width 400ms ease-out',
            }} />
          </div>
          <div style={{ fontSize: 11, color: N.muted, marginTop: 6, fontWeight: 600 }}>Step {step + 1} of 3</div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────── */}
      <div style={{
        flex:           1,
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'center',
        padding:        '48px 56px',
        overflowY:      'auto',
        maxWidth:       640,
      }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ margin: 0, fontFamily: N.fontDisplay, fontSize: 26, fontWeight: 800, color: N.fg, letterSpacing: -0.5 }}>
            {STEPS[step].title}
          </h2>
          <p style={{ color: N.muted, marginTop: 6, fontSize: 14 }}>{STEPS[step].desc}</p>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {step === 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field name="firstName" placeholder="Priya"  lbl="First Name *" form={form} onChange={onChange} focused={focused} setFocused={setFocused} errors={errors} showPass={showPass} setShowPass={setShowPass} strength={strength} />
                <Field name="lastName"  placeholder="Sharma" lbl="Last Name *"  form={form} onChange={onChange} focused={focused} setFocused={setFocused} errors={errors} showPass={showPass} setShowPass={setShowPass} strength={strength} />
              </div>
              <Field name="phone" type="tel" placeholder="+91 9876543210" lbl="Phone Number" form={form} onChange={onChange} focused={focused} setFocused={setFocused} errors={errors} showPass={showPass} setShowPass={setShowPass} strength={strength} />
            </>
          )}
          {step === 1 && (
            <>
              <Field name="email"    type="email"    placeholder="you@example.com"    lbl="Email Address *" form={form} onChange={onChange} focused={focused} setFocused={setFocused} errors={errors} showPass={showPass} setShowPass={setShowPass} strength={strength} />
              <Field name="password" type="password" placeholder="Min. 6 characters" lbl="Password *"      form={form} onChange={onChange} focused={focused} setFocused={setFocused} errors={errors} showPass={showPass} setShowPass={setShowPass} strength={strength} />
            </>
          )}
          {step === 2 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field name="city"    placeholder="Mumbai" lbl="City"    form={form} onChange={onChange} focused={focused} setFocused={setFocused} errors={errors} showPass={showPass} setShowPass={setShowPass} strength={strength} />
                <Field name="country" placeholder="India"  lbl="Country" form={form} onChange={onChange} focused={focused} setFocused={setFocused} errors={errors} showPass={showPass} setShowPass={setShowPass} strength={strength} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={label}>About You (optional)</label>
                <textarea
                  name="additionalInfo" value={form.additionalInfo} onChange={onChange}
                  placeholder="Your travel interests..."
                  onFocus={() => setFocused('bio')} onBlur={() => setFocused(null)}
                  style={{
                    ...input,
                    boxShadow: focused === 'bio' ? N.shadowInsetDeep : N.shadowInset,
                    resize:    'vertical',
                    minHeight: 90,
                    fontFamily: N.font,
                  }}
                />
              </div>
              {/* Confirmation summary */}
              <div style={{
                ...card,
                padding:     '18px 22px',
                borderRadius: N.radiusMd,
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                  Account Summary
                </div>
                <div style={{ fontSize: 14, color: N.fg, fontWeight: 600 }}>{form.firstName} {form.lastName}</div>
                <div style={{ fontSize: 13, color: N.muted, marginTop: 2 }}>{form.email}</div>
                {form.city && <div style={{ fontSize: 13, color: N.muted, marginTop: 2 }}>{form.city}, {form.country}</div>}
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {step > 0 && (
              <button type="button" onClick={prevStep} style={{
                ...btn,
                padding:   '14px 24px',
                fontSize:  14,
                boxShadow: N.shadow,
              }}>
                ← Back
              </button>
            )}
            <button type="submit" disabled={loading}
              onMouseEnter={() => setSubmitHov(true)}
              onMouseLeave={() => setSubmitHov(false)}
              style={{
                ...btnPrimary,
                flex:       1,
                padding:    '14px',
                fontSize:   15,
                fontWeight: 800,
                borderRadius: N.radiusBtn,
                opacity:    loading ? 0.7 : 1,
                cursor:     loading ? 'not-allowed' : 'pointer',
                boxShadow:  submitHov && !loading ? `${N.shadowHover}, 0 0 24px rgba(108,99,255,0.3)` : N.shadow,
                transform:  submitHov && !loading ? 'translateY(-1px)' : 'none',
                transition: N.transition,
              }}>
              {loading ? 'Creating account...' : step < 2 ? 'Continue →' : 'Create Account →'}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: 'rgb(163,177,198,0.4)' }} />
          <span style={{ margin: '0 14px', fontSize: 12, color: N.muted, fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgb(163,177,198,0.4)' }} />
        </div>
        <div style={{ textAlign: 'center', fontSize: 14, color: N.muted }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: N.accent, fontWeight: 700 }}>Sign in →</Link>
        </div>

        <div style={{ marginTop: 24, padding: '12px', borderRadius: N.radiusBtn, boxShadow: N.shadowInsetSm, textAlign: 'center', fontSize: 11, color: N.muted }}>
          Your data is encrypted · No spam, ever
        </div>
      </div>
    </div>
  );
}
