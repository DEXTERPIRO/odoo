import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';

// Singleton socket for global budget alerts (separate from trip-specific sockets)
let globalSocket = null;

function BudgetAlertModal({ alert, onClose }) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const isOver = alert.type === 'OVER_BUDGET';
  const color = isOver ? '#E53E3E' : '#EF9F27';
  const bgColor = isOver ? '#fff5f5' : '#fffbeb';

  useEffect(() => {
    if (countdown <= 0) { onClose(); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: 70, pointerEvents: 'none',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: 420, maxWidth: 'calc(100vw - 32px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        border: `2px solid ${color}`,
        pointerEvents: 'all',
        animation: 'slideDown 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        overflow: 'hidden',
      }}>
        {/* Countdown bar */}
        <div style={{ height: 4, background: '#f0f0f0' }}>
          <div style={{ height: '100%', width: `${(countdown / 10) * 100}%`, background: color, transition: 'width 1s linear' }} />
        </div>

        {/* Header */}
        <div style={{ background: bgColor, padding: '20px 24px 16px', borderBottom: `1px solid ${color}22` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 36 }}>{isOver ? '🚨' : '⚠️'}</div>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color }}>
                {isOver ? 'Budget Exceeded!' : 'Budget Warning!'}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: '#888', marginTop: 2 }}>
                You've used <strong style={{ color }}>{alert.percentUsed}%</strong> of your ${alert.totalBudget.toLocaleString()} budget
              </p>
            </div>
            <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>×</button>
          </div>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            {[
              { label: 'Spent', value: `$${alert.totalSpent.toFixed(0)}`, c: color },
              { label: 'Budget', value: `$${alert.totalBudget.toLocaleString()}`, c: '#888' },
              { label: alert.remaining >= 0 ? 'Left' : 'Over', value: `$${Math.abs(alert.remaining).toFixed(0)}`, c: alert.remaining >= 0 ? '#1D9E75' : '#E53E3E' },
            ].map(({ label, value, c }) => (
              <div key={label} style={{ flex: 1, background: '#fff', borderRadius: 8, padding: '8px 10px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: c }}>{value}</div>
                <div style={{ fontSize: 10, color: '#aaa', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tips */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 }}>AI Money-Saving Tips</span>
            {alert.estimatedSaving > 0 && (
              <span style={{ marginLeft: 'auto', background: '#e8f5f0', color: '#1D9E75', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                Save ~${alert.estimatedSaving}
              </span>
            )}
          </div>
          {(alert.aiTips || []).map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, padding: '9px 12px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fcd34d' }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
              <span style={{ fontSize: 12, color: '#78350f', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ padding: '0 24px 20px', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#f4f4f4', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#555' }}>
            Got it ({countdown}s)
          </button>
          {alert.tripId && (
            <button
              onClick={() => { navigate(`/trips/${alert.tripId}/budget`); onClose(); }}
              style={{ flex: 1, padding: '10px', background: color, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}
            >
              See Full Budget →
            </button>
          )}
        </div>
      </div>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-30px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)     scale(1); }
        }
      `}</style>
    </div>
  );
}

export default function GlobalBudgetAlert() {
  const { token } = useAuthStore();
  const [alert, setAlert] = useState(null);
  const [lastAlert, setLastAlert] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    if (!globalSocket) {
      globalSocket = io('http://localhost:5000');
    }
    socketRef.current = globalSocket;
    socketRef.current.on('budget-alert', (data) => {
      setAlert(data);
      setLastAlert(data);
      // Expose last alert to Navbar via window event
      window.dispatchEvent(new CustomEvent('budget-alert', { detail: data }));
    });
    return () => {
      socketRef.current?.off('budget-alert');
    };
  }, [token]);

  if (!alert) return null;
  return <BudgetAlertModal alert={alert} onClose={() => setAlert(null)} />;
}

// Export last alert getter for Navbar bell
export { GlobalBudgetAlert };
