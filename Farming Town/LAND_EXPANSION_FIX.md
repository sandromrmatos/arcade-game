# Land Expansion Bug Fix

## Problem
The land expansion system was creating a sparse 2D grid array with `null` entries for unowned land, which caused:
1. **Visual artifacts** - Checkerboard pattern with holes in the farm display
2. **Runtime crashes** - `TypeError: Cannot read properties of null (reading 'type')` when iterating over grid tiles

## Root Cause
When placing 5x5 land blocks at non-adjacent positions (e.g., first block at (0,0), second at (5,0)), the grid array was being expanded to a rectangular shape and filled with `null` for unowned spaces. This created a sparse array where:
- `grid[0][0-4]` = grass tiles (first block)
- `grid[0][5-9]` = grass tiles (second block)  
- `grid[1-4][0-9]` = **null** (not owned)

## Solution
Implemented a **sparse grid with dynamic bounds calculation**:

### 1. Added `getGridBounds()` Method
Calculates the actual min/max coordinates of non-null tiles:
```javascript
getGridBounds() {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;
  
  for (let y = 0; y < this.grid.length; y++) {
    for (let x = 0; x < this.grid[y].length; x++) {
      if (this.grid[y][x] !== null) {
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
  
  return { minX, minY, maxX: maxX + 1, maxY: maxY + 1 };
}
```

### 2. Updated `renderGrid()` to Use Bounds
Instead of rendering based on `gridWidth`/`gridHeight`, now renders based on actual tile positions:
```javascript
const bounds = GameState.getGridBounds();
let minX = bounds.minX;
let minY = bounds.minY;
let maxX = bounds.maxX;
let maxY = bounds.maxY;
```

### 3. Updated `placeLandBlock()` to Recalculate Bounds
After placing tiles, recalculates dimensions:
```javascript
const bounds = GameState.getGridBounds();
GameState.gridWidth = bounds.maxX;
GameState.gridHeight = bounds.maxY;
```

## Benefits
✅ **No visual holes** - Only owned tiles are displayed in normal mode  
✅ **No crashes** - `updateAllTimers` already skips null tiles  
✅ **Flexible placement** - Can place blocks in any valid position (aligned, adjacent)  
✅ **Efficient** - Sparse array uses minimal memory for scattered blocks  
✅ **Correct display** - In placement mode, shows owned tiles + potential spots

## How It Works Now
1. **Internal representation**: Sparse 2D array with nulls for unowned spaces
2. **Display representation**: Dynamic bounding box that only shows owned tiles
3. **Placement mode**: Expands view to show potential placement areas beyond current bounds
4. **Iteration**: All loops skip null tiles safely

## Example Scenario
Player places blocks at (0,0), (10,0), and (0,10):
- **Internal grid**: 15x15 array with nulls everywhere except 3 blocks (75 total tiles)
- **Normal display**: Shows only the 75 owned tiles in a compact view
- **Placement mode**: Shows owned tiles + empty spaces for valid new positions
