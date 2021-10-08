const drawing = (socket, arr) => {
  socket.on("drawing", ({ x, y }) => {
    arr.push({ x, y, z: 0 });
    socket.broadcast.emit("onDraw", { x, y });
  });

  socket.on("down", ({ x, y }) => {
    arr.push({ x, y, z: 1 });
    socket.broadcast.emit("onDown", { x, y });
  });
};

module.exports = drawing;
