import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { PORT, CLIENT_URL } from './config.js';
import { roomManager } from './src/roomManager.js';
import { matchmakingService } from './src/matchmaking.js';
import { registerSocketHandlers } from './src/socketHandlers.js';

const app = express();

// Enable CORS for express endpoints
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (CLIENT_URL.includes('*') || CLIENT_URL.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/local setups
    },
    methods: ['GET', 'POST'],
    credentials: true,
  })
);

app.use(express.json());

// Health & diagnostics endpoint
app.get('/health', (req, res) => {
  const stats = roomManager.getActiveStats();
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    matchmakingQueueLength: matchmakingService.getQueueLength(),
    rooms: stats,
  });
});

// Root ping endpoint
app.get('/', (req, res) => {
  res.send('Tic-Tac-Toe Realtime Server is active and running.');
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (CLIENT_URL.includes('*') || CLIENT_URL.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 30000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  registerSocketHandlers(io, socket);
});

httpServer.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 Tic-Tac-Toe Server running on port ${PORT}`);
  console.log(`🌐 Allowed CORS: ${JSON.stringify(CLIENT_URL)}`);
  console.log(`🩺 Health check at http://localhost:${PORT}/health`);
  console.log(`========================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully...');
  httpServer.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
