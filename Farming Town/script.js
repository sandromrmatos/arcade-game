// Farming Town - Main Game Script
// Core game state management, Firebase integration, and game logic

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

let db = null;
let playerId = null;

// Firebase configuration (same as other games in the collection)
const firebaseConfig = {
  apiKey: "AIzaSyDNC-6v_OcYEtMfju_JLcJXPyv-pD1pj2E",
  authDomain: "arcade-sandro.firebaseapp.com",
  projectId: "arcade-sandro",
  storageBucket: "arcade-sandro.appspot.com",
  messagingSenderId: "910071936481",
  appId: "1:910071936481:web:98ee449c6a8ef62e5a97f9"
};

function initFirebase() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
}

// ============================================================================
// GAME STATE MANAGEMENT
// ============================================================================

const GameState = {
  // Player data
  playerName: '',
  coins: 20,
  xp: 0,
  level: 1,
  
  // Grid data
  gridWidth: 5,
  gridHeight: 5,
  grid: [], // 2D array of tile objects
  
  // Inventory: { itemId: quantity }
  inventory: {},
  
  // Mission progress tracking: { missionId: { progress: number, claimed: boolean } }
  missionProgress: {},
  
  // Production queues: { "x_y_slot": productionData }
  productionQueues: {},
  
  // Building ownership tracking: { buildingType: count }
  buildingsOwned: {},
  
  // Grid expansion tracking
  gridExpansionCount: 0,
  
  // UI state
  selectedTile: null,
  placementMode: null, // null, 'tree', 'building'
  placementItem: null,
  placementPreviewTile: null, // For confirming building placement
  
  // Continuous planting mode
  plantingModeActive: false,
  plantingModeCropType: null, // The seed being planted
  
  // Continuous harvest mode
  harvestModeActive: false,
  harvestModeCollected: {}, // Track what was collected: { wheat: 5, apple: 3, ... }
  
  // Timers
  updateInterval: null,
  saveInterval: null,
  
  // Track last activity timestamp to prevent stale data overwrites
  clientLastActivity: null,
  
  // Update client activity timestamp (called on any game action)
  markActivity() {
    this.clientLastActivity = new Date();
  },
  
  // Initialize game state
  init() {
    // Initialize as empty sparse grid - tiles will be loaded/added as needed
    this.grid = [];
  },
  
  // Create a tile object
  createTile(x, y, type = 'grass') {
    return {
      x,
      y,
      type, // 'grass', 'plot', 'tree', 'building', 'road'
      
      // Crop data (for plots)
      cropType: null,
      plantedAt: null,
      growthMinutes: null,
      
      // Tree data
      treeType: null,
      lastCollectedAt: null,
      ripeMinutes: null,
      
      // Building data
      buildingType: null,
      isConstructing: false,
      constructionStartedAt: null,
      constructionMinutes: null,
      isOriginTile: false,
      originX: null,
      originY: null
    };
  },
  
  // Get tile at position
  getTile(x, y) {
    if (y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[y].length) {
      return this.grid[y][x]; // May return null for unplaced expansion areas
    }
    return null;
  },
  
  // Calculate actual bounds of the grid (min/max of all non-null tiles)
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
    
    // Return bounds (or defaults if no tiles)
    if (minX === Infinity) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }
    
    return { minX, minY, maxX: maxX + 1, maxY: maxY + 1 };
  },
  
  // Update player stats display
  updateDisplay() {
    document.getElementById('playerNameDisplay').textContent = this.playerName || '...';
    document.getElementById('levelDisplay').textContent = this.level;
    document.getElementById('xpDisplay').textContent = this.xp;
    
    const nextLevelXP = GameData.getXPForNextLevel(this.level);
    document.getElementById('xpNextDisplay').textContent = nextLevelXP || 'MAX';
    
    document.getElementById('coinsDisplay').textContent = this.coins;
  },
  
  // Add coins
  addCoins(amount) {
    this.coins += amount;
    this.markActivity();
    this.updateDisplay();
    this.savePlayerData();
  },
  
  // Spend coins (returns true if successful)
  spendCoins(amount) {
    if (this.coins >= amount) {
      this.coins -= amount;
      this.markActivity();
      this.updateDisplay();
      this.savePlayerData();
      return true;
    }
    return false;
  },
  
  // Add XP and check for level up
  addXP(amount) {
    this.xp += amount;
    const oldLevel = this.level;
    this.level = GameData.getLevelFromXP(this.xp);
    
    this.markActivity();
    this.updateDisplay();
    this.savePlayerData();
    
    // Update leaderboard whenever XP changes
    this.updateLeaderboard();
    
    // Check if leveled up
    if (this.level > oldLevel) {
      this.onLevelUp(oldLevel, this.level);
    }
  },
  
  // Handle level up
  onLevelUp(oldLevel, newLevel) {
    console.log(`Level up! ${oldLevel} -> ${newLevel}`);
    
    // Show level up modal
    showLevelUpModal(newLevel);
    
    // Award level rewards
    const levelData = GameData.levels[newLevel];
    if (levelData && levelData.rewards && levelData.rewards.length > 0) {
      levelData.rewards.forEach(reward => {
        if (reward.type === 'tree') {
          const itemKey = `${reward.item}Tree`;
          this.addToInventory(itemKey, reward.quantity);
        }
      });
    }
    
    // Update leaderboard
    this.updateLeaderboard();
  },
  
  // Inventory management
  addToInventory(itemId, quantity) {
    if (!this.inventory[itemId]) {
      this.inventory[itemId] = 0;
    }
    this.inventory[itemId] += quantity;
    this.markActivity();
    this.saveInventory();
  },
  
  removeFromInventory(itemId, quantity) {
    if (this.inventory[itemId] && this.inventory[itemId] >= quantity) {
      this.inventory[itemId] -= quantity;
      if (this.inventory[itemId] === 0) {
        delete this.inventory[itemId];
      }
      this.markActivity();
      this.saveInventory();
      return true;
    }
    return false;
  },
  
  getInventoryCount(itemId) {
    return this.inventory[itemId] || 0;
  },
  
  hasInInventory(itemId, quantity = 1) {
    return this.getInventoryCount(itemId) >= quantity;
  },
  
  // Check if player has any seeds
  hasAnySeeds() {
    const seedItems = ['wheatSeed', 'tomatoSeed', 'potatoSeed', 'leekSeed', 'cornSeed', 'carrotSeed', 'onionSeed'];
    return seedItems.some(seed => this.getInventoryCount(seed) > 0);
  },
  
  // Save functions (will implement Firebase integration)
  async savePlayerData() {
    // CRITICAL: Prevent saving while visiting a friend
    if (isVisitingFriend) {
      console.log('Blocked save: currently visiting a friend');
      return;
    }
    
    if (!db || !playerId) {
      console.log('Cannot save player data: db or playerId missing');
      return;
    }
    
    try {
      // STALE DATA CHECK: Fetch server's lastPlayed to prevent overwrites
      const doc = await db.collection('farmingTownPlayers').doc(playerId).get();
      
      if (doc.exists) {
        const serverData = doc.data();
        const serverLastPlayed = serverData.lastPlayed;
        
        // If server has newer data than this client, don't overwrite
        if (serverLastPlayed && this.clientLastActivity) {
          const serverTime = serverLastPlayed.toDate();
          const clientTime = this.clientLastActivity;
          
          // Calculate time difference in milliseconds
          const timeDiff = serverTime - clientTime;
          
          // Only warn if server data is SIGNIFICANTLY newer (more than 5 minutes)
          // This prevents false positives during normal gameplay with network delays
          const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds
          
          if (timeDiff > STALE_THRESHOLD) {
            console.warn('⚠️ STALE DATA DETECTED: Server has significantly newer data.');
            console.warn('Server last played:', serverTime);
            console.warn('Client last activity:', clientTime);
            console.warn('Time difference:', Math.round(timeDiff / 1000 / 60), 'minutes');
            
            // Show warning to user
            showNotification(
              t('warning'),
              'This tab has outdated data. Please refresh the page to get the latest game state.'
            );
            
            // Stop auto-save to prevent repeated overwrites
            if (this.saveInterval) {
              clearInterval(this.saveInterval);
              this.saveInterval = null;
              console.log('Auto-save disabled due to stale data');
            }
            
            return; // Don't save stale data
          }
          
          // Small time difference (< 5 minutes) is acceptable - likely just network delay
          if (timeDiff > 0) {
            console.log('Small time difference detected (', Math.round(timeDiff / 1000), 'seconds) - proceeding with save');
          }
        }
      }
      
      // Safe to save - update clientLastActivity
      this.clientLastActivity = new Date();
      
      await db.collection('farmingTownPlayers').doc(playerId).set({
        playerName: this.playerName,
        coins: this.coins,
        xp: this.xp,
        level: this.level,
        gridWidth: this.gridWidth,
        gridHeight: this.gridHeight,
        lastPlayed: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log('Player data saved:', { coins: this.coins, xp: this.xp, level: this.level });
    } catch (error) {
      console.error('Error saving player data:', error);
    }
  },
  
  async saveGridTile(tile) {
    // CRITICAL: Prevent saving while visiting a friend
    if (isVisitingFriend) {
      console.log('Blocked tile save: currently visiting a friend');
      return;
    }
    
    if (!db || !playerId) {
      console.log('Cannot save tile: db or playerId missing');
      return;
    }
    
    try {
      const tileId = `${playerId}_tile_${tile.x}_${tile.y}`;
      await db.collection('farmingTownGrids').doc(tileId).set({
        playerId,
        x: tile.x,
        y: tile.y,
        tileType: tile.type,
        cropType: tile.cropType,
        plantedAt: tile.plantedAt,
        growthMinutes: tile.growthMinutes,
        treeType: tile.treeType,
        lastCollectedAt: tile.lastCollectedAt,
        ripeMinutes: tile.ripeMinutes,
        buildingType: tile.buildingType,
        isConstructing: tile.isConstructing,
        constructionStartedAt: tile.constructionStartedAt,
        constructionMinutes: tile.constructionMinutes,
        isOriginTile: tile.isOriginTile,
        originX: tile.originX,
        originY: tile.originY,
        lastModified: firebase.firestore.FieldValue.serverTimestamp()
      });
      console.log('Tile saved:', { x: tile.x, y: tile.y, type: tile.type });
    } catch (error) {
      console.error('Error saving grid tile:', error);
    }
  },
  
  async saveInventory() {
    // CRITICAL: Prevent saving while visiting a friend
    if (isVisitingFriend) {
      console.log('Blocked inventory save: currently visiting a friend');
      return;
    }
    
    if (!db || !playerId) return;
    
    try {
      // Get all existing inventory items from database to check for deletions
      const existingInventorySnapshot = await db.collection('farmingTownInventories')
        .where('playerId', '==', playerId)
        .get();
      
      const existingItems = new Set();
      existingInventorySnapshot.forEach(doc => {
        existingItems.add(doc.data().itemName);
      });
      
      // Save or update current inventory items
      for (const [itemId, quantity] of Object.entries(this.inventory)) {
        if (quantity > 0) {
          const inventoryId = `${playerId}_item_${itemId}`;
          await db.collection('farmingTownInventories').doc(inventoryId).set({
            playerId,
            itemName: itemId,
            quantity: quantity,
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
          });
          existingItems.delete(itemId); // Mark as handled
        }
      }
      
      // Delete items that are no longer in inventory
      for (const itemId of existingItems) {
        const inventoryId = `${playerId}_item_${itemId}`;
        await db.collection('farmingTownInventories').doc(inventoryId).delete();
        console.log('Deleted inventory item from database:', itemId);
      }
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  },
  
  async saveProduction(buildingX, buildingY, slotIndex, productionData) {
    // CRITICAL: Prevent saving while visiting a friend
    if (isVisitingFriend) {
      console.log('Blocked production save: currently visiting a friend');
      return;
    }
    
    if (!db || !playerId) return;
    
    try {
      const productionId = `${playerId}_building_${buildingX}_${buildingY}_slot_${slotIndex}`;
      await db.collection('farmingTownProduction').doc(productionId).set({
        playerId,
        buildingX,
        buildingY,
        slotIndex,
        recipeType: productionData.recipeType,
        isProducing: productionData.isProducing,
        startedAt: productionData.startedAt,
        productionMinutes: productionData.productionMinutes,
        completed: productionData.completed,
        lastModified: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving production:', error);
    }
  },
  
  async updateLeaderboard() {
    // CRITICAL: Prevent leaderboard updates while visiting a friend
    if (isVisitingFriend) {
      console.log('Blocked leaderboard update: currently visiting a friend');
      return;
    }
    
    if (!db || !this.playerName) return;
    
    try {
      // Use player-specific document ID to avoid duplicates
      const leaderboardId = `farmingTown_${playerId}`;
      await db.collection('games').doc(leaderboardId).set({
        playerName: this.playerName,
        gameName: 'Farming Town',
        level: this.level,
        xp: this.xp,
        score: this.xp, // Use XP as the score for sorting
        lastPlayed: firebase.firestore.FieldValue.serverTimestamp(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      // Notify parent window if in iframe
      if (window.parent && window.parent.saveGameScore) {
        window.parent.saveGameScore('Farming Town', {
          level: this.level,
          xp: this.xp,
          score: this.xp
        });
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
    }
  },
  
  // Mission tracking methods
  incrementMissionProgress(type, itemId, amount = 1) {
    // type: 'harvest' or 'production'
    // itemId: crop/product identifier (e.g., 'wheat', 'flour')
    
    if (!GameData.missions[type] || !GameData.missions[type][itemId]) {
      return; // No missions for this item
    }
    
    const missions = GameData.missions[type][itemId];
    
    missions.forEach(mission => {
      const missionKey = mission.id;
      
      // Initialize progress if not exists
      if (!this.missionProgress[missionKey]) {
        this.missionProgress[missionKey] = {
          progress: 0,
          claimed: false
        };
      }
      
      // Only increment if not completed and claimed
      if (!this.missionProgress[missionKey].claimed) {
        this.missionProgress[missionKey].progress += amount;
        
        // Cap at target
        if (this.missionProgress[missionKey].progress > mission.target) {
          this.missionProgress[missionKey].progress = mission.target;
        }
      }
    });
    
    // Save mission progress
    this.saveMissionProgress();
    
    // Update missions button alert
    updateMissionsButtonAlert();
  },
  
  async saveMissionProgress() {
    // CRITICAL: Prevent saving while visiting a friend
    if (isVisitingFriend) {
      console.log('Blocked mission progress save: currently visiting a friend');
      return;
    }
    
    if (!db || !playerId) return;
    
    try {
      await db.collection('farmingTownPlayers').doc(playerId).update({
        missionProgress: this.missionProgress
      });
    } catch (error) {
      console.error('Error saving mission progress:', error);
    }
  },
  
  claimMissionReward(missionId) {
    // Find the mission in GameData
    let mission = null;
    let missionType = null;
    
    // Search in harvest missions
    for (const cropType in GameData.missions.harvest) {
      const found = GameData.missions.harvest[cropType].find(m => m.id === missionId);
      if (found) {
        mission = found;
        missionType = 'harvest';
        break;
      }
    }
    
    // Search in production missions if not found
    if (!mission) {
      for (const productType in GameData.missions.production) {
        const found = GameData.missions.production[productType].find(m => m.id === missionId);
        if (found) {
          mission = found;
          missionType = 'production';
          break;
        }
      }
    }
    
    if (!mission) {
      console.error('Mission not found:', missionId);
      return false;
    }
    
    // Check if mission is completed
    const progress = this.missionProgress[missionId];
    if (!progress || progress.progress < mission.target) {
      showNotification(t('missions'), 'Mission not completed yet!');
      return false;
    }
    
    // Check if already claimed
    if (progress.claimed) {
      showNotification(t('missions'), 'Reward already claimed!');
      return false;
    }
    
    // Distribute rewards
    const rewards = mission.rewards;
    let rewardText = [];
    
    if (rewards.coins) {
      this.addCoins(rewards.coins);
      rewardText.push(`🪙 ${rewards.coins}`);
    }
    
    if (rewards.xp) {
      this.addXP(rewards.xp);
      rewardText.push(`${rewards.xp} XP`);
    }
    
    if (rewards.appleTree) {
      this.addToInventory('appleTree', rewards.appleTree);
      rewardText.push(`🍎🌳 ${rewards.appleTree}`);
    }
    
    if (rewards.lemonTree) {
      this.addToInventory('lemonTree', rewards.lemonTree);
      rewardText.push(`🍋🌳 ${rewards.lemonTree}`);
    }
    
    if (rewards.orangeTree) {
      this.addToInventory('orangeTree', rewards.orangeTree);
      rewardText.push(`🍊🌳 ${rewards.orangeTree}`);
    }
    
    // Mark as claimed
    this.missionProgress[missionId].claimed = true;
    this.saveMissionProgress();
    
    // Update missions button alert
    updateMissionsButtonAlert();
    
    // Update tab badges
    updateMissionTabBadges();
    
    // Show notification
    showNotification(t('missionClaimed'), `${t('missionReward')}: ${rewardText.join(', ')}`);
    
    return true;
  },
  
  // Load game data from Firebase
  async loadGameData() {
    if (!db || !playerId) {
      console.log('Cannot load: db or playerId missing');
      return false;
    }
    
    try {
      showLoadingScreen(true);
      console.log('Loading game data for player:', playerId);
      
      // Load player data
      const playerDoc = await db.collection('farmingTownPlayers').doc(playerId).get();
      if (playerDoc.exists) {
        const data = playerDoc.data();
        this.playerName = data.playerName;
        this.coins = data.coins;
        this.xp = data.xp;
        this.level = data.level;
        this.gridWidth = data.gridWidth || 5;
        this.gridHeight = data.gridHeight || 5;
        this.missionProgress = data.missionProgress || {};
        
        // Set clientLastActivity from server's lastPlayed timestamp
        if (data.lastPlayed) {
          this.clientLastActivity = data.lastPlayed.toDate();
          console.log('Client last activity set to:', this.clientLastActivity);
        } else {
          // No lastPlayed yet, set to now
          this.clientLastActivity = new Date();
        }
        
        console.log('Player data loaded:', { coins: this.coins, xp: this.xp, level: this.level });
      } else {
        // New player - save initial data
        console.log('New player - creating initial data');
        this.clientLastActivity = new Date();
        await this.savePlayerData();
      }
      
      // Initialize empty grid
      this.init();
      
      // Load grid tiles from database
      const gridSnapshot = await db.collection('farmingTownGrids')
        .where('playerId', '==', playerId)
        .get();
      
      console.log('Loaded', gridSnapshot.size, 'grid tiles from database');
      
      // Reconstruct sparse grid from saved tiles
      gridSnapshot.forEach(doc => {
        const data = doc.data();
        const x = data.x;
        const y = data.y;
        
        // Ensure grid array is large enough
        while (this.grid.length <= y) {
          this.grid.push([]);
        }
        while (this.grid[y].length <= x) {
          this.grid[y].push(null);
        }
        
        // Create tile and populate with saved data
        const tile = this.createTile(x, y, data.tileType);
        tile.cropType = data.cropType;
        tile.plantedAt = data.plantedAt;
        tile.growthMinutes = data.growthMinutes;
        tile.treeType = data.treeType;
        tile.lastCollectedAt = data.lastCollectedAt;
        tile.ripeMinutes = data.ripeMinutes;
        tile.buildingType = data.buildingType;
        tile.isConstructing = data.isConstructing;
        tile.constructionStartedAt = data.constructionStartedAt;
        tile.constructionMinutes = data.constructionMinutes;
        tile.isOriginTile = data.isOriginTile;
        tile.originX = data.originX;
        tile.originY = data.originY;
        
        this.grid[y][x] = tile;
      });
      
      // Recalculate grid dimensions from loaded tiles
      const bounds = this.getGridBounds();
      this.gridWidth = bounds.maxX;
      this.gridHeight = bounds.maxY;
      
      // If no tiles loaded (new player), create initial 5x5
      if (gridSnapshot.size === 0) {
        console.log('No saved tiles - creating initial 5x5 grid');
        for (let y = 0; y < 5; y++) {
          if (!this.grid[y]) this.grid[y] = [];
          for (let x = 0; x < 5; x++) {
            const tile = this.createTile(x, y, 'grass');
            this.grid[y][x] = tile;
            this.saveGridTile(tile);
          }
        }
        this.gridWidth = 5;
        this.gridHeight = 5;
      }
      
      // Load inventory
      const inventorySnapshot = await db.collection('farmingTownInventories')
        .where('playerId', '==', playerId)
        .get();
      
      console.log('Loaded', inventorySnapshot.size, 'inventory items from database');
      
      this.inventory = {};
      inventorySnapshot.forEach(doc => {
        const data = doc.data();
        this.inventory[data.itemName] = data.quantity;
      });
      
      // Load production queues
      const productionSnapshot = await db.collection('farmingTownProduction')
        .where('playerId', '==', playerId)
        .get();
      
      this.productionQueues = {};
      productionSnapshot.forEach(doc => {
        const data = doc.data();
        const key = `${data.buildingX}_${data.buildingY}_${data.slotIndex}`;
        this.productionQueues[key] = {
          recipeType: data.recipeType,
          isProducing: data.isProducing,
          startedAt: data.startedAt,
          productionMinutes: data.productionMinutes,
          completed: data.completed
        };
      });
      
      // Count owned buildings
      this.buildingsOwned = {};
      this.grid.forEach(row => {
        row.forEach(tile => {
          if (tile.type === 'building' && tile.isOriginTile && !tile.isConstructing) {
            const buildingType = tile.buildingType;
            this.buildingsOwned[buildingType] = (this.buildingsOwned[buildingType] || 0) + 1;
          }
        });
      });
      
      console.log('Game data loaded successfully');
      showLoadingScreen(false);
      return true;
    } catch (error) {
      console.error('Error loading game data:', error);
      showLoadingScreen(false);
      return false;
    }
  }
};

// ============================================================================
// GAME INITIALIZATION
// ============================================================================

async function initGame() {
  console.log('Initializing Farming Town...');
  
  // Initialize Firebase
  if (!initFirebase()) {
    showNotification('Error', 'Failed to initialize database connection.');
    return;
  }
  
  // Get player name first
  let playerName = localStorage.getItem('farmingTownPlayerName');
  if (!playerName) {
    // Try to get from parent window (arcade system)
    if (window.parent && window.parent.localStorage) {
      try {
        playerName = window.parent.localStorage.getItem('arcadePlayerName');
      } catch (e) {
        console.log('Cannot access parent player name');
      }
    }
    
    // Prompt if still no name
    if (!playerName) {
      playerName = prompt(t('playerName') + ':') || 'Farmer';
      localStorage.setItem('farmingTownPlayerName', playerName);
    }
  }
  
  GameState.playerName = playerName;
  
  // Look up existing player by name in Firestore
  try {
    const playerSnapshot = await db.collection('farmingTownPlayers')
      .where('playerName', '==', playerName)
      .limit(1)
      .get();
    
    if (!playerSnapshot.empty) {
      // Found existing player - use their ID
      const existingDoc = playerSnapshot.docs[0];
      playerId = existingDoc.id;
      localStorage.setItem('farmingTownPlayerId', playerId);
      console.log('Found existing player:', playerName, 'with ID:', playerId);
    } else {
      // New player - create new ID
      playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('farmingTownPlayerId', playerId);
      console.log('Created new player:', playerName, 'with ID:', playerId);
    }
  } catch (error) {
    console.error('Error looking up player:', error);
    // Fallback to local storage or create new
    playerId = localStorage.getItem('farmingTownPlayerId');
    if (!playerId) {
      playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('farmingTownPlayerId', playerId);
    }
  }
  
  // Load game data or initialize new game
  const loaded = await GameState.loadGameData();
  if (!loaded) {
    // New game
    GameState.init();
  }
  
  // Update timers for crops, trees, buildings, production
  updateAllTimers();
  
  // Render grid
  renderGrid();
  
  // Update display
  GameState.updateDisplay();
  
  // Update missions button alert
  updateMissionsButtonAlert();
  
  // Set up event listeners
  setupEventListeners();
  
  // Start update loop (every second)
  GameState.updateInterval = setInterval(() => {
    updateAllTimers();
    renderGrid();
  }, 1000);
  
  // Auto-save every 30 seconds
  GameState.saveInterval = setInterval(() => {
    GameState.savePlayerData();
    GameState.updateLeaderboard(); // Update leaderboard on auto-save
  }, 30000);
  
  // Initial leaderboard update
  GameState.updateLeaderboard();
  
  console.log('Game initialized!');
}

// Update all timers (crops, trees, buildings, production)
function updateAllTimers() {
  const now = new Date();
  
  GameState.grid.forEach(row => {
    row.forEach(tile => {
      // Skip null tiles
      if (!tile) return;
      
      // Update crop timers
      if (tile.type === 'plot' && tile.cropType && tile.plantedAt) {
        const elapsed = (now - tile.plantedAt.toDate()) / 1000 / 60; // minutes
        if (elapsed >= tile.growthMinutes) {
          tile.ready = true;
        }
      }
      
      // Update tree timers
      if (tile.type === 'tree' && tile.treeType) {
        if (tile.lastCollectedAt) {
          const elapsed = (now - tile.lastCollectedAt.toDate()) / 1000 / 60;
          tile.fruitReady = elapsed >= tile.ripeMinutes;
        } else {
          tile.fruitReady = true; // First collection
        }
      }
      
      // Update building construction
      if (tile.type === 'building' && tile.isConstructing && tile.constructionStartedAt) {
        const elapsed = (now - tile.constructionStartedAt.toDate()) / 1000 / 60;
        if (elapsed >= tile.constructionMinutes) {
          tile.isConstructing = false;
          if (tile.isOriginTile) {
            handleConstructionComplete(tile);
          }
        }
      }
    });
  });
  
  // Update production queues
  Object.entries(GameState.productionQueues).forEach(([key, production]) => {
    if (production.isProducing && !production.completed && production.startedAt) {
      const elapsed = (now - production.startedAt.toDate()) / 1000 / 60;
      if (elapsed >= production.productionMinutes) {
        production.completed = true;
        GameState.saveProduction(
          parseInt(key.split('_')[0]),
          parseInt(key.split('_')[1]),
          parseInt(key.split('_')[2]),
          production
        );
      }
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Language selector
  document.getElementById('languageSelector').addEventListener('change', (e) => {
    setLanguage(e.target.value);
  });
  
  // Action buttons
  document.getElementById('btnInventory').addEventListener('click', showInventoryModal);
  document.getElementById('btnMarketplace').addEventListener('click', showMarketplaceModal);
  document.getElementById('btnMissions').addEventListener('click', showMissionsModal);
  document.getElementById('btnCreatePlot').addEventListener('click', handleCreatePlot);
  document.getElementById('btnPlantCrops').addEventListener('click', showPlantingModeSelector);
  document.getElementById('btnHarvest').addEventListener('click', toggleHarvestMode);
  document.getElementById('btnVisitFriend').addEventListener('click', showVisitFriendModal);
  document.getElementById('btnHelp').addEventListener('click', showHelpModal);
  
  // Modal close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = e.target.getAttribute('data-close');
      closeModal(modalId);
    });
  });
  
  // Close modals on background click
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
}

// Show/hide loading screen
function showLoadingScreen(show) {
  const screen = document.getElementById('loadingScreen');
  if (show) {
    screen.classList.remove('hidden');
  } else {
    screen.classList.add('hidden');
  }
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Show notification modal
function showNotification(title, message) {
  document.getElementById('notificationTitle').textContent = title;
  document.getElementById('notificationMessage').textContent = message;
  document.getElementById('notificationModal').classList.remove('hidden');
  
  document.getElementById('btnCloseNotification').onclick = () => {
    closeModal('notificationModal');
  };
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
  initGame();
});

// Save game when page unloads
window.addEventListener('beforeunload', () => {
  if (GameState.updateInterval) clearInterval(GameState.updateInterval);
  if (GameState.saveInterval) clearInterval(GameState.saveInterval);
  GameState.savePlayerData();
});

// Continue in next part due to file size...

// ============================================================================
// GRID RENDERING AND TILE SYSTEM
// ============================================================================

// Render the entire grid
function renderGrid() {
  const container = document.getElementById('gridContainer');
  container.innerHTML = '';
  
  // Use actual grid dimensions (no longer sparse, always rectangular)
  const displayWidth = GameState.gridWidth;
  const displayHeight = GameState.gridHeight;
  
  // Set grid CSS properties
  container.style.gridTemplateColumns = `repeat(${displayWidth}, 60px)`;
  container.style.gridTemplateRows = `repeat(${displayHeight}, 60px)`;
  
  // Render each tile
  for (let y = 0; y < displayHeight; y++) {
    for (let x = 0; x < displayWidth; x++) {
      const tile = GameState.getTile(x, y);
      
      if (tile) {
        const tileElement = createTileElement(tile);
        container.appendChild(tileElement);
      }
    }
  }
}

// Create a tile DOM element
function createTileElement(tile) {
  const div = document.createElement('div');
  div.className = 'grid-tile';
  div.dataset.x = tile.x;
  div.dataset.y = tile.y;
  
  // Add tile type class
  div.classList.add(`tile-${tile.type}`);
  
  // Render tile content based on type
  switch (tile.type) {
    case 'grass':
      div.innerHTML = '🌱';
      break;
      
    case 'plot':
      if (tile.cropType) {
        div.innerHTML = renderCrop(tile);
      } else {
        div.innerHTML = '🟤';
      }
      break;
      
    case 'tree':
      div.innerHTML = renderTree(tile);
      break;
      
    case 'building':
      div.innerHTML = renderBuilding(tile);
      break;
      
    case 'road':
      // No content, just grey background
      break;
  }
  
  // Add click handler
  div.addEventListener('click', () => {
    handleTileClick(tile);
    // On mobile, hide tooltip after click to prevent it sticking
    if ('ontouchstart' in window) {
      hideTooltip();
    }
  });
  
  // Add hover handlers for tooltip (desktop only)
  if (!('ontouchstart' in window)) {
    div.addEventListener('mouseenter', (e) => showTileTooltip(tile, e));
    div.addEventListener('mouseleave', hideTooltip);
    div.addEventListener('mousemove', (e) => updateTooltipPosition(e));
  }
  
  return div;
}

// Render crop on plot tile
function renderCrop(tile) {
  const cropIcons = {
    wheat: '🌾',
    tomato: '🍅',
    potato: '🥔',
    leek: '🥬',
    corn: '🌽',
    carrot: '🥕',
    onion: '🧅'
  };
  
  const icon = cropIcons[tile.cropType] || '🌱';
  
  // Check if ready to harvest
  if (tile.ready) {
    return `<div class="tile-content tile-ready">${icon}</div><div class="tile-timer">${t('ready')}</div>`;
  }
  
  // Calculate time remaining
  if (tile.plantedAt && tile.growthMinutes) {
    const now = new Date();
    const elapsed = (now - tile.plantedAt.toDate()) / 1000 / 60; // minutes
    const remaining = Math.max(0, Math.ceil(tile.growthMinutes - elapsed));
    
    const timeStr = formatTime(remaining);
    return `<div class="tile-content">${icon}</div><div class="tile-timer">${timeStr}</div>`;
  }
  
  return `<div class="tile-content">${icon}</div>`;
}

// Render tree on tree tile
function renderTree(tile) {
  const treeIcons = {
    apple: '🍎',
    lemon: '🍋',
    orange: '🍊'
  };
  
  const icon = treeIcons[tile.treeType] || '🌳';
  
  // Check if fruit is ready
  if (tile.fruitReady) {
    return `<div class="tile-content tile-ready">${icon}</div><div class="tile-timer">${t('ready')}</div>`;
  }
  
  // Calculate time until ripe
  if (tile.lastCollectedAt && tile.ripeMinutes) {
    const now = new Date();
    const elapsed = (now - tile.lastCollectedAt.toDate()) / 1000 / 60;
    const remaining = Math.max(0, Math.ceil(tile.ripeMinutes - elapsed));
    
    const timeStr = formatTime(remaining);
    return `<div class="tile-content">${icon}</div><div class="tile-timer">${timeStr}</div>`;
  }
  
  return `<div class="tile-content">${icon}</div>`;
}

// Render building on building tile
function renderBuilding(tile) {
  const buildingIcons = {
    mill: '🏭',
    pigFarm: '🐷',
    chickenFarm: '🐔',
    bakery: '🥖',
    butcher: '🥩',
    cowFarm: '🐄',
    restaurant: '🍽️',
    cinema: '🎬'
  };
  
  const icon = buildingIcons[tile.buildingType] || '🏢';
  
  // Show construction animation
  if (tile.isConstructing) {
    if (tile.constructionStartedAt && tile.constructionMinutes) {
      const now = new Date();
      const elapsed = (now - tile.constructionStartedAt.toDate()) / 1000 / 60;
      const remaining = Math.max(0, Math.ceil(tile.constructionMinutes - elapsed));
      
      const timeStr = formatTime(remaining);
      return `<div class="tile-content tile-constructing">${icon}</div><div class="tile-timer">${timeStr}</div>`;
    }
    return `<div class="tile-content tile-constructing">${icon}</div>`;
  }
  
  // Determine if this is the origin tile (top-left of building)
  // If originX/originY are set, check if this tile matches those coordinates
  // Otherwise, if not set, treat this tile as origin (for backwards compatibility)
  const isOrigin = tile.isOriginTile || 
                   (tile.originX === undefined && tile.originY === undefined) ||
                   (tile.x === tile.originX && tile.y === tile.originY);
  
  // Only show status on origin tile
  if (isOrigin) {
    // Use originX/originY if set, otherwise use this tile's coordinates
    const originX = tile.originX !== undefined ? tile.originX : tile.x;
    const originY = tile.originY !== undefined ? tile.originY : tile.y;
    
    // Check production slots for status
    let hasCompletedProducts = false;
    let hasProduction = false;
    let shortestTime = Infinity;
    
    for (let slot = 0; slot < 3; slot++) {
      const key = `${originX}_${originY}_${slot}`;
      const production = GameState.productionQueues[key];
      
      if (production && production.recipeType) {
        hasProduction = true;
        
        if (production.completed) {
          hasCompletedProducts = true;
        } else if (production.isProducing && production.startedAt && production.productionMinutes) {
          // Calculate remaining time for this slot
          const now = new Date();
          const elapsed = (now - production.startedAt.toDate()) / 1000 / 60;
          const remaining = Math.max(0, Math.ceil(production.productionMinutes - elapsed));
          
          if (remaining < shortestTime) {
            shortestTime = remaining;
          }
        }
      }
    }
    
    // Priority 1: Show alert if products are ready
    if (hasCompletedProducts) {
      return `<div class="tile-content">${icon}<div class="building-alert">!</div></div>`;
    }
    
    // Priority 2: Show shortest production time if anything is producing
    if (shortestTime < Infinity) {
      const timeStr = formatTime(shortestTime);
      return `<div class="tile-content">${icon}</div><div class="tile-timer">${timeStr}</div>`;
    }
    
    // Priority 3: Show "empty" if no production at all
    if (!hasProduction) {
      return `<div class="tile-content">${icon}</div><div class="tile-timer">${t('empty')}</div>`;
    }
  }
  
  // For non-origin tiles, just show the icon
  return `<div class="tile-content">${icon}</div>`;
}

// Format time in minutes to readable string
function formatTime(minutes) {
  if (minutes < 1) return '< 1m';
  if (minutes < 60) return `${Math.ceil(minutes)}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = Math.ceil(minutes % 60);
  
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

// Show tooltip on tile hover
function showTileTooltip(tile, event) {
  const tooltip = document.getElementById('tooltip');
  const content = document.getElementById('tooltipContent');
  
  let text = '';
  
  switch (tile.type) {
    case 'grass':
      text = t('grass') || 'Grass';
      break;
      
    case 'plot':
      if (tile.cropType) {
        const cropName = t(tile.cropType);
        if (tile.ready) {
          text = `${cropName} - ${t('ready')}`;
        } else if (tile.plantedAt && tile.growthMinutes) {
          const now = new Date();
          const elapsed = (now - tile.plantedAt.toDate()) / 1000 / 60;
          const remaining = Math.max(0, Math.ceil(tile.growthMinutes - elapsed));
          text = `${cropName}\n${t('timeLeft')}: ${formatTime(remaining)}`;
        } else {
          text = cropName;
        }
      } else {
        text = t('emptyPlot') || 'Empty Plot - Click to plant';
      }
      break;
      
    case 'tree':
      if (tile.treeType) {
        const treeName = t(`${tile.treeType}Tree`);
        if (tile.fruitReady) {
          text = `${treeName} - ${t('ready')}`;
        } else if (tile.lastCollectedAt && tile.ripeMinutes) {
          const now = new Date();
          const elapsed = (now - tile.lastCollectedAt.toDate()) / 1000 / 60;
          const remaining = Math.max(0, Math.ceil(tile.ripeMinutes - elapsed));
          text = `${treeName}\n${t('timeLeft')}: ${formatTime(remaining)}`;
        } else {
          text = treeName;
        }
      }
      break;
      
    case 'building':
      if (tile.buildingType) {
        const buildingName = t(tile.buildingType);
        if (tile.isConstructing) {
          if (tile.constructionStartedAt && tile.constructionMinutes) {
            const now = new Date();
            const elapsed = (now - tile.constructionStartedAt.toDate()) / 1000 / 60;
            const remaining = Math.max(0, Math.ceil(tile.constructionMinutes - elapsed));
            text = `${buildingName}\n${t('constructing')}: ${formatTime(remaining)}`;
          } else {
            text = `${buildingName} - ${t('constructing')}`;
          }
        } else {
          text = `${buildingName}\n${t('clickToInteract') || 'Click to interact'}`;
        }
      }
      break;
      
    case 'road':
      text = t('road');
      break;
  }
  
  if (text) {
    content.innerHTML = text.replace(/\n/g, '<br>');
    tooltip.classList.remove('hidden');
    updateTooltipPosition(event);
  }
}

// Hide tooltip
function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  tooltip.classList.add('hidden');
}

// Update tooltip position
function updateTooltipPosition(event) {
  const tooltip = document.getElementById('tooltip');
  const offset = 15;
  
  let x = event.clientX + offset;
  let y = event.clientY + offset;
  
  // Keep tooltip on screen
  const rect = tooltip.getBoundingClientRect();
  if (x + rect.width > window.innerWidth) {
    x = event.clientX - rect.width - offset;
  }
  if (y + rect.height > window.innerHeight) {
    y = event.clientY - rect.height - offset;
  }
  
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
}

// Get tile emoji icon
function getTileIcon(type, subtype = null) {
  const icons = {
    grass: '🌱',
    plot: '🟤',
    road: '🛤️',
    wheat: '🌾',
    tomato: '🍅',
    potato: '🥔',
    leek: '🥬',
    corn: '🌽',
    carrot: '🥕',
    onion: '🧅',
    apple: '🍎',
    lemon: '🍋',
    orange: '🍊',
    appleTree: '🍎🌳',
    lemonTree: '🍋🌳',
    orangeTree: '🍊🌳',
    mill: '🏭',
    millKit: '🏭',
    pigFarm: '🐷',
    pigFarmKit: '🐷',
    chickenFarm: '🐔',
    chickenFarmKit: '🐔',
    bakery: '🥖',
    bakeryKit: '🥖',
    butcher: '🥩',
    butcherKit: '🥩',
    cowFarm: '🐄',
    cowFarmKit: '🐄',
    restaurant: '🍽️',
    restaurantKit: '🍽️',
    cinema: '🎬',
    cinemaKit: '🎬',
    flour: '⬜',
    porridge: '🥣',
    animalFeed: '🌰',
    pig: '🐷',
    chicken: '🐔',
    chickenAndEggs: '🐔🥚',
    egg: '🥚',
    bread: '🍞',
    cake: '🎂',
    potatoScone: '🥔🍞',
    sausage: '🌭',
    steak: '🥩',
    cow: '🐄',
    salad: '🥗',
    soup: '🍲',
    lemonade: '🥤',
    stew: '🍲',
    popcorn: '🍿',
    onionRings: '🧅⭕',
    orangeJuice: '🧃'
  };
  
  return icons[subtype || type] || '❓';
}

// Handle create plot button
function handleCreatePlot() {
  // Enable plot creation mode
  GameState.placementMode = 'plot';
  showNotification(t('createPlot'), t('selectGrassTile') || 'Select a grass tile to convert to plot (costs 2 coins)');
}

// Expand grid (automatically adds 1 row and 1 column)
function expandGrid() {
  const currentSize = Math.max(GameState.gridWidth, GameState.gridHeight);
  
  // Check max size
  if (currentSize >= GameData.gridExpansion.maxSize) {
    showNotification(t('buyLand'), t('maxGridReached'));
    return false;
  }
  
  // Get expansion price based on current size
  const price = GameData.gridExpansion.getPriceForNextExpansion(currentSize);
  
  // Check safety validation
  if (!validatePurchase(price)) {
    return false;
  }
  
  // Check if can afford
  if (!GameState.spendCoins(price)) {
    showNotification(t('buyLand'), t('notEnoughCoins'));
    return false;
  }
  
  // Perform expansion: add 1 row and 1 column
  const newWidth = GameState.gridWidth + 1;
  const newHeight = GameState.gridHeight + 1;
  
  // Add new column (rightmost) to all existing rows
  for (let y = 0; y < GameState.grid.length; y++) {
    const x = GameState.grid[y].length;
    const tile = GameState.createTile(x, y, 'grass');
    GameState.grid[y].push(tile);
    GameState.saveGridTile(tile);
  }
  
  // Add new row (bottom) with all columns
  const newRow = [];
  const y = GameState.grid.length;
  for (let x = 0; x < newWidth; x++) {
    const tile = GameState.createTile(x, y, 'grass');
    newRow.push(tile);
    GameState.saveGridTile(tile);
  }
  GameState.grid.push(newRow);
  
  // Update dimensions
  GameState.gridWidth = newWidth;
  GameState.gridHeight = newHeight;
  GameState.gridExpansionCount++;
  
  // Save and render
  GameState.savePlayerData();
  renderGrid();
  
  const tilesAdded = (newWidth + newHeight - 1); // Row + column minus corner
  showNotification(
    t('buyLand'), 
    `${t('gridExpanded')} ${currentSize}x${currentSize} → ${newWidth}x${newHeight} (+${tilesAdded} tiles)`
  );
  
  // Close marketplace
  closeModal('marketplaceModal');
  
  return true;
}

// ============================================================================
// CROP PLANTING AND HARVESTING SYSTEM
// ============================================================================

// Plant a seed on a plot tile
function plantSeed(tile, cropType) {
  // Validate
  if (tile.type !== 'plot') {
    showNotification(t('plant'), t('needPlotTile'));
    return false;
  }
  
  if (tile.cropType) {
    showNotification(t('plant'), t('tileOccupied'));
    return false;
  }
  
  const seedId = `${cropType}Seed`;
  if (!GameState.hasInInventory(seedId, 1)) {
    showNotification(t('plant'), t('notEnoughSeeds'));
    return false;
  }
  
  // Get crop data
  const cropData = GameData.crops[cropType];
  if (!cropData) return false;
  
  // Remove seed from inventory
  GameState.removeFromInventory(seedId, 1);
  
  // Plant the seed
  tile.cropType = cropType;
  tile.plantedAt = firebase.firestore.Timestamp.now();
  tile.growthMinutes = cropData.growthMinutes;
  tile.ready = false;
  
  // Save to database
  GameState.saveGridTile(tile);
  
  // Update display
  renderGrid();
  showNotification(t('plant'), t('seedPlanted'));
  
  return true;
}

// Harvest a crop
function harvestCrop(tile) {
  if (tile.type !== 'plot' || !tile.cropType) {
    return false;
  }
  
  if (!tile.ready) {
    if (!GameState.harvestModeActive) {
      showNotification(t('harvest'), t('notReady') || 'Crop is not ready yet!');
    }
    return false;
  }
  
  const cropData = GameData.crops[tile.cropType];
  if (!cropData) return false;
  
  const cropType = tile.cropType;
  
  // Add harvested crops to inventory
  GameState.addToInventory(cropType, cropData.harvestYield);
  
  // Add XP
  GameState.addXP(cropData.xpOnHarvest);
  
  // Track mission progress for harvest
  GameState.incrementMissionProgress('harvest', cropType, cropData.harvestYield);
  
  // Track in harvest mode
  if (GameState.harvestModeActive) {
    if (!GameState.harvestModeCollected[cropType]) {
      GameState.harvestModeCollected[cropType] = 0;
    }
    GameState.harvestModeCollected[cropType] += cropData.harvestYield;
  }
  
  // Clear the plot
  tile.cropType = null;
  tile.plantedAt = null;
  tile.growthMinutes = null;
  tile.ready = false;
  
  // Save to database
  GameState.saveGridTile(tile);
  
  // Update display
  renderGrid();
  
  // Show notification only if NOT in harvest mode
  if (!GameState.harvestModeActive) {
    showNotification(t('harvest'), `${t('harvested')} +${cropData.harvestYield} ${t(cropType)}`);
  }
  
  return true;
}

// Show planting menu for a plot tile
function showPlantingMenu(tile) {
  const modal = document.getElementById('plantingModal');
  const optionsContainer = document.getElementById('plantingOptions');
  optionsContainer.innerHTML = '';
  
  // Get available seeds from inventory
  const seedTypes = ['wheat', 'tomato', 'potato', 'leek', 'corn', 'carrot', 'onion'];
  let hasSeeds = false;
  
  seedTypes.forEach(cropType => {
    const seedId = `${cropType}Seed`;
    const count = GameState.getInventoryCount(seedId);
    
    if (count > 0) {
      hasSeeds = true;
      const cropData = GameData.crops[cropType];
      
      const option = document.createElement('div');
      option.className = 'planting-option';
      option.innerHTML = `
        <div class="option-icon">${getTileIcon(cropType)}</div>
        <div class="option-name">${t(cropType)}</div>
        <div class="option-count">${count}</div>
      `;
      
      option.addEventListener('click', () => {
        plantSeed(tile, cropType);
        closeModal('plantingModal');
      });
      
      optionsContainer.appendChild(option);
    }
  });
  
  if (!hasSeeds) {
    optionsContainer.innerHTML = `<p style="text-align:center;padding:20px;color:#999;">${t('noSeeds')}</p>`;
  }
  
  modal.classList.remove('hidden');
}

// ============================================================================
// CONTINUOUS PLANTING MODE
// ============================================================================

// Show planting mode selector (choose seed type for continuous planting)
function showPlantingModeSelector() {
  // Check if already in planting mode - if so, stop it
  if (GameState.plantingModeActive) {
    stopPlantingMode();
    return;
  }
  
  const modal = document.getElementById('plantingModal');
  const titleElement = modal.querySelector('h2');
  const optionsContainer = document.getElementById('plantingOptions');
  optionsContainer.innerHTML = '';
  
  titleElement.textContent = t('plantCrops');
  
  // Get available seeds from inventory
  const seedTypes = [
    { cropType: 'wheat', seedId: 'wheatSeed' },
    { cropType: 'tomato', seedId: 'tomatoSeed' },
    { cropType: 'potato', seedId: 'potatoSeed' },
    { cropType: 'leek', seedId: 'leekSeed' },
    { cropType: 'corn', seedId: 'cornSeed' },
    { cropType: 'carrot', seedId: 'carrotSeed' },
    { cropType: 'onion', seedId: 'onionSeed' }
  ];
  
  let hasSeeds = false;
  
  seedTypes.forEach(({ cropType, seedId }) => {
    const count = GameState.getInventoryCount(seedId);
    
    if (count > 0) {
      hasSeeds = true;
      const cropData = GameData.crops[cropType];
      
      const option = document.createElement('div');
      option.className = 'planting-option';
      option.innerHTML = `
        <div class="option-icon">${getTileIcon(cropType)}</div>
        <div class="option-name">${t(cropType)}</div>
        <div class="option-count">${count}</div>
      `;
      
      option.addEventListener('click', () => {
        startPlantingMode(cropType);
        closeModal('plantingModal');
      });
      
      optionsContainer.appendChild(option);
    }
  });
  
  if (!hasSeeds) {
    optionsContainer.innerHTML = `<p style="text-align:center;padding:20px;color:#999;">${t('noSeeds')}</p>`;
  }
  
  modal.classList.remove('hidden');
}

// Start continuous planting mode
function startPlantingMode(cropType) {
  GameState.plantingModeActive = true;
  GameState.plantingModeCropType = cropType;
  
  // Update button text to "Stop Planting"
  const btn = document.getElementById('btnPlantCrops');
  btn.textContent = t('stopPlanting');
  btn.classList.add('planting-active');
  
  showNotification(
    t('plantCrops'),
    `${t('planting')} ${t(cropType)}. ${t('clickEmptyPlots')}`
  );
}

// Stop continuous planting mode
function stopPlantingMode() {
  GameState.plantingModeActive = false;
  GameState.plantingModeCropType = null;
  
  // Update button text back to "Plant Crops"
  const btn = document.getElementById('btnPlantCrops');
  btn.textContent = t('plantCrops');
  btn.classList.remove('planting-active');
  
  showNotification(t('plantCrops'), t('plantingModeStopped'));
}

// Plant seed in continuous mode (no popup)
function plantSeedContinuous(tile, cropType) {
  const cropData = GameData.crops[cropType];
  if (!cropData) return false;
  
  const seedId = `${cropType}Seed`;
  
  // Check if have seeds
  if (!GameState.hasInInventory(seedId, 1)) {
    // Out of seeds - stop planting mode
    stopPlantingMode();
    showNotification(
      t('plantCrops'),
      `${t('outOfSeeds')} ${t(seedId)}`
    );
    return false;
  }
  
  // Remove seed from inventory
  GameState.removeFromInventory(seedId, 1);
  
  // Plant the seed
  tile.cropType = cropType;
  tile.plantedAt = firebase.firestore.Timestamp.now();
  tile.growthMinutes = cropData.growthMinutes;
  tile.ready = false;
  
  // Save to database
  GameState.saveGridTile(tile);
  
  // Update display
  renderGrid();
  
  // Check if out of seeds after this plant
  if (!GameState.hasInInventory(seedId, 1)) {
    stopPlantingMode();
    showNotification(
      t('plantCrops'),
      `${t('outOfSeeds')} ${t(seedId)}`
    );
  }
  
  return true;
}

// ============================================================================
// CONTINUOUS HARVEST MODE
// ============================================================================

// Toggle harvest mode
function toggleHarvestMode() {
  if (GameState.harvestModeActive) {
    stopHarvestMode();
  } else {
    startHarvestMode();
  }
}

// Start continuous harvest mode
function startHarvestMode() {
  GameState.harvestModeActive = true;
  GameState.harvestModeCollected = {}; // Reset collection tracker
  
  // Update button text to "Stop Harvesting"
  const btn = document.getElementById('btnHarvest');
  btn.textContent = t('stopHarvesting');
  btn.classList.add('harvest-active');
  
  // Show simple notification without OK button requirement
  const notification = document.createElement('div');
  notification.id = 'harvestModeNotification';
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: rgba(76, 175, 80, 0.95);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = `${t('harvesting')} - ${t('clickReadyCrops')}`;
  document.body.appendChild(notification);
}

// Stop continuous harvest mode
function stopHarvestMode() {
  GameState.harvestModeActive = false;
  
  // Update button text back to "Harvest"
  const btn = document.getElementById('btnHarvest');
  btn.textContent = t('harvestButton');
  btn.classList.remove('harvest-active');
  
  // Remove mode notification
  const modeNotification = document.getElementById('harvestModeNotification');
  if (modeNotification) {
    modeNotification.remove();
  }
  
  // Show harvest summary if anything was collected
  const collected = GameState.harvestModeCollected;
  const items = Object.keys(collected);
  
  if (items.length > 0) {
    let summaryText = `${t('harvestComplete')}:\n`;
    items.forEach(itemId => {
      const icon = getTileIcon(itemId);
      summaryText += `${icon} +${collected[itemId]} ${t(itemId)}\n`;
    });
    
    // Show summary in a simple notification (no OK button in the floating notification)
    const summary = document.createElement('div');
    summary.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: rgba(76, 175, 80, 0.95);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      max-width: 300px;
      white-space: pre-line;
      animation: slideIn 0.3s ease;
    `;
    summary.textContent = summaryText;
    document.body.appendChild(summary);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      summary.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => summary.remove(), 300);
    }, 4000);
  }
  
  // Reset collection tracker
  GameState.harvestModeCollected = {};
}

// ============================================================================
// FRUIT TREE PLACEMENT AND COLLECTION SYSTEM
// ============================================================================

// Place a tree on a grass tile
function placeTree(tile, treeType) {
  // Validate
  if (tile.type !== 'grass') {
    showNotification(t('placeTree'), t('needGrassTile'));
    return false;
  }
  
  const treeItemId = `${treeType}Tree`;
  if (!GameState.hasInInventory(treeItemId, 1)) {
    showNotification(t('placeTree'), t('noTrees'));
    return false;
  }
  
  // Get tree data
  const treeData = GameData.fruitTrees[treeType];
  if (!treeData) return false;
  
  // Remove tree from inventory
  GameState.removeFromInventory(treeItemId, 1);
  
  // Place the tree
  tile.type = 'tree';
  tile.treeType = treeType;
  tile.lastCollectedAt = null; // First collection will be immediate
  tile.ripeMinutes = treeData.ripeMinutes;
  tile.fruitReady = true;
  
  // Save to database
  GameState.saveGridTile(tile);
  
  // Update display
  renderGrid();
  showNotification(t('placeTree'), t('treePlaced'));
  
  // Exit placement mode
  GameState.placementMode = null;
  GameState.placementItem = null;
  
  return true;
}

// Collect fruit from tree
function collectFruit(tile) {
  if (tile.type !== 'tree' || !tile.treeType) {
    return false;
  }
  
  if (!tile.fruitReady) {
    if (!GameState.harvestModeActive) {
      showNotification(t('collect'), t('notReady') || 'Fruit is not ripe yet!');
    }
    return false;
  }
  
  const treeData = GameData.fruitTrees[tile.treeType];
  if (!treeData) return false;
  
  const fruitType = tile.treeType; // 'apple', 'lemon', or 'orange'
  
  // Add fruit to inventory
  GameState.addToInventory(fruitType, treeData.collectionYield);
  
  // Add XP
  GameState.addXP(treeData.xpOnCollect);
  
  // Track in harvest mode
  if (GameState.harvestModeActive) {
    if (!GameState.harvestModeCollected[fruitType]) {
      GameState.harvestModeCollected[fruitType] = 0;
    }
    GameState.harvestModeCollected[fruitType] += treeData.collectionYield;
  }
  
  // Reset collection timer
  tile.lastCollectedAt = firebase.firestore.Timestamp.now();
  tile.fruitReady = false;
  
  // Save to database
  GameState.saveGridTile(tile);
  
  // Update display
  renderGrid();
  
  // Show notification only if NOT in harvest mode
  if (!GameState.harvestModeActive) {
    showNotification(t('collect'), `${t('fruitCollected')} +${treeData.collectionYield} ${t(fruitType)}`);
  }
  
  return true;
}

// Show tree placement menu
function showTreePlacementMenu() {
  const modal = document.getElementById('treePlacementModal');
  const optionsContainer = document.getElementById('treeOptions');
  optionsContainer.innerHTML = '';
  
  // Get available trees from inventory
  const treeTypes = ['apple', 'lemon'];
  let hasTrees = false;
  
  treeTypes.forEach(treeType => {
    const treeId = `${treeType}Tree`;
    const count = GameState.getInventoryCount(treeId);
    
    if (count > 0) {
      hasTrees = true;
      
      const option = document.createElement('div');
      option.className = 'tree-option';
      option.innerHTML = `
        <div class="option-icon">${getTileIcon(treeType)}</div>
        <div class="option-name">${t(treeId)}</div>
        <div class="option-count">${count}</div>
      `;
      
      option.addEventListener('click', () => {
        GameState.placementMode = 'tree';
        GameState.placementItem = treeType;
        closeModal('treePlacementModal');
        showNotification(t('placeTree'), t('clickToPlace'));
      });
      
      optionsContainer.appendChild(option);
    }
  });
  
  if (!hasTrees) {
    optionsContainer.innerHTML = `<p style="text-align:center;padding:20px;color:#999;">${t('noTrees')}</p>`;
  }
  
  modal.classList.remove('hidden');
}

// ============================================================================
// BUILDING PLACEMENT AND CONSTRUCTION SYSTEM
// ============================================================================

// Place a building on grass tiles
function placeBuilding(originTile, buildingType) {
  const buildingData = GameData.buildings[buildingType];
  if (!buildingData) return false;
  
  // Validate origin tile is grass
  if (originTile.type !== 'grass') {
    showNotification(t('placeBuilding'), t('needGrassTile'));
    return false;
  }
  
  // Check if all required tiles are available (grass)
  const tiles = [];
  for (let dy = 0; dy < buildingData.height; dy++) {
    for (let dx = 0; dx < buildingData.width; dx++) {
      const tile = GameState.getTile(originTile.x + dx, originTile.y + dy);
      if (!tile || tile.type !== 'grass') {
        showNotification(t('placeBuilding'), t('invalidPlacement'));
        return false;
      }
      tiles.push(tile);
    }
  }
  
  const kitId = `${buildingType}Kit`;
  if (!GameState.hasInInventory(kitId, 1)) {
    showNotification(t('placeBuilding'), t('noBuildings'));
    return false;
  }
  
  // Remove kit from inventory
  GameState.removeFromInventory(kitId, 1);
  
  // Place building on all tiles
  const constructionStart = firebase.firestore.Timestamp.now();
  
  tiles.forEach((tile, index) => {
    tile.type = 'building';
    tile.buildingType = buildingType;
    tile.isConstructing = true;
    tile.constructionStartedAt = constructionStart;
    tile.constructionMinutes = buildingData.constructionMinutes;
    tile.isOriginTile = (index === 0); // First tile is origin
    tile.originX = originTile.x;
    tile.originY = originTile.y;
    
    GameState.saveGridTile(tile);
  });
  
  // Update display
  renderGrid();
  showNotification(t('placeBuilding'), t('buildingPlaced'));
  
  // Exit placement mode
  GameState.placementMode = null;
  GameState.placementItem = null;
  
  return true;
}

// Handle construction completion
function handleConstructionComplete(tile) {
  if (!tile.isOriginTile) return;
  
  const buildingData = GameData.buildings[tile.buildingType];
  if (!buildingData) return;
  
  // Add XP for completing construction
  GameState.addXP(buildingData.xpOnComplete);
  
  // Track building ownership
  if (!GameState.buildingsOwned[tile.buildingType]) {
    GameState.buildingsOwned[tile.buildingType] = 0;
  }
  GameState.buildingsOwned[tile.buildingType]++;
  
  // Initialize production slots for this building
  for (let slot = 0; slot < 3; slot++) {
    const key = `${tile.x}_${tile.y}_${slot}`;
    if (!GameState.productionQueues[key]) {
      GameState.productionQueues[key] = {
        recipeType: null,
        isProducing: false,
        startedAt: null,
        productionMinutes: null,
        completed: false
      };
      GameState.saveProduction(tile.x, tile.y, slot, GameState.productionQueues[key]);
    }
  }
  
  // Save to database
  GameState.saveGridTile(tile);
  
  // Show notification
  showNotification(t('placeBuilding'), `${t('constructionComplete')} +${buildingData.xpOnComplete} XP`);
}

// Show building placement menu
function showBuildingPlacementMenu(buildingType = null) {
  const modal = document.getElementById('buildingPlacementModal');
  const infoDiv = document.getElementById('buildingPlacementInfo');
  
  // If no building type specified, find first available in inventory
  if (!buildingType) {
    const buildingTypes = Object.keys(GameData.buildings);
    
    for (const type of buildingTypes) {
      const kitId = `${type}Kit`;
      const count = GameState.getInventoryCount(kitId);
      
      if (count > 0) {
        buildingType = type;
        break;
      }
    }
  }
  
  // Check if specified building kit exists in inventory
  if (!buildingType) {
    showNotification(t('placeBuilding'), t('noBuildings'));
    return;
  }
  
  const kitId = `${buildingType}Kit`;
  const count = GameState.getInventoryCount(kitId);
  
  if (count <= 0) {
    showNotification(t('placeBuilding'), t('noBuildings'));
    return;
  }
  
  const buildingData = GameData.buildings[buildingType];
  if (!buildingData) {
    showNotification(t('placeBuilding'), t('noBuildings'));
    return;
  }
  
  document.getElementById('buildingSizeInfo').textContent = 
    `${t(buildingType)} - ${t('size')}: ${buildingData.width}x${buildingData.height}`;
  
  GameState.placementMode = 'building';
  GameState.placementItem = buildingType;
  GameState.placementPreviewTile = null;
  
  // Close the modal immediately so grid is clickable
  // modal.classList.remove('hidden');
  
  // Show a notification instead
  showNotification(t('placeBuilding'), `${t('clickToPlace')} - ${t(buildingType)} (${buildingData.width}x${buildingData.height})`);
  
  // Cancel button
  document.getElementById('btnCancelPlacement').onclick = () => {
    GameState.placementMode = null;
    GameState.placementItem = null;
    GameState.placementPreviewTile = null;
    closeModal('buildingPlacementModal');
  };
}

// Show building interaction modal (for production)
function showBuildingModal(tile) {
  if (tile.type !== 'building' || tile.isConstructing) {
    return;
  }
  
  // Find origin tile if this isn't it
  let originTile = tile;
  if (!tile.isOriginTile) {
    originTile = GameState.getTile(tile.originX, tile.originY);
  }
  
  if (!originTile) return;
  
  const buildingData = GameData.buildings[originTile.buildingType];
  if (!buildingData) return;
  
  // Set modal title
  document.getElementById('buildingModalTitle').textContent = t(originTile.buildingType);
  
  // Render production slots
  const slotsContainer = document.getElementById('buildingSlots');
  slotsContainer.innerHTML = '';
  
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
  
  for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
    const key = `${originTile.x}_${originTile.y}_${slotIndex}`;
    const production = GameState.productionQueues[key] || {
      recipeType: null,
      isProducing: false,
      startedAt: null,
      productionMinutes: null,
      completed: false
    };
    
    const slotDiv = document.createElement('div');
    slotDiv.className = 'production-slot';
    if (production.isProducing) {
      slotDiv.classList.add('active');
    }
    
    let slotContent = `
      <div class="slot-info">
        <div class="slot-number">${t('slot')} ${slotIndex + 1}</div>
    `;
    
    if (production.recipeType) {
      const recipeData = GameData.recipes[production.recipeType];
      const recipeIcon = getTileIcon(production.recipeType);
      slotContent += `<div class="slot-recipe">${recipeIcon} ${t(production.recipeType)}</div>`;
      
      if (production.completed) {
        slotContent += `<div class="slot-timer">${t('productionComplete')}</div>`;
      } else if (production.isProducing && production.startedAt) {
        const now = new Date();
        const elapsed = (now - production.startedAt.toDate()) / 1000 / 60;
        const remaining = Math.max(0, Math.ceil(production.productionMinutes - elapsed));
        slotContent += `<div class="slot-timer">${t('timeLeft')}: ${formatTime(remaining)}</div>`;
      }
    } else {
      slotContent += `<div class="slot-recipe">${t('empty')}</div>`;
      slotContent += `<div class="slot-timer">${t('selectARecipe')}</div>`;
    }
    
    slotContent += `</div><div class="slot-actions">`;
    
    if (production.completed) {
      slotContent += `<button class="btn-primary" data-action="collect" data-slot="${slotIndex}">${t('collect')}</button>`;
    } else if (!production.isProducing) {
      slotContent += `<button class="btn-secondary" data-action="start" data-slot="${slotIndex}">${t('start')}</button>`;
    }
    
    slotContent += `</div>`;
    slotDiv.innerHTML = slotContent;
    
    slotsContainer.appendChild(slotDiv);
  }
  
  // Add event listeners to buttons
  slotsContainer.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.dataset.action;
      const slot = parseInt(e.target.dataset.slot);
      
      if (action === 'collect') {
        collectProduction(originTile, slot);
      } else if (action === 'start') {
        showRecipeSelectionModal(originTile, slot);
      }
    });
  });
  
  document.getElementById('buildingModal').classList.remove('hidden');
}

// ============================================================================
// BUILDING PRODUCTION SYSTEM WITH 3 SLOTS
// ============================================================================

// Show recipe selection modal
function showRecipeSelectionModal(buildingTile, slotIndex) {
  const modal = document.getElementById('recipeModal');
  const recipeList = document.getElementById('recipeList');
  recipeList.innerHTML = '';
  
  // Get available recipes for this building type
  const recipes = GameData.getRecipesForBuilding(buildingTile.buildingType);
  
  recipes.forEach(recipe => {
    const isUnlocked = GameData.isUnlocked('recipe', recipe.id, GameState.level);
    
    const recipeDiv = document.createElement('div');
    recipeDiv.className = 'recipe-option';
    if (!isUnlocked) {
      recipeDiv.classList.add('locked');
    }
    
    // Build ingredients text
    let ingredientsText = '';
    if (recipe.ingredients) {
      ingredientsText = Object.entries(recipe.ingredients)
        .map(([item, qty]) => `${qty}x ${t(item)}`)
        .join(', ');
    }
    
    // Build output text
    let outputText = '';
    if (recipe.produces) {
      // Special case for chickenAndEggs
      outputText = Object.entries(recipe.produces)
        .map(([item, qty]) => `${qty}x ${t(item)}`)
        .join(', ');
    } else {
      outputText = `${recipe.producesQuantity}x ${t(recipe.id)}`;
    }
    
    const timeText = formatTime(recipe.productionMinutes);
    
    recipeDiv.innerHTML = `
      <div class="recipe-info">
        <div class="recipe-name">${getTileIcon(recipe.id)} ${t(recipe.id)}</div>
        <div class="recipe-ingredients">${t('ingredients')}: ${ingredientsText}</div>
        <div class="recipe-output">${t('produces')}: ${outputText}</div>
      </div>
      <div class="recipe-time">${timeText}</div>
    `;
    
    if (!isUnlocked) {
      const unlockBadge = document.createElement('span');
      unlockBadge.className = 'unlock-badge';
      unlockBadge.textContent = `${t('unlockAtLevel')} ${recipe.unlockLevel}`;
      recipeDiv.querySelector('.recipe-name').appendChild(unlockBadge);
    }
    
    if (isUnlocked) {
      recipeDiv.addEventListener('click', () => {
        startProduction(buildingTile, slotIndex, recipe.id);
        closeModal('recipeModal');
        closeModal('buildingModal');
      });
    }
    
    recipeList.appendChild(recipeDiv);
  });
  
  modal.classList.remove('hidden');
}

// Start production in a slot
function startProduction(buildingTile, slotIndex, recipeType) {
  const recipe = GameData.recipes[recipeType];
  if (!recipe) return false;
  
  // Check if have ingredients
  const ingredients = recipe.ingredients || {};
  for (const [item, quantity] of Object.entries(ingredients)) {
    if (!GameState.hasInInventory(item, quantity)) {
      showNotification(t('start'), t('notEnoughIngredients'));
      return false;
    }
  }
  
  // Remove ingredients from inventory
  for (const [item, quantity] of Object.entries(ingredients)) {
    GameState.removeFromInventory(item, quantity);
  }
  
  // Start production
  const key = `${buildingTile.x}_${buildingTile.y}_${slotIndex}`;
  GameState.productionQueues[key] = {
    recipeType: recipeType,
    isProducing: true,
    startedAt: firebase.firestore.Timestamp.now(),
    productionMinutes: recipe.productionMinutes,
    completed: false
  };
  
  // Save to database
  GameState.saveProduction(buildingTile.x, buildingTile.y, slotIndex, GameState.productionQueues[key]);
  
  showNotification(t('start'), t('productionStarted'));
  return true;
}

// Collect completed production
function collectProduction(buildingTile, slotIndex) {
  const key = `${buildingTile.x}_${buildingTile.y}_${slotIndex}`;
  const production = GameState.productionQueues[key];
  
  if (!production || !production.completed) {
    return false;
  }
  
  const recipe = GameData.recipes[production.recipeType];
  if (!recipe) return false;
  
  // Add products to inventory and track missions
  if (recipe.produces) {
    // Special case: chickenAndEggs produces multiple items
    for (const [item, quantity] of Object.entries(recipe.produces)) {
      GameState.addToInventory(item, quantity);
      // Track mission progress for each product
      GameState.incrementMissionProgress('production', item, quantity);
    }
  } else {
    GameState.addToInventory(production.recipeType, recipe.producesQuantity);
    // Track mission progress for production
    GameState.incrementMissionProgress('production', production.recipeType, recipe.producesQuantity);
  }
  
  // Add XP
  GameState.addXP(recipe.xpOnCollect);
  
  // Clear production slot
  production.recipeType = null;
  production.isProducing = false;
  production.startedAt = null;
  production.productionMinutes = null;
  production.completed = false;
  
  // Save to database
  GameState.saveProduction(buildingTile.x, buildingTile.y, slotIndex, production);
  
  // Refresh building modal
  showBuildingModal(buildingTile);
  
  showNotification(t('collect'), `${t('collected')} +${recipe.xpOnCollect} XP`);
  return true;
}

// Collect all completed production from all 3 slots
function collectAllProduction(buildingTile) {
  let collectedItems = {}; // Track collected items: { flour: 4, chicken: 2, egg: 10 }
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
    
    // Add products to inventory and track for summary
    if (recipe.produces) {
      // Special case: chickenAndEggs produces multiple items
      for (const [item, quantity] of Object.entries(recipe.produces)) {
        GameState.addToInventory(item, quantity);
        GameState.incrementMissionProgress('production', item, quantity);
        
        // Track for summary
        if (!collectedItems[item]) {
          collectedItems[item] = 0;
        }
        collectedItems[item] += quantity;
      }
    } else {
      GameState.addToInventory(production.recipeType, recipe.producesQuantity);
      GameState.incrementMissionProgress('production', production.recipeType, recipe.producesQuantity);
      
      // Track for summary
      if (!collectedItems[production.recipeType]) {
        collectedItems[production.recipeType] = 0;
      }
      collectedItems[production.recipeType] += recipe.producesQuantity;
    }
    
    // Add XP
    GameState.addXP(recipe.xpOnCollect);
    totalXP += recipe.xpOnCollect;
    
    // Clear production slot
    production.recipeType = null;
    production.isProducing = false;
    production.startedAt = null;
    production.productionMinutes = null;
    production.completed = false;
    
    // Save to database
    GameState.saveProduction(buildingTile.x, buildingTile.y, slotIndex, production);
  }
  
  if (!anyCollected) {
    return false;
  }
  
  // Build summary message
  let summaryText = `${t('collectedAll')}:\n\n`;
  Object.keys(collectedItems).forEach(itemId => {
    const icon = getTileIcon(itemId);
    const quantity = collectedItems[itemId];
    summaryText += `${icon} +${quantity} ${t(itemId)}\n`;
  });
  summaryText += `\n${t('totalXP')}: +${totalXP} XP`;
  
  // Refresh building modal
  showBuildingModal(buildingTile);
  
  // Show summary notification
  showNotification(t('collectAll'), summaryText);
  
  return true;
}

// ============================================================================
// INVENTORY SYSTEM WITH UI
// ============================================================================

// Show inventory modal
function showInventoryModal() {
  const modal = document.getElementById('inventoryModal');
  
  // Reset all tabs to inactive
  const tabs = modal.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  
  // Set first tab (seeds) as active
  const firstTab = modal.querySelector('.tab-btn[data-tab="seeds"]');
  if (firstTab) {
    firstTab.classList.add('active');
  }
  
  // Set up tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderInventoryTab(tab.dataset.tab);
    });
  });
  
  // Show seeds tab by default
  renderInventoryTab('seeds');
  
  modal.classList.remove('hidden');
}

// Render inventory tab content
function renderInventoryTab(tabName) {
  const container = document.getElementById('inventoryGrid');
  container.innerHTML = '';
  
  let items = [];
  
  switch (tabName) {
    case 'seeds':
      items = getInventoryItemsByCategory(['wheatSeed', 'tomatoSeed', 'potatoSeed', 'leekSeed', 'cornSeed', 'carrotSeed', 'onionSeed']);
      break;
      
    case 'crops':
      items = getInventoryItemsByCategory(['wheat', 'tomato', 'potato', 'leek', 'corn', 'carrot', 'onion', 'apple', 'lemon', 'orange']);
      break;
      
    case 'products':
      items = getInventoryItemsByCategory([
        'flour', 'porridge', 'animalFeed', 'pig', 'chicken', 'egg', 'bread', 'cake', 
        'potatoScone', 'sausage', 'steak', 'cow', 'salad', 'soup', 'lemonade', 'stew',
        'popcorn', 'onionRings', 'orangeJuice'
      ]);
      break;
      
    case 'buildings':
      items = getInventoryItemsByCategory([
        'millKit', 'bakeryKit', 'butcherKit', 'restaurantKit', 'cinemaKit'
      ]);
      break;
      
    case 'farms':
      items = getInventoryItemsByCategory([
        'pigFarmKit', 'chickenFarmKit', 'cowFarmKit'
      ]);
      break;
      
    case 'trees':
      items = getInventoryItemsByCategory([
        'appleTree', 'lemonTree', 'orangeTree'
      ]);
      break;
  }
  
  if (items.length === 0) {
    container.innerHTML = `<div class="inventory-empty">${t('emptyInventory')}</div>`;
    return;
  }
  
  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'inventory-item';
    itemDiv.innerHTML = `
      <div class="inventory-item-icon">${getTileIcon(item.id)}</div>
      <div class="inventory-item-name">${t(item.id)}</div>
      <div class="inventory-item-quantity">x${item.quantity}</div>
    `;
    
    // Add click handler for trees and building kits
    if (item.id.includes('Tree')) {
      itemDiv.addEventListener('click', () => {
        const treeType = item.id.replace('Tree', '');
        GameState.placementMode = 'tree';
        GameState.placementItem = treeType;
        closeModal('inventoryModal');
        showNotification(t('placeTree'), t('clickToPlace'));
      });
    } else if (item.id.includes('Kit')) {
      itemDiv.addEventListener('click', () => {
        const buildingType = item.id.replace('Kit', '');
        closeModal('inventoryModal');
        showBuildingPlacementMenu(buildingType);
      });
    }
    
    container.appendChild(itemDiv);
  });
}

// Get inventory items by category
function getInventoryItemsByCategory(itemIds) {
  const items = [];
  itemIds.forEach(id => {
    const quantity = GameState.getInventoryCount(id);
    if (quantity > 0) {
      items.push({ id, quantity });
    }
  });
  return items;
}

// ============================================================================
// MARKETPLACE SYSTEM WITH 5 MENUS
// ============================================================================

// Show marketplace modal
function showMarketplaceModal() {
  const modal = document.getElementById('marketplaceModal');
  
  // Reset all tabs to inactive
  const tabs = modal.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  
  // Set first tab (sell) as active
  const firstTab = modal.querySelector('.tab-btn[data-tab="sell"]');
  if (firstTab) {
    firstTab.classList.add('active');
  }
  
  // Set up tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMarketplaceTab(tab.dataset.tab);
    });
  });
  
  // Show sell tab by default
  renderMarketplaceTab('sell');
  
  modal.classList.remove('hidden');
}

// Render marketplace tab content
function renderMarketplaceTab(tabName) {
  const container = document.getElementById('marketplaceContent');
  container.innerHTML = '';
  
  switch (tabName) {
    case 'sell':
      renderSellTab(container);
      break;
    case 'buySeeds':
      renderBuySeedsTab(container);
      break;
    case 'buyBuildings':
      renderBuyBuildingsTab(container);
      break;
    case 'buyFarms':
      renderBuyFarmsTab(container);
      break;
    case 'buyDecorations':
      renderBuyDecorationsTab(container);
      break;
    case 'buyLand':
      renderBuyLandTab(container);
      break;
  }
}

// Render SELL tab
function renderSellTab(container) {
  // Get all sellable items (crops, fruits, products, animals)
  const sellableCategories = [
    'wheat', 'tomato', 'potato', 'leek', 'corn', 'carrot', 'onion',
    'apple', 'lemon', 'orange',
    'flour', 'porridge', 'animalFeed', 'pig', 'chicken', 'egg', 'bread', 'cake',
    'potatoScone', 'sausage', 'steak', 'cow', 'salad', 'soup', 'lemonade', 'stew',
    'popcorn', 'onionRings', 'orangeJuice'
  ];
  
  let hasItems = false;
  
  sellableCategories.forEach(itemId => {
    const quantity = GameState.getInventoryCount(itemId);
    if (quantity > 0) {
      hasItems = true;
      
      // Get sell price and XP
      let sellPrice = 0;
      let xpOnSell = 0;
      
      if (GameData.crops[itemId]) {
        sellPrice = GameData.crops[itemId].sellPrice;
        xpOnSell = GameData.crops[itemId].xpOnSell;
      } else if (GameData.fruitTrees[itemId]) {
        sellPrice = GameData.fruitTrees[itemId].sellPrice;
        xpOnSell = GameData.fruitTrees[itemId].xpOnSell;
      } else if (GameData.recipes[itemId]) {
        const recipe = GameData.recipes[itemId];
        if (recipe.sellPrices && recipe.sellPrices[itemId]) {
          sellPrice = recipe.sellPrices[itemId];
          xpOnSell = recipe.xpOnSell[itemId] || 0;
        } else {
          sellPrice = recipe.sellPrice || 0;
          xpOnSell = recipe.xpOnSell || 0;
        }
      }
      
      const itemDiv = document.createElement('div');
      itemDiv.className = 'marketplace-item';
      itemDiv.innerHTML = `
        <div class="item-info">
          <div class="item-icon">${getTileIcon(itemId)}</div>
          <div class="item-details">
            <h3>${t(itemId)}</h3>
            <p>${t('owned')}: ${quantity}</p>
          </div>
        </div>
        <div class="item-price">🪙${sellPrice} (+${xpOnSell}XP)</div>
        <div class="item-actions">
          <div class="quantity-selector">
            <button class="qty-btn qty-minus" data-input="sell-${itemId}-qty">-</button>
            <input type="number" min="1" max="${quantity}" value="1" id="sell-${itemId}-qty">
            <button class="qty-btn qty-plus" data-input="sell-${itemId}-qty" data-max="${quantity}">+</button>
          </div>
          <button class="btn-primary" data-action="sell" data-item="${itemId}">${t('sell')}</button>
        </div>
      `;
      
      container.appendChild(itemDiv);
    }
  });
  
  if (!hasItems) {
    container.innerHTML = `<p style="text-align:center;padding:40px;color:#999;">${t('noItemsToSell')}</p>`;
    return;
  }
  
  // Add +/- button handlers
  container.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const inputId = e.target.dataset.input;
      const input = document.getElementById(inputId);
      const min = parseInt(input.min) || 1;
      let value = parseInt(input.value) || min;
      if (value > min) {
        input.value = value - 1;
      }
    });
  });
  
  container.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const inputId = e.target.dataset.input;
      const input = document.getElementById(inputId);
      const max = parseInt(e.target.dataset.max) || 99;
      let value = parseInt(input.value) || 1;
      if (value < max) {
        input.value = value + 1;
      }
    });
  });
  
  // Add sell button handlers
  container.querySelectorAll('[data-action="sell"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.target.dataset.item;
      const qtyInput = document.getElementById(`sell-${itemId}-qty`);
      const quantity = parseInt(qtyInput.value) || 1;
      sellItem(itemId, quantity);
    });
  });
}

// Sell item function
function sellItem(itemId, quantity) {
  if (!GameState.hasInInventory(itemId, quantity)) {
    showNotification(t('sell'), t('notEnoughItems') || 'Not enough items!');
    return false;
  }
  
  // Get sell price and XP
  let sellPrice = 0;
  let xpOnSell = 0;
  
  if (GameData.crops[itemId]) {
    sellPrice = GameData.crops[itemId].sellPrice;
    xpOnSell = GameData.crops[itemId].xpOnSell;
  } else if (GameData.fruitTrees[itemId]) {
    sellPrice = GameData.fruitTrees[itemId].sellPrice;
    xpOnSell = GameData.fruitTrees[itemId].xpOnSell;
  } else if (GameData.recipes[itemId]) {
    const recipe = GameData.recipes[itemId];
    if (recipe.sellPrices && recipe.sellPrices[itemId]) {
      sellPrice = recipe.sellPrices[itemId];
      xpOnSell = recipe.xpOnSell[itemId] || 0;
    } else {
      sellPrice = recipe.sellPrice || 0;
      xpOnSell = recipe.xpOnSell || 0;
    }
  }
  
  const totalCoins = sellPrice * quantity;
  const totalXP = xpOnSell * quantity;
  
  // Remove from inventory
  GameState.removeFromInventory(itemId, quantity);
  
  // Add coins and XP
  GameState.addCoins(totalCoins);
  GameState.addXP(totalXP);
  
  // Refresh sell tab
  renderMarketplaceTab('sell');
  
  showNotification(t('sell'), `${t('itemSold')} +${totalCoins}🪙 +${totalXP}XP`);
  return true;
}

// Render BUY SEEDS tab
function renderBuySeedsTab(container) {
  const crops = Object.values(GameData.crops)
    .sort((a, b) => a.unlockLevel - b.unlockLevel); // Sort by unlock level
  
  crops.forEach(crop => {
    const isUnlocked = GameData.isUnlocked('crop', crop.id, GameState.level);
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'marketplace-item';
    if (!isUnlocked) {
      itemDiv.classList.add('locked');
    }
    
    itemDiv.innerHTML = `
      <div class="item-info">
        <div class="item-icon">${getTileIcon(crop.id)}</div>
        <div class="item-details">
          <h3>${t(crop.id + 'Seed')}${!isUnlocked ? ` <span class="unlock-badge">${t('unlockAtLevel')} ${crop.unlockLevel}</span>` : ''}</h3>
          <p>${t(crop.id + 'Desc') || ''}</p>
        </div>
      </div>
      <div class="item-price">🪙${crop.seedCost}</div>
      <div class="item-actions">
        ${isUnlocked ? `
          <div class="quantity-selector">
            <button class="qty-btn qty-minus" data-input="buy-${crop.id}Seed-qty">-</button>
            <input type="number" min="1" max="99" value="10" id="buy-${crop.id}Seed-qty">
            <button class="qty-btn qty-plus" data-input="buy-${crop.id}Seed-qty" data-max="99">+</button>
          </div>
          <button class="btn-primary" data-action="buy-seed" data-crop="${crop.id}">${t('buy')}</button>
        ` : ''}
      </div>
    `;
    
    container.appendChild(itemDiv);
  });
  
  // Add +/- button handlers
  container.querySelectorAll('.qty-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const inputId = e.target.dataset.input;
      const input = document.getElementById(inputId);
      const min = parseInt(input.min) || 1;
      let value = parseInt(input.value) || min;
      if (value > min) {
        input.value = value - 1;
      }
    });
  });
  
  container.querySelectorAll('.qty-plus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const inputId = e.target.dataset.input;
      const input = document.getElementById(inputId);
      const max = parseInt(e.target.dataset.max) || 99;
      let value = parseInt(input.value) || 1;
      if (value < max) {
        input.value = value + 1;
      }
    });
  });
  
  // Add buy button handlers
  container.querySelectorAll('[data-action="buy-seed"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cropId = e.target.dataset.crop;
      const qtyInput = document.getElementById(`buy-${cropId}Seed-qty`);
      const quantity = parseInt(qtyInput.value) || 1;
      buySeeds(cropId, quantity);
    });
  });
}

// Buy seeds function
function buySeeds(cropId, quantity) {
  const crop = GameData.crops[cropId];
  if (!crop) return false;
  
  const totalCost = crop.seedCost * quantity;
  
  if (!GameState.spendCoins(totalCost)) {
    showNotification(t('buySeeds'), t('notEnoughCoins'));
    return false;
  }
  
  // Add seeds to inventory
  GameState.addToInventory(cropId + 'Seed', quantity);
  
  showNotification(t('buySeeds'), `${t('itemPurchased')} ${quantity}x ${t(cropId + 'Seed')}`);
  return true;
}

// Render BUY BUILDINGS tab
// Helper function to count total buildings (kits + constructing + built)
function getTotalBuildingCount(buildingId) {
  // Count kits in inventory
  const kitsInInventory = GameState.getInventoryCount(buildingId + 'Kit');
  
  // Count buildings under construction or already built
  let buildingsOnGrid = 0;
  GameState.grid.forEach(row => {
    row.forEach(tile => {
      if (tile && tile.type === 'building' && tile.buildingType === buildingId && tile.isOriginTile) {
        buildingsOnGrid++;
      }
    });
  });
  
  return kitsInInventory + buildingsOnGrid;
}

function renderBuyBuildingsTab(container) {
  const buildings = Object.values(GameData.buildings)
    .filter(b => !['pigFarm', 'chickenFarm', 'cowFarm'].includes(b.id)) // Exclude farms
    .sort((a, b) => a.unlockLevel - b.unlockLevel); // Sort by unlock level
  
  buildings.forEach(building => {
    const isUnlocked = GameData.isUnlocked('building', building.id, GameState.level);
    
    // Count total: kits in inventory + buildings on grid (constructing or built)
    const owned = getTotalBuildingCount(building.id);
    
    // For pricing, we need to know how many we've PURCHASED (not just completed)
    // Price doubles if we already own 1 (whether it's a kit, constructing, or built)
    const price = owned === 0 ? building.kitPrice : building.kitPrice * 2;
    
    const canBuyMore = owned < building.maxOwned;
    const secondUnlockLevel = building.unlockLevel + 2;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'marketplace-item';
    if (!isUnlocked || !canBuyMore) {
      itemDiv.classList.add('locked');
    }
    
    let statusText = '';
    if (!isUnlocked) {
      statusText = `<span class="unlock-badge">${t('unlockAtLevel')} ${building.unlockLevel}</span>`;
    } else if (owned >= building.maxOwned) {
      statusText = `<span class="unlock-badge">${t('maxOwned')}</span>`;
    } else if (owned === 1) {
      statusText = `<span class="unlock-badge">${t('canBuySecondAt')} ${secondUnlockLevel}</span>`;
    }
    
    itemDiv.innerHTML = `
      <div class="item-info">
        <div class="item-icon">${getTileIcon(building.id)}</div>
        <div class="item-details">
          <h3>${t(building.id + 'Kit')} ${statusText}</h3>
          <p>${t('size')}: ${building.width}x${building.height} | ${t('owned')}: ${owned}/${building.maxOwned}</p>
        </div>
      </div>
      <div class="item-price">🪙${price}</div>
      <div class="item-actions">
        ${isUnlocked && canBuyMore ? `
          <button class="btn-primary" data-action="buy-building" data-building="${building.id}">${t('buy')}</button>
        ` : ''}
      </div>
    `;
    
    container.appendChild(itemDiv);
  });
  
  // Add buy button handlers
  container.querySelectorAll('[data-action="buy-building"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const buildingId = e.target.dataset.building;
      buyBuildingKit(buildingId);
    });
  });
}

// New function for buying farms
function renderBuyFarmsTab(container) {
  const farms = Object.values(GameData.buildings)
    .filter(b => ['pigFarm', 'chickenFarm', 'cowFarm'].includes(b.id)) // Only farms
    .sort((a, b) => a.unlockLevel - b.unlockLevel); // Sort by unlock level
  
  farms.forEach(building => {
    const isUnlocked = GameData.isUnlocked('building', building.id, GameState.level);
    
    // Count total: kits in inventory + buildings on grid (constructing or built)
    const owned = getTotalBuildingCount(building.id);
    
    // For pricing, we need to know how many we've PURCHASED (not just completed)
    // Price doubles if we already own 1 (whether it's a kit, constructing, or built)
    const price = owned === 0 ? building.kitPrice : building.kitPrice * 2;
    
    const canBuyMore = owned < building.maxOwned;
    const secondUnlockLevel = building.unlockLevel + 2;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'marketplace-item';
    if (!isUnlocked || !canBuyMore) {
      itemDiv.classList.add('locked');
    }
    
    let statusText = '';
    if (!isUnlocked) {
      statusText = `<span class="unlock-badge">${t('unlockAtLevel')} ${building.unlockLevel}</span>`;
    } else if (owned >= building.maxOwned) {
      statusText = `<span class="unlock-badge">${t('maxOwned')}</span>`;
    } else if (owned === 1) {
      statusText = `<span class="unlock-badge">${t('canBuySecondAt')} ${secondUnlockLevel}</span>`;
    }
    
    itemDiv.innerHTML = `
      <div class="item-info">
        <div class="item-icon">${getTileIcon(building.id)}</div>
        <div class="item-details">
          <h3>${t(building.id + 'Kit')} ${statusText}</h3>
          <p>${t('size')}: ${building.width}x${building.height} | ${t('owned')}: ${owned}/${building.maxOwned}</p>
        </div>
      </div>
      <div class="item-price">🪙${price}</div>
      <div class="item-actions">
        ${isUnlocked && canBuyMore ? `
          <button class="btn-primary" data-action="buy-farm" data-building="${building.id}">${t('buy')}</button>
        ` : ''}
      </div>
    `;
    
    container.appendChild(itemDiv);
  });
  
  // Add buy button handlers
  container.querySelectorAll('[data-action="buy-farm"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const buildingId = e.target.dataset.building;
      buyBuildingKit(buildingId);
    });
  });
}

// Buy building kit function
function buyBuildingKit(buildingId) {
  const building = GameData.buildings[buildingId];
  if (!building) return false;
  
  // Count total: kits in inventory + buildings on grid (constructing or built)
  const owned = getTotalBuildingCount(buildingId);
  
  // Check if already at max owned
  if (owned >= building.maxOwned) {
    showNotification(t('buyBuildings'), t('maxOwned') || 'Maximum owned reached');
    return false;
  }
  
  // Check level requirement for second purchase
  if (owned === 1 && GameState.level < building.unlockLevel + 2) {
    showNotification(t('buyBuildings'), `${t('canBuySecondAt')} ${building.unlockLevel + 2}`);
    return false;
  }
  
  // For pricing, we need to know how many we've PURCHASED (not just completed)
  // Price doubles if we already own 1 (whether it's a kit, constructing, or built)
  const price = owned === 0 ? building.kitPrice : building.kitPrice * 2;
  
  // Check if trying to buy without seeds/crops (safety check)
  if (!validatePurchase(price)) {
    return false;
  }
  
  if (!GameState.spendCoins(price)) {
    showNotification(t('buyBuildings'), t('notEnoughCoins'));
    return false;
  }
  
  // Add kit to inventory
  GameState.addToInventory(buildingId + 'Kit', 1);
  
  showNotification(t('buyBuildings'), `${t('itemPurchased')} ${t(buildingId + 'Kit')}`);
  
  // Refresh the marketplace to update owned counts and restrictions
  const activeTab = document.querySelector('.marketplace-tabs .tab-btn.active');
  if (activeTab) {
    const tabName = activeTab.dataset.tab;
    const container = document.getElementById('marketplaceContent');
    renderMarketplaceTab(tabName, container);
  }
  
  return true;
}

// Render BUY DECORATIONS tab
function renderBuyDecorationsTab(container) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'marketplace-item';
  itemDiv.innerHTML = `
    <div class="item-info">
      <div class="item-icon">🛤️</div>
      <div class="item-details">
        <h3>${t('road')}</h3>
        <p>${t('decorativeRoad') || 'Decorative road tile'}</p>
      </div>
    </div>
    <div class="item-price">🪙${GameData.costs.roadDecoration}</div>
    <div class="item-actions">
      <button class="btn-primary" data-action="buy-road">${t('buy')}</button>
    </div>
  `;
  
  container.appendChild(itemDiv);
  
  // Add buy button handler
  container.querySelector('[data-action="buy-road"]').addEventListener('click', () => {
    buyRoad();
  });
}

// Buy road function
function buyRoad() {
  const cost = GameData.costs.roadDecoration;
  
  // Check safety validation
  if (!validatePurchase(cost)) {
    return false;
  }
  
  if (!GameState.spendCoins(cost)) {
    showNotification(t('buyDecorations'), t('notEnoughCoins'));
    return false;
  }
  
  // Enable road placement mode
  GameState.placementMode = 'road';
  closeModal('marketplaceModal');
  showNotification(t('buyDecorations'), t('selectTileForRoad') || 'Click on a grass tile to place road');
  return true;
}

// Render BUY LAND tab
function renderBuyLandTab(container) {
  const currentSize = Math.max(GameState.gridWidth, GameState.gridHeight);
  const currentTiles = GameState.gridWidth * GameState.gridHeight;
  const price = GameData.gridExpansion.getPriceForNextExpansion(currentSize);
  const maxReached = currentSize >= GameData.gridExpansion.maxSize;
  
  const newSize = currentSize + 1;
  const tilesAdded = (newSize * 2 - 1); // New row + new column
  
  const itemDiv = document.createElement('div');
  itemDiv.className = 'marketplace-item';
  if (maxReached) {
    itemDiv.classList.add('locked');
  }
  
  itemDiv.innerHTML = `
    <div class="item-info">
      <div class="item-icon">🌍</div>
      <div class="item-details">
        <h3>${t('expandGrid')}</h3>
        <p>${t('currentGrid')}: ${GameState.gridWidth}x${GameState.gridHeight} (${currentTiles} tiles)</p>
        <p style="font-size:12px;color:#4CAF50;font-weight:bold;">Adds +1 row & +1 column (${tilesAdded} tiles)</p>
        <p style="font-size:11px;color:#888;margin-top:4px;">Next: ${newSize}x${newSize} grid</p>
      </div>
    </div>
    <div class="item-price">🪙${price}</div>
    <div class="item-actions">
      ${!maxReached ? `
        <button class="btn-primary" data-action="buy-land">${t('buy')}</button>
      ` : `<span style="color:#999;">${t('maxGridReached')}</span>`}
    </div>
  `;
  
  container.appendChild(itemDiv);
  
  if (!maxReached) {
    container.querySelector('[data-action="buy-land"]').addEventListener('click', () => {
      expandGrid();
    });
  }
}

// ============================================================================
// LEVEL UP MODAL AND REWARDS SYSTEM (Task #14)
// ============================================================================

// Show level up modal with rewards
function showLevelUpModal(newLevel) {
  const modal = document.getElementById('levelUpModal');
  document.getElementById('newLevelDisplay').textContent = newLevel;
  
  // Get rewards for this level
  const levelData = GameData.levels[newLevel];
  const rewardsDiv = document.getElementById('levelUpRewards');
  rewardsDiv.innerHTML = '';
  
  if (levelData && levelData.rewards && levelData.rewards.length > 0) {
    const rewardsTitle = document.createElement('h3');
    rewardsTitle.textContent = t('rewards') + ':';
    rewardsDiv.appendChild(rewardsTitle);
    
    levelData.rewards.forEach(reward => {
      const rewardItem = document.createElement('div');
      rewardItem.className = 'reward-item';
      if (reward.type === 'tree') {
        const treeName = t(`${reward.item}Tree`);
        rewardItem.textContent = `${reward.quantity}x ${treeName} ${getTileIcon(reward.item)}`;
      }
      rewardsDiv.appendChild(rewardItem);
    });
  } else {
    const unlocksDiv = document.createElement('p');
    unlocksDiv.textContent = t('newUnlocks');
    rewardsDiv.appendChild(unlocksDiv);
  }
  
  modal.classList.remove('hidden');
  
  document.getElementById('btnCloseLevelUp').onclick = () => {
    closeModal('levelUpModal');
  };
}

// ============================================================================
// TILE CLICK INTERACTION HANDLER (Task #16)
// ============================================================================

// Handle tile click based on tile type and current mode
function handleTileClick(tile) {
  // Handle continuous harvest mode for ready crops and trees
  if (GameState.harvestModeActive) {
    // Harvest ready crops
    if (tile.type === 'plot' && tile.cropType && tile.ready) {
      harvestCrop(tile);
      return;
    }
    // Collect ready fruit from trees
    if (tile.type === 'tree' && tile.fruitReady) {
      collectFruit(tile);
      return;
    }
    // Ignore clicks on non-ready or non-harvestable tiles in harvest mode
    return;
  }
  
  // Handle continuous planting mode
  if (GameState.plantingModeActive && tile.type === 'plot' && !tile.cropType) {
    // Plant seed directly in continuous mode (no popup)
    plantSeedContinuous(tile, GameState.plantingModeCropType);
    return;
  }
  
  // Handle placement modes
  if (GameState.placementMode === 'plot') {
    // Create plot on grass tile
    if (tile.type === 'grass') {
      const cost = GameData.costs.plotTile;
      
      // Check safety validation
      if (!validatePurchase(cost)) {
        GameState.placementMode = null;
        return;
      }
      
      if (GameState.spendCoins(cost)) {
        tile.type = 'plot';
        GameState.saveGridTile(tile);
        renderGrid();
        showNotification(t('createPlot'), t('plotCreated'));
      } else {
        showNotification(t('createPlot'), t('notEnoughCoins'));
      }
      GameState.placementMode = null;
    } else {
      showNotification(t('createPlot'), t('needGrassTile'));
    }
    return;
  }
  
  if (GameState.placementMode === 'tree') {
    // Place tree on grass tile
    if (tile.type === 'grass' && GameState.placementItem) {
      placeTree(tile, GameState.placementItem);
    } else {
      showNotification(t('placeTree'), t('needGrassTile'));
    }
    return;
  }
  
  if (GameState.placementMode === 'building') {
    // Place building on grass tiles - show confirmation dialog first
    if (tile.type === 'grass' && GameState.placementItem) {
      // Validate placement
      const buildingData = GameData.buildings[GameState.placementItem];
      if (!buildingData) return;
      
      // Check if all required tiles are available (grass)
      let canPlace = true;
      for (let dy = 0; dy < buildingData.height; dy++) {
        for (let dx = 0; dx < buildingData.width; dx++) {
          const checkTile = GameState.getTile(tile.x + dx, tile.y + dy);
          if (!checkTile || checkTile.type !== 'grass') {
            canPlace = false;
            break;
          }
        }
        if (!canPlace) break;
      }
      
      if (canPlace) {
        // Ask for confirmation
        const confirmMessage = `${t('placeBuilding')}: ${t(GameState.placementItem)}\n${t('size')}: ${buildingData.width}x${buildingData.height}\nPosition: (${tile.x}, ${tile.y})\n\n${t('confirm')}?`;
        
        if (confirm(confirmMessage)) {
          placeBuilding(tile, GameState.placementItem);
        }
      } else {
        showNotification(t('placeBuilding'), t('invalidPlacement'));
      }
    } else {
      showNotification(t('placeBuilding'), t('invalidPlacement'));
    }
    return;
  }
  
  if (GameState.placementMode === 'road') {
    // Place road on grass tile
    if (tile.type === 'grass') {
      tile.type = 'road';
      GameState.saveGridTile(tile);
      renderGrid();
      GameState.placementMode = null;
    } else {
      showNotification(t('buyDecorations'), t('needGrassTile'));
    }
    return;
  }
  
  // Normal tile interactions
  switch (tile.type) {
    case 'plot':
      if (tile.cropType && tile.ready) {
        // Harvest ready crop
        harvestCrop(tile);
      } else if (!tile.cropType) {
        // Show planting menu for empty plot
        showPlantingMenu(tile);
      }
      break;
      
    case 'tree':
      if (tile.fruitReady) {
        // Collect ripe fruit
        collectFruit(tile);
      }
      break;
      
    case 'building':
      if (!tile.isConstructing) {
        // Show building production modal
        showBuildingModal(tile);
      }
      break;
      
    case 'grass':
      // Show options: create plot, place tree, place building
      showGrassTileOptions(tile);
      break;
  }
}

// Show options for grass tile
function showGrassTileOptions(tile) {
  // For now, just show notification. Could expand to a menu later.
  showNotification(
    t('grass'),
    t('grassTileOptions') || 'Use buttons at top to create plot, or inventory to place trees/buildings'
  );
}

// ============================================================================
// COIN/SEED SAFETY VALIDATION (Task #18)
// ============================================================================

// Validate purchase to prevent 0 coins without seeds or growing crops
function validatePurchase(cost) {
  const coinsAfter = GameState.coins - cost;
  
  // Allow purchase if:
  // 1. Will have coins left after purchase, OR
  // 2. Have seeds in inventory, OR
  // 3. Have crops currently growing
  if (coinsAfter > 0 || GameState.hasAnySeeds()) {
    return true;
  }
  
  // Check if any crops are growing
  let hasGrowingCrops = false;
  GameState.grid.forEach(row => {
    row.forEach(tile => {
      if (tile.type === 'plot' && tile.cropType && !tile.ready) {
        hasGrowingCrops = true;
      }
    });
  });
  
  if (hasGrowingCrops) {
    return true;
  }
  
  // Would be at 0 coins with no seeds and no growing crops - warn and block
  showNotification(
    t('warning') || 'Warning',
    t('cannotAfford') + '\n\n' + t('mustBuySeeds')
  );
  return false;
}

// ============================================================================
// HELP MODAL SYSTEM (Task #23)
// ============================================================================

// Show help modal with bilingual content
function showHelpModal() {
  const modal = document.getElementById('helpModal');
  const container = document.getElementById('helpContent');
  container.innerHTML = '';
  
  // Create help sections
  const sections = [
    { key: 'helpBasics', contentKey: 'helpBasicsText' },
    { key: 'helpFarming', contentKey: 'helpFarmingText' },
    { key: 'helpTrees', contentKey: 'helpTreesText' },
    { key: 'helpBuildings', contentKey: 'helpBuildingsText' },
    { key: 'helpMarketplace', contentKey: 'helpMarketplaceText' },
    { key: 'helpLeveling', contentKey: 'helpLevelingText' },
    { key: 'helpTips', contentKey: 'helpTipsText' },
    { key: 'helpControls', contentKey: 'helpControlsText' }
  ];
  
  sections.forEach(section => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'help-section';
    
    const title = document.createElement('h3');
    title.textContent = t(section.key);
    sectionDiv.appendChild(title);
    
    const content = document.createElement('p');
    content.textContent = t(section.contentKey);
    content.style.whiteSpace = 'pre-line'; // Preserve line breaks
    sectionDiv.appendChild(content);
    
    container.appendChild(sectionDiv);
  });
  
  modal.classList.remove('hidden');
}

// ============================================================================
// VISIT A FRIEND SYSTEM
// ============================================================================

// Store original game state before visiting
let originalGameState = null;
let isVisitingFriend = false;

// Show Visit Friend modal and load player list
async function showVisitFriendModal() {
  const modal = document.getElementById('visitFriendModal');
  const selector = document.getElementById('friendSelector');
  const visitBtn = document.getElementById('btnVisit');
  const returnBtn = document.getElementById('btnReturnToMyFarm');
  const friendInfo = document.getElementById('friendFarmInfo');
  
  // Reset UI
  friendInfo.classList.add('hidden');
  returnBtn.classList.add('hidden');
  
  // Load all players from Firebase
  selector.innerHTML = `<option value="">${t('loadingPlayers')}</option>`;
  selector.disabled = true;
  
  try {
    const playersSnapshot = await db.collection('farmingTownPlayers').get();
    const players = [];
    
    playersSnapshot.forEach(doc => {
      const data = doc.data();
      // Exclude current player
      if (doc.id !== playerId) {
        players.push({
          id: doc.id,
          name: data.playerName,
          level: data.level,
          xp: data.xp,
          coins: data.coins
        });
      }
    });
    
    // Populate dropdown
    selector.innerHTML = '';
    if (players.length === 0) {
      selector.innerHTML = `<option value="">${t('noOtherPlayers')}</option>`;
      visitBtn.disabled = true;
    } else {
      selector.innerHTML = '<option value="">-- ' + t('selectPlayer') + ' --</option>';
      players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.id;
        option.textContent = `${player.name} (${t('level')} ${player.level})`;
        option.dataset.playerData = JSON.stringify(player);
        selector.appendChild(option);
      });
      visitBtn.disabled = false;
    }
    selector.disabled = false;
    
  } catch (error) {
    console.error('Error loading players:', error);
    selector.innerHTML = `<option value="">Error loading players</option>`;
  }
  
  // Set up visit button handler
  visitBtn.onclick = () => {
    const selectedPlayerId = selector.value;
    if (selectedPlayerId) {
      const selectedOption = selector.options[selector.selectedIndex];
      const playerData = JSON.parse(selectedOption.dataset.playerData);
      visitPlayerFarm(selectedPlayerId, playerData);
    }
  };
  
  // Set up return button handler
  returnBtn.onclick = () => {
    returnToMyFarm();
  };
  
  modal.classList.remove('hidden');
}

// Visit a friend's farm (read-only mode)
async function visitPlayerFarm(friendPlayerId, friendData) {
  try {
    // Save current game state
    if (!isVisitingFriend) {
      originalGameState = {
        playerName: GameState.playerName,
        coins: GameState.coins,
        xp: GameState.xp,
        level: GameState.level,
        gridWidth: GameState.gridWidth,
        gridHeight: GameState.gridHeight,
        grid: JSON.parse(JSON.stringify(GameState.grid)), // Deep copy
        inventory: {...GameState.inventory},
        productionQueues: {...GameState.productionQueues},
        buildingsOwned: {...GameState.buildingsOwned},
        gridExpansionCount: GameState.gridExpansionCount
      };
    }
    
    // CRITICAL: Stop auto-save to prevent overwriting player data with friend's data
    if (GameState.saveInterval) {
      clearInterval(GameState.saveInterval);
      GameState.saveInterval = null;
      console.log('Auto-save disabled during friend visit');
    }
    
    // Load friend's data
    showLoadingScreen(true);
    
    // Load friend's grid tiles
    const gridSnapshot = await db.collection('farmingTownGrids')
      .where('playerId', '==', friendPlayerId)
      .get();
    
    // Reconstruct friend's grid (use simple rectangular grid)
    GameState.grid = [];
    
    // First pass: find max dimensions
    let maxX = 0, maxY = 0;
    gridSnapshot.forEach(doc => {
      const data = doc.data();
      maxX = Math.max(maxX, data.x);
      maxY = Math.max(maxY, data.y);
    });
    
    // Initialize empty grid
    for (let y = 0; y <= maxY; y++) {
      GameState.grid[y] = [];
      for (let x = 0; x <= maxX; x++) {
        GameState.grid[y][x] = GameState.createTile(x, y, 'grass');
      }
    }
    
    // Second pass: populate with actual tiles
    gridSnapshot.forEach(doc => {
      const data = doc.data();
      const x = data.x;
      const y = data.y;
      
      // Update tile with saved data
      const tile = GameState.grid[y][x];
      tile.type = data.tileType;
      tile.cropType = data.cropType;
      tile.plantedAt = data.plantedAt;
      tile.growthMinutes = data.growthMinutes;
      tile.treeType = data.treeType;
      tile.lastCollectedAt = data.lastCollectedAt;
      tile.ripeMinutes = data.ripeMinutes;
      tile.buildingType = data.buildingType;
      tile.isConstructing = data.isConstructing;
      tile.constructionStartedAt = data.constructionStartedAt;
      tile.constructionMinutes = data.constructionMinutes;
      tile.isOriginTile = data.isOriginTile;
      tile.originX = data.originX;
      tile.originY = data.originY;
    });
    
    // Update game state with friend's data
    GameState.playerName = friendData.name;
    GameState.level = friendData.level;
    GameState.xp = friendData.xp;
    GameState.coins = friendData.coins;
    GameState.gridWidth = maxX + 1;
    GameState.gridHeight = maxY + 1;
    
    // Update display
    GameState.updateDisplay();
    renderGrid();
    updateAllTimers();
    
    // Enter viewing mode
    isVisitingFriend = true;
    document.body.classList.add('viewing-mode');
    
    // Show viewing banner
    let banner = document.querySelector('.viewing-mode-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.className = 'viewing-mode-banner';
      document.body.appendChild(banner);
    }
    banner.textContent = `${t('visiting')} ${friendData.name} - ${t('viewMode')}`;
    banner.style.display = 'block';
    
    // Hide action buttons except Return
    document.getElementById('btnInventory').style.display = 'none';
    document.getElementById('btnMarketplace').style.display = 'none';
    document.getElementById('btnCreatePlot').style.display = 'none';
    document.getElementById('btnVisitFriend').style.display = 'none';
    
    // Update modal UI
    document.getElementById('visitedPlayerName').textContent = friendData.name;
    document.getElementById('visitedLevel').textContent = friendData.level;
    document.getElementById('visitedXP').textContent = friendData.xp;
    document.getElementById('visitedCoins').textContent = friendData.coins;
    document.getElementById('friendFarmInfo').classList.remove('hidden');
    document.getElementById('btnReturnToMyFarm').classList.remove('hidden');
    document.getElementById('btnVisit').style.display = 'none';
    document.getElementById('friendSelector').disabled = true;
    
    showLoadingScreen(false);
    
  } catch (error) {
    console.error('Error loading friend farm:', error);
    showNotification('Error', 'Failed to load friend\'s farm');
    showLoadingScreen(false);
  }
}

// Return to own farm
function returnToMyFarm() {
  if (!isVisitingFriend || !originalGameState) return;
  
  // Restore original game state
  GameState.playerName = originalGameState.playerName;
  GameState.coins = originalGameState.coins;
  GameState.xp = originalGameState.xp;
  GameState.level = originalGameState.level;
  GameState.gridWidth = originalGameState.gridWidth;
  GameState.gridHeight = originalGameState.gridHeight;
  GameState.grid = JSON.parse(JSON.stringify(originalGameState.grid)); // Deep copy back
  GameState.inventory = {...originalGameState.inventory};
  GameState.productionQueues = {...originalGameState.productionQueues};
  GameState.buildingsOwned = {...originalGameState.buildingsOwned};
  GameState.gridExpansionCount = originalGameState.gridExpansionCount;
  
  // Exit viewing mode
  isVisitingFriend = false;
  document.body.classList.remove('viewing-mode');
  
  // Hide viewing banner
  const banner = document.querySelector('.viewing-mode-banner');
  if (banner) {
    banner.style.display = 'none';
  }
  
  // Restore action buttons
  document.getElementById('btnInventory').style.display = '';
  document.getElementById('btnMarketplace').style.display = '';
  document.getElementById('btnCreatePlot').style.display = '';
  document.getElementById('btnVisitFriend').style.display = '';
  
  // Update display
  GameState.updateDisplay();
  renderGrid();
  updateAllTimers();
  
  // CRITICAL: Restart auto-save after returning to own farm
  if (!GameState.saveInterval) {
    GameState.saveInterval = setInterval(() => {
      GameState.savePlayerData();
    }, 30000); // Save every 30 seconds
    console.log('Auto-save re-enabled');
  }
  
  // Close modal
  closeModal('visitFriendModal');
  
  // Clear original state
  originalGameState = null;
}


// ============================================================================
// TIMER SYSTEM ENHANCEMENTS (Task #17 - already mostly complete)
// ============================================================================

// Calculate time remaining for crops
function getCropTimeRemaining(tile) {
  if (!tile.plantedAt || !tile.growthMinutes) return null;
  
  const now = new Date();
  const elapsed = (now - tile.plantedAt.toDate()) / 1000 / 60; // minutes
  const remaining = Math.max(0, tile.growthMinutes - elapsed);
  
  return remaining;
}

// Calculate time remaining for trees
function getTreeTimeRemaining(tile) {
  if (!tile.lastCollectedAt || !tile.ripeMinutes) return null;
  
  const now = new Date();
  const elapsed = (now - tile.lastCollectedAt.toDate()) / 1000 / 60;
  const remaining = Math.max(0, tile.ripeMinutes - elapsed);
  
  return remaining;
}

// Calculate time remaining for building construction
function getBuildingTimeRemaining(tile) {
  if (!tile.constructionStartedAt || !tile.constructionMinutes) return null;
  
  const now = new Date();
  const elapsed = (now - tile.constructionStartedAt.toDate()) / 1000 / 60;
  const remaining = Math.max(0, tile.constructionMinutes - elapsed);
  
  return remaining;
}

// Calculate time remaining for production
function getProductionTimeRemaining(production) {
  if (!production.startedAt || !production.productionMinutes) return null;
  
  const now = new Date();
  const elapsed = (now - production.startedAt.toDate()) / 1000 / 60;
  const remaining = Math.max(0, production.productionMinutes - elapsed);
  
  return remaining;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Check if player is at a certain level
function isLevelUnlocked(requiredLevel) {
  return GameState.level >= requiredLevel;
}

// Get player progress percentage to next level
function getLevelProgress() {
  const currentLevelXP = GameData.levels[GameState.level].requiredXP;
  const nextLevelXP = GameData.getXPForNextLevel(GameState.level);
  
  if (!nextLevelXP) return 100; // Max level
  
  const xpIntoLevel = GameState.xp - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  
  return Math.min(100, (xpIntoLevel / xpNeeded) * 100);
}

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Get item category
function getItemCategory(itemId) {
  if (itemId.includes('Seed')) return 'seed';
  if (itemId.includes('Kit')) return 'buildingKit';
  if (itemId.includes('Tree')) return 'tree';
  if (GameData.crops[itemId]) return 'crop';
  if (GameData.fruitTrees[itemId]) return 'fruit';
  if (GameData.recipes[itemId]) return 'product';
  return 'unknown';
}

// Check if item is unlocked
function isItemUnlocked(itemId) {
  const category = getItemCategory(itemId);
  
  if (category === 'crop') {
    const cropId = itemId.replace('Seed', '');
    return GameData.isUnlocked('crop', cropId, GameState.level);
  }
  
  if (category === 'buildingKit') {
    const buildingId = itemId.replace('Kit', '');
    return GameData.isUnlocked('building', buildingId, GameState.level);
  }
  
  return true; // Trees, products, etc. are unlocked by rewards/production
}

// Debug function to add items (for testing)
function debugAddItem(itemId, quantity = 1) {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    GameState.addToInventory(itemId, quantity);
    console.log(`Added ${quantity}x ${itemId} to inventory`);
  }
}

// Debug function to add coins (for testing)
function debugAddCoins(amount) {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    GameState.addCoins(amount);
    console.log(`Added ${amount} coins`);
  }
}

// Debug function to add XP (for testing)
function debugAddXP(amount) {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    GameState.addXP(amount);
    console.log(`Added ${amount} XP`);
  }
}

// Make debug functions available globally (only in development)
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.debugAddItem = debugAddItem;
  window.debugAddCoins = debugAddCoins;
  window.debugAddXP = debugAddXP;
}

// ============================================================================
// MOBILE TOUCH SUPPORT (Task #21)
// ============================================================================

// Add touch event support for mobile devices
function setupMobileSupport() {
  // Prevent double-tap zoom on buttons and tiles
  const preventDoubleTapZoom = (e) => {
    const t2 = e.timeStamp;
    const t1 = e.currentTarget.dataset.lastTouch || 0;
    const dt = t2 - t1;
    const fingers = e.touches ? e.touches.length : 0;
    
    e.currentTarget.dataset.lastTouch = t2;
    
    if (!dt || dt > 500 || fingers > 1) {
      return; // Not a double tap
    }
    
    e.preventDefault();
    e.currentTarget.click();
  };
  
  // Apply to all clickable elements
  document.querySelectorAll('button, .grid-tile, .inventory-item, .marketplace-item').forEach(element => {
    element.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
  });
  
  // Prevent iOS pull-to-refresh on game container
  const gameContainer = document.getElementById('gameContainer');
  if (gameContainer) {
    gameContainer.addEventListener('touchmove', (e) => {
      if (gameContainer.scrollTop === 0) {
        e.preventDefault();
      }
    }, { passive: false });
  }
}

// Call mobile setup after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  setupMobileSupport();
});

// ============================================================================
// FINAL INITIALIZATION
// ============================================================================

console.log('Farming Town script loaded successfully!');
console.log('Language:', currentLanguage);
console.log('GameData loaded:', typeof GameData !== 'undefined');
console.log('Translations loaded:', typeof Translations !== 'undefined');

// Make key functions available globally for debugging
if (typeof window !== 'undefined') {
  window.GameState = GameState;
  window.GameData = GameData;
  window.renderGrid = renderGrid;
  window.showInventoryModal = showInventoryModal;
  window.showMarketplaceModal = showMarketplaceModal;
}


// ============================================================================
// MISSIONS SYSTEM WITH PROGRESS TRACKING
// ============================================================================

// Count completable missions by type
function countCompletableMissions(tabName) {
  let count = 0;
  
  if (tabName === 'crops') {
    // Count harvest missions
    for (const cropType in GameData.missions.harvest) {
      const missions = GameData.missions.harvest[cropType];
      missions.forEach(mission => {
        const progress = GameState.missionProgress[mission.id] || { progress: 0, claimed: false };
        if (progress.progress >= mission.target && !progress.claimed) {
          count++;
        }
      });
    }
  } else if (tabName === 'products') {
    // Count production missions
    for (const productType in GameData.missions.production) {
      const missions = GameData.missions.production[productType];
      missions.forEach(mission => {
        const progress = GameState.missionProgress[mission.id] || { progress: 0, claimed: false };
        if (progress.progress >= mission.target && !progress.claimed) {
          count++;
        }
      });
    }
  }
  
  return count;
}

// Update missions button alert state
function updateMissionsButtonAlert() {
  const btn = document.getElementById('btnMissions');
  if (!btn) return;
  
  const harvestCount = countCompletableMissions('crops');
  const productionCount = countCompletableMissions('products');
  const totalCount = harvestCount + productionCount;
  
  if (totalCount > 0) {
    btn.classList.add('missions-alert');
  } else {
    btn.classList.remove('missions-alert');
  }
}

// Show missions modal
function showMissionsModal() {
  const modal = document.getElementById('missionsModal');
  
  // Reset all tabs to inactive
  const tabs = modal.querySelectorAll('.tab-btn');
  tabs.forEach(t => t.classList.remove('active'));
  
  // Set first tab (crops) as active
  const firstTab = modal.querySelector('.tab-btn[data-tab="crops"]');
  if (firstTab) {
    firstTab.classList.add('active');
  }
  
  // Update badge counts on tabs
  updateMissionTabBadges();
  
  // Set up tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderMissionsTab(tab.dataset.tab);
    });
  });
  
  // Show crops tab by default
  renderMissionsTab('crops');
  
  modal.classList.remove('hidden');
}

// Update badge counts on mission tabs
function updateMissionTabBadges() {
  const harvestCount = countCompletableMissions('crops');
  const productionCount = countCompletableMissions('products');
  
  // Update or create badges
  const cropsTab = document.querySelector('.tab-btn[data-tab="crops"]');
  const productsTab = document.querySelector('.tab-btn[data-tab="products"]');
  
  if (cropsTab) {
    let badge = cropsTab.querySelector('.mission-badge');
    if (harvestCount > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'mission-badge';
        cropsTab.appendChild(badge);
      }
      badge.textContent = harvestCount;
    } else if (badge) {
      badge.remove();
    }
  }
  
  if (productsTab) {
    let badge = productsTab.querySelector('.mission-badge');
    if (productionCount > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'mission-badge';
        productsTab.appendChild(badge);
      }
      badge.textContent = productionCount;
    } else if (badge) {
      badge.remove();
    }
  }
}

// Render missions tab content
function renderMissionsTab(tabName) {
  const container = document.getElementById('missionsList');
  container.innerHTML = '';
  
  let missionsData = [];
  
  if (tabName === 'crops') {
    // Show harvest missions
    for (const cropType in GameData.missions.harvest) {
      const missions = GameData.missions.harvest[cropType];
      missions.forEach(mission => {
        missionsData.push({
          ...mission,
          type: 'harvest',
          itemId: cropType,
          itemName: t(cropType)
        });
      });
    }
  } else if (tabName === 'products') {
    // Show production missions
    for (const productType in GameData.missions.production) {
      const missions = GameData.missions.production[productType];
      missions.forEach(mission => {
        missionsData.push({
          ...mission,
          type: 'production',
          itemId: productType,
          itemName: t(productType)
        });
      });
    }
  }
  
  if (missionsData.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:40px;">No missions available</p>';
    return;
  }
  
  // Sort missions by completion status
  // 1. Unclaimed completed (completable) - highest priority
  // 2. In progress (not completed, not claimed)
  // 3. Claimed - lowest priority
  missionsData.sort((a, b) => {
    const progressA = GameState.missionProgress[a.id] || { progress: 0, claimed: false };
    const progressB = GameState.missionProgress[b.id] || { progress: 0, claimed: false };
    
    const isCompletedA = progressA.progress >= a.target;
    const isCompletedB = progressB.progress >= b.target;
    
    const isCompletableA = isCompletedA && !progressA.claimed;
    const isCompletableB = isCompletedB && !progressB.claimed;
    
    // Completable missions come first
    if (isCompletableA && !isCompletableB) return -1;
    if (!isCompletableA && isCompletableB) return 1;
    
    // Claimed missions come last
    if (progressA.claimed && !progressB.claimed) return 1;
    if (!progressA.claimed && progressB.claimed) return -1;
    
    // Within same status, sort by target (easier missions first)
    return a.target - b.target;
  });
  
  // Group missions by item
  const missionsByItem = {};
  missionsData.forEach(mission => {
    if (!missionsByItem[mission.itemId]) {
      missionsByItem[mission.itemId] = [];
    }
    missionsByItem[mission.itemId].push(mission);
  });
  
  // Render each item group
  for (const itemId in missionsByItem) {
    const missions = missionsByItem[itemId];
    const itemName = missions[0].itemName;
    const icon = getTileIcon(itemId);
    
    const groupDiv = document.createElement('div');
    groupDiv.className = 'mission-group';
    groupDiv.innerHTML = `
      <h3 class="mission-group-title">${icon} ${itemName}</h3>
    `;
    
    missions.forEach(mission => {
      const progress = GameState.missionProgress[mission.id] || { progress: 0, claimed: false };
      const percentage = Math.min(100, (progress.progress / mission.target) * 100);
      const isCompleted = progress.progress >= mission.target;
      const isClaimed = progress.claimed;
      
      // Build reward text
      const rewardParts = [];
      if (mission.rewards.coins) rewardParts.push(`🪙${mission.rewards.coins}`);
      if (mission.rewards.xp) rewardParts.push(`${mission.rewards.xp}XP`);
      if (mission.rewards.appleTree) rewardParts.push(`🍎🌳×${mission.rewards.appleTree}`);
      if (mission.rewards.lemonTree) rewardParts.push(`🍋🌳×${mission.rewards.lemonTree}`);
      if (mission.rewards.orangeTree) rewardParts.push(`🍊🌳×${mission.rewards.orangeTree}`);
      const rewardText = rewardParts.join(', ');
      
      const missionDiv = document.createElement('div');
      missionDiv.className = 'mission-item';
      if (isClaimed) missionDiv.classList.add('claimed');
      
      missionDiv.innerHTML = `
        <div class="mission-info">
          <div class="mission-title">
            ${t(mission.type === 'harvest' ? 'missionHarvest' : 'missionProduce')} ${mission.target} ${itemName}
          </div>
          <div class="mission-progress-bar">
            <div class="mission-progress-fill" style="width: ${percentage}%"></div>
            <span class="mission-progress-text">${progress.progress} / ${mission.target}</span>
          </div>
          <div class="mission-reward">
            ${t('missionReward')}: ${rewardText}
          </div>
        </div>
        <div class="mission-actions">
          ${isCompleted && !isClaimed ? 
            `<button class="btn-primary btn-claim" data-mission="${mission.id}">${t('claimReward')}</button>` :
            isClaimed ? 
            `<span class="mission-claimed-badge">${t('missionCompleted')}</span>` :
            `<span class="mission-incomplete">${Math.round(percentage)}%</span>`
          }
        </div>
      `;
      
      groupDiv.appendChild(missionDiv);
    });
    
    container.appendChild(groupDiv);
  }
  
  // Add claim button event listeners
  container.querySelectorAll('.btn-claim').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const missionId = e.target.dataset.mission;
      const success = GameState.claimMissionReward(missionId);
      if (success) {
        // Refresh missions display
        renderMissionsTab(tabName);
      }
    });
  });
}
