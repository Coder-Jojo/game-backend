const express = require("express");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const drawing = require("./drawing");
const manageChats = require("./manageChats");
const managePlayers = require("./managePlayers");
const manageLobby = require("./manageLobby");
const manageGame = require("./manageGame");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", (req, res) => {
  res.send("server is running!!!!!");
});

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const rooms = {};

io.on("connect", (socket) => {
  console.log(`${socket.id} has connected`);

  drawing(socket, rooms);
  manageChats(socket, rooms);
  // managePlayers(socket, players, rooms);
  manageLobby(socket, rooms);
  manageGame(socket, rooms);

  managePlayers(io, socket, rooms);

  socket.on("disconnect", () => {
    console.log(`${socket.id} has disconnected`);
    rooms[socket.room]?.removePlayer(socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Backend server is running!");
});
