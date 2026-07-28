const width = 6;
const height = 6;
const numColors = 6;
const board = [];
let score = 0;
let timerSeconds = 120;
let timerInterval = null;
let gameOver = false;

const boardElement = document.getElementById("board");
const scoreElement = document.getElementById("score");
const timerElement = document.getElementById("timer");
const messageElement = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

let draggedId = null;
let replacedId = null;

// Helpers
function indexToCoord(index) {
  return { x: index % width, y: Math.floor(index / width) };
}

function coordToIndex(x, y) {
  return y * width + x;
}

function randomCandy() {
  return Math.floor(Math.random() * numColors);
}

// Check if a position is part of a match (used for initial board)
function isPartOfMatch(x, y, grid) {
  const idx = coordToIndex(x, y);
  const color = grid[idx];

  // Horizontal
  let countH = 1;
  let i = x - 1;
  while (i >= 0 && grid[coordToIndex(i, y)] === color) {
    countH++;
    i--;
  }
  i = x + 1;
  while (i < width && grid[coordToIndex(i, y)] === color) {
    countH++;
    i++;
  }
  if (countH >= 3) return true;

  // Vertical
  let countV = 1;
  let j = y - 1;
  while (j >= 0 && grid[coordToIndex(x, j)] === color) {
    countV++;
    j--;
  }
  j = y + 1;
  while (j < height && grid[coordToIndex(x, j)] === color) {
    countV++;
    j++;
  }
  return countV >= 3;
}

// Generate board with no initial matches
function generateInitialBoard() {
  board.length = 0;
  for (let i = 0; i < width * height; i++) {
    board.push(randomCandy());
  }

  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = coordToIndex(x, y);
        if (isPartOfMatch(x, y, board)) {
          let newColor;
          do {
            newColor = randomCandy();
          } while (newColor === board[idx]);
          board[idx] = newColor;
          changed = true;
        }
      }
    }
  }
}

// Render board
function renderBoard() {
  boardElement.innerHTML = "";
  for (let i = 0; i < width * height; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    const color = board[i];
    if (color === null) {
      tile.classList.add("empty");
    } else {
      tile.classList.add(`color-${color}`);
    }
    tile.setAttribute("draggable", !gameOver && color !== null);
    tile.setAttribute("data-id", i);

    tile.addEventListener("dragstart", dragStart);
    tile.addEventListener("dragover", dragOver);
    tile.addEventListener("drop", dragDrop);
    tile.addEventListener("dragend", dragEnd);
    tile.addEventListener("click", tileClick);

    boardElement.appendChild(tile);
  }
}

let selectedTileId = null;

// Click handler for selecting tiles
function tileClick(e) {
  if (gameOver) return;
  
  const clickedId = parseInt(e.target.getAttribute("data-id"), 10);
  
  if (board[clickedId] === null) return;
  
  // First tile selected
  if (selectedTileId === null) {
    selectedTileId = clickedId;
    e.target.classList.add("selected");
    return;
  }
  
  // Same tile clicked again - deselect
  if (selectedTileId === clickedId) {
    selectedTileId = null;
    e.target.classList.remove("selected");
    return;
  }
  
  // Second tile clicked - check if adjacent
  const validMoves = getAdjacentIndices(selectedTileId);
  const isValidMove = validMoves.includes(clickedId);
  
  if (!isValidMove) {
    // Not adjacent - select new tile instead
    const tiles = document.querySelectorAll(".tile");
    tiles[selectedTileId].classList.remove("selected");
    selectedTileId = clickedId;
    e.target.classList.add("selected");
    return;
  }
  
  // Valid adjacent swap
  const tiles = document.querySelectorAll(".tile");
  tiles[selectedTileId].classList.remove("selected");
  
  // Swap
  const temp = board[selectedTileId];
  board[selectedTileId] = board[clickedId];
  board[clickedId] = temp;

  const matches = findMatches();
  if (matches.length === 0) {
    // revert
    board[clickedId] = board[selectedTileId];
    board[selectedTileId] = temp;
  } else {
    resolveMatches(matches);
  }

  renderBoard();
  selectedTileId = null;
}

// Drag handlers
function dragStart(e) {
  draggedId = parseInt(e.target.getAttribute("data-id"), 10);
}

function dragOver(e) {
  e.preventDefault();
}

function dragDrop(e) {
  replacedId = parseInt(e.target.getAttribute("data-id"), 10);
}

function dragEnd() {
  if (draggedId === null || replacedId === null) {
    draggedId = null;
    replacedId = null;
    return;
  }

  if (gameOver) {
    draggedId = null;
    replacedId = null;
    return;
  }

  const validMoves = getAdjacentIndices(draggedId);
  const isValidMove = validMoves.includes(replacedId);

  if (!isValidMove) {
    draggedId = null;
    replacedId = null;
    return;
  }

  // Swap
  const temp = board[draggedId];
  board[draggedId] = board[replacedId];
  board[replacedId] = temp;

  const matches = findMatches();
  if (matches.length === 0) {
    // revert
    board[replacedId] = board[draggedId];
    board[draggedId] = temp;
  } else {
    resolveMatches(matches);
  }

  renderBoard();
  draggedId = null;
  replacedId = null;
}

// Adjacent indices
function getAdjacentIndices(index) {
  const { x, y } = indexToCoord(index);
  const neighbors = [];
  if (x > 0) neighbors.push(coordToIndex(x - 1, y));
  if (x < width - 1) neighbors.push(coordToIndex(x + 1, y));
  if (y > 0) neighbors.push(coordToIndex(x, y - 1));
  if (y < height - 1) neighbors.push(coordToIndex(x, y + 1));
  return neighbors;
}

// Find all matches (3+ in row or column)
function findMatches() {
  const matches = [];

  // Horizontal
  for (let y = 0; y < height; y++) {
    let runStart = 0;
    while (runStart < width) {
      const color = board[coordToIndex(runStart, y)];
      if (color === null) {
        runStart++;
        continue;
      }
      let runEnd = runStart + 1;
      while (
        runEnd < width &&
        board[coordToIndex(runEnd, y)] === color
      ) {
        runEnd++;
      }
      const length = runEnd - runStart;
      if (length >= 3) {
        const indices = [];
        for (let x = runStart; x < runEnd; x++) {
          indices.push(coordToIndex(x, y));
        }
        matches.push(indices);
      }
      runStart = runEnd;
    }
  }

  // Vertical
  for (let x = 0; x < width; x++) {
    let runStart = 0;
    while (runStart < height) {
      const color = board[coordToIndex(x, runStart)];
      if (color === null) {
        runStart++;
        continue;
      }
      let runEnd = runStart + 1;
      while (
        runEnd < height &&
        board[coordToIndex(x, runEnd)] === color
      ) {
        runEnd++;
      }
      const length = runEnd - runStart;
      if (length >= 3) {
        const indices = [];
        for (let y = runStart; y < runEnd; y++) {
          indices.push(coordToIndex(x, y));
        }
        matches.push(indices);
      }
      runStart = runEnd;
    }
  }

  return matches;
}

// Check if any move is possible
function hasPossibleMoves() {
  for (let i = 0; i < width * height; i++) {
    const neighbors = getAdjacentIndices(i);

    for (const n of neighbors) {
      const temp = board[i];
      board[i] = board[n];
      board[n] = temp;

      const matches = findMatches();

      board[n] = board[i];
      board[i] = temp;

      if (matches.length > 0) return true;
    }
  }
  return false;
}

// Shuffle board until valid
function shuffleBoard() {
  let attempts = 0;

  do {
    attempts++;

    for (let i = board.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = board[i];
      board[i] = board[j];
      board[j] = temp;
    }

  } while ((!hasPossibleMoves() || findMatches().length > 0) && attempts < 50);

  renderBoard();
}

// Resolve matches: clear, score, gravity, refill, chain
function resolveMatches(matches) {
  if (matches.length === 0) return;

  let toClear = new Set();
  matches.forEach(group => {
    group.forEach(idx => toClear.add(idx));
    const len = group.length;
    let bonus = 0;
    if (len === 4) bonus = 10;
    else if (len >= 5) bonus = 25;
    score += len * 10 + bonus;
  });

  scoreElement.textContent = score;

  // Explosion animation (longer delay)
  const tiles = document.querySelectorAll(".tile");
  toClear.forEach(idx => {
    const tile = tiles[idx];
    if (tile) tile.classList.add("explode");
  });

  // Delay clearing so animation is visible
  setTimeout(() => {
    toClear.forEach(idx => {
      board[idx] = null;
    });

    applyGravity();
    refillBoard();
    renderBoard();

    // Shuffle if dead
    if (!hasPossibleMoves()) {
      shuffleBoard();
    }

    // Chain reactions
    const newMatches = findMatches();
    if (newMatches.length > 0) {
      resolveMatches(newMatches);
    }
  }, 450); // slower explosion
}

// Gravity: drop candies down in each column
function applyGravity() {
  for (let x = 0; x < width; x++) {
    const column = [];
    for (let y = 0; y < height; y++) {
      const idx = coordToIndex(x, y);
      if (board[idx] !== null) {
        column.push(board[idx]);
      }
    }
    for (let y = height - 1; y >= 0; y--) {
      const idx = coordToIndex(x, y);
      if (column.length > 0) {
        board[idx] = column.pop();
      } else {
        board[idx] = null;
      }
    }
  }
}

// Refill empty cells at top
function refillBoard() {
  for (let i = 0; i < width * height; i++) {
    if (board[i] === null) {
      board[i] = randomCandy();
    }
  }
}

// Timer
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(timerInterval);
  timerSeconds = 120;
  timerElement.textContent = formatTime(timerSeconds);
  gameOver = false;
  messageElement.textContent = "";

  timerInterval = setInterval(() => {
    timerSeconds--;
    timerElement.textContent = formatTime(timerSeconds);

    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerElement.textContent = "00:00";
      gameOver = true;
      messageElement.textContent = `Time's up! Final score: ${score}`;
      renderBoard();
      
      // Save score to leaderboard
      if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Candy Crush", {
          score: score
        }).then((result) => {
          console.log("Candy Crush score saved successfully");
          if (result && result.isNewBest && window.parent.showNewBestScore) {
            window.parent.showNewBestScore("Candy Crush", { score: score });
          }
        }).catch(err => {
          console.error("Error saving Candy Crush score:", err);
        });
      } else {
        console.error("saveGameScore function not found in parent window");
      }
    }
  }, 1000);
}

// Restart
function restartGame() {
  score = 0;
  scoreElement.textContent = score;
  generateInitialBoard();
  renderBoard();
  startTimer();
}

// Init
restartBtn.addEventListener("click", restartGame);

generateInitialBoard();
renderBoard();
startTimer();
