import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';

const PIE_COLORS = ['#1D9E75', '#EF9F27', '#e53e3e', '#3182ce', '#805ad5'];
const CATEGORIES = ['transport', 'hotel', 'food', 'activities', 'other'];

export default function Invoice() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripsAPI.getInvoice(id).then(setData).catch(() => toast.error('Failed to load invoice')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading invoice…</div>;
  if (!data) return null;

  const { trip, budget } = data;
  const pieData = CATEGORIES.filter(c => (budget.breakdown[c] || 0) > 0).map(c => ({ name: c.charAt(0).toUpperCase() + c.slice(1), value: budget.breakdown[c] }));
  const statusColor = budget.status === 'over' ? '#e53e3e' : budget.status === 'warning' ? '#EF9F27' : '#1D9E75';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>🧾 Trip Invoice</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => tripsAPI.downloadPDF(id)} style={{ padding: '10px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            ⬇ Download PDF
          </button>
          <button onClick={() => toast('Email feature coming soon!')} style={{ padding: '10px 20px', background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#555' }}>
            📧 Email Invoice
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ background: 'linear-gradient(135deg, #1D9E75, #0f6e52)', padding: '24px 28px', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 }}>✈ TRAVELOOP</div>
              <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>{trip.name}</h2>
              <p style={{ margin: 0, opacity: 0.85, fontSize: 13 }}>
                {new Date(trip.startDate).toDateString()} — {new Date(trip.endDate).toDateString()}
              </p>
              {trip.stops?.length > 0 && (
                <p style={{ margin: '6px 0 0', opacity: 0.85, fontSize: 13 }}>
                  📍 {trip.stops.map(s => s.city).join(' → ')}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>Traveller</div>
              <div style={{ fontWeight: 700 }}>{trip.user?.firstName} {trip.user?.lastName}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{trip.user?.email}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Budget Summary</h3>
          {[
            { label: 'Total Budget', value: budget.totalBudget, color: '#1D9E75' },
            { label: 'Total Spent', value: budget.totalSpent, color: statusColor },
            { label: 'Remaining', value: budget.remaining, color: budget.remaining >= 0 ? '#1D9E75' : '#e53e3e' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: 13, color: '#555' }}>{label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color }}>${Math.abs(value).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, height: 8, background: '#f0f0f0', borderRadius: 99 }}>
            <div style={{ height: '100%', width: `${Math.min(budget.percentUsed, 100)}%`, background: statusColor, borderRadius: 99 }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 11, color: '#888', textAlign: 'right' }}>{budget.percentUsed}% used</div>
        </div>

        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 700 }}>Category Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => `$${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: '#aaa', padding: '40px 0', fontSize: 13 }}>No expense data</div>}
          {pieData.map((d, i) => (
            <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#555', marginTop: 4 }}>
              <span><span style={{ display: 'inline-block', width: 10, height: 10, background: PIE_COLORS[i], borderRadius: '50%', marginRight: 6 }} />{d.name}</span>
              <span style={{ fontWeight: 600 }}>${d.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Itemised Expenses</h3>
          <span style={{ fontSize: 12, color: '#888' }}>{trip.expenses?.length || 0} items</span>
        </div>
        {(trip.expenses || []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#aaa', fontSize: 13 }}>No expenses recorded</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faf9' }}>
                {['#', 'Date', 'Category', 'Description', 'Amount'].map((h, i) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: i === 4 ? 'right' : 'left', color: '#666', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(trip.expenses || []).map((e, i) => (
                <tr key={e.id} style={{ borderTop: '1px solid #f5f5f5', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px 16px', color: '#aaa' }}>{i + 1}</td>
                  <td style={{ padding: '10px 16px', color: '#888' }}>{new Date(e.date).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 16px' }}><span style={{ background: '#f0f4ff', color: '#4a5568', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{e.category}</span></td>
                  <td style={{ padding: '10px 16px', color: '#333' }}>{e.description}</td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: '#1a1a1a' }}>${e.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f8faf9', borderTop: '2px solid #e0e0e0' }}>
                <td colSpan={4} style={{ padding: '12px 16px', fontWeight: 700, color: '#1a1a1a' }}>Grand Total</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, fontSize: 16, color: statusColor }}>${budget.totalSpent.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        )}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', textAlign: 'center', fontSize: 11, color: '#aaa' }}>
          Generated by Traveloop — Personalized Travel Planning Made Easy
        </div>
      </div>
    </div>
  );
}
