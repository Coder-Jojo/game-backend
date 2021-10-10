const { v4: uuidv4 } = require("uuid");

const managePlayers = (socket, players, rooms) => {
  const addPlayer = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingPlayer = players.find(
      (player) => player.room === room && player.name === name
    );

    if (!name || !room) return { error: "Name and room are required." };
    if (existingPlayer) return { error: "Name is taken." };

    const player = { id, name, room };

    players.push(player);

    return { player };
  };

  socket.on("createRoom", (name, callback) => {
    const room = uuidv4();
    const initialRoomState = {
      players: [{ name, team: -1, host: true, informer: false }],
      gameState: "not started",
      score: [0, 0],
      turn: 0,
      currentWord: "jojo",
      turns_left: 16,
    };
    rooms[room] = initialRoomState;
    addPlayer({ id: socket.id, name, room });
    socket.join(room);
    // socket.broadcast.emit("teamsUpdated", rooms[room].players);
    socket.broadcast.to(room).emit("teamsUpdated", rooms[room].players);
    socket.emit("teamsUpdated", rooms[room].players);

    // console.log(rooms[room].players);
    // console.log(players);
    callback(room);
  });

  socket.on("join", ({ name, room }, callback) => {
    if (rooms[room] === undefined) {
      const err = "This room does not exist";
      callback(err);
    }

    const { error, player } = addPlayer({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.join(room);
    rooms[room].players.push({ name, team: -1, host: false, informer: false });

    socket.broadcast.to(player.room).emit("teamsUpdated", rooms[room].players);
    socket.emit("teamsUpdated", rooms[room].players);
    // console.log(rooms[room]);

    callback();
  });
};

const getPlayer = (id) => players.find((player) => player.id === id);

const getPlayersInRoom = (room) =>
  players.filter((player) => player.room === room);

const removePlayer = (socket, id, players, rooms) => {
  const index = players?.findIndex((player) => player.id === id);

  if (index !== -1 && index !== undefined) {
    const player = players.splice(index, 1)[0];
    const room = player.room;
    const name = player.name;
    rooms[room].players = rooms[room].players.filter(
      (player) => player.name !== name
    );
    console.log(rooms[room].players);
    socket.broadcast.to(room).emit("teamsUpdated", rooms[room].players);

    return player;
  }
};

module.exports = { managePlayers, removePlayer, getPlayersInRoom, getPlayer };
