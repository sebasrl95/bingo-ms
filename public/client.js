const socket = io();
let card = [];

socket.on("card", (data) => {
  card = data;
  renderCard(data);
});

const lastBalls = [];

socket.on("ball", (text) => {
  const ballDiv = document.getElementById("ball");
  ballDiv.textContent = "⚪ Balota: " + text;
  document.getElementById("soundBall").play();

  ballDiv.classList.add("scale-150");
  setTimeout(() => ballDiv.classList.remove("scale-150"), 300);

  // Guardar últimas 10 balotas
  lastBalls.unshift(text);
  if (lastBalls.length > 10) lastBalls.pop();

  // Render lista
  const lb = document.getElementById("lastBalls");
  lb.innerHTML = "";
  lastBalls.forEach((b) => {
    const li = document.createElement("li");
    li.textContent = b;
    li.className = "p-2 bg-gray-700 rounded text-center";
    lb.appendChild(li);
  });
});

socket.on("players", (players) => {
  const list = document.getElementById("playersList");
  list.innerHTML = "";
  players.forEach((p) => {
    const li = document.createElement("li");
    li.textContent =
      (p.name || "Jugador") + (p.id === socket.id ? " (Yo)" : "");
    li.className = "p-2 bg-gray-700 rounded";
    list.appendChild(li);
  });
});

socket.on("bingo", (winner) => {
  document.getElementById("soundWin").play();

  if (socket.id === winner.id) alert("🎉 ¡Ganaste BINGO! 🎉");
  else alert(`🏆 ${winner.name || "Un jugador"} ha ganado el BINGO!`);
});

function setName() {
  const name = document.getElementById("playerName").value.trim();
  if (name.length < 2) return alert("Debe ingresar un nombre válido");
  socket.emit("setName", name);
  alert("Nombre Guardado ✔️");
}

function renderCard(data) {
  const table = document.getElementById("card");
  const headers = ["B", "I", "N", "G", "O"];

  table.innerHTML = `
    <thead class="bg-green-700 text-white">
      <tr>
        ${headers
          .map((h) => `<th class="px-4 py-2 text-xl">${h}</th>`)
          .join("")}
      </tr>
    </thead>
    <tbody class="bg-white text-black font-bold text-xl"></tbody>
  `;

  const tbody = table.querySelector("tbody");

  for (let row = 0; row < 5; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < 5; col++) {
      const td = document.createElement("td");
      td.textContent = data[col][row];
      td.className =
        "w-16 h-16 text-center border border-gray-300 cursor-pointer hover:bg-yellow-200";
      td.onclick = () => {
        socket.emit("mark", { row, col });
        td.classList.add("bg-yellow-400", "text-black");
      };
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

socket.on("restart", () => {
  alert("Nuevo juego comenzando… ¡Suerte!");

  // Limpiar balota actual y lista de últimas balotas
  document.getElementById("ball").textContent = "";
  lastBalls.length = 0; // Vaciar arreglo
  document.getElementById("lastBalls").innerHTML = ""; // Vaciar UI

  // Reiniciar sonidos
  const s1 = document.getElementById("soundBall");
  const s2 = document.getElementById("soundWin");

  [s1, s2].forEach((snd) => {
    snd.pause();
    snd.currentTime = 0;
  });
});
