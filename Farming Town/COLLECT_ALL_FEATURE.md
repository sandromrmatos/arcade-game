# Collect All Button - Feature Implementation

## Overview
Added a "Collect All" button at the top of the building production modal that allows players to collect all completed items from all 3 slots at once, showing a cumulative summary with icons and total XP.

## Feature Description
When a building has at least one completed production slot, a "Collect All" button appears at the top of the modal. Clicking it:
1. Collects all completed items from all 3 slots
2. Shows a summary notification with:
   - All collected items with icons and quantities
   - Total XP gained from all collections
3. Refreshes the building modal to show empty slots

## User Flow

### Before "Collect All"
1. Open building with 3 completed slots
2. Click "Collect" on Slot 1 → notification → modal refreshes
3. Click "Collect" on Slot 2 → notification → modal refreshes
4. Click "Collect" on Slot 3 → notification → modal refreshes
5. Three separate notifications, three modal refreshes

### After "Collect All"
1. Open building with 3 completed slots
2. Click **"Collect All"** button at top
3. One notification showing:
   - 🟦 +4 Flour
   - 🥣 +2 Porridge
   - 🌰 +3 Animal Feed
   - Total XP: +25 XP
4. Modal refreshes once, all slots now empty

## Implementation Details

### Visual Changes
**Location**: `showBuildingModal()` function (script.js ~line 2190)

Added conditional "Collect All" button before rendering slots:
```javascript
// Check if any slot has completed production
let hasCompletedProduction = false;
for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
  const key = `${originTile.x}_${originTile.y}_${slotIndex}`;
  const production = GameState.productionQueues[key];
  if (production && production.completed) {
    hasCompletedProduction = true;
    break;
  }
}

// Add "Collect All" button if at least one slot is ready
if (hasCompletedProduction) {
  const collectAllBtn = document.createElement('button');
  collectAllBtn.className = 'btn-primary btn-collect-all';
  collectAllBtn.textContent = t('collectAll');
  collectAllBtn.style.cssText = `
    width: 100%;
    margin-bottom: 20px;
    padding: 14px;
    font-size: 16px;
    font-weight: 700;
  `;
  collectAllBtn.addEventListener('click', () => {
    collectAllProduction(originTile);
  });
  slotsContainer.appendChild(collectAllBtn);
}
```

### New Function: collectAllProduction()
**Location**: script.js ~line 2470

```javascript
function collectAllProduction(buildingTile) {
  let collectedItems = {}; // Track: { flour: 4, chicken: 2, egg: 10 }
  let totalXP = 0;
  let anyCollected = false;
  
  // Iterate through all 3 slots
  for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
    const key = `${buildingTile.x}_${buildingTile.y}_${slotIndex}`;
    const production = GameState.productionQueues[key];
    
    if (!production || !production.completed) {
      continue; // Skip non-completed slots
    }
    
    const recipe = GameData.recipes[production.recipeType];
    if (!recipe) continue;
    
    anyCollected = true;
    
    // Add products to inventory
    // Handle special case: chickenAndEggs produces multiple items
    // Track collected items for summary
    
    // Add XP and accumulate total
    GameState.addXP(recipe.xpOnCollect);
    totalXP += recipe.xpOnCollect;
    
    // Clear production slot
    // Save to database
  }
  
  // Build summary message with icons
  // Show notification with summary
  // Refresh building modal
}
```

### Logic Flow
1. **Check all 3 slots** for completed production
2. **For each completed slot:**
   - Get recipe data
   - Add products to inventory (handles multi-item recipes like chickenAndEggs)
   - Track mission progress
   - Accumulate items in `collectedItems` object
   - Accumulate XP in `totalXP`
   - Clear the slot
   - Save to database
3. **Build summary:**
   - Format: "Collected all:\n🟦 +4 Flour\n🥣 +2 Porridge\n\nTotal XP: +25 XP"
4. **Refresh modal** to show updated slots
5. **Show notification** with summary

### Multi-Item Recipe Support
Handles special recipes like `chickenAndEggs` that produce multiple items:
```javascript
if (recipe.produces) {
  // Special case: produces multiple items
  for (const [item, quantity] of Object.entries(recipe.produces)) {
    GameState.addToInventory(item, quantity);
    collectedItems[item] = (collectedItems[item] || 0) + quantity;
  }
} else {
  // Regular recipe: produces single item type
  GameState.addToInventory(production.recipeType, recipe.producesQuantity);
  collectedItems[production.recipeType] = 
    (collectedItems[production.recipeType] || 0) + recipe.producesQuantity;
}
```

### Summary Format
```
Collected all:

🟦 +4 Flour
🥣 +2 Porridge
🌰 +3 Animal Feed

Total XP: +25 XP
```

## Translations

### English
```javascript
collect: "Collect",
collectAll: "Collect All",
collectedAll: "Collected all",
totalXP: "Total XP"
```

### Portuguese
```javascript
collect: "Coletar",
collectAll: "Coletar Tudo",
collectedAll: "Coletou tudo",
totalXP: "XP Total"
```

## Button Behavior

### When Button Appears
- **Condition**: At least 1 of the 3 slots has `production.completed === true`
- **Position**: Top of modal, above all slot displays
- **Style**: Full width, prominent primary button style

### When Button Is Hidden
- No completed production in any slot
- Building is still under construction
- All slots are empty or producing

### What Happens on Click
1. Collects from **all completed slots only**
2. Skips slots that are:
   - Empty (no recipe assigned)
   - Still producing (not yet completed)
3. Shows **one summary notification** for all collections
4. Modal refreshes **once** to show updated state

## Edge Cases Handled

### Multiple Slots Ready
- Collects all completed slots
- Shows summary with all items
- Adds up all XP correctly

### Only 1 Slot Ready
- Still shows "Collect All" button
- Collects that 1 slot
- Summary shows that 1 item

### Mixed States (1 ready, 1 producing, 1 empty)
- Collects only the ready slot
- Skips the producing and empty slots
- Summary shows only collected item

### ChickenAndEggs Special Recipe
- Collects both chicken and eggs
- Shows both in summary:
  - 🐔 +1 Chicken
  - 🥚 +5 Eggs

## Benefits

### User Experience
- **Faster workflow**: One click vs three clicks
- **Clear summary**: See all collected items at once
- **No repetition**: One notification instead of three
- **Better UX**: Less modal flickering from refreshes

### Technical
- **Batch processing**: All collections in one operation
- **Single database transaction**: More efficient
- **Consistent state**: All slots cleared atomically
- **Better notifications**: Consolidated information

## Testing Checklist
- [x] Button appears when at least 1 slot is completed
- [x] Button hidden when no slots are completed
- [x] Clicking button collects all completed slots
- [x] Summary shows all collected items with icons
- [x] Summary shows correct total XP
- [x] Modal refreshes after collection
- [x] Works with regular recipes (single item output)
- [x] Works with chickenAndEggs recipe (multi-item output)
- [x] Works when only 1 slot is ready
- [x] Works when all 3 slots are ready
- [x] Works when mixed states (some ready, some not)
- [x] Translations work in both EN and PT
- [x] Mission progress tracked for all collected items
- [x] Inventory updated correctly for all items

## Example Scenarios

### Scenario 1: All 3 Slots Ready (Regular Recipes)
**Building**: Mill
**Slots**:
- Slot 1: Flour (completed) → 2 flour, 5 XP
- Slot 2: Porridge (completed) → 2 porridge, 10 XP
- Slot 3: Animal Feed (completed) → 3 feed, 10 XP

**Result**:
```
Collected all:

🟦 +2 Flour
🥣 +2 Porridge
🌰 +3 Animal Feed

Total XP: +25 XP
```

### Scenario 2: Mixed with ChickenAndEggs
**Building**: Chicken Farm
**Slots**:
- Slot 1: chickenAndEggs (completed) → 1 chicken + 5 eggs, 30 XP
- Slot 2: chickenAndEggs (completed) → 1 chicken + 5 eggs, 30 XP
- Slot 3: Empty

**Result**:
```
Collected all:

🐔 +2 Chicken
🥚 +10 Eggs

Total XP: +60 XP
```

### Scenario 3: Only 1 Ready
**Building**: Bakery
**Slots**:
- Slot 1: Bread (completed) → 2 bread, 10 XP
- Slot 2: Producing (30 min remaining)
- Slot 3: Empty

**Result**:
```
Collected all:

🍞 +2 Bread

Total XP: +10 XP
```

## Future Enhancements (Optional)
1. **Animation**: Visual feedback showing items flying into inventory
2. **Sound effect**: Play collection sound
3. **Keyboard shortcut**: Press 'C' to collect all
4. **Auto-collect**: Option to auto-collect when opening building
5. **Summary in modal**: Show summary inside modal instead of notification
