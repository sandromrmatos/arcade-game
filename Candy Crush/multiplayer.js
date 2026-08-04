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
} catch (error) {
    console.error("Firebase error:", error);
}

// ============== STATE ==============

let mpCurrentRoom = null;
let mpPlayerName = null;
let mpPlayerId = null;
let mpIsPlayerReady = false;
let mpRoomRef = null;
let mpSelectedLevel = 1;

// Local game state
let mpYourBoard = [];
let mpYourScore = 0;
let mpGameOver = false;
let mpYourBoardElement = null;
let mpTimerInterval = null;

let mpWidth = 6;
let mpHeight = 6;
const mpNumColors = 6;
let mpDraggedId = null;
let mpReplacedId = null;
let mpSelectedTileId = null;

// Language support
let mpCurrentLanguage = 'en';

const mpTranslations = {
    en: {
        singlePlayer: 'Single Player',
        multiplayer: 'Multiplayer',
        singlePlayerDesc: 'Play solo with timer',
        multiplayerDesc: 'Compete in real-time',
        selectLevel: 'Select Level:',
        backToMode: '← Back to Mode Selection',
        chooseLevel: 'Choose Level & Join Room',
        levelLabel: 'Select Level:',
        level1: 'Level 1 (6×6)',
        level2: 'Level 2 (8×8 + Broken Gems)',
        level3: 'Level 3 (8×8 + Blocked + Broken)',
        enterRoomName: 'Enter room name (e.g. room1)',
        createRoom: 'Create Room',
        joinRoom: 'Join Room',
        back: 'Back',
        ready: 'Ready',
        you: 'You',
        opponent: 'Opponent',
        score: 'Score',
        level: 'Level',
        time: 'Time',
        leaveGame: 'Leave Game',
        welcome: 'Welcome',
        roomCreated: 'Room created! Room name:',
        waitingOpponent: 'Waiting for opponent...',
        joinedRoom: 'Joined room:',
        clickReady: 'Click Ready when you\'re ready to play!',
        players: 'Players',
        youAreReady: 'You are ready! Waiting for opponent...',
        youWon: 'You Won!',
        opponentWon: 'Won!',
        draw: 'Draw!',
        yourScore: 'Your Score:',
        opponentScore: '\'s Score:',
        backToMenu: 'Back to Menu',
        enterRoomCode: 'Please enter a room name to create',
        roomExists: 'already exists! Please choose a different name or join the existing room.',
        room: 'Room',
        enterRoomToJoin: 'Please enter a room code',
        roomNotFound: 'Room not found! Make sure the code is correct:',
        roomFull: 'Room is full!'
    },
    pt: {
        singlePlayer: 'Um Jogador',
        multiplayer: 'Multijogador',
        singlePlayerDesc: 'Jogue sozinho com temporizador',
        multiplayerDesc: 'Compita em tempo real',
        selectLevel: 'Selecione o Nível:',
        backToMode: '← Voltar à Seleção de Modo',
        chooseLevel: 'Escolha o Nível e Entre na Sala',
        levelLabel: 'Selecione o Nível:',
        level1: 'Nível 1 (6×6)',
        level2: 'Nível 2 (8×8 + Gemas Quebradas)',
        level3: 'Nível 3 (8×8 + Bloqueadas + Quebradas)',
        enterRoomName: 'Digite o nome da sala (ex: sala1)',
        createRoom: 'Criar Sala',
        joinRoom: 'Entrar na Sala',
        back: 'Voltar',
        ready: 'Pronto',
        you: 'Você',
        opponent: 'Oponente',
        score: 'Pontuação',
        level: 'Nível',
        time: 'Tempo',
        leaveGame: 'Sair do Jogo',
        welcome: 'Bem-vindo',
        roomCreated: 'Sala criada! Nome da sala:',
        waitingOpponent: 'Esperando oponente...',
        joinedRoom: 'Entrou na sala:',
        clickReady: 'Clique em Pronto quando estiver pronto!',
        players: 'Jogadores',
        youAreReady: 'Você está pronto! Esperando oponente...',
        youWon: 'Você Ganhou!',
        opponentWon: 'Ganhou!',
        draw: 'Empate!',
        yourScore: 'Sua Pontuação:',
        opponentScore: 'Pontuação de ',
        backToMenu: 'Voltar ao Menu',
        enterRoomCode: 'Por favor, digite um nome para criar a sala',
        roomExists: 'já existe! Por favor, escolha um nome diferente ou entre na sala existente.',
        room: 'Sala',
        enterRoomToJoin: 'Por favor, digite um código de sala',
        roomNotFound: 'Sala não encontrada! Certifique-se que o código está correto:',
        roomFull: 'Sala está cheia!'
    }
};

function mpT(key) {
    return mpTranslations[mpCurrentLanguage][key] || mpTranslations['en'][key] || key;
}

function getParentLanguage() {
    try {
        // Try to get from parent's currentLanguage variable
        if (window.parent && window.parent.currentLanguage) {
            console.log('Got language from parent.currentLanguage:', window.parent.currentLanguage);
            return window.parent.currentLanguage;
        }
        
        // Try to get from parent's localStorage
        if (window.parent && window.parent.localStorage) {
            const lang = window.parent.localStorage.getItem('arcadeLanguage');
            if (lang) {
                console.log('Got language from parent.localStorage:', lang);
                return lang;
            }
        }
        
        // Fallback to own localStorage
        const localLang = localStorage.getItem('arcadeLanguage');
        if (localLang) {
            console.log('Got language from own localStorage:', localLang);
            return localLang;
        }
    } catch (e) {
        console.log('Error getting parent language:', e);
    }
    
    console.log('Defaulting to EN');
    return 'en';
}

function updateMultiplayerLanguage() {
    mpCurrentLanguage = getParentLanguage();
    
    // Update mode menu if visible
    const modeMenu = document.getElementById('modeMenu');
    if (modeMenu && modeMenu.style.display !== 'none') {
        const modeName = modeMenu.querySelector('.mode-name');
        if (modeName) {
            // Re-render would be complex, so we'll update on next show
        }
    }
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

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}


// ============== MENU NAVIGATION ==============

function showModeMenu() {
    // Clean up any active game
    if (mpTimerInterval) {
        clearInterval(mpTimerInterval);
        mpTimerInterval = null;
    }
    
    if (mpCurrentRoom && mpRoomRef) {
        cleanupMultiplayerRoom();
    }
    
    // Reset all game state
    mpGameOver = false;
    mpYourScore = 0;
    mpYourBoard = [];
    mpIsPlayerReady = false;
    
    document.getElementById('modeMenu').style.display = 'flex';
    document.getElementById('levelMenu').style.display = 'none';
    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('singlePlayerContainer').style.display = 'none';
    document.getElementById('multiplayerContainer').style.display = 'none';
}

function showSinglePlayerMenu() {
    document.getElementById('modeMenu').style.display = 'none';
    document.getElementById('levelMenu').style.display = 'flex';
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
    
    mpSelectedLevel = parseInt(document.getElementById('mp-level-select').value);
    
    // First, clean up old rooms (older than 1 hour)
    cleanupOldRooms();
    
    // Check if room already exists
    mpCurrentRoom = roomCode;
    mpRoomRef = mpDatabase.ref('candyCrushRooms/' + mpCurrentRoom);
    
    mpRoomRef.once('value').then(snapshot => {
        if (snapshot.exists()) {
            const room = snapshot.val();
            const roomAge = Date.now() - room.createdAt;
            const oneHour = 60 * 60 * 1000;
            
            // If room is older than 1 hour, delete it and recreate
            if (roomAge > oneHour) {
                console.log('Room', roomCode, 'is old, deleting and recreating');
                mpRoomRef.remove().then(() => {
                    createRoom(roomCode);
                });
            } else {
                alert(`${mpT('room')} "${roomCode}" ${mpT('roomExists')}`);
            }
        } else {
            // Room doesn't exist, create it
            createRoom(roomCode);
        }
    });
}

// Clean up rooms older than 1 hour
function cleanupOldRooms() {
    const roomsRef = mpDatabase.ref('candyCrushRooms');
    const oneHour = 60 * 60 * 1000;
    const now = Date.now();
    
    roomsRef.once('value').then(snapshot => {
        const rooms = snapshot.val();
        if (!rooms) return;
        
        Object.keys(rooms).forEach(roomCode => {
            const room = rooms[roomCode];
            const roomAge = now - room.createdAt;
            
            if (roomAge > oneHour) {
                console.log('Deleting old room:', roomCode, '(age:', Math.round(roomAge / 60000), 'minutes)');
                mpDatabase.ref('candyCrushRooms/' + roomCode).remove();
            }
        });
    });
}

function joinMultiplayerRoom() {
    mpSelectedLevel = parseInt(document.getElementById('mp-level-select').value);
    joinRoom();
}

function toggleMultiplayerReady() {
    document.getElementById('mp-ready-btn').classList.add('hidden');
    setReady();
}

function leaveMultiplayerGame() {
    if (mpTimerInterval) {
        clearInterval(mpTimerInterval);
        mpTimerInterval = null;
    }
    cleanupMultiplayerRoom();
    showModeMenu();
}

function createRoom(roomCode) {
    mpCurrentRoom = roomCode;
    
    mpRoomRef = mpDatabase.ref('candyCrushRooms/' + mpCurrentRoom);
    
    console.log('Creating room:', mpCurrentRoom);
    
    mpRoomRef.set({
        roomCode: mpCurrentRoom,
        createdAt: Date.now(),
        level: mpSelectedLevel,
        gameStarted: false,
        players: {
            [mpPlayerId]: {
                name: mpPlayerName,
                ready: false,
                score: null
            }
        }
    }).then(() => {
        console.log('Room created successfully in Firebase:', mpCurrentRoom);
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

function joinRoom() {
    const roomCode = document.getElementById('room-input').value.toUpperCase().trim();
    if (!roomCode) {
        alert(mpT('enterRoomToJoin'));
        return;
    }

    console.log('Attempting to join room:', roomCode);
    
    mpCurrentRoom = roomCode;
    mpRoomRef = mpDatabase.ref('candyCrushRooms/' + mpCurrentRoom);

    mpRoomRef.once('value').then(snapshot => {
        console.log('Room lookup result:', snapshot.exists() ? 'Found' : 'Not found');
        
        if (!snapshot.exists()) {
            alert(`${mpT('roomNotFound')} ${roomCode}`);
            console.error('Room does not exist:', roomCode);
            return;
        }

        const room = snapshot.val();
        console.log('Room data:', room);
        
        const playerCount = Object.keys(room.players || {}).length;

        if (playerCount >= 2) {
            alert(mpT('roomFull'));
            return;
        }

        mpRoomRef.child('players').child(mpPlayerId).set({
            name: mpPlayerName,
            ready: false,
            score: null
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
        alert('Error joining room: ' + error.message);
    });
}

function handleRoomUpdate(snapshot) {
    if (!snapshot.exists()) return;

    const room = snapshot.val();
    const players = room.players || {};
    const playerCount = Object.keys(players).length;

    if (room.gameStarted) {
        return;
    }

    let readyCount = 0;
    Object.values(players).forEach(p => {
        if (p.ready) readyCount++;
    });

    if (playerCount === 2 && readyCount === 2) {
        startMultiplayerGame(room.level);
    } else {
        document.getElementById('lobby-status').innerHTML = `
            <p>${mpT('players')}: ${playerCount}/2</p>
            <p>${mpT('ready')}: ${readyCount}/2</p>
            ${!mpIsPlayerReady ? `<p>${mpT('clickReady')}</p>` : `<p>${mpT('waitingOpponent')}</p>`}
        `;
    }
}

function setReady() {
    if (!mpRoomRef) return;
    
    mpIsPlayerReady = true;
    mpRoomRef.child('players').child(mpPlayerId).update({
        ready: true
    });

    document.getElementById('lobby-status').innerHTML = `<p>${mpT('youAreReady')}</p>`;
}

function cleanupMultiplayerRoom() {
    if (mpRoomRef) {
        mpRoomRef.off();
        if (mpPlayerId && mpCurrentRoom) {
            // Remove this player from the room
            mpRoomRef.child('players').child(mpPlayerId).remove();
            
            // Check if room is now empty and delete it
            mpRoomRef.child('players').once('value').then(snapshot => {
                const players = snapshot.val();
                const playerCount = players ? Object.keys(players).length : 0;
                
                if (playerCount === 0) {
                    // No players left, delete the entire room
                    mpRoomRef.remove();
                    console.log('Room', mpCurrentRoom, 'deleted (empty)');
                }
            });
        }
    }
    mpCurrentRoom = null;
    mpRoomRef = null;
    mpIsPlayerReady = false;
}

// ============== GAME START ==============

function startMultiplayerGame(level) {
    mpSelectedLevel = level;
    
    mpRoomRef.update({ gameStarted: true });
    mpRoomRef.off('value', handleRoomUpdate);

    document.getElementById('multiplayerLobby').style.display = 'none';
    document.getElementById('multiplayerContainer').style.display = 'flex';

    mpGameOver = false;
    mpYourScore = 0;
    
    initializeMultiplayerBoard();
    startMultiplayerTimer();
}

// ============== BOARD INITIALIZATION ==============

function initializeMultiplayerBoard() {
    // Set grid size based on level
    if (mpSelectedLevel === 1) {
        mpWidth = 6;
        mpHeight = 6;
    } else {
        mpWidth = 8;
        mpHeight = 8;
    }
    
    mpYourBoardElement = document.getElementById('mp-your-board');
    mpYourBoardElement.innerHTML = '';
    
    // Add proper CSS classes
    mpYourBoardElement.className = 'board';
    if (mpSelectedLevel === 1) {
        mpYourBoardElement.classList.add('grid-6x6');
    } else {
        mpYourBoardElement.classList.add('grid-8x8');
    }
    
    mpYourBoard = [];
    mpYourScore = 0;
    
    for (let i = 0; i < mpWidth * mpHeight; i++) {
        const tile = document.createElement('div');
        tile.classList.add('tile');
        tile.id = 'mp-' + i;
        
        const color = Math.floor(Math.random() * mpNumColors);
        
        // Use CSS classes like single player instead of inline styles
        tile.classList.add(`color-${color}`);
        tile.dataset.color = color;
        
        tile.draggable = true;
        tile.addEventListener('dragstart', mpDragStart);
        tile.addEventListener('dragover', mpDragOver);
        tile.addEventListener('drop', mpDragDrop);
        tile.addEventListener('dragend', mpDragEnd);
        tile.addEventListener('click', mpTileClick);
        
        mpYourBoard.push(color);
        mpYourBoardElement.appendChild(tile);
    }

    document.getElementById('your-score').textContent = '0';
    document.getElementById('mp-levelDisplay').textContent = mpSelectedLevel;
    
    console.log('Board initialized with', mpWidth, 'x', mpHeight, 'grid');
    
    // Clear initial matches WITHOUT scoring
    setTimeout(() => {
        let clearedInitial = false;
        while (checkForMatchesMP()) {
            clearMatchesMP(true); // Pass true to skip scoring
            slideDownMP();
            generateNewTilesMP();
            clearedInitial = true;
        }
        // Reset score after clearing initial matches
        if (clearedInitial) {
            mpYourScore = 0;
            document.getElementById('your-score').textContent = '0';
            console.log('Initial matches cleared, score reset to 0');
        }
        updateBoardDisplayMP();
    }, 100);
}

function getColorForValue(value) {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
    return colors[value] || '#CCCCCC';
}

function getColorForValue(value) {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];
    return colors[value] || '#CCCCCC';
}

// ============== TIMER ==============

function startMultiplayerTimer() {
    const levelTimes = [60, 90, 120];
    let timeLeft = levelTimes[mpSelectedLevel - 1] || 60;
    
    document.getElementById('mp-timer').textContent = formatTime(timeLeft);

    mpTimerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('mp-timer').textContent = formatTime(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(mpTimerInterval);
            mpTimerInterval = null;
            endMultiplayerGame();
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============== GAME END ==============

function endMultiplayerGame() {
    mpGameOver = true;
    
    // Stop all interactions
    const tiles = mpYourBoardElement.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.draggable = false;
        tile.style.pointerEvents = 'none';
    });

    console.log('🏁 Game Over! Final score:', mpYourScore);

    // Submit score to Firebase
    mpRoomRef.child('players').child(mpPlayerId).update({
        score: mpYourScore
    }).then(() => {
        console.log('✅ Score submitted:', mpYourScore);
        
        // Wait 3 seconds then show results
        setTimeout(() => {
            fetchFinalScores();
        }, 3000);
    });
}

function fetchFinalScores() {
    mpRoomRef.child('players').once('value').then(snapshot => {
        const players = snapshot.val();
        const playersList = Object.values(players);
        
        const you = players[mpPlayerId];
        const opponent = playersList.find(p => p.name !== mpPlayerName);

        const yourScore = you?.score || 0;
        const opponentScore = opponent?.score || 0;

        console.log('Final scores - You:', yourScore, 'Opponent:', opponentScore);

        showResultScreen(yourScore, opponentScore, opponent?.name || 'Opponent');
    });
}

function showResultScreen(yourScore, opponentScore, opponentName) {
    let resultText = '';
    if (yourScore > opponentScore) {
        resultText = `🎉 ${mpT('youWon')} ${yourScore} - ${opponentScore}`;
    } else if (opponentScore > yourScore) {
        resultText = `😔 ${opponentName} ${mpT('opponentWon')} ${opponentScore} - ${yourScore}`;
    } else {
        resultText = `🤝 ${mpT('draw')} ${yourScore} - ${opponentScore}`;
    }

    document.getElementById('multiplayerContainer').innerHTML = `
        <div style="text-align: center; padding: 50px; color: white;">
            <h1>${resultText}</h1>
            <p>${mpT('yourScore')} ${yourScore}</p>
            <p>${opponentName}${mpT('opponentScore')} ${opponentScore}</p>
            <button onclick="showModeMenu()" style="margin-top: 30px; padding: 15px 30px; font-size: 18px; cursor: pointer;">
                ${mpT('backToMenu')}
            </button>
        </div>
    `;
    
    // Clean up room after a delay (give both players time to see results)
    setTimeout(() => {
        if (mpRoomRef && mpCurrentRoom) {
            mpRoomRef.child('players').child(mpPlayerId).remove();
            console.log('Left room after game ended');
        }
    }, 5000); // 5 seconds to view results
}

// ============== DRAG & DROP ==============

function mpDragStart() {
    if (mpGameOver) return;
    mpDraggedId = this.id;
}

function mpDragOver(e) {
    e.preventDefault();
}

function mpDragDrop() {
    if (mpGameOver) return;
    mpReplacedId = this.id;
}

function mpDragEnd() {
    if (mpGameOver || !mpDraggedId || !mpReplacedId) return;

    const draggedIndex = parseInt(mpDraggedId.split('-')[1]);
    const replacedIndex = parseInt(mpReplacedId.split('-')[1]);

    if (!isAdjacentMP(draggedIndex, replacedIndex)) {
        mpDraggedId = null;
        mpReplacedId = null;
        return;
    }

    swapTilesMP(draggedIndex, replacedIndex);
    mpDraggedId = null;
    mpReplacedId = null;
}

function mpTileClick() {
    if (mpGameOver) return;
    
    const clickedIndex = parseInt(this.id.split('-')[1]);

    if (mpSelectedTileId === null) {
        mpSelectedTileId = clickedIndex;
        this.style.border = '3px solid yellow';
    } else {
        if (isAdjacentMP(mpSelectedTileId, clickedIndex)) {
            swapTilesMP(mpSelectedTileId, clickedIndex);
        }
        
        document.getElementById('mp-' + mpSelectedTileId).style.border = 'none';
        mpSelectedTileId = null;
    }
}

function isAdjacentMP(index1, index2) {
    const row1 = Math.floor(index1 / mpWidth);
    const col1 = index1 % mpWidth;
    const row2 = Math.floor(index2 / mpWidth);
    const col2 = index2 % mpWidth;

    return (Math.abs(row1 - row2) === 1 && col1 === col2) ||
           (Math.abs(col1 - col2) === 1 && row1 === row2);
}

function swapTilesMP(index1, index2) {
    const temp = mpYourBoard[index1];
    mpYourBoard[index1] = mpYourBoard[index2];
    mpYourBoard[index2] = temp;

    updateBoardDisplayMP();

    if (!checkForMatchesMP()) {
        mpYourBoard[index2] = mpYourBoard[index1];
        mpYourBoard[index1] = temp;
        updateBoardDisplayMP();
        return;
    }

    setTimeout(() => processMatchesMP(), 300);
}

function processMatchesMP() {
    if (mpGameOver) return;
    
    if (checkForMatchesMP()) {
        clearMatchesMP();
        slideDownMP();
        generateNewTilesMP();
        updateBoardDisplayMP();
        setTimeout(() => processMatchesMP(), 300);
    } else {
        // After all matches resolved, check if there are possible moves
        if (!hasPossibleMovesMP()) {
            console.log('No possible moves, shuffling board...');
            shuffleBoardMP();
        }
    }
}

// Check if there are any possible moves (like single player)
function hasPossibleMovesMP() {
    // Try swapping each adjacent pair and see if it creates a match
    for (let i = 0; i < mpYourBoard.length; i++) {
        if (mpYourBoard[i] === null) continue;
        
        const row = Math.floor(i / mpWidth);
        const col = i % mpWidth;
        
        // Try swapping right
        if (col < mpWidth - 1 && mpYourBoard[i + 1] !== null) {
            // Swap
            const temp = mpYourBoard[i];
            mpYourBoard[i] = mpYourBoard[i + 1];
            mpYourBoard[i + 1] = temp;
            
            // Check if this creates a match
            if (checkForMatchesMP()) {
                // Swap back
                mpYourBoard[i + 1] = mpYourBoard[i];
                mpYourBoard[i] = temp;
                return true;
            }
            
            // Swap back
            mpYourBoard[i + 1] = mpYourBoard[i];
            mpYourBoard[i] = temp;
        }
        
        // Try swapping down
        if (row < mpHeight - 1 && mpYourBoard[i + mpWidth] !== null) {
            // Swap
            const temp = mpYourBoard[i];
            mpYourBoard[i] = mpYourBoard[i + mpWidth];
            mpYourBoard[i + mpWidth] = temp;
            
            // Check if this creates a match
            if (checkForMatchesMP()) {
                // Swap back
                mpYourBoard[i + mpWidth] = mpYourBoard[i];
                mpYourBoard[i] = temp;
                return true;
            }
            
            // Swap back
            mpYourBoard[i + mpWidth] = mpYourBoard[i];
            mpYourBoard[i] = temp;
        }
    }
    
    return false;
}

// Shuffle board when no moves are possible (like single player)
function shuffleBoardMP() {
    let attempts = 0;
    
    do {
        attempts++;
        
        // Get all non-null tiles
        const movableCandies = [];
        const movableIndices = [];
        
        for (let i = 0; i < mpYourBoard.length; i++) {
            if (mpYourBoard[i] !== null) {
                movableCandies.push(mpYourBoard[i]);
                movableIndices.push(i);
            }
        }
        
        // Shuffle array
        for (let i = movableCandies.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = movableCandies[i];
            movableCandies[i] = movableCandies[j];
            movableCandies[j] = temp;
        }
        
        // Put shuffled candies back
        for (let i = 0; i < movableIndices.length; i++) {
            mpYourBoard[movableIndices[i]] = movableCandies[i];
        }
        
    } while ((!hasPossibleMovesMP() || checkForMatchesMP()) && attempts < 50);
    
    updateBoardDisplayMP();
    console.log('Board shuffled after', attempts, 'attempts');
}

// ============== MATCH DETECTION ==============

function checkForMatchesMP() {
    let hasMatch = false;

    // Check horizontal
    for (let row = 0; row < mpHeight; row++) {
        for (let col = 0; col < mpWidth - 2; col++) {
            const idx = row * mpWidth + col;
            if (mpYourBoard[idx] !== null &&
                mpYourBoard[idx] === mpYourBoard[idx + 1] &&
                mpYourBoard[idx] === mpYourBoard[idx + 2]) {
                hasMatch = true;
            }
        }
    }

    // Check vertical
    for (let col = 0; col < mpWidth; col++) {
        for (let row = 0; row < mpHeight - 2; row++) {
            const idx = row * mpWidth + col;
            if (mpYourBoard[idx] !== null &&
                mpYourBoard[idx] === mpYourBoard[idx + mpWidth] &&
                mpYourBoard[idx] === mpYourBoard[idx + 2 * mpWidth]) {
                hasMatch = true;
            }
        }
    }

    return hasMatch;
}

function clearMatchesMP(skipScoring = false) {
    let clearedCount = 0;
    let toClear = new Set();

    // Find and mark horizontal matches
    for (let row = 0; row < mpHeight; row++) {
        for (let col = 0; col < mpWidth - 2; col++) {
            const idx = row * mpWidth + col;
            if (mpYourBoard[idx] !== null &&
                mpYourBoard[idx] === mpYourBoard[idx + 1] &&
                mpYourBoard[idx] === mpYourBoard[idx + 2]) {
                
                // Count the length of the match
                let matchLength = 3;
                toClear.add(idx);
                toClear.add(idx + 1);
                toClear.add(idx + 2);
                
                // Check for 4+ matches
                let checkCol = col + 3;
                while (checkCol < mpWidth && mpYourBoard[row * mpWidth + checkCol] === mpYourBoard[idx]) {
                    toClear.add(row * mpWidth + checkCol);
                    matchLength++;
                    checkCol++;
                }
            }
        }
    }

    // Find and mark vertical matches
    for (let col = 0; col < mpWidth; col++) {
        for (let row = 0; row < mpHeight - 2; row++) {
            const idx = row * mpWidth + col;
            if (mpYourBoard[idx] !== null &&
                mpYourBoard[idx] === mpYourBoard[idx + mpWidth] &&
                mpYourBoard[idx] === mpYourBoard[idx + 2 * mpWidth]) {
                
                toClear.add(idx);
                toClear.add(idx + mpWidth);
                toClear.add(idx + 2 * mpWidth);
                
                // Check for 4+ matches
                let checkRow = row + 3;
                while (checkRow < mpHeight && mpYourBoard[checkRow * mpWidth + col] === mpYourBoard[idx]) {
                    toClear.add(checkRow * mpWidth + col);
                    checkRow++;
                }
            }
        }
    }

    // Clear the marked tiles
    toClear.forEach(idx => {
        mpYourBoard[idx] = null;
        clearedCount++;
    });

    // Score exactly like single player
    if (clearedCount > 0 && !skipScoring) {
        let baseScore = clearedCount * 10;
        let bonus = 0;
        
        // Bonus for longer matches (like single player)
        if (clearedCount === 4) bonus = 10;
        else if (clearedCount >= 5) bonus = 25;
        
        mpYourScore += baseScore + bonus;
        document.getElementById('your-score').textContent = mpYourScore;
        console.log('Score after match:', mpYourScore, '(', clearedCount, 'tiles,', bonus, 'bonus)');
    }
}

function slideDownMP() {
    for (let col = 0; col < mpWidth; col++) {
        let emptySpaces = 0;
        for (let row = mpHeight - 1; row >= 0; row--) {
            const idx = row * mpWidth + col;
            if (mpYourBoard[idx] === null) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                const newIdx = (row + emptySpaces) * mpWidth + col;
                mpYourBoard[newIdx] = mpYourBoard[idx];
                mpYourBoard[idx] = null;
            }
        }
    }
}

function generateNewTilesMP() {
    for (let col = 0; col < mpWidth; col++) {
        for (let row = 0; row < mpHeight; row++) {
            const idx = row * mpWidth + col;
            if (mpYourBoard[idx] === null) {
                mpYourBoard[idx] = Math.floor(Math.random() * mpNumColors);
            }
        }
    }
}

function updateBoardDisplayMP() {
    for (let i = 0; i < mpYourBoard.length; i++) {
        const tile = document.getElementById('mp-' + i);
        if (tile && mpYourBoard[i] !== null) {
            // Remove all color classes first
            tile.className = 'tile';
            // Add the correct color class
            tile.classList.add(`color-${mpYourBoard[i]}`);
            tile.dataset.color = mpYourBoard[i];
        }
    }
}

// ============== INITIALIZE ==============

window.addEventListener('DOMContentLoaded', () => {
    // Get language from parent with delay to ensure parent is ready
    setTimeout(() => {
        mpCurrentLanguage = getParentLanguage();
        showModeMenu();
        updateAllTranslations();
    }, 100);
});

// Listen for language changes from parent
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'languageChange') {
        mpCurrentLanguage = event.data.language;
        updateAllTranslations();
    }
});

function updateAllTranslations() {
    console.log('Updating translations to:', mpCurrentLanguage);
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        el.textContent = mpT(key);
    });
    
    // Update placeholders
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        el.placeholder = mpT(key);
    });
    
    // Update select options
    document.querySelectorAll('option[data-translate]').forEach(option => {
        const key = option.getAttribute('data-translate');
        option.textContent = mpT(key);
    });
}
