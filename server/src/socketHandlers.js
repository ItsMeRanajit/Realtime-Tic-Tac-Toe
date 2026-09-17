import { roomManager } from './roomManager.js';
import { matchmakingService } from './matchmaking.js';
import { validateMove, evaluateBoard } from './gameLogic.js';
import { GAME_CONFIG } from '../config.js';

// Chat rate limiter per socket: socketId -> { count, windowStart }
const chatLimitMap = new Map();

function isChatRateLimited(socketId) {
  const now = Date.now();
  const entry = chatLimitMap.get(socketId) || { count: 0, windowStart: now };

  if (now - entry.windowStart > GAME_CONFIG.CHAT_RATE_LIMIT.WINDOW_MS) {
    // Reset window
    entry.count = 1;
    entry.windowStart = now;
    chatLimitMap.set(socketId, entry);
    return false;
  }

  entry.count++;
  chatLimitMap.set(socketId, entry);
  return entry.count > GAME_CONFIG.CHAT_RATE_LIMIT.MAX_MESSAGES;
}

/**
 * Starts the server-authoritative turn timer for an active match.
 */
function startTurnTimer(io, room) {
  if (!room || room.status !== 'in_progress') return;

  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }

  const timeoutMs = GAME_CONFIG.TURN_TIMEOUT_SEC * 1000;
  room.turnDeadline = Date.now() + timeoutMs;

  room.turnTimer = setTimeout(() => {
    // Check if room is still active
    if (room.status !== 'in_progress') return;

    const timedOutPlayer = room.players.find((p) => p.symbol === room.turn);
    const winningPlayer = room.players.find((p) => p.symbol !== room.turn);

    room.status = 'finished';
    room.winner = winningPlayer ? winningPlayer.symbol : null;
    room.winningLine = null;

    io.to(room.code).emit('game:finish', {
      winner: room.winner,
      winningLine: null,
      board: room.board,
      lastMove: room.lastMove,
      reason: 'timeout',
      timedOutPlayerName: timedOutPlayer ? timedOutPlayer.playerName : 'Player',
    });
  }, timeoutMs);
}

export function registerSocketHandlers(io, socket) {
  // -------------------------------------------------------------
  // 1. GLOBAL MATCHMAKING
  // -------------------------------------------------------------
  socket.on('matchmaking:join', (data) => {
    const playerName = data?.playerName || 'Player';
    const result = matchmakingService.addToQueue({
      socketId: socket.id,
      playerName,
    });

    if (result.matched && result.room) {
      const room = result.room;
      // Join both sockets to the Socket.io room channel
      for (const player of room.players) {
        const playerSocket = io.sockets.sockets.get(player.socketId);
        if (playerSocket) {
          playerSocket.join(room.code);
        }
      }

      startTurnTimer(io, room);

      io.to(room.code).emit('game:match_start', {
        roomCode: room.code,
        players: room.players.map((p) => ({
          socketId: p.socketId,
          playerName: p.playerName,
          symbol: p.symbol,
        })),
        board: room.board,
        turn: room.turn,
        starter: room.starter,
        isPrivate: false,
        turnDeadline: room.turnDeadline,
      });
    } else {
      socket.emit('matchmaking:waiting', {
        queueLength: result.queueLength,
      });
    }
  });

  socket.on('matchmaking:cancel', () => {
    matchmakingService.removeFromQueue(socket.id);
    socket.emit('matchmaking:canceled');
  });

  // -------------------------------------------------------------
  // 2. PRIVATE ROOMS
  // -------------------------------------------------------------
  socket.on('room:create', (data) => {
    matchmakingService.removeFromQueue(socket.id);
    const playerName = data?.playerName || 'Host';

    const room = roomManager.createRoom({
      hostSocketId: socket.id,
      hostName: playerName,
      isPrivate: true,
    });

    socket.join(room.code);

    socket.emit('room:created', {
      roomCode: room.code,
      player: room.players[0],
    });
  });

  socket.on('room:join', (data) => {
    matchmakingService.removeFromQueue(socket.id);
    const roomCode = data?.roomCode;
    const playerName = data?.playerName || 'Guest';

    if (!roomCode) {
      socket.emit('room:error', { message: 'Room code is required.' });
      return;
    }

    const joinResult = roomManager.joinRoom({
      guestSocketId: socket.id,
      guestName: playerName,
      roomCode,
    });

    if (!joinResult.success) {
      socket.emit('room:error', { message: joinResult.error });
      return;
    }

    const room = joinResult.room;
    socket.join(room.code);

    startTurnTimer(io, room);

    io.to(room.code).emit('game:match_start', {
      roomCode: room.code,
      players: room.players.map((p) => ({
        socketId: p.socketId,
        playerName: p.playerName,
        symbol: p.symbol,
      })),
      board: room.board,
      turn: room.turn,
      starter: room.starter,
      isPrivate: true,
      turnDeadline: room.turnDeadline,
    });
  });

  // -------------------------------------------------------------
  // 3. GAMEPLAY & MOVES
  // -------------------------------------------------------------
  socket.on('game:move', (data) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) {
      socket.emit('game:error', { message: 'Active game not found.' });
      return;
    }

    const player = roomManager.getPlayerBySocketId(room, socket.id);
    if (!player) {
      socket.emit('game:error', { message: 'Player not recognized in this room.' });
      return;
    }

    const cellIndex = data?.cellIndex;
    const validation = validateMove({
      board: room.board,
      cellIndex,
      playerSymbol: player.symbol,
      currentTurn: room.turn,
      status: room.status,
    });

    if (!validation.valid) {
      socket.emit('game:invalid_move', { reason: validation.reason });
      return;
    }

    // Apply authoritative move
    room.board[cellIndex] = player.symbol;
    room.lastMove = { index: cellIndex, symbol: player.symbol };

    // Clear previous turn timer
    if (room.turnTimer) {
      clearTimeout(room.turnTimer);
      room.turnTimer = null;
    }

    const outcome = evaluateBoard(room.board);

    if (outcome.isFinished) {
      room.status = 'finished';
      room.winner = outcome.winner;
      room.winningLine = outcome.winningLine;

      io.to(room.code).emit('game:finish', {
        winner: outcome.winner,
        winningLine: outcome.winningLine,
        board: room.board,
        lastMove: room.lastMove,
        reason: 'completed',
      });
    } else {
      // Switch turns
      room.turn = room.turn === 'X' ? 'O' : 'X';
      startTurnTimer(io, room);

      io.to(room.code).emit('game:state_update', {
        board: room.board,
        turn: room.turn,
        lastMove: room.lastMove,
        turnDeadline: room.turnDeadline,
      });
    }
  });

  // -------------------------------------------------------------
  // 4. REMATCH
  // -------------------------------------------------------------
  socket.on('rematch:request', () => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room || room.status !== 'finished') {
      socket.emit('opponent:left', { reason: 'Opponent has already left the match.' });
      return;
    }

    const player = roomManager.getPlayerBySocketId(room, socket.id);
    const opponent = roomManager.getOpponent(room, socket.id);
    if (!player || !opponent) {
      socket.emit('opponent:left', { reason: 'Opponent has left the match.' });
      return;
    }

    room.rematchVotes.add(socket.id);

    if (room.rematchVotes.size === 1) {
      socket.emit('rematch:waiting_for_opponent');
      io.to(opponent.socketId).emit('rematch:requested_by_opponent', {
        requesterName: player.playerName,
      });
    } else if (room.rematchVotes.size >= 2) {
      // Both accepted! Reset the board for a new round
      const updatedRoom = roomManager.resetRoomForRematch(room.code);
      if (updatedRoom) {
        startTurnTimer(io, updatedRoom);

        io.to(updatedRoom.code).emit('rematch:start', {
          roomCode: updatedRoom.code,
          players: updatedRoom.players.map((p) => ({
            socketId: p.socketId,
            playerName: p.playerName,
            symbol: p.symbol,
          })),
          board: updatedRoom.board,
          turn: updatedRoom.turn,
          starter: updatedRoom.starter,
          turnDeadline: updatedRoom.turnDeadline,
        });
      }
    }
  });

  socket.on('rematch:decline', () => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const opponent = roomManager.getOpponent(room, socket.id);
    if (opponent) {
      io.to(opponent.socketId).emit('rematch:declined');
    }
    room.rematchVotes.clear();
  });

  // -------------------------------------------------------------
  // 5. IN-GAME CHAT & QUICK REACTIONS
  // -------------------------------------------------------------
  socket.on('chat:send', (data) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const player = roomManager.getPlayerBySocketId(room, socket.id);
    if (!player) return;

    if (isChatRateLimited(socket.id)) {
      socket.emit('chat:error', { message: 'Too many messages. Please slow down.' });
      return;
    }

    const rawMessage = data?.message || '';
    const cleanMessage = String(rawMessage).trim().slice(0, GAME_CONFIG.MAX_CHAT_LENGTH);
    if (!cleanMessage) return;

    io.to(room.code).emit('chat:receive', {
      senderId: socket.id,
      senderName: player.playerName,
      senderSymbol: player.symbol,
      message: cleanMessage,
      timestamp: Date.now(),
    });
  });

  socket.on('reaction:send', (data) => {
    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const player = roomManager.getPlayerBySocketId(room, socket.id);
    if (!player) return;

    const allowedEmojis = ['thumbs-up', 'heart', 'star', 'smile', 'award', 'applause', 'zap', 'GG', 'Nice!', 'Oops'];
    const emoji = String(data?.emoji || '').trim();

    if (allowedEmojis.includes(emoji)) {
      io.to(room.code).emit('reaction:receive', {
        emoji,
        senderSymbol: player.symbol,
        senderName: player.playerName,
      });
    }
  });

  // -------------------------------------------------------------
  // 6. LEAVING & DISCONNECTION
  // -------------------------------------------------------------
  socket.on('room:leave', () => {
    matchmakingService.removeFromQueue(socket.id);
    const room = roomManager.getRoomBySocketId(socket.id);

    if (room) {
      const opponent = roomManager.getOpponent(room, socket.id);
      roomManager.leaveRoom(socket.id);

      if (opponent) {
        io.to(opponent.socketId).emit('opponent:left', {
          reason: 'Opponent left the room.',
        });
      }
    }
  });

  socket.on('disconnect', () => {
    chatLimitMap.delete(socket.id);
    matchmakingService.cleanupDisconnectedSocket(socket.id);

    const room = roomManager.getRoomBySocketId(socket.id);
    if (!room) return;

    const departingPlayer = roomManager.getPlayerBySocketId(room, socket.id);
    const opponent = roomManager.getOpponent(room, socket.id);

    // If waiting in private lobby alone, clean up room
    if (room.status === 'waiting') {
      roomManager.deleteRoom(room.code);
      return;
    }

    // If game in progress, grant grace period
    if (room.status === 'in_progress' && opponent && departingPlayer) {
      departingPlayer.connected = false;

      // Pause turn timer during grace period
      if (room.turnTimer) {
        clearTimeout(room.turnTimer);
        room.turnTimer = null;
      }

      io.to(opponent.socketId).emit('player:disconnected', {
        gracePeriodMs: GAME_CONFIG.DISCONNECT_GRACE_MS,
        playerName: departingPlayer.playerName,
      });

      // Clear any existing disconnect timer
      if (room.disconnectTimer) {
        clearTimeout(room.disconnectTimer);
      }

      room.disconnectTimer = setTimeout(() => {
        if (!departingPlayer.connected) {
          room.status = 'abandoned';
          io.to(opponent.socketId).emit('player:abandoned', {
            reason: `${departingPlayer.playerName} disconnected and did not return.`,
          });
          io.to(opponent.socketId).emit('opponent:left', {
            reason: `${departingPlayer.playerName} disconnected.`,
          });
          roomManager.deleteRoom(room.code);
        }
      }, GAME_CONFIG.DISCONNECT_GRACE_MS);
    } else {
      // Game was finished or abandoned
      roomManager.leaveRoom(socket.id);
      if (opponent) {
        io.to(opponent.socketId).emit('opponent:left', {
          reason: 'Opponent left the room.',
        });
      }
    }
  });
}
