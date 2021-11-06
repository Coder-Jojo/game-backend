const listeners = (socket, rooms) => {
  socket.on("getCards", (room, callback) => {
    // const roomState = rooms[room];
    callback(rooms[room]?.wordArr);
  });

  socket.on("getScore", (room, callback) => {
    // const roomState = rooms[room];
    callback(rooms[room]?.score);
  });

  socket.on("getTurn", (room, callback) => {
    // const roomState = rooms[room];
    callback(rooms[room]?.turn);
  });

  socket.on("setIndex", ({ room, selected: index }) => {
    // const roomState = rooms[room];
    // if (roomState === undefined) return;

    // if (room === roomState.room && roomState.gameState === "choosing") {
    //   roomState.index = index;
    //   updateState(roomState, socket);
    // }

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
};

module.exports = listeners;
