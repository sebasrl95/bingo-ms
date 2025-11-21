/**
 * Función para generar una tarjeta de bingo
 * @returns card - Una matriz 5x5 representando la tarjeta de bingo
 */
function generateCard() {
  const ranges = {
    B: [1, 15],
    I: [16, 30],
    N: [31, 45],
    G: [46, 60],
    O: [61, 75],
  };

  const card = [];
  Object.values(ranges).forEach(([min, max]) => {
    const nums = [];
    while (nums.length < 5) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!nums.includes(num)) nums.push(num);
    }
    card.push(nums);
  });
  return card;
}

/**
 * Función para verificar si hay un ganador en la tarjeta de bingo
 * @param {*} card
 * @param {*} marked
 * @returns boolean - true si hay un ganador, false en caso contrario
 */
function checkWin(card, marked) {
  // Verificar filas
  for (let row = 0; row < 5; row++) {
    if (marked[row].every((v) => v)) return true;
  }
  // Verificar columnas
  for (let col = 0; col < 5; col++) {
    if ([0, 1, 2, 3, 4].every((row) => marked[row][col])) return true;
  }
  return false;
}

module.exports = { generateCard, checkWin };
