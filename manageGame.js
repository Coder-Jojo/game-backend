const listeners = require("./gameStateEventListeners");
// const { goToCreateGame } = require("./gameStates.js");
const getWords = require("./words/getWords");

const manageGame = (socket, rooms) => {
  try {
    listeners(socket, rooms);
    socket.on("createGame", (room) => {
      const roomState = rooms[room];

      if (roomState !== undefined) {
        roomState.createGame(getWords());
        console.log("Initialized");
      }
    });
  } catch (err) {
    console.error(err);
  }
};

module.exports = manageGame;
