const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/users',     require('./routes/users'));
app.use('/api/trips',     require('./routes/trips'));
app.use('/api/stops',     require('./routes/stops'));
app.use('/api/activities',require('./routes/activities'));
app.use('/api/expenses',  require('./routes/expenses'));
app.use('/api/budget',    require('./routes/budget'));
app.use('/api/packing',   require('./routes/packing'));
app.use('/api/notes',     require('./routes/notes'));
app.use('/api/community', require('./routes/community'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/ai',        require('./routes/ai'));
app.use('/api/invoice',   require('./routes/invoice'));
app.use('/api/cities',    require('./routes/cities'));
app.use('/api/activity-search', require('./routes/activitySearch'));

// Track who is viewing each trip
const tripViewers = {};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-trip', (data) => {
    // Support both legacy string format and new object format
    const tripId   = typeof data === 'string' ? data : data.tripId;
    const userId   = typeof data === 'object' ? data.userId   : null;
    const userName = typeof data === 'object' ? data.userName : 'Anonymous';

    socket.join(`trip-${tripId}`);
    // Store which trip this socket is watching (for disconnect cleanup)
    socket._watchedTrips = socket._watchedTrips || [];
    if (!socket._watchedTrips.includes(tripId)) socket._watchedTrips.push(tripId);

    if (!tripViewers[tripId]) tripViewers[tripId] = {};
    tripViewers[tripId][socket.id] = { userId, userName };

    io.to(`trip-${tripId}`).emit('viewers-updated',
      Object.values(tripViewers[tripId])
    );
    console.log(`${userName} joined trip ${tripId}`);
  });

  socket.on('leave-trip', (tripId) => {
    socket.leave(`trip-${tripId}`);
    if (tripViewers[tripId]) {
      delete tripViewers[tripId][socket.id];
      io.to(`trip-${tripId}`).emit('viewers-updated',
        Object.values(tripViewers[tripId])
      );
    }
  });

  socket.on('user-typing', (data) => {
    socket.to(`trip-${data.tripId}`).emit('user-typing', data);
  });

  socket.on('activity-added-live', (data) => {
    socket.to(`trip-${data.tripId}`).emit('activity-added-live', data);
  });

  socket.on('stop-added-live', (data) => {
    socket.to(`trip-${data.tripId}`).emit('stop-added-live', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Clean up viewer presence for all trips this socket was watching
    (socket._watchedTrips || []).forEach(tripId => {
      if (tripViewers[tripId] && tripViewers[tripId][socket.id]) {
        delete tripViewers[tripId][socket.id];
        io.to(`trip-${tripId}`).emit('viewers-updated',
          Object.values(tripViewers[tripId])
        );
      }
    });
  });
});

app.set('io', io);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Traveloop API running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Traveloop server running on port ${PORT}`);
});

module.exports = { io };
