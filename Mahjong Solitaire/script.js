const boardEl = document.getElementById("board");
const timerEl = document.getElementById("timer");
const restartButton = document.getElementById("restartButton");
const finishMessageEl = document.getElementById("finishMessage");

let tiles = [];
let selectedTiles = [];
let startTime = null;
let timerInterval = null;

const TILE_WIDTH = 64;
const TILE_HEIGHT = 80;

/* Turtle layout coordinates (x, y, z layer) */
const turtleLayout = [
  // Base layer (0)
  ...generateLayer(0, 0, 12, 8),
  // Layer 1
  ...generateLayer(1, 1, 10, 6),
  // Layer 2
  ...generateLayer(2, 2, 8, 4),
  // Layer 3
  ...generateLayer(3, 3, 6, 2),
  // Top tile
  { x: 4, y: 3, z: 4 }
];

function generateLayer(z, offsetX, width, height) {
  const coords = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      coords.push({ x: x + offsetX, y: y + offsetX, z });
    }
  }
  return coords;
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(updateTimerDisplay, 500);
}

function updateTimerDisplay() {
  const elapsedMs = Date.now() - startTime;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  timerEl.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function loadTiles() {
  const symbols = [];
  for (let i = 1; i <= 42; i++) {
    symbols.push(`/images/${String(i).padStart(2, "0")}.png`);
  }

  const tileFaces = [];

  // Most tiles appear 4 times
  for (let i = 0; i < 34; i++) {
    for (let j = 0; j < 4; j++) tileFaces.push(symbols[i]);
  }

  // Flowers + Seasons appear once each (8 total)
  for (let i = 34; i < 42; i++) {
    tileFaces.push(symbols[i]);
  }

  shuffle(tileFaces);

  tiles = turtleLayout.map((pos, index) => ({
    id: index,
    face: tileFaces[index],
    x: pos.x,
    y: pos.y,
    z: pos.z,
    removed: false,
    el: null
  }));
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function renderTiles() {
  boardEl.innerHTML = "";

  tiles.forEach(tile => {
    const el = document.createElement("div");
    el.classList.add("tile");
    el.style.left = `${tile.x * (TILE_WIDTH * 0.75)}px`;
    el.style.top = `${tile.y * (TILE_HEIGHT * 0.75)}px`;
    el.style.zIndex = tile.z;

    const img = document.createElement("img");
    img.src = tile.face;
    el.appendChild(img);

    el.addEventListener("click", () => handleTileClick(tile));

    tile.el = el;
    boardEl.appendChild(el);
  });

  updateFreeTiles();
}

function updateFreeTiles() {
  tiles.forEach(tile => {
    if (tile.removed) {
      tile.el.classList.remove("free");
      return;
    }

    const blockedLeft = tiles.some(
      t => !t.removed && t.z === tile.z && t.y === tile.y && t.x === tile.x - 1
    );
    const blockedRight = tiles.some(
      t => !t.removed && t.z === tile.z && t.y === tile.y && t.x === tile.x + 1
    );
    const blockedAbove = tiles.some(
      t => !t.removed && t.z === tile.z + 1 &&
           Math.abs(t.x - tile.x) <= 1 &&
           Math.abs(t.y - tile.y) <= 1
    );

    const free = (!blockedLeft || !blockedRight) && !blockedAbove;

    if (free) tile.el.classList.add("free");
    else tile.el.classList.remove("free");
  });
}

function handleTileClick(tile) {
  if (tile.removed) return;
  if (!tile.el.classList.contains("free")) return;

  if (selectedTiles.includes(tile)) return;

  tile.el.classList.add("selected");
  selectedTiles.push(tile);

  if (selectedTiles.length === 2) {
    checkMatch();
  }
}

function checkMatch() {
  const [a, b] = selectedTiles;

  if (a.face === b.face) {
    removeTile(a);
    removeTile(b);
    selectedTiles = [];

    if (tiles.every(t => t.removed)) finishGame();
  } else {
    setTimeout(() => {
      a.el.classList.remove("selected");
      b.el.classList.remove("selected");
      selectedTiles = [];
    }, 300);
  }
}

function removeTile(tile) {
  tile.removed = true;
  tile.el.classList.add("removed");
  updateFreeTiles();
}

function finishGame() {
  stopTimer();

  const elapsedMs = Date.now() - startTime;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  finishMessageEl.textContent =
    `You finished in ${minutes} minutes and ${seconds} seconds`;
}

function restartGame() {
  stopTimer();
  finishMessageEl.textContent = "";
  selectedTiles = [];
  loadTiles();
  renderTiles();
  startTimer();
}

restartButton.addEventListener("click", restartGame);

window.addEventListener("DOMContentLoaded", restartGame);
