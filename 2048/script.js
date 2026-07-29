// Game state
let gridSize = 4;
let board = [];
let score = 0;
let bestScore = 0;
let gameOver = false;
let won = false;
let currentLanguage = 'en';

// Translations
const translations = {
    en: {
        title: "2048",
        menuTitle: "2048",
        menuSubtitle: "Select Grid Size:",
        grid4x4: "4×4 Grid",
        grid5x5: "5×5 Grid",
        scoreLabel: "SCORE",
        bestLabel: "BEST",
        gridInfo4: "4×4 Grid",
        gridInfo5: "5×5 Grid",
        instructions: "Use arrow keys to move tiles. Combine tiles with the same number to reach 2048!",
        newGame: "New Game",
        gameOver: "Game Over!",
        youWin: "You Win!",
        finalScore: "Final Score:",
        tryAgain: "Try Again",
        keepPlaying: "Keep Playing"
    },
    pt: {
        title: "2048",
        menuTitle: "2048",
        menuSubtitle: "Selecione o Tamanho da Grelha:",
        grid4x4: "Grelha 4×4",
        grid5x5: "Grelha 5×5",
        scoreLabel: "PONTUAÇÃO",
        bestLabel: "MELHOR",
        gridInfo4: "Grelha 4×4",
        gridInfo5: "Grelha 5×5",
        instructions: "Use as setas para mover os blocos. Combine blocos com o mesmo número para alcançar 2048!",
        newGame: "Novo Jogo",
        gameOver: "Fim de Jogo!",
        youWin: "Você Ganhou!",
        finalScore: "Pontuação Final:",
        tryAgain: "Tentar Novamente",
        keepPlaying: "Continuar Jogando"
    }
};

function t(key) {
    return translations[currentLanguage][key] || key;
}

function updateLanguage() {
    document.getElementById('title').textContent = t('title');
    document.getElementById('menuTitle').textContent = t('menuTitle');
    document.getElementById('menuSubtitle').textContent = t('menuSubtitle');
    document.getElementById('btn4x4').textContent = t('grid4x4');
    document.getElementById('btn5x5').textContent = t('grid5x5');
    document.getElementById('scoreLabel').textContent = t('scoreLabel');
    document.getElementById('bestLabel').textContent = t('bestLabel');
    document.getElementById('instructions').textContent = t('instructions');
    document.getElementById('newGameBtn').textContent = t('newGame');
    updateGridInfo();
}

function updateGridInfo() {
    const info = gridSize === 4 ? t('gridInfo4') : t('gridInfo5');
    document.getElementById('gridSizeInfo').textContent = info;
}

function getParentLanguage() {
    try {
        if (window.parent && window.parent !== window) {
            const parentLang = window.parent.localStorage.getItem('arcadeLanguage');
            if (parentLang) return parentLang;
        }
    } catch (e) {
        console.log('Cannot access parent language');
    }
    return 'en';
}

// Initialize language
currentLanguage = getParentLanguage();

// Listen for language changes from parent
window.addEventListener('message', (event) => {
    if (event.data.type === 'languageChange') {
        currentLanguage = event.data.language;
        updateLanguage();
    }
});

// Initialize board
function initBoard() {
    board = [];
    for (let i = 0; i < gridSize; i++) {
        board[i] = [];
        for (let j = 0; j < gridSize; j++) {
            board[i][j] = 0;
        }
    }
    score = 0;
    gameOver = false;
    won = false;
    addRandomTile();
    addRandomTile();
    updateScore();
    drawBoard();
}

// Add random tile (2 or 4)
function addRandomTile() {
    const emptyCells = [];
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) {
                emptyCells.push({row: i, col: j});
            }
        }
    }
    
    if (emptyCells.length > 0) {
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        board[cell.row][cell.col] = Math.random() < 0.9 ? 2 : 4;
    }
}

// Draw board
function drawBoard() {
    const boardElement = document.getElementById('board');
    boardElement.className = `grid-${gridSize}`;
    boardElement.innerHTML = '';
    
    // Create background cells
    for (let i = 0; i < gridSize * gridSize; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        boardElement.appendChild(cell);
    }
    
    // Create tiles
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] !== 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${board[i][j]}`;
                tile.textContent = board[i][j];
                
                // Position tile
                const cellSize = gridSize === 4 ? 90 : 70;
                const gap = 10;
                tile.style.left = `${10 + j * (cellSize + gap)}px`;
                tile.style.top = `${10 + i * (cellSize + gap)}px`;
                
                boardElement.appendChild(tile);
            }
        }
    }
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
    
    // Load best score for current grid size
    const key = `2048-best-${gridSize}x${gridSize}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        bestScore = parseInt(saved);
    }
    
    // Update if current score is better
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem(key, bestScore);
    }
    
    document.getElementById('bestScore').textContent = bestScore;
}

// Move tiles
function move(direction) {
    if (gameOver) return;
    
    let moved = false;
    const oldBoard = JSON.parse(JSON.stringify(board));
    
    // Rotate board based on direction
    if (direction === 'up') {
        board = rotateBoard(board, 3);
    } else if (direction === 'down') {
        board = rotateBoard(board, 1);
    } else if (direction === 'right') {
        board = rotateBoard(board, 2);
    }
    
    // Move left (after rotation)
    for (let i = 0; i < gridSize; i++) {
        let row = board[i].filter(cell => cell !== 0);
        
        // Merge tiles
        for (let j = 0; j < row.length - 1; j++) {
            if (row[j] === row[j + 1]) {
                row[j] *= 2;
                score += row[j];
                row.splice(j + 1, 1);
                
                // Check for 2048
                if (row[j] === 2048 && !won) {
                    won = true;
                    setTimeout(() => showWinMessage(), 300);
                }
            }
        }
        
        // Pad with zeros
        while (row.length < gridSize) {
            row.push(0);
        }
        
        board[i] = row;
    }
    
    // Rotate back
    if (direction === 'up') {
        board = rotateBoard(board, 1);
    } else if (direction === 'down') {
        board = rotateBoard(board, 3);
    } else if (direction === 'right') {
        board = rotateBoard(board, 2);
    }
    
    // Check if board changed
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] !== oldBoard[i][j]) {
                moved = true;
                break;
            }
        }
        if (moved) break;
    }
    
    if (moved) {
        addRandomTile();
        updateScore();
        drawBoard();
        
        if (!canMove()) {
            gameOver = true;
            setTimeout(() => showGameOver(), 300);
        }
    }
}

// Rotate board 90 degrees clockwise
function rotateBoard(matrix, times) {
    let result = matrix;
    for (let t = 0; t < times; t++) {
        const n = result.length;
        const rotated = [];
        for (let i = 0; i < n; i++) {
            rotated[i] = [];
            for (let j = 0; j < n; j++) {
                rotated[i][j] = result[n - 1 - j][i];
            }
        }
        result = rotated;
    }
    return result;
}

// Check if any moves are possible
function canMove() {
    // Check for empty cells
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (board[i][j] === 0) return true;
        }
    }
    
    // Check for possible merges
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const current = board[i][j];
            // Check right
            if (j < gridSize - 1 && board[i][j + 1] === current) return true;
            // Check down
            if (i < gridSize - 1 && board[i + 1][j] === current) return true;
        }
    }
    
    return false;
}

// Show win message
function showWinMessage() {
    const overlay = document.getElementById('gameOverlay');
    const message = document.getElementById('gameOverMessage');
    const finalScore = document.getElementById('finalScore');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    
    message.textContent = t('youWin');
    finalScore.textContent = `${t('finalScore')} ${score}`;
    tryAgainBtn.textContent = t('keepPlaying');
    overlay.classList.remove('hidden');
    
    // Save score to leaderboard
    saveToLeaderboard();
}

// Show game over
function showGameOver() {
    const overlay = document.getElementById('gameOverlay');
    const message = document.getElementById('gameOverMessage');
    const finalScore = document.getElementById('finalScore');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    
    message.textContent = t('gameOver');
    finalScore.textContent = `${t('finalScore')} ${score}`;
    tryAgainBtn.textContent = t('tryAgain');
    overlay.classList.remove('hidden');
    
    // Save score to leaderboard
    saveToLeaderboard();
}

// Save to leaderboard
function saveToLeaderboard() {
    if (window.parent && window.parent.saveGameScore) {
        const difficulty = gridSize === 4 ? '4x4' : '5x5';
        window.parent.saveGameScore("2048", {
            score: score,
            difficulty: difficulty
        }).then((result) => {
            console.log("2048 score saved successfully");
            if (result && result.isNewBest && window.parent.showNewBestScore) {
                window.parent.showNewBestScore("2048", { score: score, difficulty: difficulty });
            }
        }).catch(err => {
            console.error("Error saving 2048 score:", err);
        });
    }
}

// Restart game
function restartGame() {
    document.getElementById('gameOverlay').classList.add('hidden');
    initBoard();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        move('up');
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        move('down');
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        move('left');
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        move('right');
    }
});

// Mobile control buttons
function setupMobileControl(buttonId, direction) {
    const btn = document.getElementById(buttonId);
    
    // Handle both click and touch events
    const handleAction = (e) => {
        e.preventDefault();
        e.stopPropagation();
        move(direction);
    };
    
    btn.addEventListener('touchstart', handleAction, { passive: false });
    btn.addEventListener('click', handleAction);
}

setupMobileControl('btnUp', 'up');
setupMobileControl('btnDown', 'down');
setupMobileControl('btnLeft', 'left');
setupMobileControl('btnRight', 'right');

// Prevent scroll on touch controls
document.getElementById('mobileControls').addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// Touch controls for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 30) {
            move('left');
        } else if (diffX < -30) {
            move('right');
        }
    } else {
        // Vertical swipe
        if (diffY > 30) {
            move('up');
        } else if (diffY < -30) {
            move('down');
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

// Menu functions
function showMenu() {
    document.getElementById('menuOverlay').classList.remove('hidden');
}

function hideMenu() {
    document.getElementById('menuOverlay').classList.add('hidden');
}

function startGame(size) {
    gridSize = size;
    hideMenu();
    initBoard();
    updateGridInfo();
}

// Event listeners
document.getElementById('btn4x4').addEventListener('click', () => {
    startGame(4);
});

document.getElementById('btn5x5').addEventListener('click', () => {
    startGame(5);
});

document.getElementById('newGameBtn').addEventListener('click', () => {
    if (confirm(currentLanguage === 'en' ? 'Start a new game?' : 'Iniciar um novo jogo?')) {
        restartGame();
    }
});

document.getElementById('tryAgainBtn').addEventListener('click', restartGame);

// Initialize
updateLanguage();
showMenu();
