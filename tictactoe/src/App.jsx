import React, { useState, useEffect } from "react";
import { ToastProvider, useToast } from "./components/common/Toast";
import Confetti from "./components/common/Confetti";
import SoundToggle from "./components/audio/SoundToggle";
import Board from "./components/board/Board";
import PlayerCard from "./components/game/PlayerCard";
import GameOverModal from "./components/game/GameOverModal";
import DisconnectBanner from "./components/game/DisconnectBanner";
import ChatDrawer from "./components/chat/ChatDrawer";
import { QuickReactionsBar, FloatingReactionOverlay } from "./components/chat/QuickReactions";
import ModeSelector from "./components/lobby/ModeSelector";
import MatchmakingModal from "./components/lobby/MatchmakingModal";
import PrivateRoomModal from "./components/lobby/PrivateRoomModal";
import LocalSetupModal from "./components/lobby/LocalSetupModal";
import useGameSocket from "./hooks/useGameSocket";
import useLocalGame from "./hooks/useLocalGame";
import { FiArrowLeft, FiMessageCircle, FiCopy, FiCheck, FiRotateCcw, FiZap, FiLock, FiUsers } from "react-icons/fi";

const AppContent = () => {
  const { addToast } = useToast();

  // Anonymous display name stored in localStorage
  const [playerName, setPlayerName] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("tictactoe_playerName") || "Player";
    }
    return "Player";
  });

  const handleNameChange = (name) => {
    setPlayerName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem("tictactoe_playerName", name);
    }
  };

  // View state: 'lobby' | 'online_game' | 'local_game'
  const [currentView, setCurrentView] = useState("lobby");
  const [showPrivateModal, setShowPrivateModal] = useState(false);
  const [showLocalModal, setShowLocalModal] = useState(false);
  const [localPlayers, setLocalPlayers] = useState({ p1: "Player 1", p2: "Player 2" });
  const [codeCopied, setCodeCopied] = useState(false);

  // Online multiplayer socket hook
  const socketGame = useGameSocket(playerName);

  // Local offline game hook
  const localGame = useLocalGame(localPlayers.p1, localPlayers.p2);

  // Transition to game view when an online match begins
  useEffect(() => {
    if (socketGame.isGameActive) {
      setCurrentView("online_game");
      setShowPrivateModal(false);
    }
  }, [socketGame.isGameActive]);

  // Handle Mode Selection
  const handleSelectMode = (mode) => {
    if (mode === "global") {
      // 100% automatic matchmaking queue: NO room code generated or asked
      socketGame.startMatchmaking(playerName);
    } else if (mode === "private") {
      // Private room mode: ONLY place where room IDs exist
      setShowPrivateModal(true);
    } else if (mode === "local") {
      // Local Pass & Play: 100% offline, same device
      setShowLocalModal(true);
    }
  };

  // Start local match
  const handleStartLocalMatch = ({ player1, player2 }) => {
    setLocalPlayers({ p1: player1, p2: player2 });
    localGame.resetAll();
    setShowLocalModal(false);
    setCurrentView("local_game");
  };

  // Copy private room code (ONLY available for private rooms)
  const handleCopyRoomCode = () => {
    if (!socketGame.roomCode) return;
    navigator.clipboard.writeText(socketGame.roomCode);
    setCodeCopied(true);
    addToast(`Room code ${socketGame.roomCode} copied!`, "success");
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // Leave active online game
  const handleLeaveOnline = () => {
    socketGame.leaveMatch();
    setCurrentView("lobby");
  };

  // Leave active local game
  const handleLeaveLocal = () => {
    setCurrentView("lobby");
  };

  const isOnlineVictory =
    socketGame.winner === socketGame.mySymbol || socketGame.finishReason === "opponent_abandoned";
  const isLocalVictory = Boolean(localGame.winner);

  return (
    <div className="relative w-full h-full h-[100dvh] max-h-screen max-h-[100dvh] overflow-hidden flex flex-col justify-between p-2 sm:p-3 select-none">
      {/* Celebration Confetti */}
      <Confetti
        active={
          (currentView === "online_game" && isOnlineVictory) ||
          (currentView === "local_game" && isLocalVictory)
        }
      />

      {/* Floating Reaction Overlay during Online Matches */}
      {currentView === "online_game" && (
        <FloatingReactionOverlay reactions={socketGame.activeReactions} />
      )}

      {/* ========================================================================= */}
      {/* 1. TOP HEADER NAVIGATION */}
      {/* ========================================================================= */}
      <header className="w-full max-w-3xl mx-auto flex items-center justify-between gap-3 shrink-0 z-20">
        {currentView !== "lobby" ? (
          <button
            onClick={currentView === "online_game" ? handleLeaveOnline : handleLeaveLocal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl btn-pastel-ghost text-xs sm:text-sm font-bold"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Menu</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-pink-400 to-purple-400 text-white font-black text-xs flex items-center justify-center shadow-xs">
              XO
            </div>
            <span className="font-black text-slate-800 text-sm tracking-wide">
              Tic-Tac-Toe
            </span>
          </div>
        )}

        {/* Center Mode Indicator */}
        {currentView === "online_game" && (
          socketGame.isPrivate ? (
            /* PRIVATE ROOM: Show Room Code with 1-click Copy */
            <button
              onClick={handleCopyRoomCode}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-300 text-pink-700 text-xs font-mono font-bold hover:border-pink-400 transition-colors shadow-xs"
              title="Click to copy room code"
            >
              <FiLock className="w-3.5 h-3.5 text-pink-500" />
              <span>ROOM: {socketGame.roomCode}</span>
              {codeCopied ? <FiCheck className="w-3.5 h-3.5 text-emerald-500" /> : <FiCopy className="w-3.5 h-3.5" />}
            </button>
          ) : (
            /* GLOBAL MATCHMAKING: Pure match badge - ZERO ROOM CODE */
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-black shadow-xs">
              <FiZap className="w-3.5 h-3.5 text-sky-500" />
              <span>Quick Match</span>
            </div>
          )
        )}

        {currentView === "local_game" && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 border border-yellow-200 text-amber-800 text-xs font-black shadow-xs">
            <FiUsers className="w-3.5 h-3.5 text-amber-600" />
            <span>Pass & Play</span>
          </div>
        )}

        {/* Right Controls: Sound Toggle */}
        <div className="flex items-center gap-2">
          <SoundToggle />
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN VIEW CONTENT (SINGLE SCREEN - NO OVERFLOW) */}
      {/* ========================================================================= */}
      <main className="flex-1 min-h-0 flex flex-col items-center justify-center w-full max-w-3xl mx-auto z-10 overflow-hidden py-0.5">
        {/* VIEW A: LOBBY & BENTO MODE SELECTOR */}
        {currentView === "lobby" && (
          <ModeSelector
            playerName={playerName}
            onChangePlayerName={handleNameChange}
            onSelectMode={handleSelectMode}
            serverStatus={socketGame.isConnected ? "connected" : "reconnecting"}
          />
        )}

        {/* VIEW B: ONLINE REAL-TIME GAME */}
        {currentView === "online_game" && (
          <div className="w-full flex flex-col items-center gap-2 sm:gap-2.5 animate-fade-in">
            {/* Disconnect Grace Period Countdown */}
            {socketGame.disconnectWarning && (
              <DisconnectBanner
                playerName={socketGame.disconnectWarning.playerName}
                gracePeriodMs={socketGame.disconnectWarning.gracePeriodMs}
                onLeave={handleLeaveOnline}
              />
            )}

            {/* Players Status Cards */}
            <div className="w-full max-w-[300px] sm:max-w-[330px] flex items-center justify-between gap-2">
              <PlayerCard
                name={playerName}
                symbol={socketGame.mySymbol || "X"}
                isCurrentTurn={socketGame.turn === socketGame.mySymbol}
                isYou={true}
                connected={true}
                turnDeadline={socketGame.turnDeadline}
              />

              <div className="text-slate-400 font-black text-[11px] uppercase px-1">
                VS
              </div>

              <PlayerCard
                name={socketGame.opponentName}
                symbol={socketGame.mySymbol === "X" ? "O" : "X"}
                isCurrentTurn={socketGame.turn !== socketGame.mySymbol}
                isYou={false}
                connected={socketGame.opponentConnected}
                turnDeadline={socketGame.turnDeadline}
              />
            </div>

            {/* Tactile 3x3 Board with animated winning cross */}
            <Board
              board={socketGame.board}
              onCellClick={socketGame.makeMove}
              winningLine={socketGame.winningLine}
              winner={socketGame.winner}
              lastMove={socketGame.lastMove}
              isMyTurn={socketGame.isMyTurn}
              mySymbol={socketGame.mySymbol}
              isGameFinished={socketGame.isGameFinished}
            />

            {/* Quick Reactions Bar & Chat Toggle */}
            <div className="w-full max-w-[300px] sm:max-w-[330px] flex items-center justify-between gap-2 mt-0.5">
              <div className="flex-1 overflow-x-auto no-scrollbar">
                <QuickReactionsBar
                  onSendReaction={socketGame.sendReaction}
                  disabled={socketGame.isGameFinished}
                />
              </div>

              <button
                type="button"
                onClick={socketGame.openChat}
                className="relative p-2 sm:p-2.5 rounded-2xl bg-white hover:bg-pink-50 border-2 border-pink-100 text-pink-600 transition-all shadow-xs active:scale-95 shrink-0"
                aria-label="Open Match Chat"
              >
                <FiMessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
                {socketGame.unreadChatCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center animate-bounce shadow-xs">
                    {socketGame.unreadChatCount}
                  </span>
                )}
              </button>
            </div>

            {/* In-Game Chat Drawer */}
            <ChatDrawer
              isOpen={socketGame.isChatOpen}
              onClose={socketGame.closeChat}
              messages={socketGame.messages}
              onSendMessage={socketGame.sendMessage}
              myPlayerId={socketGame.myPlayerId}
              mySymbol={socketGame.mySymbol}
            />

            {/* Game Over Modal (Rematch Disabled if Opponent Left) */}
            {socketGame.isGameFinished && (
              <GameOverModal
                winner={socketGame.winner}
                isDraw={socketGame.winner === "draw"}
                isOnline={true}
                mySymbol={socketGame.mySymbol}
                reason={socketGame.finishReason || "completed"}
                rematchState={socketGame.rematchState}
                opponentName={socketGame.opponentName}
                opponentLeft={socketGame.opponentLeft}
                onRequestRematch={socketGame.requestRematch}
                onAcceptRematch={socketGame.acceptRematch}
                onDeclineRematch={socketGame.declineRematch}
                onReturnToLobby={handleLeaveOnline}
              />
            )}
          </div>
        )}

        {/* VIEW C: LOCAL 2-PLAYER MATCH */}
        {currentView === "local_game" && (
          <div className="w-full flex flex-col items-center gap-2 sm:gap-2.5 animate-fade-in">
            {/* Local Player Cards */}
            <div className="w-full max-w-[300px] sm:max-w-[330px] flex items-center justify-between gap-2">
              <PlayerCard
                name={localPlayers.p1}
                symbol="X"
                isCurrentTurn={localGame.turn === "X"}
                isYou={false}
                connected={true}
              />

              <div className="text-slate-400 font-black text-[11px] uppercase px-1">
                VS
              </div>

              <PlayerCard
                name={localPlayers.p2}
                symbol="O"
                isCurrentTurn={localGame.turn === "O"}
                isYou={false}
                connected={true}
              />
            </div>

            {/* Tactile 3x3 Board */}
            <Board
              board={localGame.board}
              onCellClick={localGame.makeMove}
              winningLine={localGame.winningLine}
              winner={localGame.winner}
              lastMove={localGame.lastMove}
              isMyTurn={!localGame.isGameFinished}
              mySymbol={localGame.turn}
              isGameFinished={localGame.isGameFinished}
            />

            {/* Scores & Controls Bar */}
            <div className="w-full max-w-[300px] sm:max-w-[330px] flex items-center justify-between gap-3 px-3.5 py-1.5 rounded-2xl bg-white border-2 border-yellow-100 shadow-xs text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-sky-600">
                  {localPlayers.p1}: {localGame.scores.xWins}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-600">
                  Draws: {localGame.scores.draws}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-pink-600">
                  {localPlayers.p2}: {localGame.scores.oWins}
                </span>
              </div>

              <button
                onClick={localGame.nextRound}
                className="p-1.5 rounded-xl hover:bg-yellow-50 text-slate-500 hover:text-amber-700 transition-colors"
                title="Restart Round"
              >
                <FiRotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Local Game Over Modal */}
            {localGame.isGameFinished && (
              <GameOverModal
                winner={localGame.winner}
                isDraw={localGame.isDraw}
                isOnline={false}
                winnerName={localGame.winner === "X" ? localPlayers.p1 : localPlayers.p2}
                localScore={localGame.scores}
                onRequestRematch={localGame.nextRound}
                onReturnToLobby={handleLeaveLocal}
              />
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 3. MODALS */}
      {/* ========================================================================= */}
      {/* Global Matchmaking Modal (AUTOMATIC - ZERO ROOM CODES) */}
      <MatchmakingModal
        isOpen={socketGame.isSearching}
        playerName={playerName}
        onCancel={socketGame.cancelMatchmaking}
      />

      {/* Private Room Modal (ROOM CODES ONLY) */}
      <PrivateRoomModal
        isOpen={showPrivateModal}
        onClose={() => {
          socketGame.cancelPrivateRoom();
          setShowPrivateModal(false);
        }}
        playerName={playerName}
        createdRoomCode={socketGame.createdRoomCode}
        isWaitingHost={socketGame.isWaitingHost}
        onCreateRoom={() => socketGame.createPrivateRoom(playerName)}
        onJoinRoom={(code) => socketGame.joinPrivateRoom(code, playerName)}
        onCancelRoom={socketGame.cancelPrivateRoom}
        roomError={socketGame.roomError}
      />

      {/* Local Pass & Play Setup Modal */}
      <LocalSetupModal
        isOpen={showLocalModal}
        onClose={() => setShowLocalModal(false)}
        onStartLocalMatch={handleStartLocalMatch}
      />

      {/* Footer Branding (Compact) */}
      <footer className="w-full max-w-3xl mx-auto text-center py-0.5 text-[11px] text-slate-400 font-semibold shrink-0">
        Anonymous Real-Time Multiplayer • No Accounts Required • Ephemeral
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
