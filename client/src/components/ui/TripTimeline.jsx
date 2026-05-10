import { useState } from 'react';
import { N, cardSm, card } from '../../neu';

const TYPE_COLORS = {
  SIGHTSEEING: N.accent,
  FOOD: N.warning,
  ADVENTURE: N.danger,
  TRANSPORT: N.muted,
  ACCOMMODATION: '#8B5CF6',
  SHOPPING: '#DB2777',
  OTHER: N.accentSecondary,
};

const TYPE_LABELS = {
  SIGHTSEEING: 'Sightseeing',
  FOOD: 'Food',
  ADVENTURE: 'Adventure',
  TRANSPORT: 'Transport',
  ACCOMMODATION: 'Accommodation',
  SHOPPING: 'Shopping',
  OTHER: 'Other'
};

function ActivityItem({ activity }) {
  const [showPopup, setShowPopup] = useState(false);
  const color = TYPE_COLORS[activity.type] || TYPE_COLORS.OTHER;

  return (
    <div 
      style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '12px 14px', borderBottom: `1px dashed rgb(163,177,198,0.3)`, cursor: 'pointer', transition: N.transition }}
      onClick={(e) => { e.stopPropagation(); setShowPopup(!showPopup); }}
    >
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, marginRight: 14, flexShrink: 0, boxShadow: `0 0 0 2px ${N.bg}, 0 0 0 4px ${color}33` }}></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: N.fg }}>{activity.name}</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: activity.cost > 0 ? N.fg : N.muted }}>{activity.cost > 0 ? `₹${activity.cost}` : 'Free'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 10, background: N.bg, boxShadow: N.shadowInsetSm, color: color, padding: '3px 8px', borderRadius: N.radiusPill, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5 }}>{TYPE_LABELS[activity.type] || 'Other'}</span>
          {activity.duration && <span style={{ fontSize: 12, color: N.muted, fontWeight: 600 }}>{activity.duration}m</span>}
          {activity.date && <span style={{ fontSize: 12, color: N.muted }}>{new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
        </div>
      </div>
      
      {showPopup && (
        <div style={{
          position: 'absolute', top: '100%', left: 26, right: 0, zIndex: 10,
          background: N.bg, padding: 14, borderRadius: N.radiusInner, boxShadow: N.shadow,
          border: `1px solid ${color}44`, marginTop: 6, fontFamily: N.font
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: N.fg }}>{activity.name}</div>
          {activity.notes && <div style={{ fontSize: 12, color: N.muted, marginBottom: 10, lineHeight: 1.5 }}>{activity.notes}</div>}
          <div style={{ fontSize: 12, color: N.muted, display: 'flex', gap: 12, fontWeight: 600 }}>
            <span>{activity.cost > 0 ? `₹${activity.cost}` : 'Free'}</span>
            <span>{activity.duration} min</span>
            {activity.date && <span>{new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function StopNode({ stop, isLast, index }) {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div style={{ display: 'flex', position: 'relative', marginBottom: isLast ? 0 : 24 }}>
      {/* Timeline track line - Inset groove */}
      {!isLast && (
        <div style={{ position: 'absolute', left: 23, top: 48, bottom: -24, width: 4, background: N.bg, boxShadow: N.shadowInsetDeep, zIndex: 1, borderRadius: 2 }} />
      )}

      {/* Stop Marker - Extruded Circle */}
      <div style={{ 
        flexShrink: 0, width: 48, height: 48, borderRadius: '50%', background: N.bg, boxShadow: N.shadowSm, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, zIndex: 2, 
        color: N.accent, fontFamily: N.fontDisplay, border: `2px solid ${N.bg}`
      }}>
        {index + 1}
      </div>

      {/* Stop Content - Extruded Card */}
      <div style={{ flex: 1, marginLeft: 20, ...card, padding: 0, overflow: 'hidden' }}>
        {/* Stop Header (Clickable) */}
        <div 
          style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: N.bg, borderBottom: expanded ? `1px solid rgb(163,177,198,0.2)` : 'none' }}
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <h3 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 800, color: N.fg, fontFamily: N.fontDisplay }}>{stop.city}, {stop.country}</h3>
            <div style={{ fontSize: 12, color: N.muted, fontWeight: 500 }}>
              {new Date(stop.startDate).toLocaleDateString()} → {new Date(stop.endDate).toLocaleDateString()}
            </div>
          </div>
          <div style={{ color: N.accent, fontWeight: 900, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
            ▼
          </div>
        </div>

        {/* Activities List (Expandable) - Inset Well */}
        <div style={{ maxHeight: expanded ? 2000 : 0, overflow: 'hidden', transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)', background: N.bg }}>
          <div style={{ padding: '10px 20px 20px', boxShadow: N.shadowInsetSm, margin: '0 10px 10px', borderRadius: N.radiusInner }}>
            {stop.activities && stop.activities.length > 0 ? (
              stop.activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div style={{ padding: '20px 0', color: N.muted, fontSize: 13, textAlign: 'center', fontWeight: 600 }}>No activities planned yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TripTimeline({ trip }) {
  if (!trip) return null;

  const stops = trip.stops || [];
  
  // Progress calculations
  const totalDays = Math.max(1, Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)));
  const now = new Date();
  let daysPassed = 0;
  if (now > new Date(trip.endDate)) {
    daysPassed = totalDays;
  } else if (now > new Date(trip.startDate)) {
    daysPassed = Math.ceil((now - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));
  }
  const progressPct = Math.min((daysPassed / totalDays) * 100, 100);

  // Totals calculations
  let totalActivities = 0;
  let totalEstimatedCost = 0;
  stops.forEach(s => {
    totalActivities += s.activities?.length || 0;
    totalEstimatedCost += s.activities?.reduce((sum, a) => sum + (a.cost || 0), 0) || 0;
  });
  const citiesVisited = stops.length;

  return (
    <div style={{ fontFamily: N.font }}>
      
      {/* Progress Bar - Extruded Card */}
      <div style={{ ...cardSm, marginBottom: 28, padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: N.muted, marginBottom: 12 }}>
          <span>Total: {totalDays} Days</span>
          <span>Remaining: {totalDays - daysPassed} Days</span>
        </div>
        {/* Inset track */}
        <div style={{ height: 8, background: N.bg, boxShadow: N.shadowInsetSm, borderRadius: N.radiusPill, overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: N.accentSecondary, borderRadius: N.radiusPill, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
        </div>
        {trip.status === 'ONGOING' && <div style={{ fontSize: 12, color: N.accentSecondary, fontWeight: 800, marginTop: 12, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>◆ Trip Ongoing: Day {daysPassed} of {totalDays}</div>}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 30, padding: '0 10px' }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 0 3px ${color}22` }}></div>
            <span style={{ fontSize: 11, color: N.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{TYPE_LABELS[type]}</span>
          </div>
        ))}
      </div>

      {/* Timeline Nodes */}
      <div style={{ position: 'relative', paddingLeft: 10 }}>
        {stops.map((stop, index) => (
          <StopNode key={stop.id} stop={stop} index={index} isLast={index === stops.length - 1} />
        ))}
      </div>

      {/* Totals Summary - Extruded Chips */}
      <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
        {[
          { label: 'Cities', value: citiesVisited, color: N.fg },
          { label: 'Activities', value: totalActivities, color: N.fg },
          { label: 'Est. Cost', value: `₹${totalEstimatedCost.toLocaleString()}`, color: N.accent }
        ].map((stat, i) => (
          <div key={i} style={{ ...cardSm, flex: 1, padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: stat.color, fontFamily: N.fontDisplay }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: N.muted, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
