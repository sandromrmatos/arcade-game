// Firebase configuration
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
let database = null;
try {
    firebase.initializeApp(firebaseConfig);
    database = firebase.database();
    console.log("Firebase Realtime Database initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
    console.error("Please ensure Firebase Realtime Database is enabled in your Firebase Console");
}

// Game state
let gameMode = null; // 'single' or 'multi'
let board = [];
let human = "X";
let pc = "O";
let gameOver = false;

// Multiplayer state
let currentRoom = null;
let playerName = null;
let playerId = null;
let playerSymbol = null;
let isPlayerReady = false;
let roomRef = null;
let gameRef = null;

// Winning combinations
const wins = [
    [0,1,2], [3,4,5], [6,7,8], // rows
    [0,3,6], [1,4,7], [2,5,8], // columns
    [0,4,8], [2,4,6]           // diagonals
];

// Get player name from parent window
function getPlayerName() {
    if (window.parent && window.parent.playerName) {
        return window.parent.playerName;
    }
    // Fallback
    let name = localStorage.getItem("arcadePlayerName");
    if (!name) {
        name = prompt("Please enter your name:");
        if (name) {
            localStorage.setItem("arcadePlayerName", name);
        }
    }
    return name || "Player";
}

// ============== MODE SELECTION ==============

function startSinglePlayer() {
    gameMode = 'single';
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('multiplayer-lobby').classList.add('hidden');
    document.getElementById('game-container').style.display = 'block';
    initSinglePlayerGame();
}

function showMultiplayerLobby() {
    gameMode = 'multi';
    playerName = getPlayerName();
    playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('multiplayer-lobby').style.display = 'block';
    document.getElementById('lobby-status').innerHTML = `<p>Welcome, ${playerName}!</p>`;
}

function backToModeSelection() {
    // Clean up multiplayer
    if (currentRoom && roomRef) {
        cleanupRoom();
    }
    
    // Reset state
    gameMode = null;
    currentRoom = null;
    isPlayerReady = false;
    gameOver = false;
    
    // Show mode selection
    document.getElementById('mode-selection').classList.remove('hidden');
    document.getElementById('multiplayer-lobby').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('ready-btn').classList.add('hidden');
    document.getElementById('room-input').value = '';
}

// ============== MULTIPLAYER ROOM MANAGEMENT ==============

function createRoom() {
    const roomCode = generateRoomCode();
    document.getElementById('room-input').value = roomCode;
    joinRoom();
}

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

async function joinRoom() {
    const roomCode = document.getElementById('room-input').value.trim().toUpperCase();
    
    if (!roomCode) {
        alert('Please enter a room code');
        return;
    }
    
    // Check if database is initialized
    if (!database) {
        alert('Firebase Realtime Database is not configured. Please check the console for details.');
        return;
    }
    
    currentRoom = roomCode;
    roomRef = database.ref('ticTacToe/rooms/' + roomCode);
    
    // Check if room exists and how many players
    const snapshot = await roomRef.once('value');
    const roomData = snapshot.val();
    
    if (roomData && roomData.players) {
        const playerCount = Object.keys(roomData.players).length;
        
        if (playerCount >= 2) {
            alert('Room is full!');
            currentRoom = null;
            return;
        }
        
        // Check if game is already in progress
        if (roomData.gameState && roomData.gameState.status === 'playing') {
            alert('Game already in progress in this room!');
            currentRoom = null;
            return;
        }
    }
    
    // Join the room
    await roomRef.child('players').child(playerId).set({
        name: playerName,
        ready: false,
        joinedAt: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Listen for room updates
    setupRoomListeners();
    
    // Show ready button
    document.getElementById('ready-btn').classList.remove('hidden');
    updateLobbyStatus();
}

function setupRoomListeners() {
    // Listen for player changes
    roomRef.child('players').on('value', (snapshot) => {
        updateLobbyStatus();
        checkIfBothReady();
    });
    
    // Listen for game state changes
    roomRef.child('gameState').on('value', (snapshot) => {
        const gameState = snapshot.val();
        if (gameState && gameState.status === 'playing') {
            startMultiplayerGame(gameState);
        }
    });
    
    // Listen for disconnections
    roomRef.child('players').child(playerId).onDisconnect().remove();
}

function updateLobbyStatus() {
    roomRef.child('players').once('value', (snapshot) => {
        const players = snapshot.val();
        if (!players) return;
        
        const playerList = Object.entries(players);
        let statusHTML = `<h4>Room: ${currentRoom}</h4>`;
        
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

function toggleReady() {
    isPlayerReady = !isPlayerReady;
    roomRef.child('players').child(playerId).update({
        ready: isPlayerReady
    });
    
    const btn = document.getElementById('ready-btn');
    btn.textContent = isPlayerReady ? 'Not Ready' : 'Ready';
}

async function checkIfBothReady() {
    const snapshot = await roomRef.child('players').once('value');
    const players = snapshot.val();
    
    if (!players) return;
    
    const playerList = Object.entries(players);
    
    if (playerList.length === 2) {
        const allReady = playerList.every(([id, player]) => player.ready);
        
        if (allReady) {
            // Assign symbols (first player is X, second is O)
            const player1Id = playerList[0][0];
            const player2Id = playerList[1][0];
            
            const gameState = {
                status: 'playing',
                board: ['', '', '', '', '', '', '', '', ''],
                currentTurn: player1Id,
                players: {
                    [player1Id]: {
                        name: playerList[0][1].name,
                        symbol: 'X'
                    },
                    [player2Id]: {
                        name: playerList[1][1].name,
                        symbol: 'O'
                    }
                },
                winner: null,
                gameOver: false
            };
            
            await roomRef.child('gameState').set(gameState);
        }
    }
}

function cleanupRoom() {
    if (roomRef && playerId) {
        roomRef.child('players').child(playerId).remove();
        roomRef.off();
        
        // Clean up empty rooms
        roomRef.once('value', (snapshot) => {
            const data = snapshot.val();
            if (!data || !data.players || Object.keys(data.players).length === 0) {
                roomRef.remove();
            }
        });
    }
}

// ============== SINGLE PLAYER GAME ==============

function initSinglePlayerGame() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    board = Array(9).fill("");

    gameOver = false;
    document.getElementById("message").textContent = "";
    document.getElementById("turn-indicator").textContent = "";

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;

        cell.addEventListener("click", () => {
            if (gameMode === 'single') {
                humanMove(i);
            }
        });

        boardDiv.appendChild(cell);
    }

    // Randomly choose who starts
    if (Math.random() < 0.5) {
        document.getElementById("message").textContent = "PC starts!";
        setTimeout(() => pcMove(), 500);
    } else {
        document.getElementById("message").textContent = "You start!";
    }
}

function humanMove(index) {
    if (gameOver || board[index] !== "") return;

    board[index] = human;
    updateBoard();

    if (checkWin(human)) {
        endGame("You win!", "win");
        return;
    }

    if (board.every(c => c !== "")) {
        endGame("Draw!", "draw");
        return;
    }

    pcMove();
}

function pcMove() {
    if (gameOver) return;

    // 1. Try to win
    let move = findBestMove(pc);
    if (move !== null) {
        board[move] = pc;
        updateBoard();
        if (checkWin(pc)) {
            endGame("PC wins!", "loss");
            return;
        }
        return;
    }

    // 2. Try to block human
    move = findBestMove(human);
    if (move !== null) {
        board[move] = pc;
        updateBoard();
        return;
    }

    // 3. Otherwise random move
    let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
    let random = empty[Math.floor(Math.random() * empty.length)];
    board[random] = pc;
    updateBoard();

    if (checkWin(pc)) {
        endGame("PC wins!", "loss");
        return;
    }

    if (board.every(c => c !== "")) {
        endGame("Draw!", "draw");
        return;
    }
}

function findBestMove(player) {
    for (let combo of wins) {
        const [a, b, c] = combo;
        const line = [board[a], board[b], board[c]];

        // If two are player and one is empty → winning/blocking move
        if (line.filter(v => v === player).length === 2 &&
            line.filter(v => v === "").length === 1) {
            return combo[line.indexOf("")];
        }
    }
    return null;
}

// ============== MULTIPLAYER GAME ==============

function startMultiplayerGame(gameState) {
    // Hide lobby, show game
    document.getElementById('multiplayer-lobby').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Set player symbol
    playerSymbol = gameState.players[playerId].symbol;
    
    // Initialize board
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";
    board = gameState.board;
    gameOver = false;

    for (let i = 0; i < 9; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;

        cell.addEventListener("click", () => {
            if (gameMode === 'multi') {
                multiplayerMove(i);
            }
        });

        boardDiv.appendChild(cell);
    }
    
    updateBoard();
    updateMultiplayerStatus(gameState);
    
    // Listen for game updates
    gameRef = roomRef.child('gameState');
    gameRef.on('value', (snapshot) => {
        const state = snapshot.val();
        if (state) {
            board = state.board;
            updateBoard();
            updateMultiplayerStatus(state);
            
            if (state.gameOver) {
                handleMultiplayerGameEnd(state);
            }
        }
    });
}

function multiplayerMove(index) {
    if (gameOver || board[index] !== "") return;
    
    // Check if it's player's turn
    gameRef.once('value', async (snapshot) => {
        const state = snapshot.val();
        
        if (state.currentTurn !== playerId || state.gameOver) {
            return;
        }
        
        // Make move
        const newBoard = [...state.board];
        newBoard[index] = playerSymbol;
        
        // Check for win or draw
        const winner = checkWinWithBoard(newBoard, playerSymbol);
        const isDraw = newBoard.every(c => c !== "");
        
        // Get other player ID
        const otherPlayerId = Object.keys(state.players).find(id => id !== playerId);
        
        // Update game state
        await gameRef.update({
            board: newBoard,
            currentTurn: otherPlayerId,
            winner: winner ? playerId : null,
            gameOver: winner || isDraw
        });
    });
}

function checkWinWithBoard(boardArray, symbol) {
    return wins.some(combo => combo.every(i => boardArray[i] === symbol));
}

function updateMultiplayerStatus(gameState) {
    const isMyTurn = gameState.currentTurn === playerId;
    const currentPlayerName = gameState.players[gameState.currentTurn].name;
    
    if (gameState.gameOver) {
        return;
    }
    
    if (isMyTurn) {
        document.getElementById("turn-indicator").textContent = "Your turn!";
        document.getElementById("message").textContent = "";
    } else {
        document.getElementById("turn-indicator").textContent = "";
        document.getElementById("message").textContent = `${currentPlayerName}'s turn`;
    }
}

function handleMultiplayerGameEnd(gameState) {
    gameOver = true;
    
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.classList.add("disabled"));
    
    let message;
    let result;
    
    if (gameState.winner) {
        const winnerName = gameState.players[gameState.winner].name;
        if (gameState.winner === playerId) {
            message = "You win!";
            result = "win";
        } else {
            message = `${winnerName} wins!`;
            result = "loss";
        }
    } else {
        message = "Draw!";
        result = "draw";
    }
    
    document.getElementById("message").textContent = message;
    document.getElementById("turn-indicator").textContent = "";
    
    // Save to leaderboard
    saveGameResult(result);
}

// ============== SHARED FUNCTIONS ==============

function updateBoard() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach((cell, i) => {
        cell.textContent = board[i];
    });
}

function checkWin(player) {
    return wins.some(combo => combo.every(i => board[i] === player));
}

function endGame(msg, result) {
    gameOver = true;
    document.getElementById("message").textContent = msg;
    document.getElementById("turn-indicator").textContent = "";

    // Disable board
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.classList.add("disabled"));

    // Save result
    saveGameResult(result);
}

function saveGameResult(result) {
    if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore("Tic Tac Toe", {
            result: result
        }).catch(err => {
            console.error("Error saving score:", err);
        });
    }
}

function resetGame() {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(cell => cell.classList.remove("disabled"));
    
    if (gameMode === 'single') {
        initSinglePlayerGame();
    } else if (gameMode === 'multi') {
        // In multiplayer, show option to play again
        if (confirm("Start a new game in this room?")) {
            // Reset ready status
            isPlayerReady = false;
            document.getElementById('ready-btn').textContent = 'Ready';
            
            // Reset room state
            roomRef.child('players').child(playerId).update({
                ready: false
            });
            
            // Clear game state
            roomRef.child('gameState').remove();
            
            // Go back to lobby
            if (gameRef) {
                gameRef.off();
            }
            document.getElementById('game-container').style.display = 'none';
            document.getElementById('multiplayer-lobby').style.display = 'block';
            updateLobbyStatus();
        }
    }
}

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (currentRoom && roomRef) {
        cleanupRoom();
    }
});
