const listeners = (socket, rooms) => {
  socket.on("getCards", (room, callback) => {
    callback(rooms[room]?.wordArr);
  });

  socket.on("getScore", (room, callback) => {
    callback(rooms[room]?.score);
  });

  socket.on("getTurn", (room, callback) => {
    callback(rooms[room]?.turn);
  });

  socket.on("setIndex", ({ room, selected: index }) => {
    const roomState = rooms[room];

    if (roomState !== undefined && roomState.gameState === "choosing") {
      roomState.index = index;
      roomState.updateState();
    }
  });

  socket.on("isDetective", ({ name, room }, callback) => {
    const roomState = rooms[room];
    const player = roomState?.players?.find((ply) => ply.name == name);

    if (player) callback(player.isDetective);
    else callback(false);
  });

  socket.on("isMyTurn", ({ room, name }, callback) => {
    const roomState = rooms[room];
    const player = roomState?.players?.find((player) => player.name === name);

    if (player) callback(roomState.turn === player.team);
    else callback(false);
  });

  socket.on("isGameRunning", (room, callback) => {
    const roomState = rooms[room];

    if (roomState !== undefined)
      callback(
        roomState.gameState === "choosing" ||
          roomState.gameState === "guessing" ||
          roomState.gameState === "not_started"
      );
    else callback(false);
  });

  socket.on("getRound", (room, callback) => {
    const roomState = rooms[room];
    if (roomState !== undefined) {
      callback({
        current: roomState.iteration + 1,
        total: roomState.rounds + 1,
      });
    } else {
      callback({
        current: -1,
        total: -1,
      });
    }
  });

  socket.on("joinRunningGame", ({ room, name }) => {
    const roomState = rooms[room];

    if (roomState !== undefined) {
      socket.emit("startGame");

      setTimeout(() => {
        if (roomState.gameState === "guessing") {
          socket.emit("updateWordLen", roomState.wordArr[roomState.index].size);
          socket.emit("startDraw");
          socket.emit("getMessage", {
            type: 5,
            msg: "You can join the game after this round!",
          });
        } else if (roomState.gameState === "choosing") {
          socket.emit("stopDraw");
          socket.emit("setSelected", -1);
          socket.emit("resetTime", roomState.time);
          socket.emit("updateWordLen", -1);

          const player = roomState.players.find((p) => p.name === name);
          if (player !== undefined && player.isDetective === false)
            roomState?.teams[player.team]?.push(player.name);
        }
      }, 2000);
    }
  });
};

module.exports = listeners;
