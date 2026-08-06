# Continuous Planting Mode - Feature Implementation

## Overview
Added a continuous crop planting mode that allows players to plant multiple seeds in a row without popup dialogs for each seed, improving the planting experience significantly.

## Feature Description
Players can now:
1. Click "Plant Crops" button
2. Select which crop seed to plant from their inventory
3. Click multiple empty plots to plant seeds continuously
4. Mode automatically stops when seeds run out
5. Click "Stop Planting" button to manually exit the mode

## User Flow

### Starting Planting Mode
1. Player clicks **"Plant Crops"** button (next to "Create Plot")
2. Modal shows all available seeds in inventory with quantities
3. Player selects a crop type (e.g., Wheat, Tomato, Corn)
4. Modal closes and planting mode activates
5. Button changes to **"Stop Planting"** with orange pulsing animation
6. Notification shows: "Planting [Crop Name]. Click on empty plots to plant"

### During Planting Mode
- Click any empty plot → seed planted instantly (no popup)
- Seed removed from inventory
- Plot shows growing crop with timer
- If player runs out of seeds:
  - Mode stops automatically
  - Notification: "Out of seeds: [Seed Name]"
  - Button reverts to "Plant Crops"

### Stopping Planting Mode
- Click **"Stop Planting"** button
- Mode deactivates
- Button reverts to "Plant Crops"
- Notification: "Planting mode stopped"

## Implementation Details

### State Management
**Location**: `GameState` object

```javascript
plantingModeActive: false,      // Whether continuous planting is active
plantingModeCropType: null,     // The crop being planted (e.g., 'wheat')
```

### Key Functions

#### 1. showPlantingModeSelector()
**Location**: `script.js` line ~1650

- Shows modal with available seeds
- Reuses `plantingModal` (same as regular planting menu)
- If already in planting mode, calls `stopPlantingMode()`

#### 2. startPlantingMode(cropType)
**Location**: `script.js` line ~1695

- Sets `plantingModeActive = true`
- Sets `plantingModeCropType = cropType`
- Updates button text to "Stop Planting"
- Adds `planting-active` CSS class (orange pulsing)
- Shows notification

#### 3. stopPlantingMode()
**Location**: `script.js` line ~1710

- Sets `plantingModeActive = false`
- Clears `plantingModeCropType`
- Reverts button text to "Plant Crops"
- Removes `planting-active` CSS class
- Shows notification

#### 4. plantSeedContinuous(tile, cropType)
**Location**: `script.js` line ~1725

- Plants seed without showing popup
- Checks if seeds available
- Removes seed from inventory
- Plants crop on tile
- Saves to database
- Updates grid
- **Auto-stops if out of seeds** after planting

#### 5. handleTileClick() - Modified
**Location**: `script.js` line ~3040

Added check at the beginning:
```javascript
if (GameState.plantingModeActive && tile.type === 'plot' && !tile.cropType) {
  plantSeedContinuous(tile, GameState.plantingModeCropType);
  return;
}
```

### UI Changes

#### HTML (index.html)
Added button after "Create Plot":
```html
<button id="btnPlantCrops" class="btn-action" data-i18n="plantCrops">Plant Crops</button>
```

#### CSS (style.css)
Added planting-active style:
```css
.btn-action.planting-active {
    background: linear-gradient(135deg, #ff9500, #ff6b00);
    animation: plantingPulse 1.5s ease-in-out infinite;
}

@keyframes plantingPulse {
    0%, 100% { 
        box-shadow: 0 2px 8px rgba(255, 149, 0, 0.4);
    }
    50% { 
        box-shadow: 0 4px 16px rgba(255, 149, 0, 0.8);
    }
}
```

#### JavaScript (script.js)
Added event listener:
```javascript
document.getElementById('btnPlantCrops').addEventListener('click', showPlantingModeSelector);
```

### Translations

#### English
```javascript
plantCrops: "Plant Crops",
stopPlanting: "Stop Planting",
planting: "Planting",
clickEmptyPlots: "Click on empty plots to plant",
outOfSeeds: "Out of seeds:",
plantingModeStopped: "Planting mode stopped"
```

#### Portuguese
```javascript
plantCrops: "Plantar Culturas",
stopPlanting: "Parar Plantio",
planting: "Plantando",
clickEmptyPlots: "Clique em terrenos vazios para plantar",
outOfSeeds: "Sem sementes:",
plantingModeStopped: "Modo de plantio parado"
```

## Visual Indicators

### Button States
1. **Normal**: Green gradient - "Plant Crops"
2. **Active**: Orange gradient with pulsing glow - "Stop Planting"

### Notifications
- **Start**: "Planting [Crop]. Click on empty plots to plant"
- **Out of Seeds**: "Out of seeds: [Seed Name]"
- **Manual Stop**: "Planting mode stopped"

## Technical Notes

### Priority in handleTileClick()
Continuous planting mode is checked **first**, before other placement modes:
1. Continuous planting mode
2. Plot creation mode
3. Tree placement mode
4. Building placement mode
5. Road placement mode
6. Normal tile interactions

### Compatibility
- Works with all 7 crop types (wheat, tomato, potato, leek, corn, carrot, onion)
- Does not interfere with other placement modes
- Stops cleanly when switching modes
- Seed count tracked in real-time

### Database Interactions
- Each seed planted triggers `GameState.saveGridTile(tile)`
- Inventory updated via `GameState.removeFromInventory(seedId, 1)`
- Activity timestamp updated via `markActivity()`

## User Experience Improvements

### Before
- Click empty plot
- Popup modal appears
- Select seed from list
- Click to confirm
- Repeat for EACH seed

### After
- Click "Plant Crops" once
- Select seed type once
- Click, click, click on plots (instant planting)
- No popups, smooth workflow
- Auto-stops when done

## Testing Checklist
- [x] Button appears in UI next to "Create Plot"
- [x] Button toggles between "Plant Crops" and "Stop Planting"
- [x] Clicking "Plant Crops" shows seed selector modal
- [x] Selecting seed starts planting mode
- [x] Button shows orange pulsing animation when active
- [x] Clicking empty plots plants seeds without popup
- [x] Mode stops when seeds run out
- [x] Notification shown when seeds run out
- [x] Clicking "Stop Planting" exits mode
- [x] Button returns to normal state after stopping
- [x] Works with all 7 crop types
- [x] Translations work in both EN and PT
- [x] Does not interfere with other placement modes

## Future Enhancements (Optional)
1. **Visual plot highlighting**: Highlight empty plots when in planting mode
2. **Seed counter in notification**: Show remaining seeds in notification
3. **Quick seed switch**: Hotkeys to switch between seed types without reopening modal
4. **Bulk planting confirmation**: "Planted 15 wheat seeds" summary at end
5. **Range planting**: Click and drag to plant multiple plots at once
