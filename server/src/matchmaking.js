import { roomManager } from './roomManager.js';

class MatchmakingService {
  constructor() {
    this.queue = [];
  }

  addToQueue({ socketId, playerName }) {
    // Prevent duplicate entries for the same socket
    this.removeFromQueue(socketId);

    // Make sure socket leaves any existing room
    roomManager.leaveRoom(socketId);

    const safeName = (playerName || 'Player').trim().slice(0, 20);

    // Check if there is already someone waiting
    if (this.queue.length > 0) {
      const opponent = this.queue.shift();

      // Create a new match room for public play
      const room = roomManager.createRoom({
        hostSocketId: opponent.socketId,
        hostName: opponent.playerName,
        isPrivate: false,
      });

      // Join the second player
      const joinResult = roomManager.joinRoom({
        guestSocketId: socketId,
        guestName: safeName,
        roomCode: room.code,
      });

      if (joinResult.success) {
        return {
          matched: true,
          room: joinResult.room,
        };
      }
    }

    // No opponent available yet; place player in queue
    this.queue.push({
      socketId,
      playerName: safeName,
      joinedAt: Date.now(),
    });

    return {
      matched: false,
      queueLength: this.queue.length,
    };
  }

  removeFromQueue(socketId) {
    const initialLen = this.queue.length;
    this.queue = this.queue.filter((entry) => entry.socketId !== socketId);
    return this.queue.length < initialLen;
  }

  isInQueue(socketId) {
    return this.queue.some((entry) => entry.socketId === socketId);
  }

  cleanupDisconnectedSocket(socketId) {
    return this.removeFromQueue(socketId);
  }

  getQueueLength() {
    return this.queue.length;
  }
}

export const matchmakingService = new MatchmakingService();
