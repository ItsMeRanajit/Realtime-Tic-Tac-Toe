import { createInitialBoard } from './gameLogic.js';
import { GAME_CONFIG } from '../config.js';

// Alphabet without easily confused characters (e.g. 0/O, 1/I)
const ROOM_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.socketToRoom = new Map();
  }

  generateRoomCode() {
    let code = '';
    let attempts = 0;
    do {
      code = '';
      for (let i = 0; i < GAME_CONFIG.ROOM_CODE_LENGTH; i++) {
        const randomIndex = Math.floor(Math.random() * ROOM_CHARACTERS.length);
        code += ROOM_CHARACTERS[randomIndex];
      }
      attempts++;
    } while (this.rooms.has(code) && attempts < 100);
    return code;
  }

  createRoom({ hostSocketId, hostName, isPrivate = true }) {
    // If socket already in a room, leave it first
    this.leaveRoom(hostSocketId);

    const roomCode = this.generateRoomCode();
    // Randomize initial symbol for host
    const hostSymbol = Math.random() < 0.5 ? 'X' : 'O';

    const room = {
      code: roomCode,
      isPrivate,
      players: [
        {
          socketId: hostSocketId,
          playerName: hostName.trim().slice(0, 20) || 'Player 1',
          symbol: hostSymbol,
          connected: true,
        },
      ],
      board: createInitialBoard(),
      turn: 'X', // Standard: X always makes the first move
      starter: 'X',
      status: 'waiting',
      winner: null,
      winningLine: null,
      lastMove: null,
      rematchVotes: new Set(),
      createdAt: Date.now(),
      disconnectTimer: null,
      turnTimer: null,
      turnDeadline: null,
    };

    this.rooms.set(roomCode, room);
    this.socketToRoom.set(hostSocketId, roomCode);
    return room;
  }

  joinRoom({ guestSocketId, guestName, roomCode }) {
    const normalizedCode = roomCode.trim().toUpperCase();
    const room = this.rooms.get(normalizedCode);

    if (!room) {
      return { success: false, error: 'Room not found. Check the code and try again.' };
    }

    if (room.status === 'abandoned') {
      return { success: false, error: 'This room has been abandoned.' };
    }

    if (room.players.length >= 2) {
      return { success: false, error: 'This room is already full.' };
    }

    // Assign opposite symbol of host
    const host = room.players[0];
    const guestSymbol = host.symbol === 'X' ? 'O' : 'X';

    room.players.push({
      socketId: guestSocketId,
      playerName: guestName.trim().slice(0, 20) || 'Player 2',
      symbol: guestSymbol,
      connected: true,
    });

    room.status = 'in_progress';
    this.socketToRoom.set(guestSocketId, normalizedCode);

    return { success: true, room };
  }

  getRoom(roomCode) {
    if (!roomCode) return null;
    return this.rooms.get(roomCode.toUpperCase()) || null;
  }

  getRoomBySocketId(socketId) {
    const roomCode = this.socketToRoom.get(socketId);
    if (!roomCode) return null;
    return this.rooms.get(roomCode) || null;
  }

  getPlayerBySocketId(room, socketId) {
    return room?.players.find((p) => p.socketId === socketId) || null;
  }

  getOpponent(room, socketId) {
    return room?.players.find((p) => p.socketId !== socketId) || null;
  }

  leaveRoom(socketId) {
    const roomCode = this.socketToRoom.get(socketId);
    if (!roomCode) return null;

    const room = this.rooms.get(roomCode);
    this.socketToRoom.delete(socketId);

    if (!room) return null;

    this.clearRoomTimers(room);

    // Filter out departing player
    room.players = room.players.filter((p) => p.socketId !== socketId);

    if (room.players.length === 0) {
      // Room empty, delete it
      this.rooms.delete(roomCode);
      return { roomCode, destroyed: true };
    } else {
      // Remaining player
      room.status = 'abandoned';
      return { roomCode, destroyed: false, remainingPlayer: room.players[0] };
    }
  }

  deleteRoom(roomCode) {
    const room = this.rooms.get(roomCode);
    if (room) {
      this.clearRoomTimers(room);
      for (const player of room.players) {
        this.socketToRoom.delete(player.socketId);
      }
      this.rooms.delete(roomCode);
    }
  }

  resetRoomForRematch(roomCode) {
    const room = this.rooms.get(roomCode);
    if (!room || room.players.length < 2) return null;

    this.clearRoomTimers(room);

    // Swap symbols for next match
    room.players[0].symbol = room.players[0].symbol === 'X' ? 'O' : 'X';
    room.players[1].symbol = room.players[1].symbol === 'X' ? 'O' : 'X';

    room.board = createInitialBoard();
    room.turn = 'X';
    room.starter = 'X';
    room.status = 'in_progress';
    room.winner = null;
    room.winningLine = null;
    room.lastMove = null;
    room.rematchVotes.clear();

    return room;
  }

  clearRoomTimers(room) {
    if (room.disconnectTimer) {
      clearTimeout(room.disconnectTimer);
      room.disconnectTimer = null;
    }
    if (room.turnTimer) {
      clearTimeout(room.turnTimer);
      room.turnTimer = null;
    }
  }

  getActiveStats() {
    let inProgress = 0;
    let waiting = 0;
    for (const room of this.rooms.values()) {
      if (room.status === 'in_progress') inProgress++;
      else if (room.status === 'waiting') waiting++;
    }
    return {
      totalRooms: this.rooms.size,
      inProgress,
      waiting,
      connectedPlayers: this.socketToRoom.size,
    };
  }
}

export const roomManager = new RoomManager();
