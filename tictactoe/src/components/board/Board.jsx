import React, { useState } from "react";
import Cell from "./Cell";
import WinningLine from "./WinningLine";

export const Board = ({
  board = Array(9).fill(null),
  onCellClick,
  winningLine = null,
  winner = null,
  lastMove = null,
  isMyTurn = false,
  mySymbol = null,
  isGameFinished = false,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [touchSelectedIndex, setTouchSelectedIndex] = useState(null);

  const handleCellAction = (idx) => {
    if (!isMyTurn || isGameFinished || board[idx] !== null) return;

    // Detect if device has touch capability
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    if (isTouchDevice) {
      if (touchSelectedIndex === idx) {
        // Confirmed second tap
        setTouchSelectedIndex(null);
        onCellClick(idx);
      } else {
        // First tap: preview & select
        setTouchSelectedIndex(idx);
      }
    } else {
      // Desktop single click
      onCellClick(idx);
    }
  };

  return (
    <div className="relative w-full max-w-[300px] sm:max-w-[330px] aspect-square p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl bg-white border-2 border-pink-100 border-b-4 border-b-pink-200 shadow-pillowy">
      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-2.5 w-full h-full">
        {board.map((value, idx) => {
          const isWinningCell = winningLine ? winningLine.includes(idx) : false;
          const isLast = lastMove ? lastMove.index === idx : false;
          const isTouchSelected = touchSelectedIndex === idx && value === null;
          const showHoverPreview =
            isMyTurn && hoveredIndex === idx && value === null;

          return (
            <Cell
              key={idx}
              index={idx}
              value={value}
              onClick={() => handleCellAction(idx)}
              onPointerEnter={() => setHoveredIndex(idx)}
              onPointerLeave={() => {
                if (hoveredIndex === idx) setHoveredIndex(null);
              }}
              disabled={!isMyTurn || isGameFinished}
              isWinningCell={isWinningCell}
              isLastMove={isLast}
              previewSymbol={showHoverPreview ? mySymbol : null}
              isTouchSelected={isTouchSelected}
            />
          );
        })}
      </div>

      {/* Animated Hand-drawn Winning Marker Line */}
      {winningLine && (
        <WinningLine winningLine={winningLine} winner={winner} />
      )}
    </div>
  );
};

export default Board;
