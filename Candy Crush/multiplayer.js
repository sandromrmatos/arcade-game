// ============== FIREBASE CONFIGURATION ==============

const firebaseConfig = {
    apiKey: "AIzaSyDaxTpbasYOjVhm13D1Zi6lyqCatEqTn-M",
    authDomain: "arcade-sandro.firebaseapp.com",
    projectId: "arcade-sandro",
    databaseURL: "https://arcade-sandro-default-rtdb.firebaseio.com",
    storageBucket: "arcade-sandro.firebasestorage.app",
    messagingSenderId: "348759287679",
    appId: "1:348759287679:web:313c0f25e4227fa07a1c4a"
};

// Initialize Firebase
let mpDatabase = null;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    mpDatabase = firebase.database();
    console.log("Firebase Realtime Database initialized for Candy Crush multiplayer");
} catch (error) {
    console.error("Firebase initialization error:", error);
}

// ============== MULTIPLAYER STATE ==============

let mpGameMode = null; // 'single' or 'multi'
let mpCurrentRoom = null;
let mpPlayerName = null;
let mpPlayerId = null;
let mpPlayerSymbol = null;
let mpIsPlayerReady = false;
let mpRoomRef = null;
let mpGameRef = null;
let mpSelectedLevel = 1;

// Multiplayer game state
let mpYourBoard = [];
let mpOpponentBoard = [];
let mpYourScore = 0;
let mpOpponentScore = 0;
let mpTimerSeconds = 0;
let mpTimerInterval = null;
let mpGameOver = false;
let mpYourBoardElement = null;
let mpOpponentBoardElement = null;

// Throttle Firebase updates
let mpLastUpdateTime = 0;
let mpPendingUpdate = false;

// Game configuration for multiplayer
let mpWidth = 6;
let mpHeight = 6;
const mpNumColors = 6;
let mpDraggedId = null;
let mpReplacedId = null;
let mpSelectedTileId = null;

// ============== HELPER FUNCTIONS ==============

function getPlayerName() {
    if (window.parent && window.parent.playerName) {
        return window.parent.playerName;
    }
    let name = localStorage.getItem("arcadePlayerName");
    if (!name) {
        name = prompt("Please enter your name:");
        if (name) {
            localStorage.setItem("arcadePlayerName", name);
        }
    }
    return name || "Player";
}

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ============== MENU NAVIGATION ==============

function showModeMenu() {
    // Clean up any active multiplayer connection
    if (mpCurrentRoom && mpRoomRef) {
        cleanupMultiplayerRoom();
    }
    
    document.getElementById('modeMenu').style.display = 'flex';
    document.getElementById('levelMenu').style.display = 'none';
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('singlePlayerContainer').style.display = 'none';
    document.getElementById('multiplayerContainer').style.display = 'none';
}

function showSinglePlayerMenu() {
    mpGameMode = 'single';
    document.getElementById('modeMenu').style.display = 'none';
    document.getElementById('levelMenu').style.display = 'flex';
}

function showMultiplayerMenu() {
    mpGameMode = 'multi';
    mpPlayerName = getPlayerName();
    mpPlayerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    document.getElementById('modeMenu').style.display = 'none';
    document.getElementById('multiplayerLobby').style.display = 'flex';
    document.getElementById('lobby-status').innerHTML = `<p>Welcome, ${mpPlayerName}!</p>`;
}

// ============== ROOM MANAGEMENT ==============

function createMultiplayerRoom() {
    const roomCode = generateRoomCode();
    document.getElementById('room-input').value = roomCode;
    joinMultiplayerRoom();
}

async function joinMultiplayerRoom() {
    const roomCode = document.getElementById('room-input').value.trim().toUpperCase();
    
    if (!roomCode) {
        alert('Please enter a room code');
        return;
    }
    
    if (!mpDatabase) {
        alert('Firebase Realtime Database is not configured. Please check the console.');
        return;
    }
    
    mpSelectedLevel = parseInt(document.getElementById('mp-level-select').value);
    mpCurrentRoom = roomCode;
    mpRoomRef = mpDatabase.ref('candyCrush/rooms/' + roomCode);
    
    // Check if room exists and validate
    const snapshot = await mpRoomRef.once('value');
    const roomData = snapshot.val();
    
    if (roomData && roomData.players) {
        const playerCount = Object.keys(roomData.players).length;
        
        if (playerCount >= 2) {
            alert('Room is full!');
            mpCurrentRoom = null;
            return;
        }
        
        // Check if game is already in progress
        if (roomData.gameState && roomData.gameState.status === 'playing') {
            alert('Game already in progress in this room!');
            mpCurrentRoom = null;
            return;
        }
        
        // Check if level matches
        if (roomData.level && roomData.level !== mpSelectedLevel) {
            alert(`Room is set for Level ${roomData.level}. Please select the same level.`);
            mpCurrentRoom = null;
            return;
        }
    }
    
    // Join the room
    await mpRoomRef.child('level').set(mpSelectedLevel);
    await mpRoomRef.child('players').child(mpPlayerId).set({
        name: mpPlayerName,
        ready: false,
        joinedAt: firebase.database.ServerValue.TIMESTAMP
    });
    
    setupRoomListeners();
    document.getElementById('mp-ready-btn').classList.remove('hidden');
    updateLobbyStatus();
}

function setupRoomListeners() {
    mpRoomRef.child('players').on('value', (snapshot) => {
        updateLobbyStatus();
        checkIfBothReady();
    });
    
    mpRoomRef.child('gameState').on('value', (snapshot) => {
        const gameState = snapshot.val();
        if (gameState && gameState.status === 'playing') {
            startMultiplayerGame(gameState);
        }
    });
    
    mpRoomRef.child('players').child(mpPlayerId).onDisconnect().remove();
}

function updateLobbyStatus() {
    mpRoomRef.child('players').once('value', (snapshot) => {
        const players = snapshot.val();
        if (!players) return;
        
        const playerList = Object.entries(players);
        let statusHTML = `<h4>Room: ${mpCurrentRoom}</h4>`;
        statusHTML += `<h4>Level: ${mpSelectedLevel}</h4>`;
        
        playerList.forEach(([id, player]) => {
            const readyClass = player.ready ? 'ready' : '';
            const readyText = player.ready ? '✓ Ready' : 'Not Ready';
            statusHTML += `
                <div class="player-info ${readyClass}">
                    ${player.name} - ${readyText}
                </div>
            `;
        });
        
        if (playerList.length < 2) {
            statusHTML += '<p>Waiting for another player to join...</p>';
        }
        
        document.getElementById('lobby-status').innerHTML = statusHTML;
    });
}

function toggleMultiplayerReady() {
    mpIsPlayerReady = !mpIsPlayerReady;
    mpRoomRef.child('players').child(mpPlayerId).update({
        ready: mpIsPlayerReady
    });
    
    const btn = document.getElementById('mp-ready-btn');
    btn.textContent = mpIsPlayerReady ? 'Not Ready' : 'Ready';
}

async function checkIfBothReady() {
    const snapshot = await mpRoomRef.child('players').once('value');
    const players = snapshot.val();
    
    if (!players) return;
    
    const playerList = Object.entries(players);
    
    if (playerList.length === 2) {
        const allReady = playerList.every(([id, player]) => player.ready);
        
        if (allReady) {
            const player1Id = playerList[0][0];
            const player2Id = playerList[1][0];
            
            // Use LEVELS configuration from script.js
            const levelConfig = LEVELS[mpSelectedLevel];
            
            const gameState = {
                status: 'playing',
                level: mpSelectedLevel,
                timerStarted: firebase.database.ServerValue.TIMESTAMP,
                players: {
                    [player1Id]: {
                        name: playerList[0][1].name,
                        board: [],
                        score: 0
                    },
                    [player2Id]: {
                        name: playerList[1][1].name,
                        board: [],
                        score: 0
                    }
                },
                timeLimit: levelConfig.time,
                gameOver: false,
                winner: null
            };
            
            await mpRoomRef.child('gameState').set(gameState);
        }
    }
}

function cleanupMultiplayerRoom() {
    if (mpRoomRef && mpPlayerId) {
        mpRoomRef.child('players').child(mpPlayerId).remove();
        mpRoomRef.off();
        
        mpRoomRef.once('value', (snapshot) => {
            const data = snapshot.val();
            if (!data || !data.players || Object.keys(data.players).length === 0) {
                mpRoomRef.remove();
            }
        });
    }
    
    if (mpGameRef) {
        mpGameRef.off();
    }
    
    if (mpTimerInterval) {
        clearInterval(mpTimerInterval);
    }
}

// ============== MULTIPLAYER GAME ==============

function startMultiplayerGame(gameState) {
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('multiplayerContainer').style.display = 'block';
    
    mpSelectedLevel = gameState.level;
    const levelConfig = LEVELS[mpSelectedLevel];
    mpWidth = levelConfig.width;
    mpHeight = levelConfig.height;
    
    document.getElementById('mp-levelDisplay').textContent = mpSelectedLevel;
    
    // Set player names
    const opponentId = Object.keys(gameState.players).find(id => id !== mpPlayerId);
    document.getElementById('your-name').textContent = mpPlayerName;
    document.getElementById('opponent-name').textContent = gameState.players[opponentId].name;
    
    // Initialize game
    mpYourBoard = [];
    mpYourScore = 0;
    mpOpponentScore = 0;
    mpGameOver = false;
    
    mpYourBoardElement = document.getElementById('mp-your-board');
    
    // Generate initial board
    generateMultiplayerBoard();
    
    // Render your board
    renderMultiplayerBoard(mpYourBoard, mpYourBoardElement, true);
    
    // Hide opponent score during game - only show at end
    document.getElementById('opponent-score').textContent = '???';
    
    // Listen for game updates
    mpGameRef = mpRoomRef.child('gameState');
    
    mpGameRef.on('value', (snapshot) => {
        const state = snapshot.val();
        if (state && state.gameOver) {
            handleMultiplayerGameOver(state);
        }
    });
    
    // Start synchronized timer
    startMultiplayerTimer(gameState.timeLimit, gameState.timerStarted);
}

function generateMultiplayerBoard() {
    mpYourBoard.length = 0;
    const levelConfig = LEVELS[mpSelectedLevel];
    
    for (let i = 0; i < mpWidth * mpHeight; i++) {
        if (levelConfig.blockedCells.includes(i)) {
            mpYourBoard.push(-2);
        } else {
            mpYourBoard.push(mpGenerateCandy());
        }
    }
    
    let changed = true;
    while (changed) {
        changed = false;
        for (let y = 0; y < mpHeight; y++) {
            for (let x = 0; x < mpWidth; x++) {
                const idx = mpCoordToIndex(x, y);
                if (mpYourBoard[idx] === -1 || mpYourBoard[idx] === -2) continue;
                
                if (mpIsPartOfMatch(x, y, mpYourBoard)) {
                    let newColor;
                    do {
                        newColor = mpGenerateCandy();
                    } while (newColor === mpYourBoard[idx] || newColor === -1);
                    mpYourBoard[idx] = newColor;
                    changed = true;
                }
            }
        }
    }
}

function mpGenerateCandy() {
    const levelConfig = LEVELS[mpSelectedLevel];
    if (Math.random() < levelConfig.brokenGemChance) {
        return -1;
    }
    return Math.floor(Math.random() * mpNumColors);
}

function mpCoordToIndex(x, y) {
    return y * mpWidth + x;
}

function mpIndexToCoord(index) {
    return { x: index % mpWidth, y: Math.floor(index / mpWidth) };
}

function mpIsPartOfMatch(x, y, grid) {
    const idx = mpCoordToIndex(x, y);
    const color = grid[idx];
    
    let countH = 1;
    let i = x - 1;
    while (i >= 0 && grid[mpCoordToIndex(i, y)] === color) { countH++; i--; }
    i = x + 1;
    while (i < mpWidth && grid[mpCoordToIndex(i, y)] === color) { countH++; i++; }
    if (countH >= 3) return true;
    
    let countV = 1;
    let j = y - 1;
    while (j >= 0 && grid[mpCoordToIndex(x, j)] === color) { countV++; j--; }
    j = y + 1;
    while (j < mpHeight && grid[mpCoordToIndex(x, j)] === color) { countV++; j++; }
    return countV >= 3;
}

function renderMultiplayerBoard(board, boardElement, interactive) {
    boardElement.innerHTML = "";
    boardElement.className = `board grid-${mpWidth}x${mpHeight}`;
    if (!interactive) {
        boardElement.classList.add('opponent-view');
    }
    
    for (let i = 0; i < mpWidth * mpHeight; i++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        const color = board[i];
        
        if (color === null) {
            tile.classList.add("empty");
        } else if (color === -1) {
            tile.classList.add("broken");
            tile.innerHTML = '<div class="crack"></div>';
        } else if (color === -2) {
            tile.classList.add("blocked");
        } else {
            tile.classList.add(`color-${color}`);
        }
        
        if (interactive) {
            tile.setAttribute("draggable", !mpGameOver && color !== null && color !== -1 && color !== -2);
            tile.setAttribute("data-id", i);
            tile.addEventListener("dragstart", mpDragStart);
            tile.addEventListener("dragover", mpDragOver);
            tile.addEventListener("drop", mpDragDrop);
            tile.addEventListener("dragend", mpDragEnd);
            tile.addEventListener("click", mpTileClick);
        } else {
            tile.setAttribute("draggable", false);
        }
        
        boardElement.appendChild(tile);
    }
}

function mpTileClick(e) {
    if (mpGameOver) return;
    
    const clickedId = parseInt(e.target.closest('.tile').getAttribute("data-id"), 10);
    
    if (mpYourBoard[clickedId] === null || mpYourBoard[clickedId] === -1 || mpYourBoard[clickedId] === -2) return;
    
    if (mpSelectedTileId === null) {
        mpSelectedTileId = clickedId;
        const tiles = mpYourBoardElement.querySelectorAll(".tile");
        tiles[clickedId].classList.add("selected");
        return;
    }
    
    if (mpSelectedTileId === clickedId) {
        mpSelectedTileId = null;
        e.target.closest('.tile').classList.remove("selected");
        return;
    }
    
    const validMoves = mpGetAdjacentIndices(mpSelectedTileId);
    const isValidMove = validMoves.includes(clickedId);
    
    if (!isValidMove) {
        const tiles = mpYourBoardElement.querySelectorAll(".tile");
        tiles[mpSelectedTileId].classList.remove("selected");
        mpSelectedTileId = clickedId;
        tiles[clickedId].classList.add("selected");
        return;
    }
    
    const tiles = mpYourBoardElement.querySelectorAll(".tile");
    tiles[mpSelectedTileId].classList.remove("selected");
    
    const temp = mpYourBoard[mpSelectedTileId];
    mpYourBoard[mpSelectedTileId] = mpYourBoard[clickedId];
    mpYourBoard[clickedId] = temp;
    
    const matches = mpFindMatches(mpYourBoard);
    if (matches.length === 0) {
        mpYourBoard[clickedId] = mpYourBoard[mpSelectedTileId];
        mpYourBoard[mpSelectedTileId] = temp;
    } else {
        mpResolveMatches(matches);
    }
    
    renderMultiplayerBoard(mpYourBoard, mpYourBoardElement, true);
    mpSelectedTileId = null;
}

function mpDragStart(e) {
    mpDraggedId = parseInt(e.target.getAttribute("data-id"), 10);
}

function mpDragOver(e) {
    e.preventDefault();
}

function mpDragDrop(e) {
    mpReplacedId = parseInt(e.target.getAttribute("data-id"), 10);
}

function mpDragEnd() {
    if (mpDraggedId === null || mpReplacedId === null || mpGameOver) {
        mpDraggedId = null;
        mpReplacedId = null;
        return;
    }
    
    const validMoves = mpGetAdjacentIndices(mpDraggedId);
    if (!validMoves.includes(mpReplacedId)) {
        mpDraggedId = null;
        mpReplacedId = null;
        return;
    }
    
    const temp = mpYourBoard[mpDraggedId];
    mpYourBoard[mpDraggedId] = mpYourBoard[mpReplacedId];
    mpYourBoard[mpReplacedId] = temp;
    
    const matches = mpFindMatches(mpYourBoard);
    if (matches.length === 0) {
        mpYourBoard[mpReplacedId] = mpYourBoard[mpDraggedId];
        mpYourBoard[mpDraggedId] = temp;
    } else {
        mpResolveMatches(matches);
    }
    
    renderMultiplayerBoard(mpYourBoard, mpYourBoardElement, true);
    mpDraggedId = null;
    mpReplacedId = null;
}

function mpGetAdjacentIndices(index) {
    const { x, y } = mpIndexToCoord(index);
    const neighbors = [];
    if (x > 0) neighbors.push(mpCoordToIndex(x - 1, y));
    if (x < mpWidth - 1) neighbors.push(mpCoordToIndex(x + 1, y));
    if (y > 0) neighbors.push(mpCoordToIndex(x, y - 1));
    if (y < mpHeight - 1) neighbors.push(mpCoordToIndex(x, y + 1));
    return neighbors;
}

function mpFindMatches(board) {
    const matches = [];
    
    for (let y = 0; y < mpHeight; y++) {
        let runStart = 0;
        while (runStart < mpWidth) {
            const color = board[mpCoordToIndex(runStart, y)];
            if (color === null) {
                runStart++;
                continue;
            }
            let runEnd = runStart + 1;
            while (runEnd < mpWidth && board[mpCoordToIndex(runEnd, y)] === color) {
                runEnd++;
            }
            const length = runEnd - runStart;
            if (length >= 3) {
                const indices = [];
                for (let x = runStart; x < runEnd; x++) {
                    indices.push(mpCoordToIndex(x, y));
                }
                matches.push(indices);
            }
            runStart = runEnd;
        }
    }
    
    for (let x = 0; x < mpWidth; x++) {
        let runStart = 0;
        while (runStart < mpHeight) {
            const color = board[mpCoordToIndex(x, runStart)];
            if (color === null) {
                runStart++;
                continue;
            }
            let runEnd = runStart + 1;
            while (runEnd < mpHeight && board[mpCoordToIndex(x, runEnd)] === color) {
                runEnd++;
            }
            const length = runEnd - runStart;
            if (length >= 3) {
                const indices = [];
                for (let y = runStart; y < runEnd; y++) {
                    indices.push(mpCoordToIndex(x, y));
                }
                matches.push(indices);
            }
            runStart = runEnd;
        }
    }
    
    return matches;
}

function mpResolveMatches(matches) {
    if (matches.length === 0 || mpGameOver) return; // Stop if game is over
    
    let toClear = new Set();
    matches.forEach(group => {
        group.forEach(idx => toClear.add(idx));
        const len = group.length;
        let bonus = 0;
        if (len === 4) bonus = 10;
        else if (len >= 5) bonus = 25;
        mpYourScore += len * 10 + bonus;
    });
    
    if (mpSelectedLevel >= 2) {
        const adjacentBroken = new Set();
        toClear.forEach(idx => {
            const neighbors = mpGetAdjacentIndices(idx);
            neighbors.forEach(n => {
                if (mpYourBoard[n] === -1) {
                    adjacentBroken.add(n);
                }
            });
        });
        
        adjacentBroken.forEach(idx => {
            toClear.add(idx);
            mpYourScore += 20;
        });
    }
    
    // Update score display immediately
    document.getElementById('your-score').textContent = mpYourScore;
    console.log("Score after match:", mpYourScore);
    
    const tiles = mpYourBoardElement.querySelectorAll(".tile");
    toClear.forEach(idx => {
        const tile = tiles[idx];
        if (tile) tile.classList.add("explode");
    });
    
    setTimeout(() => {
        if (mpGameOver) return; // Don't process if game ended during animation
        
        toClear.forEach(idx => {
            mpYourBoard[idx] = null;
        });
        
        mpApplyGravity(mpYourBoard);
        mpRefillBoard(mpYourBoard);
        renderMultiplayerBoard(mpYourBoard, mpYourBoardElement, true);
        
        // Check for possible moves and shuffle if needed (like single player)
        if (!mpHasPossibleMoves()) {
            mpShuffleBoard();
        }
        
        // Check for new matches before updating Firebase
        const newMatches = mpFindMatches(mpYourBoard);
        if (newMatches.length > 0) {
            // Resolve chain reactions locally first
            mpResolveMatches(newMatches);
        }
        // No Firebase updates during game - only at end
    }, 450);
}

function mpApplyGravity(board) {
    for (let x = 0; x < mpWidth; x++) {
        const column = [];
        for (let y = 0; y < mpHeight; y++) {
            const idx = mpCoordToIndex(x, y);
            if (board[idx] !== null) {
                column.push(board[idx]);
            }
        }
        for (let y = mpHeight - 1; y >= 0; y--) {
            const idx = mpCoordToIndex(x, y);
            if (column.length > 0) {
                board[idx] = column.pop();
            } else {
                board[idx] = null;
            }
        }
    }
}

function mpRefillBoard(board) {
    const levelConfig = LEVELS[mpSelectedLevel];
    for (let i = 0; i < mpWidth * mpHeight; i++) {
        if (board[i] === null && !levelConfig.blockedCells.includes(i)) {
            board[i] = mpGenerateCandy();
        } else if (levelConfig.blockedCells.includes(i) && board[i] !== -2) {
            board[i] = -2;
        }
    }
}

// Check if any move is possible (same as single player)
function mpHasPossibleMoves() {
    for (let i = 0; i < mpWidth * mpHeight; i++) {
        if (mpYourBoard[i] === null || mpYourBoard[i] === -1 || mpYourBoard[i] === -2) continue;
        
        const neighbors = mpGetAdjacentIndices(i);
        
        for (const n of neighbors) {
            if (mpYourBoard[n] === null || mpYourBoard[n] === -1 || mpYourBoard[n] === -2) continue;
            
            const temp = mpYourBoard[i];
            mpYourBoard[i] = mpYourBoard[n];
            mpYourBoard[n] = temp;
            
            const matches = mpFindMatches(mpYourBoard);
            
            mpYourBoard[n] = mpYourBoard[i];
            mpYourBoard[i] = temp;
            
            if (matches.length > 0) return true;
        }
    }
    return false;
}

// Shuffle board (same as single player)
function mpShuffleBoard() {
    let attempts = 0;
    
    do {
        attempts++;
        
        const levelConfig = LEVELS[mpSelectedLevel];
        const movableCandies = [];
        const movableIndices = [];
        
        for (let i = 0; i < mpYourBoard.length; i++) {
            if (mpYourBoard[i] !== null && mpYourBoard[i] !== -1 && mpYourBoard[i] !== -2) {
                movableCandies.push(mpYourBoard[i]);
                movableIndices.push(i);
            }
        }
        
        for (let i = movableCandies.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = movableCandies[i];
            movableCandies[i] = movableCandies[j];
            movableCandies[j] = temp;
        }
        
        for (let i = 0; i < movableIndices.length; i++) {
            mpYourBoard[movableIndices[i]] = movableCandies[i];
        }
        
    } while ((!mpHasPossibleMoves() || mpFindMatches(mpYourBoard).length > 0) && attempts < 50);
    
    renderMultiplayerBoard(mpYourBoard, mpYourBoardElement, true);
}

// ============== TIMER ==============

function startMultiplayerTimer(timeLimit, startTimestamp) {
    clearInterval(mpTimerInterval);
    
    const timerElement = document.getElementById('mp-timer');
    let gameEndedTriggered = false; // Prevent multiple triggers
    
    mpTimerInterval = setInterval(async () => {
        if (gameEndedTriggered) {
            clearInterval(mpTimerInterval);
            return;
        }
        
        const serverSnapshot = await mpDatabase.ref('.info/serverTimeOffset').once('value');
        const offset = serverSnapshot.val() || 0;
        const now = Date.now() + offset;
        
        const snapshot = await mpRoomRef.child('gameState/timerStarted').once('value');
        const actualStartTime = snapshot.val();
        
        if (!actualStartTime) {
            clearInterval(mpTimerInterval);
            return;
        }
        
        const elapsed = Math.floor((now - actualStartTime) / 1000);
        mpTimerSeconds = timeLimit - elapsed;
        
        if (mpTimerSeconds <= 0 && !gameEndedTriggered) {
            gameEndedTriggered = true;
            mpTimerSeconds = 0;
            timerElement.textContent = "00:00";
            clearInterval(mpTimerInterval);
            
            // IMMEDIATELY stop the game and capture score
            mpGameOver = true;
            const finalScore = mpYourScore;
            
            // Disable all board interactions immediately
            renderMultiplayerBoard(mpYourBoard, mpYourBoardElement, false);
            
            console.log("Game Over! Final score captured:", finalScore);
            
            // Use transaction to only update if this score is higher (prevents zeros from overwriting)
            const scoreRef = mpRoomRef.child('gameState/players').child(mpPlayerId).child('finalScore');
            scoreRef.transaction((currentScore) => {
                // If no current score or new score is higher, update it
                if (currentScore === null || finalScore > currentScore) {
                    console.log("Updating score from", currentScore, "to", finalScore);
                    return finalScore;
                } else {
                    console.log("Keeping existing score", currentScore);
                    return currentScore; // Keep existing higher score
                }
            });
            
            // Mark as finished
            await mpRoomRef.child('gameState/players').child(mpPlayerId).update({
                finished: true,
                scoreTimestamp: firebase.database.ServerValue.TIMESTAMP
            });
            
            console.log("Score transaction completed");
            
            // Check if both players finished
            checkIfBothFinished();
        } else if (mpTimerSeconds > 0) {
            const m = Math.floor(mpTimerSeconds / 60);
            const s = mpTimerSeconds % 60;
            timerElement.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
        }
    }, 1000);
}

async function checkIfBothFinished() {
    const snapshot = await mpRoomRef.child('gameState/players').once('value');
    const players = snapshot.val();
    
    if (!players) return;
    
    const allFinished = Object.values(players).every(p => p.finished);
    
    if (allFinished) {
        const gameOverSnapshot = await mpRoomRef.child('gameState/gameOver').once('value');
        if (!gameOverSnapshot.val()) {
            await mpRoomRef.child('gameState').update({
                gameOver: true,
                endTime: firebase.database.ServerValue.TIMESTAMP
            });
        }
    }
}

function handleMultiplayerGameOver(gameState) {
    // Prevent multiple calls
    if (handleMultiplayerGameOver.alreadyCalled) {
        return;
    }
    handleMultiplayerGameOver.alreadyCalled = true;
    
    if (!mpGameOver) {
        mpGameOver = true;
        clearInterval(mpTimerInterval);
        renderMultiplayerBoard(mpYourBoard, mpYourBoardElement, false);
    }
    
    const messageEl = document.getElementById('mp-message');
    
    // Show calculating message first
    messageEl.innerHTML = `
        <div style="font-size: 24px; margin: 20px 0;">⏳ Calculating results...</div>
    `;
    
    // Wait 3 seconds for both scores to be written to Firebase
    setTimeout(() => {
        mpRoomRef.child('gameState/players').once('value', (snapshot) => {
            const players = snapshot.val();
            
            if (!players) {
                messageEl.innerHTML = '<div style="font-size: 24px; margin: 20px 0;">Error loading results</div>';
                return;
            }
            
            // Get both players' final scores - USE HIGHEST NON-ZERO SCORE
            const playersList = Object.entries(players);
            const yourData = playersList.find(([id]) => id === mpPlayerId);
            const opponentData = playersList.find(([id]) => id !== mpPlayerId);
            
            // Get highest score submitted (ignore zeros from multiple timer triggers)
            let yourFinalScore = 0;
            let opponentFinalScore = 0;
            
            if (yourData && yourData[1].finalScore) {
                yourFinalScore = yourData[1].finalScore;
            }
            
            if (opponentData && opponentData[1].finalScore) {
                opponentFinalScore = opponentData[1].finalScore;
            }
            
            const opponentName = opponentData ? opponentData[1].name : 'Opponent';
            
            console.log("Final scores retrieved - You:", yourFinalScore, "Opponent:", opponentFinalScore);
            
            // Update displayed scores
            document.getElementById('your-score').textContent = yourFinalScore;
            document.getElementById('opponent-score').textContent = opponentFinalScore;
            
            let message = '';
            let result = 'draw';
            
            if (yourFinalScore > opponentFinalScore) {
                message = `🎉 You Win! ${yourFinalScore} - ${opponentFinalScore}`;
                result = 'win';
            } else if (yourFinalScore < opponentFinalScore) {
                message = `😔 ${opponentName} Wins! ${yourFinalScore} - ${opponentFinalScore}`;
                result = 'loss';
            } else {
                message = `🤝 Draw! ${yourFinalScore} - ${opponentFinalScore}`;
                result = 'draw';
            }
            
            messageEl.innerHTML = `
                <div style="font-size: 24px; margin: 20px 0;">${message}</div>
                <button id="play-again-btn" class="lobby-btn ready" onclick="playAgain()" style="font-size: 18px; padding: 15px 30px;">
                    Play Again
                </button>
                <button class="lobby-btn back" onclick="leaveMultiplayerGame()" style="font-size: 18px; padding: 15px 30px; margin-left: 10px;">
                    Leave Game
                </button>
            `;
            
            if (window.parent && window.parent.saveGameScore) {
                window.parent.saveGameScore("Candy Crush", {
                    score: yourFinalScore,
                    difficulty: `level${mpSelectedLevel}`,
                    result: result
                }).catch(err => {
                    console.error("Error saving score:", err);
                });
            }
        });
    }, 3000);
}

async function playAgain() {
    // Reset the flag
    handleMultiplayerGameOver.alreadyCalled = false;
    
    // Reset ready status
    mpIsPlayerReady = false;
    
    // Clear game state but keep room
    await mpRoomRef.child('gameState').remove();
    
    // Reset players to not ready
    await mpRoomRef.child('players').child(mpPlayerId).update({
        ready: false
    });
    
    // Go back to lobby
    if (mpGameRef) {
        mpGameRef.off();
    }
    
    clearInterval(mpTimerInterval);
    
    document.getElementById('multiplayerContainer').style.display = 'none';
    document.getElementById('multiplayerLobby').style.display = 'flex';
    document.getElementById('mp-ready-btn').textContent = 'Ready';
    document.getElementById('mp-ready-btn').classList.remove('hidden');
    
    updateLobbyStatus();
}

function leaveMultiplayerGame() {
    handleMultiplayerGameOver.alreadyCalled = false;
    cleanupMultiplayerRoom();
    showModeMenu();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (mpCurrentRoom && mpRoomRef) {
        cleanupMultiplayerRoom();
    }
});
