import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';

const CATEGORIES = ['Flight', 'Hotel', 'Food', 'Transport', 'Shopping', 'Activities', 'Other'];
const PIE_COLORS = ['#1D9E75', '#EF9F27', '#e53e3e', '#3182ce', '#805ad5', '#dd6b20', '#888'];

export default function Budget() {
  const { id } = useParams();
  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ category: 'Food', description: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    try {
      const [b, e] = await Promise.all([tripsAPI.getBudget(id), tripsAPI.getExpenses(id)]);
      setBudget(b); setExpenses(e);
    } catch { toast.error('Failed to load budget'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    const socket = io('http://localhost:5000');
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

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading budget…</div>;

  const pct = budget ? Math.min(budget.percentUsed, 100) : 0;
  const statusColor = budget?.status === 'over' ? '#e53e3e' : budget?.status === 'warning' ? '#EF9F27' : '#1D9E75';
  const pieData = budget ? Object.entries(budget.breakdown).filter(([, v]) => v > 0).map(([k, v]) => ({ name: k.charAt(0).toUpperCase() + k.slice(1), value: v })) : [];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>💰 Budget & Expenses</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/trips/${id}/view`} style={{ padding: '9px 16px', background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 8, textDecoration: 'none', color: '#333', fontSize: 13, fontWeight: 600 }}>← Itinerary</Link>
          <Link to={`/trips/${id}/invoice`} style={{ padding: '9px 16px', background: '#1D9E75', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>🧾 Invoice</Link>
        </div>
      </div>

      {budget && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Budget', value: `$${budget.totalBudget.toLocaleString()}`, color: '#1D9E75', sub: '100% of plan' },
              { label: 'Total Spent', value: `$${budget.totalSpent.toLocaleString()}`, color: statusColor, sub: `${budget.percentUsed}% used` },
              { label: 'Remaining', value: `$${Math.abs(budget.remaining).toLocaleString()}`, color: budget.remaining >= 0 ? '#1D9E75' : '#e53e3e', sub: budget.remaining >= 0 ? 'left to spend' : 'over budget!' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginTop: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 10, background: '#f0f0f0', borderRadius: 99, marginBottom: 24 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: statusColor, borderRadius: 99, transition: 'width 0.5s' }} />
          </div>
        </>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {pieData.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Spending Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `$${v.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Add Expense</h3>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Description</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Paris hotel 4 nights"
                style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Amount ($)</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" min="0" step="0.01"
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>Date</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button type="submit" disabled={adding} style={{ width: '100%', padding: 11, background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', opacity: adding ? 0.7 : 1 }}>
              {adding ? 'Adding…' : '+ Add Expense'}
            </button>
          </form>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>All Expenses ({expenses.length})</h3>
        </div>
        {expenses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#aaa' }}>No expenses yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faf9' }}>
                {['Date', 'Category', 'Description', 'Amount', ''].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: h === 'Amount' ? 'right' : 'left', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} style={{ borderTop: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 16px', color: '#888' }}>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 16px' }}><span style={{ background: '#f0f4ff', color: '#4a5568', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{e.category}</span></td>
                  <td style={{ padding: '10px 16px', color: '#333' }}>{e.description}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600, color: '#1a1a1a' }}>${e.amount.toFixed(2)}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', fontSize: 16, padding: 0 }}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
