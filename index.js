const express = require("express");
require("dotenv").config();
const cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const drawing = require("./drawing");
const manageChats = require("./manageChats");
const { managePlayers, removePlayer } = require("./managePlayers");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", (req, res) => {
  res.send("server is running!!!!!");
});

corsOptions = {
  cors: true,
  origins: "*",
};

const server = http.createServer(app);
const io = socketio(server, corsOptions);

const rooms = [];
const players = [];
// const players = [];

io.on("connect", (socket) => {
  console.log(`${socket.id} has connected`);
  //   socket.emit("initialBoardState", arr);

  drawing(socket, rooms);
  manageChats(socket, players);
  managePlayers(socket, players, rooms);

  socket.on("sendInfo", (room, callback) => {
    console.log(rooms);
    callback(rooms[room]);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} has disconnected`);
    removePlayer(socket.id, players);
    // io.emit("getUsers", userArr);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Backend server is running!");
});
