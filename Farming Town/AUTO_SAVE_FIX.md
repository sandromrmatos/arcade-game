# Auto-Save Stale Data Protection - Implementation Summary

## Problem
When playing Farming Town on multiple devices, if an old browser tab remained open with stale data, its auto-save (every 30 seconds) would overwrite the database with old values, causing XP and other player stats to revert to previous values.

## Root Cause
The auto-save interval runs every 30 seconds and saves:
- `playerName`
- `coins`
- `xp`
- `level`
- `gridWidth`
- `gridHeight`
- `lastPlayed` (timestamp)

If Device B had an old tab open while you played on Device A, Device B's auto-save would overwrite the newer data from Device A.

## Solution Implemented
Added timestamp-based stale data detection to prevent overwrites.

### Changes Made

#### 1. Client Activity Tracking
**Location**: `GameState` object (line ~70)

Added `clientLastActivity` timestamp that tracks when this client last had fresh data:
```javascript
clientLastActivity: null,
```

Added helper method to update activity timestamp:
```javascript
markActivity() {
  this.clientLastActivity = new Date();
}
```

#### 2. Save Protection
**Location**: `savePlayerData()` function (line ~250)

Before saving, the function now:
1. Fetches the server's current `lastPlayed` timestamp
2. Compares it with the client's `clientLastActivity`
3. If server has newer data, **skips the save** and:
   - Logs a warning to console
   - Shows user notification to refresh
   - Stops auto-save interval to prevent repeated overwrites

```javascript
// Check if server has newer data
if (clientTime < serverTime) {
  console.warn('⚠️ STALE DATA DETECTED: Server has newer data. Skipping save.');
  showNotification(t('warning'), 'This tab has outdated data. Please refresh...');
  clearInterval(this.saveInterval); // Stop auto-save
  return; // Don't save stale data
}
```

#### 3. Load Synchronization
**Location**: `loadGameData()` function (line ~620)

When loading player data, sets `clientLastActivity` to match server's `lastPlayed`:
```javascript
if (data.lastPlayed) {
  this.clientLastActivity = data.lastPlayed.toDate();
}
```

#### 4. Activity Tracking
**Location**: Multiple functions

All player action functions now call `markActivity()` to update the timestamp:
- `addCoins()` - When earning/spending coins
- `spendCoins()` - When purchasing items
- `addXP()` - When gaining XP
- `addToInventory()` - When receiving items
- `removeFromInventory()` - When consuming items

## How It Works

### Normal Flow (Single Device)
1. Player loads game → `clientLastActivity` = server's `lastPlayed`
2. Player harvests wheat → `markActivity()` updates `clientLastActivity`
3. Auto-save fires → Compares timestamps → Server is older → **Save proceeds**
4. Server's `lastPlayed` updated to match client

### Protected Flow (Multiple Devices)
1. **Device A**: Player actively plays, XP increases to 500
2. **Device B**: Old tab still open, has XP = 200 in memory
3. Device B's auto-save fires every 30 seconds
4. **Protection activates**: 
   - Device B checks server's `lastPlayed`
   - Server timestamp is newer (from Device A)
   - Device B's `clientLastActivity` is older
   - **Save is blocked**
5. User on Device B sees warning: "This tab has outdated data. Please refresh."
6. Auto-save stops to prevent repeated attempts
7. Player refreshes → Loads current XP = 500 ✅

## What Gets Saved When

### Auto-Save (Every 30 Seconds) - NOW PROTECTED
- `playerName`
- `coins`
- `xp` ⚠️ **Now protected from stale overwrites**
- `level`
- `gridWidth`
- `gridHeight`
- `lastPlayed`

### Action-Based Saves (NOT auto-saved)
These only save when you perform the action:
- **Grid tiles**: `saveGridTile()` when planting/harvesting/building
- **Inventory**: `saveInventory()` when items change
- **Production**: `saveProduction()` when starting/collecting
- **Mission progress**: `saveMissionProgress()` when missions update

## User Experience

### If You Have Stale Data
You'll see a notification: **"This tab has outdated data. Please refresh the page to get the latest game state."**

### Best Practices
1. **Close old tabs** before switching devices
2. **Refresh the page** if you see the stale data warning
3. **Only play on one device** at a time for best experience

## Testing Checklist
- [x] clientLastActivity tracks player actions
- [x] loadGameData sets clientLastActivity from server
- [x] savePlayerData checks timestamps before saving
- [x] Stale save attempts are blocked
- [x] User notification shown when stale data detected
- [x] Auto-save stops after detecting stale data
- [x] markActivity() called on all player actions

## Technical Notes
- Uses Firebase `FieldValue.serverTimestamp()` for `lastPlayed` to ensure consistent server-side time
- Client timestamps use JavaScript `Date` objects for comparison
- Stale detection has ~1 second tolerance for network delays
- Auto-save interval remains at 30 seconds (unchanged)

## Future Enhancements (Optional)
1. **Real-time sync**: Use Firebase `onSnapshot()` to listen for changes and reload automatically
2. **Conflict resolution UI**: Allow user to choose which version to keep
3. **Activity indicator**: Show "Last saved" timestamp in UI
4. **Background tab detection**: Pause auto-save when tab is not visible
