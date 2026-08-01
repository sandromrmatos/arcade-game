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
let highestRoundReached = 0;

// Bilingual translations
let currentLanguage = "en";

const translations = {
  en: {
    title: "Simon Says",
    roundLabel: "Round:",
    maxLengthLabel: "Max Length:",
    restartButton: "Restart",
    watchSequence: "Watch the sequence...",
    repeatSequence: "Repeat the sequence!",
    good: "Good! Watch the next sequence...",
    mastered: "You mastered all 20 steps! 🎉",
    wrong: "Wrong tile!",
    gameOver: "Game Over! You reached round"
  },
  pt: {
    title: "Simon Diz",
    roundLabel: "Ronda:",
    maxLengthLabel: "Comprimento Máx:",
    restartButton: "Reiniciar",
    watchSequence: "Observe a sequência...",
    repeatSequence: "Repita a sequência!",
    good: "Bom! Observe a próxima sequência...",
    mastered: "Dominou todos os 20 passos! 🎉",
    wrong: "Bloco errado!",
    gameOver: "Jogo Terminado! Chegou à ronda"
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function updateLanguage() {
  document.querySelector("h1").textContent = t("title");
  document.querySelector(".hud-item:nth-child(1) .label").textContent = t("roundLabel");
  document.querySelector(".hud-item:nth-child(2) .label").textContent = t("maxLengthLabel");
  document.getElementById("restart-btn").textContent = t("restartButton");
}

// Get language from parent window
function getParentLanguage() {
  if (window.parent && window.parent !== window) {
    try {
      const parentLang = window.parent.localStorage.getItem("arcadeLanguage");
      if (parentLang) {
        currentLanguage = parentLang;
      }
    } catch (e) {
      console.log("Cannot access parent language, using default");
    }
  }
}

// Listen for language changes from parent
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "languageChange") {
    currentLanguage = event.data.language;
    updateLanguage();
  }
});

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
  messageElement.textContent = t("watchSequence");

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
      messageElement.textContent = t("repeatSequence");
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
        // Game won - completed all 20 rounds
        gameOver = true;
        highestRoundReached = currentRound; // They completed round 20
        messageElement.textContent = t("mastered");
        setTilesEnabled(false);
        saveScore();
      } else {
        // Move to next round
        currentRound++;
        roundElement.textContent = currentRound;
        messageElement.textContent = t("good");
        setTimeout(showSequence, 700);
      }
    }
  } else {
    // Wrong tile - game over
    tile.classList.add("error");
    setTimeout(() => tile.classList.remove("error"), 400);

    gameOver = true;
    // If they failed on round X, they successfully completed round X-1
    // currentRound represents the round they were ATTEMPTING
    highestRoundReached = currentRound - 1;
    
    if (highestRoundReached === 0) {
      messageElement.textContent = t("wrong") + " " + t("gameOver") + " 0!";
    } else {
      messageElement.textContent = `${t("gameOver")} ${highestRoundReached}!`;
    }
    
    setTilesEnabled(false);
    
    // Save score only if they completed at least 1 round
    if (highestRoundReached > 0) {
      saveScore();
    }
  }
}

// Save score to leaderboard
function saveScore() {
  if (highestRoundReached === 0) return;
  
  // Save score to leaderboard
  if (window.parent && window.parent.saveGameScore) {
    window.parent.saveGameScore("Simon Says", {
      rounds: highestRoundReached
    }).then((result) => {
      console.log("Simon Says score saved successfully");
      if (result && result.isNewBest && window.parent.showNewBestScore) {
        window.parent.showNewBestScore("Simon Says", { rounds: highestRoundReached });
      }
    }).catch(err => {
      console.error("Error saving Simon Says score:", err);
    });
  } else {
    console.error("saveGameScore function not found in parent window");
  }
}

// Restart game
function restartGame() {
  gameOver = false;
  currentRound = 1;
  playerIndex = 0;
  highestRoundReached = 0;
  roundElement.textContent = currentRound;
  maxLengthElement.textContent = MAX_LENGTH;
  messageElement.textContent = t("watchSequence");
  generateSequence();
  setTilesEnabled(false);
  showSequence();
}

// Init
restartBtn.addEventListener("click", restartGame);

// Initialize language
getParentLanguage();
updateLanguage();

createGrid();
restartGame();
