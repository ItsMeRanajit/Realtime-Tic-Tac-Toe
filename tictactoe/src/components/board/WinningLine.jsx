import React from "react";
import { getWinningLineCoordinates } from "../../utils/gameUtils";

export const WinningLine = ({ winningLine, winner }) => {
  const coords = getWinningLineCoordinates(winningLine);
  if (!coords) return null;

  const color1 = winner === "X" ? "#38bdf8" : winner === "O" ? "#f472b6" : "#fbbf24";
  const color2 = winner === "X" ? "#34d399" : winner === "O" ? "#c084fc" : "#f59e0b";

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-20"
      viewBox="0 0 300 300"
    >
      <defs>
        <linearGradient id="pastelMarkerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color1} stopOpacity="0.95" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="100%" stopColor={color2} stopOpacity="0.95" />
        </linearGradient>
      </defs>
      <line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        stroke="url(#pastelMarkerGradient)"
        strokeWidth="14"
        strokeLinecap="round"
        className="marker-strike-line drop-shadow-md"
      />
    </svg>
  );
};

export default WinningLine;
