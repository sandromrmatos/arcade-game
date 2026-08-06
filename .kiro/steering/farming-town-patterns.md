# Farming Town - Development Patterns & Standards

## Project Overview
Farming Town is a resource management and farming simulation game with Firebase backend, bilingual support (EN/PT), and real-time gameplay.

## Core Architecture

### File Structure
- `index.html` - Main game HTML with modals
- `style.css` - All styling and animations
- `script.js` - Core game logic (~3500 lines)
- `data.js` - Game content configuration (crops, buildings, recipes, missions)
- `translations.js` - Bilingual text (EN/PT)

### Key Design Patterns

#### 1. GameState Object Pattern
All game state is centralized in the `GameState` object:
```javascript
const GameState = {
  coins: 20,
  xp: 0,
  level: 1,
  grid: [],
  inventory: {},
  buildingsOwned: {},
  missionProgress: {},
  
  // Methods for state management
  addCoins(amount) { ... },
  addXP(amount) { ... },
  addToInventory(item, quantity) { ... }
}
```

**Pattern Rule**: Always use GameState methods to modify state, never direct assignment.

#### 2. Data-Driven Configuration
All content lives in `data.js` as the `GameData` object:
- Crops, trees, buildings, recipes, missions
- Level progression, rewards, prices
- Helper functions for data access

**Pattern Rule**: When adding new content, define it in `data.js` first, not in script logic.

#### 3. Translation Pattern
Every user-facing string must have translations:
```javascript
// translations.js
en: { wheat: "Wheat", wheatSeed: "Wheat Seed" },
pt: { wheat: "Trigo", wheatSeed: "Semente de Trigo" }
```

**Pattern Rule**: Use `t('key')` function for all UI text. Add both EN and PT translations immediately.

#### 4. Icon Pattern
Items use emoji icons defined in `getTileIcon()` function:
```javascript
const icons = {
  wheat: '🌾',
  mill: '🏭',
  flour: '⬜'
}
```

**Pattern Rule**: Each new item needs an icon entry. Keep icons distinct and recognizable.

#### 5. Firebase Integration Pattern
```javascript
// Save pattern
await db.collection('farmingTownPlayers').doc(playerId).update({
  field: value
});

// Load pattern
const doc = await db.collection('farmingTownPlayers').doc(playerId).get();
const data = doc.data();
```

**Pattern Rule**: Save on significant actions, not every state change. Use Firestore ServerTimestamp for time fields.

## Adding New Content

### Adding a Crop
1. **Define in data.js**:
```javascript
crops: {
  corn: {
    id: 'corn',
    unlockLevel: 5,
    seedCost: 8,
    growthMinutes: 240,
    harvestYield: 3,
    sellPrice: 12,
    xpOnHarvest: 4,
    xpOnSell: 5
  }
}
```

2. **Add translations** (translations.js):
```javascript
en: { corn: "Corn", cornSeed: "Corn Seed" },
pt: { corn: "Milho", cornSeed: "Semente de Milho" }
```

3. **Add icon** (script.js getTileIcon):
```javascript
corn: '🌽'
```

4. **Add to inventory arrays** (script.js):
- Seeds category: `['wheatSeed', ..., 'cornSeed']`
- Crops category: `['wheat', ..., 'corn']`
- sellableCategories
- seedTypes in showPlantingMenu()
- cropIcons in renderCrop()

5. **Add missions** (data.js):
```javascript
missions: {
  harvest: {
    corn: [/* 6 mission tiers */]
  }
}
```

### Adding a Building
1. **Define in data.js**:
```javascript
buildings: {
  cinema: {
    id: 'cinema',
    unlockLevel: 11,
    width: 3,
    height: 3,
    constructionMinutes: 1440,
    xpOnComplete: 150,
    kitPrice: 2000,
    maxOwned: 2,
    recipes: ['popcorn', 'onionRings', 'orangeJuice']
  }
}
```

2. **Add translations**:
```javascript
cinema: "Cinema", cinemaKit: "Cinema Kit"
```

3. **Add icons**:
```javascript
cinema: '🎬',
cinemaKit: '🎬'
```

4. **Add to inventory arrays**:
- Buildings category in renderInventoryTab()
- Building kit IDs

5. **Add recipes** (see below)

### Adding a Recipe
1. **Define in data.js**:
```javascript
recipes: {
  popcorn: {
    id: 'popcorn',
    buildingType: 'cinema',
    unlockLevel: 11,
    productionMinutes: 20,
    ingredients: { corn: 1 },
    producesQuantity: 2,
    sellPrice: 25,
    xpOnCollect: 15,
    xpOnSell: 15
  }
}
```

2. **Add translations and icons**

3. **Add to inventory product array**

4. **Add missions** (6 production tiers)

5. **Sort recipes by level**: Use `getRecipesForBuilding()` which auto-sorts

## Common Patterns

### Hardcoded Arrays Pattern
Several functions use hardcoded item arrays:
- `renderInventoryTab()` - seeds, crops, products, buildings, farms, trees lists
- `showMarketplaceModal()` - sellableCategories
- `showPlantingMenu()` - seedTypes
- `renderCrop()` - cropIcons

**Why**: Simpler than dynamic discovery from GameData, matches existing pattern.

**When adding new items**: Update ALL relevant arrays.

**Inventory Categories:**
- **Seeds**: Crop seeds only
- **Crops**: Harvested crops + collected fruits (wheat, tomato, apple, lemon, orange)
- **Products**: All building-produced items (flour, bread, pig, chicken, etc.)
- **Buildings**: Non-farm buildings (mill, bakery, butcher, restaurant, cinema)
- **Farms**: Animal farms only (pigFarm, chickenFarm, cowFarm)
- **Trees**: Fruit trees (appleTree, lemonTree, orangeTree)

**Marketplace Categories:**
- **Sell**: All sellable items
- **Buy Seeds**: Crop seeds
- **Buy Buildings**: Non-farm building kits (mill, bakery, butcher, restaurant, cinema)
- **Buy Farms**: Farm building kits (pigFarm, chickenFarm, cowFarm)
- **Buy Decorations**: Roads and decorative items
- **Buy Land**: Grid expansion

### Building Ownership Tracking
```javascript
// Helper function counts ALL buildings: kits + constructing + built
const owned = getTotalBuildingCount(buildingId);

// Pricing based on total owned (not just completed)
// Price doubles if you already own 1 (in any state: kit, constructing, or built)
const price = owned === 0 ? building.kitPrice : building.kitPrice * 2;
```

**Pattern Rule**: 
- **Owned count** = kits in inventory + buildings on grid (both constructing AND completed)
- **Pricing** = base price for first building (owned=0), double price for second (owned=1)
- This ensures consistent pricing and prevents over-purchasing at any stage

### Recipe Sorting
Recipes display sorted by `unlockLevel`:
```javascript
return recipes.sort((a, b) => a.unlockLevel - b.unlockLevel);
```

**Pattern Rule**: Always sort by unlock level for consistent UI.

### Mission Progress Tracking
```javascript
// Auto-increment on harvest/production
GameState.incrementMissionProgress('harvest', cropType, quantity);
GameState.incrementMissionProgress('production', productType, quantity);
```

**Pattern Rule**: Call after adding items to inventory, not before.

## Code Organization Principles

### 1. Separation of Concerns
- **data.js**: Static configuration only
- **script.js**: Game logic and UI
- **translations.js**: Text only
- **style.css**: Visual presentation only

### 2. Function Naming
- `show*Modal()` - Opens modal dialogs
- `render*()` - Updates UI display
- `handle*()` - Event handlers
- `*Grid*()` - Grid manipulation
- `*Production*()` - Production system
- `*Building*()` - Building management

### 3. Key Function Locations (script.js)
- `renderBuilding()` ~line 1096 - Building tile rendering with status indicators
- `placeBuilding()` ~line 1679 - Building placement with origin tile tracking
- `showBuildingModal()` ~line 1839 - Production slot management
- `showInventoryModal()` ~line 2103 - Inventory modal with 6 tabs
- `renderInventoryTab()` ~line 2132 - Renders inventory categories (seeds/crops/products/buildings/farms/trees)
- `renderMarketplaceTab()` ~line 2255 - Marketplace tab switching
- `renderBuyBuildingsTab()` ~line 2501 - Buy Buildings tab (non-farm buildings)
- `renderBuyFarmsTab()` ~line 2560 - Buy Farms tab (animal farms)
- `getTileIcon()` - Icon definitions for all items

### 3. State Mutation Rules
- ✅ Use GameState methods: `GameState.addCoins(10)`
- ❌ Direct mutation: `GameState.coins += 10`
- ✅ Save after significant changes
- ❌ Save on every coin change

### 4. Error Handling
- Check preconditions before actions
- Use `showNotification()` for user feedback
- Validate purchases with `validatePurchase()`
- Never crash - graceful fallbacks

## Testing Checklist Template
When adding new features:
- [ ] Item appears in correct inventory tab
- [ ] Item can be bought from marketplace
- [ ] Item has proper translations (EN/PT)
- [ ] Item icon displays correctly
- [ ] Item integrates with existing systems
- [ ] Firebase saves/loads item data
- [ ] Level requirements work
- [ ] Missions track progress (if applicable)

## Common Pitfalls

### ❌ Missing from Arrays
**Problem**: Added corn but it doesn't show in planting menu
**Solution**: Check ALL inventory arrays - seeds, sellableCategories, seedTypes, cropIcons

### ❌ Translation Missing
**Problem**: [object Object] displays instead of text
**Solution**: Add key to both `en` and `pt` in translations.js

### ❌ Icon Confusion
**Problem**: Flour icon same as wheat
**Solution**: Choose distinct emoji, update getTileIcon()

### ❌ Building Placement
**Problem**: Selected wrong building kit from inventory
**Solution**: Pass buildingType explicitly to showBuildingPlacementMenu()

### ❌ Marketplace Refresh
**Problem**: Can buy multiple kits beyond limit
**Solution**: Refresh marketplace after purchase to update owned count

### ❌ Origin Tile Detection
**Problem**: Building status shows on every tile or doesn't show at all
**Solution**: Use dynamic origin detection in `renderBuilding()` that checks multiple properties:
- `tile.isOriginTile` (new buildings)
- Missing `originX/originY` (very old buildings)
- Matching `tile.x === tile.originX && tile.y === tile.originY` (this is the origin)

### ❌ Production Queue Lookup
**Problem**: Timer/empty status doesn't display for existing buildings
**Solution**: Use `originX/originY` coordinates (not current tile coordinates) when looking up production queues: `const key = ${originX}_${originY}_${slot}`

## Performance Considerations

- Grid renders every second via setInterval
- Auto-save runs every 30 seconds **with stale data protection**
- Firebase writes on significant events only
- Client-side time calculations (not server queries)
- localStorage for playerId caching

## Stale Data Protection (Auto-Save)

### Problem Prevention
To prevent old browser tabs from overwriting newer progress, the game tracks:
- `clientLastActivity`: Timestamp of last action on this client
- Server's `lastPlayed`: Timestamp of last save from any device

### How It Works
Before auto-saving every 30 seconds, `savePlayerData()`:
1. Fetches server's current `lastPlayed` timestamp
2. Compares with client's `clientLastActivity`
3. If server is newer → **Blocks save**, shows warning, stops auto-save
4. If client is newer → **Saves normally**, updates server timestamp

### Activity Tracking
All player actions call `markActivity()`:
- `addCoins()`, `spendCoins()`
- `addXP()`
- `addToInventory()`, `removeFromInventory()`

**Pattern Rule**: Any function that modifies player stats must call `markActivity()` before saving.

**User Warning**: "This tab has outdated data. Please refresh the page to get the latest game state."

## Visual Indicators

### Alert System
- **Building Alert**: Red `!` badge when products ready (appears on origin tile only)
- **Missions Alert**: Red pulsing button when missions completable
- **Mission Badges**: Red count on tabs showing completable missions

**Pattern**: Use CSS animations for attention-grabbing, update on state change.

### Building Status Display
Buildings show real-time status on their **origin tile only** (top-left tile):

**Priority Order:**
1. **"!" Alert** - Products ready to collect (highest priority)
2. **Timer** - Shows shortest remaining production time if any slot is producing
3. **"Empty"** - All 3 production slots are empty
4. **Nothing** - Only if slots are assigned but nothing is producing/ready (rare state)

**Implementation Pattern:**
```javascript
// renderBuilding() determines origin tile dynamically for backwards compatibility
const isOrigin = tile.isOriginTile || 
                 (tile.originX === undefined && tile.originY === undefined) ||
                 (tile.x === tile.originX && tile.y === tile.originY);

// Use originX/originY for production queue lookup
const originX = tile.originX !== undefined ? tile.originX : tile.x;
const originY = tile.originY !== undefined ? tile.originY : tile.y;
const key = `${originX}_${originY}_${slot}`;
```

**Why Dynamic Origin Detection?**
- Old buildings may not have `isOriginTile` property saved
- Gracefully handles buildings placed before this feature was added
- New buildings set `tile.isOriginTile = (index === 0)` in `placeBuilding()`

**Pattern Rule**: Status indicators only appear on origin tile to avoid clutter on multi-tile buildings.

## Mission System

### Mission Structure (6 tiers per item)

**Harvest Missions:**
- Tier 1: 20 units → 5 coins
- Tier 2: 50 → 8 coins
- Tier 3: 100 → 10 coins + 2 XP
- Tier 4: 200 → 20 coins + 5 XP + 1 Apple Tree
- Tier 5: 500 → 35 coins + 10 XP + 1 Lemon Tree
- Tier 6: 1000 → 50 coins + 15 XP + 1 Orange Tree

**Production Missions:**
- Tier 1: 10 units → 5 coins
- Tier 2: 25 → 8 coins
- Tier 3: 50 → 10 coins + 2 XP
- Tier 4: 100 → 20 coins + 5 XP + 1 Apple Tree
- Tier 5: 300 → 35 coins + 10 XP + 1 Lemon Tree
- Tier 6: 500 → 50 coins + 15 XP + 1 Orange Tree

**Pattern Rule**: Harvest missions have higher targets than production missions (2x for tiers 1-4, then 500→1000 and 300→500 for tiers 5-6).

### Mission Sorting
Sort order: Unclaimed completed → In progress → Claimed

**Implementation**: Sort by completion status, then by target ascending.

## Summary
- **Data-driven**: Define content in data.js
- **Bilingual**: Always add EN/PT translations
- **Icon-based**: Use distinct emojis
- **Array-driven**: Update hardcoded arrays when adding content
- **Firebase-backed**: Save on significant events
- **Mission-tracked**: Auto-increment progress on actions
