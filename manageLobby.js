const manageLobby = (socket, rooms) => {
  socket.on("updateTeams", (name, room, team) => {
    const index = rooms[room].players.findIndex((a = a.name === name));

    if (index !== -1) {
      rooms[room].players[index].team = team;
      socket.emit("teamsUpdated", rooms[room].players);
    }
  });
};

module.exports = manageLobby;
