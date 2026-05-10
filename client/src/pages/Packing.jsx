import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';

export default function Packing() {
  const { id } = useParams();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newCat, setNewCat] = useState('General');
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);

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

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading…</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>🎒 Packing List</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={aiGenerate} disabled={aiLoading} style={{ padding: '9px 18px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {aiLoading ? '🤖 Generating…' : '🤖 AI Generate List'}
          </button>
          <button onClick={resetAll} style={{ padding: '9px 16px', background: '#fff', border: '1.5px solid #e0e0e0', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#555' }}>↩ Reset All</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…"
          style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
      </div>

      <form onSubmit={addItem} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: 10, marginBottom: 20 }}>
        <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Add custom item…"
          style={{ flex: 1, padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none' }} />
        <select value={newCat} onChange={e => setNewCat(e.target.value)}
          style={{ padding: '9px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 13, outline: 'none' }}>
          {['Documents','Clothing','Electronics','Toiletries','General'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="submit" style={{ padding: '9px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>+ Add</button>
      </form>

      {CATEGORIES.filter(cat => byCategory[cat]?.length > 0).map(cat => (
        <div key={cat} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ background: '#f8faf9', padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{cat}</h3>
            <span style={{ fontSize: 12, color: '#888' }}>{byCategory[cat]?.filter(i => i.isPacked).length}/{byCategory[cat]?.length} packed</span>
          </div>
          {(byCategory[cat] || []).map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #f8f8f8', gap: 12 }}>
              <input type="checkbox" checked={item.isPacked} onChange={() => toggle(item)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#1D9E75' }} />
              <span style={{ flex: 1, fontSize: 14, color: item.isPacked ? '#aaa' : '#333', textDecoration: item.isPacked ? 'line-through' : 'none' }}>{item.label}</span>
              <button onClick={() => deleteItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 16, padding: 0 }}
                onMouseEnter={e => e.target.style.color = '#e53e3e'} onMouseLeave={e => e.target.style.color = '#ccc'}>×</button>
            </div>
          ))}
        </div>
      ))}

      <div style={{ position: 'sticky', bottom: 0, background: '#1D9E75', borderRadius: 12, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', boxShadow: '0 -4px 16px rgba(0,0,0,0.1)' }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🎒 {packed} of {items.length} items packed</span>
        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 99, height: 8, width: 200 }}>
          <div style={{ height: '100%', width: `${items.length ? (packed / items.length) * 100 : 0}%`, background: '#fff', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
      </div>
    </div>
  );
}
