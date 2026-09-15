import React from "react";

export const Cell = ({
  index,
  value,
  onClick,
  onPointerEnter,
  onPointerLeave,
  disabled,
  isWinningCell,
  isLastMove,
  previewSymbol,
  isTouchSelected,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      disabled={disabled || value !== null}
      aria-label={`Board square ${index + 1}, ${value ? `occupied by ${value}` : "empty"}`}
      className={`relative flex items-center justify-center aspect-square select-none transition-all duration-150 ${
        isWinningCell
          ? "bg-amber-100 border-2 border-amber-400 border-b-4 border-b-amber-500 rounded-2xl sm:rounded-3xl animate-wiggle shadow-md"
          : isTouchSelected
          ? "bg-pink-50 border-2 border-dashed border-pink-400 border-b-4 border-b-pink-500 rounded-2xl sm:rounded-3xl shadow-sm"
          : isLastMove
          ? "bg-purple-50/70 border-2 border-purple-300 border-b-4 border-b-purple-400 rounded-2xl sm:rounded-3xl"
          : "pastel-cell"
      } ${
        !disabled && value === null
          ? "cursor-pointer"
          : "cursor-default opacity-95"
      }`}
    >
      {/* Last Move Indicator Star */}
      {isLastMove && !isWinningCell && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-sm animate-pulse" />
      )}

      {/* Render Placed Mark 'X' */}
      {value === "X" && (
        <svg
          viewBox="0 0 100 100"
          className="w-3/5 h-3/5 text-sky-500 animate-pop-bounce drop-shadow-sm"
        >
          <line
            x1="22"
            y1="22"
            x2="78"
            y2="78"
            stroke="currentColor"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <line
            x1="78"
            y1="22"
            x2="22"
            y2="78"
            stroke="currentColor"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Render Placed Mark 'O' */}
      {value === "O" && (
        <svg
          viewBox="0 0 100 100"
          className="w-3/5 h-3/5 text-pink-500 animate-pop-bounce drop-shadow-sm"
        >
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="18"
          />
        </svg>
      )}

      {/* Hover / Touch Selection Ghost Preview */}
      {value === null && !disabled && (previewSymbol || isTouchSelected) && (
        <div
          className={`w-3/5 h-3/5 pointer-events-none transition-all duration-150 ${
            isTouchSelected
              ? "opacity-80 scale-95 animate-pulse"
              : "opacity-0 group-hover:opacity-40 scale-90"
          }`}
        >
          {(previewSymbol || (isTouchSelected ? "X" : null)) === "X" ? (
            <svg viewBox="0 0 100 100" className="w-full h-full text-sky-400">
              <line x1="22" y1="22" x2="78" y2="78" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
              <line x1="78" y1="22" x2="22" y2="78" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full text-pink-400">
              <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="18" />
            </svg>
          )}
        </div>
      )}

      {/* Touch Confirmation Pill for Mobile */}
      {isTouchSelected && (
        <span className="absolute bottom-1.5 text-[9px] font-extrabold text-pink-600 bg-white px-2 py-0.5 rounded-full border border-pink-300 shadow-sm">
          Tap to confirm
        </span>
      )}
    </button>
  );
};

export default Cell;
