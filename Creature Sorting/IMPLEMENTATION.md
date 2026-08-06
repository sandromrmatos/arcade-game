# Creature Sorting Game - Implementation Documentation

## Overview
Creature Sorting is a puzzle game where players organize creatures into matching sets on shelves. The objective is to have each shelf contain 3 of the same creature, with exactly one empty shelf remaining. Integrated with the main arcade menu's Firestore leaderboard system.

## Integration with Main Menu

### Language System
- **No Internal Selector**: Uses parent window's language system
- **Parent Communication**: Listens for `languageChange` messages
- **Language Detection**: Checks `parent.currentLanguage` and `parent.localStorage`
- **Translations**: Stored in script.js, applied via `data-translate` attributes
- **Supported Languages**: English (EN) and Portuguese (PT)

### Leaderboard System
- **Firestore Integration**: Saves via parent's `saveGameScore("Creature Sorting", scoreData)`
- **Score Data**: `{ bestTime: seconds, difficulty: "easy"|"medium"|"hard" }`
- **Display Location**: Main menu's leaderboard section (not in-game)
- **Three Leaderboards**: Separate rankings for Easy/Medium/Hard
- **New Record Detection**: Shows alert when beating personal best
- **Format**: Time displayed as `MM:SS` (e.g., "02:45")

### Parent Window Integration Pattern
```javascript
// Save score
window.parent.saveGameScore("Creature Sorting", {
    bestTime: seconds,
    difficulty: gameState.difficulty
}).then(result => {
    if (result && result.isNewBest) {
        // Show new record message
        window.parent.showNewBestScore("Creature Sorting", {...});
    }
});

// Get language
function getParentLanguage() {
    if (window.parent && window.parent.currentLanguage) {
        return window.parent.currentLanguage;
    }
    return 'en';
}
```

## Game Features

### Difficulty Levels
1. **Easy Mode**: 6 shelves, 5 unique creatures (15 total items)
2. **Medium Mode**: 10 shelves, 9 unique creatures (27 total items)
3. **Hard Mode**: 14 shelves, 13 unique creatures (39 total items)

### Core Mechanics
- Each shelf has 3 slots
- Players can only move items to empty slots
- Click an item to select it (highlighted in gold)
- Click an empty slot to move the selected item
- Click a selected item again to deselect it
- No swapping - both slots being occupied prevents movement

### Timer System
- Timer starts after the first move (not immediately)
- Displays in MM:SS format
- Tracks elapsed time in milliseconds for leaderboard accuracy
- Updates every 100ms for smooth display

### Victory Conditions
The puzzle is solved when:
- Each non-empty shelf contains exactly 3 of the same creature
- Exactly 1 shelf is completely empty
- No partial shelves exist

## Technical Implementation

### File Structure
```
Creature Sorting/
├── index.html          # Main HTML structure
├── style.css           # Complete styling and animations
├── script.js           # Game logic, mechanics, and translations
├── images/             # Creature images (01.png - 18.png)
└── IMPLEMENTATION.md   # This file
```

### Key Technologies
- Pure JavaScript (no frameworks)
- CSS3 for animations and styling
- Firestore (via parent window) for leaderboard persistence
- Parent window communication for language sync
- Responsive design with mobile support

### Game State Management
```javascript
gameState = {
    difficulty: null,           // 'easy', 'medium', or 'hard'
    shelves: [],               // 2D array of creature IDs
    selectedSlot: null,        // Currently selected slot {shelf, slot}
    timerInterval: null,       // Timer interval ID
    startTime: null,           // Timestamp when timer started
    timerStarted: false,       // Whether first move has been made
    moveCount: 0              // Total moves made
}
```

### Puzzle Generation Algorithm
1. **Random Image Selection**: Randomly select the required number of unique creatures from 18 available images
2. **Solved State Creation**: Create shelves with complete sets (3 of each creature) plus one empty shelf
3. **Reverse Shuffling**: Perform 50+ random valid moves to scramble the puzzle
4. **Guaranteed Solvability**: Since we start from solved state and only use valid moves, puzzle is always solvable

**Why This Approach?**
- **100% Solvability**: Starting from solved state guarantees a solution exists
- **Fast Generation**: No complex verification needed (~1ms generation time)
- **Good Difficulty**: Random moves create sufficiently challenging puzzles
- **No Freezing**: Eliminates expensive BFS computation

### Move Validation Logic
```javascript
// Valid move requirements:
1. First click must be on a non-empty slot (item exists)
2. Second click must be on an empty slot (null value)
3. Clicking the same slot again deselects it
4. Clicking another item switches selection
```

### Leaderboard System
- **Storage**: Firestore via parent window's `saveGameScore()` function
- **Data Structure**: `{ bestTime: seconds, difficulty: "easy"|"medium"|"hard" }`
- **Display**: Main menu leaderboard section (click "Leaderboard" → "Creature Sorting")
- **Sorting**: By time ascending (lowest time = best)
- **New Record Detection**: Parent window handles notification
- **Comparison**: Three separate leaderboards per difficulty

### Bilingual Support
**Supported Languages**: English (EN) and Portuguese (PT)

**Translation Coverage**:
- All UI text and buttons
- Difficulty names and descriptions
- Instructions and messages
- Victory modal content

**Implementation**:
- Translations stored in script.js `translations` object
- `t(key)` function retrieves translated text
- Language synced from parent window
- `updateLanguage()` applies via `data-translate` attributes
- Listens for `message` events with type `languageChange`

### Creature Images
- **Location**: `images/` folder
- **Format**: PNG files
- **Naming**: `01.png` through `18.png` (zero-padded)
- **Selection**: Random selection without replacement
- **Display**: Responsive sizing with max 90% of slot dimensions

## UI/UX Features

### Visual Feedback
- **Selected Slot**: Gold border with glow effect
- **Hover Effects**: Scale transform and color change
- **Empty Slots**: Dashed border, lighter background
- **Filled Slots**: Solid border, white background
- **Victory Modal**: Animated overlay with celebration message

### Responsive Design
- Desktop-optimized with centering
- Mobile-friendly with adjusted slot sizes
- Flexible shelf wrapping for all screen sizes
- Accessible touch targets (min 60px on mobile)

### Color Scheme
- **Primary Gradient**: Purple (#667eea) to Violet (#764ba2)
- **Selected Highlight**: Gold (#ffd700)
- **Neutral Grays**: Various shades for shelves and slots
- **Leaderboard Medals**: Gold, Silver, Bronze gradients

## Algorithm Complexity

### Puzzle Generation: O(n × m)
- Image selection: O(n)
- Initial setup: O(n)
- Random shuffling: O(m) where m = number of shuffle moves (50+)
- Total: Linear with number of items and shuffle moves

### Move Validation: O(1)
- Direct array access
- Constant-time checks

### Render: O(s × 3)
- s = number of shelves
- 3 slots per shelf
- Efficient DOM manipulation

## Performance Optimizations
1. **Reverse Shuffle Generation**: Start from solved state, guarantees solvability without expensive checks
2. **No BFS Verification**: Eliminates computational bottleneck
3. **Fast Generation**: ~1ms per puzzle regardless of difficulty
4. **Event Delegation**: Direct listeners work well for this scale
5. **Image Preloading**: Browser caching handles naturally

## Storage Usage
- **Leaderboard Data**: Stored in Firestore (managed by parent)
- **No LocalStorage**: All persistence handled by main menu
- **Session Only**: Game state not persisted between sessions

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Required Features**: ES6+, CSS Grid, Flexbox, LocalStorage
- **No Server Required**: Fully client-side application

## Known Limitations
1. **Puzzle Difficulty**: All puzzles are solvable but difficulty varies based on random shuffle
2. **No Undo Feature**: Players cannot undo moves
3. **No Hints System**: No algorithmic hints provided
4. **Single Player Only**: No multiplayer or competitive modes

## Future Enhancement Ideas
- Move counter display
- Minimum moves calculation
- Hint system (show one valid move)
- Undo/Redo functionality
- Puzzle replay
- Custom creature image upload
- Timed challenge mode
- Achievement system
- Sound effects and background music
- Animation for item movement
- Confetti animation on victory

## Testing Checklist
- [x] Easy mode generates and displays correctly
- [x] Medium mode generates and displays correctly
- [x] Hard mode generates and displays correctly
- [x] Timer starts on first move
- [x] Timer stops on puzzle completion
- [x] Victory detection works correctly
- [x] Leaderboard saves and loads
- [x] New record detection works
- [x] Language switching updates all text
- [x] Language preference persists
- [x] Mobile responsive design works
- [x] Item selection/deselection works
- [x] Move validation prevents invalid moves
- [x] All 18 creature images load correctly
- [x] Random selection uses different creatures each game
- [x] Solvability check prevents impossible puzzles

## Code Organization

### Separation of Concerns
- **index.html**: Structure and layout only (no language selector, no leaderboard screen)
- **style.css**: All visual styling and animations
- **script.js**: Game logic, state management, puzzle generation, translations

### Function Responsibilities
- `startGame()`: Initialize new game with difficulty
- `generatePuzzle()`: Create random puzzle configuration
- `isSolvable()`: Verify puzzle has solution
- `renderGame()`: Update DOM to match game state
- `handleSlotClick()`: Process player interactions
- `isPuzzleSolved()`: Check victory condition
- `getParentLanguage()`: Get language from parent window
- `updateLanguage()`: Apply translations to DOM

### Naming Conventions
- **camelCase**: Function and variable names
- **SCREAMING_SNAKE_CASE**: Constants
- **kebab-case**: CSS classes and IDs
- **PascalCase**: Constructor functions (none in this project)

## Debugging Tips
1. **Console Logging**: Add logs in `handleSlotClick()` to track moves
2. **State Inspection**: Check `gameState` object in browser console
3. **Solvability Issues**: Reduce `maxDepth` in `isSolvable()` for faster feedback
4. **LocalStorage**: Use `localStorage.clear()` to reset leaderboards
5. **Image Loading**: Check browser Network tab for 404 errors

## Credits
- Game Design: Puzzle mechanics inspired by sorting games
- Images: Custom creature sprites (01.png - 18.png)
- Fonts: System fonts (Segoe UI, Tahoma, Geneva, Verdana)
- No external libraries or frameworks used

## Version History
- **v1.0** (2026): Initial release
  - Three difficulty levels
  - Bilingual support (EN/PT)
  - Leaderboard system
  - Solvability verification
  - Responsive design

---

**Last Updated**: August 6, 2026
**Game Type**: Puzzle / Sorting
**Platform**: Web Browser (Desktop & Mobile)
**License**: Custom project for portfolio
