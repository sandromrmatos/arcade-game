// Load game into iframe
function loadGame(name) {
  const frame = document.getElementById("game-frame");
  frame.src = name === "home" ? "home.html" : `launch.html?game=${name}`;
}

// Language translations
let currentLanguage = localStorage.getItem("arcadeLanguage") || "en";

// Ensure valid language
if (currentLanguage !== "en" && currentLanguage !== "pt") {
  currentLanguage = "en";
  localStorage.setItem("arcadeLanguage", "en");
}

const translations = {
  en: {
    title: "Arcade Games by Sandro",
    home: "Home",
    info: "Info",
    leaderboard: "Leaderboard",
    leaderboardTitle: "Game Leaderboards",
    leaderboardSubtitle: "Select a game to view its high scores:",
    infoTitle: "Game Information",
    infoSubtitle: "Click on any game to learn how to play:",
    close: "×",
    refresh: "🔄 Refresh",
    rank: "Rank",
    player: "Player",
    score: "Score",
    date: "Date",
    bestTime: "Best Time",
    timeLeft: "Time Left",
    length: "Length",
    turns: "Turns",
    time: "Time",
    noScores: "No scores yet. Be the first!",
    loading: "Loading scores...",
    errorLoading: "Error loading scores:",
    welcomeTitle: "Welcome!",
    welcomeMessage: "Please enter your name:",
    namePlaceholder: "Your name",
    startPlaying: "Start Playing",
    enterName: "Please enter a name to continue!",
    easyMode: "Easy Mode",
    mediumMode: "Medium Mode",
    hardMode: "Hard Mode",
    small: "Small",
    large: "Large",
    short: "Short",
    long: "Long",
    big: "Big",
    newBestScore: "NEW BEST SCORE!",
    noTrack: "No track playing",
    noInfo: "No information available for",
    // Game names
    "Memory": "Memory",
    "Snake": "Snake",
    "Tetris": "Tetris",
    "Candy Crush": "Candy Crush",
    "Tic Tac Toe": "Tic Tac Toe",
    "Puzzle Bobble": "Puzzle Bobble",
    "Cross the Bridge": "Cross the Bridge",
    "Simon Says": "Simon Says",
    "Snakes and Ladders": "Snakes and Ladders",
    "Wordle": "Wordle",
    "Minefield": "Minefield",
    "Arkanoid": "Arkanoid",
    "Word Search": "Word Search",
    "Mahjong Solitaire": "Mahjong Solitaire",
    "Hammer the Ant": "Hammer the Ant",
    "PacMan": "Pac-Man",
    "Puzzle": "Puzzle",
    "Domino": "Domino",
    "Maze": "Maze",
    "Connect Four": "Connect Four",
    "2048": "2048"
  },
  pt: {
    title: "Jogos Arcade por Sandro",
    home: "Início",
    info: "Informação",
    leaderboard: "Classificação",
    leaderboardTitle: "Classificações dos Jogos",
    leaderboardSubtitle: "Selecione um jogo para ver as pontuações mais altas:",
    infoTitle: "Informação dos Jogos",
    infoSubtitle: "Clique em qualquer jogo para aprender a jogar:",
    close: "×",
    refresh: "🔄 Atualizar",
    rank: "Posição",
    player: "Jogador",
    score: "Pontuação",
    date: "Data",
    bestTime: "Melhor Tempo",
    timeLeft: "Tempo Restante",
    length: "Comprimento",
    turns: "Jogadas",
    time: "Tempo",
    noScores: "Ainda sem pontuações. Seja o primeiro!",
    loading: "A carregar pontuações...",
    errorLoading: "Erro ao carregar pontuações:",
    welcomeTitle: "Bem-vindo!",
    welcomeMessage: "Por favor insira o seu nome:",
    namePlaceholder: "O seu nome",
    startPlaying: "Começar a Jogar",
    enterName: "Por favor insira um nome para continuar!",
    easyMode: "Modo Fácil",
    mediumMode: "Modo Médio",
    hardMode: "Modo Difícil",
    small: "Pequeno",
    large: "Grande",
    short: "Curto",
    long: "Longo",
    big: "Grande",
    newBestScore: "NOVA MELHOR PONTUAÇÃO!",
    noTrack: "Nenhuma faixa a tocar",
    noInfo: "Nenhuma informação disponível para",
    // Game names in Portuguese
    "Memory": "Memória",
    "Snake": "Cobra",
    "Tetris": "Tetris",
    "Candy Crush": "Candy Crush",
    "Tic Tac Toe": "Jogo do Galo",
    "Puzzle Bobble": "Puzzle Bobble",
    "Cross the Bridge": "Atravessar a Ponte",
    "Simon Says": "Simon Diz",
    "Snakes and Ladders": "Cobras e Escadas",
    "Wordle": "Wordle",
    "Minefield": "Campo Minado",
    "Arkanoid": "Arkanoid",
    "Word Search": "Sopa de Letras",
    "Mahjong Solitaire": "Mahjong Solitário",
    "Hammer the Ant": "Esmagar a Formiga",
    "PacMan": "Pac-Man",
    "Puzzle": "Puzzle",
    "Domino": "Dominó",
    "Maze": "Labirinto",
    "Connect Four": "Quatro em Linha",
    "2048": "2048"
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function updateLanguage() {
  // Update page title
  document.querySelector(".banner h1").textContent = t("title");
  
  // Update menu buttons - first 3 are special buttons (Home, Info, Leaderboard)
  const menuButtons = document.querySelectorAll(".menu button");
  if (menuButtons.length >= 3) {
    menuButtons[0].textContent = t("home");
    menuButtons[1].textContent = t("info");
    menuButtons[2].textContent = t("leaderboard");
    
    // Update game buttons (they have span elements with game names)
    for (let i = 3; i < menuButtons.length; i++) {
      const span = menuButtons[i].querySelector("span");
      if (span) {
        const gameName = span.getAttribute("data-game-name");
        if (gameName) {
          span.textContent = t(gameName);
        }
      }
    }
  }
  
  // Update modal if visible
  const modal = document.getElementById("name-modal");
  if (modal && !modal.classList.contains("hidden")) {
    modal.querySelector("h2").textContent = t("welcomeTitle");
    modal.querySelector("p").textContent = t("welcomeMessage");
    document.getElementById("player-name-input").placeholder = t("namePlaceholder");
    document.getElementById("save-name-btn").textContent = t("startPlaying");
  }
  
  // Update leaderboard section if visible
  const leaderboardSection = document.getElementById("leaderboard-section");
  if (leaderboardSection && !leaderboardSection.classList.contains("hidden")) {
    const h2 = leaderboardSection.querySelector("h2");
    if (h2) {
      const currentText = h2.textContent;
      // Check if it's the main info page
      if (currentText.includes("Information") || currentText.includes("Informação")) {
        h2.textContent = t("infoTitle");
        const p = leaderboardSection.querySelector("p");
        if (p) p.textContent = t("infoSubtitle");
      }
      // Check if it's the main leaderboard page
      else if ((currentText.includes("Leaderboards") || currentText.includes("Classificações")) && 
               !currentText.includes("Leaderboard") && !currentText.includes("Classificação")) {
        h2.textContent = t("leaderboardTitle");
        const p = leaderboardSection.querySelector("p");
        if (p) p.textContent = t("leaderboardSubtitle");
      }
    }
    
    // Update game list buttons in info/leaderboard sections if visible
    const gameListButtons = leaderboardSection.querySelectorAll(".leaderboard-game-btn span");
    gameListButtons.forEach(span => {
      const gameName = span.getAttribute("data-game-name");
      if (gameName) {
        span.textContent = t(gameName);
      }
    });
  }
  
  // Notify iframe about language change
  const iframe = document.getElementById("game-frame");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'languageChange', language: currentLanguage }, '*');
  }
  
  // Update track display
  updateTrackDisplay();
}

// Firebase configuration (optional - app works without it)
const firebaseConfig = {
  apiKey: "AIzaSyDaxTpbasYOjVhm13D1Zi6lyqCatEqTn-M",
  authDomain: "arcade-sandro.firebaseapp.com",
  projectId: "arcade-sandro",
  storageBucket: "arcade-sandro.firebasestorage.app",
  messagingSenderId: "348759287679",
  appId: "1:348759287679:web:313c0f25e4227fa07a1c4a",
  measurementId: "G-522Q4LT500"
};

// Firebase initialization
let firebaseApp = null;
let firebaseAnalytics = null;
let firebaseDb = null;

function initFirebase() {
  if (!firebaseApp) {
    try {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      firebaseAnalytics = firebase.analytics();
      firebaseDb = firebase.firestore();
    } catch (e) {
      console.error("Firebase init failed:", e);
    }
  }
  return { app: firebaseApp, analytics: firebaseAnalytics, db: firebaseDb };
}

// Player name management
let playerName = localStorage.getItem("arcadePlayerName");
let nameResolver = null;

// Player name input handler - setup once
const setupNameModal = () => {
  const modal = document.getElementById("name-modal");
  const input = document.getElementById("player-name-input");
  const saveBtn = document.getElementById("save-name-btn");
  
  if (modal.dataset.setup === "true") return;
  
  saveBtn.onclick = () => {
    const name = input.value;
    if (!name || name.trim() === "") {
      alert(t("enterName"));
      return;
    }
    
    playerName = name.trim();
    localStorage.setItem("arcadePlayerName", playerName);
    
    // Save to Firebase if available
    const { db } = initFirebase();
    if (db) {
      db.collection("players").doc(playerName).set({
        name: playerName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(err => console.error("Error saving player:", err));
    }
    
    modal.classList.add("hidden");
    input.value = "";
    
    // Resolve any pending promises
    if (nameResolver) {
      nameResolver(playerName);
      nameResolver = null;
    }
  };
  
  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      saveBtn.onclick();
    }
  };
  
  modal.dataset.setup = "true";
};

function showNameModal() {
  setupNameModal();
  
  const modal = document.getElementById("name-modal");
  const input = document.getElementById("player-name-input");
  
  input.value = "";
  input.focus();
  modal.classList.remove("hidden");
  input.select();
}

function getPlayerName() {
  if (playerName) {
    return Promise.resolve(playerName);
  }
  
  // Show modal synchronously if no name
  showNameModal();
  return new Promise(resolve => {
    nameResolver = resolve;
  });
}

// Build menu
async function buildMenu() {
  const menu = document.getElementById("menu");

  const homeBtn = document.createElement("button");
  homeBtn.textContent = t("home");
  homeBtn.onclick = () => loadGame("home");
  menu.appendChild(homeBtn);

  const infoBtn = document.createElement("button");
  infoBtn.textContent = t("info");
  infoBtn.className = "info-btn";
  infoBtn.onclick = showInfo;
  menu.appendChild(infoBtn);

  const leaderboardBtn = document.createElement("button");
  leaderboardBtn.textContent = t("leaderboard");
  leaderboardBtn.className = "leaderboard-btn";
  leaderboardBtn.onclick = showLeaderboard;
  menu.appendChild(leaderboardBtn);

  const response = await fetch("games.json");
  const data = await response.json();

  data.games.forEach(folder => {
    const btn = document.createElement("button");

    const img = document.createElement("img");
    // Try SVG first, fallback to PNG
    img.src = `icons/${folder}.svg`;
    img.onerror = function() { this.src = `icons/${folder}.png`; };
    img.className = "menu-icon";

    const span = document.createElement("span");
    span.textContent = t(folder);
    span.setAttribute("data-game-name", folder); // Store original name for translation updates

    btn.appendChild(img);
    btn.appendChild(span);

    btn.onclick = () => loadGame(folder);
    menu.appendChild(btn);
  });
}

// Leaderboard functions
function showLeaderboard() {
  const section = document.getElementById("leaderboard-section");
  
  // Reset to main leaderboard view
  section.innerHTML = `
    <div class="leaderboard-content">
      <button class="close-leaderboard-btn">${t("close")}</button>
      <h2>${t("leaderboardTitle")}</h2>
      <p>${t("leaderboardSubtitle")}</p>
      <div id="leaderboard-game-list" class="leaderboard-game-list"></div>
    </div>
  `;
  
  section.classList.remove("hidden");
  
  // Re-attach close button listener for main leaderboard
  const closeBtn = section.querySelector(".close-leaderboard-btn");
  closeBtn.addEventListener("click", closeLeaderboard);
  
  const gameList = document.getElementById("leaderboard-game-list");
  
  // Populate game list
  fetch("games.json").then(res => res.json()).then(data => {
    data.games.forEach(folder => {
      const btn = document.createElement("button");
      btn.className = "leaderboard-game-btn";
      
      const img = document.createElement("img");
      // Try SVG first, fallback to PNG
      img.src = `icons/${folder}.svg`;
      img.onerror = function() { this.src = `icons/${folder}.png`; };
      img.className = "leaderboard-game-icon";
      
      const span = document.createElement("span");
      span.textContent = t(folder);
      span.setAttribute("data-game-name", folder); // Store original name for translation updates
      
      btn.appendChild(img);
      btn.appendChild(span);
      btn.onclick = () => showGameLeaderboard(folder);
      
      gameList.appendChild(btn);
    });
  });
}

// Info functions
const gameDescriptions = {
  "Memory": {
    title: "Memory Card Game",
    description: "Match pairs of cards by flipping them over two at a time. Find all matching pairs to win!",
    modes: "Small (4×4): 8 pairs to match\nLarge (6×6): 18 pairs to match",
    scoring: "Lowest number of turns wins. The fewer flips it takes to find all pairs, the better your score!",
    controls: "Click on cards to flip them over. Match two cards with the same image to keep them revealed."
  },
  "Snake": {
    title: "Snake",
    description: "Control a snake that grows longer as it eats food. Avoid hitting walls or your own tail!",
    modes: "Small (15×15 grid)\nBig (18×18 grid)",
    scoring: "Longest snake length wins. Each food item makes your snake grow by 1.",
    controls: "Use arrow keys to change direction. On mobile, use W/A/S/Z keys or swipe gestures."
  },
  "Tetris": {
    title: "Tetris",
    description: "Classic block-stacking game. Arrange falling pieces to create complete horizontal lines that disappear.",
    modes: "Easy: Slower falling speed\nHard: Faster falling speed with more challenge",
    scoring: "Points are awarded for clearing lines. Multiple lines at once give bonus points. Highest score wins!",
    controls: "Arrow keys: Left/Right to move, Down to drop faster, Up to rotate. Space bar for instant drop."
  },
  "Candy Crush": {
    title: "Candy Crush",
    description: "Match 3 or more candies of the same color in a row or column to clear them and score points.",
    modes: "Level 1 (6×6): Classic match-3 gameplay, 2 minutes\nLevel 2 (8×8): Bigger grid with 10% broken gems that can only be destroyed by matching adjacent gems, 3 minutes\nLevel 3 (8×8): 15% broken gems, blocked corners and center cells creating a cross-shaped playing field, 3 minutes",
    scoring: "Match more candies for higher scores. Combos and special candy combinations give bonus points. Clearing broken gems awards +20 bonus points. Highest score wins!",
    controls: "Click two adjacent candies to swap them, or drag one candy onto an adjacent candy. Match 3+ of the same color to score!"
  },
  "Tic Tac Toe": {
    title: "Tic Tac Toe",
    description: "Classic 3×3 grid game. Get three of your symbols in a row (horizontally, vertically, or diagonally) to win!",
    modes: "Single mode - play against the computer",
    scoring: "No scoring - just wins, losses, or draws",
    controls: "Click on any empty square to place your mark (X). Computer plays as O."
  },
  "Puzzle Bobble": {
    title: "Puzzle Bobble (Bubble Shooter)",
    description: "Shoot colored bubbles to match 3 or more of the same color. Clear all bubbles before they reach the bottom!",
    modes: "Easy: Standard bubble falling speed\nHard: Bubbles descend faster with increasing speed over time",
    scoring: "Points for each bubble popped (match 3+ or floating bubbles). Time bonus: if you complete under 3 minutes, add (180 - seconds) to your score. Example: 2:30 completion = 30 bonus points. Total score = base points + time bonus. Highest score wins!",
    controls: "Move mouse to aim, click to shoot. Match 3+ bubbles of the same color to pop them. Timer shows elapsed time."
  },
  "Cross the Bridge": {
    title: "Cross the Bridge",
    description: "Navigate across a bridge by choosing the correct tiles. One tile per column is safe - the others teleport you back to start!",
    modes: "Short: 3 rows × 6 columns\nLong: 3 rows × 12 columns",
    scoring: "Complete the bridge with the most time remaining. Timer starts at 3 minutes. Higher time left wins!",
    controls: "Click on tiles to test them. Right-click to place flags as reminders."
  },
  "Simon Says": {
    title: "Simon Says",
    description: "Memory game where you repeat increasingly long sequences of colors. Watch the pattern, then repeat it!",
    modes: "Single mode with progressively harder levels",
    scoring: "No leaderboard - just see how many rounds you can complete!",
    controls: "Click the colored buttons in the same order as shown. Each round adds one more color to remember."
  },
  "Snakes and Ladders": {
    title: "Snakes and Ladders",
    description: "Classic board game. Roll the dice and race to square 100. Climb ladders to advance, avoid snakes that send you back!",
    modes: "Single mode - race against the computer",
    scoring: "No leaderboard - first to reach square 100 wins the game!",
    controls: "Click 'Roll Dice' to take your turn. Your piece moves automatically based on the dice roll."
  },
  "Wordle": {
    title: "Wordle",
    description: "Guess the 5-letter word in 6 attempts. After each guess, tiles change color to show how close you are!",
    modes: "Single mode - new word each game",
    scoring: "No leaderboard - try to guess the word in as few attempts as possible!",
    controls: "Type your 5-letter guess and press Enter. Green = correct letter & position, Yellow = correct letter wrong position, Gray = letter not in word."
  },
  "Minefield": {
    title: "Minefield (Minesweeper)",
    description: "Clear a grid by revealing safe cells while avoiding hidden bombs. Numbers show how many bombs are adjacent.",
    modes: "Easy (5×5): 5 bombs\nMedium (6×6): 8 bombs\nHard (8×8): 12 bombs",
    scoring: "Fastest time to clear all safe cells wins. Lower time is better!",
    controls: "Left-click to reveal a cell. Right-click to place a flag on suspected bombs. Clear all non-bomb cells to win!"
  },
  "Arkanoid": {
    title: "Arkanoid (Breakout)",
    description: "Bounce a ball with your paddle to break all the bricks. Don't let the ball fall off the bottom!",
    modes: "Single mode with multiple levels",
    scoring: "No leaderboard - break all bricks to advance to the next level!",
    controls: "Move mouse left/right to control paddle. Ball bounces automatically. Clear all bricks to win the level."
  },
  "Word Search": {
    title: "Word Search",
    description: "Find all hidden words in a grid of letters. Words can be horizontal, vertical, or diagonal in any direction.",
    modes: "Single mode with random word placement each game",
    scoring: "Fastest time to find all words wins. Lower time is better!",
    controls: "Click and drag to select words. Release when you've highlighted a complete word."
  },
  "Mahjong Solitaire": {
    title: "Mahjong Solitaire",
    description: "Match pairs of identical tiles that are free (not blocked by other tiles). Clear all tiles to win!",
    modes: "Easy: Simpler tile layout\nHard: More complex stacked layout",
    scoring: "Fastest time to clear all tiles wins. Lower time is better!",
    controls: "Click two matching tiles that are free on at least one side. They'll disappear if they match."
  },
  "Hammer the Ant": {
    title: "Hammer the Ant",
    description: "Click on ants as they appear to squash them before time runs out. React quickly for higher scores!",
    modes: "Easy: Ants appear slower\nHard: Ants appear faster and disappear quicker",
    scoring: "Most ants squashed wins. Highest score wins!",
    controls: "Click on ants as soon as they appear. Speed and accuracy are key!"
  },
  "PacMan": {
    title: "Pac-Man",
    description: "Guide Pac-Man through a maze, eating dots while avoiding ghosts. Eat power pellets to turn the tables and chase ghosts!",
    modes: "Single mode with classic gameplay",
    scoring: "No leaderboard - eat all dots to complete the level!",
    controls: "Arrow keys to move. Eat all small dots and power pellets while avoiding ghosts (unless you've eaten a power pellet)."
  },
  "Puzzle": {
    title: "Picture Puzzle",
    description: "Rearrange scrambled image pieces to recreate the original picture. Click pieces then click empty board spaces.",
    modes: "Easy (4×4): 16 pieces\nMedium (6×6): 36 pieces\nHard (7×7): 49 pieces",
    scoring: "Fastest time to complete the puzzle wins. Lower time is better!",
    controls: "Click a piece on the left, then click where it should go on the right board. Correct pieces stay in place."
  },
  "Domino": {
    title: "Dominoes",
    description: "Play dominoes against the computer. Match numbers on tiles to build a chain. First to play all tiles wins!",
    modes: "Single mode - Player vs Computer",
    scoring: "When you win, you score points equal to all dots on opponent's remaining tiles. Highest cumulative score wins!",
    controls: "Click your tile to select it, then click a yellow placeholder to play it. Click 'Draw' if you have no valid moves."
  },
  "Maze": {
    title: "Maze",
    description: "Navigate through a maze from start to finish as quickly as possible!",
    modes: "Easy (11×11): Small maze\nMedium (17×17): Bigger maze\nHard (23×23): Large maze",
    scoring: "Fastest time to reach the finish wins. Lower time is better!",
    controls: "Use arrow keys to move or click on adjacent cells to move the paw. Find your way from ▶️ to 🏁!"
  },
  "Connect Four": {
    title: "Connect Four",
    description: "Drop colored discs into a vertical grid. Get four in a row horizontally, vertically, or diagonally to win! Play against an AI opponent.",
    modes: "Easy: AI makes simpler moves\nHard: AI uses strategic blocking and winning tactics",
    scoring: "Win in the fewest turns (pieces played) possible! Lower number of turns is better. Most efficient wins are ranked highest!",
    controls: "Click on any column to drop your disc (red). The disc falls to the lowest available position. Try to connect four before the AI (yellow) does!"
  },
  "2048": {
    title: "2048",
    description: "Slide numbered tiles on a grid to combine them and create a tile with the number 2048! When two tiles with the same number touch, they merge into one.",
    modes: "4×4 Grid: Classic mode with standard difficulty\n5×5 Grid: Larger grid with more space and strategy",
    scoring: "Highest score wins! Points are earned by merging tiles. Higher value tiles give more points. Best score is saved per grid size!",
    controls: "Use arrow keys (↑ ↓ ← →) to slide all tiles in that direction. On mobile, swipe in the direction you want to move. Tiles slide until they hit another tile or the edge!"
  },
  "TCG Game": {
    title: "Elemental Awakening TCG",
    description: "Battle against the computer AI in a strategic trading card game! Build your deck, play creatures, evolve them through stages, and use items strategically to knock out your opponent's creatures.",
    modes: "4 Unique Decks to choose from:\n• Mystic Deck: Purple psychic creatures\n• Wind Deck: Flying and neutral creatures\n• Celestial Deck: Grass and nature creatures\n• Mechanic Deck: Metal and mechanical creatures\n\nAI randomly selects a deck each game.",
    scoring: "Win/Loss record is tracked! First player to score 3 points wins (1 point per knocked out creature). Leaderboard ranks players by win rate: wins/(wins+losses). Higher win rate = better rank!",
    controls: "Setup Phase (Turn 0):\n• Must place 1 Stage 1 creature in active spot first\n• Can place other Stage 1 creatures on bench (optional)\n• Click Done when ready to start\n\nEach Turn:\n• Draw 1 card at start of turn\n• Attach 1 energy to any creature (once per turn)\n• Play Stage 1 creatures to empty bench slots\n• Evolve creatures (from Turn 3 onwards only):\n  - Can't evolve cards played this turn\n  - Can't evolve a card twice in same turn\n  - Stage 1→Stage 2→Stage 3\n• Use 1 item card per turn (max):\n  - Potion: Heal 20 HP\n  - Card Draw: Draw 2 cards\n  - Booster: +20 damage to next attack\n• Attack with active creature (ends turn immediately)\n  - Requires energy equal to move cost\n  - Shows move name and damage in button\n• Retreat active to bench (costs energy shown in button)\n  - Can't retreat after attacking\n\nWin Conditions:\n• Score 3 points (knock out 3 opponent creatures)\n• Opponent has no creatures left\n• 30 turns max - highest points wins"
  }
};

const gameDescriptionsPT = {
  "Memory": {
    title: "Jogo de Memória",
    description: "Combine pares de cartas virando-as duas de cada vez. Encontre todos os pares correspondentes para ganhar!",
    modes: "Pequeno (4×4): 8 pares para combinar\nGrande (6×6): 18 pares para combinar",
    scoring: "Menor número de jogadas ganha. Quanto menos viragens para encontrar todos os pares, melhor a pontuação!",
    controls: "Clique nas cartas para as virar. Combine duas cartas com a mesma imagem para as manter reveladas."
  },
  "Snake": {
    title: "Cobra",
    description: "Controle uma cobra que cresce à medida que come. Evite bater nas paredes ou na própria cauda!",
    modes: "Pequeno (grelha 15×15)\nGrande (grelha 18×18)",
    scoring: "Maior comprimento da cobra ganha. Cada item de comida faz a cobra crescer 1.",
    controls: "Use as setas para mudar de direção. No telemóvel, use as teclas W/A/S/Z ou gestos de deslizar."
  },
  "Tetris": {
    title: "Tetris",
    description: "Jogo clássico de empilhar blocos. Organize as peças que caem para criar linhas horizontais completas que desaparecem.",
    modes: "Fácil: Velocidade de queda mais lenta\nDifícil: Velocidade de queda mais rápida com mais desafio",
    scoring: "Pontos são atribuídos por limpar linhas. Várias linhas ao mesmo tempo dão pontos bónus. Pontuação mais alta ganha!",
    controls: "Setas: Esquerda/Direita para mover, Baixo para cair mais rápido, Cima para rodar. Barra de espaço para queda instantânea."
  },
  "Candy Crush": {
    title: "Candy Crush",
    description: "Combine 3 ou mais doces da mesma cor numa linha ou coluna para os limpar e marcar pontos.",
    modes: "Nível 1 (6×6): Jogo clássico de combinar 3, 2 minutos\nNível 2 (8×8): Grelha maior com 10% gemas quebradas que só podem ser destruídas ao combinar gemas adjacentes, 3 minutos\nNível 3 (8×8): 15% gemas quebradas, cantos e centro bloqueados criando um campo de jogo em forma de cruz, 3 minutos",
    scoring: "Combine mais doces para pontuações mais altas. Combos e combinações especiais dão pontos bónus. Limpar gemas quebradas dá +20 pontos bónus. Pontuação mais alta ganha!",
    controls: "Clique em dois doces adjacentes para os trocar, ou arraste um doce para um adjacente. Combine 3+ da mesma cor para pontuar!"
  },
  "Tic Tac Toe": {
    title: "Jogo do Galo",
    description: "Jogo clássico de grelha 3×3. Consiga três dos seus símbolos numa linha (horizontal, vertical ou diagonal) para ganhar!",
    modes: "Modo único - jogue contra o computador",
    scoring: "Sem pontuação - apenas vitórias, derrotas ou empates",
    controls: "Clique em qualquer quadrado vazio para colocar a sua marca (X). O computador joga como O."
  },
  "Puzzle Bobble": {
    title: "Puzzle Bobble",
    description: "Atire bolhas coloridas para combinar 3 ou mais da mesma cor. Limpe todas as bolhas antes que cheguem ao fundo!",
    modes: "Fácil: Velocidade de queda padrão das bolhas\nDifícil: Bolhas descem mais rápido com velocidade crescente ao longo do tempo",
    scoring: "Pontos por cada bolha rebentada (combinar 3+ ou bolhas flutuantes). Bónus de tempo: se completar em menos de 3 minutos, adicione (180 - segundos) à sua pontuação. Exemplo: conclusão em 2:30 = 30 pontos de bónus. Pontuação total = pontos base + bónus de tempo. Pontuação mais alta ganha!",
    controls: "Mova o rato para apontar, clique para atirar. Combine 3+ bolhas da mesma cor para as rebentar. O temporizador mostra o tempo decorrido."
  },
  "Cross the Bridge": {
    title: "Atravessar a Ponte",
    description: "Navegue pela ponte escolhendo os blocos corretos. Um bloco por coluna é seguro - os outros teleportam-no de volta ao início!",
    modes: "Curto: 3 linhas × 6 colunas\nLongo: 3 linhas × 12 colunas",
    scoring: "Complete a ponte com mais tempo restante. O temporizador começa em 3 minutos. Mais tempo restante ganha!",
    controls: "Clique nos blocos para os testar. Clique direito para colocar bandeiras como lembretes."
  },
  "Simon Says": {
    title: "Simon Diz",
    description: "Jogo de memória onde repete sequências cada vez mais longas de cores. Observe o padrão e depois repita-o!",
    modes: "Modo único com níveis progressivamente mais difíceis",
    scoring: "Sem classificação - veja quantas rondas consegue completar!",
    controls: "Clique nos botões coloridos na mesma ordem mostrada. Cada ronda adiciona mais uma cor para memorizar."
  },
  "Snakes and Ladders": {
    title: "Cobras e Escadas",
    description: "Jogo de tabuleiro clássico. Lance o dado e corra até ao quadrado 100. Suba escadas para avançar, evite cobras que o enviam para trás!",
    modes: "Modo único - corrida contra o computador",
    scoring: "Sem classificação - o primeiro a chegar ao quadrado 100 ganha o jogo!",
    controls: "Clique em 'Lançar Dado' para jogar. A sua peça move-se automaticamente com base no lançamento do dado."
  },
  "Wordle": {
    title: "Wordle",
    description: "Adivinhe a palavra de 5 letras em 6 tentativas. Após cada tentativa, os blocos mudam de cor para mostrar quão perto está!",
    modes: "Modo único - nova palavra em cada jogo",
    scoring: "Sem classificação - tente adivinhar a palavra no menor número de tentativas possível!",
    controls: "Digite a sua tentativa de 5 letras e pressione Enter. Verde = letra e posição corretas, Amarelo = letra correta posição errada, Cinzento = letra não está na palavra."
  },
  "Minefield": {
    title: "Campo Minado",
    description: "Limpe uma grelha revelando células seguras enquanto evita bombas escondidas. Os números mostram quantas bombas estão adjacentes.",
    modes: "Fácil (5×5): 5 bombas\nMédio (6×6): 8 bombas\nDifícil (8×8): 12 bombas",
    scoring: "Tempo mais rápido para limpar todas as células seguras ganha. Tempo mais baixo é melhor!",
    controls: "Clique esquerdo para revelar uma célula. Clique direito para colocar uma bandeira em bombas suspeitas. Limpe todas as células sem bomba para ganhar!"
  },
  "Arkanoid": {
    title: "Arkanoid",
    description: "Rebata uma bola com a sua raquete para partir todos os tijolos. Não deixe a bola cair no fundo!",
    modes: "Modo único com vários níveis",
    scoring: "Sem classificação - parta todos os tijolos para avançar para o próximo nível!",
    controls: "Mova o rato esquerda/direita para controlar a raquete. A bola ressalta automaticamente. Limpe todos os tijolos para ganhar o nível."
  },
  "Word Search": {
    title: "Sopa de Letras",
    description: "Encontre todas as palavras escondidas numa grelha de letras. As palavras podem estar horizontal, vertical ou diagonal em qualquer direção.",
    modes: "Modo único com colocação aleatória de palavras em cada jogo",
    scoring: "Tempo mais rápido para encontrar todas as palavras ganha. Tempo mais baixo é melhor!",
    controls: "Clique e arraste para selecionar palavras. Solte quando tiver destacado uma palavra completa."
  },
  "Mahjong Solitaire": {
    title: "Mahjong Solitário",
    description: "Combine pares de peças idênticas que estejam livres (não bloqueadas por outras peças). Limpe todas as peças para ganhar!",
    modes: "Fácil: Disposição de peças mais simples\nDifícil: Disposição empilhada mais complexa",
    scoring: "Tempo mais rápido para limpar todas as peças ganha. Tempo mais baixo é melhor!",
    controls: "Clique em duas peças correspondentes que estejam livres em pelo menos um lado. Elas desaparecerão se combinarem."
  },
  "Hammer the Ant": {
    title: "Esmagar a Formiga",
    description: "Clique nas formigas à medida que aparecem para as esmagar antes que o tempo acabe. Reaja rapidamente para pontuações mais altas!",
    modes: "Fácil: Formigas aparecem mais devagar\nDifícil: Formigas aparecem mais rápido e desaparecem mais depressa",
    scoring: "Mais formigas esmagadas ganha. Pontuação mais alta ganha!",
    controls: "Clique nas formigas assim que aparecem. Velocidade e precisão são fundamentais!"
  },
  "PacMan": {
    title: "Pac-Man",
    description: "Guie o Pac-Man por um labirinto, comendo pontos enquanto evita fantasmas. Coma pílulas de poder para virar a mesa e perseguir fantasmas!",
    modes: "Modo único com jogabilidade clássica",
    scoring: "Sem classificação - coma todos os pontos para completar o nível!",
    controls: "Setas para mover. Coma todos os pontos pequenos e pílulas de poder enquanto evita fantasmas (a menos que tenha comido uma pílula de poder)."
  },
  "Puzzle": {
    title: "Puzzle de Imagem",
    description: "Reorganize peças de imagem embaralhadas para recriar a imagem original. Clique nas peças e depois clique nos espaços vazios do tabuleiro.",
    modes: "Fácil (4×4): 16 peças\nMédio (6×6): 36 peças\nDifícil (7×7): 49 peças",
    scoring: "Tempo mais rápido para completar o puzzle ganha. Tempo mais baixo é melhor!",
    controls: "Clique numa peça à esquerda, depois clique onde deve ir no tabuleiro direito. Peças corretas ficam no lugar."
  },
  "Domino": {
    title: "Dominó",
    description: "Jogue dominó contra o computador. Combine números nas peças para construir uma cadeia. O primeiro a jogar todas as peças ganha!",
    modes: "Modo único - Jogador vs Computador",
    scoring: "Quando ganha, marca pontos iguais a todos os pontos nas peças restantes do adversário. Pontuação cumulativa mais alta ganha!",
    controls: "Clique na sua peça para a selecionar, depois clique num espaço amarelo para a jogar. Clique em 'Comprar' se não tiver jogadas válidas."
  },
  "Maze": {
    title: "Labirinto",
    description: "Navegue por um labirinto do início ao fim o mais rápido possível!",
    modes: "Fácil (11×11): Labirinto pequeno\nMédio (17×17): Labirinto maior\nDifícil (23×23): Labirinto grande",
    scoring: "Tempo mais rápido para chegar ao fim ganha. Tempo mais baixo é melhor!",
    controls: "Use as setas para mover ou clique nas células adjacentes para mover a pata. Encontre o caminho de ▶️ até 🏁!"
  },
  "Connect Four": {
    title: "Quatro em Linha",
    description: "Deixe cair discos coloridos numa grelha vertical. Consiga quatro seguidos horizontal, vertical ou diagonalmente para ganhar! Jogue contra uma IA.",
    modes: "Fácil: IA faz movimentos mais simples\nDifícil: IA usa táticas estratégicas de bloqueio e vitória",
    scoring: "Ganhe no menor número de jogadas (peças jogadas) possível! Menor número de jogadas é melhor. Vitórias mais eficientes são classificadas no topo!",
    controls: "Clique em qualquer coluna para deixar cair o seu disco (vermelho). O disco cai para a posição mais baixa disponível. Tente conectar quatro antes da IA (amarelo)!"
  },
  "2048": {
    title: "2048",
    description: "Deslize blocos numerados numa grelha para os combinar e criar um bloco com o número 2048! Quando dois blocos com o mesmo número se tocam, fundem-se num só.",
    modes: "Grelha 4×4: Modo clássico com dificuldade padrão\nGrelha 5×5: Grelha maior com mais espaço e estratégia",
    scoring: "Maior pontuação ganha! Pontos são ganhos ao fundir blocos. Blocos de maior valor dão mais pontos. Melhor pontuação é guardada por tamanho de grelha!",
    controls: "Use as setas (↑ ↓ ← →) para deslizar todos os blocos nessa direção. No telemóvel, deslize na direção que quer mover. Os blocos deslizam até bater noutro bloco ou na borda!"
  },
  "TCG Game": {
    title: "Elemental Awakening TCG",
    description: "Batalhe contra a IA do computador num jogo estratégico de cartas colecionáveis! Construa o seu baralho, jogue criaturas, evolua-as através de estágios e use itens estrategicamente para derrotar as criaturas do oponente.",
    modes: "4 Baralhos Únicos para escolher:\n• Baralho Místico: Criaturas psíquicas roxas\n• Baralho Vento: Criaturas voadoras e neutras\n• Baralho Celestial: Criaturas de grama e natureza\n• Baralho Mecânico: Criaturas metálicas e mecânicas\n\nA IA seleciona aleatoriamente um baralho em cada jogo.",
    scoring: "Registo de vitórias/derrotas é rastreado! Primeiro jogador a marcar 3 pontos ganha (1 ponto por criatura derrotada). O placar classifica os jogadores por taxa de vitórias: vitórias/(vitórias+derrotas). Maior taxa de vitórias = melhor classificação!",
    controls: "Fase de Configuração (Turno 0):\n• Deve colocar 1 criatura Estágio 1 no espaço ativo primeiro\n• Pode colocar outras criaturas Estágio 1 no banco (opcional)\n• Clique em Concluído quando estiver pronto para começar\n\nCada Turno:\n• Compre 1 carta no início do turno\n• Anexe 1 energia a qualquer criatura (uma vez por turno)\n• Jogue criaturas Estágio 1 em espaços vazios do banco\n• Evolua criaturas (apenas a partir do Turno 3):\n  - Não pode evoluir cartas jogadas neste turno\n  - Não pode evoluir a mesma carta duas vezes no mesmo turno\n  - Estágio 1→Estágio 2→Estágio 3\n• Use 1 carta de item por turno (máximo):\n  - Poção: Cure 20 HP\n  - Compra de Carta: Compre 2 cartas\n  - Reforço: +20 de dano no próximo ataque\n• Ataque com criatura ativa (termina o turno imediatamente)\n  - Requer energia igual ao custo do movimento\n  - Mostra nome do movimento e dano no botão\n• Recue ativo para o banco (custa energia mostrada no botão)\n  - Não pode recuar após atacar\n\nCondições de Vitória:\n• Marque 3 pontos (derrote 3 criaturas do oponente)\n• Oponente não tem mais criaturas\n• Máximo de 30 turnos - mais pontos ganha"
  }
};

function showInfo() {
  const section = document.getElementById("leaderboard-section");
  
  section.innerHTML = `
    <div class="leaderboard-content">
      <button class="close-leaderboard-btn">${t("close")}</button>
      <h2>${t("infoTitle")}</h2>
      <p>${t("infoSubtitle")}</p>
      <div id="info-game-list" class="leaderboard-game-list"></div>
    </div>
  `;
  
  section.classList.remove("hidden");
  
  const closeBtn = section.querySelector(".close-leaderboard-btn");
  closeBtn.addEventListener("click", closeLeaderboard);
  
  const gameList = document.getElementById("info-game-list");
  
  fetch("games.json").then(res => res.json()).then(data => {
    data.games.forEach(folder => {
      const btn = document.createElement("button");
      btn.className = "leaderboard-game-btn";
      
      const img = document.createElement("img");
      img.src = `icons/${folder}.svg`;
      img.onerror = function() { this.src = `icons/${folder}.png`; };
      img.className = "leaderboard-game-icon";
      
      const span = document.createElement("span");
      span.textContent = t(folder);
      span.setAttribute("data-game-name", folder); // Store original name for translation updates
      
      btn.appendChild(img);
      btn.appendChild(span);
      btn.onclick = () => showGameInfo(folder);
      
      gameList.appendChild(btn);
    });
  });
}

function showGameInfo(gameName) {
  const descriptions = currentLanguage === "pt" ? gameDescriptionsPT : gameDescriptions;
  const info = descriptions[gameName];
  
  if (!info) {
    alert(`${t("noInfo")} ${t(gameName)}.`);
    return;
  }
  
  const howToPlay = currentLanguage === "pt" ? "📖 Como Jogar" : "📖 How to Play";
  const gameModes = currentLanguage === "pt" ? "🎮 Modos de Jogo" : "🎮 Game Modes";
  const scoringLabel = currentLanguage === "pt" ? "🏆 Pontuação" : "🏆 Scoring";
  const controlsLabel = currentLanguage === "pt" ? "🕹️ Controlos" : "🕹️ Controls";
  
  // Create modal overlay
  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
    animation: fadeIn 0.2s ease-out;
  `;
  
  const content = document.createElement("div");
  content.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 15px;
    max-width: 600px;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    position: relative;
  `;
  
  content.innerHTML = `
    <button style="position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 30px; cursor: pointer; color: #666;">×</button>
    <h2 style="margin-top: 0; color: #333;">${info.title}</h2>
    <div style="margin: 20px 0;">
      <h3 style="color: #555; margin-bottom: 8px;">${howToPlay}</h3>
      <p style="color: #666; line-height: 1.6;">${info.description}</p>
    </div>
    <div style="margin: 20px 0;">
      <h3 style="color: #555; margin-bottom: 8px;">${gameModes}</h3>
      <p style="color: #666; line-height: 1.6; white-space: pre-line;">${info.modes}</p>
    </div>
    <div style="margin: 20px 0;">
      <h3 style="color: #555; margin-bottom: 8px;">${scoringLabel}</h3>
      <p style="color: #666; line-height: 1.6;">${info.scoring}</p>
    </div>
    <div style="margin: 20px 0;">
      <h3 style="color: #555; margin-bottom: 8px;">${controlsLabel}</h3>
      <p style="color: #666; line-height: 1.6;">${info.controls}</p>
    </div>
  `;
  
  const closeBtn = content.querySelector("button");
  closeBtn.onclick = () => modal.remove();
  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Add animation
  if (!document.getElementById("infoModalStyles")) {
    const style = document.createElement("style");
    style.id = "infoModalStyles";
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
}

// Leaderboard functions
function showLeaderboard() {
  const section = document.getElementById("leaderboard-section");
  
  // Reset to main leaderboard view
  section.innerHTML = `
    <div class="leaderboard-content">
      <button class="close-leaderboard-btn">${t("close")}</button>
      <h2>${t("leaderboardTitle")}</h2>
      <p>${t("leaderboardSubtitle")}</p>
      <div id="leaderboard-game-list" class="leaderboard-game-list"></div>
    </div>
  `;
  
  section.classList.remove("hidden");
  
  // Re-attach close button listener for main leaderboard
  const closeBtn = section.querySelector(".close-leaderboard-btn");
  closeBtn.addEventListener("click", closeLeaderboard);
  
  const gameList = document.getElementById("leaderboard-game-list");
  
  // Populate game list
  fetch("games.json").then(res => res.json()).then(data => {
    data.games.forEach(folder => {
      const btn = document.createElement("button");
      btn.className = "leaderboard-game-btn";
      
      const img = document.createElement("img");
      // Try SVG first, fallback to PNG
      img.src = `icons/${folder}.svg`;
      img.onerror = function() { this.src = `icons/${folder}.png`; };
      img.className = "leaderboard-game-icon";
      
      const span = document.createElement("span");
      span.textContent = t(folder);
      span.setAttribute("data-game-name", folder); // Store original name for translation updates
      
      btn.appendChild(img);
      btn.appendChild(span);
      btn.onclick = () => showGameLeaderboard(folder);
      
      gameList.appendChild(btn);
    });
  });
}

function showGameLeaderboard(gameName) {
  const section = document.getElementById("leaderboard-section");
  section.innerHTML = `
    <div class="leaderboard-content" id="game-leaderboard-page">
      <h2>${t(gameName)} ${t("leaderboard")}</h2>
      <button class="close-leaderboard-btn">${t("close")}</button>
      <button class="refresh-leaderboard-btn" style="position: absolute; top: 20px; right: 60px; padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">${t("refresh")}</button>
      <div id="leaderboard-content"></div>
    </div>
  `;
  
  // Re-attach close button listener
  const closeBtn = section.querySelector(".close-leaderboard-btn");
  closeBtn.addEventListener("click", closeLeaderboard);
  
  // Attach refresh button listener
  const refreshBtn = section.querySelector(".refresh-leaderboard-btn");
  refreshBtn.addEventListener("click", () => {
    showGameLeaderboard(gameName); // Reload the same leaderboard
  });
  
  const content = document.getElementById("leaderboard-content");
  const { db } = initFirebase();
  
  // If Firebase not available, show local storage scores (if any)
  if (!db) {
    content.textContent = t("errorLoading") + " Firebase";
    return;
  }
  
  content.textContent = t("loading");
  
  // Special handling for score-based games with difficulty modes
  if (gameName === "Tetris" || gameName === "Hammer the Ant") {
    showScoreBasedLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for time-based games with difficulty modes
  if (gameName === "Mahjong Solitaire") {
    showTimeBasedDifficultyLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Cross the Bridge (timeLeft - higher is better, with difficulty modes)
  if (gameName === "Cross the Bridge") {
    showTimeLeftDifficultyLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Snake (length - higher is better)
  if (gameName === "Snake") {
    showLengthBasedDifficultyLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Memory (turns - lower is better)
  if (gameName === "Memory") {
    showTurnsBasedDifficultyLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Puzzle (bestTime - lower is better, with difficulty modes)
  if (gameName === "Puzzle") {
    showPuzzleLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Candy Crush (score - higher is better)
  if (gameName === "Candy Crush") {
    showCandyCrushLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Domino (score - higher is better)
  if (gameName === "Domino") {
    showDominoLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Puzzle Bobble (score - higher is better, with difficulty modes)
  if (gameName === "Puzzle Bobble") {
    showScoreBasedLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Minefield (bestTime - lower is better, with difficulty modes)
  if (gameName === "Minefield") {
    showTimeBasedDifficultyLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Maze (bestTime - lower is better, with difficulty modes)
  if (gameName === "Maze") {
    showTimeBasedDifficultyLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Connect Four (turns - lower is better, with difficulty modes)
  if (gameName === "Connect Four") {
    showConnectFourLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for 2048 (score - higher is better, with grid size modes)
  if (gameName === "2048") {
    show2048Leaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for TCG Game (win/loss record)
  if (gameName === "TCG Game") {
    showTCGLeaderboard(db, content, gameName);
    return;
  }
  
  // Get all games, then filter and sort client-side (no index needed)
  // Note: This fetches all games, which is fine for low volumes
  db.collection("games")
    .limit(100)
    .get()
    .then(snapshot => {
      // Filter for specific game and sort by bestTime
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.gameName === gameName)
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      if (docs.length === 0) {
        content.innerHTML = `<p style="color: #666;">${t("noScores")}</p>`;
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Best Time</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      docs.forEach(doc => {
        const timeFormatted = formatTime(doc.bestTime);
        const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${doc.playerName}</td>
          <td>${timeFormatted}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      document.getElementById("leaderboard-content").textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getTableHeader(type) {
  const rank = t("rank");
  const player = t("player");
  const date = t("date");
  
  if (type === "score") {
    return `<thead><tr><th>${rank}</th><th>${player}</th><th>${t("score")}</th><th>${date}</th></tr></thead>`;
  } else if (type === "bestTime") {
    return `<thead><tr><th>${rank}</th><th>${player}</th><th>${t("bestTime")}</th><th>${date}</th></tr></thead>`;
  } else if (type === "timeLeft") {
    return `<thead><tr><th>${rank}</th><th>${player}</th><th>${t("timeLeft")}</th><th>${date}</th></tr></thead>`;
  } else if (type === "length") {
    return `<thead><tr><th>${rank}</th><th>${player}</th><th>${t("length")}</th><th>${date}</th></tr></thead>`;
  } else if (type === "turns") {
    return `<thead><tr><th>${rank}</th><th>${player}</th><th>${t("turns")}</th><th>${date}</th></tr></thead>`;
  } else if (type === "time") {
    return `<thead><tr><th>${rank}</th><th>${player}</th><th>${t("time")}</th><th>${date}</th></tr></thead>`;
  }
  return `<thead><tr><th>${rank}</th><th>${player}</th><th>${date}</th></tr></thead>`;
}

function showScoreBasedLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      const easyDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "easy")
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      const hardDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "hard")
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Easy mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("easyMode")}</h3>`;
      if (easyDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += `<table class="leaderboard-table">${getTableHeader("score")}<tbody>`;
        easyDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Hard mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("hardMode")}</h3>`;
      if (hardDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += `<table class="leaderboard-table">${getTableHeader("score")}<tbody>`;
        hardDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showTimeBasedDifficultyLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(300)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      const easyDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "easy")
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      const mediumDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "medium")
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      const hardDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "hard")
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      // Check if game has 3 difficulties (like Minefield and Maze) or 2 (like Mahjong)
      const hasThreeDifficulties = mediumDocs.length > 0 || gameName === "Minefield" || gameName === "Maze";
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Easy mode table
      html += `<div style="flex: 1; min-width: 280px;"><h3>${t("easyMode")}</h3>`;
      if (easyDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Best Time</th><th>Date</th></tr></thead><tbody>';
        easyDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.bestTime);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Medium mode table (only for games with 3 difficulties)
      if (hasThreeDifficulties) {
        html += `<div style="flex: 1; min-width: 280px;"><h3>${t("mediumMode")}</h3>`;
        if (mediumDocs.length === 0) {
          html += `<p style="color: #666;">${t("noScores")}</p>`;
        } else {
          html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Best Time</th><th>Date</th></tr></thead><tbody>';
          mediumDocs.forEach((doc, i) => {
            const timeFormatted = formatTime(doc.bestTime);
            const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
            html += `<tr>
              <td>${i + 1}</td>
              <td>${doc.playerName}</td>
              <td>${timeFormatted}</td>
              <td>${date}</td>
            </tr>`;
          });
          html += '</tbody></table>';
        }
        html += '</div>';
      }
      
      // Hard mode table
      html += `<div style="flex: 1; min-width: 280px;"><h3>${t("hardMode")}</h3>`;
      if (hardDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Best Time</th><th>Date</th></tr></thead><tbody>';
        hardDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.bestTime);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showLengthBasedDifficultyLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      const smallDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "small")
        .sort((a, b) => b.length - a.length)
        .slice(0, 10);
      
      const bigDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "big")
        .sort((a, b) => b.length - a.length)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Small mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("small")} (15x15)</h3>`;
      if (smallDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Length</th><th>Date</th></tr></thead><tbody>';
        smallDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.length}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Big mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("big")} (18x18)</h3>`;
      if (bigDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Length</th><th>Date</th></tr></thead><tbody>';
        bigDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.length}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showTimeLeftDifficultyLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      const shortDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "short")
        .sort((a, b) => b.timeLeft - a.timeLeft)
        .slice(0, 10);
      
      const longDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "long")
        .sort((a, b) => b.timeLeft - a.timeLeft)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Short mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("short")} (3x6)</h3>`;
      if (shortDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Time Left</th><th>Date</th></tr></thead><tbody>';
        shortDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.timeLeft);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Long mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("long")} (3x12)</h3>`;
      if (longDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Time Left</th><th>Date</th></tr></thead><tbody>';
        longDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.timeLeft);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showTurnsBasedDifficultyLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      const smallDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "small")
        .sort((a, b) => a.turns - b.turns)
        .slice(0, 10);
      
      const largeDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "large")
        .sort((a, b) => a.turns - b.turns)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Small mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("small")} (4x4)</h3>`;
      if (smallDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Turns</th><th>Date</th></tr></thead><tbody>';
        smallDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.turns}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Large mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("large")} (6x6)</h3>`;
      if (largeDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Turns</th><th>Date</th></tr></thead><tbody>';
        largeDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.turns}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showPuzzleLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      const easyDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "easy")
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      const mediumDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "medium")
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      const hardDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "hard")
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Easy mode table
      html += `<div style="flex: 1; min-width: 280px;"><h3>${t("easyMode")} (4×4)</h3>`;
      if (easyDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Time</th><th>Date</th></tr></thead><tbody>';
        easyDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.bestTime);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Medium mode table
      html += `<div style="flex: 1; min-width: 280px;"><h3>${t("mediumMode")} (6×6)</h3>`;
      if (mediumDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Time</th><th>Date</th></tr></thead><tbody>';
        mediumDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.bestTime);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Hard mode table
      html += `<div style="flex: 1; min-width: 280px;"><h3>${t("hardMode")} (7×7)</h3>`;
      if (hardDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Time</th><th>Date</th></tr></thead><tbody>';
        hardDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.bestTime);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showCandyCrushLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(300)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by level
      // Include old entries without difficulty (treat as Level 1)
      const level1Docs = allDocs
        .filter(doc => doc.gameName === gameName && (!doc.difficulty || doc.difficulty === "level1"))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      const level2Docs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "level2")
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      const level3Docs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "level3")
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Level 1 table
      html += `<div style="flex: 1; min-width: 280px;"><h3>Level 1 (6×6)</h3>`;
      if (level1Docs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
        level1Docs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Level 2 table
      html += `<div style="flex: 1; min-width: 280px;"><h3>Level 2 (8×8)</h3>`;
      if (level2Docs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
        level2Docs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Level 3 table
      html += `<div style="flex: 1; min-width: 280px;"><h3>Level 3 (8×8)</h3>`;
      if (level3Docs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
        level3Docs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showDominoLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(100)
    .get()
    .then(snapshot => {
      // Filter for Domino and sort by score (higher is better)
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.gameName === gameName)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      if (docs.length === 0) {
        content.innerHTML = `<p style="color: #666;">${t("noScores")}</p>`;
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      docs.forEach(doc => {
        const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${doc.playerName}</td>
          <td>${doc.score}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showConnectFourLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      // Only include entries that have a valid 'turns' field
      const easyDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "easy" && doc.turns !== undefined)
        .sort((a, b) => a.turns - b.turns)
        .slice(0, 10);
      
      const hardDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "hard" && doc.turns !== undefined)
        .sort((a, b) => a.turns - b.turns)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Easy mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("easyMode")}</h3>`;
      if (easyDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Turns</th><th>Date</th></tr></thead><tbody>';
        easyDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.turns || 'N/A'}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Hard mode table
      html += `<div style="flex: 1; min-width: 300px;"><h3>${t("hardMode")}</h3>`;
      if (hardDocs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Turns</th><th>Date</th></tr></thead><tbody>';
        hardDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.turns || 'N/A'}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function show2048Leaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by grid size
      const grid4x4Docs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "4x4")
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      const grid5x5Docs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "5x5")
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // 4x4 grid table
      html += `<div style="flex: 1; min-width: 300px;"><h3>4×4 Grid</h3>`;
      if (grid4x4Docs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
        grid4x4Docs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // 5x5 grid table
      html += `<div style="flex: 1; min-width: 300px;"><h3>5×5 Grid</h3>`;
      if (grid5x5Docs.length === 0) {
        html += `<p style="color: #666;">${t("noScores")}</p>`;
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
        grid5x5Docs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showTCGLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Group by player and calculate win/loss records
      const playerStats = {};
      
      allDocs
        .filter(doc => doc.gameName === gameName)
        .forEach(doc => {
          if (!playerStats[doc.playerName]) {
            playerStats[doc.playerName] = {
              playerName: doc.playerName,
              wins: 0,
              losses: 0,
              lastPlayed: doc.timestamp
            };
          }
          
          if (doc.result === 'win') {
            playerStats[doc.playerName].wins++;
          } else if (doc.result === 'loss') {
            playerStats[doc.playerName].losses++;
          }
          
          // Track most recent game
          if (doc.timestamp && (!playerStats[doc.playerName].lastPlayed || 
              doc.timestamp.toDate() > playerStats[doc.playerName].lastPlayed.toDate())) {
            playerStats[doc.playerName].lastPlayed = doc.timestamp;
          }
        });
      
      // Convert to array and calculate win rate
      const playerArray = Object.values(playerStats)
        .map(player => {
          const totalGames = player.wins + player.losses;
          const winRate = totalGames > 0 ? (player.wins / totalGames) * 100 : 0;
          return {
            ...player,
            totalGames,
            winRate
          };
        })
        .filter(player => player.totalGames > 0) // Only show players with at least 1 game
        .sort((a, b) => b.winRate - a.winRate) // Sort by win rate (highest first)
        .slice(0, 20); // Top 20
      
      if (playerArray.length === 0) {
        content.innerHTML = `<p style="color: #666;">${t("noScores")}</p>`;
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Wins</th><th>Losses</th><th>Win Rate</th><th>Last Played</th></tr></thead><tbody>';
      
      playerArray.forEach((player, i) => {
        const date = player.lastPlayed ? new Date(player.lastPlayed.toDate()).toLocaleDateString() : 'N/A';
        const winRateStr = player.winRate.toFixed(1) + '%';
        
        html += `<tr>
          <td>${i + 1}</td>
          <td>${player.playerName}</td>
          <td style="color: #4CAF50; font-weight: bold;">${player.wins}</td>
          <td style="color: #f44336; font-weight: bold;">${player.losses}</td>
          <td style="color: #FFD700; font-weight: bold;">${winRateStr}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}

// Close leaderboard section when clicking back to menu
// Close button is handled via onclick attribute

function closeLeaderboard() {
  const section = document.getElementById("leaderboard-section");
  if (section) {
    section.classList.add("hidden");
    // Reset to main leaderboard view when closed so next open shows game selection
    section.innerHTML = `
      <div class="leaderboard-content">
        <button class="close-leaderboard-btn">${t("close")}</button>
        <h2>${t("leaderboardTitle")}</h2>
        <p>${t("leaderboardSubtitle")}</p>
        <div id="leaderboard-game-list" class="leaderboard-game-list"></div>
      </div>
    `;
  }
}

buildMenu().then(() => {
  updateLanguage();
});

// Show name modal if no name stored
if (!playerName) {
  showNameModal();
}

// Language selector - set initial value and add listener
const languageSelect = document.getElementById("language-select");
languageSelect.value = currentLanguage;

languageSelect.addEventListener("change", (e) => {
  currentLanguage = e.target.value;
  localStorage.setItem("arcadeLanguage", currentLanguage);
  updateLanguage();
});

// MUSIC PLAYER
const audioFiles = [
  { name: "Moss Path", file: "audio/Moss_Path.mp3" },
  { name: "Poisonous Lavender", file: "audio/Poisonous_Lavender.mp3" },
  { name: "Sunlight Sprout", file: "audio/Sunlight_Sprout.mp3" },
  { name: "Voltage Collapse", file: "audio/Voltage_Collapse.mp3" },
  { name: "Haunted Corridor", file: "audio/Haunted_Corridor.mp3" },
  { name: "Hidden Glade", file: "audio/Hidden_Glade.mp3" },
  { name: "Pocket Kingdom", file: "audio/Pocket_Kingdom.mp3" }
];

let currentTrack = 0;
let isPlaying = false;
let audioPlayer = new Audio();

const playBtn = document.getElementById("music-play");
const prevBtn = document.getElementById("music-prev");
const nextBtn = document.getElementById("music-next");
const trackName = document.getElementById("music-track-name");

function updateTrackDisplay() {
  if (isPlaying) {
    trackName.textContent = audioFiles[currentTrack].name;
  } else {
    trackName.textContent = t("noTrack");
  }
}

function playTrack() {
  audioPlayer.src = audioFiles[currentTrack].file;
  audioPlayer.play();
  isPlaying = true;
  playBtn.textContent = "⏸";
  updateTrackDisplay();
}

function pauseTrack() {
  audioPlayer.pause();
  isPlaying = false;
  playBtn.textContent = "▶️";
  updateTrackDisplay();
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % audioFiles.length;
  if (isPlaying) {
    playTrack();
  } else {
    updateTrackDisplay();
  }
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + audioFiles.length) % audioFiles.length;
  if (isPlaying) {
    playTrack();
  } else {
    updateTrackDisplay();
  }
}

audioPlayer.addEventListener("ended", () => {
  nextTrack();
});

playBtn.addEventListener("click", () => {
  if (isPlaying) {
    pauseTrack();
  } else {
    playTrack();
  }
});

nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

updateTrackDisplay();

// Export functions for use in game pages
window.saveGameScore = function(gameName, scoreData) {
  console.log("saveGameScore called:", gameName, scoreData);
  
  return getPlayerName().then(name => {
    console.log("Player name retrieved:", name);
    const { db } = initFirebase();
    
    // If Firebase not available, just log the score
    if (!db) {
      console.error("Firebase DB not initialized");
      return { isNewBest: false };
    }
    
    console.log("Checking existing scores for", name, "in", gameName);
    
    // Build query based on game type
    let query = db.collection("games")
      .where("playerName", "==", name)
      .where("gameName", "==", gameName);
    
    // Add difficulty filter for games that have it (like Tetris)
    if (scoreData.difficulty) {
      query = query.where("difficulty", "==", scoreData.difficulty);
    }
    
    // Determine if this is a time-based or score-based game
    const isTimeBased = scoreData.hasOwnProperty("bestTime");
    const isScoreBased = scoreData.hasOwnProperty("score");
    const isTimeLeftBased = scoreData.hasOwnProperty("timeLeft");
    const isLengthBased = scoreData.hasOwnProperty("length");
    const isTurnsBased = scoreData.hasOwnProperty("turns");
    const isTCGGame = scoreData.hasOwnProperty("result"); // TCG Game uses result field
    
    // Special handling for TCG Game - always create new record (don't update)
    if (isTCGGame) {
      console.log("Creating new TCG Game record");
      return db.collection("games").add({
        playerName: name,
        gameName: gameName,
        ...scoreData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      }).then(docRef => {
        console.log("TCG Game result saved with ID:", docRef.id);
        return { isNewBest: false }; // Never show "new best" for TCG
      });
    }
    
    return query.limit(1).get()
      .then(snapshot => {
        console.log("Existing scores found:", snapshot.size);
        
        let isNewBest = false;
        
        if (!snapshot.empty) {
          const existingDoc = snapshot.docs[0];
          const existingData = existingDoc.data();
          
          let shouldUpdate = false;
          
          if (isTimeBased || isTurnsBased) {
            // For time-based and turns-based games, lower is better
            const field = isTimeBased ? "bestTime" : "turns";
            console.log(`Existing ${field}:`, existingData[field], `New ${field}:`, scoreData[field]);
            shouldUpdate = scoreData[field] < existingData[field];
          } else if (isScoreBased || isTimeLeftBased || isLengthBased) {
            // For score-based, timeLeft, and length games, higher is better
            const field = isScoreBased ? "score" : isTimeLeftBased ? "timeLeft" : "length";
            console.log(`Existing ${field}:`, existingData[field], `New ${field}:`, scoreData[field]);
            shouldUpdate = scoreData[field] > existingData[field];
          }
          
          if (!shouldUpdate) {
            console.log("New score is not better than existing best");
            return { isNewBest: false };
          }
          
          isNewBest = true;
          
          // Update existing score
          console.log("Updating existing score");
          return db.collection("games").doc(existingDoc.id).update({
            ...scoreData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => ({ isNewBest: true }));
        } else {
          // No existing score - this is their first score (also counts as new best)
          isNewBest = true;
          console.log("Creating new score entry");
          return db.collection("games").add({
            playerName: name,
            gameName: gameName,
            ...scoreData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }).then(docRef => {
            console.log("Score saved with ID:", docRef.id);
            return { isNewBest: true };
          });
        }
      })
      .catch(err => {
        console.error("Error in saveGameScore:", err);
        throw err;
      });
  });
};

// Show new best score notification
window.showNewBestScore = function(gameName, scoreData) {
  const message = document.createElement("div");
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px 50px;
    border-radius: 15px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    z-index: 10000;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    animation: popIn 0.3s ease-out;
  `;
  
  message.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
    <div>${t("newBestScore")}</div>
  `;
  
  // Add animation keyframes
  if (!document.getElementById("newBestScoreStyles")) {
    const style = document.createElement("style");
    style.id = "newBestScoreStyles";
    style.textContent = `
      @keyframes popIn {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(message);
  
  // Remove after 3 seconds
  setTimeout(() => {
    message.style.transition = "opacity 0.3s";
    message.style.opacity = "0";
    setTimeout(() => message.remove(), 300);
  }, 3000);
};

// COLLAPSE/EXPAND BANNER
const collapseBtn = document.getElementById("collapse-btn");
const banner = document.querySelector(".banner");
let isCollapsed = false;

collapseBtn.addEventListener("click", () => {
  isCollapsed = !isCollapsed;
  
  if (isCollapsed) {
    banner.classList.add("collapsed");
    collapseBtn.textContent = "▼";
    collapseBtn.title = "Expand menu";
  } else {
    banner.classList.remove("collapsed");
    collapseBtn.textContent = "▲";
    collapseBtn.title = "Collapse menu";
  }
});
