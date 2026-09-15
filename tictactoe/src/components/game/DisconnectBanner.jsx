import React, { useEffect, useState } from "react";
import { FiAlertTriangle, FiLogOut } from "react-icons/fi";

export const DisconnectBanner = ({
  gracePeriodMs = 20000,
  playerName = "Opponent",
  onLeave,
}) => {
  const [remainingSec, setRemainingSec] = useState(Math.ceil(gracePeriodMs / 1000));

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const left = Math.max(0, Math.ceil((gracePeriodMs - elapsed) / 1000));
      setRemainingSec(left);
      if (left <= 0) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [gracePeriodMs]);

  return (
    <div className="w-full max-w-md mx-auto p-3.5 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-900 shadow-md flex items-center justify-between gap-3 animate-fade-in mb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <FiAlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-pulse" />
        <div className="text-xs sm:text-sm font-medium">
          <p className="font-extrabold text-amber-900">
            {playerName} lost connection
          </p>
          <p className="text-amber-700 text-xs">
            Waiting for reconnection: <span className="font-black text-amber-900">{remainingSec}s</span>
          </p>
        </div>
      </div>

      <button
        onClick={onLeave}
        className="px-3.5 py-1.5 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-black flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
      >
        <FiLogOut className="w-3.5 h-3.5" />
        <span>Leave</span>
      </button>
    </div>
  );
};

export default DisconnectBanner;
