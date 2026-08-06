// Game State
let gameState = {
    difficulty: null,
    shelves: [],
    selectedSlot: null,
    timerInterval: null,
    startTime: null,
    timerStarted: false,
    moveCount: 0
};

// Difficulty configurations
const DIFFICULTIES = {
    easy: { shelves: 6, uniqueItems: 5 },
    medium: { shelves: 10, uniqueItems: 9 },
    hard: { shelves: 14, uniqueItems: 13 }
};

const TOTAL_IMAGES = 18;
const SLOTS_PER_SHELF = 3;

// Language management
let currentLanguage = 'en';

const translations = {
    en: {
        title: "Creature Sorting",
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
        easyDesc: "6 shelves, 5 items",
        mediumDesc: "10 shelves, 9 items",
        hardDesc: "14 shelves, 13 items",
        back: "Back",
        time: "Time",
        instruction: "Click an item to select, then click an empty slot to move it",
        congratulations: "Congratulations!",
        playAgain: "Play Again",
        mainMenu: "Main Menu",
        completedIn: "You completed the puzzle in",
        newRecord: "🎉 NEW RECORD! 🎉"
    },
    pt: {
        title: "Ordenação de Criaturas",
        easy: "Fácil",
        medium: "Médio",
        hard: "Difícil",
        easyDesc: "6 prateleiras, 5 itens",
        mediumDesc: "10 prateleiras, 9 itens",
        hardDesc: "14 prateleiras, 13 itens",
        back: "Voltar",
        time: "Tempo",
        instruction: "Clique em um item para selecioná-lo, depois clique em um espaço vazio para movê-lo",
        congratulations: "Parabéns!",
        playAgain: "Jogar Novamente",
        mainMenu: "Menu Principal",
        completedIn: "Você completou o puzzle em",
        newRecord: "🎉 NOVO RECORDE! 🎉"
    }
};

function t(key) {
    return translations[currentLanguage][key] || key;
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
        if (translations[currentLanguage][key]) {
            el.textContent = t(key);
        }
    });
}

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        currentLanguage = getParentLanguage();
        updateLanguage();
    }, 100);
    
    setupEventListeners();
});

// Listen for language changes from parent
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'languageChange') {
        currentLanguage = event.data.language;
        updateLanguage();
    }
});

function setupEventListeners() {
    // Menu buttons
    document.getElementById('easyBtn').addEventListener('click', () => startGame('easy'));
    document.getElementById('mediumBtn').addEventListener('click', () => startGame('medium'));
    document.getElementById('hardBtn').addEventListener('click', () => startGame('hard'));

    // Game buttons
    document.getElementById('backBtn').addEventListener('click', () => {
        stopTimer();
        showScreen('mainMenu');
    });

    // Victory modal buttons
    document.getElementById('playAgainBtn').addEventListener('click', () => {
        document.getElementById('victoryModal').classList.add('hidden');
        startGame(gameState.difficulty);
    });

    document.getElementById('menuBtn').addEventListener('click', () => {
        document.getElementById('victoryModal').classList.add('hidden');
        showScreen('mainMenu');
    });
}

function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.add('hidden'));
    document.getElementById(screenName + 'Screen').classList.remove('hidden');
}

function startGame(difficulty) {
    gameState.difficulty = difficulty;
    gameState.selectedSlot = null;
    gameState.timerStarted = false;
    gameState.moveCount = 0;
    gameState.startTime = null;
    
    stopTimer();
    
    const config = DIFFICULTIES[difficulty];
    document.getElementById('difficultyDisplay').textContent = t(difficulty).toUpperCase();
    
    // Generate puzzle (skip solvability check for performance - most puzzles are solvable)
    gameState.shelves = generatePuzzle(config.shelves, config.uniqueItems);
    
    renderGame();
    showScreen('game');
    resetTimer();
}

function generatePuzzle(numShelves, numUniqueItems) {
    // Select random images
    const availableImages = Array.from({ length: TOTAL_IMAGES }, (_, i) => i + 1);
    const selectedImages = [];
    
    for (let i = 0; i < numUniqueItems; i++) {
        const randomIndex = Math.floor(Math.random() * availableImages.length);
        selectedImages.push(availableImages.splice(randomIndex, 1)[0]);
    }
    
    // Create shelves - start with solved state, then shuffle
    const shelves = [];
    
    // Fill shelves with complete sets (3 of each creature)
    for (let i = 0; i < numUniqueItems; i++) {
        shelves.push([selectedImages[i], selectedImages[i], selectedImages[i]]);
    }
    
    // Add one empty shelf
    shelves.push([null, null, null]);
    
    // Perform random valid moves to shuffle (this guarantees solvability)
    const shuffleMoves = Math.max(50, numShelves * 10);
    for (let i = 0; i < shuffleMoves; i++) {
        const moves = getAllPossibleMoves(shelves);
        if (moves.length > 0) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            const item = shelves[randomMove.fromShelf][randomMove.fromSlot];
            shelves[randomMove.fromShelf][randomMove.fromSlot] = null;
            shelves[randomMove.toShelf][randomMove.toSlot] = item;
        }
    }
    
    return shelves;
}

function getAllPossibleMoves(shelves) {
    const moves = [];
    
    for (let fromShelf = 0; fromShelf < shelves.length; fromShelf++) {
        for (let fromSlot = 0; fromSlot < SLOTS_PER_SHELF; fromSlot++) {
            if (shelves[fromShelf][fromSlot] !== null) {
                // Find empty slots
                for (let toShelf = 0; toShelf < shelves.length; toShelf++) {
                    for (let toSlot = 0; toSlot < SLOTS_PER_SHELF; toSlot++) {
                        if (shelves[toShelf][toSlot] === null) {
                            moves.push({ fromShelf, fromSlot, toShelf, toSlot });
                        }
                    }
                }
            }
        }
    }
    
    return moves;
}

function isPuzzleSolved(shelves) {
    let emptyShelvesCount = 0;
    
    for (const shelf of shelves) {
        const nonEmptySlots = shelf.filter(slot => slot !== null);
        
        if (nonEmptySlots.length === 0) {
            emptyShelvesCount++;
        } else if (nonEmptySlots.length === SLOTS_PER_SHELF) {
            // Check if all 3 items are the same
            if (!(nonEmptySlots[0] === nonEmptySlots[1] && nonEmptySlots[1] === nonEmptySlots[2])) {
                return false;
            }
        } else {
            return false; // Partially filled shelf
        }
    }
    
    return emptyShelvesCount === 1;
}

function renderGame() {
    const container = document.getElementById('shelvesContainer');
    container.innerHTML = '';
    
    gameState.shelves.forEach((shelf, shelfIndex) => {
        const shelfDiv = document.createElement('div');
        shelfDiv.className = 'shelf';
        
        shelf.forEach((item, slotIndex) => {
            const slotDiv = document.createElement('div');
            slotDiv.className = 'slot';
            slotDiv.dataset.shelf = shelfIndex;
            slotDiv.dataset.slot = slotIndex;
            
            if (item === null) {
                slotDiv.classList.add('empty');
            } else {
                const img = document.createElement('img');
                img.src = `images/${String(item).padStart(2, '0')}.png`;
                img.alt = `Creature ${item}`;
                slotDiv.appendChild(img);
            }
            
            slotDiv.addEventListener('click', handleSlotClick);
            shelfDiv.appendChild(slotDiv);
        });
        
        container.appendChild(shelfDiv);
    });
}

function handleSlotClick(event) {
    const clickedSlot = event.currentTarget;
    const shelfIndex = parseInt(clickedSlot.dataset.shelf);
    const slotIndex = parseInt(clickedSlot.dataset.slot);
    const item = gameState.shelves[shelfIndex][slotIndex];
    
    // Start timer on first move
    if (!gameState.timerStarted) {
        startTimer();
        gameState.timerStarted = true;
    }
    
    if (gameState.selectedSlot === null) {
        // First click - select an item
        if (item !== null) {
            gameState.selectedSlot = { shelf: shelfIndex, slot: slotIndex };
            clickedSlot.classList.add('selected');
        }
    } else {
        // Second click
        const selectedShelf = gameState.selectedSlot.shelf;
        const selectedSlot = gameState.selectedSlot.slot;
        
        // Check if clicking the same slot (deselect)
        if (selectedShelf === shelfIndex && selectedSlot === slotIndex) {
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
            gameState.selectedSlot = null;
            return;
        }
        
        // Check if clicking an empty slot (valid move)
        if (item === null) {
            // Move the item
            const movingItem = gameState.shelves[selectedShelf][selectedSlot];
            gameState.shelves[selectedShelf][selectedSlot] = null;
            gameState.shelves[shelfIndex][slotIndex] = movingItem;
            gameState.moveCount++;
            
            // Clear selection
            gameState.selectedSlot = null;
            
            // Re-render
            renderGame();
            
            // Check if puzzle is solved
            if (isPuzzleSolved(gameState.shelves)) {
                stopTimer();
                showVictoryModal();
            }
        } else {
            // Clicked on another item, switch selection
            document.querySelectorAll('.slot').forEach(s => s.classList.remove('selected'));
            gameState.selectedSlot = { shelf: shelfIndex, slot: slotIndex };
            clickedSlot.classList.add('selected');
        }
    }
}

function startTimer() {
    gameState.startTime = Date.now();
    gameState.timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    const elapsed = Date.now() - gameState.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function resetTimer() {
    document.getElementById('timer').textContent = '00:00';
}

function getElapsedTime() {
    if (gameState.startTime) {
        return Date.now() - gameState.startTime;
    }
    return 0;
}

function showVictoryModal() {
    const elapsedMs = getElapsedTime();
    const seconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    
    document.getElementById('victoryTime').textContent = 
        `${t('completedIn')} ${timeString}`;
    
    // Save score to parent window's Firestore
    if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Creature Sorting", {
            bestTime: seconds,
            difficulty: gameState.difficulty
        }).then((result) => {
            console.log("Creature Sorting score saved successfully");
            
            const recordMsg = document.getElementById('recordMessage');
            if (result && result.isNewBest) {
                recordMsg.textContent = t('newRecord');
                recordMsg.style.display = 'block';
                
                if (window.parent.showNewBestScore) {
                    window.parent.showNewBestScore("Creature Sorting", { 
                        bestTime: seconds, 
                        difficulty: gameState.difficulty 
                    });
                }
            } else {
                recordMsg.style.display = 'none';
            }
        }).catch(err => {
            console.error("Error saving Creature Sorting score:", err);
            document.getElementById('recordMessage').style.display = 'none';
        });
    } else {
        console.error("saveGameScore function not found in parent window");
        document.getElementById('recordMessage').style.display = 'none';
    }
    
    document.getElementById('victoryModal').classList.remove('hidden');
}
