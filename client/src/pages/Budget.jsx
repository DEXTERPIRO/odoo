import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { N, card, cardSm, btn, btnPrimary, input, label } from '../neu';

const CATEGORIES = ['Flight', 'Hotel', 'Food', 'Transport', 'Shopping', 'Activities', 'Other'];
const PIE_COLORS = [N.accent, N.warning, N.danger, N.muted, '#805ad5', '#dd6b20', '#888'];

export default function Budget() {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'Food', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [adding, setAdding] = useState(false);
  const [focused, setFocused] = useState(null);

  const load = async () => {
    try {
      const [b, e] = await Promise.all([tripsAPI.getBudget(id), tripsAPI.getExpenses(id)]);
      setBudget(b); setExpenses(e);
    } catch { toast.error('Failed to load budget'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const socket = io(SOCKET_URL);
    socket.emit('join-trip', id);
    socket.on('budget-updated', b => { setBudget(b); tripsAPI.getExpenses(id).then(setExpenses).catch(() => {}); });
    return () => { socket.emit('leave-trip', id); socket.disconnect(); };
  }, [id]);

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.description || !form.amount) return toast.error('Fill all fields');
    setAdding(true);
    try {
      const r = await tripsAPI.addExpense({ ...form, tripId: id });
      setExpenses(ex => [r.expense, ...ex]);
      setBudget(r.budget);
      setForm(f => ({ ...f, description: '', amount: '' }));
      toast.success('Expense added');
    } catch { toast.error('Failed to add expense'); }
    finally { setAdding(false); }
  };

  const handleDelete = async expId => {
    try {
      const r = await tripsAPI.deleteExpense(expId);
      setExpenses(ex => ex.filter(e => e.id !== expId));
      setBudget(r.budget);
      toast.success('Expense deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: N.muted, fontFamily: N.font, fontWeight: 600 }}>Loading budget…</div>;

  const pct = budget ? Math.min(budget.percentUsed, 100) : 0;
  const statusColor = budget?.status === 'over' ? N.danger : budget?.status === 'warning' ? N.warning : N.accentSecondary;
  const pieData = budget ? Object.entries(budget.breakdown).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v })) : [];

  const inp = (name) => ({
    ...input, boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset,
  });

  return (
    <div style={{ fontFamily: N.font }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>Budget & Expenses</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/trips/${id}/view`} style={{ ...btn, padding: '10px 18px', minHeight: 'auto', textDecoration: 'none', color: N.muted, fontSize: 13 }}>← Itinerary</Link>
          <Link to={`/trips/${id}/invoice`} style={{ ...btnPrimary, padding: '10px 18px', minHeight: 'auto', textDecoration: 'none', fontSize: 13 }}>Invoice</Link>
        </div>
      </div>

      {budget && (
        <div style={{ ...card, padding: 24, marginBottom: 28 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
            {[
              { label: 'Total Budget', value: `₹${budget.totalBudget.toLocaleString()}`, color: N.accentSecondary, sub: '100% of plan' },
              { label: 'Total Spent', value: `₹${budget.totalSpent.toLocaleString()}`, color: statusColor, sub: `${budget.percentUsed}% used` },
              { label: 'Remaining', value: `₹${Math.abs(budget.remaining).toLocaleString()}`, color: budget.remaining >= 0 ? N.accentSecondary : N.danger, sub: budget.remaining >= 0 ? 'left to spend' : 'over budget!' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: N.fontDisplay }}>{value}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: N.muted, marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                <div style={{ fontSize: 11, color: N.muted, marginTop: 4, fontWeight: 600 }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 10, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: statusColor, borderRadius: N.radiusPill, transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {pieData.length > 0 && (
          <div style={{ ...cardSm, padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>Spending Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke={N.bg} strokeWidth={2} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v.toFixed(2)}`} contentStyle={{ borderRadius: N.radiusInner, border: 'none', boxShadow: N.shadow, background: N.bg, fontWeight: 600, fontFamily: N.font }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 600, fontFamily: N.font, paddingTop: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div style={{ ...cardSm, padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>Add Expense</h3>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                onFocus={() => setFocused('category')} onBlur={() => setFocused(null)}
                style={inp('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Paris hotel 4 nights"
                onFocus={() => setFocused('description')} onBlur={() => setFocused(null)}
                style={inp('description')} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={label}>Amount (₹)</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" min="0" step="1"
                  onFocus={() => setFocused('amount')} onBlur={() => setFocused(null)}
                  style={inp('amount')} />
              </div>
              <div>
                <label style={label}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  onFocus={() => setFocused('date')} onBlur={() => setFocused(null)}
                  style={inp('date')} />
              </div>
            </div>
            <button type="submit" disabled={adding} style={{ ...btnPrimary, width: '100%', padding: '14px', minHeight: 'auto', opacity: adding ? 0.7 : 1 }}>
              {adding ? 'Adding…' : '+ Add Expense'}
            </button>
          </form>
        </div>
      </div>

      <div style={{ ...card, padding: 24 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>All Expenses ({expenses.length})</h3>
        
        {expenses.length === 0 ? (
          <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '32px', textAlign: 'center', color: N.muted, fontWeight: 600, fontSize: 13 }}>No expenses yet</div>
        ) : (
          <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 3fr 1.5fr 0.5fr', gap: 12, paddingBottom: 12, borderBottom: `1px solid rgb(163,177,198,0.2)`, fontSize: 11, fontWeight: 800, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <div>Date</div>
              <div>Category</div>
              <div>Description</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
              <div></div>
            </div>
            {expenses.map((e, idx) => (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 3fr 1.5fr 0.5fr', gap: 12, padding: '14px 0', borderBottom: idx < expenses.length - 1 ? `1px dashed rgb(163,177,198,0.3)` : 'none', alignItems: 'center', fontSize: 13 }}>
                <div style={{ color: N.muted, fontWeight: 600 }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                <div>
                  <span style={{ background: N.bg, boxShadow: N.shadowSm, color: N.accent, fontSize: 10, padding: '4px 10px', borderRadius: N.radiusPill, fontWeight: 800, textTransform: 'uppercase' }}>{e.category}</span>
                </div>
                <div style={{ color: N.fg, fontWeight: 600 }}>{e.description}</div>
                <div style={{ textAlign: 'right', fontWeight: 800, color: N.fg }}>₹{e.amount.toLocaleString()}</div>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => handleDelete(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: N.danger, fontSize: 18, fontWeight: 700, padding: 0 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
