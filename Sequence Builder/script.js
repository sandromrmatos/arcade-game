// Bilingual translations
let currentLanguage = "en";

const translations = {
  en: {
    title: "Sequence Builder",
    selectDifficulty: "Select Difficulty:",
    easyBtn: "Easy (5 tiles)",
    mediumBtn: "Medium (8 tiles)",
    hardBtn: "Hard (12 tiles)",
    turnLabel: "Turn:",
    nextLabel: "Next:",
    resetButton: "Reset Game",
    gameOver: "Game Over! You completed",
    turns: "turns",
    clickInOrder: "Click the numbers in order starting from 1!",
    wrong: "Wrong! Expected",
    but: "but clicked",
    watchCarefully: "Watch carefully!",
    ready: "Get ready..."
  },
  pt: {
    title: "Construtor de Sequência",
    selectDifficulty: "Selecione a Dificuldade:",
    easyBtn: "Fácil (5 blocos)",
    mediumBtn: "Médio (8 blocos)",
    hardBtn: "Difícil (12 blocos)",
    turnLabel: "Jogada:",
    nextLabel: "Próximo:",
    resetButton: "Reiniciar Jogo",
    gameOver: "Jogo Terminado! Completou",
    turns: "jogadas",
    clickInOrder: "Clique nos números por ordem começando em 1!",
    wrong: "Errado! Esperava",
    but: "mas clicou",
    watchCarefully: "Observe atentamente!",
    ready: "Prepara-se..."
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function updateLanguage() {
  document.querySelector("h1").textContent = t("title");
  document.querySelector("#menuDescription").textContent = t("selectDifficulty");
  document.getElementById("btnEasy").textContent = t("easyBtn");
  document.getElementById("btnMedium").textContent = t("mediumBtn");
  document.getElementById("btnHard").textContent = t("hardBtn");
  document.getElementById("turnLabel").textContent = t("turnLabel");
  document.getElementById("nextLabel").textContent = t("nextLabel");
  document.getElementById("resetButton").textContent = t("resetButton");
  
  // Update menu overlay title
  const menuTitle = document.querySelector(".menu-content h2");
  if (menuTitle) {
    menuTitle.textContent = t("title");
  }
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

const gameBoard = document.getElementById("gameBoard");
const turnCountSpan = document.getElementById("turnCount");
const nextNumberDisplay = document.getElementById("nextNumberDisplay");
const messageDiv = document.getElementById("message");
const resetButton = document.getElementById("resetButton");

let tiles = [];
let currentTurn = 0;
let nextNumber = 1;
let difficulty = "easy";
let tileCount = 5;
let gameStarted = false;
let gameOver = false;
let isShowingNumbers = false;

// Time configuration - starts at 5 seconds, gets to 1 second at turn 12
function getFlipDuration(turn) {
  if (turn <= 0) return 5000;
  if (turn >= 12) return 1000;
  
  // Linear decrease from 5000ms to 1000ms over 12 turns
  // Formula: 5000 - (turn * 363.64)
  const duration = 5000 - ((turn - 1) * 363.64);
  return Math.max(1000, Math.round(duration));
}

// Menu buttons
document.getElementById("btnEasy").addEventListener("click", () => {
  startGame("easy", 5);
});

document.getElementById("btnMedium").addEventListener("click", () => {
  startGame("medium", 8);
});

document.getElementById("btnHard").addEventListener("click", () => {
  startGame("hard", 12);
});

function startGame(mode, count) {
  difficulty = mode;
  tileCount = count;
  
  // Hide menu
  document.getElementById("menuOverlay").style.display = "none";
  gameStarted = true;
  
  initGame();
}

function initGame() {
  // Reset state
  gameBoard.innerHTML = "";
  gameBoard.className = "game-board";
  
  // Set grid size based on difficulty
  if (difficulty === "easy") {
    gameBoard.classList.add("grid-easy"); // 5 tiles
  } else if (difficulty === "medium") {
    gameBoard.classList.add("grid-medium"); // 8 tiles
  } else {
    gameBoard.classList.add("grid-hard"); // 12 tiles
  }
  
  tiles = [];
  currentTurn = 0;
  nextNumber = 1;
  gameOver = false;
  turnCountSpan.textContent = "0";
  nextNumberDisplay.textContent = "-";
  messageDiv.textContent = "";

  // Create tiles
  for (let i = 0; i < tileCount; i++) {
    const tile = document.createElement("div");
    tile.classList.add("tile");
    tile.dataset.number = "";
    
    const inner = document.createElement("div");
    inner.classList.add("tile-inner");
    
    const front = document.createElement("div");
    front.classList.add("tile-face", "tile-front");
    
    const back = document.createElement("div");
    back.classList.add("tile-face", "tile-back");
    back.textContent = "?";
    
    inner.appendChild(front);
    inner.appendChild(back);
    tile.appendChild(inner);
    
    tile.addEventListener("click", () => handleTileClick(tile));
    
    gameBoard.appendChild(tile);
    tiles.push(tile);
  }
  
  // Start first turn after a brief delay
  setTimeout(() => {
    messageDiv.textContent = t("ready");
    setTimeout(() => {
      startNewTurn();
    }, 1000);
  }, 500);
}

function startNewTurn() {
  if (gameOver) return;
  
  currentTurn++;
  turnCountSpan.textContent = String(currentTurn);
  nextNumber = 1;
  nextNumberDisplay.textContent = "1";
  messageDiv.textContent = t("watchCarefully");
  
  // Shuffle numbers
  const numbers = Array.from({ length: tileCount }, (_, i) => i + 1);
  shuffleArray(numbers);
  
  // Assign numbers to tiles
  tiles.forEach((tile, index) => {
    tile.dataset.number = numbers[index];
    tile.classList.remove("flipped", "correct");
    const front = tile.querySelector(".tile-front");
    front.textContent = numbers[index];
  });
  
  // Show tiles flipped for current duration
  isShowingNumbers = true;
  tiles.forEach(tile => {
    tile.classList.add("flipped");
  });
  
  const duration = getFlipDuration(currentTurn);
  
  // Flip back after duration
  setTimeout(() => {
    tiles.forEach(tile => {
      tile.classList.remove("flipped");
    });
    isShowingNumbers = false;
    messageDiv.textContent = t("clickInOrder");
  }, duration);
}

function handleTileClick(tile) {
  if (gameOver || isShowingNumbers) return;
  if (tile.classList.contains("correct")) return;
  
  const number = parseInt(tile.dataset.number);
  
  if (number === nextNumber) {
    // Correct!
    tile.classList.add("flipped", "correct");
    nextNumber++;
    
    if (nextNumber <= tileCount) {
      nextNumberDisplay.textContent = String(nextNumber);
    } else {
      // All numbers clicked correctly - start new turn
      nextNumberDisplay.textContent = "-";
      messageDiv.textContent = "";
      setTimeout(() => {
        startNewTurn();
      }, 1000);
    }
  } else {
    // Wrong!
    endGame(false, number);
  }
}

function endGame(completed, wrongNumber) {
  gameOver = true;
  isShowingNumbers = false;
  
  // Reveal all numbers
  tiles.forEach(tile => {
    tile.classList.add("flipped");
  });
  
  if (completed) {
    messageDiv.textContent = `${t("gameOver")} ${currentTurn} ${t("turns")}!`;
  } else {
    messageDiv.textContent = `${t("wrong")} ${nextNumber} ${t("but")} ${wrongNumber}!`;
  }
  
  // Save score to leaderboard (turns completed - higher is better)
  if (window.parent && window.parent.saveGameScore && currentTurn > 0) {
    window.parent.saveGameScore("Sequence Builder", {
      turns: currentTurn,
      difficulty: difficulty
    }).then((result) => {
      console.log("Sequence Builder score saved successfully");
      if (result && result.isNewBest && window.parent.showNewBestScore) {
        window.parent.showNewBestScore("Sequence Builder", { turns: currentTurn, difficulty: difficulty });
      }
    }).catch(err => {
      console.error("Error saving Sequence Builder score:", err);
    });
  } else {
    console.error("saveGameScore function not found in parent window");
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Reset button
resetButton.addEventListener("click", () => {
  if (gameStarted) {
    initGame();
  }
});

// Initialize language
getParentLanguage();
updateLanguage();

// Show menu on startup
document.getElementById("menuOverlay").style.display = "flex";
