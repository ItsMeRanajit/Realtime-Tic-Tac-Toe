import React from "react";
import { FiAward, FiRotateCcw, FiHome, FiCheck, FiX, FiMinusCircle, FiClock, FiUserX, FiAlertCircle } from "react-icons/fi";

export const GameOverModal = ({
  winner = null,
  isDraw = false,
  isOnline = false,
  mySymbol = null,
  winnerName = null,
  reason = "completed",
  rematchState = "idle", // 'idle' | 'requested_by_me' | 'requested_by_opponent'
  opponentName = "Opponent",
  opponentLeft = false,
  localScore = null, // { xWins: 0, oWins: 0, draws: 0 }
  onRequestRematch,
  onAcceptRematch,
  onDeclineRematch,
  onReturnToLobby,
}) => {
  const isWinner = isOnline ? winner === mySymbol : Boolean(winner);

  let title = "Game Over";
  let subtitle = "";
  let iconElement = <FiAward className="w-8 h-8 text-amber-500" />;
  let iconBg = "bg-amber-100 border-amber-200";

  if (isDraw) {
    title = "Match Drawn";
    subtitle = "Well played by both sides!";
    iconElement = <FiMinusCircle className="w-8 h-8 text-amber-500" />;
    iconBg = "bg-amber-100 border-amber-200";
  } else if (isOnline) {
    if (reason === "timeout") {
      title = isWinner ? "Victory by Timeout" : "Time Expired";
      subtitle = isWinner ? `${opponentName} ran out of time.` : "Your turn timer expired.";
      iconElement = <FiClock className="w-8 h-8 text-sky-500" />;
      iconBg = isWinner ? "bg-sky-100 border-sky-200" : "bg-pink-100 border-pink-200";
    } else if (reason === "opponent_abandoned") {
      title = "Opponent Left";
      subtitle = `${opponentName} left the room. You win!`;
      iconElement = <FiUserX className="w-8 h-8 text-sky-500" />;
      iconBg = "bg-sky-100 border-sky-200";
    } else {
      title = isWinner ? "Victory!" : "Good Try!";
      subtitle = isWinner ? "Congratulations on your win!" : "Well played, nice moves!";
      iconElement = <FiAward className="w-8 h-8 text-sky-500 animate-bounce" />;
      iconBg = isWinner ? "bg-sky-100 border-sky-200" : "bg-pink-100 border-pink-200";
    }
  } else {
    // Local match
    title = `${winnerName || (winner === "X" ? "Player 1" : "Player 2")} Wins!`;
    subtitle = "Great round!";
    iconElement = <FiAward className="w-8 h-8 text-sky-500" />;
    iconBg = winner === "X" ? "bg-sky-100 border-sky-200" : "bg-pink-100 border-pink-200";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm sm:max-w-md p-5 sm:p-6 rounded-3xl bg-white border-2 border-pink-100 shadow-2xl text-center animate-zoom-in">
        {/* Subtle Result Icon */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-3xl border-2 flex items-center justify-center mb-3 shadow-xs ${iconBg}`}
        >
          {iconElement}
        </div>

        {/* Result Titles */}
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mb-1 font-sans">
          {title}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mb-4 font-semibold">{subtitle}</p>

        {/* Opponent Left Notice (Disables Rematch) */}
        {isOnline && opponentLeft && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 mb-4 text-xs font-bold flex items-center justify-center gap-2 animate-fade-in">
            <FiUserX className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{opponentName} left the match. Rematch is disabled.</span>
          </div>
        )}

        {/* Local Session Score Summary */}
        {localScore && (
          <div className="flex items-center justify-around py-2.5 px-3 rounded-2xl bg-pink-50/50 border border-pink-100 mb-4 text-xs sm:text-sm font-bold">
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-extrabold">Player 1 (X)</p>
              <p className="text-sky-600 text-lg font-black">{localScore.xWins}</p>
            </div>
            <div className="h-6 w-px bg-pink-200" />
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-extrabold">Draws</p>
              <p className="text-amber-600 text-lg font-black">{localScore.draws}</p>
            </div>
            <div className="h-6 w-px bg-pink-200" />
            <div>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-extrabold">Player 2 (O)</p>
              <p className="text-pink-600 text-lg font-black">{localScore.oWins}</p>
            </div>
          </div>
        )}

        {/* Online Rematch Interaction States */}
        {isOnline && !opponentLeft && (
          <div className="mb-4">
            {rematchState === "requested_by_opponent" ? (
              <div className="p-3 rounded-2xl bg-pink-50 border border-pink-200 text-pink-900">
                <p className="text-xs sm:text-sm font-black mb-2.5">
                  {opponentName} requested a rematch
                </p>
                <div className="flex items-center justify-center gap-2.5">
                  <button
                    onClick={onAcceptRematch}
                    className="flex-1 py-2 px-3 btn-pastel-green text-xs sm:text-sm flex items-center justify-center gap-1.5 font-bold"
                  >
                    <FiCheck className="w-4 h-4" />
                    Accept
                  </button>
                  <button
                    onClick={onDeclineRematch}
                    className="py-2 px-3 btn-pastel-ghost text-xs sm:text-sm flex items-center justify-center gap-1.5 font-bold"
                  >
                    <FiX className="w-4 h-4" />
                    Decline
                  </button>
                </div>
              </div>
            ) : rematchState === "requested_by_me" ? (
              <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900">
                <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                  <span>Waiting for {opponentName} to accept...</span>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          {isOnline ? (
            opponentLeft ? (
              <button
                disabled
                className="flex-1 py-2.5 px-4 rounded-2xl bg-slate-100 border-2 border-slate-200 text-slate-400 text-xs sm:text-sm flex items-center justify-center gap-2 font-black cursor-not-allowed opacity-60 shadow-none"
                title="Opponent has left the match"
              >
                <FiRotateCcw className="w-4 h-4 text-slate-400" />
                <span>Rematch (Opponent Left)</span>
              </button>
            ) : rematchState === "idle" ? (
              <button
                onClick={onRequestRematch}
                className="flex-1 py-2.5 px-4 btn-pastel-pink text-xs sm:text-sm flex items-center justify-center gap-2 font-black"
                title="Request a rematch"
              >
                <FiRotateCcw className="w-4 h-4" />
                <span>Rematch</span>
              </button>
            ) : rematchState === "requested_by_me" ? (
              <button
                disabled
                className="flex-1 py-2.5 px-4 rounded-2xl bg-sky-50 border-2 border-sky-200 text-sky-700 text-xs sm:text-sm flex items-center justify-center gap-2 font-black cursor-wait"
              >
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                <span>Requested...</span>
              </button>
            ) : null
          ) : (
            <button
              onClick={onRequestRematch}
              className="flex-1 py-2.5 px-4 btn-pastel-green text-xs sm:text-sm flex items-center justify-center gap-2 font-black"
            >
              <FiRotateCcw className="w-4 h-4" />
              <span>Next Round</span>
            </button>
          )}

          <button
            onClick={onReturnToLobby}
            className="flex-1 py-2.5 px-4 btn-pastel-ghost text-xs sm:text-sm flex items-center justify-center gap-2 font-bold"
          >
            <FiHome className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
