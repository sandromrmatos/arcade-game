// Farming Town - Game Data Configuration
// All game content: crops, trees, buildings, recipes, levels, rewards

const GameData = {
  // Initial player state
  initialState: {
    coins: 20,
    xp: 0,
    level: 1,
    gridWidth: 5,
    gridHeight: 5,
    inventory: {} // Empty starting inventory
  },

  // Costs and prices
  costs: {
    plotTile: 2, // Cost to convert grass to farmable plot
    roadDecoration: 1
  },

  // Crops that can be planted on plot tiles
  crops: {
    wheat: {
      id: 'wheat',
      unlockLevel: 1,
      seedCost: 1,
      growthMinutes: 10,
      harvestYield: 1, // How many crops you get per tile
      sellPrice: 2, // Per unit
      xpOnHarvest: 1, // XP for harvesting the tile
      xpOnSell: 2 // XP per unit sold
    },
    tomato: {
      id: 'tomato',
      unlockLevel: 3,
      seedCost: 4,
      growthMinutes: 30,
      harvestYield: 2,
      sellPrice: 5,
      xpOnHarvest: 2,
      xpOnSell: 4
    },
    potato: {
      id: 'potato',
      unlockLevel: 6,
      seedCost: 10,
      growthMinutes: 60,
      harvestYield: 2,
      sellPrice: 15,
      xpOnHarvest: 4,
      xpOnSell: 6
    },
    leek: {
      id: 'leek',
      unlockLevel: 8,
      seedCost: 30,
      growthMinutes: 300, // 5 hours
      harvestYield: 4,
      sellPrice: 25,
      xpOnHarvest: 12,
      xpOnSell: 13
    }
  },

  // Fruit trees that can be planted on grass tiles
  fruitTrees: {
    apple: {
      id: 'apple',
      unlockLevel: 999, // Never unlocked for purchase (only from rewards)
      ripeMinutes: 60,
      collectionYield: 3, // Apples per collection
      sellPrice: 5,
      xpOnCollect: 3,
      xpOnSell: 3,
      canPurchase: false // Received as rewards only
    },
    lemon: {
      id: 'lemon',
      unlockLevel: 999,
      ripeMinutes: 120,
      collectionYield: 2,
      sellPrice: 10,
      xpOnCollect: 5,
      xpOnSell: 5,
      canPurchase: false
    }
  },

  // Buildings that can be constructed
  buildings: {
    mill: {
      id: 'mill',
      unlockLevel: 4,
      width: 2,
      height: 2,
      constructionMinutes: 60,
      xpOnComplete: 10,
      kitPrice: 50,
      maxOwned: 2, // Can buy 2nd at level 6 for double price
      recipes: ['flour', 'porridge']
    },
    pigFarm: {
      id: 'pigFarm',
      unlockLevel: 5,
      width: 2,
      height: 3,
      constructionMinutes: 120,
      xpOnComplete: 30,
      kitPrice: 150,
      maxOwned: 2,
      recipes: ['pig']
    },
    chickenFarm: {
      id: 'chickenFarm',
      unlockLevel: 6,
      width: 2,
      height: 3,
      constructionMinutes: 180,
      xpOnComplete: 30,
      kitPrice: 150,
      maxOwned: 2,
      recipes: ['chickenAndEggs']
    },
    bakery: {
      id: 'bakery',
      unlockLevel: 7,
      width: 2,
      height: 2,
      constructionMinutes: 360,
      xpOnComplete: 50,
      kitPrice: 200,
      maxOwned: 2,
      recipes: ['bread', 'cake', 'potatoScone']
    },
    butcher: {
      id: 'butcher',
      unlockLevel: 8,
      width: 2,
      height: 2,
      constructionMinutes: 360,
      xpOnComplete: 50,
      kitPrice: 200,
      maxOwned: 2,
      recipes: ['sausage', 'steak']
    },
    cowFarm: {
      id: 'cowFarm',
      unlockLevel: 9,
      width: 2,
      height: 3,
      constructionMinutes: 720,
      xpOnComplete: 100,
      kitPrice: 500,
      maxOwned: 2,
      recipes: ['cow']
    },
    restaurant: {
      id: 'restaurant',
      unlockLevel: 10,
      width: 3,
      height: 3,
      constructionMinutes: 720,
      xpOnComplete: 120,
      kitPrice: 800,
      maxOwned: 2,
      recipes: ['salad', 'soup', 'lemonade']
    }
  },

  // Production recipes for buildings (each building has 3 slots)
  recipes: {
    // Mill recipes
    flour: {
      id: 'flour',
      buildingType: 'mill',
      unlockLevel: 4,
      productionMinutes: 30,
      ingredients: { wheat: 1 },
      producesQuantity: 2,
      sellPrice: 10,
      xpOnCollect: 5,
      xpOnSell: 5
    },
    porridge: {
      id: 'porridge',
      buildingType: 'mill',
      unlockLevel: 7,
      productionMinutes: 120,
      ingredients: { wheat: 2 },
      producesQuantity: 2,
      sellPrice: 25,
      xpOnCollect: 10,
      xpOnSell: 6
    },

    // Pig Farm recipes
    pig: {
      id: 'pig',
      buildingType: 'pigFarm',
      unlockLevel: 5,
      productionMinutes: 720, // 12 hours
      ingredients: { wheat: 3 },
      producesQuantity: 1,
      sellPrice: 50,
      xpOnCollect: 30,
      xpOnSell: 30
    },

    // Chicken Farm recipes
    chickenAndEggs: {
      id: 'chickenAndEggs',
      buildingType: 'chickenFarm',
      unlockLevel: 6,
      productionMinutes: 1440, // 24 hours
      ingredients: { wheat: 3 },
      produces: { chicken: 1, egg: 5 }, // Special: produces 2 different items
      sellPrices: { chicken: 50, egg: 5 },
      xpOnCollect: 30,
      xpOnSell: { chicken: 30, egg: 10 }
    },

    // Bakery recipes
    bread: {
      id: 'bread',
      buildingType: 'bakery',
      unlockLevel: 7,
      productionMinutes: 120,
      ingredients: { flour: 1 },
      producesQuantity: 2,
      sellPrice: 20,
      xpOnCollect: 10,
      xpOnSell: 6
    },
    cake: {
      id: 'cake',
      buildingType: 'bakery',
      unlockLevel: 9,
      productionMinutes: 720, // 12 hours
      ingredients: { flour: 1, apple: 1, egg: 2 },
      producesQuantity: 2,
      sellPrice: 70,
      xpOnCollect: 50,
      xpOnSell: 25
    },
    potatoScone: {
      id: 'potatoScone',
      buildingType: 'bakery',
      unlockLevel: 11,
      productionMinutes: 720,
      ingredients: { flour: 1, potato: 2 },
      producesQuantity: 2,
      sellPrice: 80,
      xpOnCollect: 70,
      xpOnSell: 35
    },

    // Butcher recipes
    sausage: {
      id: 'sausage',
      buildingType: 'butcher',
      unlockLevel: 8,
      productionMinutes: 900, // 15 hours
      ingredients: { pig: 1 },
      producesQuantity: 5,
      sellPrice: 30,
      xpOnCollect: 40,
      xpOnSell: 30
    },
    steak: {
      id: 'steak',
      buildingType: 'butcher',
      unlockLevel: 10,
      productionMinutes: 2880, // 48 hours
      ingredients: { cow: 1 },
      producesQuantity: 3,
      sellPrice: 65,
      xpOnCollect: 60,
      xpOnSell: 60
    },

    // Cow Farm recipes
    cow: {
      id: 'cow',
      buildingType: 'cowFarm',
      unlockLevel: 9,
      productionMinutes: 2880, // 48 hours
      ingredients: { wheat: 3 },
      producesQuantity: 1,
      sellPrice: 100,
      xpOnCollect: 60,
      xpOnSell: 60
    },

    // Restaurant recipes
    salad: {
      id: 'salad',
      buildingType: 'restaurant',
      unlockLevel: 10,
      productionMinutes: 120, // 2 hours
      ingredients: { tomato: 2 },
      producesQuantity: 2,
      sellPrice: 20,
      xpOnCollect: 5,
      xpOnSell: 5
    },
    soup: {
      id: 'soup',
      buildingType: 'restaurant',
      unlockLevel: 12,
      productionMinutes: 300, // 5 hours
      ingredients: { potato: 2, leek: 1, sausage: 2 },
      producesQuantity: 5,
      sellPrice: 50,
      xpOnCollect: 50,
      xpOnSell: 50
    },
    lemonade: {
      id: 'lemonade',
      buildingType: 'restaurant',
      unlockLevel: 13,
      productionMinutes: 20,
      ingredients: { lemon: 2 },
      producesQuantity: 3,
      sellPrice: 25,
      xpOnCollect: 20,
      xpOnSell: 25
    }
  },

  // Level progression - Total XP required to reach each level
  levels: {
    1: { requiredXP: 0, rewards: [] },
    2: { requiredXP: 20, rewards: [] },
    3: { requiredXP: 50, rewards: [{ type: 'tree', item: 'apple', quantity: 1 }] },
    4: { requiredXP: 150, rewards: [] },
    5: { requiredXP: 300, rewards: [{ type: 'tree', item: 'apple', quantity: 2 }, { type: 'tree', item: 'lemon', quantity: 1 }] },
    6: { requiredXP: 600, rewards: [] },
    7: { requiredXP: 1200, rewards: [{ type: 'tree', item: 'lemon', quantity: 2 }] },
    8: { requiredXP: 2400, rewards: [] },
    9: { requiredXP: 4800, rewards: [] },
    10: { requiredXP: 9600, rewards: [] },
    11: { requiredXP: 19200, rewards: [] },
    12: { requiredXP: 38400, rewards: [{ type: 'tree', item: 'apple', quantity: 2 }, { type: 'tree', item: 'lemon', quantity: 2 }] },
    13: { requiredXP: 76800, rewards: [] },
    14: { requiredXP: 153600, rewards: [] },
    15: { requiredXP: 307200, rewards: [] }
  },

  // Grid expansion configuration
  gridExpansion: {
    startSize: 5, // Start with 5x5 grid
    maxSize: 25, // Maximum 25x25 grid
    baseCost: 50, // First expansion costs 50
    costIncrement: 50, // Each subsequent expansion costs 50 more
    // Calculate price based on current grid size
    getPriceForNextExpansion(currentSize) {
      // First expansion (5->6): 50 coins
      // Second expansion (6->7): 100 coins
      // Third expansion (7->8): 150 coins
      // etc.
      const expansionNumber = currentSize - 4; // 5->6 is expansion #1
      return expansionNumber * this.costIncrement;
    }
  },

  // Helper function to get current level from XP
  getLevelFromXP(xp) {
    let currentLevel = 1;
    for (let level = 15; level >= 1; level--) {
      if (xp >= this.levels[level].requiredXP) {
        currentLevel = level;
        break;
      }
    }
    return currentLevel;
  },

  // Helper function to get XP needed for next level
  getXPForNextLevel(currentLevel) {
    if (currentLevel >= 15) return null; // Max level
    return this.levels[currentLevel + 1].requiredXP;
  },

  // Helper function to check if item is unlocked at current level
  isUnlocked(itemType, itemId, playerLevel) {
    let unlockLevel;
    switch (itemType) {
      case 'crop':
        unlockLevel = this.crops[itemId]?.unlockLevel;
        break;
      case 'tree':
        unlockLevel = this.fruitTrees[itemId]?.unlockLevel;
        break;
      case 'building':
        unlockLevel = this.buildings[itemId]?.unlockLevel;
        break;
      case 'recipe':
        unlockLevel = this.recipes[itemId]?.unlockLevel;
        break;
      default:
        return false;
    }
    return unlockLevel !== undefined && playerLevel >= unlockLevel;
  },

  // Helper function to get all recipes for a building type
  getRecipesForBuilding(buildingType) {
    return Object.values(this.recipes).filter(recipe => recipe.buildingType === buildingType);
  },

  // Helper function to calculate house kit price based on purchase count
  getHouseKitPrice(buildingId, purchaseCount) {
    const basePrice = this.buildings[buildingId].kitPrice;
    // First purchase: base price
    // Second purchase (at +2 levels): double price
    return purchaseCount === 0 ? basePrice : basePrice * 2;
  }
};

// Make available globally and for Node.js exports if needed
if (typeof window !== 'undefined') {
  window.GameData = GameData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameData;
}
