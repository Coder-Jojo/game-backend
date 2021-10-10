const manageChats = (socket, rooms) => {
  socket.on("sendMessage", ({ name, room, message }) => {
    const index = rooms[room]?.players.findIndex((a) => a.name === name);
    if (index !== -1 && index !== undefined) {
      const player = rooms[room].players[index];
      const newMessage = {
        msg: "",
        type: -1,
        name: name,
      };
      if (message === rooms[room].currentWord) {
        newMessage.msg = `${name} has guessed the answer correctly!`;
        newMessage.type = 2;
        newMessage.name = "";
      } else {
        newMessage.msg = message;
        newMessage.type = player.team;
      }
      socket.broadcast.to(room).emit("getMessage", newMessage);
      socket.emit("getMessage", newMessage);
    }
  });
};

module.exports = manageChats;
