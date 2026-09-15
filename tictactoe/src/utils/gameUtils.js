export const WIN_PATTERNS = [
  [0, 1, 2], // Row 0
  [3, 4, 5], // Row 1
  [6, 7, 8], // Row 2
  [0, 3, 6], // Col 0
  [1, 4, 7], // Col 1
  [2, 5, 8], // Col 2
  [0, 4, 8], // Diag top-left to bottom-right
  [2, 4, 6], // Diag top-right to bottom-left
];

/**
 * Checks local board state for offline 2-player mode.
 */
export function checkWinnerLocal(board) {
  for (const [a, b, c] of WIN_PATTERNS) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        isFinished: true,
        winner: board[a],
        winningLine: [a, b, c],
      };
    }
  }

  const isFull = board.every((cell) => cell !== null);
  if (isFull) {
    return {
      isFinished: true,
      winner: 'draw',
      winningLine: null,
    };
  }

  return {
    isFinished: false,
    winner: null,
    winningLine: null,
  };
}

/**
 * Computes SVG line coordinates (x1, y1, x2, y2) on a 300x300 normalized coordinate system
 * based on the 3 winning cell indices.
 */
export function getWinningLineCoordinates(winningLine) {
  if (!winningLine || winningLine.length !== 3) return null;

  const [a, , c] = winningLine;

  // Rows
  if (a === 0 && c === 2) return { x1: 20, y1: 50, x2: 280, y2: 50 };
  if (a === 3 && c === 5) return { x1: 20, y1: 150, x2: 280, y2: 150 };
  if (a === 6 && c === 8) return { x1: 20, y1: 250, x2: 280, y2: 250 };

  // Columns
  if (a === 0 && c === 6) return { x1: 50, y1: 20, x2: 50, y2: 280 };
  if (a === 1 && c === 7) return { x1: 150, y1: 20, x2: 150, y2: 280 };
  if (a === 2 && c === 8) return { x1: 250, y1: 20, x2: 250, y2: 280 };

  // Diagonals
  if (a === 0 && c === 8) return { x1: 25, y1: 25, x2: 275, y2: 275 };
  if (a === 2 && c === 6) return { x1: 275, y1: 25, x2: 25, y2: 275 };

  return null;
}
