# Two Dots - Leaderboard Fix Summary

## Issue
The leaderboard was displaying as "Best Time" in a single combined table instead of showing "Score" in 3 separate difficulty tables.

## Root Cause
1. Two Dots was not included in the special leaderboard handling section of `script.js`
2. The `showScoreBasedLeaderboard()` function only handled 2 difficulties (easy/hard), missing medium

## Changes Made

### 1. Added Two Dots Special Handling (script.js ~line 1208)
```javascript
// Special handling for Two Dots (score - higher is better, with difficulty modes)
if (gameName === "Two Dots") {
  showScoreBasedLeaderboard(db, content, gameName);
  return;
}
```

### 2. Updated showScoreBasedLeaderboard Function (script.js ~line 1406)
- Added medium difficulty filtering and sorting
- Added `hasThreeDifficulties` check that includes "Two Dots"
- Added medium mode table display section
- Now displays 3 separate tables for easy/medium/hard

**Key Addition:**
```javascript
const mediumDocs = allDocs
  .filter(doc => doc.difficulty === "medium")
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

const hasThreeDifficulties = mediumDocs.length > 0 || gameName === "Two Dots";
```

### 3. Updated CREATING_NEW_GAME.md Documentation
Added comprehensive section titled **"⚠️ CRITICAL: Specify Leaderboard Requirements When Creating Games"**

**New Requirements:**
- Must specify metric type (score, bestTime, timeLeft, turns, length, rounds, etc.)
- Must specify direction (higher is better vs lower is better)
- Must specify if game has difficulty modes and whether to split leaderboard

**Added Examples:**
- ✅ Good examples with clear specifications
- ❌ Bad examples showing what NOT to do

**Updated Scoring Patterns:**
- Pattern A: Higher is Better (Score-based) - includes Two Dots
- Pattern B: Lower is Better (Time-based)
- Pattern C: Higher is Better (Time Remaining)
- Pattern D: Lower is Better (Turns/Moves)
- Pattern E: Higher is Better (Length/Size)
- Pattern F: Cumulative Records
- Pattern G: Win Rate

## How It Works Now

### Data Saved from Game
```javascript
window.parent.saveGameScore("Two Dots", {
  score: 150,           // Total points earned
  difficulty: "medium"  // easy, medium, or hard
});
```

### Leaderboard Display
1. **Query**: Fetches all "Two Dots" scores from Firestore
2. **Filter**: Separates scores by difficulty (easy/medium/hard)
3. **Sort**: Sorts each group by score descending (higher is better)
4. **Display**: Shows 3 separate tables side-by-side with top 10 per difficulty
5. **Headers**: Uses `getTableHeader("score")` which displays "Score" column

### Table Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Easy Mode    │   Medium Mode   │    Hard Mode              │
├───────────────┼─────────────────┼───────────────────────────┤
│ Rank | Player │ Rank | Player   │ Rank | Player | Score ... │
│    1 | Name   │    1 | Name     │    1 | Name   | 250   ... │
│    2 | Name   │    2 | Name     │    2 | Name   | 240   ... │
│  ... | ...    │  ... | ...      │  ... | ...    | ...   ... │
└───────────────┴─────────────────┴───────────────────────────┘
```

## Verification Steps

### To Test:
1. Open the arcade main page
2. Play Two Dots in different difficulty modes
3. Save some scores
4. Open leaderboard from main menu
5. Verify:
   - ✅ Shows 3 separate tables (Easy/Medium/Hard)
   - ✅ Column header shows "Score" not "Best Time"
   - ✅ Scores sorted descending (highest first)
   - ✅ Each difficulty isolated to its own table

## Future Games

When creating new games, always specify in the request:
- **Metric**: What is measured (score, time, turns, etc.)
- **Direction**: Higher or lower is better
- **Difficulties**: Single table or split by difficulty

Example request:
```
"Create a puzzle game with 3 difficulty modes.
LEADERBOARD: bestTime metric, lower is better, split by difficulty."
```

## Files Modified
1. `c:\Users\sandr\Downloads\Games\script.js` (lines ~1208, ~1406-1500)
2. `c:\Users\sandr\Downloads\Games\CREATING_NEW_GAME.md` (Special Leaderboard Handling section, Scoring Patterns section)

## Status
✅ **FIXED** - Two Dots leaderboard now displays correctly with:
- Score metric (not time)
- Higher is better sorting
- 3 separate difficulty tables
- Proper column headers

---

**Date**: August 6, 2026
**Issue**: Leaderboard showing wrong metric and combined tables
**Resolution**: Added special handling + updated function to support 3 difficulties
