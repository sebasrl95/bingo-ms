const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const { generateCard, checkWin } = require("./utils/bingo");
const PORT = 3000;

let clients = []; // Lista de jugadores
let usedBalls = []; // Balotas ya cantadas

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Nuevo jugador:", socket.id);

  const card = generateCard();
  const marked = Array.from({ length: 5 }, () => Array(5).fill(false));

  clients.push({ id: socket.id, card, marked });

  socket.emit("card", card);

  socket.on("setName", (name) => {
    const player = clients.find((c) => c.id === socket.id);
    if (player) player.name = name;
    console.log(`Jugador ${socket.id} estableció su nombre a ${name}`);
    io.emit("players", clients);
  });

  socket.on("mark", (data) => {
    const player = clients.find((c) => c.id === socket.id);
    if (!player) return;

    const { row, col } = data;
    player.marked[row][col] = true;

    const win = checkWin(player.card, player.marked);
    if (win) {
      io.emit("bingo", { id: socket.id, name: player?.name || "Jugador" });

      setTimeout(() => {
        // Reiniciar balotas y sorteo
        usedBalls = [];
        clearInterval(ballInterval); // Detener actual
        startBallInterval(); // Crear uno nuevo

        // Nueva carta para cada jugador
        clients.forEach((p) => {
          p.card = generateCard();
          p.marked = Array.from({ length: 5 }, () => Array(5).fill(false));

          const socketPlayer = io.sockets.sockets.get(p.id);
          if (socketPlayer) socketPlayer.emit("card", p.card);
        });

        io.emit("restart");
      }, 5000);
    }
  });

  socket.on("disconnect", () => {
    clients = clients.filter((c) => c.id !== socket.id);
    io.emit("players", clients);
  });
});

// Balotas aleatorias cada 10 segundos
let ballInterval = null;

function startBallInterval() {
  ballInterval = setInterval(() => {
    if (usedBalls.length >= 75) return;

    let num;
    do {
      num = Math.floor(Math.random() * 75) + 1;
    } while (usedBalls.includes(num));

    usedBalls.push(num);

    const letter =
      num <= 15
        ? "B"
        : num <= 30
        ? "I"
        : num <= 45
        ? "N"
        : num <= 60
        ? "G"
        : "O";

    io.emit("ball", `${letter}${num}`);
  }, 10000);
}

startBallInterval();

http.listen(PORT, () =>
  console.log(`Servidor Bingo en http://localhost:${PORT}`)
);
