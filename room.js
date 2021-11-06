class Room {
  constructor(io, roomId) {
    this.io = io;
    this.room = roomId;
    this.players = [];
    this.roundTime = 80;
    this.timer = null;
    this.rounds = 15;
  }

  joinPlayer(socket, name, team, isDetective, isHost) {
    const player = this.players.find((p) => p.name === name);

    if (player !== undefined) {
      return false;
    }
    this.players.push({ name, team, isDetective, isHost, socketId: socket.id });
    socket.join(this.room);
    socket.room = this.room;
    this.io.to(this.room).emit("teamsUpdated", this.players);
    return true;
  }

  updatePlayer(name, team, isDetective) {
    const player = this.players.find((p) => p.name === name);

    if (player !== undefined) {
      player.team = team;
      player.isDetective = isDetective;
      this.io.to(this.room).emit("teamsUpdated", this.players);
    }
  }

  removePlayer(socketId) {
    this.players = this.players.filter((p) => p.socketId !== socketId);

    this.io.to(this.room).emit("teamsUpdated", this.players);
  }

  createGame(words) {
    console.log("creating game");
    this.time = this.roundTime;
    this.words = words;
    this.wordArr = [];
    this.index = -1;
    this.iteration = -1;
    this.score = [0, 0];
    this.prevScore = [0, 0];
    this.turn = Math.floor(Math.random() * 2);
    this.gameState = "not_started";

    this.words.forEach((word) => {
      this.wordArr.push({
        word: word.word,
        size: word.size,
        difficulty: word.difficulty,
        guessed: false,
        color: "",
      });
    });

    this.io.to(this.room).emit("updateCards", this.wordArr);
    this.io.to(this.room).emit("updateScore", this.score);
    this.io.to(this.room).emit("updateTurn", this.turn);
    this.io.to(this.room).emit("openCards");
    this.io.to(this.room).emit("startGame");

    this.updateState();
  }

  goToChoosing() {
    this.gameState = "choosing";
    const prevIndex = this.index;
    this.time = this.roundTime;
    this.index = -1;
    this.iteration += 1;
    this.turn = (this.turn + 1) % 2;

    this.io.to(this.room).emit("stopDraw");

    if (prevIndex !== -1) {
      const prevWord = this.wordArr[prevIndex];
      const score = this.score;
      const prevScore = this.prevScore;
      prevWord.guessed = true;

      if (score[0] - prevScore[0] > score[1] - prevScore[1])
        prevWord.color = "red";
      else if (score[0] - prevScore[0] < score[1] - prevScore[1])
        prevWord.color = "blue";
      else prevWord.color = "gray";
    }

    if (this.timer) clearInterval(this.timer);

    console.log("choosing");

    if (this.iteration > 0) {
      let word = "";
      if (prevIndex > -1) {
        word = this.wordArr[prevIndex].word;
      }
      this.io.to(this.room).emit("onShowWord", word);
      setTimeout(() => {
        if (this.gameState === "choosing") {
          this.io.to(this.room).emit("openCards");
        }
      }, 4500);
    } else {
      this.io.to(this.room).emit("openCards");
    }

    this.io.to(this.room).emit("updateTurn", this.turn);
    this.io.to(this.room).emit("setSelected", -1);
    this.io.to(this.room).emit("resetTime", this.time);
    this.io.to(this.room).emit("updateWordLen", -1);
    this.io.to(this.room).emit("updateCards", this.wordArr);
    this.io.to(this.room).emit("getMessage", {
      type: 3,
      msg: `${this.turn === 0 ? "Red" : "Blue"} is choosing...`,
    });

    const redTeamOp = this.players
      .filter((p) => p.team === 0 && p.isDetective === false)
      .map((p) => p.name);
    const blueTeamOp = this.players
      .filter((p) => p.team === 1 && p.isDetective === false)
      .map((p) => p.name);

    this.teams = [redTeamOp, blueTeamOp];
    this.prevScore = [this.score[0], this.score[1]];
  }

  goToGuessing() {
    console.log("guessing");

    this.gameState = "guessing";

    this.io.to(this.room).emit("onClear");
    this.io.to(this.room).emit("onBrushRadius", 5);
    this.io.to(this.room).emit("onBrushColor", "black");

    this.io.to(this.room).emit("closeCards");
    this.io.to(this.room).emit("updateWordLen", this.wordArr[this.index].size);
    this.io.to(this.room).emit("startDraw");

    this.timer = setInterval(() => {
      this.time -= 1;
      this.io.to(this.room).emit("updateTime", this.time);
    }, 1000);

    const currentIteration = this.iteration;
    setTimeout(() => {
      if (currentIteration === this.iteration) this.updateState();
    }, (this.roundTime + 1) * 1000);
  }

  updateState() {
    if (this.gameState === "not_started") this.goToChoosing();
    else if (this.gameState === "choosing") this.goToGuessing();
    else if (this.gameState === "guessing") {
      if (this.iteration < this.rounds) this.goToChoosing();
      else {
        let word = "";
        if (this.index > -1) {
          word = this.wordArr[this.index].word;
        }
        this.io.to(this.room).emit("onShowWord", word);
        this.io.to(this.room).emit("resetTime");

        setTimeout(() => {
          this.gameState = "ended";

          let winningTeam = "";
          if (this.score[0] > this.score[1]) winningTeam = "red";
          else if (this.score[0] < this.score[1]) winningTeam = "blue";
          else winningTeam = "draw";

          this.io.to(this.room).emit("endGame", winningTeam);
        }, 4000);
      }
    }
  }
}

module.exports = Room;
