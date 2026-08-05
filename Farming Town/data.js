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
    },
    corn: {
      id: 'corn',
      unlockLevel: 5,
      seedCost: 8,
      growthMinutes: 240, // 4 hours
      harvestYield: 3,
      sellPrice: 12,
      xpOnHarvest: 4,
      xpOnSell: 5
    },
    carrot: {
      id: 'carrot',
      unlockLevel: 10,
      seedCost: 35,
      growthMinutes: 1080, // 18 hours
      harvestYield: 2,
      sellPrice: 32,
      xpOnHarvest: 15,
      xpOnSell: 18
    },
    onion: {
      id: 'onion',
      unlockLevel: 11,
      seedCost: 50,
      growthMinutes: 2160, // 36 hours
      harvestYield: 4,
      sellPrice: 27,
      xpOnHarvest: 17,
      xpOnSell: 20
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
    },
    orange: {
      id: 'orange',
      unlockLevel: 999,
      ripeMinutes: 360, // 6 hours
      collectionYield: 3,
      sellPrice: 15,
      xpOnCollect: 10,
      xpOnSell: 6,
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
      recipes: ['flour', 'porridge', 'animalFeed']
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
      recipes: ['salad', 'soup', 'lemonade', 'stew']
    },
    cinema: {
      id: 'cinema',
      unlockLevel: 11,
      width: 3,
      height: 3,
      constructionMinutes: 1440, // 24 hours
      xpOnComplete: 150,
      kitPrice: 2000,
      maxOwned: 2,
      recipes: ['popcorn', 'onionRings', 'orangeJuice']
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
    animalFeed: {
      id: 'animalFeed',
      buildingType: 'mill',
      unlockLevel: 6,
      productionMinutes: 180, // 3 hours
      ingredients: { wheat: 1, corn: 2 },
      producesQuantity: 3,
      sellPrice: 20,
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
      ingredients: { animalFeed: 1 },
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
    },
    stew: {
      id: 'stew',
      buildingType: 'restaurant',
      unlockLevel: 11,
      productionMinutes: 360, // 6 hours
      ingredients: { tomato: 1, carrot: 2, potato: 1, steak: 1, onion: 2 },
      producesQuantity: 2,
      sellPrice: 120,
      xpOnCollect: 35,
      xpOnSell: 45
    },

    // Cinema recipes
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
    },
    onionRings: {
      id: 'onionRings',
      buildingType: 'cinema',
      unlockLevel: 12,
      productionMinutes: 60,
      ingredients: { onion: 1 },
      producesQuantity: 2,
      sellPrice: 35,
      xpOnCollect: 15,
      xpOnSell: 18
    },
    orangeJuice: {
      id: 'orangeJuice',
      buildingType: 'cinema',
      unlockLevel: 13,
      productionMinutes: 20,
      ingredients: { orange: 2 },
      producesQuantity: 3,
      sellPrice: 20,
      xpOnCollect: 12,
      xpOnSell: 10
    }
  },

  // Level progression - Total XP required to reach each level
  levels: {
    1: { requiredXP: 0, rewards: [] },
    2: { requiredXP: 20, rewards: [] },
    3: { requiredXP: 50, rewards: [{ type: 'tree', item: 'apple', quantity: 1 }] },
    4: { requiredXP: 150, rewards: [] },
    5: { requiredXP: 600, rewards: [{ type: 'tree', item: 'apple', quantity: 2 }, { type: 'tree', item: 'lemon', quantity: 1 }] },
    6: { requiredXP: 1800, rewards: [] },
    7: { requiredXP: 4000, rewards: [{ type: 'tree', item: 'lemon', quantity: 2 }] },
    8: { requiredXP: 6000, rewards: [{ type: 'tree', item: 'orange', quantity: 1 }] },
    9: { requiredXP: 8900, rewards: [] },
    10: { requiredXP: 14000, rewards: [] },
    11: { requiredXP: 19000, rewards: [{ type: 'tree', item: 'orange', quantity: 1 }] },
    12: { requiredXP: 28400, rewards: [{ type: 'tree', item: 'apple', quantity: 2 }, { type: 'tree', item: 'lemon', quantity: 2 }] },
    13: { requiredXP: 36800, rewards: [{ type: 'tree', item: 'orange', quantity: 2 }] },
    14: { requiredXP: 53600, rewards: [] },
    15: { requiredXP: 87200, rewards: [] }
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
    const recipes = Object.values(this.recipes).filter(recipe => recipe.buildingType === buildingType);
    // Sort by unlock level (ascending) for consistent ordering
    return recipes.sort((a, b) => a.unlockLevel - b.unlockLevel);
  },

  // Helper function to calculate house kit price based on purchase count
  getHouseKitPrice(buildingId, purchaseCount) {
    const basePrice = this.buildings[buildingId].kitPrice;
    // First purchase: base price
    // Second purchase (at +2 levels): double price
    return purchaseCount === 0 ? basePrice : basePrice * 2;
  },

  // Missions system - track player progress for harvest and production
  missions: {
    // Harvest missions for each crop type
    harvest: {
      wheat: [
        { id: 'wheat_20', target: 20, rewards: { coins: 5 } },
        { id: 'wheat_50', target: 50, rewards: { coins: 8 } },
        { id: 'wheat_100', target: 100, rewards: { coins: 10, xp: 2 } },
        { id: 'wheat_200', target: 200, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'wheat_500', target: 500, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'wheat_1000', target: 1000, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      tomato: [
        { id: 'tomato_20', target: 20, rewards: { coins: 5 } },
        { id: 'tomato_50', target: 50, rewards: { coins: 8 } },
        { id: 'tomato_100', target: 100, rewards: { coins: 10, xp: 2 } },
        { id: 'tomato_200', target: 200, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'tomato_500', target: 500, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'tomato_1000', target: 1000, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      potato: [
        { id: 'potato_20', target: 20, rewards: { coins: 5 } },
        { id: 'potato_50', target: 50, rewards: { coins: 8 } },
        { id: 'potato_100', target: 100, rewards: { coins: 10, xp: 2 } },
        { id: 'potato_200', target: 200, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'potato_500', target: 500, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'potato_1000', target: 1000, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      leek: [
        { id: 'leek_20', target: 20, rewards: { coins: 5 } },
        { id: 'leek_50', target: 50, rewards: { coins: 8 } },
        { id: 'leek_100', target: 100, rewards: { coins: 10, xp: 2 } },
        { id: 'leek_200', target: 200, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'leek_500', target: 500, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'leek_1000', target: 1000, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      corn: [
        { id: 'corn_20', target: 20, rewards: { coins: 5 } },
        { id: 'corn_50', target: 50, rewards: { coins: 8 } },
        { id: 'corn_100', target: 100, rewards: { coins: 10, xp: 2 } },
        { id: 'corn_200', target: 200, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'corn_500', target: 500, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'corn_1000', target: 1000, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      carrot: [
        { id: 'carrot_20', target: 20, rewards: { coins: 5 } },
        { id: 'carrot_50', target: 50, rewards: { coins: 8 } },
        { id: 'carrot_100', target: 100, rewards: { coins: 10, xp: 2 } },
        { id: 'carrot_200', target: 200, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'carrot_500', target: 500, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'carrot_1000', target: 1000, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      onion: [
        { id: 'onion_20', target: 20, rewards: { coins: 5 } },
        { id: 'onion_50', target: 50, rewards: { coins: 8 } },
        { id: 'onion_100', target: 100, rewards: { coins: 10, xp: 2 } },
        { id: 'onion_200', target: 200, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'onion_500', target: 500, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'onion_1000', target: 1000, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ]
    },
    
    // Production missions for each recipe type
    production: {
      flour: [
        { id: 'flour_10', target: 10, rewards: { coins: 5 } },
        { id: 'flour_25', target: 25, rewards: { coins: 8 } },
        { id: 'flour_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'flour_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'flour_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'flour_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      porridge: [
        { id: 'porridge_10', target: 10, rewards: { coins: 5 } },
        { id: 'porridge_25', target: 25, rewards: { coins: 8 } },
        { id: 'porridge_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'porridge_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'porridge_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'porridge_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      animalFeed: [
        { id: 'animalFeed_10', target: 10, rewards: { coins: 5 } },
        { id: 'animalFeed_25', target: 25, rewards: { coins: 8 } },
        { id: 'animalFeed_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'animalFeed_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'animalFeed_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'animalFeed_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      pig: [
        { id: 'pig_10', target: 10, rewards: { coins: 5 } },
        { id: 'pig_25', target: 25, rewards: { coins: 8 } },
        { id: 'pig_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'pig_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'pig_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'pig_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      chicken: [
        { id: 'chicken_10', target: 10, rewards: { coins: 5 } },
        { id: 'chicken_25', target: 25, rewards: { coins: 8 } },
        { id: 'chicken_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'chicken_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'chicken_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'chicken_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      egg: [
        { id: 'egg_10', target: 10, rewards: { coins: 5 } },
        { id: 'egg_25', target: 25, rewards: { coins: 8 } },
        { id: 'egg_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'egg_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'egg_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'egg_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      bread: [
        { id: 'bread_10', target: 10, rewards: { coins: 5 } },
        { id: 'bread_25', target: 25, rewards: { coins: 8 } },
        { id: 'bread_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'bread_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'bread_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'bread_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      cake: [
        { id: 'cake_10', target: 10, rewards: { coins: 5 } },
        { id: 'cake_25', target: 25, rewards: { coins: 8 } },
        { id: 'cake_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'cake_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'cake_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'cake_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      potatoScone: [
        { id: 'potatoScone_10', target: 10, rewards: { coins: 5 } },
        { id: 'potatoScone_25', target: 25, rewards: { coins: 8 } },
        { id: 'potatoScone_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'potatoScone_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'potatoScone_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'potatoScone_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      sausage: [
        { id: 'sausage_10', target: 10, rewards: { coins: 5 } },
        { id: 'sausage_25', target: 25, rewards: { coins: 8 } },
        { id: 'sausage_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'sausage_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'sausage_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'sausage_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      steak: [
        { id: 'steak_10', target: 10, rewards: { coins: 5 } },
        { id: 'steak_25', target: 25, rewards: { coins: 8 } },
        { id: 'steak_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'steak_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'steak_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'steak_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      cow: [
        { id: 'cow_10', target: 10, rewards: { coins: 5 } },
        { id: 'cow_25', target: 25, rewards: { coins: 8 } },
        { id: 'cow_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'cow_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'cow_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'cow_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      salad: [
        { id: 'salad_10', target: 10, rewards: { coins: 5 } },
        { id: 'salad_25', target: 25, rewards: { coins: 8 } },
        { id: 'salad_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'salad_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'salad_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'salad_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      soup: [
        { id: 'soup_10', target: 10, rewards: { coins: 5 } },
        { id: 'soup_25', target: 25, rewards: { coins: 8 } },
        { id: 'soup_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'soup_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'soup_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'soup_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      lemonade: [
        { id: 'lemonade_10', target: 10, rewards: { coins: 5 } },
        { id: 'lemonade_25', target: 25, rewards: { coins: 8 } },
        { id: 'lemonade_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'lemonade_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'lemonade_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'lemonade_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      stew: [
        { id: 'stew_10', target: 10, rewards: { coins: 5 } },
        { id: 'stew_25', target: 25, rewards: { coins: 8 } },
        { id: 'stew_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'stew_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'stew_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'stew_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      popcorn: [
        { id: 'popcorn_10', target: 10, rewards: { coins: 5 } },
        { id: 'popcorn_25', target: 25, rewards: { coins: 8 } },
        { id: 'popcorn_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'popcorn_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'popcorn_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'popcorn_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      onionRings: [
        { id: 'onionRings_10', target: 10, rewards: { coins: 5 } },
        { id: 'onionRings_25', target: 25, rewards: { coins: 8 } },
        { id: 'onionRings_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'onionRings_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'onionRings_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'onionRings_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ],
      orangeJuice: [
        { id: 'orangeJuice_10', target: 10, rewards: { coins: 5 } },
        { id: 'orangeJuice_25', target: 25, rewards: { coins: 8 } },
        { id: 'orangeJuice_50', target: 50, rewards: { coins: 10, xp: 2 } },
        { id: 'orangeJuice_100', target: 100, rewards: { coins: 20, xp: 5, appleTree: 1 } },
        { id: 'orangeJuice_300', target: 300, rewards: { coins: 35, xp: 10, lemonTree: 1 } },
        { id: 'orangeJuice_500', target: 500, rewards: { coins: 50, xp: 15, orangeTree: 1 } }
      ]
    }
  }
};

// Make available globally and for Node.js exports if needed
if (typeof window !== 'undefined') {
  window.GameData = GameData;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GameData;
}
