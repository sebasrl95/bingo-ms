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

  socket.on("mark", (data) => {
    const player = clients.find((c) => c.id === socket.id);
    if (!player) return;

    const { row, col } = data;
    player.marked[row][col] = true;

    const win = checkWin(player.card, player.marked);
    if (win) {
      io.emit("bingo", { id: socket.id });
      usedBalls = [];
    }
  });
});

// Balotas aleatorias cada 3 segundos
setInterval(() => {
  if (usedBalls.length >= 75) return;

  let num;
  do {
    num = Math.floor(Math.random() * 75) + 1;
  } while (usedBalls.includes(num));

  usedBalls.push(num);

  const letter =
    num <= 15 ? "B" : num <= 30 ? "I" : num <= 45 ? "N" : num <= 60 ? "G" : "O";

  io.emit("ball", `${letter}${num}`);
}, 6000);

http.listen(PORT, () =>
  console.log(`Servidor Bingo en http://localhost:${PORT}`)
);
