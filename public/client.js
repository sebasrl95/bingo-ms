const socket = io();
let card = [];

socket.on("card", (data) => {
  card = data;
  const table = document.getElementById("card");
  table.innerHTML = "";
  data.forEach((col, c) => {
    col.forEach((num, r) => {
      let cell = document.createElement("td");
      cell.textContent = num;
      cell.onclick = () => {
        socket.emit("mark", { row: r, col: c });
        cell.classList.add("mark");
      };
      table.appendChild(cell);
    });
  });
});

socket.on("ball", (text) => {
  document.getElementById("ball").textContent = "🟣 Balota: " + text;
});

socket.on("bingo", (winner) => {
  if (socket.id === winner.id) alert("¡Ganaste BINGO! 🎉");
  else alert("Otro jugador ganó! 🎉");
});
