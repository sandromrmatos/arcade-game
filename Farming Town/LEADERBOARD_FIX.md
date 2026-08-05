# Leaderboard Fix for Farming Town

## Problem
The leaderboard for Farming Town was displaying the wrong columns:
- ❌ Showing "Best Time" column (time-based game format)
- ❌ Displaying "NaN:NaN" values
- ❌ Missing "Level" column
- ❌ Missing "XP" column
- ❌ Not sorted by XP

## Root Cause
The main `script.js` file in the arcade root directory had no special handling for Farming Town. It was falling through to the default time-based leaderboard display, which is designed for games like Snake, Tetris, etc.

## Solution
Added custom leaderboard handler specifically for Farming Town that:
1. Displays the correct columns: Rank, Player, Level, XP, Date
2. Sorts by XP in descending order (highest XP first)
3. Shows top 10 players
4. Uses proper field names from Farming Town's database structure

## Implementation

### 1. Added Special Game Routing
**File**: `script.js` (root)
**Location**: Inside `showGameLeaderboard()` function

```javascript
// Special handling for Farming Town (XP/Level progression)
if (gameName === "Farming Town") {
  showFarmingTownLeaderboard(db, content, gameName);
  return;
}
```

### 2. Created Custom Leaderboard Function
**File**: `script.js` (root)
**Function**: `showFarmingTownLeaderboard()`

```javascript
function showFarmingTownLeaderboard(db, content, gameName) {
  db.collection("games")
    .limit(100)
    .get()
    .then(snapshot => {
      // Filter for Farming Town and sort by XP (score field) descending
      const docs = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(doc => doc.gameName === gameName)
        .sort((a, b) => (b.xp || b.score || 0) - (a.xp || a.score || 0))
        .slice(0, 10);
      
      if (docs.length === 0) {
        content.innerHTML = `<p style="color: #666;">${t("noScores")}</p>`;
        return;
      }
      
      let html = '<table class="leaderboard-table"><thead><tr><th>Rank</th><th>Player</th><th>Level</th><th>XP</th><th>Date</th></tr></thead><tbody>';
      
      let rank = 1;
      docs.forEach(doc => {
        const level = doc.level || 1;
        const xp = doc.xp || doc.score || 0;
        const date = doc.lastPlayed ? new Date(doc.lastPlayed.toDate()).toLocaleDateString() : 
                     (doc.timestamp ? new Date(doc.timestamp.toDate()).toLocaleDateString() : 'N/A');
        
        html += `<tr>
          <td>${rank++}</td>
          <td>${doc.playerName}</td>
          <td>${level}</td>
          <td>${xp}</td>
          <td>${date}</td>
        </tr>`;
      });
      
      html += "</tbody></table>";
      content.innerHTML = html;
    })
    .catch(err => {
      content.textContent = t("errorLoading") + " " + err.message;
      console.error("Leaderboard error:", err);
    });
}
```

### 3. Added Translations
**File**: `script.js` (root)

Added Farming Town to both English and Portuguese translations:
- English: "Farming Town"
- Portuguese: "Cidade Agrícola"

## Database Structure

### Expected Fields in Firebase
**Collection**: `games`
**Document ID**: `farmingTown_${playerId}`

```json
{
  "playerName": "Sandro",
  "gameName": "Farming Town",
  "level": 10,
  "xp": 5000,
  "score": 5000,
  "lastPlayed": Timestamp,
  "timestamp": Timestamp
}
```

### Key Fields
- **xp**: Primary sorting field (also stored in `score` for compatibility)
- **level**: Displayed in leaderboard
- **lastPlayed**: Preferred timestamp field
- **timestamp**: Fallback timestamp field

## Leaderboard Display

### Table Structure
```
+------+---------+-------+------+------------+
| Rank | Player  | Level | XP   | Date       |
+------+---------+-------+------+------------+
| 1    | Sandro  | 10    | 5000 | 04/08/2026 |
| 2    | Player2 | 8     | 3200 | 04/07/2026 |
| 3    | Player3 | 6     | 1500 | 04/06/2026 |
+------+---------+-------+------+------------+
```

### Sorting Logic
- **Primary**: By XP descending (highest first)
- **Fallback**: If `xp` field missing, uses `score` field
- **Default**: 0 if both missing

### Date Display
- **Primary**: `lastPlayed` timestamp
- **Fallback**: `timestamp` field
- **Default**: "N/A" if both missing

## Comparison with Other Games

### Time-Based Games (Snake, Memory, etc.)
```javascript
// Sort by bestTime ascending (lowest first)
.sort((a, b) => a.bestTime - b.bestTime)

// Display: Rank | Player | Best Time | Date
```

### Score-Based Games (Tetris, Hammer the Ant, etc.)
```javascript
// Sort by score descending (highest first)
.sort((a, b) => b.score - a.score)

// Display: Rank | Player | Score | Date
```

### Farming Town (XP/Level Based)
```javascript
// Sort by XP descending (highest first)
.sort((a, b) => (b.xp || b.score || 0) - (a.xp || a.score || 0))

// Display: Rank | Player | Level | XP | Date
```

## Testing

### Manual Test Steps
1. Open arcade home page
2. Click "Leaderboard" button
3. Click "Farming Town" game icon
4. Verify table shows:
   - ✅ Rank column
   - ✅ Player column  
   - ✅ Level column
   - ✅ XP column
   - ✅ Date column
5. Verify sorting (highest XP at top)
6. Verify no "NaN:NaN" values
7. Test refresh button
8. Test in both English and Portuguese

### Expected Results
- ✅ Table displays 5 columns
- ✅ Players sorted by XP descending
- ✅ Level and XP show actual values
- ✅ Date shows last played date
- ✅ No error messages
- ✅ Refresh button updates data

### Edge Cases
- **No scores yet**: Shows "No scores yet. Be the first!"
- **Missing xp field**: Falls back to `score` field
- **Missing both**: Uses 0 as default
- **Missing timestamp**: Shows "N/A"

## Benefits
- ✅ Correct columns for progression-based game
- ✅ Meaningful leaderboard (XP > Level > Progress)
- ✅ Consistent with game's core mechanics
- ✅ Sorted correctly (highest achievers first)
- ✅ Shows relevant date (last time played)
- ✅ Bilingual support (EN/PT)

## Future Enhancements

### Possible Additions
- [ ] Show player's current rank even if not in top 10
- [ ] Add "Grid Size" column to show farm progression
- [ ] Color-code by level (bronze/silver/gold tiers)
- [ ] Add trend indicators (↑↓) for rank changes
- [ ] Filter by time period (daily/weekly/all-time)
- [ ] Show additional stats (coins, tiles, buildings)

### Performance Optimization
- [ ] Add database index on `xp` field for faster sorting
- [ ] Cache results for 30 seconds to reduce queries
- [ ] Implement pagination for players beyond top 10

## Related Files
- ✅ `script.js` (root) - Leaderboard display logic
- ✅ `Farming Town/script.js` - Game data submission
- ✅ Firebase collection: `games`
- ✅ Document ID format: `farmingTown_${playerId}`

## Status
✅ **FIXED** - Leaderboard now displays correctly for Farming Town with proper columns and sorting
