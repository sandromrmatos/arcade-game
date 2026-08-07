# Two Dots - Implementation Documentation

## Overview
Two Dots is a connect-the-dots puzzle game where players drag through adjacent dots of the same color to clear them and score points. The game features three difficulty levels with increasing grid sizes and color counts. Fully integrated with the main arcade menu's Firestore leaderboard system.

## Integration with Main Menu

### Language System
- **No Internal Selector**: Uses parent window's language system
- **Parent Communication**: Listens for `languageChange` messages
- **Language Detection**: Checks `parent.currentLanguage` and `parent.localStorage`
- **Translations**: Stored in script.js, applied via `data-translate` attributes
- **Supported Languages**: English (EN) and Portuguese (PT)

### Leaderboard System
- **Firestore Integration**: Saves via parent's `saveGameScore("Two Dots", scoreData)`
- **Score Data**: `{ score: points, difficulty: "easy"|"medium"|"hard" }`
- **Display Location**: Main menu's leaderboard section
- **Three Separate Leader boards**: Easy, Medium, Hard have separate rankings
- **New Record Detection**: Shows alert when beating personal best
- **Format**: Higher score is better (points accumulated)

### Parent Window Integration Pattern
```javascript
// Save score
window.parent.saveGameScore("Two Dots", {
    score: finalScore,
    difficulty: difficulty
}).then(result => {
    if (result && result.isNewBest) {
        // Show new record message
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
1. **Easy Mode**: 4×4 grid with 3 colors (Red, Teal, Yellow)
2. **Medium Mode**: 5×5 grid with 4 colors (Red, Teal, Yellow, Green)
3. **Hard Mode**: 6×6 grid with 5 colors (Red, Teal, Yellow, Green, Cyan)

### Core Mechanics
- **Connection Rules**: Dots must be adjacent horizontally or vertically (no diagonals)
- **Minimum Chain**: At least 2 dots required to score
- **Visual Feedback**: Selected dots scale up and get glow effect
- **Line Drawing**: Canvas line shows current connection path
- **Gravity**: New dots fall from top after clearing
- **2-Minute Timer**: Each difficulty has 120 seconds to score as high as possible

### Scoring System
Progressive scoring encourages longer chains:
- 2 dots: 1 point
- 3 dots: 2 points
- 4 dots: 4 points
- 5 dots: 7 points
- 6 dots: 10 points
- 7 dots: 13 points
- 8 dots: 16 points
- 9+ dots: Pattern continues (+3 per additional dot)

Formula for 9+ dots: `(count - 8) * 3 + 16`

### Controls
- **Mouse**: Click and drag through adjacent dots, release to complete chain
- **Touch**: Tap and drag finger through dots, lift to complete
- **Cancel**: Click elsewhere or select invalid dot to cancel selection
- **Backtracking**: Click second-to-last dot to remove last dot from chain

## Technical Implementation

### File Structure
```
Two Dots/
├── index.html          # Main HTML structure
├── style.css           # Complete styling and animations
├── script.js           # Game logic and mechanics
└── IMPLEMENTATION.md   # This file
```

### Key Technologies
- Pure JavaScript (no frameworks)
- HTML5 Canvas for connection line drawing
- CSS3 for animations and gradients
- Firestore (via parent window) for leaderboard
- Parent window communication for language sync
- Responsive design with mobile touch support

### Game State Management
```javascript
gameState = {
    difficulty: null,           // 'easy', 'medium', or 'hard'
    gridSize: 0,               // 4, 5, or 6
    numColors: 0,              // 3, 4, or 5
    grid: [],                  // 2D array of dot colors
    score: 0,                  // Current score
    timeLeft: 120,             // Seconds remaining
    timerInterval: null,       // Timer ID
    selectedDots: [],          // Currently selected dots [{row, col, element}]
    canvas: null,              // Canvas element
    ctx: null,                 // Canvas context
    isDrawing: false,          // Is user dragging?
    gameActive: false          // Is game in progress?
}
```

### Dot Selection Logic
```javascript
function continueSelection(row, col) {
    // Check if already in selection (allow backtracking)
    const alreadySelected = selectedDots.some(dot => dot.row === row && dot.col === col);
    
    if (alreadySelected) {
        // If clicking second-to-last, remove last dot (backtrack)
        if (selectedDots.length >= 2) {
            const secondLast = selectedDots[selectedDots.length - 2];
            if (secondLast.row === row && secondLast.col === col) {
                const removed = selectedDots.pop();
                removed.element.classList.remove('selected');
                drawConnections();
            }
        }
        return;
    }
    
    // Must be adjacent to last selected
    if (selectedDots.length > 0) {
        const last = selectedDots[selectedDots.length - 1];
        if (!isAdjacent(last.row, last.col, row, col)) {
            return; // Not adjacent, ignore
        }
    }
    
    // Must be same color as first dot
    const firstColor = grid[selectedDots[0].row][selectedDots[0].col].color;
    const currentColor = grid[row][col].color;
    
    if (currentColor === firstColor && currentColor !== null) {
        addToSelection(row, col);
    }
}
```

### Canvas Line Drawing
```javascript
function drawConnections() {
    clearCanvas();
    
    if (selectedDots.length < 2) return;
    
    const ctx = gameState.ctx;
    const container = document.getElementById('grid-container');
    const containerRect = container.getBoundingClientRect();
    
    // Get color from first dot
    const firstDot = selectedDots[0].element;
    const backgroundColor = window.getComputedStyle(firstDot).backgroundColor;
    
    ctx.strokeStyle = backgroundColor;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 5;
    
    ctx.beginPath();
    
    for (let i = 0; i < selectedDots.length; i++) {
        const dot = selectedDots[i].element;
        const dotRect = dot.getBoundingClientRect();
        
        const x = dotRect.left - containerRect.left + dotRect.width / 2;
        const y = dotRect.top - containerRect.top + dotRect.height / 2;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
}
```

### Gravity System
```javascript
function applyGravity() {
    // For each column, move dots down
    for (let col = 0; col < gridSize; col++) {
        // Collect non-null dots from bottom to top
        const nonNullDots = [];
        for (let row = gridSize - 1; row >= 0; row--) {
            if (grid[row][col].color !== null) {
                nonNullDots.push(grid[row][col].color);
            }
        }
        
        // Fill column from bottom with existing dots
        let dotIndex = 0;
        for (let row = gridSize - 1; row >= 0; row--) {
            if (dotIndex < nonNullDots.length) {
                grid[row][col].color = nonNullDots[dotIndex];
                dotIndex++;
            } else {
                // Fill top with new random dots
                grid[row][col].color = Math.floor(Math.random() * numColors);
            }
        }
    }
    
    refreshGrid();
}
```

### Timer System
- Starts immediately when game begins
- Updates every second
- Displays as MM:SS format
- Game ends when timer reaches 0:00
- Final score is saved to Firestore

## UI/UX Features

### Visual Feedback
- **Selected Dots**: Scale up (1.15x) with pulsing glow animation
- **Connection Line**: Drawn dynamically using Canvas
- **Dot Colors**: Gradient backgrounds for visual appeal
- **Disappearing Animation**: Pop-out animation when dots are cleared
- **Hover Effects**: Dots scale up (1.1x) on hover

### Color Palette
- **Color 0 (Red)**: Linear gradient from #FF6B6B to #EE5A6F
- **Color 1 (Teal)**: Linear gradient from #4ECDC4 to #44A08D
- **Color 2 (Yellow)**: Linear gradient from #FFD93D to #F8C630
- **Color 3 (Green)**: Linear gradient from #A8E6CF to #3DDC97
- **Color 4 (Cyan)**: Linear gradient from #95E1D3 to #38A3A5

### Responsive Design
- Desktop-optimized with 60px dots
- Mobile-friendly with 50px dots (600px breakpoint)
- Ultra-mobile with 40px dots (400px breakpoint)
- Touch events properly handled
- Canvas resizes dynamically

## Algorithm Complexity

### Dot Selection: O(1)
- Direct array access
- Constant-time adjacency check

### Gravity Application: O(n × m)
- n = grid size
- m = number of columns
- Linear scan per column

### Render: O(n²)
- n = grid size
- Updates all dots after gravity

## Performance Optimizations
1. **Canvas for Lines**: Hardware-accelerated drawing
2. **Event Delegation**: Efficient event handling
3. **CSS Transitions**: Smooth animations via CSS
4. **Touch Optimization**: `touch-action: none` prevents scrolling
5. **Minimal Reflows**: Batch DOM updates

## Storage Usage
- **Leaderboard Data**: Stored in Firestore (managed by parent)
- **No LocalStorage**: All persistence handled by main menu
- **Session Only**: Game state not persisted between sessions

## Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (last 2 versions)
- **Required Features**: ES6+, Canvas 2D, CSS Grid, Flexbox
- **No Server Required**: Fully client-side application
- **Touch Support**: iOS Safari, Chrome Mobile, Firefox Mobile

## Known Limitations
1. **No Undo Feature**: Cannot undo completed chains
2. **No Hints System**: No algorithmic hints provided
3. **Single Player Only**: No multiplayer or competitive modes
4. **Fixed Timer**: Always 2 minutes per game

## Future Enhancement Ideas
- Move counter display
- Combo multipliers for consecutive chains
- Special power-ups (bombs, color changers)
- Achievement system
- Sound effects and background music
- Animation for dots falling
- Confetti animation on high scores
- Daily challenges
- Color-blind mode with patterns/shapes

## Testing Checklist
- [x] Easy mode (4×4, 3 colors) works correctly
- [x] Medium mode (5×5, 4 colors) works correctly
- [x] Hard mode (6×6, 5 colors) works correctly
- [x] Dot selection and connection works
- [x] Backtracking (removing last dot) works
- [x] Canvas line draws correctly
- [x] Scoring matches specification
- [x] Gravity fills correctly
- [x] Timer counts down properly
- [x] Game ends at 0:00
- [x] Score saves to Firestore
- [x] New record detection works
- [x] Language switching updates all text
- [x] Mobile touch controls work
- [x] Responsive design on all sizes
- [x] No diagonal connections allowed
- [x] Minimum 2 dots to score

## Code Organization

### Separation of Concerns
- **index.html**: Structure and layout only
- **style.css**: All visual styling and animations
- **script.js**: Game logic, state management, translations

### Function Responsibilities
- `selectDifficulty()`: Initialize game with difficulty settings
- `initGame()`: Set up grid, timer, and initial state
- `createGrid()`: Build DOM grid and canvas
- `createDot()`: Create individual dot element with events
- `startSelection()`: Begin chain selection
- `continueSelection()`: Add dot to chain
- `endSelection()`: Complete chain and score
- `applyGravity()`: Drop dots and fill empty spaces
- `drawConnections()`: Draw canvas line through selected dots
- `getParentLanguage()`: Get language from parent window
- `updateLanguage()`: Apply translations to DOM

### Naming Conventions
- **camelCase**: Function and variable names
- **SCREAMING_SNAKE_CASE**: Constants (DIFFICULTY_CONFIG, SCORING)
- **kebab-case**: CSS classes and IDs
- **PascalCase**: Not used in this project

## Debugging Tips
1. **Console Logging**: Add logs in `continueSelection()` to track chains
2. **State Inspection**: Check `gameState` object in browser console
3. **Canvas Issues**: Verify canvas size matches container
4. **Touch Problems**: Test `touch-action: none` CSS property
5. **Scoring**: Log chain length and points in `removeSelectedDots()`

## Credits
- Game Design: Inspired by Two Dots mobile game
- Visual Style: Modern gradient design
- Fonts: System fonts (Segoe UI, Tahoma, Geneva, Verdana)
- No external libraries or frameworks used

## Version History
- **v1.0** (2026): Initial release
  - Three difficulty levels
  - Bilingual support (EN/PT)
  - Firestore leaderboard integration
  - Touch and mouse support
  - Responsive design
  - Progressive scoring system

---

**Last Updated**: August 6, 2026
**Game Type**: Puzzle / Match-3 Variant
**Platform**: Web Browser (Desktop & Mobile)
**License**: Custom project for portfolio
