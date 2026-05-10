import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { N, card, cardSm, btn, btnPrimary, input, label } from '../neu';

export default function Notes() {
  const { id } = useParams();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState(null);
  const [focused, setFocused] = useState(null);
  const [hovered, setHovered] = useState(null);

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

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: N.muted, fontFamily: N.font, fontWeight: 600 }}>Loading notes…</div>;

  const inp = (name) => ({
    ...input,
    boxShadow: focused === name ? N.shadowInsetDeep : N.shadowInset,
  });

  return (
    <div style={{ fontFamily: N.font, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 900, color: N.fg, fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>Trip Notes</h1>
          <p style={{ margin: 0, fontSize: 13, color: N.muted, fontWeight: 600 }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} style={{ ...(showForm ? btn : btnPrimary), padding: '10px 24px', minHeight: 'auto', fontSize: 13 }}>
          {showForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, padding: 28, marginBottom: 28 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>New Note</h3>
          <form onSubmit={addNote}>
            <div style={{ marginBottom: 16 }}>
              <label style={label}>Title</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Note title…"
                onFocus={() => setFocused('title')} onBlur={() => setFocused(null)}
                style={inp('title')} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={label}>Content</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your note here…" rows={5}
                onFocus={() => setFocused('content')} onBlur={() => setFocused(null)}
                style={{ ...inp('content'), resize: 'vertical' }} />
            </div>
            <button type="submit" style={{ ...btnPrimary, padding: '12px 28px', minHeight: 'auto' }}>Save Note</button>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div style={{ ...card, padding: '64px 32px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: N.bg, boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: N.accent, fontSize: 32, fontWeight: 900, fontFamily: N.fontDisplay }}>N</div>
          <h2 style={{ margin: '0 0 8px', fontFamily: N.fontDisplay, fontSize: 20, color: N.fg }}>No notes yet</h2>
          <p style={{ color: N.muted, fontSize: 14, fontWeight: 600, margin: 0 }}>Add your first note to keep track of important details.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {notes.map((note, idx) => (
            <div
              key={note.id}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{ ...cardSm, padding: 24, boxShadow: hovered === idx ? N.shadowHover : N.shadow, transform: hovered === idx ? 'translateY(-1px)' : 'none', transition: N.transition }}
            >
              {editing?.id === note.id ? (
                <div>
                  <label style={label}>Title</label>
                  <input value={editing.title} onChange={e => setEditing(x => ({ ...x, title: e.target.value }))}
                    onFocus={() => setFocused('etitle')} onBlur={() => setFocused(null)}
                    style={{ ...inp('etitle'), marginBottom: 14 }} />
                  <label style={label}>Content</label>
                  <textarea value={editing.content} onChange={e => setEditing(x => ({ ...x, content: e.target.value }))} rows={5}
                    onFocus={() => setFocused('econtent')} onBlur={() => setFocused(null)}
                    style={{ ...inp('econtent'), resize: 'vertical', marginBottom: 16 }} />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button onClick={() => saveEdit(note.id)} style={{ ...btnPrimary, padding: '10px 24px', minHeight: 'auto', fontSize: 13 }}>Save</button>
                    <button onClick={() => setEditing(null)} style={{ ...btn, padding: '10px 24px', minHeight: 'auto', fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>{note.title}</h3>
                      <p style={{ margin: 0, fontSize: 11, color: N.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginLeft: 16 }}>
                      <button
                        onClick={() => setEditing({ id: note.id, title: note.title, content: note.content })}
                        style={{ ...btn, padding: '8px 14px', minHeight: 'auto', fontSize: 12, color: N.accentSecondary }}
                      >Edit</button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        style={{ ...btn, padding: '8px 14px', minHeight: 'auto', fontSize: 12, color: N.danger }}
                      >Delete</button>
                      <button
                        onClick={() => setExpanded(ex => ({ ...ex, [note.id]: !ex[note.id] }))}
                        style={{ ...btn, padding: '8px 14px', minHeight: 'auto', fontSize: 12, color: N.muted, fontWeight: 900 }}
                      >{expanded[note.id] ? '▲' : '▼'}</button>
                    </div>
                  </div>

                  {/* Content preview / expanded — inset well */}
                  <div style={{ background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusInner, padding: 16 }}>
                    <p style={{ margin: 0, fontSize: 14, color: N.muted, lineHeight: 1.7, fontWeight: 500, display: expanded[note.id] ? 'block' : '-webkit-box', WebkitLineClamp: expanded[note.id] ? 'unset' : 2, WebkitBoxOrient: 'vertical', overflow: expanded[note.id] ? 'visible' : 'hidden' }}>
                      {note.content}
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
