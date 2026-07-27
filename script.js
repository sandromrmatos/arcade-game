// Load game into iframe
function loadGame(name) {
  const frame = document.getElementById("game-frame");
  frame.src = name === "home" ? "home.html" : `launch.html?game=${name}`;
}

// Firebase SDKs loaded from CDN
// Check if firebase is available, if not load it
function loadFirebaseSDKs() {
  return new Promise((resolve, reject) => {
    if (window.firebase) {
      resolve();
      return;
    }
    
    const scripts = [
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics-compat.js',
      'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js'
    ];
    
    let loaded = 0;
    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        loaded++;
        if (loaded === scripts.length) resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load Firebase: ${src}`));
      document.head.appendChild(script);
    });
  });
}

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDaxTpbasYOjVhm13D1Zi6lyqCatEqTn-M",
  authDomain: "arcade-sandro.firebaseapp.com",
  projectId: "arcade-sandro",
  storageBucket: "arcade-sandro.firebasestorage.app",
  messagingSenderId: "348759287679",
  appId: "1:348759287679:web:313c0f25e4227fa07a1c4a",
  measurementId: "G-522Q4LT500"
};

// Firebase initialization
let firebaseApp = null;
let firebaseAnalytics = null;
let firebaseDb = null;

async function initFirebase() {
  if (!firebaseApp) {
    await loadFirebaseSDKs();
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseAnalytics = firebase.analytics();
    firebaseDb = firebase.firestore();
  }
  return { app: firebaseApp, analytics: firebaseAnalytics, db: firebaseDb };
}

// Player name management
let playerName = localStorage.getItem("arcadePlayerName");
let nameResolver = null;

// Player name input handler - setup once
const setupNameModal = () => {
  const modal = document.getElementById("name-modal");
  const input = document.getElementById("player-name-input");
  const saveBtn = document.getElementById("save-name-btn");
  
  if (modal.dataset.setup === "true") return;
  
  saveBtn.onclick = () => {
    const name = input.value;
    if (!name || name.trim() === "") {
      alert("Please enter a name to continue!");
      return;
    }
    
    playerName = name.trim();
    localStorage.setItem("arcadePlayerName", playerName);
    
    // Save to Firebase
    const { db } = initFirebase();
    db.collection("players").doc(playerName).set({
      name: playerName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.error("Error saving player:", err));
    
    modal.classList.add("hidden");
    input.value = "";
    
    // Resolve any pending promises
    if (nameResolver) {
      nameResolver(playerName);
      nameResolver = null;
    }
  };
  
  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      saveBtn.onclick();
    }
  };
  
  modal.dataset.setup = "true";
};

function showNameModal() {
  setupNameModal();
  
  const modal = document.getElementById("name-modal");
  const input = document.getElementById("player-name-input");
  
  input.value = "";
  input.focus();
  modal.classList.remove("hidden");
  input.select();
}

function getPlayerName() {
  if (playerName) {
    return Promise.resolve(playerName);
  }
  
  return new Promise(resolve => {
    nameResolver = resolve;
    showNameModal();
  });
}

// Leaderboard functions
function showLeaderboard() {
  const section = document.getElementById("leaderboard-section");
  const gameList = document.getElementById("leaderboard-game-list");
  
  // Clear existing list
  gameList.innerHTML = "";
  
  // Build game list buttons
  fetch("games.json").then(res => res.json()).then(data => {
    data.games.forEach(folder => {
      const btn = document.createElement("button");
      btn.className = "leaderboard-game-btn";
      
      const img = document.createElement("img");
      img.src = `icons/${folder}.png`;
      img.className = "leaderboard-game-icon";
      
      const span = document.createElement("span");
      span.textContent = folder;
      
      btn.appendChild(img);
      btn.appendChild(span);
      btn.onclick = () => showGameLeaderboard(folder);
      
      gameList.appendChild(btn);
    });
  });
  
  section.classList.remove("hidden");
}

function showGameLeaderboard(gameName) {
  const section = document.getElementById("leaderboard-section");
  section.innerHTML = `
    <div class="leaderboard-content" id="game-leaderboard-page">
      <h2>${gameName} Leaderboard</h2>
      <div id="leaderboard-content"></div>
      <button class="back-to-leaderboard-btn" onclick="showLeaderboard()">← Back to Leaderboards</button>
    </div>
  `;
  
  document.getElementById("leaderboard-content").textContent = "Loading scores...";
  
  // Load scores from Firebase
  const { db } = initFirebase();
  
  // Get scores sorted by time (ascending - lowest time is best)
  db.collection("games")
    .where("gameName", "==", gameName)
    .orderBy("bestTime", "asc")
    .limit(10)
    .get()
    .then(snapshot => {
      const content = document.getElementById("leaderboard-content");
      
      if (snapshot.empty) {
        content.textContent = "No scores yet. Be the first!";
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Best Time</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      snapshot.forEach(doc => {
        const data = doc.data();
        const timeFormatted = formatTime(data.bestTime);
        const date = new Date(data.timestamp).toLocaleDateString();
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${data.playerName}</td>
          <td>${timeFormatted}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      document.getElementById("leaderboard-content").textContent = "Error loading scores: " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Close leaderboard section when clicking back to menu
document.addEventListener("click", (e) => {
  if (e.target.closest(".back-to-leaderboard-btn")) {
    // Already handled in showGameLeaderboard
  }
});

buildMenu();

// MUSIC PLAYER
const audioFiles = [
  "audio/Moss_Path.mp3",
  "audio/Poisonous_Lavender.mp3",
  "audio/Sunlight_Sprout.mp3",
  "audio/Voltage_Collapse.mp3",
  "audio/Haunted_Corridor.mp3",
  "audio/Hidden_Glade.mp3",
  "audio/Pocket_Kingdom.mp3"
];

let currentTrack = 0;
let isPlaying = false;
let audioPlayer = new Audio();

audioPlayer.addEventListener("ended", () => {
  currentTrack = (currentTrack + 1) % audioFiles.length;
  audioPlayer.src = audioFiles[currentTrack];
  audioPlayer.play();
});

document.getElementById("music-btn").onclick = () => {
  const btn = document.getElementById("music-btn");

  if (!isPlaying) {
    audioPlayer.src = audioFiles[currentTrack];
    audioPlayer.play();
    isPlaying = true;
    btn.textContent = "⏸️";
  } else {
    audioPlayer.pause();
    isPlaying = false;
    btn.textContent = "▶️";
  }
};

// MOBILE KEYBOARD INPUT
const keyboardBtn = document.getElementById("keyboard-toggle");
const mobileInput = document.getElementById("mobile-keyboard-input");

keyboardBtn.addEventListener("click", () => {
  if (mobileInput.style.display === "none") {
    mobileInput.style.display = "block";
    mobileInput.focus();
  } else {
    mobileInput.style.display = "none";
  }
});

// Map mobile keys → Arrow keys
mobileInput.addEventListener("keydown", e => {
  const frame = document.getElementById("game-frame");

  const map = {
    "a": "ArrowLeft",
    "s": "ArrowRight",
    "w": "ArrowUp",
    "z": "ArrowDown",
    " ": " "
  };

  const key = map[e.key.toLowerCase()];
  if (!key) return;

  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true
  });

  frame.contentWindow.document.dispatchEvent(event);
});

// Export functions for use in game pages
window.saveGameScore = function(gameName, scoreData) {
  return getPlayerName().then(name => {
    const { db } = initFirebase();
    
    // First, get player's current best score for this game
    return db.collection("games")
      .where("playerName", "==", name)
      .where("gameName", "==", gameName)
      .orderBy("bestTime", "asc")
      .limit(1)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          // Player already has a score - only update if better (lower time)
          const existingDoc = snapshot.docs[0];
          const existingTime = existingDoc.data().bestTime;
          
          if (scoreData.bestTime >= existingTime) {
            console.log("New score is not better than existing best");
            return;
          }
          
          // Update existing score
          return db.collection("games").doc(existingDoc.id).update(scoreData);
        } else {
          // No existing score - create new
          return db.collection("games").add({
            playerName: name,
            gameName: gameName,
            ...scoreData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
      });
  });
};
