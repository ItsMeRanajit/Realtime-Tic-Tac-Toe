import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "https://realtime-tic-tac-toe.vercel.app",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
  transports: ["websocket"],
});

const allUsers = new Map();
let roomName;

io.on("connection", (socket) => {
  let opponent = null;
  allUsers.set(socket.id, { Socket: socket, online: true, playing: false, username: "demo", playingAs: "" });

  socket.on("req_to_play", (data) => {
    const currUser = allUsers.get(socket.id);
    currUser.username = data.playerName;

    allUsers.set(socket.id, currUser);

    for (let [id, user] of allUsers) {
      if (user.online && !user.playing && id !== socket.id && user.username !== "demo") {
        currUser.playing = true;
        allUsers.set(socket.id, currUser);
        opponent = user;
        opponent.playing = true;
        allUsers.set(opponent.Socket.id, opponent);
        break;
      }
    }

    if (opponent) {
      roomName = `room-${currUser.username}-${currUser.Socket.id}`;
      socket.join(roomName);
      opponent.Socket.join(roomName);

      io.to(roomName).emit("roomJoined", {
        room: roomName,
        players: {
          currentPlayer: { playerId: currUser.Socket.id, playerName: currUser.username, playingAs: "cross" },
          opponentPlayer: { playerId: opponent.Socket.id, playerName: opponent.username, playingAs: "circle" },
        },
      });
    } else {
      currUser.Socket.emit("opponentNotFound");
    }
  });

  socket.on("messageSent", function (data) {
    console.log(data);
    io.to(roomName).emit("messageRecieved", {
      message: data,
      sender: socket.id,
    });
  });

  socket.on("playerMoveUser", function (data) {
    console.log(data);
    io.to(roomName).emit("updateState", { ...data });
  });

  socket.on("disconnect", function () {
    io.to(roomName).emit("playerExit");
    allUsers.delete(socket.id);
  });
  socket.on("removePlayer", function () {
    allUsers.delete(socket.id);
    io.to(roomName).emit("playerExit");
  });
  socket.on("removePlayerFromSet", function () {
    allUsers.delete(socket.id);
  });
});

httpServer.listen(3000);
