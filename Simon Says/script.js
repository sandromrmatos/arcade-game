const gridElement = document.getElementById("grid");
const roundElement = document.getElementById("round");
const maxLengthElement = document.getElementById("max-length");
const messageElement = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

const GRID_SIZE = 3;
const MAX_LENGTH = 20;

let sequence = [];
let currentRound = 0;
let playerIndex = 0;
let isShowingSequence = false;
let gameOver = false;

// Create grid
function createGrid() {
  gridElement.innerHTML = "";
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile", `tile-${i}`);
    tile.dataset.index = i;
    tile.addEventListener("click", onTileClick);
    gridElement.appendChild(tile);
  }
}

// Generate full random sequence up to MAX_LENGTH
function generateSequence() {
  sequence = [];
  for (let i = 0; i < MAX_LENGTH; i++) {
    const idx = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
    sequence.push(idx);
  }
}

// Disable/enable tiles
function setTilesEnabled(enabled) {
  const tiles = document.querySelectorAll(".tile");
  tiles.forEach(tile => {
    if (enabled) {
      tile.classList.remove("disabled");
    } else {
      tile.classList.add("disabled");
    }
  });
}

// Show sequence for current round
function showSequence() {
  isShowingSequence = true;
  setTilesEnabled(false);
  messageElement.textContent = "Watch the sequence...";

  const tiles = document.querySelectorAll(".tile");
  let i = 0;

  const interval = setInterval(() => {
    // Clear previous highlight
    tiles.forEach(tile => tile.classList.remove("highlight"));

    if (i >= currentRound) {
      clearInterval(interval);
      isShowingSequence = false;
      setTilesEnabled(true);
      playerIndex = 0;
      messageElement.textContent = "Repeat the sequence!";
      return;
    }

    const idx = sequence[i];
    const tile = tiles[idx];

    // FORCE animation restart even if same tile twice
    tile.classList.remove("highlight");
    void tile.offsetWidth;
    tile.classList.add("highlight");

    i++;
  }, 800); // slower, clearer pop
}

// Handle tile click
function onTileClick(e) {
  if (gameOver || isShowingSequence) return;

  const tile = e.currentTarget;
  const index = parseInt(tile.dataset.index, 10);

  tile.classList.add("click-feedback");
  setTimeout(() => tile.classList.remove("click-feedback"), 200);

  const expectedIndex = sequence[playerIndex];

  if (index === expectedIndex) {
    playerIndex++;

    if (playerIndex === currentRound) {
      // Round complete
      if (currentRound === MAX_LENGTH) {
        // Game won
        gameOver = true;
        messageElement.textContent = "You mastered all 20 steps! 🎉";
        setTilesEnabled(false);
      } else {
        currentRound++;
        roundElement.textContent = currentRound;
        messageElement.textContent = "Good! Watch the next sequence...";
        setTimeout(showSequence, 700);
      }
    }
  } else {
    // Wrong tile
    tile.classList.add("error");
    setTimeout(() => tile.classList.remove("error"), 400);

    messageElement.textContent = "Wrong tile! New sequence starting.";

    // NEW BEHAVIOUR: generate a new sequence
    currentRound = 1;
    roundElement.textContent = currentRound;
    generateSequence();

    setTilesEnabled(false);
    setTimeout(showSequence, 800);
  }
}

// Restart game
function restartGame() {
  gameOver = false;
  currentRound = 1;
  playerIndex = 0;
  roundElement.textContent = currentRound;
  maxLengthElement.textContent = MAX_LENGTH;
  messageElement.textContent = "Watch the sequence...";
  generateSequence();
  setTilesEnabled(false);
  showSequence();
}

// Init
restartBtn.addEventListener("click", restartGame);

createGrid();
restartGame();
