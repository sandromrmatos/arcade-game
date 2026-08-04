# Land Expansion System - Simplified Version

## Overview
The land expansion system has been completely redesigned for simplicity and predictability. Each expansion automatically adds **1 row and 1 column** to the grid, with linear pricing based on current grid size.

## How It Works

### Starting State
- Players begin with a **5x5 grid** (25 tiles)
- All tiles are properly initialized (no sparse arrays)
- Grid is always rectangular and fully connected

### Expansion Mechanics
Each time the player buys a land expansion:
1. **1 new column** is added to the right side (for all existing rows)
2. **1 new row** is added to the bottom (spanning all columns including the new one)
3. Grid grows from NxN to (N+1)x(N+1)

### Example Progression
| Expansion # | From    | To      | Tiles Added | Total Tiles | Cost |
|-------------|---------|---------|-------------|-------------|------|
| Start       | -       | 5x5     | -           | 25          | -    |
| 1st         | 5x5     | 6x6     | 11          | 36          | 50   |
| 2nd         | 6x6     | 7x7     | 13          | 49          | 100  |
| 3rd         | 7x7     | 8x8     | 15          | 64          | 150  |
| 4th         | 8x8     | 9x9     | 17          | 81          | 200  |
| 5th         | 9x9     | 10x10   | 19          | 100         | 250  |
| ...         | ...     | ...     | ...         | ...         | ...  |
| 20th        | 24x24   | 25x25   | 49          | 625         | 1000 |

### Maximum Size
- **Maximum grid**: 25x25 (625 tiles)
- **Maximum expansions**: 20 (from 5x5 to 25x25)
- After reaching 25x25, the "Buy Land" button is disabled

## Pricing Formula

### Linear Increment
- **Base cost**: 50 coins
- **Increment**: 50 coins per expansion
- **Formula**: `Price = ExpansionNumber × 50`

Where ExpansionNumber is calculated as: `currentSize - 4`

### Examples
```
5→6: expansion #1 = 1 × 50 = 50 coins
6→7: expansion #2 = 2 × 50 = 100 coins
7→8: expansion #3 = 3 × 50 = 150 coins
10→11: expansion #6 = 6 × 50 = 300 coins
24→25: expansion #20 = 20 × 50 = 1000 coins
```

## User Experience

### Purchase Flow
1. Player opens **Marketplace → Buy Land** tab
2. Sees current grid size and cost for next expansion
3. Clicks **"Buy"** button
4. **Immediately** sees grid expand (no placement required)
5. Notification shows the expansion: `"Grid Expanded! 5x5 → 6x6 (+11 tiles)"`

### UI Display
The Buy Land tab shows:
- **Current Grid**: "5x5 (25 tiles)"
- **Expansion Info**: "Adds +1 row & +1 column (11 tiles)"
- **Next Size**: "Next: 6x6 grid"
- **Price**: 🪙50

### Benefits Over Previous System
✅ **No placement complexity** - automatic expansion
✅ **Predictable growth** - always square grid (NxN)
✅ **Simple pricing** - easy to calculate
✅ **No null tiles** - grid always fully populated
✅ **No sparse arrays** - cleaner data structure
✅ **Instant feedback** - expansion happens immediately
✅ **No bugs** - eliminates complex adjacency checks

## Technical Implementation

### Data Structure (data.js)
```javascript
gridExpansion: {
  startSize: 5,          // Start with 5x5 grid
  maxSize: 25,           // Maximum 25x25 grid
  baseCost: 50,          // First expansion costs 50
  costIncrement: 50,     // Each subsequent expansion costs 50 more
  
  getPriceForNextExpansion(currentSize) {
    const expansionNumber = currentSize - 4;
    return expansionNumber * this.costIncrement;
  }
}
```

### Expansion Function (script.js)
```javascript
function expandGrid() {
  const currentSize = Math.max(GameState.gridWidth, GameState.gridHeight);
  const price = GameData.gridExpansion.getPriceForNextExpansion(currentSize);
  
  // Validate and deduct coins
  if (!GameState.spendCoins(price)) return false;
  
  // Add new column to existing rows
  for (let y = 0; y < GameState.grid.length; y++) {
    const x = GameState.grid[y].length;
    const tile = GameState.createTile(x, y, 'grass');
    GameState.grid[y].push(tile);
    GameState.saveGridTile(tile);
  }
  
  // Add new row
  const newRow = [];
  const y = GameState.grid.length;
  for (let x = 0; x < newWidth; x++) {
    const tile = GameState.createTile(x, y, 'grass');
    newRow.push(tile);
    GameState.saveGridTile(tile);
  }
  GameState.grid.push(newRow);
  
  // Update state
  GameState.gridWidth++;
  GameState.gridHeight++;
  GameState.gridExpansionCount++;
  
  renderGrid();
  return true;
}
```

### Rendering (script.js)
```javascript
function renderGrid() {
  // Simple rectangular grid rendering
  for (let y = 0; y < GameState.gridHeight; y++) {
    for (let x = 0; x < GameState.gridWidth; x++) {
      const tile = GameState.getTile(x, y);
      if (tile) {
        container.appendChild(createTileElement(tile));
      }
    }
  }
}
```

## Database Structure

### Player Data
```javascript
{
  playerName: "Player1",
  coins: 1000,
  level: 5,
  gridWidth: 8,       // Current width
  gridHeight: 8,      // Current height (always equals width)
  gridExpansionCount: 3  // Number of expansions purchased
}
```

### Grid Tiles
Each tile saved individually:
```javascript
{
  playerId: "player_12345",
  x: 7,
  y: 5,
  tileType: "plot",
  cropType: "wheat",
  // ... other tile data
}
```

## Safety & Validation

### Purchase Validation
- Checks if player can afford the expansion
- Validates player has seeds or growing crops (prevents going to 0 coins with no way to progress)
- Checks if maximum grid size already reached

### State Consistency
- Grid width and height always equal (square grid)
- No null tiles in the array
- All tiles properly initialized with coordinates
- Grid dimensions saved to Firebase

## Comparison with Previous System

### Old System (Complex)
- ❌ Player-selected placement of 5x5 blocks
- ❌ Tetris-style block alignment
- ❌ Adjacency validation required
- ❌ Sparse arrays with null tiles
- ❌ Complex rendering logic
- ❌ Prone to null reference errors
- ❌ Confusing user experience

### New System (Simple)
- ✅ Automatic 1x1 row/column expansion
- ✅ No user placement required
- ✅ Always square and connected
- ✅ Fully populated arrays
- ✅ Simple rendering
- ✅ No null reference errors
- ✅ Clear and predictable

## Future Considerations

### Possible Enhancements
- **Bulk purchase**: Buy multiple expansions at once
- **Discount events**: Temporary 50% off land expansions
- **Achievement rewards**: Free expansion at certain milestones
- **Premium shapes**: Optional rectangular grids (wider than tall)

### Balancing Notes
- Current pricing is balanced for mid-game progression
- Players need ~20 levels to afford reaching maximum grid
- Total cost to reach 25x25: `50+100+150+...+1000 = 10,500 coins`
