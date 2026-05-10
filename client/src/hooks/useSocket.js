import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useSocket(tripId, { onBudgetUpdate, onViewersUpdate, onActivityAdded, onStopAdded, onUserTyping, user } = {}) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!tripId) return;

    socketRef.current = io('http://localhost:5000');

    // Join with full user context for presence tracking
    socketRef.current.emit('join-trip', {
      tripId,
      userId:   user?.id   || null,
      userName: user?.firstName || 'Guest',
    });

    if (onBudgetUpdate)   socketRef.current.on('budget-updated',      onBudgetUpdate);
    if (onViewersUpdate)  socketRef.current.on('viewers-updated',     onViewersUpdate);
    if (onActivityAdded)  socketRef.current.on('activity-added-live', onActivityAdded);
    if (onStopAdded)      socketRef.current.on('stop-added-live',     onStopAdded);
    if (onUserTyping)     socketRef.current.on('user-typing',         onUserTyping);

    return () => {
      socketRef.current.emit('leave-trip', tripId);
      socketRef.current.disconnect();
    };
  }, [tripId]);

  // Helper: broadcast a newly added activity to other viewers
  const emitActivityAdded = (tripId, activity, stopId, userName) => {
    socketRef.current?.emit('activity-added-live', { tripId, activity, stopId, userName });
  };

  // Helper: broadcast a newly added stop to other viewers
  const emitStopAdded = (tripId, stop, userName) => {
    socketRef.current?.emit('stop-added-live', { tripId, stop, userName });
  };

  // Helper: broadcast typing indicator
  const emitTyping = (tripId, userName) => {
    socketRef.current?.emit('user-typing', { tripId, userName });
  };

  return { socket: socketRef.current, emitActivityAdded, emitStopAdded, emitTyping };
}
