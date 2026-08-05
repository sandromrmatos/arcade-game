# Player System Fix - Name-Based Account System

## Problems Fixed

### 1. Leaderboard Showing Outdated Data
**Problem**: Leaderboard displayed old stats even after playing
**Root Cause**: `updateLeaderboard()` was only called on level up
**Fix**: Now updates on:
- Game initialization
- Every auto-save (30 seconds)
- Every XP gain
- Every level up

### 2. New Player Created Per Browser
**Problem**: Same player name on different browsers/devices created separate accounts
**Root Cause**: Player ID was generated per browser session using random ID
**Fix**: Player lookup now by `playerName` in Firestore - same name = same account across devices

## How the New System Works

### Player Initialization Flow

```
1. Game starts
2. Get player name from:
   - localStorage (if exists)
   - Parent window arcade (if available)
   - Prompt user (if neither)
3. Query Firestore: WHERE playerName == name
4. If found:
   - Use existing player's ID
   - Load their entire game state
5. If not found:
   - Create new player ID
   - Initialize new game
6. Save player ID to localStorage for quick access
```

### Old System (Per-Browser)
```
Browser A: "Sandro" → player_123 (Level 10)
Browser B: "Sandro" → player_456 (Level 1)  ❌ Duplicate!
```

### New System (Per-Name)
```
Browser A: "Sandro" → Lookup → player_123 (Level 10)
Browser B: "Sandro" → Lookup → player_123 (Level 10) ✓ Same account!
```

## Implementation Details

### 1. Player Lookup on Initialization

**File**: `Farming Town/script.js`
**Function**: `initGame()`

```javascript
// Get player name first
let playerName = localStorage.getItem('farmingTownPlayerName');
// ... get from parent or prompt if needed ...

GameState.playerName = playerName;

// Look up existing player by name in Firestore
const playerSnapshot = await db.collection('farmingTownPlayers')
  .where('playerName', '==', playerName)
  .limit(1)
  .get();

if (!playerSnapshot.empty) {
  // Found existing player - use their ID
  const existingDoc = playerSnapshot.docs[0];
  playerId = existingDoc.id;
  console.log('Found existing player:', playerName, 'with ID:', playerId);
} else {
  // New player - create new ID
  playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  console.log('Created new player:', playerName, 'with ID:', playerId);
}
```

### 2. Frequent Leaderboard Updates

**Auto-save interval** (every 30 seconds):
```javascript
GameState.saveInterval = setInterval(() => {
  GameState.savePlayerData();
  GameState.updateLeaderboard(); // ← Added
}, 30000);
```

**Initial update**:
```javascript
// Initial leaderboard update
GameState.updateLeaderboard();
```

**On XP gain**:
```javascript
addXP(amount) {
  this.xp += amount;
  // ... level check ...
  this.updateLeaderboard(); // ← Added
}
```

**On level up** (already existed):
```javascript
onLevelUp(oldLevel, newLevel) {
  // ... rewards ...
  this.updateLeaderboard(); // Already existed
}
```

## Database Structure

### farmingTownPlayers Collection
**Purpose**: Store complete player state
**Document ID**: Generated once per player (e.g., `player_1234567890_abc123`)
**Lookup Field**: `playerName` (indexed for queries)

```json
{
  "playerName": "Sandro",
  "coins": 1000,
  "xp": 5000,
  "level": 10,
  "gridWidth": 8,
  "gridHeight": 8,
  "lastPlayed": Timestamp
}
```

### games Collection (Leaderboard)
**Purpose**: Leaderboard display data
**Document ID**: `farmingTown_${playerId}`
**Updated**: On XP gain, level up, and auto-save

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

## User Experience Improvements

### Scenario 1: Playing on Multiple Devices
**Before**:
- Play on PC (Level 10)
- Open on phone with same name
- Start from Level 1 ❌
- Two separate accounts with same name ❌

**After**:
- Play on PC (Level 10)
- Open on phone with same name
- Continue from Level 10 ✓
- Same account across all devices ✓

### Scenario 2: Leaderboard Refresh
**Before**:
- Gain 1000 XP
- Leaderboard still shows old XP ❌
- Must wait for level up or manual refresh ❌

**After**:
- Gain XP → Leaderboard updates immediately ✓
- Every 30 seconds → Leaderboard syncs ✓
- Always shows current stats ✓

### Scenario 3: New Player Registration
**Before**:
- Enter name "Alice"
- Browser generates random ID
- No check for existing "Alice" ❌

**After**:
- Enter name "Alice"
- System checks: "Alice" exists? 
  - Yes → Load their game ✓
  - No → Create new player ✓

## Edge Cases Handled

### 1. Firebase Query Fails
```javascript
try {
  const playerSnapshot = await db.collection('farmingTownPlayers')...
} catch (error) {
  console.error('Error looking up player:', error);
  // Fallback to localStorage
  playerId = localStorage.getItem('farmingTownPlayerId');
  if (!playerId) {
    // Create new if no localStorage either
    playerId = 'player_' + Date.now() + '_' + ...;
  }
}
```

### 2. Name Conflicts (Same Name, Different Players)
**Current Behavior**: First player with that name wins
**Consideration**: If truly needed, could add name uniqueness enforcement or surname support

**Potential Enhancement**:
```javascript
// Option 1: Suggest alternative names
"Sandro" exists → Suggest "Sandro1", "Sandro2"

// Option 2: Add last name field
playerName: "Sandro"
lastName: "Silva"
fullName: "Sandro Silva" (unique)
```

### 3. Player Changes Name
**Current Behavior**: Creates new account
**Consideration**: Could add name change feature with ID preservation

```javascript
// Potential name change feature
async changeName(newName) {
  // Check if newName available
  // Update playerName field
  // Keep same playerId
  // Update leaderboard
}
```

### 4. Offline Play
**Behavior**: 
- Player ID from localStorage still works
- Can play offline
- On reconnect, data syncs to Firebase
- Leaderboard updates when online

## Performance Considerations

### Query Optimization
**Current**: `.where('playerName', '==', playerName).limit(1)`
**Recommendation**: Add Firestore index on `playerName` field

```
Collection: farmingTownPlayers
Field: playerName
Type: Ascending
```

### Leaderboard Update Frequency
**Current**: Every XP gain + every 30s + on level up
**Impact**: Minimal - uses `.set()` which doesn't create duplicates
**Cost**: ~1-3 writes per minute during active play

**Optimization Options**:
```javascript
// Option 1: Debounce XP updates (only update after 5 seconds of no XP gain)
let xpUpdateTimeout;
addXP(amount) {
  clearTimeout(xpUpdateTimeout);
  xpUpdateTimeout = setTimeout(() => {
    this.updateLeaderboard();
  }, 5000);
}

// Option 2: Only update on significant XP changes (>100 XP)
if (amount >= 100) {
  this.updateLeaderboard();
}
```

## Testing Checklist

### Name-Based Account System
- [ ] Create player "TestUser1" on Browser A
- [ ] Play to Level 5, 1000 XP
- [ ] Open game on Browser B (incognito)
- [ ] Enter same name "TestUser1"
- [ ] Verify continues from Level 5, 1000 XP ✓
- [ ] Clear Browser A localStorage
- [ ] Refresh Browser A
- [ ] Enter "TestUser1" again
- [ ] Verify still loads Level 5, 1000 XP ✓

### Leaderboard Real-Time Updates
- [ ] Open leaderboard modal
- [ ] Note current XP value
- [ ] Close modal
- [ ] Harvest crops (gain XP)
- [ ] Wait 2 seconds
- [ ] Open leaderboard modal
- [ ] Verify XP updated ✓
- [ ] Wait 30 seconds (auto-save)
- [ ] Check leaderboard again
- [ ] Verify still accurate ✓

### New vs Existing Player
- [ ] Enter completely new name "NewPlayer123"
- [ ] Verify starts at Level 1, 0 XP ✓
- [ ] Check console: "Created new player: NewPlayer123"
- [ ] Refresh page
- [ ] Enter same name "NewPlayer123"
- [ ] Check console: "Found existing player: NewPlayer123"
- [ ] Verify continues from same state ✓

## Migration Path

### For Existing Players
**Problem**: Existing players have random IDs without name lookup
**Solution**: System is backward compatible
- Existing `playerId` in localStorage still works
- On next play, system associates that ID with their name
- Future plays use name-based lookup

### Data Cleanup (Optional)
If needed to clean up duplicate names:

```javascript
// Admin script to find duplicates
async function findDuplicateNames() {
  const snapshot = await db.collection('farmingTownPlayers').get();
  const names = {};
  snapshot.forEach(doc => {
    const name = doc.data().playerName;
    if (names[name]) {
      names[name].push(doc.id);
    } else {
      names[name] = [doc.id];
    }
  });
  
  // Show duplicates
  Object.entries(names).forEach(([name, ids]) => {
    if (ids.length > 1) {
      console.log(`Duplicate: "${name}" has ${ids.length} accounts:`, ids);
    }
  });
}
```

## Security Considerations

### Name Spoofing
**Risk**: Someone could claim another player's name
**Current Mitigation**: First-come, first-served
**Enhanced Security Options**:

1. **Add password/PIN**:
```javascript
// On registration
const pin = prompt("Create 4-digit PIN:");
playerData.pin = hashPin(pin);

// On login
const pin = prompt("Enter your PIN:");
if (hashPin(pin) !== playerData.pin) {
  alert("Wrong PIN!");
}
```

2. **Account verification**:
- Email verification
- Device fingerprinting
- Parent window arcade account linking

3. **Display warnings**:
```
⚠️ "Sandro" account already exists
This will load their progress
If this is not you, please choose a different name
```

## Benefits Summary

### For Players
✅ **Cross-device play**: Same account on phone, tablet, PC
✅ **No data loss**: Can't accidentally create duplicate account
✅ **Real-time leaderboard**: See your ranking update live
✅ **Simple login**: Just enter your name
✅ **Progress preservation**: Account persists across browsers

### For Game
✅ **Cleaner database**: One account per player name
✅ **Accurate leaderboard**: Always up-to-date stats
✅ **Better analytics**: Track real unique players
✅ **User retention**: Players can return from any device

### For Maintenance
✅ **Easier debugging**: Player lookup by name
✅ **Better support**: Can find player data by name
✅ **Clear data structure**: Logical ID → name mapping

## Related Files
- ✅ `Farming Town/script.js` - Player init and leaderboard updates
- ✅ Firebase: `farmingTownPlayers` collection
- ✅ Firebase: `games` collection (leaderboard)

## Status
✅ **IMPLEMENTED** - Name-based account system with real-time leaderboard updates
