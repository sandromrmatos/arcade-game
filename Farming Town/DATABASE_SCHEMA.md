# Farming Town - Firebase Firestore Database Schema

## Overview
This document describes the database structure for the Farming Town game using Firebase Firestore.

## Collections

### 1. `farmingTownPlayers` Collection
Stores player account data, progress, and last played timestamp.

**Document ID**: Auto-generated player ID (stored in localStorage)

**Fields**:
```javascript
{
  playerName: String,           // Player's display name
  coins: Number,                // Current coin balance (starts at 20)
  xp: Number,                   // Total XP earned (cumulative)
  level: Number,                // Current level (1-15+)
  gridWidth: Number,            // Current grid width in tiles (starts at 5)
  gridHeight: Number,           // Current grid height in tiles (starts at 5)
  lastPlayed: Timestamp,        // Firebase ServerTimestamp
  createdAt: Timestamp          // Firebase ServerTimestamp (account creation)
}
```

### 2. `farmingTownGrids` Collection
Stores individual tile data for each player's farm grid.

**Document ID**: `{playerId}_tile_{x}_{y}`

**Fields**:
```javascript
{
  playerId: String,             // Reference to player
  x: Number,                    // X coordinate (0-indexed)
  y: Number,                    // Y coordinate (0-indexed)
  tileType: String,             // "grass", "plot", "tree", "building", "road"
  
  // For crops (when tileType === "plot")
  cropType: String | null,      // "wheat", "tomato", "potato", "leek", null if empty
  plantedAt: Timestamp | null,  // When seed was planted
  growthMinutes: Number | null, // Total minutes needed to grow
  harvested: Boolean,           // false = growing, true = ready to harvest
  
  // For trees (when tileType === "tree")
  treeType: String | null,      // "apple", "lemon"
  lastCollectedAt: Timestamp | null, // Last fruit collection time
  ripeMinutes: Number | null,   // Minutes for fruit to ripen
  fruitReady: Boolean,          // Is fruit ready to collect?
  
  // For buildings (when tileType === "building")
  buildingType: String | null,  // "mill", "pigFarm", "chickenFarm", etc.
  isConstructing: Boolean,      // true during construction
  constructionStartedAt: Timestamp | null,
  constructionMinutes: Number | null,
  isOriginTile: Boolean,        // true for top-left tile of multi-tile building
  originX: Number | null,       // X coord of origin tile (for non-origin tiles)
  originY: Number | null,       // Y coord of origin tile (for non-origin tiles)
  
  lastModified: Timestamp       // For sync purposes
}
```

### 3. `farmingTownInventories` Collection
Stores player inventory items (seeds, harvested crops, products, house kits).

**Document ID**: `{playerId}_item_{itemType}_{itemName}`

**Fields**:
```javascript
{
  playerId: String,             // Reference to player
  category: String,             // "seed", "crop", "fruit", "product", "animal", "houseKit"
  itemName: String,             // e.g., "wheat", "wheatSeed", "flour", "millKit"
  quantity: Number,             // Amount in inventory
  lastModified: Timestamp       // For sync purposes
}
```

### 4. `farmingTownProduction` Collection
Stores active production queues for buildings (3 slots per building).

**Document ID**: `{playerId}_building_{x}_{y}_slot_{slotIndex}`

**Fields**:
```javascript
{
  playerId: String,             // Reference to player
  buildingX: Number,            // Building origin X coordinate
  buildingY: Number,            // Building origin Y coordinate
  slotIndex: Number,            // 0, 1, or 2 (3 slots per building)
  recipeType: String | null,    // "flour", "bread", "pig", "sausage", etc.
  isProducing: Boolean,         // true if production active
  startedAt: Timestamp | null,  // When production started
  productionMinutes: Number | null, // Total minutes needed
  completed: Boolean,           // Ready to collect?
  lastModified: Timestamp       // For sync purposes
}
```

### 5. `games` Collection (Existing - for leaderboard)
Stores high scores/stats for leaderboard display.

**Document ID**: Auto-generated

**Fields**:
```javascript
{
  playerName: String,           // Player's display name
  gameName: "Farming Town",     // Fixed game name
  level: Number,                // Player's level (primary metric)
  xp: Number,                   // Total XP (secondary metric)
  lastPlayed: Timestamp,        // Firebase ServerTimestamp
  timestamp: Timestamp          // For sorting
}
```

## Data Flow

### On Game Load:
1. Get/create playerId from localStorage
2. Load player data from `farmingTownPlayers/{playerId}`
3. Query all grid tiles: `farmingTownGrids` where `playerId == currentPlayer`
4. Query all inventory items: `farmingTownInventories` where `playerId == currentPlayer`
5. Query all production slots: `farmingTownProduction` where `playerId == currentPlayer`
6. Calculate any elapsed time for timers (crops, trees, buildings, production)

### On Player Action (Real-time updates):
- **Plant crop**: Update specific tile in `farmingTownGrids`, deduct seed from `farmingTownInventories`
- **Harvest crop**: Update tile, add crop to inventory, add XP to player
- **Buy seeds**: Add to inventory, deduct coins from player
- **Place building**: Create/update multiple tiles in grid, deduct house kit from inventory
- **Start production**: Update production slot document
- **Collect production**: Update production slot, add products to inventory, add XP
- **Expand grid**: Update player's gridWidth/gridHeight, create new grass tiles

### On Session End:
- Save current player state to `farmingTownPlayers`
- Update leaderboard entry in `games` collection

## Index Requirements

**Recommended Composite Indexes** (configure in Firebase Console):

1. `farmingTownGrids`: 
   - Collection group index: `playerId` (Ascending) + `x` (Ascending) + `y` (Ascending)

2. `farmingTownInventories`:
   - Collection group index: `playerId` (Ascending) + `category` (Ascending)

3. `farmingTownProduction`:
   - Collection group index: `playerId` (Ascending) + `buildingX` (Ascending) + `buildingY` (Ascending)

4. `games` (for leaderboard):
   - Existing indexes should cover: `gameName` + `level` (Descending) + `xp` (Descending)

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Farming Town player data
    match /farmingTownPlayers/{playerId} {
      allow read: if true;
      allow write: if true; // In production, add: request.auth != null
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
    
    // Existing games collection for leaderboard
    match /games/{gameId} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Performance Considerations

1. **Minimize Writes**: Batch updates when possible using Firestore batch writes
2. **Cache Locally**: Use localStorage for frequently accessed, non-critical data
3. **Lazy Load Grid**: Only load visible tiles if grid becomes very large
4. **Debounce Saves**: Don't save on every coin change; save on significant events
5. **Client-side Timers**: Calculate timer completion on client; only store timestamps

## Data Sync Strategy

- **On Load**: Full sync from Firestore
- **During Play**: Update Firestore on significant events (planting, harvesting, building, purchasing)
- **Auto-save**: Every 30 seconds for player stats (coins, XP, level)
- **On Close**: Final save of all game state
- **Conflict Resolution**: Last-write-wins (suitable for single-player game)
