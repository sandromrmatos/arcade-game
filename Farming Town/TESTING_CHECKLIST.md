# Farming Town - Testing Checklist for Land Expansion Fix

## Bug That Was Fixed
- **Error**: `TypeError: Cannot read properties of null (reading 'type')` at line 540
- **Visual Bug**: Checkerboard pattern with holes in the farm display
- **Root Cause**: Sparse 2D grid array with null entries causing crashes during iteration

## Changes Made

### 1. Added `getGridBounds()` Method
- Dynamically calculates min/max coordinates of all non-null tiles
- Returns bounding box that encompasses only owned land

### 2. Modified `renderGrid()`
- Uses actual tile bounds instead of gridWidth/gridHeight
- Only renders owned tiles in normal mode
- Shows potential placement areas in landExpansion mode

### 3. Updated `placeLandBlock()`
- Creates sparse array structure on demand
- Recalculates gridWidth/gridHeight after placement using bounds

### 4. Fixed `init()` Method
- Now creates empty grid array (not pre-filled 5x5)
- Allows sparse grid from the start

### 5. Enhanced `loadGameData()`
- Reconstructs sparse grid from saved tiles
- Handles arbitrary tile positions
- Creates initial 5x5 for new players

## Test Cases

### Test 1: New Game Start
**Steps:**
1. Clear browser localStorage for Farming Town
2. Refresh game
3. Enter player name

**Expected:**
- ✓ Game starts with 5x5 grass grid
- ✓ No console errors
- ✓ All 25 tiles visible and clickable
- ✓ No null tiles or gaps

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 2: First Land Expansion
**Steps:**
1. Start new game or use existing save
2. Buy land expansion from Marketplace → Buy Land
3. Place 5x5 block to the right (at position 5,0)

**Expected:**
- ✓ Can select placement position marked with 📍
- ✓ After placement, grid shows 10x5 (50 tiles total)
- ✓ No null tiles/gaps between original and new block
- ✓ All timers update without errors
- ✓ Console shows "5x5 land block placed! (+25 tiles)"

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 3: Non-Adjacent Expansion (Stress Test)
**Steps:**
1. Start with 5x5 grid
2. Place first expansion at (10, 0) - skipping positions (5,0)
3. Check grid display

**Expected:**
- ✓ Placement NOT allowed (must be adjacent)
- ✓ Error message: "Invalid placement! Block must be aligned and adjacent"
- ✓ No changes to grid
- ✓ Money not deducted

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 4: Adjacent Expansion (Various Directions)
**Steps:**
1. Start with 5x5 at (0,0)
2. Place expansion at (5,0) - right side ✓
3. Place expansion at (0,5) - below ✓
4. Place expansion at (10,0) - further right ✓
5. Place expansion at (5,5) - diagonal fill ✓

**Expected:**
- ✓ All placements succeed (all are adjacent)
- ✓ Grid grows to 15x10 (4 blocks = 100 tiles)
- ✓ No visual holes or gaps
- ✓ All tiles render correctly
- ✓ updateAllTimers runs without errors

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 5: Multiple Expansions with Crops/Trees
**Steps:**
1. Create some plots and plant crops in original 5x5
2. Buy and place 2-3 land expansions
3. Plant crops in new areas
4. Wait for crops to grow
5. Refresh page (test save/load)

**Expected:**
- ✓ Crops continue growing during expansions
- ✓ Timers update correctly across all areas
- ✓ After refresh, all tiles and crops load correctly
- ✓ Sparse grid reconstructed properly from Firebase
- ✓ No null tile errors

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 6: Save and Load with Sparse Grid
**Steps:**
1. Create a farm with multiple 5x5 expansions placed non-contiguously
2. Add plots, trees, buildings to various areas
3. Close browser tab completely
4. Reopen game with same player ID

**Expected:**
- ✓ All tiles load in correct positions
- ✓ Grid bounds calculated correctly
- ✓ No null tile errors during load
- ✓ All crops/trees/buildings restored
- ✓ Grid displays compactly (no wasted space)

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 7: Placement Mode Display
**Steps:**
1. Have a farm with 2-3 expansions placed
2. Open Marketplace → Buy Land
3. Click Buy button to enter placement mode

**Expected:**
- ✓ Existing owned tiles shown normally
- ✓ Empty spaces shown with tile-empty class
- ✓ Valid 5x5 origins marked with 📍
- ✓ Only aligned positions (multiples of 5) show 📍
- ✓ Only adjacent positions show 📍
- ✓ Grid expands view to show +10 rows/cols of potential spots

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 8: Maximum Grid Size
**Steps:**
1. Use debug commands to give infinite coins
2. Buy maximum land expansions
3. Try to buy more after reaching max

**Expected:**
- ✓ Can expand up to max width (50 tiles wide)
- ✓ Buy button disabled when max reached
- ✓ Message: "Max grid size reached"
- ✓ No errors even at maximum size

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 9: UpdateAllTimers Performance
**Steps:**
1. Create large farm with multiple expansions
2. Plant crops across all areas
3. Place trees in various locations
4. Monitor console for errors
5. Check FPS/performance

**Expected:**
- ✓ No "Cannot read properties of null" errors
- ✓ Timers update smoothly (every 5 seconds)
- ✓ Game remains responsive
- ✓ No lag when switching tabs or scrolling

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

### Test 10: Grid Bounds Calculation
**Steps:**
1. Place blocks at positions: (0,0), (10,0), (0,10), (10,10)
2. Observe grid display size
3. Check console for gridWidth/gridHeight values

**Expected:**
- ✓ Grid displays as 15x15 visually
- ✓ gridWidth = 15
- ✓ gridHeight = 15
- ✓ Only 100 tiles actually exist (4 blocks × 25 tiles)
- ✓ No unnecessary empty space rendered

**Status:** ⬜ Not Tested | ✓ Passed | ✗ Failed

---

## Debug Commands (for testing)

Open browser console and run:

```javascript
// Give infinite coins
GameState.coins = 999999;
GameState.savePlayerData();

// Check current grid state
console.log('Grid dimensions:', GameState.gridWidth, 'x', GameState.gridHeight);
console.log('Grid bounds:', GameState.getGridBounds());

// Count non-null tiles
let count = 0;
GameState.grid.forEach(row => row.forEach(tile => { if (tile) count++; }));
console.log('Total non-null tiles:', count);

// Force render
renderGrid();
```

## Known Limitations

1. **Sparse Grid**: Internal grid array contains nulls for unowned spaces - this is intentional and handled correctly by all functions
2. **Display Optimization**: In placement mode, only shows +10 rows/cols beyond current bounds to prevent excessive rendering
3. **Save Efficiency**: Only non-null tiles are saved to Firebase, sparse structure not persisted

## Success Criteria

All 10 test cases must pass without:
- ❌ Null reference errors in console
- ❌ Visual holes/gaps in grid display
- ❌ Incorrect tile counts after expansion
- ❌ Data loss on save/load
- ❌ Performance degradation
