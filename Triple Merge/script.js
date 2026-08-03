// Game state
let gameMode = null; // '6x6' or '8x8'
let gridSize = 0;
let grid = [];
let score = 0;
let nextTileType = null;
let gameOver = false;
let currentLang = 'en';
let turnCount = 0; // Track turns for auto-fill

// Tile types and their levels (now score is level * baseValue)
const tileBaseValues = {
    wood: 1,
    stone: 2,
    crystal: 3,
    gold: 4,
    leaf: 5
};

const tileEmojis = {
    wood: '🪵',
    stone: '🪨',
    crystal: '💎',
    gold: '🏆',
    leaf: '🍃'
};

const modeTypes = {
    '6x6': ['wood', 'stone', 'crystal'],
    '8x8': ['wood', 'stone', 'crystal', 'gold', 'leaf']
};

// Translation system
const translations = {
    en: {
        title: 'Triple Merge',
        menuText: 'Select Grid Size:',
        btn6x6: '6x6 Grid',
        btn8x8: '8x8 Grid',
        mode: 'Mode',
        score: 'Score',
        nextTile: 'Next Tile:',
        restart: 'Restart',
        changeMode: 'Change Mode',
        gameOverTitle: 'Game Over!',
        finalScore: 'Final Score:',
        playAgain: 'Play Again'
    },
    pt: {
        title: 'Fusão Tripla',
        menuText: 'Selecione o Tamanho da Grade:',
        btn6x6: 'Grade 6x6',
        btn8x8: 'Grade 8x8',
        mode: 'Modo',
        score: 'Pontuação',
        nextTile: 'Próxima Peça:',
        restart: 'Reiniciar',
        changeMode: 'Mudar Modo',
        gameOverTitle: 'Fim de Jogo!',
        finalScore: 'Pontuação Final:',
        playAgain: 'Jogar Novamente'
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

// Get language from parent safely
function getParentLanguage() {
    try {
        return window.parent.currentLanguage || 'en';
    } catch (e) {
        return 'en';
    }
}

function updateLanguage() {
    currentLang = getParentLanguage();
    
    // Update menu
    document.querySelector('.menu-content h1').textContent = t('title');
    document.getElementById('menuText').textContent = t('menuText');
    document.getElementById('btn6x6').textContent = t('btn6x6');
    document.getElementById('btn8x8').textContent = t('btn8x8');
    
    // Update game UI
    if (gameMode) {
        document.querySelector('.header h2').textContent = t('title');
        document.getElementById('modeDisplay').textContent = `${t('mode')}: ${gameMode}`;
        document.getElementById('scoreDisplay').textContent = `${t('score')}: ${score}`;
        document.getElementById('nextTileLabel').textContent = t('nextTile');
        document.getElementById('restartBtn').textContent = t('restart');
        document.getElementById('changeModeBtn').textContent = t('changeMode');
        document.getElementById('gameOverTitle').textContent = t('gameOverTitle');
        
        // Preserve the finalScore value if game is over
        const currentFinalScore = document.getElementById('finalScore').textContent;
        document.getElementById('finalScoreText').innerHTML = `${t('finalScore')} <span id="finalScore">${gameOver && currentFinalScore ? currentFinalScore : score}</span>`;
        
        document.getElementById('playAgainBtn').textContent = t('playAgain');
        document.getElementById('changeModeBtnGameOver').textContent = t('changeMode');
    }
}

// Listen for language changes
window.addEventListener('message', function(event) {
    if (event.data.type === 'languageChange') {
        updateLanguage();
    }
});

// Update language on load
setTimeout(updateLanguage, 100);
updateLanguage();

// DOM elements
const menuOverlay = document.getElementById('menuOverlay');
const gameContainer = document.getElementById('gameContainer');
const gridElement = document.getElementById('grid');
const scoreDisplay = document.getElementById('scoreDisplay');
const modeDisplay = document.getElementById('modeDisplay');
const nextTileElement = document.getElementById('nextTile');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreElement = document.getElementById('finalScore');

// Event listeners
document.getElementById('btn6x6').addEventListener('click', () => startGame('6x6'));
document.getElementById('btn8x8').addEventListener('click', () => startGame('8x8'));
document.getElementById('restartBtn').addEventListener('click', () => startGame(gameMode));
document.getElementById('changeModeBtn').addEventListener('click', showMenu);
document.getElementById('playAgainBtn').addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    startGame(gameMode);
});
document.getElementById('changeModeBtnGameOver').addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    showMenu();
});

function showMenu() {
    menuOverlay.classList.remove('hidden');
    gameContainer.classList.add('hidden');
}

function startGame(mode) {
    gameMode = mode;
    gridSize = mode === '6x6' ? 6 : 8;
    score = 0;
    gameOver = false;
    turnCount = 0;
    
    // Initialize grid with objects containing type and level
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    // Hide menu, show game
    menuOverlay.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameOverOverlay.classList.add('hidden');
    
    // Update UI
    updateLanguage();
    
    // Set grid class
    gridElement.className = `grid size-${gridSize}`;
    
    // Render grid
    renderGrid();
    
    // Generate first tile
    generateNextTile();
}

function renderGrid() {
    gridElement.innerHTML = '';
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            if (grid[row][col]) {
                const tile = grid[row][col];
                cell.classList.add('occupied', 'tile', tile.type);
                cell.textContent = tileEmojis[tile.type];
                
                // Add level indicator
                if (tile.level > 1) {
                    const levelBadge = document.createElement('span');
                    levelBadge.className = 'level-badge';
                    levelBadge.textContent = tile.level;
                    cell.appendChild(levelBadge);
                }
            } else {
                cell.addEventListener('click', () => placeTile(row, col));
            }
            
            gridElement.appendChild(cell);
        }
    }
}

function generateNextTile() {
    const availableTypes = modeTypes[gameMode];
    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    nextTileType = { type: type, level: 1 }; // Always generate level 1 tiles
    
    // Update preview
    nextTileElement.className = `tile-preview tile ${type}`;
    nextTileElement.textContent = tileEmojis[type];
}

function placeTile(row, col) {
    if (gameOver || grid[row][col] !== null) return;
    
    // Place the tile
    grid[row][col] = { ...nextTileType };
    
    // Increment turn counter
    turnCount++;
    
    // Render and add animation
    renderGrid();
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('placing');
    
    // Check for merges with chain reactions
    setTimeout(() => {
        processMerges(row, col);
        
        // Auto-fill mechanic
        const shouldAutoFill = (gameMode === '6x6' && turnCount % 2 === 0) || 
                               (gameMode === '8x8' && turnCount >= 1);
        
        if (shouldAutoFill) {
            autoFillRandomTile();
        }
        
        // Check for game over
        if (isBoardFull()) {
            endGame();
        } else {
            generateNextTile();
        }
    }, 200);
}

function autoFillRandomTile() {
    const emptyCells = [];
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === null) {
                emptyCells.push({ row, col });
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const availableTypes = modeTypes[gameMode];
        const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        
        grid[randomCell.row][randomCell.col] = { type: randomType, level: 1 };
        renderGrid();
        
        // Add a small delay, then check for merges from this auto-filled tile
        setTimeout(() => {
            processMerges(randomCell.row, randomCell.col);
            renderGrid();
        }, 300);
    }
}

function processMerges(startRow, startCol) {
    let merged = true;
    let currentRow = startRow;
    let currentCol = startCol;
    
    while (merged) {
        merged = false;
        
        const tile = grid[currentRow][currentCol];
        if (!tile) break;
        
        // Find connected group of same type AND level
        const group = findConnectedGroup(currentRow, currentCol, tile.type, tile.level);
        
        if (group.length >= 3) {
            // Calculate score (base value * level * number of tiles)
            const points = group.length * tileBaseValues[tile.type] * tile.level;
            score += points;
            updateScore();
            
            // Remove all tiles in group
            for (const pos of group) {
                grid[pos.row][pos.col] = null;
            }
            
            // Place upgraded tile at original position (level + 1)
            grid[currentRow][currentCol] = { type: tile.type, level: tile.level + 1 };
            
            // Render with animation
            renderGrid();
            const cell = document.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
            if (cell) cell.classList.add('merging');
            
            merged = true;
            
            // Small delay for animation
            const delay = 300;
            const start = Date.now();
            while (Date.now() - start < delay) {
                // Busy wait for animation
            }
        }
    }
}

function findConnectedGroup(startRow, startCol, tileType, tileLevel) {
    const visited = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    const group = [];
    const queue = [{row: startRow, col: startCol}];
    
    while (queue.length > 0) {
        const {row, col} = queue.shift();
        
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) continue;
        if (visited[row][col]) continue;
        
        const tile = grid[row][col];
        if (!tile || tile.type !== tileType || tile.level !== tileLevel) continue;
        
        visited[row][col] = true;
        group.push({row, col});
        
        // Check orthogonal neighbors
        queue.push({row: row - 1, col});
        queue.push({row: row + 1, col});
        queue.push({row, col: col - 1});
        queue.push({row, col: col + 1});
    }
    
    return group;
}

function isBoardFull() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col] === null) return false;
        }
    }
    return true;
}

function updateScore() {
    scoreDisplay.textContent = `${t('score')}: ${score}`;
}

function endGame() {
    gameOver = true;
    finalScoreElement.textContent = score;
    gameOverOverlay.classList.remove('hidden');
    
    // Save to leaderboard with difficulty
    const difficultyName = gameMode === '6x6' ? '6x6' : '8x8';
    
    if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Triple Merge", {
            score: score,
            difficulty: difficultyName // '6x6' or '8x8'
        }).then((result) => {
            console.log("Triple Merge score saved successfully");
            if (result && result.isNewBest && window.parent.showNewBestScore) {
                window.parent.showNewBestScore("Triple Merge", { score: score, difficulty: difficultyName });
            }
        }).catch(err => {
            console.error("Error saving Triple Merge score:", err);
        });
    } else {
        console.error("saveGameScore function not found in parent window");
    }
}

// Initialize
updateLanguage();
