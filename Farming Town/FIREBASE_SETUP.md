# Firebase Setup for Farming Town

## Required Firestore Collections

The game uses these collections (they will be created automatically when the game runs):

1. `farmingTownPlayers`
2. `farmingTownGrids`
3. `farmingTownInventories`
4. `farmingTownProduction`
5. `games` (shared leaderboard with other arcade games)

## Security Rules

**IMPORTANT**: You need to update your Firestore security rules to allow the game to read/write data.

### How to Update Security Rules:

1. Go to **Firebase Console** (https://console.firebase.google.com/)
2. Select your project: **arcade-sandro**
3. Click on **Firestore Database** in the left sidebar
4. Click on the **Rules** tab at the top
5. Replace or add these rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Existing games collection (leaderboard)
    match /games/{gameId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Farming Town player data
    match /farmingTownPlayers/{playerId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Farming Town grid tiles
    match /farmingTownGrids/{tileId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Farming Town inventories
    match /farmingTownInventories/{inventoryId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Farming Town production queues
    match /farmingTownProduction/{productionId} {
      allow read: if true;
      allow write: if true;
    }
    
    // Existing players collection (if you have it)
    match /players/{playerId} {
      allow read, write: if true;
    }
    
    // Default: deny access to everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

6. Click **Publish** to save the rules

### IMPORTANT NOTES:

1. **Remove Rule Expiration**: Make sure your rules do NOT have an expiration date like:
   ```
   // allow read, write: if request.time < timestamp.date(2024, 12, 31);  ❌ DO NOT USE
   ```
   
2. **Public Access**: These rules allow anyone to read/write. This is fine for a personal/family game, but for public deployment, you should add authentication:
   ```javascript
   allow read, write: if request.auth != null;  // Only authenticated users
   ```

## Firestore Indexes

The game queries data by `playerId`. Firebase should automatically create the necessary indexes, but if you see errors in the console about missing indexes, Firebase will provide a link to create them automatically.

### Manual Index Creation (if needed):

Go to **Firestore Database** → **Indexes** tab and create these composite indexes if prompted:

1. **Collection**: `farmingTownGrids`
   - Fields: `playerId` (Ascending), `x` (Ascending), `y` (Ascending)
   - Query scope: Collection

2. **Collection**: `farmingTownInventories`
   - Fields: `playerId` (Ascending), `itemName` (Ascending)
   - Query scope: Collection

3. **Collection**: `farmingTownProduction`
   - Fields: `playerId` (Ascending), `buildingX` (Ascending), `buildingY` (Ascending)
   - Query scope: Collection

## Testing the Setup

1. Open the browser console (F12)
2. Load Farming Town
3. Check for these messages:
   ```
   Firebase initialized successfully
   Loading game data for player: player_xxxxx
   Player data loaded: {coins: 20, level: 1}
   Loaded X grid tiles from database
   ```

4. Create a plot (should cost 2 coins)
5. Check console for:
   ```
   Tile saved: {x: 0, y: 0, type: "plot"}
   Player data saved: {coins: 18, level: 1}
   ```

6. Refresh the page
7. Check that:
   - Your plot is still there
   - Your coins are still at 18
   - Console shows: "Loaded 1 grid tiles from database"

## Troubleshooting

### "Missing or insufficient permissions" error
- **Solution**: Update Firestore security rules (see above)

### "Player data not saving"
- Check browser console for errors
- Verify playerId is being generated (check localStorage: `farmingTownPlayerId`)
- Check Firebase Console → Firestore → Data to see if collections are being created

### "Progress lost on refresh"
- Check that tiles are being saved (look for "Tile saved" messages in console)
- Verify security rules allow write access
- Check that loadGameData is finding your saved data (should see "Loaded X grid tiles")

### "Cannot read property 'toDate' of null"
- This happens with timestamps on new tiles
- The updated code handles this correctly now

## Data Persistence

The game saves data:
- **Immediately**: When you make changes (create plot, plant seed, etc.)
- **Every 30 seconds**: Auto-save of player stats
- **On page close**: Final save before unload

All saves are asynchronous and logged to console for debugging.

## Viewing Your Data

You can view your saved data in Firebase Console:

1. Go to **Firestore Database** → **Data** tab
2. Look for collections starting with `farmingTown`
3. Find documents with your playerId

Example document in `farmingTownGrids`:
```
playerId: "player_1234567890_abc123"
x: 0
y: 0
tileType: "plot"
cropType: null
lastModified: Timestamp
```
