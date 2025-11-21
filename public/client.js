const socket = io();
let card = [];

socket.on("card", (data) => {
  card = data;
  renderCard(data);
});

socket.on("ball", (text) => {
  const ballDiv = document.getElementById("ball");
  ballDiv.textContent = "🟣 Balota: " + text;
  document.getElementById("soundBall").play();

  ballDiv.classList.add("scale-150");
  setTimeout(() => ballDiv.classList.remove("scale-150"), 300);
});

socket.on("bingo", (winner) => {
  document.getElementById("soundWin").play();

  if (socket.id === winner.id) alert("🎉 ¡Ganaste BINGO! 🎉");
  else alert("🏆 Otro jugador ha ganado el BINGO!");
});

function renderCard(data) {
  const table = document.getElementById("card");
  const headers = ["B", "I", "N", "G", "O"];

  table.innerHTML = `
    <thead class="bg-purple-700 text-white">
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
