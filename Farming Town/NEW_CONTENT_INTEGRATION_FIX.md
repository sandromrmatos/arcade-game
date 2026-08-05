# New Content Integration Fix

## Issue
New items (corn, carrot, onion seeds/crops, new products, orange tree, cinema) were not appearing in inventory or marketplace because they weren't added to the inventory category arrays.

## Root Cause
When new items were added to `data.js`, they were not added to the hardcoded arrays in `script.js` that determine which items appear in:
1. Inventory tabs (seeds, crops, products, buildings)
2. Marketplace sell tab
3. Planting menu seed options

## Files Fixed

### `script.js` - Updated 4 locations:

#### 1. Inventory Tab Categories (Line ~2043)
**Before:**
```javascript
case 'seeds':
  items = getInventoryItemsByCategory(['wheatSeed', 'tomatoSeed', 'potatoSeed', 'leekSeed']);
  break;
  
case 'crops':
  items = getInventoryItemsByCategory(['wheat', 'tomato', 'potato', 'leek', 'apple', 'lemon']);
  break;
  
case 'products':
  items = getInventoryItemsByCategory([
    'flour', 'porridge', 'pig', 'chicken', 'egg', 'bread', 'cake', 
    'potatoScone', 'sausage', 'steak', 'cow', 'salad', 'soup', 'lemonade'
  ]);
  break;
  
case 'buildings':
  items = getInventoryItemsByCategory([
    'millKit', 'pigFarmKit', 'chickenFarmKit', 'bakeryKit', 
    'butcherKit', 'cowFarmKit', 'restaurantKit', 'appleTree', 'lemonTree'
  ]);
  break;
```

**After:**
```javascript
case 'seeds':
  items = getInventoryItemsByCategory([
    'wheatSeed', 'tomatoSeed', 'potatoSeed', 'leekSeed', 
    'cornSeed', 'carrotSeed', 'onionSeed'  // ← ADDED
  ]);
  break;
  
case 'crops':
  items = getInventoryItemsByCategory([
    'wheat', 'tomato', 'potato', 'leek', 
    'corn', 'carrot', 'onion',  // ← ADDED
    'apple', 'lemon', 'orange'  // ← ADDED orange
  ]);
  break;
  
case 'products':
  items = getInventoryItemsByCategory([
    'flour', 'porridge', 'animalFeed',  // ← ADDED animalFeed
    'pig', 'chicken', 'egg', 'bread', 'cake',
    'potatoScone', 'sausage', 'steak', 'cow', 
    'salad', 'soup', 'lemonade', 'stew',  // ← ADDED stew
    'popcorn', 'onionRings', 'orangeJuice'  // ← ADDED cinema products
  ]);
  break;
  
case 'buildings':
  items = getInventoryItemsByCategory([
    'millKit', 'pigFarmKit', 'chickenFarmKit', 'bakeryKit', 
    'butcherKit', 'cowFarmKit', 'restaurantKit', 'cinemaKit',  // ← ADDED
    'appleTree', 'lemonTree', 'orangeTree'  // ← ADDED orangeTree
  ]);
  break;
```

#### 2. Marketplace Sellable Categories (Line ~2173)
**Before:**
```javascript
const sellableCategories = [
  'wheat', 'tomato', 'potato', 'leek', 'apple', 'lemon',
  'flour', 'porridge', 'pig', 'chicken', 'egg', 'bread', 'cake',
  'potatoScone', 'sausage', 'steak', 'cow', 'salad', 'soup', 'lemonade'
];
```

**After:**
```javascript
const sellableCategories = [
  'wheat', 'tomato', 'potato', 'leek', 'corn', 'carrot', 'onion',  // ← ADDED new crops
  'apple', 'lemon', 'orange',  // ← ADDED orange
  'flour', 'porridge', 'animalFeed',  // ← ADDED animalFeed
  'pig', 'chicken', 'egg', 'bread', 'cake',
  'potatoScone', 'sausage', 'steak', 'cow', 
  'salad', 'soup', 'lemonade', 'stew',  // ← ADDED stew
  'popcorn', 'onionRings', 'orangeJuice'  // ← ADDED cinema products
];
```

#### 3. Planting Menu Seed Types (Line ~1444)
**Before:**
```javascript
const seedTypes = ['wheat', 'tomato', 'potato', 'leek'];
```

**After:**
```javascript
const seedTypes = ['wheat', 'tomato', 'potato', 'leek', 'corn', 'carrot', 'onion'];
```

#### 4. hasAnySeeds() Check (Already fixed earlier)
```javascript
hasAnySeeds() {
  const seedItems = [
    'wheatSeed', 'tomatoSeed', 'potatoSeed', 'leekSeed', 
    'cornSeed', 'carrotSeed', 'onionSeed'  // ← ADDED
  ];
  return seedItems.some(seed => this.getInventoryCount(seed) > 0);
}
```

## New Items Checklist

### ✅ Seeds (7 total)
- [x] wheatSeed (existing)
- [x] tomatoSeed (existing)
- [x] potatoSeed (existing)
- [x] leekSeed (existing)
- [x] **cornSeed** - NOW FIXED
- [x] **carrotSeed** - NOW FIXED
- [x] **onionSeed** - NOW FIXED

### ✅ Crops (7 total)
- [x] wheat (existing)
- [x] tomato (existing)
- [x] potato (existing)
- [x] leek (existing)
- [x] **corn** - NOW FIXED
- [x] **carrot** - NOW FIXED
- [x] **onion** - NOW FIXED

### ✅ Fruits (3 total)
- [x] apple (existing)
- [x] lemon (existing)
- [x] **orange** - NOW FIXED

### ✅ Fruit Trees (3 total)
- [x] appleTree (existing)
- [x] lemonTree (existing)
- [x] **orangeTree** - NOW FIXED

### ✅ Products (20 total)
- [x] flour (existing)
- [x] porridge (existing)
- [x] **animalFeed** - NOW FIXED
- [x] pig (existing)
- [x] chicken (existing)
- [x] egg (existing)
- [x] bread (existing)
- [x] cake (existing)
- [x] potatoScone (existing)
- [x] sausage (existing)
- [x] steak (existing)
- [x] cow (existing)
- [x] salad (existing)
- [x] soup (existing)
- [x] lemonade (existing)
- [x] **stew** - NOW FIXED
- [x] **popcorn** - NOW FIXED
- [x] **onionRings** - NOW FIXED
- [x] **orangeJuice** - NOW FIXED

### ✅ Buildings (8 total)
- [x] mill (existing)
- [x] pigFarm (existing)
- [x] chickenFarm (existing)
- [x] bakery (existing)
- [x] butcher (existing)
- [x] cowFarm (existing)
- [x] restaurant (existing)
- [x] **cinema** - NOW FIXED

### ✅ Building Kits (8 total)
- [x] millKit (existing)
- [x] pigFarmKit (existing)
- [x] chickenFarmKit (existing)
- [x] bakeryKit (existing)
- [x] butcherKit (existing)
- [x] cowFarmKit (existing)
- [x] restaurantKit (existing)
- [x] **cinemaKit** - NOW FIXED

## Data Definitions Status

All items are properly defined in `data.js`:
- ✅ Crops data (corn, carrot, onion with stats)
- ✅ Fruit trees data (orange with stats)
- ✅ Buildings data (cinema with stats)
- ✅ Recipes data (animalFeed, stew, popcorn, onionRings, orangeJuice with stats)
- ✅ Level rewards (orange trees at levels 8, 11, 13)

## Translation Status

All items have translations in `translations.js`:
- ✅ English translations for all new items
- ✅ Portuguese translations for all new items
- ✅ Icons defined in `getTileIcon()` function

## Testing Checklist

### Seeds
- [ ] Buy corn seeds from marketplace → appear in inventory Seeds tab
- [ ] Buy carrot seeds from marketplace → appear in inventory Seeds tab
- [ ] Buy onion seeds from marketplace → appear in inventory Seeds tab
- [ ] Click empty plot → all 7 seed types show in planting menu
- [ ] Plant corn seed → works correctly
- [ ] Plant carrot seed → works correctly
- [ ] Plant onion seed → works correctly

### Crops
- [ ] Harvest corn → appears in Crops & Fruits tab
- [ ] Harvest carrot → appears in Crops & Fruits tab
- [ ] Harvest onion → appears in Crops & Fruits tab
- [ ] Marketplace → Sell tab shows all 7 crop types when owned
- [ ] Sell corn → correct price and XP awarded
- [ ] Sell carrot → correct price and XP awarded
- [ ] Sell onion → correct price and XP awarded

### Orange Tree
- [ ] Level up to 8 → receive 1 orange tree
- [ ] Orange tree appears in Buildings tab
- [ ] Place orange tree on grass → works
- [ ] Wait 6 hours → oranges ripe
- [ ] Collect oranges → receive 3 oranges + XP
- [ ] Oranges appear in Crops & Fruits tab
- [ ] Sell oranges → correct price and XP

### Products
- [ ] Mill produces animalFeed → appears in Products tab
- [ ] Restaurant produces stew → appears in Products tab
- [ ] Cinema produces popcorn → appears in Products tab
- [ ] Cinema produces onion rings → appears in Products tab
- [ ] Cinema produces orange juice → appears in Products tab
- [ ] All products show in Marketplace → Sell tab
- [ ] Selling each product gives correct coins and XP

### Cinema Building
- [ ] Buy cinema kit at level 11 → appears in Buildings tab
- [ ] Click cinema kit → placement mode activates
- [ ] Place cinema (3x3) → construction starts
- [ ] Wait 24 hours → construction completes + 150 XP
- [ ] Click cinema → shows 3 production slots
- [ ] Popcorn recipe available at level 11
- [ ] Onion Rings recipe available at level 12
- [ ] Orange Juice recipe available at level 13

### Missions
- [ ] Harvest corn → corn harvest missions progress
- [ ] Harvest carrot → carrot harvest missions progress
- [ ] Harvest onion → onion harvest missions progress
- [ ] Produce animalFeed → animalFeed missions progress
- [ ] Produce stew → stew missions progress
- [ ] Produce popcorn → popcorn missions progress
- [ ] Produce onion rings → onion rings missions progress
- [ ] Produce orange juice → orange juice missions progress

## Common Integration Patterns

When adding new items in the future, update these locations:

### For New Crops:
1. `data.js` → `GameData.crops`
2. `data.js` → `GameData.missions.harvest`
3. `translations.js` → Add translations for crop, seed, and description
4. `script.js` → `getTileIcon()` - Add icon
5. `script.js` → Inventory 'seeds' category array
6. `script.js` → Inventory 'crops' category array
7. `script.js` → Marketplace sellableCategories array
8. `script.js` → showPlantingMenu() seedTypes array
9. `script.js` → hasAnySeeds() seedItems array

### For New Products:
1. `data.js` → `GameData.recipes`
2. `data.js` → `GameData.missions.production`
3. `data.js` → Link recipe to building in `recipes` array
4. `translations.js` → Add translations
5. `script.js` → `getTileIcon()` - Add icon
6. `script.js` → Inventory 'products' category array
7. `script.js` → Marketplace sellableCategories array

### For New Buildings:
1. `data.js` → `GameData.buildings`
2. `translations.js` → Add building, kit, and description translations
3. `script.js` → `getTileIcon()` - Add icon
4. `script.js` → Inventory 'buildings' category array

### For New Fruit Trees:
1. `data.js` → `GameData.fruitTrees`
2. `data.js` → `GameData.levels` - Add as reward
3. `translations.js` → Add tree, fruit, and description translations
4. `script.js` → `getTileIcon()` - Add icons for tree and fruit
5. `script.js` → Inventory 'buildings' category array (trees go here)
6. `script.js` → Inventory 'crops' category array (fruits go here)
7. `script.js` → Marketplace sellableCategories array (fruits)

## Status
✅ **ALL FIXES APPLIED** - New items now properly integrated into all game systems!
