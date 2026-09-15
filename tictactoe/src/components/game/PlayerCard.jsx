import React, { useEffect, useState } from "react";
import { FiZap, FiClock, FiWifiOff } from "react-icons/fi";

export const PlayerCard = ({
  name = "Player",
  symbol = "X",
  isCurrentTurn = false,
  isYou = false,
  connected = true,
  turnDeadline = null,
  totalTurnSeconds = 25,
}) => {
  const isX = symbol === "X";
  const [timeLeft, setTimeLeft] = useState(totalTurnSeconds);

  useEffect(() => {
    if (!isCurrentTurn || !turnDeadline) {
      setTimeLeft(totalTurnSeconds);
      return;
    }

    const interval = setInterval(() => {
      const remainingMs = Math.max(0, turnDeadline - Date.now());
      const remainingSec = Math.ceil(remainingMs / 1000);
      setTimeLeft(remainingSec);
    }, 200);

    return () => clearInterval(interval);
  }, [isCurrentTurn, turnDeadline, totalTurnSeconds]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / totalTurnSeconds) * 100));

  return (
    <div
      className={`relative flex items-center gap-2.5 sm:gap-3 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 ${
        isCurrentTurn
          ? isX
            ? "bg-sky-50 border-sky-400 shadow-pillowy transform -translate-y-0.5"
            : "bg-pink-50 border-pink-400 shadow-pillowy transform -translate-y-0.5"
          : "bg-white border-slate-200/80 opacity-80"
      }`}
    >
      {/* Plump Symbol Badge */}
      <div
        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-black text-lg sm:text-xl shrink-0 shadow-xs ${
          isX
            ? "bg-sky-400 text-white"
            : "bg-pink-400 text-white"
        }`}
      >
        {symbol}
      </div>

      {/* Info Column */}
      <div className="flex flex-col min-w-0 pr-1">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xs sm:text-sm text-slate-800 truncate max-w-[85px] sm:max-w-[110px]">
            {name}
          </span>
          {isYou && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-sky-100 text-sky-700 leading-none">
              YOU
            </span>
          )}
        </div>

        {/* Status / Turn text with Subtle Icons */}
        <div className="flex items-center gap-1 text-xs">
          {!connected ? (
            <span className="flex items-center gap-1 text-rose-500 font-bold text-[10px]">
              <FiWifiOff className="w-3 h-3 text-rose-500 animate-pulse" />
              <span>Offline</span>
            </span>
          ) : isCurrentTurn ? (
            <span className={`flex items-center gap-1 font-black text-[10px] sm:text-[11px] tracking-wide ${isX ? "text-sky-600" : "text-pink-600"}`}>
              {isYou ? (
                <>
                  <FiZap className="w-3 h-3 text-sky-500 shrink-0" />
                  <span>Your Turn</span>
                </>
              ) : (
                <>
                  <FiClock className="w-3 h-3 text-pink-500 shrink-0 animate-spin" style={{ animationDuration: "3s" }} />
                  <span>Thinking...</span>
                </>
              )}
            </span>
          ) : (
            <span className="text-slate-400 text-[10px] font-bold">Waiting</span>
          )}
        </div>
      </div>

      {/* Soft Turn Timer Bar */}
      {isCurrentTurn && turnDeadline && (
        <div className="absolute -bottom-1 left-4 right-4 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-200 ${isX ? "bg-sky-400" : "bg-pink-400"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default PlayerCard;
