import { Server } from 'socket.io';

let ioInstance = null;

export function initSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  });

  ioInstance.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    
    // Join a forum room
    socket.on('forum:join', ({ forumId, userId }) => {
      if (forumId) {
        socket.join(`forum:${forumId}`);
        socket.data.userId = userId;
        socket.data.forumId = forumId;
        console.log(`User ${userId} joined forum:${forumId} (socket: ${socket.id})`);
        socket.emit('forum:joined', { forumId });
      }
    });

    // Leave a forum room
    socket.on('forum:leave', ({ forumId }) => {
      if (forumId) {
        socket.leave(`forum:${forumId}`);
        console.log(`Socket ${socket.id} left forum:${forumId}`);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket ${socket.id} disconnected:`, reason);
      if (socket.data.forumId) {
        console.log(`User was in forum:${socket.data.forumId}`);
      }
    });
  });

  return ioInstance;
}

export function getIO() {
  if (!ioInstance) {
    throw new Error('Socket.io not initialized. Call initSocket(server) first.');
  }
  return ioInstance;
}


