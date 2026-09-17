import { io } from "../tictactoe/node_modules/socket.io-client/build/esm/index.js";

const SERVER_URL = "http://localhost:3000";

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
  const startPromise = new Promise((resolve) => {
    let count = 0;
    p1.on("game:match_start", () => {
      count++;
      if (count === 2) resolve();
    });
    p2.on("game:match_start", () => {
      count++;
      if (count === 2) resolve();
    });
  });

  p1.emit("matchmaking:join", { playerName: "PlayerOne" });
  p2.emit("matchmaking:join", { playerName: "PlayerTwo" });
  await startPromise;
  console.log("✓ Match started between PlayerOne and PlayerTwo.");

  // Play to a win for X
  // Check who is X
  let pX = p1;
  let pO = p2;
  // Make 5 moves to win: 0, 3, 1, 4, 2
  pX.emit("game:move", { cellIndex: 0 });
  await new Promise((r) => setTimeout(r, 80));
  pO.emit("game:move", { cellIndex: 3 });
  await new Promise((r) => setTimeout(r, 80));
  pX.emit("game:move", { cellIndex: 1 });
  await new Promise((r) => setTimeout(r, 80));
  pO.emit("game:move", { cellIndex: 4 });
  await new Promise((r) => setTimeout(r, 80));

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
