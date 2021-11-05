const { updateState } = require("./gameStates");

const manageChats = (socket, rooms) => {
  socket.on("sendMessage", ({ name, room, message }) => {
    const roomState = rooms[room];

    let update = false;

    if (roomState !== undefined) {
      const player = roomState.players.find((p) => p.name === name);

      if (player !== undefined) {
        const newMessage = {
          msg: "",
          type: -1,
          name: name,
        };

        if (
          roomState.index !== -1 &&
          message == roomState.wordArr[roomState.index].word
        ) {
          if (roomState.turn === 0 && roomState.gameState === "guessing") {
            if (player.team === 0 && roomState.teams[0].includes(player.name)) {
              const score = Math.ceil(
                (roomState.wordArr[roomState.index].difficulty *
                  roomState.time) /
                  80
              );
              newMessage.msg = `${name} has guessed the answer correctly`;
              newMessage.type = 2;
              newMessage.name = "";
              roomState.score[0] += score;

              // updateState(roomState, socket);
              update = true;
            } else if (
              player.team === 1 &&
              roomState.teams[1].includes(player.name)
            ) {
              const score = Math.ceil(
                (roomState.wordArr[roomState.index].difficulty *
                  roomState.time) /
                  160
              );
              newMessage.msg = `${name} has guessed the answer correctly`;
              newMessage.type = 2;
              newMessage.name = "";
              roomState.score[1] += score;
              roomState.teams[1] = [];
            }
          } else if (
            roomState.turn === 1 &&
            roomState.gameState === "guessing"
          ) {
            if (player.team === 0 && roomState.teams[0].includes(player.name)) {
              const score = Math.ceil(
                (roomState.wordArr[roomState.index].difficulty *
                  roomState.time) /
                  160
              );
              newMessage.msg = `${name} has guessed the answer correctly`;
              newMessage.type = 2;
              newMessage.name = "";
              roomState.score[0] += score;
              roomState.teams[0] = [];
            } else if (
              player.team === 1 &&
              roomState.teams[1].includes(player.name)
            ) {
              const score = Math.ceil(
                (roomState.wordArr[roomState.index].difficulty *
                  roomState.time) /
                  80
              );
              newMessage.msg = `${name} has guessed the answer correctly`;
              newMessage.type = 2;
              newMessage.name = "";
              roomState.score[1] += score;

              // updateState(roomState, socket);
              update = true;
            }
          }
        } else {
          newMessage.msg = message;
          newMessage.type = player.team;
        }

        // console.log(roomState.score, roomState.time / 80);

        socket.to(room).emit("getMessage", newMessage);
        socket.to(room).emit("updateScore", roomState.score);
        socket.emit("getMessage", newMessage);
        socket.emit("updateScore", roomState.score);

        if (update) updateState(roomState, socket);
      }
    }
  });
};

module.exports = manageChats;
