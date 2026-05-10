import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { N, card, btn, btnPrimary, input } from '../neu';

export default function Packing() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCat, setNewCat] = useState('General');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    tripsAPI.getPacking(id).then(setItems).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, [id]);

  const toggle = async item => {
    try {
      const updated = await tripsAPI.updatePackingItem(item.id, { isPacked: !item.isPacked });
      setItems(its => its.map(i => i.id === item.id ? updated : i));
    } catch { toast.error('Failed to update'); }
  };

  const deleteItem = async itemId => {
    try { await tripsAPI.deletePackingItem(itemId); setItems(its => its.filter(i => i.id !== itemId)); }
    catch { toast.error('Failed to delete'); }
  };

  const addItem = async e => {
    e.preventDefault();
    if (!newLabel.trim()) return;
    try {
      const item = await tripsAPI.addPackingItem({ tripId: id, label: newLabel.trim(), category: newCat });
      setItems(its => [...its, item]);
      setNewLabel('');
      toast.success('Item added');
    } catch { toast.error('Failed to add'); }
  };

  const resetAll = async () => {
    try { const its = await tripsAPI.resetPacking(id); setItems(its); toast.success('All items reset'); }
    catch { toast.error('Failed to reset'); }
  };

  const aiGenerate = async () => {
    setAiLoading(true);
    try {
      const r = await tripsAPI.aiPacking(id);
      setItems(r.items);
      toast.success(`AI generated ${r.items.length} items!`);
    } catch { toast.error('AI generation failed'); }
    finally { setAiLoading(false); }
  };

  const filtered = items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()));
  const packed = items.filter(i => i.isPacked).length;
  const byCategory = filtered.reduce((acc, i) => { (acc[i.category] = acc[i.category] || []).push(i); return acc; }, {});
  const CATEGORIES = ['Documents', 'Clothing', 'Electronics', 'Toiletries', 'General', ...Object.keys(byCategory).filter(k => !['Documents','Clothing','Electronics','Toiletries','General'].includes(k))];

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: N.muted, fontFamily: N.font, fontWeight: 600 }}>Loading packing list…</div>;

  const inp = (name) => ({
    ...input, boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset,
  });

  return (
    <div style={{ fontFamily: N.font, maxWidth: 900, margin: '0 auto', paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>Packing List</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={aiGenerate} disabled={aiLoading} style={{ ...btnPrimary, padding: '10px 18px', minHeight: 'auto', fontSize: 13, background: N.accent, color: N.bg }}>
            {aiLoading ? 'Generating…' : 'AI Generate List'}
          </button>
          <button onClick={resetAll} style={{ ...btn, padding: '10px 18px', minHeight: 'auto', fontSize: 13 }}>Reset All</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…"
          onFocus={() => setFocused('search')} onBlur={() => setFocused(null)}
          style={{ ...inp('search'), flex: 1, padding: '14px 18px' }} />
      </div>

      <form onSubmit={addItem} style={{ ...card, padding: 20, display: 'flex', gap: 12, marginBottom: 28, alignItems: 'center' }}>
        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Add custom item…"
          onFocus={() => setFocused('add')} onBlur={() => setFocused(null)}
          style={{ ...inp('add'), flex: 1 }} />
        <select value={newCat} onChange={e => setNewCat(e.target.value)}
          onFocus={() => setFocused('cat')} onBlur={() => setFocused(null)}
          style={{ ...inp('cat'), width: 'auto', cursor: 'pointer' }}>
          {['Documents','Clothing','Electronics','Toiletries','General'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" style={{ ...btnPrimary, padding: '0 24px' }}>Add</button>
      </form>

      {CATEGORIES.filter(cat => byCategory[cat]?.length > 0).map(cat => (
        <div key={cat} style={{ ...card, padding: 0, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: N.bg, padding: '16px 20px', borderBottom: `1px solid rgb(163,177,198,0.2)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>{cat}</h3>
            <span style={{ fontSize: 12, color: N.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {byCategory[cat]?.filter(i => i.isPacked).length}/{byCategory[cat]?.length} packed
            </span>
          </div>
          <div style={{ background: N.bg }}>
            {(byCategory[cat] || []).map((item, idx) => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '14px 20px', borderBottom: idx < byCategory[cat].length - 1 ? `1px dashed rgb(163,177,198,0.3)` : 'none', gap: 16 }}>
                <input type="checkbox" checked={item.isPacked} onChange={() => toggle(item)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: N.accent }} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: item.isPacked ? N.muted : N.fg, textDecoration: item.isPacked ? 'line-through' : 'none', transition: N.transition }}>{item.label}</span>
                <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: N.danger, fontSize: 18, fontWeight: 700, padding: 0, opacity: 0.6 }}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: 860, background: N.bg, borderRadius: N.radiusPill, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: N.shadowHover, border: `1px solid rgb(163,177,198,0.2)`, zIndex: 100 }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: N.fg }}>{packed} of {items.length} items packed</span>
        <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, height: 8, width: 200, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${items.length ? (packed / items.length) * 100 : 0}%`, background: N.accent, borderRadius: N.radiusPill, transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        </div>
      </div>
    </div>
  );
}
