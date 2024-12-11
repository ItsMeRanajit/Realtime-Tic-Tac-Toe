import React, { useEffect, useState } from "react";
import circle from "../assets/circle.png";
import cross from "../assets/delete-cross.png";

const boxes = ({ playingAs, rowidx, colidx, useSocket, gameState, setGameState, id, currentPlayer, setCurrentPlayer, finishedState, finishedArrState }) => {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    setIcon(typeof gameState[rowidx][colidx] !== "number" ? (gameState[rowidx][colidx] === "circle" ? circle : cross) : null);
  });
  useEffect(() => {
    setIcon(null);
  }, []);

  const clickOnBox = () => {
    if (!icon) {
      // currentPlayer === "circle" ? setIcon(circle) : setIcon(cross);

      setGameState((prevState) => {
        let newState = [...prevState];
        const row = Math.floor(id / 3);
        const col = Math.floor(id % 3);
        newState[row][col] = playingAs;

        useSocket.emit("playerMoveUser", {
          gameState,
          sign: currentPlayer,
        });
        // console.log(newState);
        return newState;
      });

      setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");
    }
  };

  return (
    <div
      onClick={() => {
        if (currentPlayer === playingAs && !finishedState) {
          clickOnBox();
        }
      }}
      className={` ${finishedState ? "cursor-not-allowed" : ""} ${finishedArrState.includes(id) ? "bg-blue-500 " : ""} ${!finishedArrState.includes(id) && finishedState ? "opacity-60" : ""} ${
        currentPlayer !== playingAs ? "cursor-not-allowed" : "cursor-pointer"
      } w-20 h-20 border rounded-md border-white/10`}
    >
      {icon && <img src={icon} alt="" />}
    </div>
  );
};

export default boxes;
