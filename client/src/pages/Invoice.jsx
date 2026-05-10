import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { N, card, cardSm, btn, btnPrimary } from '../neu';

const PIE_COLORS = [N.accent, N.warning, N.danger, N.muted, '#805ad5'];
const CATEGORIES = ['transport', 'hotel', 'food', 'activities', 'other'];

export default function Invoice() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripsAPI.getInvoice(id).then(setData).catch(() => toast.error('Failed to load invoice')).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: N.muted, fontFamily: N.font, fontWeight: 600 }}>Loading invoice…</div>;
  if (!data) return null;

  const { trip, budget } = data;
  const pieData = CATEGORIES.filter(c => (budget.breakdown[c] || 0) > 0).map(c => ({ name: c.charAt(0).toUpperCase() + c.slice(1), value: budget.breakdown[c] }));
  const statusColor = budget.status === 'over' ? N.danger : budget.status === 'warning' ? N.warning : N.accentSecondary;

  return (
    <div style={{ fontFamily: N.font, maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>Trip Invoice</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => tripsAPI.downloadPDF(id)} style={{ ...btnPrimary, padding: '10px 18px', minHeight: 'auto', fontSize: 13 }}>
            Download PDF
          </button>
          <button onClick={() => toast('Email feature coming soon!')} style={{ ...btn, padding: '10px 18px', minHeight: 'auto', fontSize: 13 }}>
            Email Invoice
          </button>
        </div>
      </div>

      <div style={{ ...card, padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 12, color: N.accent, fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1.5 }}>◆ TRAVELOOP</div>
            <h2 style={{ margin: '0 0 6px', fontSize: 24, fontWeight: 900, color: N.fg, fontFamily: N.fontDisplay }}>{trip.name}</h2>
            <p style={{ margin: 0, color: N.muted, fontSize: 13, fontWeight: 600 }}>
              {new Date(trip.startDate).toDateString()} — {new Date(trip.endDate).toDateString()}
            </p>
            {trip.stops?.length > 0 && (
              <p style={{ margin: '8px 0 0', color: N.fg, fontSize: 13, fontWeight: 700 }}>
                {trip.stops.map(s => s.city).join(' → ')}
              </p>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: N.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>Traveller</div>
            <div style={{ fontWeight: 800, color: N.fg, fontSize: 16 }}>{trip.user?.firstName} {trip.user?.lastName}</div>
            <div style={{ fontSize: 13, color: N.muted, fontWeight: 600 }}>{trip.user?.email}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        <div style={{ ...cardSm, padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>Budget Summary</h3>
          {[
            { label: 'Total Budget', value: budget.totalBudget, color: N.accentSecondary },
            { label: 'Total Spent', value: budget.totalSpent, color: statusColor },
            { label: 'Remaining', value: budget.remaining, color: budget.remaining >= 0 ? N.accentSecondary : N.danger },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px dashed rgb(163,177,198,0.3)` }}>
              <span style={{ fontSize: 13, color: N.muted, fontWeight: 700 }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color }}>₹{Math.abs(value).toLocaleString()}</span>
            </div>
          ))}
          <div style={{ marginTop: 20, height: 8, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(budget.percentUsed, 100)}%`, background: statusColor, borderRadius: N.radiusPill }} />
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: N.muted, textAlign: 'right', fontWeight: 800 }}>{budget.percentUsed}% used</div>
        </div>

        <div style={{ ...cardSm, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>Category Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke={N.bg} strokeWidth={2} />)}
                </Pie>
                <Tooltip formatter={v => `₹${v.toFixed(2)}`} contentStyle={{ borderRadius: N.radiusInner, border: 'none', boxShadow: N.shadow, background: N.bg, fontWeight: 600, fontFamily: N.font }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', color: N.muted, padding: '40px 0', fontSize: 13, fontWeight: 600 }}>No expense data</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: N.muted, fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, background: PIE_COLORS[i], borderRadius: '50%', boxShadow: `0 0 0 2px ${N.bg}, 0 0 0 4px ${PIE_COLORS[i]}33` }} />
                  {d.name}
                </span>
                <span style={{ fontWeight: 800, color: N.fg }}>₹{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...card, padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>Itemised Expenses</h3>
          <span style={{ fontSize: 12, color: N.muted, fontWeight: 800 }}>{trip.expenses?.length || 0} items</span>
        </div>
        
        {(trip.expenses || []).length === 0 ? (
          <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: '32px', textAlign: 'center', color: N.muted, fontWeight: 600, fontSize: 13 }}>No expenses recorded</div>
        ) : (
          <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 1.5fr 3fr 1.5fr', gap: 12, paddingBottom: 12, borderBottom: `1px solid rgb(163,177,198,0.2)`, fontSize: 11, fontWeight: 800, color: N.muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              <div>#</div>
              <div>Date</div>
              <div>Category</div>
              <div>Description</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
            </div>
            
            {(trip.expenses || []).map((e, i) => (
              <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '0.5fr 1fr 1.5fr 3fr 1.5fr', gap: 12, padding: '14px 0', borderBottom: `1px dashed rgb(163,177,198,0.3)`, alignItems: 'center', fontSize: 13 }}>
                <div style={{ color: N.muted, fontWeight: 800 }}>{i + 1}</div>
                <div style={{ color: N.muted, fontWeight: 600 }}>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                <div>
                  <span style={{ background: N.bg, boxShadow: N.shadowSm, color: N.accent, fontSize: 10, padding: '4px 10px', borderRadius: N.radiusPill, fontWeight: 800, textTransform: 'uppercase' }}>{e.category}</span>
                </div>
                <div style={{ color: N.fg, fontWeight: 600 }}>{e.description}</div>
                <div style={{ textAlign: 'right', fontWeight: 800, color: N.fg }}>₹{e.amount.toLocaleString()}</div>
              </div>
            ))}
            
            <div style={{ display: 'grid', gridTemplateColumns: '6fr 1.5fr', gap: 12, paddingTop: 16, marginTop: 4, borderTop: `2px solid rgb(163,177,198,0.2)`, alignItems: 'center' }}>
              <div style={{ fontWeight: 800, color: N.muted, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, textAlign: 'right' }}>Grand Total</div>
              <div style={{ textAlign: 'right', fontWeight: 900, color: statusColor, fontSize: 16 }}>
                ₹{budget.totalSpent.toLocaleString()}
              </div>
            </div>
          </div>
        )}
        <div style={{ padding: '24px 20px 0', textAlign: 'center', fontSize: 11, color: N.muted, fontWeight: 600 }}>
          Generated by Traveloop — Personalized Travel Planning Made Easy
        </div>
      </div>
    </div>
  );
}
