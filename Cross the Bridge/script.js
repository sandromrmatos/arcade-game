const rows = 3;
let cols = 10;
let safeTiles = []; // safeTiles[col] = row index
let currentCol = -1; // -1 = start pad, 0..9 = bridge columns
let currentRow = 1; // middle row as default
let attempts = 0;
let timerSeconds = 180;
let timerInterval = null;
let gameOver = false;
let difficulty = "long";
let gameStarted = false;

const bridgeElement = document.getElementById("bridge");
const pawElement = document.getElementById("paw");
const timerElement = document.getElementById("timer");
const attemptsElement = document.getElementById("attempts");
const messageElement = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

// Format time
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// Generate random safe path
function generateSafeTiles() {
  safeTiles = [];
  for (let c = 0; c < cols; c++) {
    const safeRow = Math.floor(Math.random() * rows);
    safeTiles.push(safeRow);
  }
}

// Render bridge
function renderBridge() {
  bridgeElement.innerHTML = "";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tile = document.createElement("div");
      tile.classList.add("tile", `row-${r}`);
      tile.dataset.row = r;
      tile.dataset.col = c;

      tile.addEventListener("click", onTileClick);

      // Paw on tile?
      if (c === currentCol && r === currentRow) {
        tile.classList.add("has-paw");
      }

      bridgeElement.appendChild(tile);
    }
  }
}

// Move paw to start pad
function resetToStart(showMessage = true) {
  currentCol = -1;
  currentRow = 1; // middle row
  attempts++;
  attemptsElement.textContent = attempts;

  // Move paw back to start pad
  const startPad = document.querySelector(".start-pad");
  startPad.appendChild(pawElement);

  if (showMessage) {
    messageElement.textContent = "Oops! Wrong tile. Back to start!";
  }

  renderBridge();
}

// Handle tile click
function onTileClick(e) {
  if (gameOver) return;

  const tile = e.currentTarget;
  const tileRow = parseInt(tile.dataset.row, 10);
  const tileCol = parseInt(tile.dataset.col, 10);

  // Only allow clicking next column
  if (tileCol !== currentCol + 1) {
    return;
  }

  const safeRow = safeTiles[tileCol];

  if (tileRow === safeRow) {
    // Correct tile
    currentCol = tileCol;
    currentRow = tileRow;
    tile.classList.add("flash-correct");
    messageElement.textContent = "";

    renderBridge();

    // Check win
    if (currentCol === cols - 1) {
      gameOver = true;
      clearInterval(timerInterval);

      // TELEPORT PAW TO FINISH PAD
      pawElement.style.position = "relative";
      pawElement.style.left = "0px";
      pawElement.style.top = "0px";

      const finishPad = document.querySelector(".finish-pad");
      finishPad.appendChild(pawElement);

      messageElement.textContent = `You crossed the bridge! Attempts: ${attempts}`;
      
      // Save score to leaderboard (time left)
      if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Cross the Bridge", {
          timeLeft: timerSeconds,
          difficulty: difficulty
        }).then((result) => {
          console.log("Cross the Bridge score saved successfully");
          if (result && result.isNewBest && window.parent.showNewBestScore) {
            window.parent.showNewBestScore("Cross the Bridge", { timeLeft: timerSeconds, difficulty: difficulty });
          }
        }).catch(err => {
          console.error("Error saving Cross the Bridge score:", err);
        });
      } else {
        console.error("saveGameScore function not found in parent window");
      }
    }
  } else {
    // Wrong tile
    tile.classList.add("flash-wrong");
    setTimeout(() => {
      resetToStart();
    }, 300);
  }
}

// Timer
function startTimer() {
  clearInterval(timerInterval);
  timerSeconds = 180;
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
      messageElement.textContent = "Time's up! The bridge wins this time.";
    }
  }, 1000);
}

// Restart
function restartGame() {
  attempts = 0;
  attemptsElement.textContent = attempts;
  generateSafeTiles();
  resetToStart(false);
  startTimer();
}

function startGameWithDifficulty(mode) {
  difficulty = mode;
  
  if (mode === "short") {
    cols = 6;
  } else {
    cols = 12;
  }
  
  // Hide menu
  document.getElementById("menuOverlay").style.display = "none";
  
  gameStarted = true;
  restartGame();
}

// Menu buttons
document.getElementById("btnShort").addEventListener("click", () => {
  startGameWithDifficulty("short");
});

document.getElementById("btnLong").addEventListener("click", () => {
  startGameWithDifficulty("long");
});

// Init
restartBtn.addEventListener("click", restartGame);

// Show menu on startup
document.getElementById("menuOverlay").style.display = "flex";
