const manageLobby = (socket, rooms) => {
  socket.on("updateTeams", ({ name, room, color, informer }) => {
    // console.log(room);
    // console.log(rooms);
    const index = rooms[room]?.players.findIndex((a) => a.name === name);

    if (index !== -1) {
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
};

module.exports = manageLobby;
