// ------------------------------
// IMAGE LIST (GitHub Pages safe)
// ------------------------------
const imageList = [
  "./images/01.png",
  "./images/02.png",
  "./images/03.png",
  "./images/04.png"
];

// ------------------------------
// MODES
// ------------------------------
const modes = {
  easy: { rows: 4, cols: 4 },
  medium: { rows: 6, cols: 6 },
  hard: { rows: 7, cols: 7 }
};

// ------------------------------
// GLOBALS
// ------------------------------
let rows, cols, TILE_W, TILE_H;
let selectedPiece = null;
let placedCount = 0;
let totalPieces = 0;
let timerInterval = null;
let startTime = null;
let imageSrc = null;
let currentMode = "easy";

const piecesContainer = document.getElementById("pieces");
const boardContainer = document.getElementById("board");
const preview = document.getElementById("preview");
const timerDisplay = document.getElementById("timer");
const messageDisplay = document.getElementById("message");
const root = document.querySelector(":root");

// ------------------------------
// MODE BUTTONS
// ------------------------------
document.querySelectorAll("#controls button[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#controls button[data-mode]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    startGame(btn.dataset.mode);
  });
});

// ------------------------------
// RANDOM IMAGE PICKER
// ------------------------------
function pickRandomImage() {
  return imageList[Math.floor(Math.random() * imageList.length)];
}

// ------------------------------
// TIMER
// ------------------------------
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss = String(elapsed % 60).padStart(2, "0");
    timerDisplay.textContent = `${mm}:${ss}`;
  }, 200);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ------------------------------
// START GAME
// ------------------------------
function startGame(modeName) {
  currentMode = modeName;
  const mode = modes[modeName];
  rows = mode.rows;
  cols = mode.cols;
  totalPieces = rows * cols;
  placedCount = 0;
  selectedPiece = null;
  messageDisplay.textContent = "";

  imageSrc = pickRandomImage();
  preview.style.backgroundImage = `url('${imageSrc}')`;

  // ------------------------------
  // TILE SIZE (2:3 aspect ratio)
  // ------------------------------
  TILE_W = Math.floor(320 / cols);
  TILE_H = Math.floor(TILE_W * 1.5);

  // ------------------------------
  // UPDATE CSS VARIABLES
  // ------------------------------
  root.style.setProperty("--tile-w", TILE_W + "px");
  root.style.setProperty("--tile-h", TILE_H + "px");
  root.style.setProperty("--rows", rows);
  root.style.setProperty("--cols", cols);

  buildBoard();
  buildPieces();
  startTimer();
}

// ------------------------------
// BUILD BOARD
// ------------------------------
function buildBoard() {
  boardContainer.innerHTML = "";
  boardContainer.style.display = "grid";
  boardContainer.style.gridTemplateColumns = `repeat(${cols}, ${TILE_W}px)`;
  boardContainer.style.gridTemplateRows = `repeat(${rows}, ${TILE_H}px)`;
  boardContainer.style.gap = "2px";

  for (let i = 0; i < totalPieces; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell", "empty");
    cell.dataset.correctIndex = i;
    cell.addEventListener("click", () => onCellClick(cell));
    boardContainer.appendChild(cell);
  }
}

// ------------------------------
// BUILD PIECES
// ------------------------------
function buildPieces() {
  piecesContainer.innerHTML = "";
  piecesContainer.style.display = "grid";

  // Keep 4 columns max so layout never breaks
  const pieceCols = Math.min(cols, 4);
  piecesContainer.style.gridTemplateColumns = `repeat(${pieceCols}, ${TILE_W}px)`;
  piecesContainer.style.gap = "8px";

  const indices = Array.from({ length: totalPieces }, (_, i) => i);
  shuffle(indices);

  indices.forEach(index => {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.dataset.index = index;

    const x = index % cols;
    const y = Math.floor(index / cols);

    piece.style.backgroundImage = `url('${imageSrc}')`;
    piece.style.backgroundPosition = `-${x * TILE_W}px -${y * TILE_H}px`;

    piece.addEventListener("click", () => onPieceClick(piece));
    piecesContainer.appendChild(piece);
  });
}

// ------------------------------
// SHUFFLE
// ------------------------------
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// ------------------------------
// PIECE CLICK
// ------------------------------
function onPieceClick(piece) {
  if (piece.classList.contains("used")) return;

  if (selectedPiece === piece) {
    piece.classList.remove("selected");
    selectedPiece = null;
    return;
  }

  if (selectedPiece) selectedPiece.classList.remove("selected");
  selectedPiece = piece;
  piece.classList.add("selected");
}

// ------------------------------
// CELL CLICK
// ------------------------------
function onCellClick(cell) {
  if (!selectedPiece || cell.classList.contains("locked")) return;

  const pieceIndex = parseInt(selectedPiece.dataset.index);
  const correctIndex = parseInt(cell.dataset.correctIndex);

  if (pieceIndex === correctIndex) {
    const x = pieceIndex % cols;
    const y = Math.floor(pieceIndex / cols);

    cell.style.backgroundImage = `url('${imageSrc}')`;
    cell.style.backgroundPosition = `-${x * TILE_W}px -${y * TILE_H}px`;
    cell.classList.remove("empty");
    cell.classList.add("locked");

    selectedPiece.classList.remove("selected");
    selectedPiece.classList.add("used");
    selectedPiece.style.visibility = "hidden";
    selectedPiece = null;

    placedCount++;
    if (placedCount === totalPieces) {
      stopTimer();
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      messageDisplay.textContent = `Congrats! You finished in ${timerDisplay.textContent}`;
      
      // Save score to leaderboard
      if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Puzzle", {
          bestTime: elapsed,
          difficulty: currentMode
        }).then((result) => {
          console.log("Puzzle score saved successfully");
          if (result && result.isNewBest && window.parent.showNewBestScore) {
            window.parent.showNewBestScore("Puzzle", { bestTime: elapsed, difficulty: currentMode });
          }
        }).catch(err => {
          console.error("Error saving Puzzle score:", err);
        });
      } else {
        console.error("saveGameScore function not found in parent window");
      }
    }
  } else {
    selectedPiece.classList.remove("selected");
    selectedPiece = null;
  }
}

// ------------------------------
// INITIAL START
// ------------------------------
startGame("easy");
