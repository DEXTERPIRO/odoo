import { useState } from 'react';

const TYPE_COLORS = {
  SIGHTSEEING: '#805ad5', // purple
  FOOD: '#d97706',        // amber
  ADVENTURE: '#e53e3e',   // red
  TRANSPORT: '#718096',   // gray
  ACCOMMODATION: '#3182ce',// blue
  SHOPPING: '#d53f8c',    // pink
  OTHER: '#38b2ac',       // teal
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
      style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px dashed #e0e0e0', cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); setShowPopup(!showPopup); }}
    >
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, marginRight: 16, flexShrink: 0, boxShadow: `0 0 0 3px ${color}33` }}></div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#333' }}>{activity.name}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#1D9E75' }}>{activity.cost > 0 ? `$${activity.cost}` : 'Free'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 11, background: `${color}15`, color: color, padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>{TYPE_LABELS[activity.type] || 'Other'}</span>
          {activity.duration && <span style={{ fontSize: 12, color: '#888' }}>⏱ {activity.duration} min</span>}
          {activity.date && <span style={{ fontSize: 12, color: '#888' }}>📅 {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
        </div>
      </div>
      
      {showPopup && (
        <div style={{
          position: 'absolute', top: '100%', left: 26, right: 0, zIndex: 10,
          background: '#fff', padding: 12, borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: `1px solid ${color}44`, marginTop: 4
        }} onClick={(e) => e.stopPropagation()}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{activity.name}</div>
          {activity.notes && <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>{activity.notes}</div>}
          <div style={{ fontSize: 12, color: '#888', display: 'flex', gap: 12 }}>
            <span>💰 {activity.cost > 0 ? `$${activity.cost}` : 'Free'}</span>
            <span>⏱ {activity.duration} min</span>
            {activity.date && <span>🕒 {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function StopNode({ stop, isLast }) {
  const [expanded, setExpanded] = useState(true);
  const initials = stop.city ? stop.city.charAt(0).toUpperCase() : '📍';
  
  return (
    <div style={{ display: 'flex', position: 'relative', marginBottom: isLast ? 0 : 20 }}>
      {/* Timeline track line */}
      {!isLast && (
        <div style={{ position: 'absolute', left: 23, top: 48, bottom: -20, width: 2, background: '#1D9E75', zIndex: 1 }} className="timeline-line">
          <div style={{ position: 'absolute', top: '50%', left: -8, background: '#fff', padding: '2px 0', fontSize: 16, transform: 'translateY(-50%)', color: '#1D9E75' }} title={`To next destination`}>✈️</div>
        </div>
      )}

      {/* Stop Marker */}
      <div style={{ flexShrink: 0, width: 48, height: 48, borderRadius: '50%', background: '#1D9E75', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, zIndex: 2, boxShadow: '0 4px 10px rgba(29, 158, 117, 0.3)' }}>
        {initials}
      </div>

      {/* Stop Content */}
      <div style={{ flex: 1, marginLeft: 20, background: '#fff', borderRadius: 12, border: '1px solid #e0e0e0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        {/* Stop Header (Clickable) */}
        <div 
          style={{ padding: '16px 20px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8faf9' }}
          onClick={() => setExpanded(!expanded)}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{stop.city}, {stop.country}</h3>
            <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
              {new Date(stop.startDate).toLocaleDateString()} → {new Date(stop.endDate).toLocaleDateString()}
            </div>
          </div>
          <div style={{ color: '#888', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</div>
        </div>

        {/* Activities List (Expandable) */}
        <div style={{ maxHeight: expanded ? 2000 : 0, overflow: 'hidden', transition: 'max-height 0.4s ease-in-out' }}>
          <div style={{ padding: '0 20px 10px' }}>
            {stop.activities && stop.activities.length > 0 ? (
              stop.activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            ) : (
              <div style={{ padding: '16px 0', color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>No activities planned yet.</div>
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
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Progress Bar */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 12, border: '1px solid #e0e0e0', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 }}>
          <span>Total: {totalDays} Days</span>
          <span>Remaining: {totalDays - daysPassed} Days</span>
        </div>
        <div style={{ height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${progressPct}%`, height: '100%', background: '#1D9E75', transition: 'width 1s ease-in-out' }}></div>
        </div>
        {trip.status === 'ONGOING' && <div style={{ fontSize: 12, color: '#1D9E75', fontWeight: 600, marginTop: 8, textAlign: 'center' }}>Trip is currently ongoing! Day {daysPassed} of {totalDays}</div>}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24, padding: '0 10px' }}>
        {Object.entries(TYPE_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }}></div>
            <span style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>{TYPE_LABELS[type]}</span>
          </div>
        ))}
      </div>

      {/* Timeline Nodes */}
      <div style={{ position: 'relative', paddingLeft: 10 }}>
        {stops.map((stop, index) => (
          <StopNode key={stop.id} stop={stop} isLast={index === stops.length - 1} />
        ))}
      </div>

      {/* Totals Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#f8faf9', padding: '16px 24px', borderRadius: 12, marginTop: 30, border: '1px solid #e0e0e0' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>{citiesVisited}</div>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Cities</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a' }}>{totalActivities}</div>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Activities</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1D9E75' }}>${totalEstimatedCost.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase' }}>Est. Cost</div>
        </div>
      </div>

    </div>
  );
}
