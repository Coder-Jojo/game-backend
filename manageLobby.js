const manageLobby = (socket, rooms) => {
  socket.on("updateTeams", ({ name, room, color, informer }) => {
    // console.log(room);
    // console.log(rooms);
    const index = rooms[room]?.players.findIndex((a) => a.name === name);

    if (index !== -1 && index !== undefined) {
      rooms[room].players[index].team = color;
      rooms[room].players[index].informer = informer;
      socket.broadcast.to(room).emit("teamsUpdated", rooms[room].players);
      socket.emit("teamsUpdated", rooms[room].players);
      // socket.broadcast.emit("teamsUpdated", rooms[room].players);
    }
  });

  socket.on("getLobbyStatus", (room, callback) => {
    // console.log("woasdf");
    callback(rooms[room]?.players);
  });

  socket.on("reset", (room) => {
    rooms[room].players.forEach((ply) => {
      ply.team = -1;
    });
    socket.broadcast.to(room).emit("teamsUpdated", rooms[room].players);
    socket.emit("teamsUpdated", rooms[room].players);
  });

  socket.on("isHost", ({ name, room }, callback) => {
    const index = rooms[room]?.players.findIndex((a) => a.name === name);

    if (index !== -1) {
      callback(rooms[room].players[index].host);
    } else {
      callback(false);
    }
  });

  socket.on("createGame", (room, callback) => {
    let redInformer = false;
    let blueInformer = false;

    rooms[room]?.players.forEach((ply) => {
      if (ply.informer === true && ply.team === 0) redInformer = true;
      if (ply.informer === true && ply.team === 1) blueInformer = true;
    });

    if (redInformer || blueInformer) {
      socket.broadcast.to(room).emit("startGame");
      socket.emit("startGame");
      callback();
    } else {
      const err = "Detective is missing in one or both the teams!!";
      callback(err);
    }
  });
};

module.exports = manageLobby;
