import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { tripsAPI } from '../../api/trips';
import { N } from '../../neu';

const QUICK = ['Best time to visit?', 'Local food tips?', 'Transport options?', 'Safety tips?', 'Budget advice?'];

// ── Clean "AI" monogram — no robot emoji ──────────────────────────────────────
function AIMark({ size = 22, color = N.accent }) {
  return (
    <span style={{
      fontFamily:    N.fontDisplay,
      fontWeight:    800,
      fontSize:      size,
      color,
      letterSpacing: -1,
      lineHeight:    1,
      userSelect:    'none',
    }}>AI</span>
  );
}

export default function AIChatbot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm your India travel assistant. Ask me anything about your trip." }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading]   = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [bubbleHov, setBubbleHov]       = useState(false);
  const bottomRef = useRef(null);
  const location  = useLocation();

  const tripIdMatch = location.pathname.match(/\/trips\/([^/]+)/);
  const tripId      = tripIdMatch ? tripIdMatch[1] : null;

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const send = async (text) => {
    const msg = (text || inputVal).trim();
    if (!msg) return;
    setInputVal('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const r = await tripsAPI.aiChat(msg, tripId ? { tripId } : null);
      setMessages(m => [...m, { role: 'bot', text: r.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'bot', text: 'Connection error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* ── Floating bubble ──────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setBubbleHov(true)}
        onMouseLeave={() => setBubbleHov(false)}
        title="AI Travel Assistant"
        style={{
          position:       'fixed',
          bottom:         28,
          right:          28,
          zIndex:         999,
          width:          56,
          height:         56,
          borderRadius:   '50%',
          background:     N.bg,
          border:         'none',
          cursor:         'pointer',
          boxShadow:      bubbleHov ? N.shadowHover : N.shadow,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          transition:     N.transition,
          transform:      open ? 'rotate(45deg) scale(1.05)' : bubbleHov ? 'translateY(-2px)' : 'none',
        }}>
        {open
          ? <span style={{ fontSize: 22, color: N.muted, fontWeight: 300, lineHeight: 1 }}>✕</span>
          : <AIMark size={18} color={N.accent} />
        }
      </button>

      {/* ── Chat panel ───────────────────────────────────── */}
      {open && (
        <div style={{
          position:     'fixed',
          bottom:       96,
          right:        28,
          zIndex:       998,
          width:        360,
          height:       500,
          background:   N.bg,
          borderRadius: N.radius,
          boxShadow:    N.shadowHover,
          display:      'flex',
          flexDirection:'column',
          overflow:     'hidden',
          fontFamily:   N.font,
          animation:    'fadeInUp 250ms ease-out both',
        }}>

          {/* Header */}
          <div style={{
            background:   N.bg,
            boxShadow:    N.shadowInset,
            padding:      '16px 20px',
            display:      'flex',
            alignItems:   'center',
            gap:          12,
            flexShrink:   0,
          }}>
            {/* AI icon well */}
            <div style={{
              width:          40,
              height:         40,
              borderRadius:   '50%',
              background:     N.bg,
              boxShadow:      N.shadowInsetDeep,
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
            }}>
              <AIMark size={14} color={N.accent} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: N.fg, fontFamily: N.fontDisplay }}>
                Travel Assistant
              </div>
              <div style={{ fontSize: 11, color: N.muted, marginTop: 1 }}>
                {tripId ? 'Trip context active' : 'General travel mode'}
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background:   N.bg,
              border:       'none',
              borderRadius: '50%',
              width:        30,
              height:       30,
              cursor:       'pointer',
              color:        N.muted,
              fontSize:     16,
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              boxShadow:    N.shadowSm,
              transition:   N.transition,
              flexShrink:   0,
            }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth:     '80%',
                  padding:      '10px 14px',
                  borderRadius: msg.role === 'user' ? `${N.radiusBtn} ${N.radiusBtn} 4px ${N.radiusBtn}` : `${N.radiusBtn} ${N.radiusBtn} ${N.radiusBtn} 4px`,
                  background:   N.bg,
                  boxShadow:    msg.role === 'user' ? `${N.shadowSm}, inset 0 0 0 2px ${N.accent}22` : N.shadowSm,
                  color:        msg.role === 'user' ? N.accent : N.fg,
                  fontSize:     13,
                  lineHeight:   1.6,
                  fontWeight:   msg.role === 'user' ? 600 : 400,
                }}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  background:   N.bg,
                  boxShadow:    N.shadowInsetSm,
                  padding:      '10px 16px',
                  borderRadius: N.radiusBtn,
                  fontSize:     13,
                  color:        N.muted,
                  letterSpacing: 2,
                }}>
                  · · ·
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length <= 2 && (
            <div style={{
              padding:    '8px 14px',
              display:    'flex',
              gap:        6,
              overflowX:  'auto',
              borderTop:  `1px solid rgb(163,177,198,0.25)`,
              flexShrink: 0,
            }}>
              {QUICK.map(q => (
                <button key={q} onClick={() => send(q)} style={{
                  whiteSpace:   'nowrap',
                  background:   N.bg,
                  border:       'none',
                  borderRadius: N.radiusPill,
                  padding:      '6px 13px',
                  fontSize:     11,
                  fontWeight:   700,
                  color:        N.accent,
                  cursor:       'pointer',
                  boxShadow:    N.shadowSm,
                  flexShrink:   0,
                  fontFamily:   N.font,
                  transition:   N.transition,
                }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div style={{
            padding:    '12px 16px',
            display:    'flex',
            gap:        8,
            borderTop:  `1px solid rgb(163,177,198,0.25)`,
            flexShrink: 0,
          }}>
            <input
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask about your trip..."
              disabled={loading}
              style={{
                flex:         1,
                padding:      '10px 14px',
                background:   N.bg,
                border:       'none',
                borderRadius: N.radiusBtn,
                boxShadow:    inputFocused ? N.shadowInsetDeep : N.shadowInset,
                fontSize:     13,
                color:        N.fg,
                fontFamily:   N.font,
                outline:      'none',
                transition:   N.transition,
                opacity:      loading ? 0.6 : 1,
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !inputVal.trim()}
              style={{
                width:          40,
                height:         40,
                background:     N.bg,
                border:         'none',
                borderRadius:   '50%',
                cursor:         inputVal.trim() && !loading ? 'pointer' : 'default',
                boxShadow:      inputVal.trim() && !loading ? N.shadowSm : N.shadowInsetSm,
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                color:          inputVal.trim() && !loading ? N.accent : N.muted,
                fontSize:       18,
                transition:     N.transition,
                flexShrink:     0,
              }}>
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
