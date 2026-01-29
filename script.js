const size = 5;
const winLength = 4;
const cells = [];

const fullTitle = "🤖🕹️ Amőba játék 🕹️👾";

let gameState = new Array(size * size).fill("");
let gameActive = false;
let vsBot = false;
let difficulty = "easy";
let playerX = "Játékos 1";
let playerO = "Játékos 2";
let currentPlayer = "X";
let scores = { X: 0, O: 0 };
let gridSize = size;
let index = 0;

const fullText = "🤖🕹️ Amőba 🕹️👾";
  const titleEl = document.getElementById("title");
let index1 = 0;

// HTML elemek
const grid = document.getElementById("grid");
const startBtn = document.getElementById("startBtn");
const statusDiv = document.getElementById("status");
const player1Input = document.getElementById("player1");
const player2Input = document.getElementById("player2");
const gameModeSelect = document.getElementById("gameMode");
const scoreXEl = document.getElementById("scoreX");
const scoreOEl = document.getElementById("scoreO");
const currentTurnEl = document.getElementById("currentTurn");
const resetBtn = document.getElementById("resetBtn");

function typeTitleOnce() {
  if (index <= fullTitle.length) {
    document.title = fullTitle.substring(0, index) + "|";
    index++;
    setTimeout(typeTitleOnce, 150); // 150ms késleltetés karakterenként
  } else {
    document.title = fullTitle; // végén levesszük a kurzort
  }
}

typeTitleOnce(); // egyszeri meghívás

function typeText() {
  if (index1 <= fullText.length) {
    titleEl.textContent = fullText.substring(0, index1) + "▌";  // villogó kurzor jelleg
    index1++;
    setTimeout(typeText, 150); // karakterenkénti sebesség
  } else {
    titleEl.textContent = fullText;  // végleges szöveg, kurzor nélkül
  }
}

typeText(); // automatikusan indul


startBtn.addEventListener("click", () => {
  currentPlayer = "X";
  scores.X = 0;
  scores.O = 0;
  playerX = player1Input.value || "Játékos 1";
  playerO = player2Input.value || (gameModeSelect.value === "bot" ? "BOT" : "Játékos 2");

  vsBot = gameModeSelect.value === "bot";
  difficulty = "hard";

  if (vsBot && difficulty === "hard") {
    gridSize = 5;
  } else {
    gridSize = 5;
  }

  gameState = new Array(gridSize * gridSize).fill("");
  gameActive = true;

  document.getElementById("wrap").style.display = "block";

  updateScoreDisplay();
  drawBoard();
  currentTurnEl.textContent = `Következő: X`;
});

function drawBoard() {
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${gridSize}, 60px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, 60px)`;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.addEventListener("click", handleCellClick);
    grid.appendChild(cell);
    cells[i] = cell;
  }
}

function handleCellClick(e) {
  const index = parseInt(e.target.dataset.index);
  if (!gameActive || gameState[index] !== "") return;

  makeMove(index, currentPlayer);

  // Ha van győzelem, akkor leellenőrizzük
  if (checkGameEnd(index)) {
    return; // Ha vége a játéknak, kilépünk
  }

  if (vsBot) {
    setTimeout(() => {
      const botIndex = getBotMove();
      if (botIndex !== undefined) {
        makeMove(botIndex, "O");
        checkGameEnd(botIndex); // Ellenőrizzük, hogy a bot nyert-e
      }
    }, 300);
  } else {
    // PvP mód: váltás a másik játékosra
    currentPlayer = currentPlayer === "X" ? "O" : "X";
    currentTurnEl.textContent = `Következő: ${currentPlayer === "X" ? playerX : playerO}`;
  }
}

  
function getAllLines(state, gridSize, winLength) {
  const lines = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Jobbra (vízszintesen)
      if (col <= gridSize - winLength) {
        const line = [];
        for (let i = 0; i < winLength; i++) {
          line.push(row * gridSize + (col + i));
        }
        lines.push(line);
      }

      // Lefelé (függőlegesen)
      if (row <= gridSize - winLength) {
        const line = [];
        for (let i = 0; i < winLength; i++) {
          line.push((row + i) * gridSize + col);
        }
        lines.push(line);
      }

      // Átló (jobbra-lefelé)
      if (row <= gridSize - winLength && col <= gridSize - winLength) {
        const line = [];
        for (let i = 0; i < winLength; i++) {
          line.push((row + i) * gridSize + (col + i));
        }
        lines.push(line);
      }

      // Átló (balra-lefelé)
      if (row <= gridSize - winLength && col >= winLength - 1) {
        const line = [];
        for (let i = 0; i < winLength; i++) {
          line.push((row + i) * gridSize + (col - i));
        }
        lines.push(line);
      }
    }
  }

  return lines;
}

function evaluateBoard(state) {
  const lines = getAllLines(state, gridSize, winLength);
  let score = 0;

  for (const line of lines) {
    const values = line.map(i => state[i]);
    const xCount = values.filter(v => v === "X").length;
    const oCount = values.filter(v => v === "O").length;

    if (xCount > 0 && oCount > 0) continue; // blokkolt
    if (xCount === 0 && oCount > 0) score += Math.pow(oCount, 2);
    if (oCount === 0 && xCount > 0) score -= Math.pow(xCount, 2);
  }

  return score;
}

function getWinner(state) {
  const lines = getAllLines(state, gridSize, winLength);

  for (const line of lines) {
    const symbols = line.map(i => state[i]);
    const first = symbols[0];
    if (first !== "" && symbols.every(s => s === first)) {
      return first;
    }
  }

  return null;
}

function minimax(state, depth, isMaximizing) {
  const winner = getWinner(state);
  if (winner === "O") return { score: 100 - depth };
  if (winner === "X") return { score: -100 + depth };
  if (!state.includes("") || depth === 0) return { score: evaluateBoard(state) };

  const moves = [];

  for (let i = 0; i < state.length; i++) {
    if (state[i] === "") {
      const newState = [...state];
      newState[i] = isMaximizing ? "O" : "X";
      const result = minimax(newState, depth - 1, !isMaximizing);
      moves.push({ index: i, score: result.score });
    }
  }

  if (isMaximizing) {
    return moves.reduce((best, move) => move.score > best.score ? move : best);
  } else {
    return moves.reduce((best, move) => move.score < best.score ? move : best);
  }
}


function makeMove(index, player) {
    gameState[index] = player;
    cells[index].textContent = player;
  
    // Új: játékos színének beállítása
    cells[index].classList.add(player === "X" ? "x" : "o");
  
    if (!vsBot) {
      currentTurnEl.textContent = `Következő: ${currentPlayer === "X" ? "O" : "X"}`;
    }
  }

  function showPopup(message) {
    const popupMessage = document.getElementById('popup-message');
    const popup = document.getElementById('popup');
    
    popupMessage.textContent = message; // Beállítjuk a popup szöveget
    popup.style.display = 'block'; // Megjelenítjük a popupot
    setTimeout(() => {
      closePopup();
    }, 3000);
  }
  
  // Popup bezárása
  function closePopup() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none'; // Bezárjuk a popupot
  }

  // A játékosok win streak számlálói
let winStreakX = 0;
let winStreakO = 0;

function checkGameEnd(index) {
  const winnerCells = checkWin(index);

  if (winnerCells) {
    const winner = gameState[index]; // mostmár jó: nyertes aki lépett
    gameActive = false;
    highlightWinner(winnerCells);

    // Pontszám növelése
    scores[winner]++;
    updateScoreDisplay();

    // Streakek kezelése
    if (winner === "X") {
      winStreakX++;
      winStreakO = 0; // másik játékos nullázódik
      if (winStreakX === 3) {
        showPopup(`${playerX} tarol! 🔥 (Győzelmek: ${scores.X})`);
      } else if (winStreakX === 5) {
        showPopup(`${playerX} megállíthatatlan! 💥 (Győzelmek: ${scores.X})`);
      }  else if (winStreakX === 10) {
          showPopup(`${playerX} istenszabású! 💥 (Győzelmek: ${scores.X})`);
      } else {
        showPopup(`${playerX} nyert! (Győzelmek: ${scores.X})`);
      }
    } else if (winner === "O") {
      winStreakO++;
      winStreakX = 0;
      if (winStreakO === 3) {
        showPopup(`${playerO} tarol! 🔥 (Győzelmek: ${scores.O})`);
      } else if (winStreakO === 5) {
        showPopup(`${playerO} megállíthatatlan! 💥 (Győzelmek: ${scores.O})`);
      } else if (winStreakO === 10) {
          showPopup(`${playerO} istenszabású! 💥 (Győzelmek: ${scores.O})`);
      } else {
        showPopup(`${playerO} nyert! (Győzelmek: ${scores.O})`);
      }
    }

    return true;
  }

  // Ha nincs több üres mező: döntetlen
  if (!gameState.includes("")) {
    gameActive = false;
    showPopup("Döntetlen! 🤝");
    return true;
  }

  return false; // nincs még vége
}

function updateScoreDisplay() {
  scoreXEl.textContent = `${playerX}: ${scores.X}`;
  scoreOEl.textContent = `${playerO}: ${scores.O}`;
}

// ====== AI MOVE GENERÁLÁS NEHÉZSÉG ALAPJÁN ======

function getBotMove() {
  const depth = 2; // állítsd 2–4-re a sebességhez igazítva
  const bestMove = minimax(gameState, depth, true);
  return bestMove.index;
}


function getRandomMove() {
  const empty = gameState
    .map((v, i) => v === "" ? i : null)
    .filter(i => i !== null);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : undefined;
}

function getWinningMove(player) {
  for (let i = 0; i < gameState.length; i++) {
    if (gameState[i] === "") {
      gameState[i] = player;
      const win = checkWin(i);
      gameState[i] = "";
      if (win) return i;
    }
  }
  return null;
}

// ====== NYERÉS ELLENŐRZÉSE ======

function getRowCol(index) {
  return { row: Math.floor(index / gridSize), col: index % gridSize };
}

function checkWin(index) {
  return checkWinFor(gameState, index, gameState[index]);
}

function highlightWinner(winnerCells) {
    // Először töröljük a már kiemelt cellák kiemelését
    cells.forEach(cell => cell.classList.remove("winner"));
  
    // Kiemeljük az új győztes mezőket
    winnerCells.forEach(cell => {
      const index = cell.row * gridSize + cell.col;
      cells[index].classList.add("winner");
    });
}
  
function checkWinFor(state, index, player) {
  const { row, col } = getRowCol(index);
  const directions = [
    { dr: 0, dc: 1 },  // vízszintes
    { dr: 1, dc: 0 },  // függőleges
    { dr: 1, dc: 1 },  // átlósan jobb-lefelé
    { dr: 1, dc: -1 }  // átlósan balra-lefelé
  ];

  let winnerCells = [];

  const checkDirection = (dr, dc) => {
    let count = 1;
    const cells = [{ row, col }];

    // Előre (pozitív irány)
    for (let step = 1; step < winLength; step++) {
      const r = row + dr * step;
      const c = col + dc * step;
      if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) break;
      if (state[r * gridSize + c] === player) {
        count++;
        cells.push({ row: r, col: c });
      } else break;
    }


   // Hátra (negatív irány)
   for (let step = 1; step < winLength; step++) {
    const r = row - dr * step;
    const c = col - dc * step;
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) break;
    if (state[r * gridSize + c] === player) {
      count++;
      cells.push({ row: r, col: c });
    } else break;
  }

  if (count >= winLength) {
    winnerCells = winnerCells.concat(cells);
  }
};

// Irányok ellenőrzése
directions.forEach(dir => checkDirection(dir.dr, dir.dc));

if (winnerCells.length > 0) {
  return winnerCells; // Visszaadjuk a győztes mezőket
}

return null;
}

resetBtn.addEventListener("click", () => {
    gameState = new Array(gridSize * gridSize).fill("");
    gameActive = true;
    currentPlayer = "X";
    currentTurnEl.textContent = `Következő: X`;
    drawBoard();
});
