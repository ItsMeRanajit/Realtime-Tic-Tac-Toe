import React, { useEffect } from "react";
import { useState } from "react";
import Box from "./components/offlineBox";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const playOffline = ({ setOption, option }) => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrState, setFinishedArrState] = useState([]);
  const [isDraw, setIsDraw] = useState(false);
  const [resetBoard, setResetBoard] = useState(false);

  const checkWinner = () => {
    const win_ptrn = [
      [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
      [
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ],
      [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 },
      ],
      [
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 2, col: 1 },
      ],
      [
        { row: 0, col: 2 },
        { row: 1, col: 2 },
        { row: 2, col: 2 },
      ],
      [
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 },
      ],
      [
        { row: 0, col: 2 },
        { row: 1, col: 1 },
        { row: 2, col: 0 },
      ],
    ];

    for (let i of win_ptrn) {
      if (
        gameState[i[0].row][i[0].col] == gameState[i[1].row][i[1].col] &&
        gameState[i[0].row][i[0].col] == gameState[i[2].row][i[2].col] &&
        gameState[i[2].row][i[2].col] == gameState[i[1].row][i[1].col]
      ) {
        setFinishedState(gameState[i[0].row][i[0].col]);
        setFinishedArrState([i[0].row * 3 + i[0].col, i[1].row * 3 + i[1].col, i[2].row * 3 + i[2].col]);
        return finishedState;
      }
    }
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) setFinishedState(winner);
    else if (gameState.flat().every((item) => typeof item === "string") && winner == null) {
      setIsDraw(true);
    }
  }, [gameState]);

  return (
    <div className="grid w-full h-screen bg-gradient-to-br from-violet-900 to-violet-700 place-items-center">
      <div className=" lg:w-[40%] md:w-full  flex flex-col items-center justify-center p-10">
        <div className="w-auto mb-10 text-3xl font-bold tracking-widest text-white md:text-5xl lg:text-7xl font-base3">Tic Tac Toe</div>
        <div className="flex w-full text-lg font-semibold justify-evenly">
          <div className={`transition-all lg:text-lg md:text-base text-sm border border-violet-400 font-base3  ${currentPlayer === "circle" ? "activeName scale-125" : "playerName"} `}>Circle</div>
          <div className={`transition-all lg:text-lg md:text-base text-sm border border-violet-400 font-base3  ${currentPlayer === "cross" ? "activeName scale-125" : "playerName"} `}>Cross</div>
        </div>

        <div className="relative grid grid-cols-3 gap-2 p-4 border-2 border-white border-dashed md:mt-6 rounded-3xl">
          {renderFrom.map((arr, rowidx) =>
            arr.map((e, colidx) => {
              return (
                <Box
                  gameState={gameState}
                  finishedState={finishedState}
                  finishedArrState={finishedArrState}
                  currentPlayer={currentPlayer}
                  setCurrentPlayer={setCurrentPlayer}
                  setFinishedArrState={setFinishedArrState}
                  resetBoard={resetBoard}
                  setGameState={setGameState}
                  id={rowidx * 3 + colidx}
                  key={rowidx * 3 + colidx}
                  currentElement={e}
                />
              );
            })
          )}

          <div className="absolute h-64 border-l-2 border-white border-dashed left-[99px] top-4"></div>
          <div className="absolute h-64 border-l-2 border-white border-dashed left-[187px] top-4"></div>

          <div className="absolute w-64 border-t-2 border-white border-dashed top-[99px] left-4"></div>
          <div className="absolute w-64 border-t-2 border-white border-dashed top-[187px] left-4"></div>
        </div>

        {isDraw ? (
          <div className="mt-6 text-sm font-medium tracking-wider text-center text-white font-base3 lg:text-3xl md:text-xl">
            <p>This is a Draw</p>
            <button
              className="mt-4 activeName"
              onClick={() => {
                window.location.reload();
              }}
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="mt-6 text-sm font-medium tracking-wider text-center text-white lg:text-3xl md:text-xl font-base3">
            {finishedState ? (
              <div>
                <p>{`The winner is ${finishedState}`}</p>
                <button
                  className="mt-4 text-sm activeName lg:text-3xl md:text-xl"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Play Again
                </button>
              </div>
            ) : (
              <p> {`Move for ${currentPlayer}`}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default playOffline;
