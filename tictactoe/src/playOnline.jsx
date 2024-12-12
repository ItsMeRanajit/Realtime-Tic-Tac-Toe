import React, { useEffect, useRef } from "react";
import { useState } from "react";
import Box from "./components/onlineBox";
import SVG from "./components/loading";
import { MdOutlineMessage } from "react-icons/md";
import { IoSend } from "react-icons/io5";
import { io } from "socket.io-client";
import Swal from "sweetalert2";
import { use } from "react";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const playOnline = ({ setOption, option }) => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrState, setFinishedArrState] = useState([]);
  const [isDraw, setIsDraw] = useState(false);
  const [playOnline, setPlayOnline] = useState(false);
  const [useSocket, setUseSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponent, setOpponent] = useState(null);
  const [playingAs, setPlayingAs] = useState(currentPlayer);
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");
  const messageContent = useRef(null);
  const [winner, setWinner] = useState("");

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
        winnerFunction(gameState[i[0].row][i[0].col]);
        return finishedState;
      } else if (gameState.flat().every((item) => typeof item === "string")) {
        return null;
      }
    }
  };

  const startSocket = async () => {
    // console.log(gameState);
    const name = await takePlayerName();
    if (name.dismiss) setOption(null);
    if (!name.isConfirmed) {
      return;
    }
    setPlayerName(name.value);

    const socket = io("https://realtime-tic-tac-toe-server.up.railway.app", {
      autoConnect: true,
    });

    socket?.emit("req_to_play", {
      playerName: name.value,
    });
    setUseSocket(socket);
  };

  const takePlayerName = async () => {
    return await Swal.fire({
      title: "Enter your name",
      input: "text",
      inputLabel: "Your Name",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });
  };
  const resetCreds = () => {
    setGameState([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    setCurrentPlayer("circle");
    setFinishedState(false);
    setFinishedArrState([]);
    setIsDraw(false);
    // setPlayOnline(false);
    setUseSocket(null);
    setPlayerName("");
    setOpponent(null);
    setPlayingAs(currentPlayer);
    setWinner("");
    setShowChat(false);
    setMessage("");
    // messageContent = null;
    setOption(null);
  };

  const winnerFunction = (str) => {
    if (str === playingAs) setWinner(playerName);
    else setWinner(opponent);
  };

  const sendText = () => {
    if (message.trim() !== "") {
      console.log(message.trim());
      useSocket?.emit("messageSent", message);
    }
    setMessage("");
  };

  useSocket?.on("connect", function () {
    setPlayOnline(true);
  });

  useSocket?.on("roomJoined", function (data) {
    if (data.players.opponentPlayer.playerId === useSocket.id) {
      setPlayingAs(data.players.opponentPlayer.playingAs);
      setOpponent(data.players.currentPlayer.playerName);
    } else {
      setPlayingAs(data.players.currentPlayer.playingAs);
      setOpponent(data.players.opponentPlayer.playerName);
    }
  });

  useSocket?.on("updateState", function (data) {
    setGameState(data.gameState);
    setCurrentPlayer(data.sign === "circle" ? "cross" : "circle");
  });

  useSocket?.on("opponentNotFound", function () {
    setTimeout(() => {
      setOpponent((currOpponent) => {
        if (currOpponent) {
          return currOpponent;
        } else {
          useSocket.emit("removePlayerFromSet");
          return false;
        }
      });
    }, 10000);
  });

  useEffect(() => {
    useSocket?.on("messageRecieved", function (data) {
      console.log(data);
      if (messageContent.current) {
        const messageElement = document.createElement("p");
        messageElement.textContent = data.message;
        if (data.sender === useSocket.id) messageElement.className = "otherMsg";
        else messageElement.className = "myMsg";
        console.log(messageElement);

        messageContent.current.appendChild(messageElement);
      }
    });
    return () => {
      useSocket?.off("messageRecieved");
    };
  }, [useSocket]);

  useSocket?.on("playerExit", async function () {
    const result = await Swal.fire({
      icon: "error",
      title: "Opponent Disconnected",
      text: "Error in connection",
      confirmButtonText: "OK",
    });
    if (result.isConfirmed) {
      resetCreds();
      console.log("disconnected");
    }
  });

  window.addEventListener("beforeunload", () => {
    useSocket.emit("removePlayer");
  });

  useEffect(() => {
    const winner = checkWinner();
    if (gameState.flat().every((item) => typeof item === "string") && winner === null) {
      setIsDraw(true);
    }
  }, [gameState]);

  useEffect(() => {
    startSocket();
  }, []);

  return (
    <div className="grid w-full h-screen bg-gradient-to-br from-violet-900 to-violet-700 place-items-center">
      {playOnline ? (
        !opponent ? (
          opponent === false ? (
            <div className="text-2xl font-semibold tracking-wider text-center text-white font-base3">
              <p>Opponent Not Found</p>
              <button
                className="w-40 h-12 mt-10 text-sm tracking-widest transition-all activeName font-base3"
                onClick={async () => {
                  await startSocket();
                  useSocket.emit("removePlayerFromSet");
                  setOpponent(null);
                }}
              >
                Try Again
              </button>
              <button
                className="w-auto h-12 mt-10 text-sm tracking-widest transition-all activeName font-base3"
                onClick={() => {
                  useSocket.emit("removePlayerFromSet");
                  setOpponent(null);
                  setOption(null);
                }}
              >
                Go to Home
              </button>
            </div>
          ) : (
            <div className="relative text-center">
              <p className="text-2xl font-semibold tracking-wider text-white font-base3">Waiting for Opponent...</p>
              <SVG />
              <p className="text-xl font-semibold tracking-wider text-white font-base3 ">{`Finding opponent for ${playerName}...`}</p>
              <button
                className="px-4 py-2 mt-4 text-white transition-all bg-gray-600 border border-white rounded-md hover:bg-gray-500 font-base3"
                onClick={() => {
                  useSocket.emit("removePlayerFromSet");
                  // setPlayOnline(false);
                  setOption(null);
                }}
              >
                Cancel
              </button>
            </div>
          )
        ) : (
          <div className=" lg:w-[40%] md:w-full flex flex-col items-center justify-start text-center p-10">
            <div className="w-auto mb-10 text-3xl font-bold tracking-widest text-white md:text-5xl lg:text-7xl font-base3">Tic Tac Toe</div>
            <div className="flex w-full text-sm font-semibold justify-evenly">
              <div
                className={`transition-all border border-violet-400 font-base3 lg:text-lg md:text-base text-sm  ${currentPlayer === playingAs ? "activeName scale-125" : "playerName"} `}
              >{`${playerName}(You)`}</div>
              <div className={`transition-all border border-violet-400 font-base3 lg:text-lg md:text-base text-sm   ${currentPlayer !== playingAs ? "activeName scale-125" : "playerName"} `}>
                {opponent}
              </div>
            </div>

            <div className="relative grid w-full place-items-center">
              <div className="relative grid grid-cols-3 gap-2 p-4 border-2 border-white border-dashed md:mt-6 rounded-3xl">
                {renderFrom.map((arr, rowidx) =>
                  arr.map((e, colidx) => {
                    return (
                      <Box
                        gameState={gameState}
                        useSocket={useSocket}
                        finishedState={finishedState}
                        finishedArrState={finishedArrState}
                        currentPlayer={currentPlayer}
                        playingAs={playingAs}
                        setCurrentPlayer={setCurrentPlayer}
                        setGameState={setGameState}
                        id={rowidx * 3 + colidx}
                        key={rowidx * 3 + colidx}
                        rowidx={rowidx}
                        colidx={colidx}
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

              <button className="bottom-0 left-[50%] mt-2" onClick={() => setShowChat((prev) => !prev)}>
                <MdOutlineMessage size={30} className=" invert" />
              </button>
              <div
                className={`absolute flex flex-col items-center justify-start h-72 border-2 border-white lg:top-1/2 lg:left-[-20px] lg:-translate-x-1/2 lg:-translate-y-1/2 top-0 left-5 w-60 rounded-lg bg-gradient-to-br from-violet-900 to-violet-700 ${
                  showChat ? "visible" : "invisible"
                }`}
              >
                <div className="relative flex flex-col w-full h-64 gap-2 p-2 overflow-y-auto break-words" ref={messageContent}></div>
                <div className="flex items-center self-end justify-between  w-[230px] mb-1">
                  <input
                    type="text"
                    placeholder="Enter message"
                    className="p-1 text-white bg-transparent border border-white rounded-lg"
                    value={message}
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                  />
                  <button className="" onClick={() => sendText()}>
                    <IoSend size={20} className="mr-2 invert" />
                  </button>
                </div>
              </div>
            </div>

            {isDraw ? (
              <div className="mt-6 text-sm font-medium tracking-wider text-center text-white font-base3 lg:text-3xl md:text-xl">
                <p>This is a Draw</p>
              </div>
            ) : (
              <div className="mt-2 text-sm font-medium tracking-wider text-white font-base3 lg:text-3xl md:text-xl ">
                {finishedState ? (
                  `The winner is ${winner}`
                ) : (
                  <div className="text-center">
                    <p>{`You are playing with ${playingAs}`}</p>
                    <button
                      className="px-4 py-2 mt-4 text-xs text-white transition-all bg-gray-600 border border-white rounded-md hover:bg-gray-500 font-base3"
                      onClick={async () => {
                        resetCreds();
                        await useSocket.emit("removePlayer");
                        // window.location.reload();
                      }}
                    >
                      Exit Game
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        <button
          className="h-16 text-xl tracking-widest transition-all w-44 activeName font-base3"
          onClick={() => {
            startSocket();
          }}
        >
          Play Online
        </button>
      )}
      {winner || isDraw ? (
        <button
          className="w-auto px-4 py-4 m-0 text-sm tracking-widest transition-all lg:text-lg md:text-base activeName font-base3"
          onClick={() => {
            resetCreds();
          }}
        >
          Play Again
        </button>
      ) : (
        ""
      )}
    </div>
  );
};

export default playOnline;
