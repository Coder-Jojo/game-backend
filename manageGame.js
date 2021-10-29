const listeners = require("./gameStateEventListeners");
const { goToCreateGame } = require("./gameStates.js");

const manageGame = (socket, rooms) => {
  try {
    listeners(socket, rooms);
    socket.on("createGame", (room) => {
      const roomState = rooms[room];
      goToCreateGame(roomState, socket, room);
      console.log("Initialized");
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = manageGame;
