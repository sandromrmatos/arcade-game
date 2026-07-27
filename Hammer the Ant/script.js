const BOARD_SIZE = 5;
const GAME_DURATION = 180; // seconds

const EASY_CONFIG = {
  startFlipDuration: 1500,
  minFlipDuration: 350,
  startInterval: 1200,
  minInterval: 250,
  durationDecay: 0.95,
  intervalDecay: 0.95,
  decayStepSeconds: 8
};

const HARD_CONFIG = {
  startFlipDuration: 1500,
  minFlipDuration: 250,
  startInterval: 900,
  minInterval: 180,
  durationDecay: 0.85,
  intervalDecay: 0.85,
  decayStepSeconds: 6
};

let tiles = [];
let score = 0;
let secondsLeft = GAME_DURATION;
let timerInterval = null;
let spawnTimeout = null;
let difficultyInterval = null;
let currentConfig = EASY_CONFIG;
let gameOver = false;

const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restart');

document.getElementById('easy-btn').onclick = () => startGame(EASY_CONFIG);
document.getElementById('hard-btn').onclick = () => startGame(HARD_CONFIG);
restartBtn.onclick = () => startGame(currentConfig);

function startGame(config) {
  currentConfig = config;
  document.getElementById('mode-select').style.display = 'none';
  document.getElementById('game-container').style.display = 'flex';
  document.getElementById('status').style.display = 'block';
  messageEl.textContent = '';

  resetGameState();
  createBoard();
  startTimer();
  startDifficultyScaling();
  scheduleNextSpawn(true); // start with single tile at a time
}

function resetGameState() {
  clearInterval(timerInterval);
  clearTimeout(spawnTimeout);
  clearInterval(difficultyInterval);

  tiles = [];
  score = 0;
  secondsLeft = GAME_DURATION;
  gameOver = false;

  timerEl.textContent = formatTime(secondsLeft);
  scoreEl.textContent = "Score: 0";
  boardEl.innerHTML = '';
}

function createBoard() {
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const tile = {
      id: i,
      up: false,
      type: null, // 'ant' or 'bomb'
      element: null,
      flipTimeout: null
    };

    const el = document.createElement('div');
    el.classList.add('tile');
    el.onclick = () => onTileClick(tile);

    boardEl.appendChild(el);
    tile.element = el;
    tiles.push(tile);
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    if (gameOver) return;
    secondsLeft--;
    timerEl.textContent = formatTime(secondsLeft);
    if (secondsLeft <= 0) {
      endGame(false); // time over, win by surviving
    }
  }, 1000);
}

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

let currentFlipDuration;
let currentInterval;
let decayElapsed = 0;

function startDifficultyScaling() {
  currentFlipDuration = currentConfig.startFlipDuration;
  currentInterval = currentConfig.startInterval;
  decayElapsed = 0;

  difficultyInterval = setInterval(() => {
    if (gameOver) return;
    decayElapsed += currentConfig.decayStepSeconds;

    currentFlipDuration = Math.max(
      currentConfig.minFlipDuration,
      currentFlipDuration * currentConfig.durationDecay
    );
    currentInterval = Math.max(
      currentConfig.minInterval,
      currentInterval * currentConfig.intervalDecay
    );
  }, currentConfig.decayStepSeconds * 1000);
}

function scheduleNextSpawn(initial = false) {
  if (gameOver) return;

  spawnTimeout = setTimeout(() => {
    if (gameOver) return;

    // Decide how many tiles to flip: start with 1, later allow more
    let maxSimultaneous = 1;
    if (!initial) {
      // As interval gets small, allow more simultaneous tiles
      if (currentInterval < 800) maxSimultaneous = 2;
      if (currentInterval < 500) maxSimultaneous = 3;
      if (currentInterval < 350) maxSimultaneous = 4;
    }

    flipRandomTiles(maxSimultaneous);
    scheduleNextSpawn(false);
  }, currentInterval);
}

function flipRandomTiles(count) {
  const available = tiles.filter(t => !t.up);
  if (available.length === 0) return;

  const flips = Math.min(count, available.length);
  shuffleArray(available);

  for (let i = 0; i < flips; i++) {
    const tile = available[i];
    flipTileUp(tile);
  }
}

function flipTileUp(tile) {
  if (tile.up || gameOver) return;

  tile.up = true;
  tile.type = Math.random() < 0.8 ? 'ant' : 'bomb';
  tile.element.classList.add('up', tile.type);

  tile.flipTimeout = setTimeout(() => {
    flipTileDown(tile);
  }, currentFlipDuration);
}

function flipTileDown(tile) {
  if (!tile.up) return;
  tile.up = false;
  tile.type = null;
  tile.element.classList.remove('up', 'ant', 'bomb', 'hammered');
}

function onTileClick(tile) {
  if (gameOver) return;
  if (!tile.up) return;

  if (tile.type === 'ant') {
    score++;
    scoreEl.textContent = `Score: ${score}`;
    tile.element.classList.add('hammered');
    setTimeout(() => tile.element.classList.remove('hammered'), 300);
    flipTileDown(tile);
  } else if (tile.type === 'bomb') {
    tile.element.classList.add('hammered');
    endGame(true);
  }
}

function endGame(hitBomb) {
  if (gameOver) return;
  gameOver = true;

  clearInterval(timerInterval);
  clearTimeout(spawnTimeout);
  clearInterval(difficultyInterval);

  tiles.forEach(t => {
    clearTimeout(t.flipTimeout);
  });

  if (hitBomb) {
    messageEl.textContent = "You hit a bomb! Game over.";
  } else {
    messageEl.textContent = `You scored ${score} points!`;
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
