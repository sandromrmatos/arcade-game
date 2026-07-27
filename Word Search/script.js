const BOARD_SIZE = 10;
const WORD_COUNT = 10;

const boardEl = document.getElementById("board");
const wordListEl = document.getElementById("wordList");
const timerEl = document.getElementById("timer");
const resetSelectionButton = document.getElementById("resetSelectionButton");
const finishMessageEl = document.getElementById("finishMessage");

let board = [];
let words = [];
let placedWords = []; // {word, positions: [{r,c}]}
let selectedCells = []; // [{r,c,el}]
let startTime = null;
let timerInterval = null;
let foundWordsCount = 0;

// Directions: dx, dy
const directions = [
  { dx: 1, dy: 0 },   // right
  { dx: -1, dy: 0 },  // left
  { dx: 0, dy: 1 },   // down
  { dx: 0, dy: -1 },  // up
  { dx: 1, dy: 1 },   // diag down-right
  { dx: -1, dy: -1 }, // diag up-left
  { dx: 1, dy: -1 },  // diag up-right
  { dx: -1, dy: 1 }   // diag down-left
];

async function loadWords() {
  const res = await fetch("words.txt");
  const text = await res.text();
  const lines = text
    .split(/\r?\n/)
    .map(l => l.trim().toUpperCase())
    .filter(l => l.length > 0);

  shuffleArray(lines);
  words = lines.slice(0, WORD_COUNT);
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function initBoard() {
  board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => "")
  );
}

function placeWords() {
  placedWords = [];

  for (const word of words) {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 200) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const len = word.length;

      const startRow = Math.floor(Math.random() * BOARD_SIZE);
      const startCol = Math.floor(Math.random() * BOARD_SIZE);

      const endRow = startRow + dir.dy * (len - 1);
      const endCol = startCol + dir.dx * (len - 1);

      if (
        endRow < 0 ||
        endRow >= BOARD_SIZE ||
        endCol < 0 ||
        endCol >= BOARD_SIZE
      ) {
        continue;
      }

      // Check if fits without conflict (allow intersect same letter)
      let ok = true;
      const positions = [];

      for (let i = 0; i < len; i++) {
        const r = startRow + dir.dy * i;
        const c = startCol + dir.dx * i;
        const existing = board[r][c];
        if (existing !== "" && existing !== word[i]) {
          ok = false;
          break;
        }
        positions.push({ r, c });
      }

      if (!ok) continue;

      // Place word
      for (let i = 0; i < len; i++) {
        const { r, c } = positions[i];
        board[r][c] = word[i];
      }

      placedWords.push({ word, positions });
      placed = true;
    }
  }
}

function fillBoardWithRandomLetters() {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === "") {
        const ch = alphabet[Math.floor(Math.random() * alphabet.length)];
        board[r][c] = ch;
      }
    }
  }
}

function renderBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement("div");
      cell.classList.add("ws-cell");
      cell.textContent = board[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", () => handleCellClick(r, c, cell));
      boardEl.appendChild(cell);
    }
  }
}

function renderWordList() {
  wordListEl.innerHTML = "";
  for (const word of words) {
    const li = document.createElement("li");
    li.textContent = word;
    li.dataset.word = word;
    wordListEl.appendChild(li);
  }
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimerDisplay, 500);
}

function updateTimerDisplay() {
  if (!startTime) return;
  const elapsedMs = Date.now() - startTime;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  timerEl.textContent = `${mm}:${ss}`;
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function handleCellClick(r, c, el) {
  // If already selected in current sequence, ignore
  if (selectedCells.some(sc => sc.r === r && sc.c === c)) return;

  // If this is the first cell, always allow
  if (selectedCells.length === 0) {
    selectedCells.push({ r, c, el });
    el.classList.add("selected");
    return;
  }

  // Check adjacency (sequential)
  const last = selectedCells[selectedCells.length - 1];
  const dr = Math.abs(last.r - r);
  const dc = Math.abs(last.c - c);
  if (dr <= 1 && dc <= 1 && !(dr === 0 && dc === 0)) {
    selectedCells.push({ r, c, el });
    el.classList.add("selected");
    checkIfSelectionMatchesWord();
  } else {
    // Not adjacent: ignore click
    return;
  }
}

function checkIfSelectionMatchesWord() {
  const letters = selectedCells.map(sc => board[sc.r][sc.c]).join("");
  const candidateWord = letters;

  // Check if candidateWord is one of the target words
  const wordIndex = words.indexOf(candidateWord);
  if (wordIndex === -1) return;

  // Check if positions form a straight line (one of directions)
  if (!selectionIsStraightLine()) return;

  // Mark word as found
  markWordFound(candidateWord);
}

function selectionIsStraightLine() {
  if (selectedCells.length < 2) return false;

  const first = selectedCells[0];
  const second = selectedCells[1];

  const dx = second.c - first.c;
  const dy = second.r - first.r;

  // Normalize direction to -1, 0, 1
  const ndx = Math.sign(dx);
  const ndy = Math.sign(dy);

  // Check all subsequent cells follow same direction
  for (let i = 1; i < selectedCells.length; i++) {
    const prev = selectedCells[i - 1];
    const curr = selectedCells[i];
    const cdx = curr.c - prev.c;
    const cdy = curr.r - prev.r;
    if (Math.sign(cdx) !== ndx || Math.sign(cdy) !== ndy) {
      return false;
    }
  }

  return true;
}

function markWordFound(word) {
  // Highlight cells as found
  selectedCells.forEach(sc => {
    sc.el.classList.remove("selected");
    sc.el.classList.add("found");
  });

  // Cross word in list
  const li = wordListEl.querySelector(`li[data-word="${word}"]`);
  if (li) {
    li.classList.add("found");
  }

  foundWordsCount++;
  clearSelection(false);

  if (foundWordsCount === words.length) {
    finishGame();
  }
}

function clearSelection(clearFound = false) {
  selectedCells.forEach(sc => {
    // Always remove selected class, but keep found class
    sc.el.classList.remove("selected");
  });
  selectedCells = [];
}

function finishGame() {
  stopTimer();
  const elapsedMs = Date.now() - startTime;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  finishMessageEl.textContent = `You finished in ${minutes} minutes and ${seconds} seconds`;
  
  // Save score to leaderboard
  saveGameScore("Word Search", {
    bestTime: totalSeconds
  });
}

resetSelectionButton.addEventListener("click", () => {
  clearSelection();
});

// Init

async function initGame() {
  await loadWords();
  initBoard();
  placeWords();
  fillBoardWithRandomLetters();
  renderBoard();
  renderWordList();
  foundWordsCount = 0;
  finishMessageEl.textContent = "";
  startTimer();
}

window.addEventListener("DOMContentLoaded", initGame);
