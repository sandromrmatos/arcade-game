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
    console.log("Firebase initialized for Candy Crush multiplayer");
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

// Game state - completely local
let mpYourBoard = [];
let mpYourScore = 0;
let mpOpponentScore = 0;
let mpGameOver = false;
let mpYourBoardElement = null;

// Timer
let mpTimerInterval = null;
let mpTimeLeft = 0;

// Board settings
let mpWidth = 6;
let mpHeight = 6;
const mpNumColors = 6;
let mpDraggedId = null;
let mpReplacedId = null;
let mpSelectedTileId = null;

// ============== MENU NAVIGATION ==============

function getPlayerName() {
    if (window.parent && window.parent.playerName) {
        return window.parent.playerName;
    }
    let name = localStorage.getItem("arcadePlayerName");
    if (!name) {
        name = prompt("Please enter your name:");
        if (name) localStorage.setItem("arcadePlayerName", name);
    }
    return name || "Player";
}

function showModeMenu() {
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
    document.getElementById('modeMenu').style.display = 'none';
    document.getElementById('levelMenu').style.display = 'flex';
}

function showMultiplayerMenu() {
    mpPlayerName = getPlayerName();
    mpPlayerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    document.getElementById('modeMenu').style.display = 'none';
    document.getElementById('multiplayerLobby').style.display = 'flex';
    document.getElementById('lobby-status').innerHTML = `<p>Welcome, ${mpPlayerName}!</p>`;
}

function generateRoomCode() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}
