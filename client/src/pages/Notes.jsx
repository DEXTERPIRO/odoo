import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';

export default function Notes() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    tripsAPI.getNotes(id).then(setNotes).catch(() => toast.error('Failed to load notes')).finally(() => setLoading(false));
  }, [id]);

  const addNote = async e => {
    e.preventDefault();
    if (!form.title || !form.content) return toast.error('Fill all fields');
    try {
      const note = await tripsAPI.addNote({ tripId: id, ...form });
      setNotes(n => [note, ...n]);
      setForm({ title: '', content: '' });
      setShowForm(false);
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const saveEdit = async (noteId) => {
    try {
      const updated = await tripsAPI.updateNote(noteId, editing);
      setNotes(n => n.map(x => x.id === noteId ? updated : x));
      setEditing(null);
      toast.success('Note updated');
    } catch { toast.error('Failed to update'); }
  };

  const deleteNote = async noteId => {
    if (!confirm('Delete this note?')) return;
    try {
      await tripsAPI.deleteNote(noteId);
      setNotes(n => n.filter(x => x.id !== noteId));
      toast.success('Note deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Loading notes…</div>;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: '#1a1a1a' }}>📝 Trip Notes</h1>
        <button onClick={() => setShowForm(s => !s)} style={{ padding: '10px 20px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
          {showForm ? '✕ Cancel' : '+ Add Note'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 24, marginBottom: 20 }}>
          <form onSubmit={addNote}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Note title…"
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 5 }}>Content</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your note…" rows={4}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', resize: 'vertical' }} />
            </div>
            <button type="submit" style={{ padding: '10px 24px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}>Save Note</button>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p>No notes yet. Add your first note!</p>
        </div>
      ) : (
        notes.map(note => (
          <div key={note.id} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', padding: 20, marginBottom: 14 }}>
            {editing?.id === note.id ? (
              <div>
                <input value={editing.title} onChange={e => setEditing(x => ({ ...x, title: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #1D9E75', borderRadius: 8, fontSize: 15, fontWeight: 700, outline: 'none', marginBottom: 10, boxSizing: 'border-box' }} />
                <textarea value={editing.content} onChange={e => setEditing(x => ({ ...x, content: e.target.value }))} rows={4}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #e0e0e0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 10 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => saveEdit(note.id)} style={{ padding: '8px 18px', background: '#1D9E75', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Save</button>
                  <button onClick={() => setEditing(null)} style={{ padding: '8px 18px', background: '#f0f0f0', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{note.title}</h3>
                    <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>{new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginLeft: 12 }}>
                    <button onClick={() => setEditing({ id: note.id, title: note.title, content: note.content })}
                      style={{ background: '#f0f0f0', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                    <button onClick={() => deleteNote(note.id)}
                      style={{ background: '#fff0f0', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12, color: '#e53e3e' }}>🗑️</button>
                    <button onClick={() => setExpanded(ex => ({ ...ex, [note.id]: !ex[note.id] }))}
                      style={{ background: '#f8f8f8', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>
                      {expanded[note.id] ? '▲' : '▼'}
                    </button>
                  </div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: 13, color: '#555', lineHeight: 1.6, display: expanded[note.id] ? 'block' : '-webkit-box', WebkitLineClamp: expanded[note.id] ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: expanded[note.id] ? 'visible' : 'hidden' }}>
                  {note.content}
                </p>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
