# Restaurant Game - Player Name Fix ✅

## Issue Identified
Player scores were not saving to Firebase due to incorrect player name retrieval method.

### Error in Console:
```
No player name found from parent window
Cannot load player data: no player name
```

## Root Cause

Restaurant game was using incorrect method to get player name from parent window:

**❌ WRONG (Restaurant - Before Fix)**:
```javascript
async function getPlayerName() {
    if (window.parent && window.parent.playerName) {
        return window.parent.playerName;
    }
    
    if (window.parent && window.parent.localStorage) {
        const name = window.parent.localStorage.getItem('playerName');  // ← WRONG KEY!
        if (name) return name;
    }
    
    return null;
}
```

**✅ CORRECT (Farming Town - Reference)**:
```javascript
let playerName = localStorage.getItem('farmingTownPlayerName');
if (!playerName) {
    if (window.parent && window.parent.localStorage) {
        try {
            playerName = window.parent.localStorage.getItem('arcadePlayerName');  // ← CORRECT KEY!
        } catch (e) {
            console.log('Cannot access parent player name');
        }
    }
}
```

## The Problem

The arcade system stores the player name in:
- **Key**: `'arcadePlayerName'`  
- **Location**: `window.parent.localStorage`

Restaurant was looking for:
- ❌ `window.parent.playerName` (direct property - doesn't exist)
- ❌ `window.parent.localStorage.getItem('playerName')` (wrong key!)

## Solution Applied

Updated `getPlayerName()` function in `Restaurant/script.js` to use correct method:

```javascript
async function getPlayerName() {
    // Get player name from parent window (arcade)
    // First try: parent localStorage with correct key 'arcadePlayerName'
    if (window.parent && window.parent.localStorage) {
        try {
            const name = window.parent.localStorage.getItem('arcadePlayerName');  // ✅ CORRECT!
            if (name) return name;
        } catch (e) {
            console.log('Cannot access parent localStorage');
        }
    }
    
    // Second try: direct property (backup method)
    if (window.parent && window.parent.playerName) {
        return window.parent.playerName;
    }
    
    // If no name found, return null (shouldn't happen in arcade)
    console.warn('No player name found from parent window');
    return null;
}
```

### Key Changes:
1. ✅ Primary method: `window.parent.localStorage.getItem('arcadePlayerName')`
2. ✅ Try-catch for safety (cross-origin issues)
3. ✅ Fallback to direct property (backup)
4. ✅ Graceful null return if not found

## Impact

### Before Fix:
- ❌ Player name always returned `null`
- ❌ Scores never saved to Firebase
- ❌ No leaderboard entries
- ❌ Console errors every game

### After Fix:
- ✅ Player name correctly retrieved from arcade
- ✅ Scores save to Firebase
- ✅ Leaderboard populates
- ✅ No console errors

## Testing

### Test Cases:
1. ✅ Play game through arcade (iframe)
2. ✅ Complete level and win
3. ✅ Check Firebase `restaurantPlayers` collection
4. ✅ View leaderboard in arcade menu
5. ✅ Verify player name appears in leaderboard
6. ✅ Check console for errors (should be none)

### Expected Behavior:
- Player name retrieved on game load
- Firebase query uses player name
- Best scores saved per level (1, 2, 3)
- Leaderboard shows 3 separate tables
- No console warnings about missing player name

## Files Modified

1. **Restaurant/script.js** (2 occurrences updated):
   - Line ~1554: First `getPlayerName()` function
   - Line ~1203: Second `getPlayerName()` function (duplicate removed by replace_all)
   
2. **CREATING_NEW_GAME.md**:
   - Updated "Player Name Management" section
   - Added correct implementation pattern
   - Added reference to Farming Town as working example
   - Documented wrong vs correct approaches

## Documentation Update

Updated `CREATING_NEW_GAME.md` with correct pattern:

### Added:
- ✅ Correct localStorage key: `'arcadePlayerName'`
- ✅ Try-catch pattern for cross-origin safety
- ✅ Reference to Farming Town implementation
- ✅ Example of wrong vs correct code
- ✅ Warning about common mistake (wrong key)

### Key Section Added:
```markdown
❌ **WRONG**: Using wrong localStorage key
```javascript
// DO NOT DO THIS!
async function getPlayerName() {
    // This will NOT work - key is 'arcadePlayerName' not 'playerName'
    const name = window.parent.localStorage.getItem('playerName');
    return name;
}
```

✅ **CORRECT**: Using parent window player name with correct key
```javascript
// DO THIS!
async function getPlayerName() {
    // Primary method: parent localStorage with 'arcadePlayerName' key
    if (window.parent && window.parent.localStorage) {
        try {
            const name = window.parent.localStorage.getItem('arcadePlayerName');
            if (name) return name;
        } catch (e) {
            console.log('Cannot access parent localStorage');
        }
    }
    
    // Fallback: direct property
    if (window.parent && window.parent.playerName) {
        return window.parent.playerName;
    }
    
    return null; // Don't prompt!
}
```
```

## Arcade System Context

### How Player Name is Set:
The main arcade (`index.html` + `script.js`) prompts for player name on first visit:

```javascript
// In main script.js
let playerName = localStorage.getItem('arcadePlayerName');
if (!playerName) {
    playerName = prompt('Enter your name:') || 'Player';
    localStorage.setItem('arcadePlayerName', playerName);
}
```

### How Games Access It:
All games run in iframes and access parent localStorage:

```javascript
// In game script.js (inside iframe)
const name = window.parent.localStorage.getItem('arcadePlayerName');
```

**Why this works**:
- Same origin (all files served from same domain/port)
- Parent and iframe can share localStorage
- No CORS issues in local/same-origin setup

## Future Prevention

All new games should:
1. ✅ Use `window.parent.localStorage.getItem('arcadePlayerName')`
2. ✅ Reference Farming Town as working example
3. ✅ Follow CREATING_NEW_GAME.md documentation
4. ✅ Test player name retrieval before integrating
5. ✅ Check console for warnings during development

## Related Issues Prevented

This fix also prevents:
- ❌ Duplicate player records (if name was wrong)
- ❌ Lost scores (if saved under wrong identifier)
- ❌ Leaderboard not showing any data
- ❌ "New Best Score" notification never triggering
- ❌ Firebase queries returning no results

---

**Status**: Player name retrieval fixed ✅  
**Date**: August 7, 2026  
**Applied By**: Kiro AI Assistant  
**Reference Game**: Farming Town (working example)

---

## Quick Reference

### Correct Implementation:
```javascript
// ✅ USE THIS PATTERN IN ALL NEW GAMES
async function getPlayerName() {
    if (window.parent && window.parent.localStorage) {
        try {
            const name = window.parent.localStorage.getItem('arcadePlayerName');
            if (name) return name;
        } catch (e) {
            console.log('Cannot access parent localStorage');
        }
    }
    return null;
}
```

### Common Mistakes:
```javascript
// ❌ DON'T USE THESE
window.parent.playerName                              // Property doesn't exist
window.parent.localStorage.getItem('playerName')      // Wrong key
localStorage.getItem('playerName')                    // Game's own localStorage (wrong)
prompt('Enter your name:')                            // Never prompt!
```

---

## Summary

The Restaurant game now correctly retrieves the player name from the arcade system, allowing scores to be saved to Firebase and displayed on the leaderboard. The fix follows the same pattern used by Farming Town and other working games in the arcade.
