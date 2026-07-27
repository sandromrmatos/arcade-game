let TILE_SIZE = 80;

let EASY_LAYERS = [
  { layer: 1, rows: 7, cols: 7, offsetRow: 0, offsetCol: 0 },
  { layer: 2, rows: 5, cols: 5, offsetRow: 1, offsetCol: 1 },
  { layer: 3, rows: 3, cols: 3, offsetRow: 2, offsetCol: 2 },
  { layer: 4, rows: 1, cols: 1, offsetRow: 3, offsetCol: 3 }
];

let HARD_LAYERS = [
  { layer: 1, rows: 10, cols: 7, offsetRow: 0, offsetCol: 0 },
  { layer: 2, rows: 8, cols: 5, offsetRow: 1, offsetCol: 1 },
  { layer: 3, rows: 6, cols: 3, offsetRow: 2, offsetCol: 2 },
  { layer: 4, rows: 4, cols: 1, offsetRow: 3, offsetCol: 3 }
];

let tiles = [];
let selectedTile = null;
let matches = 0;
let totalTiles = 0;
let timerInterval = null;
let secondsElapsed = 0;
let currentLayers = EASY_LAYERS;

const boardEl = document.getElementById('board');
const matchesEl = document.getElementById('matches');
const restartBtn = document.getElementById('restart');
const timerEl = document.getElementById('timer');
const messageEl = document.getElementById('message');

document.getElementById('easy-btn').onclick = () => startGame(EASY_LAYERS);
document.getElementById('hard-btn').onclick = () => startGame(HARD_LAYERS);
restartBtn.onclick = () => startGame(currentLayers);

function startGame(layers) {
  currentLayers = layers;
  document.getElementById('mode-select').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  document.getElementById('status').style.display = 'block';
  messageEl.textContent = '';

  initGame();
  startTimer();
}

function initGame() {
  tiles = [];
  selectedTile = null;
  matches = 0;
  secondsElapsed = 0;
  timerEl.textContent = "00:00";
  matchesEl.textContent = "Matches: 0";
  boardEl.innerHTML = '';

  const positions = generatePositions(currentLayers);
  totalTiles = positions.length;

  const uniqueCount = totalTiles / 4;
  const images = generateRandomImages(uniqueCount);
  const tileImages = expandImages(images);

  shuffle(tileImages);

  positions.forEach((pos, i) => {
    tiles.push({
      id: i,
      img: tileImages[i],
      layer: pos.layer,
      row: pos.row,
      col: pos.col,
      matched: false,
      element: null
    });
  });

  renderTiles();
  updateFreeTiles();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function generatePositions(layers) {
  const pos = [];
  layers.forEach(l => {
    for (let r = 0; r < l.rows; r++) {
      for (let c = 0; c < l.cols; c++) {
        pos.push({
          layer: l.layer,
          row: l.offsetRow + r,
          col: l.offsetCol + c
        });
      }
    }
  });
  return pos;
}

function generateRandomImages(count) {
  const all = Array.from({ length: 42 }, (_, i) => i + 1);
  shuffle(all);
  return all.slice(0, count).map(n => `./images/${String(n).padStart(2, '0')}.png`);
}

function expandImages(images) {
  const arr = [];
  images.forEach(img => {
    for (let i = 0; i < 4; i++) arr.push(img);
  });
  return arr;
}

function renderTiles() {
  const maxRow = Math.max(...tiles.map(t => t.row));
  const maxCol = Math.max(...tiles.map(t => t.col));

  boardEl.style.width = `${(maxCol + 1) * TILE_SIZE}px`;
  boardEl.style.height = `${(maxRow + 1) * TILE_SIZE}px`;

  tiles.forEach(tile => {
    const el = document.createElement('div');
    el.classList.add('tile', `layer${tile.layer}`);
    el.style.left = `${tile.col * TILE_SIZE}px`;
    el.style.top = `${tile.row * TILE_SIZE}px`;
    el.style.transform = `translateY(-${tile.layer * 12}px)`;
    el.style.zIndex = tile.layer * 10;

    const img = document.createElement('img');
    img.src = tile.img;
    el.appendChild(img);

    el.onclick = () => onTileClick(tile);

    boardEl.appendChild(el);
    tile.element = el;
  });
}

function onTileClick(tile) {
  if (tile.matched) return;
  if (!isTileFree(tile)) return;

  if (!selectedTile) {
    selectedTile = tile;
    tile.element.classList.add('selected');
    return;
  }

  if (selectedTile.id === tile.id) {
    selectedTile.element.classList.remove('selected');
    selectedTile = null;
    return;
  }

  if (selectedTile.img === tile.img) {
    tile.matched = true;
    selectedTile.matched = true;

    tile.element.classList.add('matched');
    selectedTile.element.classList.add('matched');
    selectedTile.element.classList.remove('selected');

    selectedTile = null;
    matches++;
    matchesEl.textContent = `Matches: ${matches}`;

    updateFreeTiles();
    checkWin();
  } else {
    selectedTile.element.classList.remove('selected');
    selectedTile = tile;
    tile.element.classList.add('selected');
  }
}

function checkWin() {
  if (tiles.every(t => t.matched)) {
    clearInterval(timerInterval);
    messageEl.textContent = `You won in ${formatTime(secondsElapsed)}!`;
  } else if (!anyMovesLeft()) {
    clearInterval(timerInterval);
    messageEl.textContent = "You got to a dead end, this puzzle can't be finished";
  }
}

function anyMovesLeft() {
  const freeTiles = tiles.filter(t => !t.matched && isTileFree(t));
  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (freeTiles[i].img === freeTiles[j].img) return true;
    }
  }
  return false;
}

function updateFreeTiles() {
  tiles.forEach(t => {
    if (t.matched) {
      t.element.classList.remove('free');
      return;
    }
    if (isTileFree(t)) t.element.classList.add('free');
    else t.element.classList.remove('free');
  });
}

function isTileFree(tile) {
  if (tile.matched) return false;

  const above = tiles.find(
    t => !t.matched && t.row === tile.row && t.col === tile.col && t.layer > tile.layer
  );
  if (above) return false;

  const neighbors = {
    up: hasNeighborSameLayer(tile.row - 1, tile.col, tile.layer),
    down: hasNeighborSameLayer(tile.row + 1, tile.col, tile.layer),
    left: hasNeighborSameLayer(tile.row, tile.col - 1, tile.layer),
    right: hasNeighborSameLayer(tile.row, tile.col + 1, tile.layer)
  };

  return !(neighbors.up && neighbors.down && neighbors.left && neighbors.right);
}

function hasNeighborSameLayer(row, col, layer) {
  return tiles.some(
    t => !t.matched && t.layer === layer && t.row === row && t.col === col
  );
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
