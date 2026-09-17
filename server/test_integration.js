import { io } from "../tictactoe/node_modules/socket.io-client/build/esm/index.js";

const SERVER_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== Starting Real-Time Tic-Tac-Toe Integration Tests ===");

  // -------------------------------------------------------------
  // Test 1: Connect 2 test clients
  // -------------------------------------------------------------
  const clientA = io(SERVER_URL, { autoConnect: true });
  const clientB = io(SERVER_URL, { autoConnect: true });

  await new Promise((resolve) => {
    let connected = 0;
    const check = () => {
      connected++;
      if (connected === 2) resolve();
    };
    clientA.on("connect", check);
    clientB.on("connect", check);
  });

  console.log("✓ Client A and Client B connected to server successfully.");

  // -------------------------------------------------------------
  // Test 2: Global Matchmaking
  // -------------------------------------------------------------
  let matchDataA = null;
  let matchDataB = null;

  const matchPromise = new Promise((resolve) => {
    let done = 0;
    clientA.on("game:match_start", (data) => {
      matchDataA = data;
      done++;
      if (done === 2) resolve();
    });
    clientB.on("game:match_start", (data) => {
      matchDataB = data;
      done++;
      if (done === 2) resolve();
    });
  });

  clientA.emit("matchmaking:join", { playerName: "Alice" });
  clientB.emit("matchmaking:join", { playerName: "Bob" });

  await matchPromise;
  console.log(`✓ Match formed: Room ${matchDataA.roomCode}`);
  console.log(`  Alice symbol: ${matchDataA.players.find((p) => p.socketId === clientA.id).symbol}`);
  console.log(`  Bob symbol: ${matchDataB.players.find((p) => p.socketId === clientB.id).symbol}`);

  const alicePlayer = matchDataA.players.find((p) => p.socketId === clientA.id);
  const bobPlayer = matchDataA.players.find((p) => p.socketId === clientB.id);

  // -------------------------------------------------------------
  // Test 3: Chat between players
  // -------------------------------------------------------------
  const chatPromise = new Promise((resolve) => {
    clientB.on("chat:receive", (data) => {
      if (data.message === "Hello Bob!") {
        console.log("✓ Chat message received by Bob:", data.message);
        resolve();
      }
    });
  });
  clientA.emit("chat:send", { message: "Hello Bob!" });
  await chatPromise;

  // -------------------------------------------------------------
  // Test 4: Quick Reactions
  // -------------------------------------------------------------
  const reactionPromise = new Promise((resolve) => {
    clientB.on("reaction:receive", (data) => {
      if (data.emoji === "🔥") {
        console.log("✓ Reaction received by Bob:", data.emoji);
        resolve();
      }
    });
  });
  clientA.emit("reaction:send", { emoji: "🔥" });
  await reactionPromise;

  // -------------------------------------------------------------
  // Test 5: Server-authoritative moves & win detection
  // -------------------------------------------------------------
  // Determine who plays X (X always starts)
  const playerX = alicePlayer.symbol === "X" ? clientA : clientB;
  const playerO = alicePlayer.symbol === "X" ? clientB : clientA;

  // Let's play:
  // X: 0
  // O: 3
  // X: 1
  // O: 4
  // X: 2  -> X wins on top row [0, 1, 2]!
  const winPromise = new Promise((resolve, reject) => {
    playerX.on("game:finish", (data) => {
      if (data.winner === "X" && data.winningLine && data.winningLine.join(",") === "0,1,2") {
        console.log("✓ Match finished correctly: Winner X with line [0, 1, 2]!");
        resolve();
      } else {
        reject(new Error("Unexpected finish data: " + JSON.stringify(data)));
      }
    });
  });

  // Turn 1: X plays 0
  playerX.emit("game:move", { cellIndex: 0 });
  await new Promise((r) => setTimeout(r, 60));

  // Turn 2: O plays 3
  playerO.emit("game:move", { cellIndex: 3 });
  await new Promise((r) => setTimeout(r, 60));

  // Turn 3: X plays 1
  playerX.emit("game:move", { cellIndex: 1 });
  await new Promise((r) => setTimeout(r, 60));

  // Turn 4: O plays 4
  playerO.emit("game:move", { cellIndex: 4 });
  await new Promise((r) => setTimeout(r, 60));

  // Turn 5: X plays 2 -> Win!
  playerX.emit("game:move", { cellIndex: 2 });
  await winPromise;

  // -------------------------------------------------------------
  // Test 6: Rematch negotiation
  // -------------------------------------------------------------
  const rematchPromise = new Promise((resolve) => {
    playerX.on("rematch:start", (data) => {
      console.log("✓ Rematch started! Fresh board:", data.board.every((c) => c === null));
      resolve();
    });
  });

  playerX.emit("rematch:request");
  await new Promise((r) => setTimeout(r, 50));
  playerO.emit("rematch:request");
  await rematchPromise;

  // Disconnect test clients
  clientA.disconnect();
  clientB.disconnect();

  // -------------------------------------------------------------
  // Test 7: Private Room Creation & Join
  // -------------------------------------------------------------
  const hostClient = io(SERVER_URL, { autoConnect: true });
  const guestClient = io(SERVER_URL, { autoConnect: true });

  const roomCodePromise = new Promise((resolve) => {
    hostClient.on("room:created", (data) => {
      console.log("✓ Private room created with code:", data.roomCode);
      resolve(data.roomCode);
    });
  });

  hostClient.emit("room:create", { playerName: "HostUser" });
  const roomCode = await roomCodePromise;

  const privateGamePromise = new Promise((resolve) => {
    guestClient.on("game:match_start", (data) => {
      if (data.roomCode === roomCode && data.isPrivate) {
        console.log("✓ Guest joined private room! Match start confirmed.");
        resolve();
      }
    });
  });

  guestClient.emit("room:join", { roomCode, playerName: "GuestUser" });
  await privateGamePromise;

  hostClient.disconnect();
  guestClient.disconnect();

  console.log("\n🎉 ALL 7 INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉\n");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
