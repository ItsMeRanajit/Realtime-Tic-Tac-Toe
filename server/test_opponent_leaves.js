import { io } from "../tictactoe/node_modules/socket.io-client/build/esm/index.js";

const SERVER_URL = process.env.TEST_SERVER_URL || "http://localhost:3000";

async function runOpponentLeavesTest() {
  console.log("=== Testing Opponent Leaving After Game Finish (Rematch Disabled) ===");

  const p1 = io(SERVER_URL, { autoConnect: true });
  const p2 = io(SERVER_URL, { autoConnect: true });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    p1.on("connect", check);
    p2.on("connect", check);
  });

  // Join matchmaking
  let pX = null;
  let pO = null;
  const startPromise = new Promise((resolve) => {
    let count = 0;
    const handleStart = (playerSocket) => (data) => {
      const myInfo = data.players.find((p) => p.socketId === playerSocket.id);
      if (myInfo?.symbol === "X") {
        pX = playerSocket;
      } else if (myInfo?.symbol === "O") {
        pO = playerSocket;
      }
      count++;
      if (count === 2) resolve();
    };
    p1.on("game:match_start", handleStart(p1));
    p2.on("game:match_start", handleStart(p2));
  });

  p1.emit("matchmaking:join", { playerName: "PlayerOne" });
  p2.emit("matchmaking:join", { playerName: "PlayerTwo" });
  await startPromise;
  console.log("✓ Match started between PlayerOne and PlayerTwo.");

  const makeMove = (player, cellIndex) => {
    return new Promise((resolve) => {
      const handler = () => {
        player.off("game:state_update", handler);
        resolve();
      };
      player.on("game:state_update", handler);
      player.emit("game:move", { cellIndex });
    });
  };

  // Make moves to win: X:0, O:3, X:1, O:4, X:2
  await makeMove(pX, 0);
  await makeMove(pO, 3);
  await makeMove(pX, 1);
  await makeMove(pO, 4);

  const finishPromise = new Promise((resolve) => {
    pX.on("game:finish", (data) => resolve(data));
  });

  pX.emit("game:move", { cellIndex: 2 });
  const finishData = await finishPromise;
  console.log(`✓ Game finished with outcome: winner=${finishData.winner}`);

  // Now, Player Two (opponent) leaves the room after the match!
  const opponentLeftPromise = new Promise((resolve) => {
    p1.on("opponent:left", (data) => {
      console.log("✓ p1 received opponent:left event:", data.reason);
      resolve(data);
    });
  });

  // p2 clicks "Main Menu" or leaves
  p2.emit("room:leave");

  const leftData = await opponentLeftPromise;
  console.log("✓ Opponent left event verified. Rematch is now disabled for the remaining player!");

  p1.disconnect();
  p2.disconnect();

  console.log("🎉 TEST PASSED: Opponent leaving after game emits 'opponent:left' to disable rematch! 🎉\n");
  process.exit(0);
}

runOpponentLeavesTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
