// Game state
let difficulty = null;
let rows = 0;
let cols = 0;
let numColors = 0;
let grid = [];
let score = 0;
let moves = 0;
let currentLang = 'en';

// Difficulty settings
const difficultySettings = {
    'easy': { rows: 5, cols: 8, colors: 4 },
    'medium': { rows: 7, cols: 12, colors: 5 },
    'hard': { rows: 10, cols: 16, colors: 6 }
};

// Translation system
const translations = {
    en: {
        title: 'Collapse',
        menuText: 'Select Difficulty:',
        btnEasy: 'Easy (5×8)',
        btnMedium: 'Medium (7×12)',
        btnHard: 'Hard (10×16)',
        difficulty: 'Difficulty',
        score: 'Score',
        moves: 'Moves',
        newGame: 'New Game',
        changeDifficulty: 'Change Difficulty',
        gameOver: 'Game Over!',
        finalScore: 'Final Score:',
        playAgain: 'Play Again'
    },
    pt: {
        title: 'Colapso',
        menuText: 'Selecione a Dificuldade:',
        btnEasy: 'Fácil (5×8)',
        btnMedium: 'Médio (7×12)',
        btnHard: 'Difícil (10×16)',
        difficulty: 'Dificuldade',
        score: 'Pontuação',
        moves: 'Jogadas',
        newGame: 'Novo Jogo',
        changeDifficulty: 'Mudar Dificuldade',
        gameOver: 'Fim de Jogo!',
        finalScore: 'Pontuação Final:',
        playAgain: 'Jogar Novamente'
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

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
    document.getElementById('btnEasy').textContent = t('btnEasy');
    document.getElementById('btnMedium').textContent = t('btnMedium');
    document.getElementById('btnHard').textContent = t('btnHard');
    
    // Update game UI
    if (difficulty) {
        document.querySelector('.header h2').textContent = t('title');
        const difficultyNames = { 'easy': 'Easy', 'medium': 'Medium', 'hard': 'Hard' };
        document.getElementById('difficultyDisplay').textContent = `${t('difficulty')}: ${difficultyNames[difficulty]}`;
        document.getElementById('scoreDisplay').textContent = `${t('score')}: ${score}`;
        document.getElementById('movesDisplay').textContent = `${t('moves')}: ${moves}`;
        document.getElementById('newGameBtn').textContent = t('newGame');
        document.getElementById('changeDifficultyBtn').textContent = t('changeDifficulty');
        document.getElementById('changeDifficultyBtn2').textContent = t('changeDifficulty');
        document.getElementById('gameOverTitle').textContent = t('gameOver');
        document.getElementById('finalScoreText').innerHTML = `${t('finalScore')} <span id="finalScore">${score}</span>`;
        document.getElementById('movesText').innerHTML = `${t('moves')}: <span id="finalMoves">${moves}</span>`;
        document.getElementById('playAgainBtn').textContent = t('playAgain');
    }
}

window.addEventListener('message', function(event) {
    if (event.data.type === 'languageChange') {
        updateLanguage();
    }
});

setTimeout(updateLanguage, 100);
updateLanguage();

// DOM elements
const menuOverlay = document.getElementById('menuOverlay');
const gameContainer = document.getElementById('gameContainer');
const gridElement = document.getElementById('grid');
const gameOverOverlay = document.getElementById('gameOverOverlay');

// Event listeners
document.getElementById('btnEasy').addEventListener('click', () => startGame('easy'));
document.getElementById('btnMedium').addEventListener('click', () => startGame('medium'));
document.getElementById('btnHard').addEventListener('click', () => startGame('hard'));
document.getElementById('newGameBtn').addEventListener('click', () => startGame(difficulty));
document.getElementById('changeDifficultyBtn').addEventListener('click', showMenu);
document.getElementById('playAgainBtn').addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    startGame(difficulty);
});
document.getElementById('changeDifficultyBtn2').addEventListener('click', () => {
    gameOverOverlay.classList.add('hidden');
    showMenu();
});

function showMenu() {
    menuOverlay.classList.remove('hidden');
    gameContainer.classList.add('hidden');
}

function startGame(mode) {
    difficulty = mode;
    const settings = difficultySettings[mode];
    rows = settings.rows;
    cols = settings.cols;
    numColors = settings.colors;
    score = 0;
    moves = 0;
    
    // Initialize grid with random colors
    grid = Array(rows).fill(null).map(() => 
        Array(cols).fill(null).map(() => Math.floor(Math.random() * numColors))
    );
    
    menuOverlay.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    gameOverOverlay.classList.add('hidden');
    
    updateLanguage();
    renderGrid();
}

function renderGrid() {
    gridElement.innerHTML = '';
    
    // Create grid container
    const gridInner = document.createElement('div');
    gridInner.className = 'grid-inner';
    gridInner.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    gridInner.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const color = grid[row][col];
            if (color !== null) {
                cell.classList.add(`color-${color}`);
                
                // Add hover effect to show group
                cell.addEventListener('mouseenter', () => highlightGroup(row, col));
                cell.addEventListener('mouseleave', clearHighlights);
                cell.addEventListener('click', () => removeGroup(row, col));
            }
            
            gridInner.appendChild(cell);
        }
    }
    
    gridElement.appendChild(gridInner);
    updateScore();
}

function highlightGroup(row, col) {
    clearHighlights();
    const color = grid[row][col];
    if (color === null) return;
    
    const group = findGroup(row, col, color);
    if (group.length >= 2) {
        group.forEach(({ row, col }) => {
            const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) cell.classList.add('highlighted');
        });
    }
}

function clearHighlights() {
    document.querySelectorAll('.highlighted').forEach(cell => {
        cell.classList.remove('highlighted');
    });
}

function findGroup(startRow, startCol, color) {
    const visited = Array(rows).fill(null).map(() => Array(cols).fill(false));
    const group = [];
    const queue = [{ row: startRow, col: startCol }];
    
    while (queue.length > 0) {
        const { row, col } = queue.shift();
        
        if (row < 0 || row >= rows || col < 0 || col >= cols) continue;
        if (visited[row][col]) continue;
        if (grid[row][col] !== color) continue;
        
        visited[row][col] = true;
        group.push({ row, col });
        
        // Check orthogonal neighbors (no diagonals)
        queue.push({ row: row - 1, col });
        queue.push({ row: row + 1, col });
        queue.push({ row, col: col - 1 });
        queue.push({ row, col: col + 1 });
    }
    
    return group;
}

function removeGroup(row, col) {
    const color = grid[row][col];
    if (color === null) return;
    
    const group = findGroup(row, col, color);
    if (group.length < 2) return;
    
    // Calculate score: n*(n-1)/2 for n blocks
    const groupScore = (group.length * (group.length - 1)) / 2;
    score += groupScore;
    moves++;
    
    // Animate removal
    group.forEach(({ row, col }) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) cell.classList.add('removing');
    });
    
    // Remove blocks after animation
    setTimeout(() => {
        group.forEach(({ row, col }) => {
            grid[row][col] = null;
        });
        
        collapseGrid();
        
        // Check if board is cleared
        if (isBoardEmpty()) {
            score += 50;
            endGame(true);
        } else if (!hasValidMoves()) {
            endGame(false);
        } else {
            renderGrid();
        }
    }, 300);
}

function collapseGrid() {
    // First, collapse each column downward
    for (let col = 0; col < cols; col++) {
        let writePos = rows - 1;
        for (let row = rows - 1; row >= 0; row--) {
            if (grid[row][col] !== null) {
                if (row !== writePos) {
                    grid[writePos][col] = grid[row][col];
                    grid[row][col] = null;
                }
                writePos--;
            }
        }
    }
    
    // Then, shift columns left if any column is empty
    let writeCol = 0;
    for (let col = 0; col < cols; col++) {
        // Check if column has any blocks
        let hasBlocks = false;
        for (let row = 0; row < rows; row++) {
            if (grid[row][col] !== null) {
                hasBlocks = true;
                break;
            }
        }
        
        if (hasBlocks) {
            if (col !== writeCol) {
                // Move entire column
                for (let row = 0; row < rows; row++) {
                    grid[row][writeCol] = grid[row][col];
                    grid[row][col] = null;
                }
            }
            writeCol++;
        }
    }
}

function isBoardEmpty() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (grid[row][col] !== null) return false;
        }
    }
    return true;
}

function hasValidMoves() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const color = grid[row][col];
            if (color === null) continue;
            
            const group = findGroup(row, col, color);
            if (group.length >= 2) return true;
        }
    }
    return false;
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = `${t('score')}: ${score}`;
    document.getElementById('movesDisplay').textContent = `${t('moves')}: ${moves}`;
}

function endGame(clearedBoard) {
    document.getElementById('finalScore').textContent = score;
    document.getElementById('finalMoves').textContent = moves;
    gameOverOverlay.classList.remove('hidden');
    
    // Save to leaderboard with difficulty
    if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Collapse", {
            score: score,
            difficulty: difficulty, // 'easy', 'medium', or 'hard'
            moves: moves
        }).then((result) => {
            console.log("Collapse score saved successfully");
            if (result && result.isNewBest && window.parent.showNewBestScore) {
                window.parent.showNewBestScore("Collapse", { score: score, difficulty: difficulty, moves: moves });
            }
        }).catch(err => {
            console.error("Error saving Collapse score:", err);
        });
    }
}

// Initialize
updateLanguage();
