# Hangman - Implementation Documentation

## Overview
Classic word guessing game where players guess letters to reveal a hidden word. Each wrong guess adds a body part to the hangman figure. 6 wrong guesses = game over!

## Game Specifications

### Leaderboard
- **Metric**: `wordsGuessed` (number)
- **Direction**: Higher is better (descending sort)
- **Difficulty Modes**: None (single continuous mode)
- **Special Handling**: Uses `showWordleLeaderboard()` function (same pattern as Wordle)

### Scoring System
- Players accumulate words guessed correctly
- Win a word → wordsGuessedCount increases, auto-start next word
- Lose a word → streak resets to 0, game ends, option to save score
- Leaderboard ranks by total words guessed

### Game Mechanics
1. Random word selected from words.txt (1000 common words, 5-10 letters)
2. Player clicks letter buttons to guess
3. Correct guess → letter revealed, button turns green
4. Wrong guess → lives decrease, button turns red, body part appears
5. Win condition: All letters guessed before running out of lives
6. Loss condition: 6 wrong guesses (complete hangman figure)

### Continuous Play Mode
- When player wins a word, game automatically starts next word after 2 seconds
- Words guessed count increments
- Current streak tracks consecutive wins
- When player loses, score is **automatically saved** if better than previous record
- No manual save button needed - all scoring is automatic

## File Structure
```
Hangman/
├── index.html          # Game UI structure
├── script.js           # Game logic with bilingual support
├── style.css           # Responsive styling
├── words.txt           # 1000 common words (5-10 letters)
└── IMPLEMENTATION.md   # This file
```

## Key Features

### Visual Hangman Drawing
SVG-based gallows with 6 body parts:
1. Head
2. Body
3. Left arm
4. Right arm
5. Left leg
6. Right leg

Each wrong guess reveals one part in order.

### Visual Keyboard
- Grid of A-Z buttons
- Click to guess letter
- Color states:
  - Default: Purple (#667eea)
  - Correct: Green (#27ae60)
  - Wrong: Red (#e74c3c)
  - Disabled: Gray with opacity

### Bilingual Support (EN/PT)
Full translation support following arcade patterns:
- English: "Hangman"
- Portuguese: "Forca"

### Stats Display
- **Words Guessed**: Total cumulative count
- **Current Streak**: Consecutive wins (resets on loss)

### Responsive Design
- Desktop: Full-sized keyboard grid
- Mobile: Adapted grid layout (7 columns on small screens, 6 on very small)
- Touch-friendly buttons

## Integration with Arcade

### Main Arcade Files Modified
1. **games.json**
   - Added "Hangman" after "Wordle" (position 11)

2. **script.js** (main arcade)
   - Added translations (EN: "Hangman", PT: "Forca")
   - Added game description to `gameDescriptions`
   - Added special leaderboard handling: `showWordleLeaderboard()`

3. **icons/Hangman.svg**
   - Created purple gradient icon with gallows and stick figure

### Leaderboard Integration
```javascript
// In script.js showGameLeaderboard() function
if (gameName === "Hangman") {
  showWordleLeaderboard(db, content, gameName);
  return;
}
```

Uses existing `showWordleLeaderboard()` function because:
- Same metric: `wordsGuessed` (cumulative count)
- Same direction: Higher is better
- No difficulty modes

### Score Saving Pattern
```javascript
window.parent.saveGameScore("Hangman", {
    wordsGuessed: wordsGuessedCount
});
```

Saved to Firestore:
```javascript
{
  gameName: "Hangman",
  playerName: "Player1",
  wordsGuessed: 25,
  timestamp: firebase.firestore.FieldValue.serverTimestamp()
}
```

## Technical Implementation

### Word Loading
- Async fetch from `words.txt`
- 1000 words, 5-10 letters each
- Fallback words if file load fails
- Words converted to uppercase

### Game State
```javascript
{
  wordList: [],              // All available words
  currentWord: '',           // Current word to guess
  guessedLetters: [],        // All letters guessed
  correctLetters: [],        // Correct letters only
  wrongLetters: [],          // Wrong letters only
  lives: 6,                  // Remaining lives
  wordsGuessedCount: 0,      // Total words guessed
  currentStreak: 0,          // Consecutive wins
  gameActive: false,         // Game in progress?
  scoreSaved: false          // Score already saved?
}
```

### Functions
- `loadWords()` - Fetch words from file
- `generateKeyboard()` - Build A-Z button grid
- `startGame()` - Initialize new word
- `guessLetter(letter)` - Process guess
- `updateWordDisplay()` - Refresh hidden word
- `updateLives()` - Update lives counter
- `updateWrongLetters()` - Display wrong guesses
- `updateStats()` - Refresh stats display
- `checkWin()` - Check if word complete
- `endGame(won)` - Handle game end
- `showBodyPart(index)` - Reveal body part
- `hideAllBodyParts()` - Reset figure

### Language System
Uses arcade-standard bilingual pattern:
- `getParentLanguage()` - Get language from parent
- `t(key)` - Translate key
- `updateLanguage()` - Update all UI text
- Listens for `languageChange` messages

## User Experience Flow

### Starting a Game
1. Page loads → words.txt fetched
2. Random word selected
3. Keyboard generated
4. Hidden word displayed as underscores
5. Stats show: Words Guessed: 0, Streak: 0

### During Gameplay
1. Player clicks letter button
2. Button disabled and colored
3. If correct: Letter revealed in word
4. If wrong: Life lost, body part shown, wrong letters list updated
5. Continue until win or loss

### Winning a Word
1. "🎉 You Won!" message appears
2. Words guessed count increases
3. Current streak increases
4. After 2 seconds: Auto-start next word
5. Continue playing...

### Losing a Word
1. "Game Over! The word was: [WORD]" message appears
2. Streak resets to 0
3. **Score automatically saved** if words guessed > 0
4. If new personal best, message updates to show "NEW RECORD!"
5. "Play Again" button appears
6. Player can restart to begin a new streak

## Testing Checklist

### Standalone Tests
- [x] Words load from words.txt
- [x] Random word selection works
- [x] Keyboard generates correctly
- [x] Letter guessing logic correct
- [x] Body parts appear in order
- [x] Win detection works
- [x] Loss detection works
- [x] Auto-continue after win works
- [x] Stats update correctly
- [x] Score saving works

### Integration Tests
- [x] Added to games.json
- [x] Translations added (EN/PT)
- [x] Game description added
- [x] Icon created and placed
- [x] Special leaderboard handling added
- [x] Launches from main menu
- [x] Language switching works
- [x] Score saves to Firestore
- [x] Leaderboard displays correctly

### Browser Compatibility
- [x] Chrome
- [x] Firefox
- [x] Safari
- [x] Edge
- [x] Mobile responsive

## Future Enhancements (Not Implemented)
- Category selection (animals, countries, etc.)
- Difficulty modes (word length variations)
- Hint system
- Time challenges
- Multiplayer mode
- Sound effects
- Animations for body parts

## Known Behaviors
- Game auto-continues after win (intentional for streak building)
- Score **automatically saved** when player loses (if words guessed > 0)
- New record notification shows briefly in game over message
- Streak resets only on loss, not on page refresh during play
- No manual save button needed - scoring is fully automatic

## File Sizes
- index.html: ~3KB
- script.js: ~10KB
- style.css: ~6KB
- words.txt: ~7KB
- Total: ~26KB (very lightweight)

---

**Created**: August 6, 2026  
**Last Updated**: August 6, 2026  
**Version**: 1.0  
**Status**: Complete and integrated
