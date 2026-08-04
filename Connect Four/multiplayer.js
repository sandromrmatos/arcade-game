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

let mpDatabase = null;
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    mpDatabase = firebase.database();
    console.log("Firebase initialized for Connect Four multiplayer");
} catch (error) {
    console.error("Firebase error:", error);
}

// ============== STATE ==============

let mpCurrentRoom = null;
let mpPlayerName = null;
let mpPlayerId = null;
let mpIsPlayerReady = false;
let mpRoomRef = null;
let mpPlayerColor = null; // 'red' or 'yellow'
let mpIsMyTurn = false;
let mpGameOver = false;

// Board state
const mpRows = 6;
const mpCols = 7;
let mpBoard = [];
let mpBoardElement = null;

// Language support
let mpCurrentLanguage = 'en';

const mpTranslations = {
    en: {
        singlePlayer: 'Single Player',
        multiplayer: 'Multiplayer',
        singlePlayerDesc: 'Play vs AI',
        multiplayerDesc: 'Play vs Friend',
        chooseModeText: 'Choose Game Mode:',
        enterRoomName: 'Enter room name',
        createRoom: 'Create Room',
        joinRoom: 'Join Room',
        back: 'Back',
        ready: 'Ready',
        welcome: 'Welcome',
        roomCreated: 'Room created! Room name:',
        waitingOpponent: 'Waiting for opponent...',
        joinedRoom: 'Joined room:',
        clickReady: 'Click Ready when you\'re ready!',
        players: 'Players',
        youAreReady: 'You are ready! Waiting for opponent...',
        yourTurn: 'Your Turn!',
        opponentTurn: '\'s Turn',
        youWon: 'You Won!',
        opponentWon: 'Won!',
        draw: 'It\'s a Draw!',
        playAgain: 'Play Again',
        leaveGame: 'Leave Game',
        enterRoomCode: 'Please enter a room name',
        roomExists: 'already exists! Choose a different name or join it.',
        roomNotFound: 'Room not found!',
        roomFull: 'Room is full!',
        youAre: 'You are',
        opponentIs: 'Opponent is',
        waitingForPlayers: 'Waiting for players...'
    },
    pt: {
        singlePlayer: 'Um Jogador',
        multiplayer: 'Multijogador',
        singlePlayerDesc: 'Jogar contra IA',
        multiplayerDesc: 'Jogar contra Amigo',
        chooseModeText: 'Escolha o Modo de Jogo:',
        enterRoomName: 'Digite o nome da sala',
        createRoom: 'Criar Sala',
        joinRoom: 'Entrar na Sala',
        back: 'Voltar',
        ready: 'Pronto',
        welcome: 'Bem-vindo',
        roomCreated: 'Sala criada! Nome da sala:',
        waitingOpponent: 'Esperando oponente...',
        joinedRoom: 'Entrou na sala:',
        clickReady: 'Clique em Pronto quando estiver pronto!',
        players: 'Jogadores',
        youAreReady: 'Você está pronto! Esperando oponente...',
        yourTurn: 'Sua Vez!',
        opponentTurn: 'Vez de',
        youWon: 'Você Ganhou!',
        opponentWon: 'Ganhou!',
        draw: 'Empate!',
        playAgain: 'Jogar Novamente',
        leaveGame: 'Sair do Jogo',
        enterRoomCode: 'Por favor, digite o nome da sala',
        roomExists: 'já existe! Escolha um nome diferente ou entre nela.',
        roomNotFound: 'Sala não encontrada!',
        roomFull: 'Sala está cheia!',
        youAre: 'Você é',
        opponentIs: 'Oponente é',
        waitingForPlayers: 'Esperando jogadores...'
    }
};

function mpT(key) {
    return mpTranslations[mpCurrentLanguage][key] || mpTranslations['en'][key] || key;
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

function updateAllTranslations() {
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = mpT(key);
    });
    
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        el.placeholder = mpT(key);
    });
}

// ============== HELPER FUNCTIONS ==============

function getPlayerName() {
    if (window.parent && window.parent.playerName) return window.parent.playerName;
    let name = localStorage.getItem("arcadePlayerName");
    if (!name) {
        name = prompt("Please enter your name:");
        if (name) localStorage.setItem("arcadePlayerName", name);
    }
    return name || "Player";
}

// ============== MENU NAVIGATION ==============

function showModeMenu() {
    if (mpCurrentRoom && mpRoomRef) {
        cleanupMultiplayerRoom();
    }
    
    mpGameOver = false;
    mpIsMyTurn = false;
    
    document.getElementById('modeMenu').style.display = 'flex';
    document.getElementById('menuOverlay').style.display = 'none';
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('container').style.display = 'none';
    document.getElementById('multiplayerContainer').style.display = 'none';
}

function showSinglePlayerMenu() {
    document.getElementById('modeMenu').style.display = 'none';
    document.getElementById('menuOverlay').style.display = 'flex';
}

function showMultiplayerMenu() {
    mpPlayerName = getPlayerName();
    mpPlayerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    document.getElementById('modeMenu').style.display = 'none';
    document.getElementById('multiplayerLobby').style.display = 'flex';
    document.getElementById('lobby-status').innerHTML = `<p>${mpT('welcome')}, ${mpPlayerName}!</p>`;
}

// ============== ROOM MANAGEMENT ==============

function createMultiplayerRoom() {
    const roomCode = document.getElementById('room-input').value.toUpperCase().trim();
    if (!roomCode) {
        alert(mpT('enterRoomCode'));
        return;
    }
    
    cleanupOldRooms();
    
    mpCurrentRoom = roomCode;
    mpRoomRef = mpDatabase.ref('connectFourRooms/' + mpCurrentRoom);
    
    mpRoomRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const room = snapshot.val();
            const roomAge = Date.now() - room.createdAt;
            const oneHour = 60 * 60 * 1000;
            
            if (roomAge > oneHour) {
                console.log('Room is old, deleting and recreating');
                mpRoomRef.remove().then(() => {
                    createRoom(roomCode);
                });
            } else {
                alert(`${mpT('room')} "${roomCode}" ${mpT('roomExists')}`);
            }
        } else {
            createRoom(roomCode);
        }
    });
}

function createRoom(roomCode) {
    mpCurrentRoom = roomCode;
    mpRoomRef = mpDatabase.ref('connectFourRooms/' + mpCurrentRoom);
    
    console.log('Creating room:', mpCurrentRoom);
    
    // Create proper 2D array for board
    const initialBoard = [];
    for (let r = 0; r < mpRows; r++) {
        initialBoard[r] = [];
        for (let c = 0; c < mpCols; c++) {
            initialBoard[r][c] = null;
        }
    }
    
    mpRoomRef.set({
        roomCode: mpCurrentRoom,
        createdAt: Date.now(),
        gameStarted: false,
        currentTurn: null,
        board: initialBoard,
        gameOver: false,
        winner: null,
        players: {
            [mpPlayerId]: {
                name: mpPlayerName,
                ready: false,
                color: null
            }
        }
    }).then(() => {
        console.log('Room created successfully');
        document.getElementById('lobby-status').innerHTML = `
            <p>${mpT('roomCreated')} <strong>${mpCurrentRoom}</strong></p>
            <p>${mpT('waitingOpponent')}</p>
        `;
        
        document.getElementById('mp-ready-btn').classList.remove('hidden');
        mpRoomRef.on('value', handleRoomUpdate);
    }).catch(error => {
        console.error('Error creating room:', error);
        alert('Error creating room: ' + error.message);
    });
}

function joinMultiplayerRoom() {
    const roomCode = document.getElementById('room-input').value.toUpperCase().trim();
    if (!roomCode) {
        alert(mpT('enterRoomCode'));
        return;
    }

    mpCurrentRoom = roomCode;
    mpRoomRef = mpDatabase.ref('connectFourRooms/' + mpCurrentRoom);

    mpRoomRef.once('value').then(snapshot => {
        if (!snapshot.exists()) {
            alert(mpT('roomNotFound'));
            return;
        }

        const room = snapshot.val();
        const playerCount = Object.keys(room.players || {}).length;

        if (playerCount >= 2) {
            alert(mpT('roomFull'));
            return;
        }

        mpRoomRef.child('players').child(mpPlayerId).set({
            name: mpPlayerName,
            ready: false,
            color: null
        }).then(() => {
            console.log('Successfully joined room');
            
            document.getElementById('lobby-status').innerHTML = `
                <p>${mpT('joinedRoom')} <strong>${mpCurrentRoom}</strong></p>
                <p>${mpT('clickReady')}</p>
            `;
            
            document.getElementById('mp-ready-btn').classList.remove('hidden');
            mpRoomRef.on('value', handleRoomUpdate);
        });
    }).catch(error => {
        console.error('Error joining room:', error);
        alert('Error: ' + error.message);
    });
}

function toggleMultiplayerReady() {
    document.getElementById('mp-ready-btn').classList.add('hidden');
    setReady();
}

function setReady() {
    if (!mpRoomRef) return;
    
    mpIsPlayerReady = true;
    mpRoomRef.child('players').child(mpPlayerId).update({
        ready: true
    });

    document.getElementById('lobby-status').innerHTML = `<p>${mpT('youAreReady')}</p>`;
}

function handleRoomUpdate(snapshot) {
    if (!snapshot.exists()) return;

    const room = snapshot.val();
    const players = room.players || {};
    const playerCount = Object.keys(players).length;

    if (room.gameStarted) {
        if (document.getElementById('multiplayerContainer').style.display === 'none') {
            startMultiplayerGame(room);
        } else {
            updateMultiplayerGame(room);
        }
        return;
    }

    let readyCount = 0;
    Object.values(players).forEach(p => {
        if (p.ready) readyCount++;
    });

    if (playerCount === 2 && readyCount === 2) {
        initializeMultiplayerGame();
    } else {
        document.getElementById('lobby-status').innerHTML = `
            <p>${mpT('players')}: ${playerCount}/2</p>
            <p>${mpT('ready')}: ${readyCount}/2</p>
            ${!mpIsPlayerReady ? `<p>${mpT('clickReady')}</p>` : `<p>${mpT('waitingOpponent')}</p>`}
        `;
    }
}

function cleanupOldRooms() {
    const roomsRef = mpDatabase.ref('connectFourRooms');
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    
    roomsRef.once('value').then(snapshot => {
        const rooms = snapshot.val();
        if (!rooms) return;
        
        Object.keys(rooms).forEach(roomCode => {
            const room = rooms[roomCode];
            const roomAge = now - room.createdAt;
            
            if (roomAge > oneHour) {
                console.log('Deleting old room:', roomCode);
                mpDatabase.ref('connectFourRooms/' + roomCode).remove();
            }
        });
    });
}

function cleanupMultiplayerRoom() {
    if (mpRoomRef) {
        mpRoomRef.off();
        if (mpPlayerId && mpCurrentRoom) {
            mpRoomRef.child('players').child(mpPlayerId).remove();
            
            mpRoomRef.child('players').once('value').then(snapshot => {
                const players = snapshot.val();
                const playerCount = players ? Object.keys(players).length : 0;
                
                if (playerCount === 0) {
                    mpRoomRef.remove();
                    console.log('Room deleted (empty)');
                }
            });
        }
    }
    mpCurrentRoom = null;
    mpRoomRef = null;
    mpIsPlayerReady = false;
}

function leaveMultiplayerGame() {
    cleanupMultiplayerRoom();
    showModeMenu();
}

// ============== GAME INITIALIZATION ==============

function initializeMultiplayerGame() {
    mpRoomRef.once('value').then(snapshot => {
        const room = snapshot.val();
        const players = room.players;
        const playerIds = Object.keys(players);
        
        // Assign colors - first player is red, second is yellow
        const updates = {};
        updates[`players/${playerIds[0]}/color`] = 'red';
        updates[`players/${playerIds[1]}/color`] = 'yellow';
        
        // Randomly decide who goes first
        const randomIndex = Math.floor(Math.random() * 2);
        updates['currentTurn'] = playerIds[randomIndex];
        updates['gameStarted'] = true;
        
        mpRoomRef.update(updates);
    });
}

function startMultiplayerGame(room) {
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('multiplayerContainer').style.display = 'block';
    
    const players = room.players;
    mpPlayerColor = players[mpPlayerId].color;
    
    initializeBoard();
    updateMultiplayerGame(room);
}

function initializeBoard() {
    mpBoardElement = document.getElementById('mp-board');
    mpBoardElement.innerHTML = '';
    mpBoardElement.style.display = 'grid';
    mpBoardElement.style.gridTemplateColumns = `repeat(${mpCols}, 60px)`;
    mpBoardElement.style.gridTemplateRows = `repeat(${mpRows}, 60px)`;
    mpBoardElement.style.gap = '5px';
    mpBoardElement.style.margin = '20px auto';
    mpBoardElement.style.width = 'fit-content';
    
    for (let row = 0; row < mpRows; row++) {
        for (let col = 0; col < mpCols; col++) {
            const cell = document.createElement('div');
            cell.className = 'mp-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(col));
            mpBoardElement.appendChild(cell);
        }
    }
}

function updateMultiplayerGame(room) {
    // Convert Firebase board object to proper 2D array
    if (room.board && typeof room.board === 'object') {
        mpBoard = [];
        for (let r = 0; r < mpRows; r++) {
            mpBoard[r] = [];
            for (let c = 0; c < mpCols; c++) {
                mpBoard[r][c] = room.board[r] && room.board[r][c] ? room.board[r][c] : null;
            }
        }
    } else {
        mpBoard = Array(mpRows).fill(null).map(() => Array(mpCols).fill(null));
    }
    
    mpGameOver = room.gameOver;
    
    // Update board display
    const cells = mpBoardElement.querySelectorAll('.mp-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const value = mpBoard[row][col];
        
        cell.className = 'mp-cell';
        if (value === 'red') {
            cell.classList.add('red');
        } else if (value === 'yellow') {
            cell.classList.add('yellow');
        }
    });
    
    // Update turn indicator
    const players = room.players;
    mpIsMyTurn = room.currentTurn === mpPlayerId;
    
    const playersList = Object.entries(players);
    const opponent = playersList.find(([id]) => id !== mpPlayerId);
    const opponentName = opponent ? opponent[1].name : 'Opponent';
    const opponentColor = opponent ? opponent[1].color : 'unknown';
    
    document.getElementById('mp-players').innerHTML = `
        <div>${mpT('youAre')} <span class="color-badge ${mpPlayerColor}">${mpPlayerColor}</span></div>
        <div>${mpT('opponentIs')} <span class="color-badge ${opponentColor}">${opponentColor}</span></div>
    `;
    
    if (mpGameOver) {
        if (room.winner) {
            const winnerName = players[room.winner].name;
            const isWinner = room.winner === mpPlayerId;
            document.getElementById('mp-currentPlayer').textContent = isWinner ? mpT('youWon') : `${winnerName} ${mpT('opponentWon')}`;
        } else {
            document.getElementById('mp-currentPlayer').textContent = mpT('draw');
        }
        document.getElementById('mp-message').innerHTML = `
            <button onclick="playAgain()" class="lobby-btn">${mpT('playAgain')}</button>
        `;
    } else {
        if (mpIsMyTurn) {
            document.getElementById('mp-currentPlayer').textContent = mpT('yourTurn');
        } else {
            // Handle Portuguese word order: "Vez de Sandro" instead of "Sandro Vez de"
            if (mpCurrentLanguage === 'pt') {
                document.getElementById('mp-currentPlayer').textContent = `${mpT('opponentTurn')} ${opponentName}`;
            } else {
                document.getElementById('mp-currentPlayer').textContent = `${opponentName}${mpT('opponentTurn')}`;
            }
        }
        document.getElementById('mp-message').textContent = '';
    }
}

// ============== GAMEPLAY ==============

function handleCellClick(col) {
    if (!mpIsMyTurn || mpGameOver) return;
    
    // Find lowest empty row in column
    let row = -1;
    for (let r = mpRows - 1; r >= 0; r--) {
        if (mpBoard[r][col] === null) {
            row = r;
            break;
        }
    }
    
    if (row === -1) return; // Column full
    
    // Make move
    mpBoard[row][col] = mpPlayerColor;
    
    // Check win
    const hasWon = checkWin(row, col, mpPlayerColor);
    const isDraw = checkDraw();
    
    const updates = {
        board: mpBoard
    };
    
    if (hasWon) {
        updates.gameOver = true;
        updates.winner = mpPlayerId;
    } else if (isDraw) {
        updates.gameOver = true;
        updates.winner = null;
    } else {
        // Switch turn
        const players = Object.keys(mpRoomRef.child('players'));
        mpRoomRef.child('players').once('value').then(snapshot => {
            const playerIds = Object.keys(snapshot.val());
            const nextPlayer = playerIds.find(id => id !== mpPlayerId);
            mpRoomRef.update({ ...updates, currentTurn: nextPlayer });
        });
        return;
    }
    
    mpRoomRef.update(updates);
}

function checkWin(row, col, color) {
    // Check horizontal
    let count = 1;
    for (let c = col - 1; c >= 0 && mpBoard[row][c] === color; c--) count++;
    for (let c = col + 1; c < mpCols && mpBoard[row][c] === color; c++) count++;
    if (count >= 4) return true;
    
    // Check vertical
    count = 1;
    for (let r = row - 1; r >= 0 && mpBoard[r][col] === color; r--) count++;
    for (let r = row + 1; r < mpRows && mpBoard[r][col] === color; r++) count++;
    if (count >= 4) return true;
    
    // Check diagonal (top-left to bottom-right)
    count = 1;
    for (let r = row - 1, c = col - 1; r >= 0 && c >= 0 && mpBoard[r][c] === color; r--, c--) count++;
    for (let r = row + 1, c = col + 1; r < mpRows && c < mpCols && mpBoard[r][c] === color; r++, c++) count++;
    if (count >= 4) return true;
    
    // Check diagonal (top-right to bottom-left)
    count = 1;
    for (let r = row - 1, c = col + 1; r >= 0 && c < mpCols && mpBoard[r][c] === color; r--, c++) count++;
    for (let r = row + 1, c = col - 1; r < mpRows && c >= 0 && mpBoard[r][c] === color; r++, c--) count++;
    if (count >= 4) return true;
    
    return false;
}

function checkDraw() {
    for (let col = 0; col < mpCols; col++) {
        if (mpBoard[0][col] === null) return false;
    }
    return true;
}

function playAgain() {
    mpRoomRef.once('value').then(snapshot => {
        const room = snapshot.val();
        const playerIds = Object.keys(room.players);
        
        // Keep same colors, switch who goes first
        const newFirstPlayer = room.currentTurn === playerIds[0] ? playerIds[1] : playerIds[0];
        
        // Create fresh board
        const freshBoard = [];
        for (let r = 0; r < mpRows; r++) {
            freshBoard[r] = [];
            for (let c = 0; c < mpCols; c++) {
                freshBoard[r][c] = null;
            }
        }
        
        mpRoomRef.update({
            board: freshBoard,
            currentTurn: newFirstPlayer,
            gameOver: false,
            winner: null
        });
    });
}

// ============== INITIALIZE ==============

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        mpCurrentLanguage = getParentLanguage();
        showModeMenu();
        updateAllTranslations();
    }, 100);
});

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'languageChange') {
        mpCurrentLanguage = event.data.language;
        updateAllTranslations();
    }
});
