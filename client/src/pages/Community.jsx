import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { tripsAPI } from '../api/trips';
import { N, card, btnPrimary, btn, input } from '../neu';

export default function Community() {
  const [posts, setPosts]     = useState([]);
  const [search, setSearch]   = useState('');
  const [sortBy, setSortBy]   = useState('newest');
  const [loading, setLoading] = useState(true);
  const [hover, setHover]     = useState(null);
  const [likeHov, setLikeHov] = useState(null);
  const [cloneHov, setCloneHov] = useState(null);
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    tripsAPI.getCommunity({ sortBy })
      .then(data => setPosts(data || []))
      .catch(() => toast.error('Failed to load posts'))
      .finally(() => setLoading(false));
  }, [sortBy]);

  const handleLike = async post => {
    try {
      const r = await tripsAPI.likePost(post.id);
      setPosts(ps => ps.map(p => p.id === post.id ? { ...p, likesCount: r.likesCount } : p));
    } catch { toast.error('Failed to like'); }
  };

  const handleClone = async tripId => {
    try {
      await tripsAPI.cloneTrip(tripId);
      toast.success('Trip cloned! Check My Trips.');
    } catch { toast.error('Failed to clone trip'); }
  };

  const filtered = posts.filter(p =>
    (p.trip?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.caption || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: N.muted, fontFamily: N.font }}>
      Loading community...
    </div>
  );

  return (
    <div style={{ fontFamily: N.font, color: N.fg }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: '0 0 6px', fontFamily: N.fontDisplay, letterSpacing: -0.5 }}>
          Travel Community
        </h1>
        <p style={{ margin: 0, color: N.muted, fontSize: 14 }}>
          Discover trips shared by fellow travellers
        </p>
      </div>

      {/* Search + Sort */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search trips or destinations..."
          onFocus={() => setFocused('search')} onBlur={() => setFocused(null)}
          style={{ ...input, flex: 1, boxShadow: focused === 'search' ? N.shadowInsetDeep : N.shadowInset }}
        />
        <select
          value={sortBy} onChange={e => setSortBy(e.target.value)}
          onFocus={() => setFocused('sort')} onBlur={() => setFocused(null)}
          style={{
            ...input, width: 'auto', cursor: 'pointer',
            boxShadow: focused === 'sort' ? N.shadowInsetDeep : N.shadowInset,
            paddingRight: 20,
          }}>
          <option value="newest">Newest First</option>
          <option value="likes">Most Liked</option>
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ ...card, padding: '64px 32px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: N.bg,
            boxShadow: N.shadowInsetDeep, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 36, margin: '0 auto 20px',
          }}>◆</div>
          <h2 style={{ margin: '0 0 8px', fontFamily: N.fontDisplay, fontSize: 20 }}>No posts yet</h2>
          <p style={{ color: N.muted, fontSize: 14 }}>Be the first to share a trip with the community!</p>
        </div>
      )}

      {/* Posts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {filtered.map((post, i) => {
          const name    = `${post.user?.firstName || ''} ${post.user?.lastName || ''}`.trim();
          const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
          const cities   = (post.trip?.stops || []).map(s => s.city).slice(0, 4);

          return (
            <div key={post.id}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                ...card,
                padding:   0,
                overflow:  'hidden',
                boxShadow: hover === i ? N.shadowHover : N.shadow,
                transform: hover === i ? 'translateY(-2px)' : 'none',
              }}>

              {/* Banner — neumorphic inset strip */}
              <div style={{
                background: N.bg,
                boxShadow:  N.shadowInset,
                height:     72,
                position:   'relative',
              }}>
                {/* Avatar — extruded circle floating on the banner */}
                <div style={{
                  position:       'absolute',
                  bottom:         -22,
                  left:           24,
                  width:          48,
                  height:         48,
                  borderRadius:   '50%',
                  background:     N.bg,
                  boxShadow:      N.shadow,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  fontFamily:     N.fontDisplay,
                  fontWeight:     800,
                  fontSize:       16,
                  color:          N.accent,
                }}>
                  {initials}
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '30px 24px 22px' }}>
                <div style={{ fontFamily: N.fontDisplay, fontWeight: 700, fontSize: 15, color: N.fg, marginBottom: 2 }}>
                  {name}
                </div>
                <div style={{ fontSize: 12, color: N.accent, fontWeight: 600, marginBottom: 12 }}>
                  {post.trip?.name}
                </div>

                {post.caption && (
                  <p style={{ margin: '0 0 14px', fontSize: 13, color: N.muted, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.caption}
                  </p>
                )}

                {/* City chips */}
                {cities.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {cities.map(c => (
                      <span key={c} style={{
                        background:   N.bg,
                        boxShadow:    N.shadowInsetSm,
                        borderRadius: N.radiusPill,
                        padding:      '4px 12px',
                        fontSize:     11,
                        fontWeight:   700,
                        color:        N.accentSecondary,
                      }}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleLike(post)}
                    onMouseEnter={() => setLikeHov(post.id)}
                    onMouseLeave={() => setLikeHov(null)}
                    style={{
                      ...btn,
                      padding:   '9px 16px',
                      fontSize:  13,
                      color:     likeHov === post.id ? N.warning : N.muted,
                      boxShadow: likeHov === post.id ? N.shadowHover : N.shadowSm,
                      transform: likeHov === post.id ? 'translateY(-1px)' : 'none',
                      minHeight: 'auto',
                      gap:       6,
                    }}>
                    ♥ {post.likesCount || 0}
                  </button>
                  <button onClick={() => handleClone(post.tripId)}
                    onMouseEnter={() => setCloneHov(post.id)}
                    onMouseLeave={() => setCloneHov(null)}
                    style={{
                      ...btnPrimary,
                      flex:      1,
                      padding:   '9px 16px',
                      fontSize:  13,
                      fontWeight: 700,
                      minHeight: 'auto',
                      boxShadow: cloneHov === post.id ? N.shadowHover : N.shadow,
                      transform: cloneHov === post.id ? 'translateY(-1px)' : 'none',
                    }}>
                    Copy Trip →
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
