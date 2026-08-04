// ------------------------------
// IMAGE LIST (GitHub Pages safe)
// ------------------------------
const imageList = [
  "./images/01.png",
  "./images/02.png",
  "./images/03.png",
  "./images/04.png",
  "./images/05.png",
  "./images/06.png",
  "./images/07.png",
  "./images/08.png",
  "./images/09.png",
  "./images/10.png",
  "./images/11.png",
  "./images/12.png",
  "./images/13.png",
  "./images/14.png",
  "./images/15.png",
  "./images/16.png",
  "./images/17.png",
  "./images/18.png",
  "./images/19.png",
  "./images/20.png",
  "./images/21.png",
  "./images/22.png",
  "./images/23.png",
  "./images/24.png",
  "./images/25.png",
  "./images/26.png",
  "./images/27.png",
  "./images/28.png",
  "./images/29.png",
  "./images/30.png",
  "./images/31.png",
  "./images/32.png",
  "./images/33.png",
  "./images/34.png",
  "./images/35.png",
  "./images/36.png",
  "./images/37.png"
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
let currentLanguage = 'en';

const piecesContainer = document.getElementById("pieces");
const boardContainer = document.getElementById("board");
const preview = document.getElementById("preview");
const timerDisplay = document.getElementById("timer");
const messageDisplay = document.getElementById("message");
const root = document.querySelector(":root");

// ------------------------------
// TRANSLATIONS
// ------------------------------
const translations = {
  en: {
    title: 'Image Puzzle',
    selectDifficulty: 'Select Difficulty:',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    restart: 'Restart',
    menu: 'Menu',
    congrats: 'Congrats! You finished in'
  },
  pt: {
    title: 'Puzzle de Imagem',
    selectDifficulty: 'Selecione a Dificuldade:',
    easy: 'Fácil',
    medium: 'Médio',
    hard: 'Difícil',
    restart: 'Reiniciar',
    menu: 'Menu',
    congrats: 'Parabéns! Você terminou em'
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function getParentLanguage() {
  try {
    if (window.parent && window.parent.currentLanguage) {
      return window.parent.currentLanguage;
    }
    if (window.parent && window.parent.localStorage) {
      const lang = window.parent.localStorage.getItem('arcadeLanguage');
      if (lang) return lang;
    }
    const localLang = localStorage.getItem('arcadeLanguage');
    if (localLang) return localLang;
  } catch (e) {
    console.log('Error getting parent language:', e);
  }
  return 'en';
}

function updateLanguage() {
  currentLanguage = getParentLanguage();
  
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    el.textContent = t(key);
  });
}

// ------------------------------
// MENU FUNCTIONS
// ------------------------------
function showMenu() {
  document.getElementById('difficultyMenu').style.display = 'flex';
  document.getElementById('gameContainer').style.display = 'none';
  stopTimer();
}

function hideMenu() {
  document.getElementById('difficultyMenu').style.display = 'none';
  document.getElementById('gameContainer').style.display = 'block';
}

// ------------------------------
// MODE BUTTONS
// ------------------------------
document.querySelectorAll(".difficulty-btn[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    startGame(btn.dataset.mode);
  });
});

document.querySelectorAll("#controls button[data-mode]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#controls button[data-mode]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    startGame(btn.dataset.mode);
  });
});

document.getElementById("restartBtn").addEventListener("click", () => {
  startGame(currentMode);
});

document.getElementById("menuBtn").addEventListener("click", () => {
  showMenu();
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

  hideMenu();
  
  // Update active button
  document.querySelectorAll("#controls button[data-mode]").forEach(b => b.classList.remove("active"));
  document.querySelector(`#controls button[data-mode="${modeName}"]`).classList.add("active");

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

  // Match the board grid structure exactly
  piecesContainer.style.gridTemplateColumns = `repeat(${cols}, ${TILE_W}px)`;
  piecesContainer.style.gridTemplateRows = `repeat(${rows}, ${TILE_H}px)`;
  piecesContainer.style.gap = "2px";

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
      messageDisplay.textContent = `${t('congrats')} ${timerDisplay.textContent}`;
      
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
setTimeout(() => {
  currentLanguage = getParentLanguage();
  updateLanguage();
  showMenu();
}, 100);

// Listen for language changes
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'languageChange') {
    currentLanguage = event.data.language;
    updateLanguage();
  }
});
