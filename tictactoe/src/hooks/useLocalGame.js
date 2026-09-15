import { useState, useCallback } from "react";
import { checkWinnerLocal } from "../utils/gameUtils";
import { sound } from "../services/audioService";

export const useLocalGame = (player1Name = "Player 1", player2Name = "Player 2") => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState("X");
  const [starter, setStarter] = useState("X");
  const [lastMove, setLastMove] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ xWins: 0, oWins: 0, draws: 0 });

  const makeMove = useCallback(
    (cellIndex) => {
      if (board[cellIndex] !== null || winner || isDraw) return;

      const currentSymbol = turn;
      sound.playMove(currentSymbol);

      const newBoard = [...board];
      newBoard[cellIndex] = currentSymbol;
      setBoard(newBoard);
      setLastMove({ index: cellIndex, symbol: currentSymbol });

      const outcome = checkWinnerLocal(newBoard);

      if (outcome.isFinished) {
        if (outcome.winner === "draw") {
          setIsDraw(true);
          setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
          sound.playDraw();
        } else {
          setWinner(outcome.winner);
          setWinningLine(outcome.winningLine);
          if (outcome.winner === "X") {
            setScores((prev) => ({ ...prev, xWins: prev.xWins + 1 }));
          } else {
            setScores((prev) => ({ ...prev, oWins: prev.oWins + 1 }));
          }
          sound.playWin();
        }
      } else {
        setTurn((prev) => (prev === "X" ? "O" : "X"));
      }
    },
    [board, turn, winner, isDraw]
  );

  const nextRound = useCallback(() => {
    sound.playClick();
    const nextStarter = starter === "X" ? "O" : "X";
    setStarter(nextStarter);
    setTurn(nextStarter);
    setBoard(Array(9).fill(null));
    setWinningLine(null);
    setWinner(null);
    setIsDraw(false);
    setLastMove(null);
  }, [starter]);

  const resetAll = useCallback(() => {
    sound.playClick();
    setBoard(Array(9).fill(null));
    setTurn("X");
    setStarter("X");
    setWinningLine(null);
    setWinner(null);
    setIsDraw(false);
    setLastMove(null);
    setScores({ xWins: 0, oWins: 0, draws: 0 });
  }, []);

  return {
    board,
    turn,
    starter,
    lastMove,
    winningLine,
    winner,
    isDraw,
    scores,
    isGameFinished: Boolean(winner || isDraw),
    makeMove,
    nextRound,
    resetAll,
  };
};

export default useLocalGame;
