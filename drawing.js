const drawing = (socket) => {
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
