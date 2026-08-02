// Battleship vs AI Game

// Translations
let currentLanguage = 'en';

const translations = {
  en: {
    title: 'Battleship vs AI',
    selectDifficulty: 'Select Difficulty',
    intermediate: 'Intermediate',
    hard: 'Hard',
    placeShips: 'Place Your Ships',
    placementInstruction: 'Click a cell on your grid, then choose orientation',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    resetPlacement: 'Reset Placement',
    startGame: 'Start Game',
    yourFleet: 'Your Fleet',
    yourGrid: 'Your Grid',
    enemyGrid: 'Enemy Grid',
    turn: 'Turn:',
    player: 'Player',
    ai: 'AI',
    victory: 'Victory!',
    defeat: 'Defeat!',
    youWon: 'You destroyed all enemy ships!',
    youLost: 'The AI destroyed all your ships!',
    clickCount: 'Total clicks:',
    playAgain: 'Play Again',
    hit: 'Hit!',
    miss: 'Miss!',
    youSank: 'You sank the enemy\'s',
    aiSank: 'AI sank your',
    carrier: 'Carrier',
    battleship: 'Battleship',
    cruiser: 'Cruiser',
    submarine: 'Submarine',
    destroyer: 'Destroyer',
    placeShip: 'Place your'
  },
  pt: {
    title: 'Batalha Naval vs IA',
    selectDifficulty: 'Selecione a Dificuldade',
    intermediate: 'Intermédio',
    hard: 'Difícil',
    placeShips: 'Posicione os Seus Navios',
    placementInstruction: 'Clique numa célula da sua grelha, depois escolha a orientação',
    horizontal: 'Horizontal',
    vertical: 'Vertical',
    resetPlacement: 'Reiniciar Posicionamento',
    startGame: 'Iniciar Jogo',
    yourFleet: 'A Sua Frota',
    yourGrid: 'A Sua Grelha',
    enemyGrid: 'Grelha Inimiga',
    turn: 'Turno:',
    player: 'Jogador',
    ai: 'IA',
    victory: 'Vitória!',
    defeat: 'Derrota!',
    youWon: 'Destruiu todos os navios inimigos!',
    youLost: 'A IA destruiu todos os seus navios!',
    clickCount: 'Total de cliques:',
    playAgain: 'Jogar Novamente',
    hit: 'Acertou!',
    miss: 'Falhou!',
    youSank: 'Afundou o',
    aiSank: 'IA afundou o seu',
    carrier: 'Porta-Aviões',
    battleship: 'Couraçado',
    cruiser: 'Cruzador',
    submarine: 'Submarino',
    destroyer: 'Destruidor',
    placeShip: 'Posicione o seu'
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

// Get language from parent
function getParentLanguage() {
  if (window.parent && window.parent !== window) {
    try {
      const parentLang = window.parent.localStorage.getItem('arcadeLanguage');
      if (parentLang) {
        currentLanguage = parentLang;
      }
    } catch (e) {
      console.log('Cannot access parent language, using default');
    }
  }
}

// Listen for language changes
window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'languageChange') {
    currentLanguage = event.data.language;
    updateLanguage();
  }
});

function updateLanguage() {
  document.getElementById('game-title').textContent = t('title');
  document.getElementById('select-difficulty-text').textContent = t('selectDifficulty');
  document.getElementById('intermediate-text').textContent = t('intermediate');
  document.getElementById('hard-text').textContent = t('hard');
  document.getElementById('placement-title').textContent = t('placeShips');
  document.getElementById('placement-instruction').textContent = t('placementInstruction');
  document.getElementById('horizontal-text').textContent = t('horizontal');
  document.getElementById('vertical-text').textContent = t('vertical');
  document.getElementById('reset-text').textContent = t('resetPlacement');
  document.getElementById('start-text').textContent = t('startGame');
  document.getElementById('your-fleet-text').textContent = t('yourFleet');
  document.getElementById('your-grid-text').textContent = t('yourGrid');
  document.getElementById('enemy-grid-text').textContent = t('enemyGrid');
  document.getElementById('turn-label').textContent = t('turn');
  document.getElementById('play-again-text').textContent = t('playAgain');
  
  // Update ship indicator if in placement phase
  if (gameState.phase === 'placement' && gameState.currentShipIndex < ships.length) {
    updateShipIndicator();
  }
  
  // Update turn text if in game
  if (gameState.phase === 'game') {
    document.getElementById('current-turn').textContent = 
      gameState.currentTurn === 'player' ? t('player') : t('ai');
  }
}

// Ship definitions
const ships = [
  { name: 'carrier', size: 5 },
  { name: 'battleship', size: 4 },
  { name: 'cruiser', size: 3 },
  { name: 'submarine', size: 3 },
  { name: 'destroyer', size: 2 }
];

// Game state
let gameState = {
  difficulty: null,
  gridSize: 10,
  phase: 'difficulty', // difficulty, placement, game, gameover
  currentShipIndex: 0,
  orientation: 'horizontal',
  selectedCell: null,
  currentTurn: 'player',
  playerClickCount: 0,
  playerBoard: [],
  aiBoard: [],
  playerShips: [],
  aiShips: [],
  aiTargetQueue: [],
  aiHitMode: false,
  aiLastHit: null,
  aiHitDirection: null,
  aiTriedCells: new Set()
};

// Initialize
getParentLanguage();
updateLanguage();
setupEventListeners();

function setupEventListeners() {
  document.getElementById('btn-intermediate').addEventListener('click', () => selectDifficulty('intermediate'));
  document.getElementById('btn-hard').addEventListener('click', () => selectDifficulty('hard'));
  document.getElementById('btn-horizontal').addEventListener('click', () => setOrientation('horizontal'));
  document.getElementById('btn-vertical').addEventListener('click', () => setOrientation('vertical'));
  document.getElementById('btn-reset-placement').addEventListener('click', resetPlacement);
  document.getElementById('btn-start-game').addEventListener('click', startGame);
  document.getElementById('btn-play-again').addEventListener('click', playAgain);
}

function selectDifficulty(difficulty) {
  gameState.difficulty = difficulty;
  gameState.gridSize = difficulty === 'intermediate' ? 10 : 11;
  
  // Hide difficulty selection
  document.getElementById('difficulty-select').classList.add('hidden');
  
  // Show placement phase
  document.getElementById('placement-phase').classList.remove('hidden');
  
  // Initialize boards
  initializeBoards();
  createGrid('player-grid-placement', 'placement');
  updateShipIndicator();
  setOrientation('horizontal');
}

function initializeBoards() {
  const size = gameState.gridSize;
  gameState.playerBoard = Array(size).fill(null).map(() => Array(size).fill(null));
  gameState.aiBoard = Array(size).fill(null).map(() => Array(size).fill(null));
  gameState.playerShips = [];
  gameState.aiShips = [];
}

function createGrid(gridId, phase) {
  const grid = document.getElementById(gridId);
  grid.innerHTML = '';
  grid.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 35px)`;
  grid.style.gridTemplateRows = `repeat(${gameState.gridSize}, 35px)`;
  
  for (let row = 0; row < gameState.gridSize; row++) {
    for (let col = 0; col < gameState.gridSize; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      if (phase === 'placement') {
        cell.addEventListener('click', () => handlePlacementClick(row, col));
        cell.addEventListener('mouseenter', () => showPlacementPreview(row, col));
        cell.addEventListener('mouseleave', () => clearPlacementPreview());
      } else if (phase === 'game' && gridId === 'ai-grid') {
        cell.addEventListener('click', () => handlePlayerShot(row, col));
        cell.addEventListener('mouseenter', () => cell.classList.add('hover-preview'));
        cell.addEventListener('mouseleave', () => cell.classList.remove('hover-preview'));
      }
      
      grid.appendChild(cell);
    }
  }
}

function setOrientation(orientation) {
  gameState.orientation = orientation;
  document.getElementById('btn-horizontal').classList.toggle('active', orientation === 'horizontal');
  document.getElementById('btn-vertical').classList.toggle('active', orientation === 'vertical');
}

function updateShipIndicator() {
  if (gameState.currentShipIndex >= ships.length) {
    document.getElementById('ship-to-place').textContent = '';
    return;
  }
  
  const ship = ships[gameState.currentShipIndex];
  document.getElementById('ship-to-place').textContent = 
    `${t('placeShip')} ${t(ship.name)} (${ship.size})`;
}

function showPlacementPreview(row, col) {
  clearPlacementPreview();
  
  if (gameState.currentShipIndex >= ships.length) return;
  
  const ship = ships[gameState.currentShipIndex];
  const cells = getShipCells(row, col, ship.size, gameState.orientation);
  const isValid = isValidPlacement(cells, gameState.playerBoard);
  
  cells.forEach(([r, c]) => {
    if (r >= 0 && r < gameState.gridSize && c >= 0 && c < gameState.gridSize) {
      const cell = document.querySelector(`#player-grid-placement .cell[data-row="${r}"][data-col="${c}"]`);
      if (cell) {
        cell.classList.add(isValid ? 'hover-preview' : 'invalid-preview');
      }
    }
  });
}

function clearPlacementPreview() {
  document.querySelectorAll('#player-grid-placement .cell').forEach(cell => {
    cell.classList.remove('hover-preview', 'invalid-preview');
  });
}

function handlePlacementClick(row, col) {
  if (gameState.currentShipIndex >= ships.length) return;
  
  const ship = ships[gameState.currentShipIndex];
  const cells = getShipCells(row, col, ship.size, gameState.orientation);
  
  if (!isValidPlacement(cells, gameState.playerBoard)) {
    return;
  }
  
  // Place ship
  cells.forEach(([r, c]) => {
    gameState.playerBoard[r][c] = gameState.currentShipIndex;
  });
  
  gameState.playerShips.push({
    name: ship.name,
    size: ship.size,
    cells: cells,
    hits: 0,
    sunk: false
  });
  
  // Update visual
  cells.forEach(([r, c]) => {
    const cell = document.querySelector(`#player-grid-placement .cell[data-row="${r}"][data-col="${c}"]`);
    if (cell) cell.classList.add('ship');
  });
  
  gameState.currentShipIndex++;
  updateShipIndicator();
  
  // Enable start button if all ships placed
  if (gameState.currentShipIndex >= ships.length) {
    document.getElementById('btn-start-game').disabled = false;
  }
}

function getShipCells(row, col, size, orientation) {
  const cells = [];
  for (let i = 0; i < size; i++) {
    if (orientation === 'horizontal') {
      cells.push([row, col + i]);
    } else {
      cells.push([row + i, col]);
    }
  }
  return cells;
}

function isValidPlacement(cells, board) {
  for (const [row, col] of cells) {
    if (row < 0 || row >= gameState.gridSize || col < 0 || col >= gameState.gridSize) {
      return false;
    }
    if (board[row][col] !== null) {
      return false;
    }
  }
  return true;
}

function resetPlacement() {
  gameState.currentShipIndex = 0;
  gameState.playerShips = [];
  initializeBoards();
  createGrid('player-grid-placement', 'placement');
  updateShipIndicator();
  document.getElementById('btn-start-game').disabled = true;
}

function startGame() {
  // Place AI ships
  placeAIShips();
  
  // Randomly decide who goes first
  gameState.currentTurn = Math.random() < 0.5 ? 'player' : 'ai';
  gameState.playerClickCount = 0;
  
  // Hide placement, show game
  document.getElementById('placement-phase').classList.add('hidden');
  document.getElementById('game-phase').classList.remove('hidden');
  
  // Create game grids
  createGrid('player-grid', 'game');
  createGrid('ai-grid', 'game');
  
  // Update player grid with ships
  updatePlayerGrid();
  
  // Create ships status displays
  createShipsStatus();
  
  gameState.phase = 'game';
  
  // Update turn display
  document.getElementById('current-turn').textContent = 
    gameState.currentTurn === 'player' ? t('player') : t('ai');
  
  // If AI goes first
  if (gameState.currentTurn === 'ai') {
    setTimeout(aiTurn, 1000);
  }
}

function placeAIShips() {
  ships.forEach(ship => {
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 1000) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const row = Math.floor(Math.random() * gameState.gridSize);
      const col = Math.floor(Math.random() * gameState.gridSize);
      const cells = getShipCells(row, col, ship.size, orientation);
      
      if (isValidPlacement(cells, gameState.aiBoard)) {
        cells.forEach(([r, c]) => {
          gameState.aiBoard[r][c] = gameState.aiShips.length;
        });
        
        gameState.aiShips.push({
          name: ship.name,
          size: ship.size,
          cells: cells,
          hits: 0,
          sunk: false
        });
        
        placed = true;
      }
      attempts++;
    }
  });
}

function updatePlayerGrid() {
  gameState.playerShips.forEach(ship => {
    ship.cells.forEach(([row, col]) => {
      const cell = document.querySelector(`#player-grid .cell[data-row="${row}"][data-col="${col}"]`);
      if (cell) {
        cell.classList.add('ship');
      }
    });
  });
}

function createShipsStatus() {
  const playerStatus = document.getElementById('player-ships-status');
  const aiStatus = document.getElementById('ai-ships-status');
  
  playerStatus.innerHTML = '<strong>' + t('yourFleet') + ':</strong>';
  aiStatus.innerHTML = '<strong>' + t('enemyGrid') + ':</strong>';
  
  gameState.playerShips.forEach((ship, index) => {
    const div = document.createElement('div');
    div.className = 'ship-status-item';
    div.id = `player-ship-${index}`;
    div.textContent = `${t(ship.name)} (${ship.size})`;
    playerStatus.appendChild(div);
  });
  
  gameState.aiShips.forEach((ship, index) => {
    const div = document.createElement('div');
    div.className = 'ship-status-item';
    div.id = `ai-ship-${index}`;
    div.textContent = `${t(ship.name)} (${ship.size})`;
    aiStatus.appendChild(div);
  });
}

function handlePlayerShot(row, col) {
  if (gameState.currentTurn !== 'player') return;
  if (gameState.phase !== 'game') return;
  
  const cell = document.querySelector(`#ai-grid .cell[data-row="${row}"][data-col="${col}"]`);
  if (cell.classList.contains('hit') || cell.classList.contains('miss')) {
    return; // Already shot
  }
  
  gameState.playerClickCount++;
  
  const shipIndex = gameState.aiBoard[row][col];
  
  if (shipIndex !== null) {
    // Hit
    cell.classList.add('hit');
    cell.textContent = '💥';
    gameState.aiShips[shipIndex].hits++;
    
    showMessage(t('hit'), 'hit');
    
    // Check if sunk
    if (gameState.aiShips[shipIndex].hits === gameState.aiShips[shipIndex].size) {
      gameState.aiShips[shipIndex].sunk = true;
      markShipAsSunk('ai', shipIndex);
      showMessage(`${t('youSank')} ${t(gameState.aiShips[shipIndex].name)}!`, 'sink');
      
      // Check win condition
      if (checkWinCondition('player')) {
        endGame('player');
        return;
      }
    }
  } else {
    // Miss
    cell.classList.add('miss');
    cell.textContent = '○';
    showMessage(t('miss'), 'miss');
  }
  
  // Switch turn
  gameState.currentTurn = 'ai';
  document.getElementById('current-turn').textContent = t('ai');
  
  setTimeout(aiTurn, 1500);
}

function aiTurn() {
  if (gameState.currentTurn !== 'ai') return;
  if (gameState.phase !== 'game') return;
  
  const target = getAITarget();
  if (!target) return;
  
  const [row, col] = target;
  gameState.aiTriedCells.add(`${row},${col}`);
  
  const cell = document.querySelector(`#player-grid .cell[data-row="${row}"][data-col="${col}"]`);
  const shipIndex = gameState.playerBoard[row][col];
  
  if (shipIndex !== null) {
    // Hit
    cell.classList.add('hit');
    cell.textContent = '💥';
    gameState.playerShips[shipIndex].hits++;
    
    showMessage(t('hit'), 'hit');
    
    // AI hit mode
    gameState.aiHitMode = true;
    gameState.aiLastHit = [row, col];
    addAdjacentToQueue(row, col);
    
    // Check if sunk
    if (gameState.playerShips[shipIndex].hits === gameState.playerShips[shipIndex].size) {
      gameState.playerShips[shipIndex].sunk = true;
      markShipAsSunk('player', shipIndex);
      showMessage(`${t('aiSank')} ${t(gameState.playerShips[shipIndex].name)}!`, 'sink');
      
      // Reset AI hunt mode
      gameState.aiHitMode = false;
      gameState.aiLastHit = null;
      gameState.aiHitDirection = null;
      gameState.aiTargetQueue = [];
      
      // Check win condition
      if (checkWinCondition('ai')) {
        endGame('ai');
        return;
      }
    }
  } else {
    // Miss
    cell.classList.add('miss');
    cell.textContent = '○';
    showMessage(t('miss'), 'miss');
  }
  
  // Switch turn
  gameState.currentTurn = 'player';
  document.getElementById('current-turn').textContent = t('player');
}

function getAITarget() {
  // Hard mode: use probability-based targeting
  if (gameState.difficulty === 'hard' && !gameState.aiHitMode) {
    return getHardModeTarget();
  }
  
  // Hunt mode: target adjacent cells
  if (gameState.aiTargetQueue.length > 0) {
    return gameState.aiTargetQueue.shift();
  }
  
  // Random targeting
  const available = [];
  for (let row = 0; row < gameState.gridSize; row++) {
    for (let col = 0; col < gameState.gridSize; col++) {
      if (!gameState.aiTriedCells.has(`${row},${col}`)) {
        available.push([row, col]);
      }
    }
  }
  
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function getHardModeTarget() {
  // Calculate probability for each cell
  const probabilities = Array(gameState.gridSize).fill(null).map(() => 
    Array(gameState.gridSize).fill(0)
  );
  
  // Consider remaining ships
  const remainingShips = gameState.playerShips.filter(s => !s.sunk);
  
  remainingShips.forEach(ship => {
    // Try all positions for this ship
    for (let row = 0; row < gameState.gridSize; row++) {
      for (let col = 0; col < gameState.gridSize; col++) {
        // Horizontal
        let cells = getShipCells(row, col, ship.size, 'horizontal');
        if (canFitShip(cells)) {
          cells.forEach(([r, c]) => probabilities[r][c]++);
        }
        
        // Vertical
        cells = getShipCells(row, col, ship.size, 'vertical');
        if (canFitShip(cells)) {
          cells.forEach(([r, c]) => probabilities[r][c]++);
        }
      }
    }
  });
  
  // Find highest probability cell
  let maxProb = 0;
  let bestCells = [];
  
  for (let row = 0; row < gameState.gridSize; row++) {
    for (let col = 0; col < gameState.gridSize; col++) {
      if (!gameState.aiTriedCells.has(`${row},${col}`)) {
        if (probabilities[row][col] > maxProb) {
          maxProb = probabilities[row][col];
          bestCells = [[row, col]];
        } else if (probabilities[row][col] === maxProb) {
          bestCells.push([row, col]);
        }
      }
    }
  }
  
  return bestCells[Math.floor(Math.random() * bestCells.length)];
}

function canFitShip(cells) {
  return cells.every(([r, c]) => {
    if (r < 0 || r >= gameState.gridSize || c < 0 || c >= gameState.gridSize) {
      return false;
    }
    return !gameState.aiTriedCells.has(`${r},${c}`) || 
           (gameState.playerBoard[r][c] !== null && 
            document.querySelector(`#player-grid .cell[data-row="${r}"][data-col="${c}"]`)?.classList.contains('hit'));
  });
}

function addAdjacentToQueue(row, col) {
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];
  
  directions.forEach(([dr, dc]) => {
    const newRow = row + dr;
    const newCol = col + dc;
    
    if (newRow >= 0 && newRow < gameState.gridSize && 
        newCol >= 0 && newCol < gameState.gridSize &&
        !gameState.aiTriedCells.has(`${newRow},${newCol}`)) {
      if (!gameState.aiTargetQueue.some(([r, c]) => r === newRow && c === newCol)) {
        gameState.aiTargetQueue.push([newRow, newCol]);
      }
    }
  });
}

function markShipAsSunk(owner, shipIndex) {
  const ship = owner === 'player' ? gameState.playerShips[shipIndex] : gameState.aiShips[shipIndex];
  const gridId = owner === 'player' ? 'player-grid' : 'ai-grid';
  
  ship.cells.forEach(([row, col]) => {
    const cell = document.querySelector(`#${gridId} .cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
      cell.classList.remove('hit');
      cell.classList.add('sunk');
    }
  });
  
  const statusEl = document.getElementById(`${owner === 'player' ? 'player' : 'ai'}-ship-${shipIndex}`);
  if (statusEl) {
    statusEl.classList.add('sunk');
  }
}

function checkWinCondition(winner) {
  const ships = winner === 'player' ? gameState.aiShips : gameState.playerShips;
  return ships.every(ship => ship.sunk);
}

function showMessage(message, type) {
  const messageEl = document.getElementById('game-message');
  messageEl.textContent = message;
  messageEl.style.color = type === 'hit' ? '#ff4444' : type === 'miss' ? '#666' : '#4CAF50';
  
  setTimeout(() => {
    messageEl.textContent = '';
  }, 2000);
}

function endGame(winner) {
  gameState.phase = 'gameover';
  
  const modal = document.getElementById('game-over-modal');
  const title = document.getElementById('game-over-title');
  const message = document.getElementById('game-over-message');
  const score = document.getElementById('game-over-score');
  
  if (winner === 'player') {
    title.textContent = t('victory');
    message.textContent = t('youWon');
    score.textContent = `${t('clickCount')} ${gameState.playerClickCount}`;
    
    // Save score
    saveScore();
  } else {
    title.textContent = t('defeat');
    message.textContent = t('youLost');
    score.textContent = '';
  }
  
  modal.classList.remove('hidden');
  
  // Reveal AI ships
  revealAIShips();
}

function revealAIShips() {
  gameState.aiShips.forEach(ship => {
    ship.cells.forEach(([row, col]) => {
      const cell = document.querySelector(`#ai-grid .cell[data-row="${row}"][data-col="${col}"]`);
      if (cell && !cell.classList.contains('hit') && !cell.classList.contains('sunk')) {
        cell.classList.add('ship');
      }
    });
  });
}

function saveScore() {
  if (window.parent && window.parent.saveGameScore) {
    window.parent.saveGameScore('Battleship', {
      clicks: gameState.playerClickCount,
      difficulty: gameState.difficulty
    }).then((result) => {
      console.log('Battleship score saved successfully');
      if (result && result.isNewBest && window.parent.showNewBestScore) {
        window.parent.showNewBestScore('Battleship', { 
          clicks: gameState.playerClickCount, 
          difficulty: gameState.difficulty 
        });
      }
    }).catch(err => {
      console.error('Error saving Battleship score:', err);
    });
  }
}

function playAgain() {
  // Reset game state
  gameState = {
    difficulty: null,
    gridSize: 10,
    phase: 'difficulty',
    currentShipIndex: 0,
    orientation: 'horizontal',
    selectedCell: null,
    currentTurn: 'player',
    playerClickCount: 0,
    playerBoard: [],
    aiBoard: [],
    playerShips: [],
    aiShips: [],
    aiTargetQueue: [],
    aiHitMode: false,
    aiLastHit: null,
    aiHitDirection: null,
    aiTriedCells: new Set()
  };
  
  // Hide game over modal and game phase
  document.getElementById('game-over-modal').classList.add('hidden');
  document.getElementById('game-phase').classList.add('hidden');
  document.getElementById('placement-phase').classList.add('hidden');
  
  // Show difficulty selection
  document.getElementById('difficulty-select').classList.remove('hidden');
}
