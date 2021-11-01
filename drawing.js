const drawing = (socket, arr) => {
  // socket.on("drawing", ({ x, y }) => {
  //   arr.push({ x, y, z: 0 });
  //   socket.broadcast.emit("onDraw", { x, y });
  // });

  // socket.on("down", ({ x, y }) => {
  //   arr.push({ x, y, z: 1 });
  //   socket.broadcast.emit("onDown", { x, y });
  // });
  // socket.on("updateDrawing", ({ room, data }) => {
  //   socket.to(room).emit("setDrawing", data);
  // });

  socket.on("draw", ({ room, x, y }) => {
    socket.to(room).emit("onDraw", { x, y });
  });

  socket.on("startDrawing", ({ room, x, y }) => {
    socket.to(room).emit("onStartDrawing", { x, y });
  });

  socket.on("finishDrawing", ({ room }) => {
    socket.to(room).emit("onFinishDrawing");
  });

  socket.on("clear", ({ room }) => {
    socket.to(room).emit("onClear");
  });

  socket.on("brushRadius", ({ room, brushRadius }) => {
    socket.to(room).emit("onBrushRadius", brushRadius);
  });

  socket.on("brushColor", ({ room, brushColor }) => {
    socket.to(room).emit("onBrushColor", brushColor);
  });
};

module.exports = drawing;
