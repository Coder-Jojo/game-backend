const manageChats = (socket) => {
  socket.on("sendMessage", (message) => {
    socket.broadcast.emit("getMessage", message);
    socket.emit("getMessage", message);
  });
};

module.exports = manageChats;
