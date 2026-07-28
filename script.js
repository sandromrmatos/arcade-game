// Load game into iframe
function loadGame(name) {
  const frame = document.getElementById("game-frame");
  frame.src = name === "home" ? "home.html" : `launch.html?game=${name}`;
}

// Firebase configuration (optional - app works without it)
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

function initFirebase() {
  if (!firebaseApp) {
    try {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      firebaseAnalytics = firebase.analytics();
      firebaseDb = firebase.firestore();
    } catch (e) {
      console.error("Firebase init failed:", e);
    }
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
    
    // Save to Firebase if available
    const { db } = initFirebase();
    if (db) {
      db.collection("players").doc(playerName).set({
        name: playerName,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(err => console.error("Error saving player:", err));
    }
    
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
  
  // Show modal synchronously if no name
  showNameModal();
  return new Promise(resolve => {
    nameResolver = resolve;
  });
}

// Build menu
async function buildMenu() {
  const menu = document.getElementById("menu");

  const homeBtn = document.createElement("button");
  homeBtn.textContent = "Home";
  homeBtn.onclick = () => loadGame("home");
  menu.appendChild(homeBtn);

  const leaderboardBtn = document.createElement("button");
  leaderboardBtn.textContent = "Leaderboard";
  leaderboardBtn.className = "leaderboard-btn";
  leaderboardBtn.onclick = showLeaderboard;
  menu.appendChild(leaderboardBtn);

  const response = await fetch("games.json");
  const data = await response.json();

  data.games.forEach(folder => {
    const btn = document.createElement("button");

    const img = document.createElement("img");
    img.src = `icons/${folder}.png`;
    img.className = "menu-icon";

    const span = document.createElement("span");
    span.textContent = folder;

    btn.appendChild(img);
    btn.appendChild(span);

    btn.onclick = () => loadGame(folder);
    menu.appendChild(btn);
  });
}

// Leaderboard functions
function showLeaderboard() {
  const section = document.getElementById("leaderboard-section");
  
  // Reset to main leaderboard view
  section.innerHTML = `
    <div class="leaderboard-content">
      <button class="close-leaderboard-btn">×</button>
      <h2>Game Leaderboards</h2>
      <p>Select a game to view its high scores:</p>
      <div id="leaderboard-game-list" class="leaderboard-game-list"></div>
    </div>
  `;
  
  section.classList.remove("hidden");
  
  // Re-attach close button listener for main leaderboard
  const closeBtn = section.querySelector(".close-leaderboard-btn");
  closeBtn.addEventListener("click", closeLeaderboard);
  
  const gameList = document.getElementById("leaderboard-game-list");
  
  // Populate game list
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
}

function showGameLeaderboard(gameName) {
  const section = document.getElementById("leaderboard-section");
  section.innerHTML = `
    <div class="leaderboard-content" id="game-leaderboard-page">
      <h2>${gameName} Leaderboard</h2>
      <button class="close-leaderboard-btn">×</button>
      <button class="refresh-leaderboard-btn" style="position: absolute; top: 20px; right: 60px; padding: 8px 15px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">🔄 Refresh</button>
      <div id="leaderboard-content"></div>
    </div>
  `;
  
  // Re-attach close button listener
  const closeBtn = section.querySelector(".close-leaderboard-btn");
  closeBtn.addEventListener("click", closeLeaderboard);
  
  // Attach refresh button listener
  const refreshBtn = section.querySelector(".refresh-leaderboard-btn");
  refreshBtn.addEventListener("click", () => {
    showGameLeaderboard(gameName); // Reload the same leaderboard
  });
  
  const content = document.getElementById("leaderboard-content");
  const { db } = initFirebase();
  
  // If Firebase not available, show local storage scores (if any)
  if (!db) {
    content.textContent = "Leaderboard requires Firebase (not available in this environment)";
    return;
  }
  
  content.textContent = "Loading scores...";
  
  // Special handling for score-based games with difficulty modes
  if (gameName === "Tetris" || gameName === "Hammer the Ant") {
    showScoreBasedLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for time-based games with difficulty modes
  if (gameName === "Mahjong Solitaire") {
    showTimeBasedDifficultyLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Cross the Bridge (timeLeft - higher is better)
  if (gameName === "Cross the Bridge") {
    showTimeLeftLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Snake (length - higher is better)
  if (gameName === "Snake") {
    showSnakeLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Memory (turns - lower is better)
  if (gameName === "Memory") {
    showMemoryLeaderboard(db, content, gameName);
    return;
  }
  
  // Special handling for Candy Crush (score - higher is better)
  if (gameName === "Candy Crush") {
    showCandyCrushLeaderboard(db, content, gameName);
    return;
  }
  
  // Get all games, then filter and sort client-side (no index needed)
  // Note: This fetches all games, which is fine for low volumes
  db.collection("games")
    .limit(100)
    .get()
    .then(snapshot => {
      // Filter for specific game and sort by bestTime
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.gameName === gameName)
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      if (docs.length === 0) {
        content.innerHTML = '<p style="color: #666;">No scores yet. Be the first!</p>';
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Best Time</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      docs.forEach(doc => {
        const timeFormatted = formatTime(doc.bestTime);
        const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${doc.playerName}</td>
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

function showScoreBasedLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      const easyDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "easy")
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      const hardDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "hard")
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Easy mode table
      html += '<div style="flex: 1; min-width: 300px;"><h3>Easy Mode</h3>';
      if (easyDocs.length === 0) {
        html += '<p style="color: #666;">No scores yet.</p>';
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
        easyDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Hard mode table
      html += '<div style="flex: 1; min-width: 300px;"><h3>Hard Mode</h3>';
      if (hardDocs.length === 0) {
        html += '<p style="color: #666;">No scores yet.</p>';
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
        hardDocs.forEach((doc, i) => {
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${doc.score}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = "Error loading scores: " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showTimeBasedDifficultyLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(200)
    .get()
    .then(snapshot => {
      const allDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for game and separate by difficulty
      const easyDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "easy")
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      const hardDocs = allDocs
        .filter(doc => doc.gameName === gameName && doc.difficulty === "hard")
        .sort((a, b) => a.bestTime - b.bestTime)
        .slice(0, 10);
      
      let html = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
      
      // Easy mode table
      html += '<div style="flex: 1; min-width: 300px;"><h3>Easy Mode</h3>';
      if (easyDocs.length === 0) {
        html += '<p style="color: #666;">No scores yet.</p>';
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Best Time</th><th>Date</th></tr></thead><tbody>';
        easyDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.bestTime);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div>';
      
      // Hard mode table
      html += '<div style="flex: 1; min-width: 300px;"><h3>Hard Mode</h3>';
      if (hardDocs.length === 0) {
        html += '<p style="color: #666;">No scores yet.</p>';
      } else {
        html += '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Best Time</th><th>Date</th></tr></thead><tbody>';
        hardDocs.forEach((doc, i) => {
          const timeFormatted = formatTime(doc.bestTime);
          const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
          html += `<tr>
            <td>${i + 1}</td>
            <td>${doc.playerName}</td>
            <td>${timeFormatted}</td>
            <td>${date}</td>
          </tr>`;
        });
        html += '</tbody></table>';
      }
      html += '</div></div>';
      
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = "Error loading scores: " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showTimeLeftLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(100)
    .get()
    .then(snapshot => {
      // Filter for Cross the Bridge and sort by timeLeft (higher is better)
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.gameName === gameName)
        .sort((a, b) => b.timeLeft - a.timeLeft)
        .slice(0, 10);
      
      if (docs.length === 0) {
        content.innerHTML = '<p style="color: #666;">No scores yet. Be the first!</p>';
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Time Left</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      docs.forEach(doc => {
        const timeFormatted = formatTime(doc.timeLeft);
        const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${doc.playerName}</td>
          <td>${timeFormatted}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = "Error loading scores: " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showSnakeLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(100)
    .get()
    .then(snapshot => {
      // Filter for Snake and sort by length (higher is better)
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.gameName === gameName)
        .sort((a, b) => b.length - a.length)
        .slice(0, 10);
      
      if (docs.length === 0) {
        content.innerHTML = '<p style="color: #666;">No scores yet. Be the first!</p>';
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Length</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      docs.forEach(doc => {
        const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${doc.playerName}</td>
          <td>${doc.length}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = "Error loading scores: " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showMemoryLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(100)
    .get()
    .then(snapshot => {
      // Filter for Memory and sort by turns (lower is better)
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.gameName === gameName)
        .sort((a, b) => a.turns - b.turns)
        .slice(0, 10);
      
      if (docs.length === 0) {
        content.innerHTML = '<p style="color: #666;">No scores yet. Be the first!</p>';
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Turns</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      docs.forEach(doc => {
        const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${doc.playerName}</td>
          <td>${doc.turns}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = "Error loading scores: " + err.message;
      console.error("Leaderboard error:", err);
    });
}

function showCandyCrushLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(100)
    .get()
    .then(snapshot => {
      // Filter for Candy Crush and sort by score (higher is better)
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.gameName === gameName)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      if (docs.length === 0) {
        content.innerHTML = '<p style="color: #666;">No scores yet. Be the first!</p>';
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Score</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      docs.forEach(doc => {
        const date = doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A';
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${doc.playerName}</td>
          <td>${doc.score}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = "Error loading scores: " + err.message;
      console.error("Leaderboard error:", err);
    });
}

// Close leaderboard section when clicking back to menu
// Close button is handled via onclick attribute

function closeLeaderboard() {
  const section = document.getElementById("leaderboard-section");
  if (section) {
    section.classList.add("hidden");
    // Reset to main leaderboard view when closed so next open shows game selection
    section.innerHTML = `
      <div class="leaderboard-content">
        <button class="close-leaderboard-btn">×</button>
        <h2>Game Leaderboards</h2>
        <p>Select a game to view its high scores:</p>
        <div id="leaderboard-game-list" class="leaderboard-game-list"></div>
      </div>
    `;
  }
}

buildMenu();

// Show name modal if no name stored
if (!playerName) {
  showNameModal();
}

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
  console.log("saveGameScore called:", gameName, scoreData);
  
  return getPlayerName().then(name => {
    console.log("Player name retrieved:", name);
    const { db } = initFirebase();
    
    // If Firebase not available, just log the score
    if (!db) {
      console.error("Firebase DB not initialized");
      return { isNewBest: false };
    }
    
    console.log("Checking existing scores for", name, "in", gameName);
    
    // Build query based on game type
    let query = db.collection("games")
      .where("playerName", "==", name)
      .where("gameName", "==", gameName);
    
    // Add difficulty filter for games that have it (like Tetris)
    if (scoreData.difficulty) {
      query = query.where("difficulty", "==", scoreData.difficulty);
    }
    
    // Determine if this is a time-based or score-based game
    const isTimeBased = scoreData.hasOwnProperty("bestTime");
    const isScoreBased = scoreData.hasOwnProperty("score");
    const isTimeLeftBased = scoreData.hasOwnProperty("timeLeft");
    const isLengthBased = scoreData.hasOwnProperty("length");
    const isTurnsBased = scoreData.hasOwnProperty("turns");
    
    return query.limit(1).get()
      .then(snapshot => {
        console.log("Existing scores found:", snapshot.size);
        
        let isNewBest = false;
        
        if (!snapshot.empty) {
          const existingDoc = snapshot.docs[0];
          const existingData = existingDoc.data();
          
          let shouldUpdate = false;
          
          if (isTimeBased || isTurnsBased) {
            // For time-based and turns-based games, lower is better
            const field = isTimeBased ? "bestTime" : "turns";
            console.log(`Existing ${field}:`, existingData[field], `New ${field}:`, scoreData[field]);
            shouldUpdate = scoreData[field] < existingData[field];
          } else if (isScoreBased || isTimeLeftBased || isLengthBased) {
            // For score-based, timeLeft, and length games, higher is better
            const field = isScoreBased ? "score" : isTimeLeftBased ? "timeLeft" : "length";
            console.log(`Existing ${field}:`, existingData[field], `New ${field}:`, scoreData[field]);
            shouldUpdate = scoreData[field] > existingData[field];
          }
          
          if (!shouldUpdate) {
            console.log("New score is not better than existing best");
            return { isNewBest: false };
          }
          
          isNewBest = true;
          
          // Update existing score
          console.log("Updating existing score");
          return db.collection("games").doc(existingDoc.id).update({
            ...scoreData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }).then(() => ({ isNewBest: true }));
        } else {
          // No existing score - this is their first score (also counts as new best)
          isNewBest = true;
          console.log("Creating new score entry");
          return db.collection("games").add({
            playerName: name,
            gameName: gameName,
            ...scoreData,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
          }).then(docRef => {
            console.log("Score saved with ID:", docRef.id);
            return { isNewBest: true };
          });
        }
      })
      .catch(err => {
        console.error("Error in saveGameScore:", err);
        throw err;
      });
  });
};

// Show new best score notification
window.showNewBestScore = function(gameName, scoreData) {
  const message = document.createElement("div");
  message.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 30px 50px;
    border-radius: 15px;
    font-size: 24px;
    font-weight: bold;
    text-align: center;
    z-index: 10000;
    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    animation: popIn 0.3s ease-out;
  `;
  
  message.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 10px;">🎉</div>
    <div>NEW BEST SCORE!</div>
  `;
  
  // Add animation keyframes
  if (!document.getElementById("newBestScoreStyles")) {
    const style = document.createElement("style");
    style.id = "newBestScoreStyles";
    style.textContent = `
      @keyframes popIn {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(message);
  
  // Remove after 3 seconds
  setTimeout(() => {
    message.style.transition = "opacity 0.3s";
    message.style.opacity = "0";
    setTimeout(() => message.remove(), 300);
  }, 3000);
};
