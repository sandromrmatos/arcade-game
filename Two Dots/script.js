// ===== TRANSLATIONS =====
const translations = {
    en: {
        gameTitle: "Two Dots",
        gameDescription: "Connect adjacent dots of the same color!",
        easy: "Easy",
        easyDesc: "4×4 Grid • 3 Colors",
        medium: "Medium",
        mediumDesc: "5×5 Grid • 4 Colors",
        hard: "Hard",
        hardDesc: "6×6 Grid • 5 Colors",
        backButton: "← Back",
        score: "Score",
        time: "Time",
        instructions: "Drag through adjacent dots of the same color to connect them!",
        scoring: "Scoring:",
        gameOver: "Game Over!",
        finalScore: "Final Score:",
        savingScore: "Saving score...",
        newRecord: "🎉 NEW BEST SCORE! 🎉",
        playAgain: "Play Again",
        backToMenu: "Back to Menu"
    },
    pt: {
        gameTitle: "Two Dots",
        gameDescription: "Conecte pontos adjacentes da mesma cor!",
        easy: "Fácil",
        easyDesc: "Grade 4×4 • 3 Cores",
        medium: "Médio",
        mediumDesc: "Grade 5×5 • 4 Cores",
        hard: "Difícil",
        hardDesc: "Grade 6×6 • 5 Cores",
        backButton: "← Voltar",
        score: "Pontuação",
        time: "Tempo",
        instructions: "Arraste através de pontos adjacentes da mesma cor para conectá-los!",
        scoring: "Pontuação:",
        gameOver: "Fim de Jogo!",
        finalScore: "Pontuação Final:",
        savingScore: "Salvando pontuação...",
        newRecord: "🎉 NOVA MELHOR PONTUAÇÃO! 🎉",
        playAgain: "Jogar Novamente",
        backToMenu: "Voltar ao Menu"
    }
};

// Get language from parent window
function getParentLanguage() {
    if (window.parent && window.parent.currentLanguage) {
        return window.parent.currentLanguage;
    }
    if (window.parent && window.parent.localStorage) {
        const lang = window.parent.localStorage.getItem('arcadeLanguage');
        if (lang === 'en' || lang === 'pt') return lang;
    }
    return 'en';
}

// Translation function
function t(key) {
    const lang = getParentLanguage();
    return translations[lang][key] || key;
}

// Update all translations
function updateLanguage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = t(key);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = translation;
        } else {
            element.textContent = translation;
        }
    });
}

// Listen for language changes from parent
window.addEventListener('message', (event) => {
    if (event.data.type === 'languageChange') {
        updateLanguage();
    }
});

// ===== GAME STATE =====
const gameState = {
    difficulty: null,
    gridSize: 0,
    numColors: 0,
    grid: [],
    score: 0,
    timeLeft: 120, // 2 minutes in seconds
    timerInterval: null,
    selectedDots: [],
    canvas: null,
    ctx: null,
    isDrawing: false,
    gameActive: false
};

// Difficulty configurations
const DIFFICULTY_CONFIG = {
    easy: { size: 4, colors: 3 },
    medium: { size: 5, colors: 4 },
    hard: { size: 6, colors: 5 }
};

// Scoring system
const SCORING = {
    2: 1,
    3: 2,
    4: 4,
    5: 7,
    6: 10,
    7: 13,
    8: 16
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    updateLanguage();
});

// ===== MENU FUNCTIONS =====
function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    const config = DIFFICULTY_CONFIG[difficulty];
    gameState.gridSize = config.size;
    gameState.numColors = config.colors;
    
    showScreen('game-screen');
    initGame();
}

function backToMenu() {
    stopTimer();
    gameState.gameActive = false;
    showScreen('menu-screen');
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// ===== GAME INITIALIZATION =====
function initGame() {
    gameState.score = 0;
    gameState.timeLeft = 120;
    gameState.selectedDots = [];
    gameState.gameActive = true;
    
    updateScore();
    updateTimer();
    createGrid();
    startTimer();
}

function createGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    
    // Set grid template
    container.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
    
    // Create canvas for drawing connections
    const canvas = document.createElement('canvas');
    canvas.id = 'connection-canvas';
    const gridRect = container.getBoundingClientRect();
    canvas.width = gridRect.width || 500;
    canvas.height = gridRect.height || 500;
    container.appendChild(canvas);
    
    gameState.canvas = canvas;
    gameState.ctx = canvas.getContext('2d');
    
    // Initialize grid data
    gameState.grid = [];
    for (let row = 0; row < gameState.gridSize; row++) {
        gameState.grid[row] = [];
        for (let col = 0; col < gameState.gridSize; col++) {
            const color = Math.floor(Math.random() * gameState.numColors);
            gameState.grid[row][col] = { color, element: null };
            
            const dot = createDot(row, col, color);
            gameState.grid[row][col].element = dot;
            container.appendChild(dot);
        }
    }
    
    // Adjust canvas size after dots are rendered
    setTimeout(() => {
        const gridRect = container.getBoundingClientRect();
        canvas.width = gridRect.width;
        canvas.height = gridRect.height;
    }, 100);
}

function createDot(row, col, color) {
    const dot = document.createElement('div');
    dot.className = `dot color-${color}`;
    dot.dataset.row = row;
    dot.dataset.col = col;
    
    // Mouse events
    dot.addEventListener('mousedown', (e) => startSelection(row, col, e));
    dot.addEventListener('mouseenter', (e) => continueSelection(row, col, e));
    dot.addEventListener('mouseup', endSelection);
    
    // Touch events
    dot.addEventListener('touchstart', (e) => {
        e.preventDefault();
        startSelection(row, col, e);
    });
    dot.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('dot')) {
            const row = parseInt(element.dataset.row);
            const col = parseInt(element.dataset.col);
            continueSelection(row, col, e);
        }
    });
    dot.addEventListener('touchend', (e) => {
        e.preventDefault();
        endSelection();
    });
    
    return dot;
}

// ===== SELECTION LOGIC =====
function startSelection(row, col, event) {
    if (!gameState.gameActive) return;
    
    event.preventDefault();
    gameState.isDrawing = true;
    gameState.selectedDots = [];
    
    const cell = gameState.grid[row][col];
    if (cell.color !== null) {
        addToSelection(row, col);
    }
}

function continueSelection(row, col, event) {
    if (!gameState.isDrawing || !gameState.gameActive) return;
    
    event.preventDefault();
    
    // Check if already in selection
    const alreadySelected = gameState.selectedDots.some(
        dot => dot.row === row && dot.col === col
    );
    
    if (alreadySelected) {
        // Allow backtracking: if clicking the second-to-last dot, remove the last one
        if (gameState.selectedDots.length >= 2) {
            const secondLast = gameState.selectedDots[gameState.selectedDots.length - 2];
            if (secondLast.row === row && secondLast.col === col) {
                const removed = gameState.selectedDots.pop();
                removed.element.classList.remove('selected');
                drawConnections();
            }
        }
        return;
    }
    
    // Must be adjacent to last selected dot
    if (gameState.selectedDots.length > 0) {
        const last = gameState.selectedDots[gameState.selectedDots.length - 1];
        if (!isAdjacent(last.row, last.col, row, col)) {
            return;
        }
    }
    
    // Must be same color as first dot
    const firstColor = gameState.grid[gameState.selectedDots[0].row][gameState.selectedDots[0].col].color;
    const currentColor = gameState.grid[row][col].color;
    
    if (currentColor === firstColor && currentColor !== null) {
        addToSelection(row, col);
    }
}

function addToSelection(row, col) {
    const cell = gameState.grid[row][col];
    cell.element.classList.add('selected');
    gameState.selectedDots.push({ row, col, element: cell.element });
    drawConnections();
}

function endSelection() {
    if (!gameState.isDrawing || !gameState.gameActive) return;
    
    gameState.isDrawing = false;
    
    // Need at least 2 dots to score
    if (gameState.selectedDots.length >= 2) {
        removeSelectedDots();
    } else {
        // Clear selection
        clearSelection();
    }
    
    clearCanvas();
}

function isAdjacent(row1, col1, row2, col2) {
    const rowDiff = Math.abs(row1 - row2);
    const colDiff = Math.abs(col1 - col2);
    
    // Adjacent means one step horizontally or vertically (not diagonal)
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

// ===== DRAWING CONNECTIONS =====
function drawConnections() {
    clearCanvas();
    
    if (gameState.selectedDots.length < 2) return;
    
    const ctx = gameState.ctx;
    const container = document.getElementById('grid-container');
    const containerRect = container.getBoundingClientRect();
    
    // Get color from first dot
    const firstDot = gameState.selectedDots[0].element;
    const computedStyle = window.getComputedStyle(firstDot);
    const backgroundColor = computedStyle.backgroundColor;
    
    ctx.strokeStyle = backgroundColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    
    ctx.beginPath();
    
    for (let i = 0; i < gameState.selectedDots.length; i++) {
        const dot = gameState.selectedDots[i].element;
        const dotRect = dot.getBoundingClientRect();
        
        const x = dotRect.left - containerRect.left + dotRect.width / 2;
        const y = dotRect.top - containerRect.top + dotRect.height / 2;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
}

function clearCanvas() {
    if (gameState.ctx && gameState.canvas) {
        gameState.ctx.clearRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    }
}

// ===== DOT REMOVAL AND GRAVITY =====
function removeSelectedDots() {
    const count = gameState.selectedDots.length;
    
    // Calculate points based on sequence length
    let points;
    if (count <= 8) {
        points = SCORING[count] || 0;
    } else {
        // For 9+: pattern continues +3 per additional dot
        // 9 = 19, 10 = 22, 11 = 25, etc.
        points = SCORING[8] + (count - 8) * 3;
    }
    
    gameState.score += points;
    updateScore();
    
    // Mark dots for removal and add animation
    gameState.selectedDots.forEach(({ row, col, element }) => {
        element.classList.add('disappearing');
        gameState.grid[row][col].color = null;
    });
    
    // After animation, apply gravity and create new dots
    setTimeout(() => {
        applyGravity();
        clearSelection();
    }, 300);
}

function clearSelection() {
    gameState.selectedDots.forEach(({ element }) => {
        element.classList.remove('selected');
    });
    gameState.selectedDots = [];
}

function applyGravity() {
    // For each column, move dots down
    for (let col = 0; col < gameState.gridSize; col++) {
        // Collect non-null dots from bottom to top
        const nonNullDots = [];
        for (let row = gameState.gridSize - 1; row >= 0; row--) {
            if (gameState.grid[row][col].color !== null) {
                nonNullDots.push(gameState.grid[row][col].color);
            }
        }
        
        // Fill column from bottom with existing dots
        let dotIndex = 0;
        for (let row = gameState.gridSize - 1; row >= 0; row--) {
            if (dotIndex < nonNullDots.length) {
                gameState.grid[row][col].color = nonNullDots[dotIndex];
                dotIndex++;
            } else {
                // Fill top with new random dots
                gameState.grid[row][col].color = Math.floor(Math.random() * gameState.numColors);
            }
        }
    }
    
    // Update DOM
    refreshGrid();
}

function refreshGrid() {
    for (let row = 0; row < gameState.gridSize; row++) {
        for (let col = 0; col < gameState.gridSize; col++) {
            const cell = gameState.grid[row][col];
            const color = cell.color;
            
            cell.element.className = `dot color-${color}`;
        }
    }
}

// ===== TIMER =====
function startTimer() {
    stopTimer(); // Clear any existing timer
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        updateTimer();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimer() {
    const minutes = Math.floor(gameState.timeLeft / 60);
    const seconds = gameState.timeLeft % 60;
    document.getElementById('timer').textContent = 
        `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ===== SCORE =====
function updateScore() {
    document.getElementById('score').textContent = gameState.score;
}

// ===== GAME OVER =====
function endGame() {
    stopTimer();
    gameState.gameActive = false;
    
    document.getElementById('final-score').textContent = gameState.score;
    showScreen('gameover-screen');
    
    // Show saving message
    document.getElementById('saving-message').style.display = 'block';
    document.getElementById('record-message').classList.add('hidden');
    
    // Save score to parent window
    saveScore();
}

function saveScore() {
    if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Two Dots", {
            score: gameState.score,
            difficulty: gameState.difficulty
        }).then((result) => {
            // Hide saving message
            document.getElementById('saving-message').style.display = 'none';
            
            if (result && result.isNewBest) {
                // Show new record message
                document.getElementById('record-message').classList.remove('hidden');
            }
        }).catch((error) => {
            console.error("Error saving score:", error);
            document.getElementById('saving-message').textContent = "Error saving score";
        });
    } else {
        console.error("saveGameScore function not found in parent window");
        document.getElementById('saving-message').textContent = "Score not saved (offline mode)";
    }
}

function restartGame() {
    showScreen('game-screen');
    initGame();
}

// ===== WINDOW RESIZE HANDLER =====
window.addEventListener('resize', () => {
    if (gameState.canvas) {
        const container = document.getElementById('grid-container');
        const gridRect = container.getBoundingClientRect();
        gameState.canvas.width = gridRect.width;
        gameState.canvas.height = gridRect.height;
        
        if (gameState.selectedDots.length > 0) {
            drawConnections();
        }
    }
});

// Add global mouseup/touchend to handle cases where user releases outside grid
document.addEventListener('mouseup', endSelection);
document.addEventListener('touchend', endSelection);
