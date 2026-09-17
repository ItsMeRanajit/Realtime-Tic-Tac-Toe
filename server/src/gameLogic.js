export const WIN_PATTERNS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Col 1
  [1, 4, 7], // Col 2
  [2, 5, 8], // Col 3
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

/**
 * Creates a clean 3x3 board representation (array of 9 elements).
 */
export function createInitialBoard() {
  return Array(9).fill(null);
}

/**
 * Validates whether a move attempt is legal.
 */
export function validateMove({ board, cellIndex, playerSymbol, currentTurn, status }) {
  if (status !== 'in_progress') {
    return { valid: false, reason: 'Game is not in progress' };
  }

  if (typeof cellIndex !== 'number' || cellIndex < 0 || cellIndex > 8) {
    return { valid: false, reason: 'Invalid board position' };
  }

  if (board[cellIndex] !== null) {
    return { valid: false, reason: 'Cell is already occupied' };
  }

  if (playerSymbol !== currentTurn) {
    return { valid: false, reason: 'It is not your turn' };
  }

  return { valid: true };
}

/**
 * Evaluates the current board state for a win, draw, or ongoing game.
 */
export function evaluateBoard(board) {
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
