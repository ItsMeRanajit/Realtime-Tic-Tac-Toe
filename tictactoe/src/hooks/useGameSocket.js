import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket, connectSocket, disconnectSocket } from "../services/socket";
import { sound } from "../services/audioService";
import { useToast } from "../components/common/Toast";

export const useGameSocket = (playerName = "Player") => {
  const { addToast } = useToast();
  const socketRef = useRef(null);

  // Connection & Matchmaking State
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isWaitingHost, setIsWaitingHost] = useState(false);
  const [createdRoomCode, setCreatedRoomCode] = useState(null);
  const [roomError, setRoomError] = useState(null);

  // Active Match State
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [mySymbol, setMySymbol] = useState(null);
  const [opponentName, setOpponentName] = useState("Opponent");
  const [opponentConnected, setOpponentConnected] = useState(true);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [starter, setStarter] = useState("X");
  const [turnDeadline, setTurnDeadline] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [finishReason, setFinishReason] = useState(null); // 'completed' | 'timeout' | 'opponent_abandoned'
  const [disconnectWarning, setDisconnectWarning] = useState(null);

  // Rematch State
  const [rematchState, setRematchState] = useState("idle"); // 'idle' | 'requested_by_me' | 'requested_by_opponent'

  // Chat & Reaction State
  const [messages, setMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeReactions, setActiveReactions] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Initialize socket on mount
  useEffect(() => {
    const socket = connectSocket();
    socketRef.current = socket;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (socket.connected) {
      setIsConnected(true);
    }

    // Matchmaking events
    socket.on("matchmaking:waiting", () => {
      setIsSearching(true);
    });

    socket.on("matchmaking:canceled", () => {
      setIsSearching(false);
    });

    // Room events
    socket.on("room:created", (data) => {
      setCreatedRoomCode(data.roomCode);
      setIsWaitingHost(true);
      setRoomError(null);
    });

    socket.on("room:error", (data) => {
      setRoomError(data.message);
      addToast(data.message, "error");
    });

    // Game lifecycle events
    socket.on("game:match_start", (data) => {
      setRoomCode(data.roomCode);
      setIsPrivate(Boolean(data.isPrivate));
      setBoard(data.board);
      setTurn(data.turn);
      setStarter(data.starter);
      setTurnDeadline(data.turnDeadline);
      setLastMove(null);
      setWinner(null);
      setWinningLine(null);
      setFinishReason(null);
      setDisconnectWarning(null);
      setOpponentLeft(false);
      setRematchState("idle");
      setMessages([]);
      setUnreadChatCount(0);
      setIsSearching(false);
      setIsWaitingHost(false);
      setIsGameActive(true);

      const me = data.players.find((p) => p.socketId === socket.id);
      const opp = data.players.find((p) => p.socketId !== socket.id);

      if (me) setMySymbol(me.symbol);
      if (opp) {
        setOpponentName(opp.playerName);
        setOpponentConnected(true);
      }

      sound.playMatchFound();
      addToast(`Match started vs ${opp ? opp.playerName : "Opponent"}!`, "info");
    });

    socket.on("game:state_update", (data) => {
      setBoard(data.board);
      setTurn(data.turn);
      setLastMove(data.lastMove);
      setTurnDeadline(data.turnDeadline);

      if (data.lastMove) {
        sound.playMove(data.lastMove.symbol);
      }
    });

    socket.on("game:finish", (data) => {
      setBoard(data.board);
      setLastMove(data.lastMove);
      setWinner(data.winner);
      setWinningLine(data.winningLine);
      setFinishReason(data.reason);
      setTurnDeadline(null);

      // Play appropriate ending sound
      const currentSocket = socketRef.current;
      const myCurrentSymbol = mySymbol;

      if (data.winner === "draw") {
        sound.playDraw();
      } else if (data.winner === myCurrentSymbol) {
        sound.playWin();
      } else {
        sound.playLoss();
      }
    });

    socket.on("game:invalid_move", (data) => {
      addToast(data.reason || "Invalid move", "error", 2000);
    });

    // Rematch events
    socket.on("rematch:waiting_for_opponent", () => {
      setRematchState("requested_by_me");
    });

    socket.on("rematch:requested_by_opponent", (data) => {
      setRematchState("requested_by_opponent");
      addToast(`${data.requesterName} requested a rematch!`, "info");
      sound.playChat();
    });

    socket.on("rematch:start", (data) => {
      setBoard(data.board);
      setTurn(data.turn);
      setStarter(data.starter);
      setTurnDeadline(data.turnDeadline);
      setLastMove(null);
      setWinner(null);
      setWinningLine(null);
      setFinishReason(null);
      setRematchState("idle");

      const me = data.players.find((p) => p.socketId === socket.id);
      if (me) setMySymbol(me.symbol);

      sound.playMatchFound();
      addToast("Rematch started! Symbols swapped.", "success");
    });

    socket.on("rematch:declined", () => {
      setRematchState("idle");
      setOpponentLeft(true);
      addToast("Rematch was declined by opponent.", "info");
    });

    // Chat events
    socket.on("chat:receive", (data) => {
      setMessages((prev) => [...prev, data]);
      sound.playChat();
      if (!isChatOpen && data.senderId !== socket.id) {
        setUnreadChatCount((c) => c + 1);
      }
    });

    socket.on("chat:error", (data) => {
      addToast(data.message, "error");
    });

    // Quick reactions
    socket.on("reaction:receive", (data) => {
      const id = Date.now() + Math.random();
      const x = 30 + Math.random() * 40; // Center range
      const y = 40 + Math.random() * 20;

      setActiveReactions((prev) => [...prev, { ...data, id, x, y }]);
      sound.playReaction();

      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== id));
      }, 1900);
    });

    // Disconnect events
    socket.on("player:disconnected", (data) => {
      setOpponentConnected(false);
      setDisconnectWarning({
        playerName: data.playerName,
        gracePeriodMs: data.gracePeriodMs,
      });
      addToast(`${data.playerName} lost connection!`, "error");
    });

    socket.on("player:abandoned", (data) => {
      setDisconnectWarning(null);
      setOpponentConnected(false);
      setOpponentLeft(true);
      setFinishReason("opponent_abandoned");
      setWinner(mySymbol); // Auto-win
      addToast(data.reason || "Opponent abandoned the game.", "info");
      sound.playWin();
    });

    socket.on("opponent:left", (data) => {
      setOpponentConnected(false);
      setOpponentLeft(true);
      setRematchState("idle");
      addToast(data.reason || "Opponent left the room.", "info");
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("matchmaking:waiting");
      socket.off("matchmaking:canceled");
      socket.off("room:created");
      socket.off("room:error");
      socket.off("game:match_start");
      socket.off("game:state_update");
      socket.off("game:finish");
      socket.off("game:invalid_move");
      socket.off("rematch:waiting_for_opponent");
      socket.off("rematch:requested_by_opponent");
      socket.off("rematch:start");
      socket.off("rematch:declined");
      socket.off("chat:receive");
      socket.off("chat:error");
      socket.off("reaction:receive");
      socket.off("player:disconnected");
      socket.off("player:abandoned");
      socket.off("opponent:left");
    };
  }, [addToast, mySymbol, isChatOpen]);

  // Actions
  const startMatchmaking = useCallback(
    (name) => {
      sound.playClick();
      const socket = socketRef.current || getSocket();
      socket.emit("matchmaking:join", { playerName: name || playerName });
      setIsSearching(true);
    },
    [playerName]
  );

  const cancelMatchmaking = useCallback(() => {
    sound.playClick();
    const socket = socketRef.current;
    if (socket) {
      socket.emit("matchmaking:cancel");
    }
    setIsSearching(false);
  }, []);

  const createPrivateRoom = useCallback(
    (name) => {
      sound.playClick();
      const socket = socketRef.current || getSocket();
      socket.emit("room:create", { playerName: name || playerName });
    },
    [playerName]
  );

  const joinPrivateRoom = useCallback(
    (code, name) => {
      sound.playClick();
      const socket = socketRef.current || getSocket();
      socket.emit("room:join", { roomCode: code, playerName: name || playerName });
    },
    [playerName]
  );

  const cancelPrivateRoom = useCallback(() => {
    sound.playClick();
    const socket = socketRef.current;
    if (socket) {
      socket.emit("room:leave");
    }
    setCreatedRoomCode(null);
    setIsWaitingHost(false);
  }, []);

  const makeMove = useCallback(
    (cellIndex) => {
      const socket = socketRef.current;
      if (!socket || !isGameActive || turn !== mySymbol || board[cellIndex] !== null) {
        return;
      }
      socket.emit("game:move", { cellIndex });
    },
    [isGameActive, turn, mySymbol, board]
  );

  const requestRematch = useCallback(() => {
    if (opponentLeft) return;
    sound.playClick();
    const socket = socketRef.current;
    if (socket) {
      socket.emit("rematch:request");
    }
  }, [opponentLeft]);

  const acceptRematch = useCallback(() => {
    if (opponentLeft) return;
    sound.playClick();
    const socket = socketRef.current;
    if (socket) {
      socket.emit("rematch:request");
    }
  }, [opponentLeft]);

  const declineRematch = useCallback(() => {
    sound.playClick();
    const socket = socketRef.current;
    if (socket) {
      socket.emit("rematch:decline");
    }
    setRematchState("idle");
  }, []);

  const sendMessage = useCallback((msgText) => {
    const socket = socketRef.current;
    if (socket && msgText.trim()) {
      socket.emit("chat:send", { message: msgText.trim() });
    }
  }, []);

  const sendReaction = useCallback((emoji) => {
    const socket = socketRef.current;
    if (socket && emoji) {
      socket.emit("reaction:send", { emoji });
    }
  }, []);

  const leaveMatch = useCallback(() => {
    sound.playClick();
    const socket = socketRef.current;
    if (socket) {
      socket.emit("room:leave");
    }
    setIsGameActive(false);
    setRoomCode(null);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setFinishReason(null);
    setDisconnectWarning(null);
    setRematchState("idle");
    setMessages([]);
  }, []);

  const openChat = () => {
    setIsChatOpen(true);
    setUnreadChatCount(0);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return {
    isConnected,
    isSearching,
    isWaitingHost,
    createdRoomCode,
    roomError,
    isGameActive,
    isPrivate,
    roomCode,
    mySymbol,
    opponentName,
    opponentConnected,
    opponentLeft,
    board,
    turn,
    starter,
    turnDeadline,
    lastMove,
    winner,
    winningLine,
    finishReason,
    disconnectWarning,
    rematchState,
    messages,
    unreadChatCount,
    activeReactions,
    isChatOpen,
    myPlayerId: socketRef.current?.id,
    isMyTurn: turn === mySymbol && !winner && finishReason === null,
    isGameFinished: Boolean(winner !== null || finishReason !== null),
    startMatchmaking,
    cancelMatchmaking,
    createPrivateRoom,
    joinPrivateRoom,
    cancelPrivateRoom,
    makeMove,
    requestRematch,
    acceptRematch,
    declineRematch,
    sendMessage,
    sendReaction,
    leaveMatch,
    openChat,
    closeChat,
  };
};

export default useGameSocket;
