# HTML5 Arcade Game Collection

A comprehensive collection of 18 classic arcade games built with vanilla HTML5, CSS, and JavaScript, featuring a unified leaderboard system powered by Firebase Firestore, bilingual support (English/Portuguese), and an information system with detailed game guides.

## 🎮 Overview

This is a personal/family arcade game collection with a centralized launcher interface. All games run in the browser, track high scores, and sync across devices via Firebase. The interface supports English and Portuguese languages and includes detailed game instructions accessible through the Info menu.

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
| Puzzle Bobble | Easy, Hard | Score | Higher is better |
| Cross the Bridge | Short (3×6), Long (3×12) | Time Left | Higher is better |
| Simon Says | Single | - | No leaderboard |
| Snakes and Ladders | Single | - | No leaderboard |
| Wordle | Single | - | No leaderboard |
| Minefield | Easy (5×5), Medium (6×6), Hard (8×8) | Best Time | Lower is better |
| Arkanoid | Single | - | No leaderboard |
| Word Search | Single | Best Time | Lower is better |
| Mahjong Solitaire | Easy, Hard | Best Time | Lower is better |
| Hammer the Ant | Easy, Hard | Score | Higher is better |
| PacMan | Single | - | No leaderboard |
| Puzzle | Easy (4×4), Medium (6×6), Hard (7×7) | Best Time | Lower is better |
| Domino | Single | Score | Higher is better |
| Maze | Easy (11×11), Medium (17×17), Hard (23×23) | Best Time | Lower is better |

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
- Top banner with:
  - **Home** button
  - **Info** button (game descriptions, rules, and controls)
  - **Leaderboard** button
  - **Language selector** (EN/PT toggle)
  - **Collapse/Expand** button (▲/▼ to minimize banner)
  - Music player controls
- Name input modal (shown on first visit)
- Iframe container for loading games
- Leaderboard overlay section
- Info overlay section with game guides

### Info System
- **Game Descriptions**: Detailed explanations of each game
- **Game Modes**: Lists all difficulty options with specifics
- **Scoring System**: Explains how to win and what metrics matter
- **Controls**: Instructions for keyboard, mouse, and mobile interaction
- **Bilingual**: All info available in English and Portuguese
- Modal overlay with styled cards for each game
- Accessible via top banner "Info" button

### Language System
- **English/Portuguese Support**: Full bilingual interface
- Language selector in top banner (dropdown)
- Translations for:
  - All menu items and buttons
  - Game names
  - Leaderboard labels and headers
  - Info descriptions and instructions
  - In-game messages and alerts
  - Error messages
- Stored in `localStorage.arcadeLanguage`
- Games receive language updates via iframe `postMessage`
- Each game has internal `translations` object with EN/PT text

### Collapsible Banner
- **Collapse button** (▲) in top banner next to language selector
- Clicking collapses banner to minimal height showing only expand button (▼)
- Expands back to full banner with all controls
- Improves gameplay visibility on smaller screens
- State maintained during session

### Leaderboard Interface
- Accessible via top banner button
- Game selection grid → Individual game leaderboards
- Close button (×) to dismiss
- Refresh button (🔄) on each game leaderboard
- Side-by-side tables for multi-difficulty games
- Top 10 scores per mode
- Bilingual labels and headers

### Audio System
- Background music player in top banner
- Controls: Play/Pause (▶️/⏸), Previous (⏮), Next (⏭)
- Current track name display
- Tracks stored in `audio/` folder
- Playlist includes: Haunted Corridor, Hidden Glade, Moss Path, Pocket Kingdom, Poisonous Lavender, Sunlight Sprout, Voltage Collapse
- Auto-advances to next track on completion
- Bilingual "No track playing" message

## 🔧 Core Functions

### Main Script (`script.js`)

**Language System:**
- `t(key)`: Translation function - returns text in current language
- `updateLanguage()`: Updates all UI text when language changes
- `translations` object: Contains EN/PT text for all interface elements
- `gameDescriptions` / `gameDescriptionsPT`: Game info in both languages
- Language stored in `localStorage.arcadeLanguage`
- Sends language change messages to iframes via `postMessage`

**Firebase Integration:**
- `initFirebase()`: Initialize Firestore connection
- `saveGameScore(gameName, scoreData)`: Save/update scores
- `showNewBestScore(gameName, scoreData)`: Display achievement popup

**Info System:**
- `showInfo()`: Display game selection grid for info
- `showGameInfo(gameName)`: Show detailed modal with game description, modes, scoring, and controls
- Modal includes:
  - 📖 How to Play
  - 🎮 Game Modes
  - 🏆 Scoring
  - 🕹️ Controls

**Leaderboard Display:**
- `showLeaderboard()`: Show game selection grid
- `showGameLeaderboard(gameName)`: Display specific game's leaderboard
- `showScoreBasedLeaderboard()`: For Tetris, Hammer the Ant, Puzzle Bobble
- `showTimeBasedDifficultyLeaderboard()`: For Mahjong Solitaire, Minefield, Maze
- `showLengthBasedDifficultyLeaderboard()`: For Snake
- `showTimeLeftDifficultyLeaderboard()`: For Cross the Bridge
- `showTurnsBasedDifficultyLeaderboard()`: For Memory
- `showPuzzleLeaderboard()`: For Puzzle (3 modes)
- `showCandyCrushLeaderboard()`: For Candy Crush
- `showDominoLeaderboard()`: For Domino
- `closeLeaderboard()`: Hide leaderboard overlay

**Player Management:**
- `getPlayerName()`: Retrieve or prompt for player name
- Stored in `localStorage.arcadePlayerName`

**UI Controls:**
- Collapse/expand banner functionality
- Language selector event listener
- Music player controls

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

3. **Bilingual Support**
   - `translations` object with `en` and `pt` keys
   - `t(key)` function to get text in current language
   - `updateLanguage()` function to refresh UI text
   - `getParentLanguage()` to sync with main window
   - Listens for `postMessage` language change events

4. **Leaderboard Integration**
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

### Bilingual Interface (EN/PT)
- Complete English and Portuguese support
- Language selector in top banner
- All UI elements, game names, messages translated
- Game instructions and info available in both languages
- Individual games inherit language from main launcher
- Automatic text updates when switching languages

### Info System
- Detailed game guides accessible via Info button
- Each game has comprehensive documentation:
  - How to play
  - Game modes and grid sizes
  - Scoring system explanation
  - Control instructions (keyboard, mouse, touch)
- Modal overlay with clean, styled presentation
- Available in both English and Portuguese

### Collapsible Menu Banner
- Minimize/maximize top menu bar
- Improves screen space for gameplay
- Toggle button (▲/▼) next to language selector
- Smooth collapse/expand animation

### Click & Drag Support
- **Candy Crush**: Both drag-and-drop and click-to-select gameplay
- **Puzzle**: Click piece, then click board cell to place
- **Maze**: Click adjacent cells to move (mobile-friendly)

### Adaptive Grids
- Games automatically adjust grid size based on difficulty
- CSS custom properties (`--tile-w`, `--rows`, etc.) updated dynamically

### Visual Feedback
- Selected pieces highlight with glow effect
- Correct placements show green outline and animation
- Hover effects on all interactive elements
- Smooth transitions and animations
- Highlighted clickable cells in Maze game

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

### Latest Features
- **Bilingual Support**: Full English/Portuguese translation system
- **Info System**: Comprehensive game guides with instructions, modes, and controls
- **Collapsible Banner**: Minimize top menu for better gameplay visibility
- **Maze Game**: New pathfinding game with 3 difficulty levels (11×11, 17×17, 23×23)
- **Enhanced Music Player**: Full track controls with play/pause, previous/next

### Previous Updates
- Added difficulty modes to Snake, Cross the Bridge, Memory
- Implemented Puzzle game with 3 difficulty levels
- Added Minefield with 3 difficulty levels (Easy, Medium, Hard)
- Added Domino game with score tracking
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
7. **Language System**: Main window stores language in localStorage, games sync via postMessage
8. **Translation Keys**: Use consistent key names across `translations`, `gameDescriptions`, and game-specific objects
9. **Variable Initialization**: Declare all game variables before calling `updateLanguage()` to avoid temporal dead zone errors
10. **Maze Generation**: Start carving from (0,0) and ensure adjacent paths to start/finish positions

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
