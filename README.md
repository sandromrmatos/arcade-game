# HTML5 Arcade Game Collection

A comprehensive collection of 17 classic arcade games built with vanilla HTML5, CSS, and JavaScript, featuring a unified leaderboard system powered by Firebase Firestore.

## 🎮 Overview

This is a personal/family arcade game collection with a centralized launcher interface. All games run in the browser, track high scores, and sync across devices via Firebase.

## 📁 Project Structure

```
Games/
├── index.html              # Main launcher with game grid
├── home.html               # Home/welcome screen
├── launch.html             # Game launch screen
├── script.js               # Main app logic, Firebase integration, leaderboard
├── style.css               # Global styles
├── games.json              # List of all available games
├── icons/                  # SVG icons for each game (100x100)
├── audio/                  # Background music tracks
└── [Game Folders]/         # Individual game implementations
    ├── index.html
    ├── script.js
    └── style.css
```

## 🎯 Games Included

| Game | Difficulty Modes | Metric Tracked | Scoring |
|------|------------------|----------------|---------|
| Memory | Small (4×4), Large (6×6) | Turns | Lower is better |
| Snake | Small (15×15), Big (18×18) | Length | Higher is better |
| Tetris | Easy, Hard | Score | Higher is better |
| Candy Crush | Single | Score | Higher is better |
| Tic Tac Toe | Single | - | No leaderboard |
| Puzzle Bobble | Single | - | No leaderboard |
| Cross the Bridge | Short (3×6), Long (3×12) | Time Left | Higher is better |
| Simon Says | Single | - | No leaderboard |
| Snakes and Ladders | Single | - | No leaderboard |
| Wordle | Single | - | No leaderboard |
| Minefield | Single | - | No leaderboard |
| Arkanoid | Single | - | No leaderboard |
| Word Search | Single | Best Time | Lower is better |
| Mahjong Solitaire | Easy, Hard | Best Time | Lower is better |
| Hammer the Ant | Easy, Hard | Score | Higher is better |
| PacMan | Single | - | No leaderboard |
| Puzzle | Easy (4×4), Medium (6×6), Hard (7×7) | Best Time | Lower is better |

## 🏆 Leaderboard System

### Features
- **Firebase Firestore Integration**: Real-time cloud database for cross-device sync
- **Per-Player Tracking**: Saves best score per player per game per difficulty
- **Automatic Updates**: Only updates when beating personal best
- **"New Best Score!" Popup**: Animated celebration when achieving new personal record
- **Separate Difficulty Boards**: Games with multiple modes show side-by-side leaderboards

### Player Name System
- First-time visitors prompted to enter name via modal
- Name stored in `localStorage` and synced to Firebase
- Collection: `players/{playerId}`

### Score Storage
- Collection: `games/{scoreId}`
- Fields:
  - `playerName`: String
  - `gameName`: String
  - `difficulty`: String (optional, for multi-mode games)
  - `score` / `bestTime` / `timeLeft` / `length` / `turns`: Number (depends on game)
  - `timestamp`: Firebase ServerTimestamp

### Score Types by Game
- **Time-based (lower is better)**: Word Search, Mahjong Solitaire, Puzzle
- **Score-based (higher is better)**: Tetris, Hammer the Ant, Candy Crush
- **Time Left (higher is better)**: Cross the Bridge
- **Length (higher is better)**: Snake
- **Turns (lower is better)**: Memory

## 🔥 Firebase Configuration

**Project**: `arcade-sandro`
**Database**: Firestore (Spark/Free Plan)

### Collections
- `games`: High scores with player names and timestamps
- `players`: Player name mappings

### Security Rules
Located in Firebase Console → Firestore → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /games/{gameId} {
      allow read: if true;
      allow write: if true;
    }
    match /players/{playerId} {
      allow read, write: if true;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Note**: Rules must not have expiration date for permanent operation.

### Firebase SDK
- Loaded via CDN (compat version 10.8.0) in `index.html`
- Initialization in `script.js` with `initFirebase()`

## 🎨 UI Components

### Main Launcher (`index.html`)
- Grid of game icons (clickable buttons)
- Top banner with Home, Leaderboard, Audio toggle, Keyboard toggle
- Name input modal (shown on first visit)
- Iframe container for loading games
- Leaderboard overlay section

### Leaderboard Interface
- Accessible via top banner button
- Game selection grid → Individual game leaderboards
- Close button (×) to dismiss
- Refresh button on each game leaderboard
- Side-by-side tables for multi-difficulty games
- Top 10 scores per mode

### Audio System
- Background music toggle in top banner
- Tracks stored in `audio/` folder
- Playlist includes: Haunted Corridor, Hidden Glade, Moss Path, etc.

## 🔧 Core Functions

### Main Script (`script.js`)

**Firebase Integration:**
- `initFirebase()`: Initialize Firestore connection
- `saveGameScore(gameName, scoreData)`: Save/update scores
- `showNewBestScore(gameName, scoreData)`: Display achievement popup

**Leaderboard Display:**
- `showLeaderboard()`: Show game selection grid
- `showGameLeaderboard(gameName)`: Display specific game's leaderboard
- `showScoreBasedLeaderboard()`: For Tetris, Hammer the Ant
- `showTimeBasedDifficultyLeaderboard()`: For Mahjong Solitaire
- `showLengthBasedDifficultyLeaderboard()`: For Snake
- `showTimeLeftDifficultyLeaderboard()`: For Cross the Bridge
- `showTurnsBasedDifficultyLeaderboard()`: For Memory
- `showPuzzleLeaderboard()`: For Puzzle (3 modes)
- `showCandyCrushLeaderboard()`: For Candy Crush
- `closeLeaderboard()`: Hide leaderboard overlay

**Player Management:**
- `getPlayerName()`: Retrieve or prompt for player name
- Stored in `localStorage.playerName`

## 🎮 Game Implementation Pattern

Each game folder contains:

1. **HTML Structure**
   - Difficulty selection menu (if applicable)
   - Game board/canvas
   - Score/timer display
   - Restart button

2. **Game Logic**
   - Difficulty mode tracking (`currentMode` variable)
   - Win/lose conditions
   - Score calculation

3. **Leaderboard Integration**
   ```javascript
   if (window.parent && window.parent.saveGameScore) {
     window.parent.saveGameScore("GameName", {
       score: finalScore,
       difficulty: currentMode
     }).then((result) => {
       if (result && result.isNewBest && window.parent.showNewBestScore) {
         window.parent.showNewBestScore("GameName", scoreData);
       }
     });
   }
   ```

## 🎯 Key Features

### Click & Drag Support
- **Candy Crush**: Both drag-and-drop and click-to-select gameplay
- **Puzzle**: Click piece, then click board cell to place

### Adaptive Grids
- Games automatically adjust grid size based on difficulty
- CSS custom properties (`--tile-w`, `--rows`, etc.) updated dynamically

### Visual Feedback
- Selected pieces highlight with glow effect
- Correct placements show green outline and animation
- Hover effects on all interactive elements
- Smooth transitions and animations

## 📊 Browser Requirements

- Modern browser with ES6+ support
- JavaScript enabled
- LocalStorage enabled
- Internet connection for Firebase sync

## 🚀 Deployment

Currently runs as static HTML files. Can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

**Important**: Firebase config is embedded in `script.js` - keep security rules properly configured.

## 🔄 Recent Updates

- Added difficulty modes to Snake, Cross the Bridge, Memory
- Implemented Puzzle game with 3 difficulty levels
- Fixed Tetris to prevent mid-game difficulty switching
- Added click functionality to Candy Crush
- Created SVG icons for all games
- Enhanced Word Search to allow letter reuse from found words
- Improved leaderboard navigation and refresh functionality

## 📝 Notes for Agents/Developers

1. **Browser Cache**: Changes may require hard refresh (Ctrl+Shift+R)
2. **Icon Fallback**: Code tries `.svg` first, falls back to `.png`
3. **Iframe Communication**: Games use `window.parent` to access main window functions
4. **Firebase Timestamps**: Use `.toDate()` to convert Firestore timestamps
5. **Score Comparison**: Different games use different "better" logic (higher vs lower)
6. **No Backend**: All logic runs client-side; Firebase is only for data persistence

## 🎨 Styling Conventions

- Dark/space themes for most games
- Bright, colorful UI elements
- Consistent button styling across games
- Menu overlays with semi-transparent backgrounds
- Animations for state changes (selections, wins, etc.)

## 🔐 Security Considerations

- Firebase rules allow public read/write (suitable for family use)
- No authentication required
- No sensitive data stored
- Score manipulation possible but acceptable for personal use
- Consider adding Firebase Auth for public deployment

---

**Built with ❤️ for family gaming fun!**
