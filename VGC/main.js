// VGC Main Game Controller
// Handles initialization and screen transitions

class GameController {
    constructor() {
        this.currentScreen = 'loading';
    }

    // Initialize the game
    async init() {
        console.log('Initializing VGC Battle System...');
        
        // Load game data
        const loaded = await gameData.loadAllData();
        
        if (loaded) {
            console.log('Game data loaded successfully!');
            this.showMainMenu();
        } else {
            console.error('Failed to load game data');
            document.getElementById('loading-screen').innerHTML = `
                <div class="loading-content">
                    <h1>Error Loading Game</h1>
                    <p>Failed to load game data. Please check that all CSV files are present.</p>
                    <button onclick="location.reload()" class="btn-primary">Retry</button>
                </div>
            `;
        }
    }

    // Show main menu
    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('main-menu').style.display = 'flex';
        this.currentScreen = 'menu';
        
        // Attach menu button events
        document.getElementById('start-game-btn').onclick = () => this.startGame();
        document.getElementById('rules-btn').onclick = () => this.showRules();
    }

    // Show rules modal
    showRules() {
        const modal = document.getElementById('rules-modal');
        modal.style.display = 'block';
        
        // Close button
        modal.querySelector('.close-modal').onclick = () => {
            modal.style.display = 'none';
        };
        
        // Click outside to close
        window.onclick = (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        };
    }

    // Start game (team building)
    startGame() {
        this.hideAllScreens();
        document.getElementById('team-builder').style.display = 'block';
        this.currentScreen = 'team-builder';
        
        // Initialize team builder
        teamBuilder.showTeamBuilder();
    }

    // Hide all screens
    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new GameController();
    game.init();
});

// Global helper functions
function showError(message) {
    alert(message);
}

function confirmAction(message) {
    return confirm(message);
}

// Leaderboard tracking functions
function saveBattleResult(winner) {
    try {
        // Get player name from parent window
        let playerName = "Player";
        if (window.parent && window.parent.playerName) {
            playerName = window.parent.playerName;
        }
        
        // Get stats from localStorage
        let vgcStats = JSON.parse(localStorage.getItem('vgcStats') || '{}');
        
        if (!vgcStats[playerName]) {
            vgcStats[playerName] = {
                wins: 0,
                losses: 0,
                lastPlayed: new Date().toISOString()
            };
        }
        
        // Update stats
        if (winner === 'player') {
            vgcStats[playerName].wins++;
        } else if (winner === 'opponent') {
            vgcStats[playerName].losses++;
        }
        // Draws don't count toward wins or losses
        
        vgcStats[playerName].lastPlayed = new Date().toISOString();
        
        // Save to localStorage
        localStorage.setItem('vgcStats', JSON.stringify(vgcStats));
        
        // Try to save to Firebase if available
        try {
            if (window.parent && window.parent.initFirebase) {
                const { db } = window.parent.initFirebase();
                if (db) {
                    const totalGames = vgcStats[playerName].wins + vgcStats[playerName].losses;
                    const winRate = totalGames > 0 ? vgcStats[playerName].wins / totalGames : 0;
                    
                    db.collection('scores').doc(`VGC_${playerName}`).set({
                        game: 'VGC',
                        player: playerName,
                        wins: vgcStats[playerName].wins,
                        losses: vgcStats[playerName].losses,
                        winRate: winRate,
                        lastPlayed: window.parent.firebase.firestore.FieldValue.serverTimestamp(),
                        timestamp: window.parent.firebase.firestore.FieldValue.serverTimestamp()
                    }).catch(err => console.error("Error saving to Firebase:", err));
                }
            }
        } catch (e) {
            console.error("Firebase save error:", e);
        }
        
        return vgcStats[playerName];
    } catch (e) {
        console.error("Error saving battle result:", e);
    }
}

// Get player stats
function getPlayerStats(playerName) {
    try {
        const vgcStats = JSON.parse(localStorage.getItem('vgcStats') || '{}');
        return vgcStats[playerName] || { wins: 0, losses: 0, lastPlayed: null };
    } catch (e) {
        console.error("Error getting player stats:", e);
        return { wins: 0, losses: 0, lastPlayed: null };
    }
}
