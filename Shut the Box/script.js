// ============== TRANSLATIONS ==============
let currentLanguage = 'en';

const translations = {
    en: {
        title: 'Shut the Box',
        selectLevel: 'Select Level:',
        level1: 'Level 1',
        level1Desc: 'Single Board',
        level2: 'Level 2',
        level2Desc: 'Double Board',
        level: 'Level',
        score: 'Score',
        rollDice: 'Roll Dice',
        board: 'Board',
        board2: 'Board 2 (Behind)',
        selected: 'Selected',
        reset: 'Reset Selection',
        submit: 'Submit',
        menu: 'Menu',
        invalidSum: 'Selection must equal',
        noMoves: 'No valid moves! Game Over.',
        shutTheBox: '🎉 You Shut the Box! Perfect Score!',
        gameOver: 'Game Over! Final Score:',
        lowerIsBetter: '(Lower is better)'
    },
    pt: {
        title: 'Feche a Caixa',
        selectLevel: 'Selecione o Nível:',
        level1: 'Nível 1',
        level1Desc: 'Tabuleiro Único',
        level2: 'Nível 2',
        level2Desc: 'Tabuleiro Duplo',
        level: 'Nível',
        score: 'Pontuação',
        rollDice: 'Rolar Dados',
        board: 'Tabuleiro',
        board2: 'Tabuleiro 2 (Atrás)',
        selected: 'Selecionado',
        reset: 'Reiniciar Seleção',
        submit: 'Enviar',
        menu: 'Menu',
        invalidSum: 'Seleção deve ser igual a',
        noMoves: 'Sem jogadas válidas! Fim de jogo.',
        shutTheBox: '🎉 Você Fechou a Caixa! Pontuação Perfeita!',
        gameOver: 'Fim de Jogo! Pontuação Final:',
        lowerIsBetter: '(Menor é melhor)'
    }
};

function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

function getParentLanguage() {
    try {
        if (window.parent && window.parent.currentLanguage) {
            return window.parent.currentLanguage;
        }
        if (window.parent && window.parent.localStorage) {
            const lang = window.parent.localStorage.getItem('arcadeLanguage');
            if (lang) return lang;
        }
        const localLang = localStorage.getItem('arcadeLanguage');
        if (localLang) return localLang;
    } catch (e) {
        console.log('Error getting parent language:', e);
    }
    return 'en';
}

function updateLanguage() {
    currentLanguage = getParentLanguage();
    
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = t(key);
    });
}

// ============== GAME STATE ==============
let currentLevel = 1;
let board1 = [];
let board2 = [];
let selectedTiles = [];
let dice1Value = 0;
let dice2Value = 0;
let diceTotal = 0;
let gameOver = false;

// ============== DOM ELEMENTS ==============
const levelMenu = document.getElementById('levelMenu');
const gameContainer = document.getElementById('gameContainer');
const board1Element = document.getElementById('board1');
const board2Element = document.getElementById('board2');
const board2Container = document.getElementById('board2Container');
const dice1Element = document.getElementById('dice1');
const dice2Element = document.getElementById('dice2');
const diceTotalElement = document.getElementById('diceTotal');
const rollBtn = document.getElementById('rollBtn');
const selectionControls = document.getElementById('selectionControls');
const selectedNumbersElement = document.getElementById('selectedNumbers');
const selectedSumElement = document.getElementById('selectedSum');
const resetBtn = document.getElementById('resetBtn');
const submitBtn = document.getElementById('submitBtn');
const messageElement = document.getElementById('message');
const scoreElement = document.getElementById('score');
const currentLevelElement = document.getElementById('currentLevel');

// ============== MENU FUNCTIONS ==============
function showMenu() {
    levelMenu.style.display = 'flex';
    gameContainer.style.display = 'none';
}

function startGame(level) {
    currentLevel = level;
    currentLevelElement.textContent = level;
    
    // Initialize boards
    board1 = Array.from({ length: 12 }, (_, i) => ({ number: i + 1, removed: false }));
    board2 = Array.from({ length: 12 }, (_, i) => ({ number: 12 - i, removed: false }));
    
    selectedTiles = [];
    dice1Value = 0;
    dice2Value = 0;
    diceTotal = 0;
    gameOver = false;
    
    // Show/hide board 2 based on level
    board2Container.style.display = level === 2 ? 'block' : 'none';
    
    levelMenu.style.display = 'none';
    gameContainer.style.display = 'block';
    
    renderBoards();
    updateScore();
    clearMessage();
    
    rollBtn.disabled = false;
    selectionControls.style.display = 'none';
    diceTotalElement.textContent = '0';
}

// ============== BOARD RENDERING ==============
function renderBoards() {
    // Render Board 1
    board1Element.innerHTML = '';
    board1.forEach((tile, index) => {
        const button = document.createElement('button');
        button.className = 'tile';
        button.textContent = tile.number;
        button.dataset.board = '1';
        button.dataset.index = index;
        
        if (tile.removed) {
            button.classList.add('removed');
        } else {
            button.addEventListener('click', () => selectTile(1, index));
        }
        
        board1Element.appendChild(button);
    });
    
    // Render Board 2 (if Level 2)
    if (currentLevel === 2) {
        board2Element.innerHTML = '';
        board2.forEach((tile, index) => {
            const button = document.createElement('button');
            button.className = 'tile';
            button.textContent = tile.number;
            button.dataset.board = '2';
            button.dataset.index = index;
            
            if (tile.removed) {
                button.classList.add('removed');
            } else {
                // Check if tile is accessible (board1 tile in front must be removed)
                const board1TileInFront = board1[index];
                if (!board1TileInFront.removed) {
                    button.classList.add('disabled');
                } else {
                    button.addEventListener('click', () => selectTile(2, index));
                }
            }
            
            board2Element.appendChild(button);
        });
    }
}

// ============== DICE FUNCTIONS ==============
function rollDice() {
    if (gameOver) return;
    
    // Disable roll button
    rollBtn.disabled = true;
    
    // Clear selection
    selectedTiles = [];
    updateSelectionDisplay();
    
    // Animate dice
    dice1Element.classList.add('rolling');
    dice2Element.classList.add('rolling');
    
    setTimeout(() => {
        dice1Value = Math.floor(Math.random() * 6) + 1;
        dice2Value = Math.floor(Math.random() * 6) + 1;
        diceTotal = dice1Value + dice2Value;
        
        displayDice(dice1Element, dice1Value);
        displayDice(dice2Element, dice2Value);
        diceTotalElement.textContent = diceTotal;
        
        dice1Element.classList.remove('rolling');
        dice2Element.classList.remove('rolling');
        
        // Check if any valid moves exist
        if (!hasValidMoves()) {
            endGame();
        } else {
            selectionControls.style.display = 'block';
            clearMessage();
        }
    }, 500);
}

function displayDice(diceElement, value) {
    const face = diceElement.querySelector('.dice-face');
    face.innerHTML = '';
    
    const positions = {
        1: [[1, 1]],
        2: [[0, 0], [2, 2]],
        3: [[0, 0], [1, 1], [2, 2]],
        4: [[0, 0], [0, 2], [2, 0], [2, 2]],
        5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
        6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]]
    };
    
    positions[value].forEach(([row, col]) => {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.gridRow = row + 1;
        dot.style.gridColumn = col + 1;
        face.appendChild(dot);
    });
}

// ============== TILE SELECTION ==============
function selectTile(boardNum, index) {
    if (gameOver || rollBtn.disabled === false) return;
    
    const board = boardNum === 1 ? board1 : board2;
    const tile = board[index];
    
    if (tile.removed) return;
    
    // Check if tile is accessible (for board 2)
    if (boardNum === 2 && !board1[index].removed) return;
    
    // Toggle selection
    const tileId = `${boardNum}-${index}`;
    const existingIndex = selectedTiles.findIndex(t => t.id === tileId);
    
    if (existingIndex >= 0) {
        selectedTiles.splice(existingIndex, 1);
    } else {
        selectedTiles.push({ id: tileId, board: boardNum, index, number: tile.number });
    }
    
    updateSelectionDisplay();
    renderBoards();
    
    // Highlight selected tiles
    selectedTiles.forEach(t => {
        const boardElement = t.board === 1 ? board1Element : board2Element;
        const button = boardElement.querySelector(`[data-board="${t.board}"][data-index="${t.index}"]`);
        if (button) button.classList.add('selected');
    });
}

function updateSelectionDisplay() {
    const numbers = selectedTiles.map(t => t.number).join(' + ');
    const sum = selectedTiles.reduce((acc, t) => acc + t.number, 0);
    
    selectedNumbersElement.textContent = numbers || '-';
    selectedSumElement.textContent = sum;
    
    // Enable/disable submit button
    submitBtn.disabled = sum !== diceTotal;
}

function resetSelection() {
    selectedTiles = [];
    updateSelectionDisplay();
    renderBoards();
    clearMessage();
}

function submitSelection() {
    const sum = selectedTiles.reduce((acc, t) => acc + t.number, 0);
    
    if (sum !== diceTotal) {
        showMessage(`${t('invalidSum')} ${diceTotal}`, 'error');
        return;
    }
    
    // Remove selected tiles
    selectedTiles.forEach(t => {
        const board = t.board === 1 ? board1 : board2;
        board[t.index].removed = true;
    });
    
    selectedTiles = [];
    updateSelectionDisplay();
    renderBoards();
    updateScore();
    
    // Check if won
    const score = calculateScore();
    if (score === 0) {
        winGame();
    } else {
        rollBtn.disabled = false;
        selectionControls.style.display = 'none';
        clearMessage();
    }
}

// ============== GAME LOGIC ==============
function hasValidMoves() {
    const availableNumbers = [];
    
    // Get available numbers from board1
    board1.forEach(tile => {
        if (!tile.removed) availableNumbers.push(tile.number);
    });
    
    // Get available numbers from board2 (if Level 2)
    if (currentLevel === 2) {
        board2.forEach((tile, index) => {
            if (!tile.removed && board1[index].removed) {
                availableNumbers.push(tile.number);
            }
        });
    }
    
    // Check if any combination adds up to diceTotal
    return canMakeSum(availableNumbers, diceTotal);
}

function canMakeSum(numbers, target) {
    // Dynamic programming approach to check if target sum is possible
    const dp = new Array(target + 1).fill(false);
    dp[0] = true;
    
    for (const num of numbers) {
        for (let i = target; i >= num; i--) {
            if (dp[i - num]) {
                dp[i] = true;
            }
        }
    }
    
    return dp[target];
}

function calculateScore() {
    let score = 0;
    
    board1.forEach(tile => {
        if (!tile.removed) score += tile.number;
    });
    
    if (currentLevel === 2) {
        board2.forEach(tile => {
            if (!tile.removed) score += tile.number;
        });
    }
    
    return score;
}

function updateScore() {
    const score = calculateScore();
    scoreElement.textContent = score;
}

function endGame() {
    gameOver = true;
    rollBtn.disabled = true;
    selectionControls.style.display = 'none';
    
    const finalScore = calculateScore();
    showMessage(`${t('gameOver')} ${finalScore} ${t('lowerIsBetter')}`, 'error');
    
    // Save to leaderboard
    saveScore(finalScore);
}

function winGame() {
    gameOver = true;
    rollBtn.disabled = true;
    selectionControls.style.display = 'none';
    
    showMessage(t('shutTheBox'), 'win');
    
    // Save perfect score to leaderboard
    saveScore(0);
}

function saveScore(score) {
    if (window.parent && window.parent.saveGameScore) {
        const scoreData = {
            score: score,
            level: parseInt(currentLevel) // Ensure level is a number
        };
        
        window.parent.saveGameScore("Shut the Box", scoreData).then((result) => {
            console.log("Shut the Box score saved successfully:", result);
            if (result && result.isNewBest && window.parent.showNewBestScore) {
                window.parent.showNewBestScore("Shut the Box", scoreData);
            }
        }).catch(err => {
            console.error("Error saving Shut the Box score:", err);
        });
    } else {
        console.log("Parent saveGameScore not available");
    }
}

// ============== UI HELPERS ==============
function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = type;
}

function clearMessage() {
    messageElement.textContent = '';
    messageElement.className = '';
}

// ============== EVENT LISTENERS ==============
rollBtn.addEventListener('click', rollDice);
resetBtn.addEventListener('click', resetSelection);
submitBtn.addEventListener('click', submitSelection);

// ============== INITIALIZATION ==============
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        currentLanguage = getParentLanguage();
        updateLanguage();
    }, 100);
});

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'languageChange') {
        currentLanguage = event.data.language;
        updateLanguage();
    }
});
