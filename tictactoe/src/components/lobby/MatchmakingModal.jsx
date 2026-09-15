import React, { useEffect, useState } from "react";
import { FiX, FiSearch } from "react-icons/fi";

export const MatchmakingModal = ({ isOpen = false, playerName = "Player", onCancel }) => {
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setSecondsElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedTime = `${String(Math.floor(secondsElapsed / 60)).padStart(2, "0")}:${String(
    secondsElapsed % 60
  ).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm p-6 sm:p-7 rounded-3xl bg-white border-2 border-sky-100 shadow-2xl text-center animate-zoom-in">
        {/* Playful Animated Search Mascot */}
        <div className="relative w-28 h-28 mx-auto mb-5 flex items-center justify-center">
          {/* Pulsing playful background bubble */}
          <div className="absolute inset-0 rounded-full bg-sky-100 border-2 border-dashed border-sky-300 animate-spin" style={{ animationDuration: "12s" }} />

          {/* Mini Bouncing X and O dots */}
          <div className="absolute top-2 left-3 w-6 h-6 rounded-full bg-sky-200 text-sky-700 flex items-center justify-center text-xs font-black animate-bounce" style={{ animationDuration: "1.2s" }}>
            X
          </div>
          <div className="absolute bottom-2 right-3 w-6 h-6 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-xs font-black animate-bounce" style={{ animationDuration: "1.5s" }}>
            O
          </div>

          {/* Center Mascot Icon */}
          <div className="relative z-10 w-14 h-14 rounded-2xl bg-sky-400 text-white flex items-center justify-center shadow-md animate-soft-float">
            <FiSearch className="w-7 h-7" />
          </div>
        </div>

        {/* Searching Status */}
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-1 font-sans">
          Finding Opponent...
        </h3>
        <p className="text-sky-600 font-extrabold text-base mb-2 font-mono">
          {formattedTime}
        </p>
        <p className="text-slate-500 text-xs sm:text-sm mb-6 font-semibold leading-relaxed">
          Looking for a friendly player for <span className="text-slate-800 font-extrabold">{playerName}</span>
        </p>

        {/* Tactile Cancel Button */}
        <button
          onClick={onCancel}
          className="w-full py-3 px-5 btn-pastel-ghost flex items-center justify-center gap-2 text-sm"
        >
          <FiX className="w-4 h-4 text-slate-400" />
          <span>Cancel Search</span>
        </button>
      </div>
    </div>
  );
};

export default MatchmakingModal;
