// Game state
let difficulty = null;
let gridSize = 0;
let grid = [];
let startPos = null;
let endPos = null;
let timerInterval = null;
let startTime = null;
let elapsedTime = 0;
let flowInProgress = false;
let currentLang = 'en';

// Translation system
const translations = {
    en: {
        title: 'Pipe Mania',
        menuText: 'Select Difficulty:',
        btnEasy: 'Easy (8×8)',
        btnMedium: 'Medium (10×10)',
        btnHard: 'Hard (12×12)',
        difficulty: 'Difficulty',
        time: 'Time',
        startFlow: 'Start Flow',
        newPuzzle: 'New Puzzle',
        changeDifficulty: 'Change Difficulty',
        youWon: 'You Won!',
        youLose: 'You Lost!',
        winMessage: 'You completed the puzzle in',
        loseMessage: 'The pipes are not connected correctly. Try again!',
        playAgain: 'Play Again'
    },
    pt: {
        title: 'Mania de Tubos',
        menuText: 'Selecione a Dificuldade:',
        btnEasy: 'Fácil (8×8)',
        btnMedium: 'Médio (10×10)',
        btnHard: 'Difícil (12×12)',
        difficulty: 'Dificuldade',
        time: 'Tempo',
        startFlow: 'Iniciar Fluxo',
        newPuzzle: 'Novo Puzzle',
        changeDifficulty: 'Mudar Dificuldade',
        youWon: 'Você Ganhou!',
        youLose: 'Você Perdeu!',
        winMessage: 'Você completou o puzzle em',
        loseMessage: 'Os tubos não estão conectados corretamente. Tente novamente!',
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
        document.getElementById('startFlowBtn').textContent = t('startFlow');
        document.getElementById('newPuzzleBtn').textContent = t('newPuzzle');
        document.getElementById('changeDifficultyBtn').textContent = t('changeDifficulty');
        document.getElementById('changeDifficultyBtn2').textContent = t('changeDifficulty');
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
const timerDisplay = document.getElementById('timerDisplay');
const messageOverlay = document.getElementById('messageOverlay');
const messageTitle = document.getElementById('messageTitle');
const messageText = document.getElementById('messageText');
const startFlowBtn = document.getElementById('startFlowBtn');

// Event listeners
document.getElementById('btnEasy').addEventListener('click', () => startGame('easy'));
document.getElementById('btnMedium').addEventListener('click', () => startGame('medium'));
document.getElementById('btnHard').addEventListener('click', () => startGame('hard'));
document.getElementById('newPuzzleBtn').addEventListener('click', () => startGame(difficulty));
document.getElementById('changeDifficultyBtn').addEventListener('click', showMenu);
document.getElementById('startFlowBtn').addEventListener('click', simulateFlow);
document.getElementById('playAgainBtn').addEventListener('click', () => {
    messageOverlay.classList.add('hidden');
    startGame(difficulty);
});
document.getElementById('changeDifficultyBtn2').addEventListener('click', () => {
    messageOverlay.classList.add('hidden');
    showMenu();
});

function showMenu() {
    stopTimer();
    menuOverlay.classList.remove('hidden');
    gameContainer.classList.add('hidden');
}

function startGame(mode) {
    difficulty = mode;
    gridSize = mode === 'easy' ? 8 : mode === 'medium' ? 10 : 12;
    
    menuOverlay.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    messageOverlay.classList.add('hidden');
    
    updateLanguage();
    gridElement.className = `grid size-${gridSize}`;
    
    generatePuzzle();
    startTimer();
}

function initGrid(size) {
    grid = Array(size).fill(null).map(() => 
        Array(size).fill(null).map(() => ({
            type: 'straight',
            rotation: 0
        }))
    );
}

function generatePuzzle() {
    initGrid(gridSize);
    
    // Place start on a random row on the LEFT side (column 0)
    const startRow = Math.floor(Math.random() * gridSize);
    startPos = { x: 0, y: startRow };
    
    // Place end on a random row on the RIGHT side (last column)
    const endRow = Math.floor(Math.random() * gridSize);
    endPos = { x: gridSize - 1, y: endRow };
    
    grid[startPos.y][startPos.x] = { type: 'start', rotation: 0 };
    grid[endPos.y][endPos.x] = { type: 'end', rotation: 0 };
    
    console.log('START position:', startPos, 'Grid value:', grid[startPos.y][startPos.x]);
    console.log('END position:', endPos, 'Grid value:', grid[endPos.y][endPos.x]);
    
    // Generate solution path
    const path = generatePath(startPos, endPos);
    
    console.log('After path generation - START:', grid[startPos.y][startPos.x]);
    console.log('After path generation - END:', grid[endPos.y][endPos.x]);
    
    // Fill remaining cells with random pipes
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            if (!isInPath(path, x, y) && grid[y][x].type !== 'start' && grid[y][x].type !== 'end') {
                const types = ['straight', 'corner', 't', 'cross'];
                grid[y][x] = {
                    type: types[Math.floor(Math.random() * types.length)],
                    rotation: [0, 90, 180, 270][Math.floor(Math.random() * 4)]
                };
            }
        }
    }
    
    // Randomize rotation of path tiles (but not START or END)
    for (const pos of path) {
        if (grid[pos.y][pos.x].type !== 'start' && grid[pos.y][pos.x].type !== 'end') {
            grid[pos.y][pos.x].rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        }
    }
    
    console.log('Before render - START:', grid[startPos.y][startPos.x]);
    console.log('Before render - END:', grid[endPos.y][endPos.x]);
    
    renderGrid();
}

function generatePath(start, end) {
    const path = [start];
    let current = { ...start };
    
    // Generate path using A* style approach - move toward end position
    while (current.x !== end.x || current.y !== end.y) {
        const prev = path[path.length - 1];
        let next = null;
        
        // Calculate direction priority based on distance to end
        const dx = end.x - current.x;
        const dy = end.y - current.y;
        
        const moves = [];
        
        // Add possible moves with priority
        if (dx > 0) moves.push({ x: current.x + 1, y: current.y, priority: Math.abs(dx) });
        if (dx < 0) moves.push({ x: current.x - 1, y: current.y, priority: Math.abs(dx) });
        if (dy > 0) moves.push({ x: current.x, y: current.y + 1, priority: Math.abs(dy) });
        if (dy < 0) moves.push({ x: current.x, y: current.y - 1, priority: Math.abs(dy) });
        
        // Filter out moves that go backwards or out of bounds
        const validMoves = moves.filter(move => {
            if (move.x < 0 || move.x >= gridSize || move.y < 0 || move.y >= gridSize) return false;
            // Don't go back to previous position
            if (path.length > 1) {
                const prevPos = path[path.length - 2];
                if (move.x === prevPos.x && move.y === prevPos.y) return false;
            }
            return true;
        });
        
        if (validMoves.length === 0) {
            // Shouldn't happen, but fallback
            next = { x: current.x + 1, y: current.y };
        } else {
            // Sort by priority and add some randomness
            validMoves.sort((a, b) => b.priority - a.priority);
            
            // 70% of the time take the best move, 30% take a random valid move
            if (Math.random() < 0.7 && validMoves.length > 0) {
                next = validMoves[0];
            } else {
                next = validMoves[Math.floor(Math.random() * validMoves.length)];
            }
        }
        
        // Set pipe type based on direction change - but DON'T overwrite START or END
        if (path.length > 0 && grid[current.y][current.x].type !== 'start' && grid[current.y][current.x].type !== 'end') {
            grid[current.y][current.x] = determinePipeType(prev, current, next);
        }
        
        path.push(next);
        current = next;
    }
    
    return path;
}

function determinePipeType(prev, current, next) {
    if (!prev || !next) return { type: 'straight', rotation: 0 };
    
    const fromDir = getDirection(prev, current);
    const toDir = getDirection(current, next);
    
    if (fromDir === toDir) {
        // Straight pipe
        const rotation = (fromDir === 'right' || fromDir === 'left') ? 90 : 0;
        return { type: 'straight', rotation };
    } else {
        // Corner pipe - map all possible corner combinations
        const cornerMap = {
            'right-down': 90,
            'right-up': 180,
            'left-down': 0,
            'left-up': 270,
            'down-right': 90,
            'down-left': 0,
            'up-right': 180,
            'up-left': 270
        };
        
        const key = `${fromDir}-${toDir}`;
        const rotation = cornerMap[key] !== undefined ? cornerMap[key] : 0;
        return { type: 'corner', rotation };
    }
}

function getDirection(from, to) {
    if (to.x > from.x) return 'right';
    if (to.x < from.x) return 'left';
    if (to.y > from.y) return 'down';
    if (to.y < from.y) return 'up';
    return '';
}

function isInPath(path, x, y) {
    return path.some(p => p.x === x && p.y === y);
}

function renderGrid() {
    gridElement.innerHTML = '';
    
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            const tile = grid[y][x];
            
            if (tile.type === 'start') {
                cell.classList.add('start', 'fixed');
                cell.innerHTML = '<div style="font-weight: bold; color: white; text-shadow: 0 0 5px rgba(0,0,0,0.5);">START</div>';
            } else if (tile.type === 'end') {
                cell.classList.add('end', 'fixed');
                cell.innerHTML = '<div style="font-weight: bold; color: white; text-shadow: 0 0 5px rgba(0,0,0,0.5);">END</div>';
            } else {
                const pipe = createPipeElement(tile);
                cell.appendChild(pipe);
                cell.addEventListener('click', () => rotateTile(x, y));
            }
            
            gridElement.appendChild(cell);
        }
    }
}

function createPipeElement(tile) {
    const pipe = document.createElement('div');
    pipe.className = `pipe rotate-${tile.rotation}`;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'pipe-path');
    
    switch (tile.type) {
        case 'straight':
            path.setAttribute('d', 'M 50 0 L 50 100');
            break;
        case 'corner':
            path.setAttribute('d', 'M 50 0 L 50 50 L 100 50');
            break;
        case 't':
            path.setAttribute('d', 'M 50 0 L 50 50 M 0 50 L 100 50');
            break;
        case 'cross':
            path.setAttribute('d', 'M 50 0 L 50 100 M 0 50 L 100 50');
            break;
    }
    
    svg.appendChild(path);
    pipe.appendChild(svg);
    
    return pipe;
}

function rotateTile(x, y) {
    if (flowInProgress) return;
    
    const tile = grid[y][x];
    if (tile.type === 'start' || tile.type === 'end') return;
    
    tile.rotation = (tile.rotation + 90) % 360;
    renderGrid();
}

function getConnections(tile) {
    const connections = [];
    const rot = tile.rotation;
    
    switch (tile.type) {
        case 'start':
            // START can exit in any direction - we'll check all during pathfinding
            connections.push('up', 'down', 'left', 'right');
            break;
        case 'end':
            // END can accept from any direction
            connections.push('up', 'down', 'left', 'right');
            break;
        case 'straight':
            if (rot === 0 || rot === 180) {
                connections.push('up', 'down');
            } else {
                connections.push('left', 'right');
            }
            break;
        case 'corner':
            if (rot === 0) connections.push('up', 'right');
            else if (rot === 90) connections.push('right', 'down');
            else if (rot === 180) connections.push('down', 'left');
            else connections.push('left', 'up');
            break;
        case 't':
            if (rot === 0) connections.push('up', 'left', 'right');
            else if (rot === 90) connections.push('up', 'right', 'down');
            else if (rot === 180) connections.push('left', 'right', 'down');
            else connections.push('up', 'left', 'down');
            break;
        case 'cross':
            connections.push('up', 'down', 'left', 'right');
            break;
    }
    
    return connections;
}

function simulateFlow() {
    if (flowInProgress) return;
    
    flowInProgress = true;
    startFlowBtn.disabled = true;
    resetFlow();
    
    // Use BFS to find if there's ANY path from START to END
    const queue = [{ pos: { ...startPos }, from: null, path: [] }];
    const visited = new Set(); // Simple position tracking
    let foundEnd = false;
    let finalPath = null;
    let iterations = 0;
    const maxIterations = gridSize * gridSize * 8; // Increased limit for larger grids
    
    while (queue.length > 0 && iterations < maxIterations) {
        iterations++;
        const { pos, from, path } = queue.shift();
        const key = `${pos.x},${pos.y}`;
        
        // If we've been here before, skip (but track with direction to allow revisits from different angles)
        const visitKey = `${key}-${from}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);
        
        const tile = grid[pos.y][pos.x];
        const connections = getConnections(tile);
        
        // Check if we reached END
        if (tile.type === 'end') {
            foundEnd = true;
            finalPath = [...path, pos];
            break;
        }
        
        // For each connection direction, check if we can move there
        const moves = { 
            up: {x: 0, y: -1}, 
            down: {x: 0, y: 1}, 
            left: {x: -1, y: 0}, 
            right: {x: 1, y: 0} 
        };
        
        const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };
        
        for (const dir of connections) {
            // Don't go back where we came from (except for START which has no 'from')
            if (from && dir === opposite[from]) continue;
            
            const move = moves[dir];
            const next = { x: pos.x + move.x, y: pos.y + move.y };
            
            // Check bounds
            if (next.x < 0 || next.x >= gridSize || next.y < 0 || next.y >= gridSize) continue;
            
            // Check if already in current path (prevent loops within path)
            if (path.some(p => p.x === next.x && p.y === next.y)) continue;
            
            // Check if the next tile has a connection back to us
            const nextTile = grid[next.y][next.x];
            const nextConnections = getConnections(nextTile);
            
            if (nextConnections.includes(opposite[dir])) {
                // Valid connection!
                queue.push({ 
                    pos: next, 
                    from: dir, 
                    path: [...path, pos] 
                });
            }
        }
    }
    
    if (iterations >= maxIterations) {
        console.warn('BFS iteration limit reached, likely infinite loop prevented');
        endFlow(false);
        return;
    }
    
    if (foundEnd && finalPath) {
        animatePath(finalPath, 0);
    } else {
        endFlow(false);
    }
}

function animatePath(path, index) {
    if (index >= path.length) {
        endFlow(true);
        return;
    }
    
    const pos = path[index];
    const cell = document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"]`);
    if (cell) cell.classList.add('flowing');
    
    setTimeout(() => animatePath(path, index + 1), 200);
}

function resetFlow() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('flowing'));
}

function endFlow(won) {
    flowInProgress = false;
    startFlowBtn.disabled = false;
    
    if (won) {
        stopTimer();
        showMessage(true, elapsedTime);
        
        // Save to leaderboard with difficulty
        if (window.parent && window.parent.saveGameScore) {
            window.parent.saveGameScore("Pipe Mania", {
                bestTime: elapsedTime,
                difficulty: difficulty // 'easy', 'medium', or 'hard'
            }).then((result) => {
                console.log("Pipe Mania score saved successfully");
                if (result && result.isNewBest && window.parent.showNewBestScore) {
                    window.parent.showNewBestScore("Pipe Mania", { bestTime: elapsedTime, difficulty: difficulty });
                }
            }).catch(err => {
                console.error("Error saving Pipe Mania score:", err);
            });
        }
    } else {
        showMessage(false, 0);
    }
}

function startTimer() {
    startTime = Date.now();
    elapsedTime = 0;
    
    timerInterval = setInterval(() => {
        elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        updateTimerDisplay();
    }, 100);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timerDisplay.textContent = `${t('time')}: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showMessage(won, time) {
    messageOverlay.classList.remove('hidden');
    
    if (won) {
        messageTitle.textContent = t('youWon');
        messageTitle.className = 'win';
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        messageText.textContent = `${t('winMessage')} ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}!`;
    } else {
        messageTitle.textContent = t('youLose');
        messageTitle.className = 'lose';
        messageText.textContent = t('loseMessage');
    }
}

// Initialize
updateLanguage();
