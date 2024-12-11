import React, { useEffect, useState } from "react";
import circle from "../assets/circle.png";
import cross from "../assets/delete-cross.png";

const boxes = ({ setGameState, id, currentPlayer, setCurrentPlayer, finishedState, setFinishedArrState, finishedArrState, resetBoard }) => {
  const [icon, setIcon] = useState(null);

  const clickOnBox = () => {
    if (!icon && !finishedState) {
      currentPlayer === "circle" ? setIcon(circle) : setIcon(cross);

      setGameState((prevState) => {
        let newState = [...prevState];
        const row = Math.floor(id / 3);
        const col = Math.floor(id % 3);
        newState[row][col] = currentPlayer;
        return newState;
      });

      setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");
    }
  };

  return (
    <div
      onClick={() => {
        clickOnBox();
      }}
      className={` ${finishedState ? "cursor-not-allowed" : "cursor-pointer"} ${finishedArrState.includes(id) ? "bg-blue-500 " : ""} ${
        !finishedArrState.includes(id) && finishedState ? "opacity-60" : ""
      }  w-20 h-20 border rounded-md border-white/10`}
    >
      {icon && <img src={icon} alt="" />}
    </div>
  );
};

export default boxes;
