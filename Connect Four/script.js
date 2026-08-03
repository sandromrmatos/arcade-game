// Constants
const ROWS = 6;
const COLS = 7;
const PLAYER = 'red';
const AI = 'yellow';

// Game state
let board = [];
let currentPlayer = PLAYER;
let gameOver = false;
let difficulty = 'hard';
let wins = 0;
let losses = 0;
let draws = 0;
let playerTurns = 0;  // Track number of pieces the player has played
let currentLanguage = 'en';

// Translations
const translations = {
    en: {
        title: "Connect Four",
        menuTitle: "Connect Four",
        menuSubtitle: "Select Difficulty:",
        easy: "Easy",
        hard: "Hard",
        yourTurn: "Your Turn (Red)",
        aiTurn: "AI's Turn (Yellow)",
        youWin: "You Win! 🎉",
        youLose: "AI Wins! 😞",
        draw: "It's a Draw! 🤝",
        wins: "Wins",
        losses: "Losses",
        draws: "Draws",
        newGame: "New Game",
        turns: "Turns"
    },
    pt: {
        title: "Quatro em Linha",
        menuTitle: "Quatro em Linha",
        menuSubtitle: "Selecione a Dificuldade:",
        easy: "Fácil",
        hard: "Difícil",
        yourTurn: "Sua Vez (Vermelho)",
        aiTurn: "Vez da IA (Amarelo)",
        youWin: "Você Ganhou! 🎉",
        youLose: "IA Ganhou! 😞",
        draw: "Empate! 🤝",
        wins: "Vitórias",
        losses: "Derrotas",
        draws: "Empates",
        newGame: "Novo Jogo",
        turns: "Jogadas"
    }
};

function t(key) {
    return translations[currentLanguage][key] || key;
}

function updateLanguage() {
    document.getElementById('title').textContent = t('title');
    document.getElementById('menuTitle').textContent = t('menuTitle');
    document.getElementById('menuSubtitle').textContent = t('menuSubtitle');
    document.getElementById('btnEasy').textContent = t('easy');
    document.getElementById('btnHard').textContent = t('hard');
    document.getElementById('restartBtn').textContent = t('newGame');
    updateScore();
    updateCurrentPlayer();
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
    for (let row = 0; row < ROWS; row++) {
        board[row] = [];
        for (let col = 0; col < COLS; col++) {
            board[row][col] = null;
        }
    }
}

// Draw board
function drawBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    
    for (let col = 0; col < COLS; col++) {
        const column = document.createElement('div');
        column.className = 'column';
        column.dataset.col = col;
        
        for (let row = 0; row < ROWS; row++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const value = board[row][col];
            if (value === PLAYER) {
                cell.classList.add('red');
            } else if (value === AI) {
                cell.classList.add('yellow');
            }
            
            column.appendChild(cell);
        }
        
        // Add click handler to column
        column.addEventListener('click', () => {
            if (!gameOver && currentPlayer === PLAYER) {
                makeMove(col, PLAYER);
            }
        });
        
        boardElement.appendChild(column);
    }
}

// Make a move
function makeMove(col, player) {
    // Prevent multiple moves during animation
    if (gameOver) return false;
    
    // Find the lowest empty row in the column
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === null) {
            board[row][col] = player;
            
            // Disable board immediately to prevent rapid clicking
            disableBoard();
            
            // Increment player turn counter
            if (player === PLAYER) {
                playerTurns++;
                updateScore();
            }
            
            // Add delay before drawing to make piece placement visible
            setTimeout(() => {
                drawBoard();
                
                // Check for win or draw
                if (checkWin(row, col, player)) {
                    endGame(player);
                } else if (checkDraw()) {
                    endGame('draw');
                } else {
                    // Switch player
                    currentPlayer = currentPlayer === PLAYER ? AI : PLAYER;
                    updateCurrentPlayer();
                    
                    // If AI's turn, make AI move after a 2 second delay
                    if (currentPlayer === AI && !gameOver) {
                        setTimeout(() => {
                            makeAIMove();
                        }, 2000);  // 2 second delay for AI
                    } else {
                        // Re-enable board for player's next turn
                        enableBoard();
                    }
                }
            }, 300);  // 300ms delay for piece placement animation
            
            return true;
        }
    }
    return false; // Column is full
}

// Disable board during AI turn
function disableBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.add('disabled'));
}

// Enable board for player turn
function enableBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('disabled'));
}

// AI Move
function makeAIMove() {
    let col;
    
    if (difficulty === 'easy') {
        // Easy: Random valid move
        const validCols = [];
        for (let c = 0; c < COLS; c++) {
            if (board[0][c] === null) {
                validCols.push(c);
            }
        }
        col = validCols[Math.floor(Math.random() * validCols.length)];
    } else {
        // Hard: Use minimax algorithm
        col = getBestMove();
    }
    
    makeMove(col, AI);
    enableBoard();
}

// Minimax algorithm for hard difficulty
function getBestMove() {
    // First, check if AI can win
    for (let col = 0; col < COLS; col++) {
        if (canMakeMove(col)) {
            const row = getLowestRow(col);
            board[row][col] = AI;
            if (checkWin(row, col, AI)) {
                board[row][col] = null;
                return col;
            }
            board[row][col] = null;
        }
    }
    
    // Second, block player from winning
    for (let col = 0; col < COLS; col++) {
        if (canMakeMove(col)) {
            const row = getLowestRow(col);
            board[row][col] = PLAYER;
            if (checkWin(row, col, PLAYER)) {
                board[row][col] = null;
                return col;
            }
            board[row][col] = null;
        }
    }
    
    // Third, detect and block open-ended threats (2 in a row with spaces on both sides)
    const threatMove = detectAndBlockOpenEndedThreats();
    if (threatMove !== -1) {
        return threatMove;
    }
    
    // Fourth, look for opportunities to create AI threats (offensive play)
    const offensiveMove = findOffensiveMove();
    if (offensiveMove !== -1) {
        return offensiveMove;
    }
    
    // Fifth, detect and block any threat with 2 in a row
    const twoInRowThreat = detectTwoInRowThreats();
    if (twoInRowThreat !== -1) {
        return twoInRowThreat;
    }
    
    // Sixth, prefer center columns
    const centerCols = [3, 2, 4, 1, 5, 0, 6];
    for (let col of centerCols) {
        if (canMakeMove(col)) {
            return col;
        }
    }
    
    // Fallback to first available column
    for (let col = 0; col < COLS; col++) {
        if (canMakeMove(col)) {
            return col;
        }
    }
    
    return 0;
}

// Find offensive moves for AI (create threats)
function findOffensiveMove() {
    // Look for opportunities to create 2 in a row with open spaces
    for (let col = 0; col < COLS; col++) {
        if (!canMakeMove(col)) continue;
        
        const row = getLowestRow(col);
        board[row][col] = AI;
        
        // Check if this creates a threat (2 AI pieces with potential to extend)
        let createsGoodThreat = false;
        
        // Check horizontal - does this give us 2 AI pieces in a row with room to extend?
        for (let c = Math.max(0, col - 3); c <= Math.min(COLS - 4, col); c++) {
            let aiCount = 0;
            let emptyCount = 0;
            for (let i = 0; i < 4; i++) {
                if (board[row][c + i] === AI) aiCount++;
                if (board[row][c + i] === null) emptyCount++;
            }
            if (aiCount === 2 && emptyCount === 2) {
                createsGoodThreat = true;
                break;
            }
        }
        
        board[row][col] = null;
        
        if (createsGoodThreat) {
            return col;
        }
    }
    
    return -1;
}

// Detect open-ended threats (2 in a row with empty spaces on both sides)
function detectAndBlockOpenEndedThreats() {
    // PRIORITY: Check for 2 adjacent pieces with 2 free spaces on EACH side
    // Pattern we're looking for: __PP__ (where P = Player, _ = empty and playable)
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            // Check for exact pattern: Empty, Empty, Player, Player, Empty, Empty
            if (col >= 0 && col + 5 < COLS) {
                const hasPattern = 
                    board[row][col] === null &&
                    board[row][col + 1] === null &&
                    board[row][col + 2] === PLAYER &&
                    board[row][col + 3] === PLAYER &&
                    board[row][col + 4] === null &&
                    board[row][col + 5] === null;
                
                if (hasPattern) {
                    // Check if we can play at col+1 or col+4 (next to the player pieces)
                    // col+1 is to the left of the player pieces
                    if (canMakeMove(col + 1) && getLowestRow(col + 1) === row) {
                        return col + 1;
                    }
                    // col+4 is to the right of the player pieces
                    if (canMakeMove(col + 4) && getLowestRow(col + 4) === row) {
                        return col + 4;
                    }
                }
            }
            
            // Also check for pattern: _PP___ and ___PP_
            if (col >= 0 && col + 4 < COLS) {
                // Pattern: _PP___
                const leftPattern =
                    board[row][col] === null &&
                    board[row][col + 1] === PLAYER &&
                    board[row][col + 2] === PLAYER &&
                    board[row][col + 3] === null &&
                    board[row][col + 4] === null;
                
                if (leftPattern) {
                    // Block right next to player pieces
                    if (canMakeMove(col + 3) && getLowestRow(col + 3) === row) {
                        return col + 3;
                    }
                    // Or block the left side
                    if (canMakeMove(col) && getLowestRow(col) === row) {
                        return col;
                    }
                }
                
                // Pattern: ___PP_
                const rightPattern =
                    board[row][col] === null &&
                    board[row][col + 1] === null &&
                    board[row][col + 2] === PLAYER &&
                    board[row][col + 3] === PLAYER &&
                    board[row][col + 4] === null;
                
                if (rightPattern) {
                    // Block left next to player pieces
                    if (canMakeMove(col + 1) && getLowestRow(col + 1) === row) {
                        return col + 1;
                    }
                    // Or block the right side
                    if (canMakeMove(col + 4) && getLowestRow(col + 4) === row) {
                        return col + 4;
                    }
                }
            }
        }
    }
    
    // Check horizontal threats with 2 adjacent and space on both sides
    for (let row = 0; row < ROWS; row++) {
        for (let col = 1; col < COLS - 2; col++) {
            // Pattern: _PP_
            if (board[row][col] === PLAYER && 
                board[row][col + 1] === PLAYER &&
                board[row][col - 1] === null &&
                board[row][col + 2] === null) {
                
                // Try to block left side (col - 1)
                if (canMakeMove(col - 1) && getLowestRow(col - 1) === row) {
                    return col - 1;
                }
                // Try to block right side (col + 2)
                if (canMakeMove(col + 2) && getLowestRow(col + 2) === row) {
                    return col + 2;
                }
            }
        }
    }
    
    // Check for any sequence with 2 players and 2 empty in a row of 4
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            const sequence = [
                board[row][col],
                board[row][col + 1],
                board[row][col + 2],
                board[row][col + 3]
            ];
            
            const playerCount = sequence.filter(cell => cell === PLAYER).length;
            const emptyCount = sequence.filter(cell => cell === null).length;
            
            if (playerCount === 2 && emptyCount === 2) {
                // Check each empty position and block if playable
                for (let i = 0; i < 4; i++) {
                    if (sequence[i] === null && canMakeMove(col + i) && getLowestRow(col + i) === row) {
                        // Prioritize blocking next to existing player pieces
                        const hasPlayerLeft = i > 0 && sequence[i - 1] === PLAYER;
                        const hasPlayerRight = i < 3 && sequence[i + 1] === PLAYER;
                        if (hasPlayerLeft || hasPlayerRight) {
                            return col + i;
                        }
                    }
                }
                
                // If no adjacent block found, block any empty in the sequence
                for (let i = 0; i < 4; i++) {
                    if (sequence[i] === null && canMakeMove(col + i) && getLowestRow(col + i) === row) {
                        return col + i;
                    }
                }
            }
        }
    }
    
    // Check vertical threats (2 stacked with space above)
    for (let col = 0; col < COLS; col++) {
        for (let row = ROWS - 1; row >= 2; row--) {
            if (board[row][col] === PLAYER && board[row - 1][col] === PLAYER && 
                board[row - 2][col] === null && canMakeMove(col)) {
                return col;
            }
        }
    }
    
    // Check diagonal threats (ascending)
    for (let row = 3; row < ROWS; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            const sequence = [
                board[row][col],
                board[row - 1][col + 1],
                board[row - 2][col + 2],
                board[row - 3][col + 3]
            ];
            
            const playerCount = sequence.filter(cell => cell === PLAYER).length;
            const emptyCount = sequence.filter(cell => cell === null).length;
            
            if (playerCount === 2 && emptyCount === 2) {
                for (let i = 0; i < 4; i++) {
                    const checkRow = row - i;
                    const checkCol = col + i;
                    if (sequence[i] === null && canMakeMove(checkCol) && getLowestRow(checkCol) === checkRow) {
                        return checkCol;
                    }
                }
            }
        }
    }
    
    // Check diagonal threats (descending)
    for (let row = 0; row < ROWS - 3; row++) {
        for (let col = 0; col < COLS - 3; col++) {
            const sequence = [
                board[row][col],
                board[row + 1][col + 1],
                board[row + 2][col + 2],
                board[row + 3][col + 3]
            ];
            
            const playerCount = sequence.filter(cell => cell === PLAYER).length;
            const emptyCount = sequence.filter(cell => cell === null).length;
            
            if (playerCount === 2 && emptyCount === 2) {
                for (let i = 0; i < 4; i++) {
                    const checkRow = row + i;
                    const checkCol = col + i;
                    if (sequence[i] === null && canMakeMove(checkCol) && getLowestRow(checkCol) === checkRow) {
                        return checkCol;
                    }
                }
            }
        }
    }
    
    return -1;
}

// Detect any 2 in a row threats (even if not open-ended)
function detectTwoInRowThreats() {
    // Check all positions where player has 2 in a row
    for (let col = 0; col < COLS; col++) {
        if (!canMakeMove(col)) continue;
        
        const row = getLowestRow(col);
        
        // Simulate placing AI piece
        board[row][col] = AI;
        
        // Check if this blocks any potential threat
        let blocksThreat = false;
        
        // Check horizontal
        let playerInRow = 0;
        for (let c = Math.max(0, col - 3); c <= Math.min(COLS - 1, col + 3); c++) {
            if (board[row][c] === PLAYER) {
                playerInRow++;
            }
        }
        if (playerInRow >= 2) blocksThreat = true;
        
        // Check vertical
        let playerInCol = 0;
        for (let r = Math.max(0, row - 3); r <= Math.min(ROWS - 1, row + 3); r++) {
            if (board[r][col] === PLAYER) {
                playerInCol++;
            }
        }
        if (playerInCol >= 2) blocksThreat = true;
        
        board[row][col] = null;
        
        if (blocksThreat) {
            return col;
        }
    }
    
    return -1;
}

function canMakeMove(col) {
    return board[0][col] === null;
}

function getLowestRow(col) {
    for (let row = ROWS - 1; row >= 0; row--) {
        if (board[row][col] === null) {
            return row;
        }
    }
    return -1;
}

// Check for win
function checkWin(row, col, player) {
    // Check horizontal
    let count = 0;
    const winningCells = [];
    
    // Horizontal
    count = 0;
    winningCells.length = 0;
    for (let c = 0; c < COLS; c++) {
        if (board[row][c] === player) {
            count++;
            winningCells.push([row, c]);
            if (count === 4) {
                highlightWinningCells(winningCells);
                return true;
            }
        } else {
            count = 0;
            winningCells.length = 0;
        }
    }
    
    // Vertical
    count = 0;
    winningCells.length = 0;
    for (let r = 0; r < ROWS; r++) {
        if (board[r][col] === player) {
            count++;
            winningCells.push([r, col]);
            if (count === 4) {
                highlightWinningCells(winningCells);
                return true;
            }
        } else {
            count = 0;
            winningCells.length = 0;
        }
    }
    
    // Diagonal (top-left to bottom-right)
    count = 0;
    winningCells.length = 0;
    let startRow = row - Math.min(row, col);
    let startCol = col - Math.min(row, col);
    while (startRow < ROWS && startCol < COLS) {
        if (board[startRow][startCol] === player) {
            count++;
            winningCells.push([startRow, startCol]);
            if (count === 4) {
                highlightWinningCells(winningCells);
                return true;
            }
        } else {
            count = 0;
            winningCells.length = 0;
        }
        startRow++;
        startCol++;
    }
    
    // Diagonal (bottom-left to top-right)
    count = 0;
    winningCells.length = 0;
    startRow = row + Math.min(ROWS - 1 - row, col);
    startCol = col - Math.min(ROWS - 1 - row, col);
    while (startRow >= 0 && startCol < COLS) {
        if (board[startRow][startCol] === player) {
            count++;
            winningCells.push([startRow, startCol]);
            if (count === 4) {
                highlightWinningCells(winningCells);
                return true;
            }
        } else {
            count = 0;
            winningCells.length = 0;
        }
        startRow--;
        startCol++;
    }
    
    return false;
}

// Highlight winning cells
function highlightWinningCells(cells) {
    cells.forEach(([row, col]) => {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('winning');
        }
    });
}

// Check for draw
function checkDraw() {
    for (let col = 0; col < COLS; col++) {
        if (board[0][col] === null) {
            return false;
        }
    }
    return true;
}

// End game
function endGame(winner) {
    gameOver = true;
    disableBoard();
    
    const messageElement = document.getElementById('message');
    
    if (winner === PLAYER) {
        messageElement.textContent = t('youWin');
        wins++;
        
        // Save score to leaderboard (turns - lower is better)
        if (window.parent && window.parent.saveGameScore) {
            window.parent.saveGameScore("Connect Four", {
                turns: playerTurns,
                difficulty: difficulty
            }).then((result) => {
                console.log("Connect Four score saved successfully");
                if (result && result.isNewBest && window.parent.showNewBestScore) {
                    window.parent.showNewBestScore("Connect Four", { turns: playerTurns, difficulty: difficulty });
                }
            }).catch(err => {
                console.error("Error saving Connect Four score:", err);
            });
        }
    } else if (winner === AI) {
        messageElement.textContent = t('youLose');
        losses++;
    } else {
        messageElement.textContent = t('draw');
        draws++;
    }
    
    updateScore();
}

// Update current player display
function updateCurrentPlayer() {
    const element = document.getElementById('currentPlayer');
    if (gameOver) {
        element.textContent = '';
    } else {
        element.textContent = currentPlayer === PLAYER ? t('yourTurn') : t('aiTurn');
    }
}

// Update score display
function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = `${t('wins')}: ${wins} | ${t('losses')}: ${losses} | ${t('draws')}: ${draws} | ${t('turns')}: ${playerTurns}`;
}

// Restart game
function restartGame() {
    initBoard();
    currentPlayer = PLAYER;
    gameOver = false;
    playerTurns = 0;  // Reset turn counter
    document.getElementById('message').textContent = '';
    drawBoard();
    updateCurrentPlayer();
    updateScore();
    enableBoard();
}

// Menu functions
function showMenu() {
    document.getElementById('menuOverlay').classList.remove('hidden');
}

function hideMenu() {
    document.getElementById('menuOverlay').classList.add('hidden');
}

function startGame(selectedDifficulty) {
    difficulty = selectedDifficulty;
    hideMenu();
    
    // Randomly decide who starts (50/50 chance)
    currentPlayer = Math.random() < 0.5 ? PLAYER : AI;
    
    restartGame();
    
    // If AI starts, make the first move after a delay
    if (currentPlayer === AI && !gameOver) {
        disableBoard();
        setTimeout(() => {
            makeAIMove();
        }, 1000);
    }
}

// Event listeners
document.getElementById('btnEasy').addEventListener('click', () => {
    startGame('easy');
});

document.getElementById('btnHard').addEventListener('click', () => {
    startGame('hard');
});

document.getElementById('restartBtn').addEventListener('click', restartGame);

// Initialize
initBoard();
updateLanguage();
showMenu();
