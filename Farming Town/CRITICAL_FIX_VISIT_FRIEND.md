# CRITICAL FIX: Visit a Friend Data Corruption

## The Bug (CRITICAL - DATA LOSS)

### What Happened
When visiting a friend's farm, the game was **overwriting the current player's database records** with the friend's data. This caused:
- ❌ Player name changed to friend's name
- ❌ Level/XP overwritten with friend's stats
- ❌ Coins replaced with friend's coins
- ❌ Grid data corruption
- ❌ **PERMANENT DATA LOSS** for the visiting player

### Root Cause
Two critical issues:

1. **Auto-save still running**: The 30-second auto-save interval (`GameState.saveInterval`) continued running while visiting a friend
2. **No write protection**: Save functions (`savePlayerData`, `saveGridTile`, etc.) had no checks to prevent writes during friend visits
3. **GameState contamination**: Friend's data was loaded into `GameState` (which uses the current player's `playerId`)

Result: Every 30 seconds, the game saved friend's data under the current player's ID → **complete data overwrite**.

## The Fix

### 1. Disable Auto-Save During Visits
In `visitPlayerFarm()`:
```javascript
// CRITICAL: Stop auto-save to prevent overwriting player data
if (GameState.saveInterval) {
  clearInterval(GameState.saveInterval);
  GameState.saveInterval = null;
  console.log('Auto-save disabled during friend visit');
}
```

### 2. Re-enable Auto-Save on Return
In `returnToMyFarm()`:
```javascript
// CRITICAL: Restart auto-save after returning
if (!GameState.saveInterval) {
  GameState.saveInterval = setInterval(() => {
    GameState.savePlayerData();
  }, 30000);
  console.log('Auto-save re-enabled');
}
```

### 3. Add Write Guards to ALL Save Functions
Added `isVisitingFriend` check to every save method:

```javascript
async savePlayerData() {
  // CRITICAL: Prevent saving while visiting a friend
  if (isVisitingFriend) {
    console.log('Blocked save: currently visiting a friend');
    return;
  }
  // ... rest of save logic
}

async saveGridTile(tile) {
  // CRITICAL: Prevent saving while visiting a friend
  if (isVisitingFriend) {
    console.log('Blocked tile save: currently visiting a friend');
    return;
  }
  // ... rest of save logic
}

async saveInventory() {
  // CRITICAL: Prevent saving while visiting a friend
  if (isVisitingFriend) {
    console.log('Blocked inventory save: currently visiting a friend');
    return;
  }
  // ... rest of save logic
}

async saveProduction(buildingX, buildingY, slotIndex, productionData) {
  // CRITICAL: Prevent saving while visiting a friend
  if (isVisitingFriend) {
    console.log('Blocked production save: currently visiting a friend');
    return;
  }
  // ... rest of save logic
}

async updateLeaderboard() {
  // CRITICAL: Prevent leaderboard updates while visiting a friend
  if (isVisitingFriend) {
    console.log('Blocked leaderboard update: currently visiting a friend');
    return;
  }
  // ... rest of save logic
}
```

## Protected Functions

All Firebase write operations are now protected:
- ✅ `GameState.savePlayerData()` - Player stats
- ✅ `GameState.saveGridTile()` - Tile data
- ✅ `GameState.saveInventory()` - Inventory items
- ✅ `GameState.saveProduction()` - Building production
- ✅ `GameState.updateLeaderboard()` - Leaderboard entries

## How It Works Now

### Before Visit
```
Player A (playerId: player_123)
├─ Auto-save: ✅ Running (every 30s)
├─ GameState.playerName: "Player A"
├─ GameState.level: 10
└─ GameState.coins: 500
```

### During Visit
```
Player A visits Player B's farm
├─ Auto-save: ❌ STOPPED
├─ GameState.playerName: "Player B" (read-only)
├─ GameState.level: 15 (read-only)
├─ GameState.coins: 1000 (read-only)
├─ isVisitingFriend: true
└─ All save attempts: BLOCKED ✋
```

### After Return
```
Player A returns to own farm
├─ Auto-save: ✅ RESTARTED
├─ GameState restored from originalGameState
├─ GameState.playerName: "Player A"
├─ GameState.level: 10
├─ GameState.coins: 500
└─ isVisitingFriend: false
```

## Verification

### Console Logs to Watch For

**When visiting:**
```
Auto-save disabled during friend visit
```

**If any save is attempted during visit:**
```
Blocked save: currently visiting a friend
Blocked tile save: currently visiting a friend
Blocked inventory save: currently visiting a friend
```

**When returning:**
```
Auto-save re-enabled
```

### Testing Procedure

1. **Start as Player A** (note your stats)
2. **Visit Player B** (note friend's stats)
3. **Wait 60 seconds** (past two auto-save intervals)
4. **Check browser console** - should see "Blocked save" messages
5. **Return to your farm**
6. **Verify your stats are unchanged** ✓

## Additional Safety Measures

### State Preservation
- Original game state saved in `originalGameState` before visit
- Deep copy used to prevent reference contamination
- State fully restored on return

### UI Indicators
- Yellow banner: "Visiting [Name] - (View Only)"
- `.viewing-mode` CSS class disables all tile clicks
- Action buttons hidden (Inventory, Marketplace, Create Plot)
- Only Help and Return buttons available

### Multiple Visit Protection
```javascript
if (!isVisitingFriend) {
  originalGameState = { ... };  // Only save once
}
```

## Edge Cases Handled

### ✅ Multiple Visits Without Returning
- Can visit Player B, then visit Player C without returning
- Original state preserved from first visit
- Only one restore needed

### ✅ Browser Refresh During Visit
- `isVisitingFriend` is in-memory only
- After refresh, loads own data (not friend's)
- Safe but loses visit session

### ✅ Page Close During Visit
- Auto-save already stopped
- No data written on page close
- Player data remains intact

### ✅ Network Errors
- Save attempts fail silently (already in try-catch)
- isVisitingFriend check happens before network call
- No partial writes possible

## What Players See

### Before Fix (BUG)
1. Visit friend with level 20
2. Wait 30 seconds
3. Return to own farm
4. **Your level is now 20** (BUG - data corrupted!)

### After Fix (CORRECT)
1. Visit friend with level 20
2. Wait 30 seconds
3. Console: "Blocked save: currently visiting a friend"
4. Return to own farm
5. **Your level unchanged** ✓ (data protected!)

## Recovery for Affected Players

If players already experienced data corruption:

### Option 1: Manual Restore (If Backup Exists)
- Firebase console → Firestore → farmingTownPlayers
- Find player document by ID
- Manually restore correct values

### Option 2: Rollback (If Recent)
- Use Firestore export/import from before corruption
- Time-based point-in-time recovery

### Option 3: Fresh Start
- Player creates new account
- Delete corrupted player document
- Start fresh with fixed code

## Prevention Checklist

For any future features that display other players' data:

- [ ] Stop auto-save intervals
- [ ] Add `isViewingMode` flag
- [ ] Guard all save functions
- [ ] Save original state before switching context
- [ ] Restore state when exiting view mode
- [ ] Add console logs for debugging
- [ ] Test with 60+ second visits
- [ ] Verify no database writes occur
- [ ] Check browser console for blocked saves

## Related Code Files

**Modified:**
- `script.js` - Added guards to all save methods
- `script.js` - Auto-save stop/start in visit/return functions

**Testing Files:**
- `VISIT_FRIEND_FEATURE.md` - Original feature documentation
- `CRITICAL_FIX_VISIT_FRIEND.md` - This fix documentation

## Status

✅ **FIXED** - All database writes blocked during friend visits
✅ **TESTED** - Console logs confirm blocks
✅ **DEPLOYED** - Safe for production use

## Final Notes

This was a **CRITICAL security/data-integrity bug** that could have caused:
- Complete player progress loss
- Player identity confusion
- Data corruption across multiple accounts
- Loss of trust in the game

The fix implements **defense in depth**:
1. Stop auto-save timer
2. Guard each save function individually
3. Use viewing mode flag
4. Log all blocked attempts

**Never assume auto-save won't run** - always explicitly stop it when displaying alternate data!
