const getWords = require("./words/getWords");

let timer = null;

const resetBoard = (room, socket) => {
  socket.to(room).emit("onClear");
  socket.to(room).emit("onBrushRadius", 5);
  socket.to(room).emit("onBrushColor", "black");

  socket.emit("onClear");
  socket.emit("onBrushRadius", 5);
  socket.emit("onBrushColor", "black");
};

const goToChoosing = (roomState, socket) => {
  roomState.gameState = "choosing";
  const prevIndex = roomState.index;
  roomState.index = -1;
  roomState.iteration += 1;
  roomState.time = 80;
  roomState.turn = (roomState.turn + 1) % 2;

  if (prevIndex !== -1) {
    const prevWord = roomState.wordArr[prevIndex];
    const score = roomState.score;
    const prevScore = roomState.prevScore;
    prevWord.guessed = true;

    if (score[0] - prevScore[0] > score[1] - prevScore[1])
      prevWord.color = "red";
    else if (score[0] - prevScore[0] < score[1] - prevScore[1])
      prevWord.color = "blue";
    else prevWord.color = "gray";
  }

  if (timer) clearInterval(timer);

  console.log("choosing");

  if (roomState.iteration > 0) {
    let word = "";
    if (prevIndex > -1) {
      word = roomState.wordArr[prevIndex].word;
    }
    socket.to(roomState.room).emit("onShowWord", word);
    socket.emit("onShowWord", word);

    setTimeout(() => {
      if (roomState.gameState === "choosing") {
        socket.to(roomState.room).emit("openCards");
        socket.emit("openCards");
      }
    }, 4500);
  } else {
    socket.to(roomState.room).emit("openCards");
    socket.emit("openCards");
  }

  socket.to(roomState.room).emit("updateTurn", roomState.turn);
  socket.to(roomState.room).emit("setSelected", -1);
  socket.to(roomState.room).emit("resetTime", 80);
  socket.to(roomState.room).emit("updateWordLen", -1);
  socket.to(roomState.room).emit("updateCards", roomState.wordArr);
  socket.to(roomState.room).emit("getMessage", {
    type: 3,
    msg: `${roomState.turn === 0 ? "Red" : "Blue"} is choosing...`,
  });
  // socket.to(roomState.room).emit("openCards");

  socket.emit("updateTurn", roomState.turn);
  socket.emit("updateSelected", -1);
  socket.emit("resetTime", 80);
  socket.emit("updateWordLen", -1);
  socket.emit("updateCards", roomState.wordArr);
  socket.emit("getMessage", {
    type: 3,
    msg: `${roomState.turn === 0 ? "Red" : "Blue"} is choosing...`,
  });
  // socket.emit("openCards");

  const redTeamOp = roomState.players
    .filter((p) => p.team === 0 && p.informer === false)
    .map((p) => p.name);
  const blueTeamOp = roomState.players
    .filter((p) => p.team === 1 && p.informer === false)
    .map((p) => p.name);

  roomState.teams = [redTeamOp, blueTeamOp];
  roomState.prevScore = [roomState.score[0], roomState.score[1]];

  socket.to(roomState.room).emit("stopDraw");
  socket.emit("stopDraw");
};

const goToGuessing = (roomState, socket) => {
  console.log("guessing");

  roomState.gameState = "guessing";

  resetBoard(roomState.room, socket);

  socket.to(roomState.room).emit("closeCards");
  socket
    .to(roomState.room)
    .emit("updateWordLen", roomState.wordArr[roomState.index].size);
  socket.to(roomState.room).emit("startDraw");

  socket.emit("closeCards");
  socket.emit("updateWordLen", roomState.wordArr[roomState.index].size);
  socket.emit("startDraw");

  timer = setInterval(() => {
    roomState.time -= 1;
    socket.to(roomState.room).emit("updateTime", roomState.time);
    socket.emit("updateTime", roomState.time);
  }, 1000);

  const currentIteration = roomState.iteration;
  setTimeout(() => {
    if (currentIteration === roomState.iteration)
      updateState(roomState, socket);
  }, 80000);
};

const goToCreateGame = (roomState, socket, room) => {
  console.log("creating game");

  roomState.room = room;
  roomState.words = getWords();
  roomState.wordArr = [];
  roomState.index = -1;
  roomState.iteration = -1;
  roomState.score = [0, 0];
  roomState.prevScore = [0, 0];
  roomState.turn = Math.floor(Math.random() * 2);
  roomState.gameState = "not_started";

  roomState.words.forEach((word) => {
    roomState.wordArr.push({
      word: word.word,
      size: word.size,
      difficulty: word.difficulty,
      guessed: false,
      color: "",
    });
  });

  socket.to(room).emit("updateCards", roomState.wordArr);
  socket.to(room).emit("updateScore", roomState.score);
  socket.to(room).emit("updateTurn", roomState.turn);
  socket.to(room).emit("openCards");

  socket.emit("updateCards", roomState.wordArr);
  socket.emit("updateScore", roomState.score);
  socket.emit("updateTurn", roomState.turn);
  socket.emit("openCards");

  updateState(roomState, socket);
};

const goToEnd = (roomState, socket) => {
  console.log("ending game");
  socket.to(roomState.room).emit("endGame");
  socket.emit("endGame");
};

const updateState = (roomState, socket) => {
  if (roomState.gameState === "not_started") goToChoosing(roomState, socket);
  else if (roomState.gameState === "choosing") goToGuessing(roomState, socket);
  else if (roomState.gameState === "guessing") {
    if (roomState.iteration < 15) goToChoosing(roomState, socket);
    else {
      let word = "";
      if (roomState.index > -1) {
        word = roomState.wordArr[roomState.index].word;
      }
      socket.to(roomState.room).emit("onShowWord", word);
      socket.emit("onShowWord", word);
      socket.to(roomState.room).emit("resetTime");
      socket.emit("resetTime");
      setTimeout(goToEnd, 4000, roomState, socket);
      // goToEnd(roomState, socket);
    }
  }
};

module.exports = { updateState, goToCreateGame };
