# Farming Town

A resource management and farming simulation game with grid-based gameplay, production chains, and progression system.

## Game Overview

Farming Town is a farming simulation game where players:
- Grow crops (wheat, tomato, potato, leek)
- Harvest fruit from trees (apple, lemon)
- Build and manage production buildings
- Create products through production chains
- Level up and unlock new content
- Manage resources (coins and XP)

## Features

### Core Gameplay
- **5x5 Starting Grid**: Expandable up to 50x100 tiles
- **4 Crops**: Each with different growth times, yields, and unlock levels
- **2 Fruit Trees**: Received as level rewards, produce fruit periodically
- **7 Buildings**: Mills, farms, bakeries, restaurants with production queues
- **13 Recipes**: Complex production chains (wheat → flour → bread → cake)
- **15 Levels**: Progressive unlocks with XP requirements

### Systems
- **Inventory Management**: Track seeds, crops, fruits, products, building kits
- **Marketplace**: 5 menus (Sell, Buy Seeds, Buy Buildings, Buy Decorations, Buy Land)
- **Real-time Timers**: Crops grow, trees ripen, buildings construct, products produce
- **Firebase Integration**: Cloud save/load, leaderboard tracking
- **Bilingual Support**: Full English/Portuguese translation
- **Mobile Responsive**: Touch controls and responsive UI

## How to Play

1. **Start**: Begin with 20 coins and a 5x5 grass grid
2. **Create Plots**: Convert grass to farmable plots (costs 2 coins)
3. **Plant Seeds**: Buy seeds from marketplace, plant on plots
4. **Harvest**: Wait for crops to grow, then harvest for crops + XP
5. **Build**: Purchase building kits, place buildings, wait for construction
6. **Produce**: Use buildings to create products from ingredients
7. **Sell**: Sell crops and products for coins and XP
8. **Level Up**: Gain XP to unlock new crops, buildings, and recipes
9. **Expand**: Buy more land to increase your farm size

## File Structure

```
Farming Town/
├── index.html          # Main game HTML
├── style.css           # All styling and animations
├── script.js           # Core game logic and Firebase integration
├── data.js             # Game content configuration
├── translations.js     # Bilingual text (EN/PT)
├── DATABASE_SCHEMA.md  # Firebase Firestore schema documentation
└── README.md           # This file
```

## Testing

### Local Testing

1. Open `Farming Town/index.html` in a web browser
2. Game will load with Firebase connection
3. Player data is saved to localStorage and Firebase

### Debug Commands (localhost only)

Open browser console and use:

```javascript
// Add items to inventory
debugAddItem('wheatSeed', 10);
debugAddItem('appleTree', 1);
debugAddItem('millKit', 1);

// Add coins
debugAddCoins(1000);

// Add XP (will trigger level up)
debugAddXP(500);
```

### Manual Testing Checklist

- [ ] Player name prompt appears on first load
- [ ] Grid renders correctly (5x5 starting size)
- [ ] Create plot converts grass to farmable soil (costs 2 coins)
- [ ] Plant seed opens seed selection modal
- [ ] Crop growth timer displays and updates
- [ ] Harvest adds crops to inventory and awards XP
- [ ] Trees can be placed from inventory on grass tiles
- [ ] Fruit collection works with timer reset
- [ ] Buildings can be placed (correct size validation)
- [ ] Construction timer completes and awards XP
- [ ] Building production modal shows 3 slots
- [ ] Recipe selection filters by level
- [ ] Production requires correct ingredients
- [ ] Production timer completes and awards products + XP
- [ ] Inventory displays correct quantities across all tabs
- [ ] Marketplace sell tab shows sellable items with prices
- [ ] Marketplace buy seeds shows unlocked seeds
- [ ] Marketplace buy buildings tracks ownership (max 2)
- [ ] Grid expansion adds 5x5 tiles with correct pricing
- [ ] Level up modal displays with rewards
- [ ] Language switching works (EN/PT)
- [ ] Coin/seed safety validation prevents 0 coins without seeds
- [ ] Tooltips show on tile hover
- [ ] Firebase saves/loads data correctly
- [ ] Mobile touch controls work

## Extending the Game

### Adding New Crops

Edit `data.js`:

```javascript
crops: {
  // ... existing crops
  corn: {
    id: 'corn',
    unlockLevel: 10,
    seedCost: 50,
    growthMinutes: 240,  // 4 hours
    harvestYield: 3,
    sellPrice: 30,
    xpOnHarvest: 8,
    xpOnSell: 10
  }
}
```

Add translations in `translations.js`:
```javascript
corn: "Corn",
cornSeed: "Corn Seed",
```

Add emoji in `getTileIcon()` in `script.js`:
```javascript
corn: '🌽',
```

### Adding New Buildings

Edit `data.js`:

```javascript
buildings: {
  // ... existing buildings
  winery: {
    id: 'winery',
    unlockLevel: 12,
    width: 3,
    height: 2,
    constructionMinutes: 480,
    xpOnComplete: 80,
    kitPrice: 600,
    maxOwned: 2,
    recipes: ['wine', 'juice']
  }
}
```

### Adding New Recipes

Edit `data.js`:

```javascript
recipes: {
  // ... existing recipes
  wine: {
    id: 'wine',
    buildingType: 'winery',
    unlockLevel: 12,
    productionMinutes: 360,  // 6 hours
    ingredients: { apple: 5, lemon: 2 },
    producesQuantity: 2,
    sellPrice: 100,
    xpOnCollect: 50,
    xpOnSell: 60
  }
}
```

### Adding New Levels

Edit `data.js`:

```javascript
levels: {
  // ... existing levels
  16: { 
    requiredXP: 614400, 
    rewards: [
      { type: 'tree', item: 'apple', quantity: 3 }
    ] 
  }
}
```

## Firebase Configuration

The game uses Firestore with 5 collections:

1. **farmingTownPlayers**: Player stats (coins, xp, level, grid size)
2. **farmingTownGrids**: Individual tile data
3. **farmingTownInventories**: Player inventory items
4. **farmingTownProduction**: Building production queues
5. **games**: Leaderboard (shared with other arcade games)

See `DATABASE_SCHEMA.md` for detailed schema documentation.

## Performance Notes

- Grid tiles update every second via `setInterval`
- Auto-save runs every 30 seconds
- Firebase writes are batched where possible
- Timestamps stored in Firestore, calculations done client-side

## Browser Compatibility

- **Recommended**: Chrome, Firefox, Safari (latest versions)
- **Mobile**: iOS Safari, Chrome Mobile
- **Requirements**: ES6+ support, localStorage, Firestore SDK

## Credits

- **Game Design**: Farming simulation inspired by FarmVille and Hay Day
- **Icons**: Emoji-based tile system
- **Framework**: Vanilla JavaScript with Firebase Firestore
- **Arcade Integration**: Part of HTML5 Arcade Game Collection

## License

Part of the HTML5 Arcade Game Collection project.

---

**Version**: 1.0.0  
**Last Updated**: 2026-08-04  
**Status**: Complete and playable
