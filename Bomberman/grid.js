// Grid management
const TILE_SIZE = 32;

const TILE_TYPES = {
  EMPTY: 0,
  SOLID_WALL: 1,
  SOFT_BLOCK: 2,
  BOMB: 3,
  EXPLOSION: 4,
  POWERUP: 5
};

class Grid {
  constructor(width, height, softBlockPercent) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.powerups = [];
    
    this.initGrid(softBlockPercent);
  }
  
  initGrid(softBlockPercent) {
    // Create empty grid
    for (let y = 0; y < this.height; y++) {
      this.tiles[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.tiles[y][x] = TILE_TYPES.EMPTY;
      }
    }
    
    // Place solid walls (border and checkerboard pattern)
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        // Border walls
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
          this.tiles[y][x] = TILE_TYPES.SOLID_WALL;
        }
        // Checkerboard walls
        else if (x % 2 === 0 && y % 2 === 0) {
          this.tiles[y][x] = TILE_TYPES.SOLID_WALL;
        }
      }
    }
    
    // Place soft blocks randomly, avoiding player spawn area (top-left) and enemy spawn area (bottom-right)
    const emptyTiles = [];
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.tiles[y][x] === TILE_TYPES.EMPTY) {
          // Don't place blocks near player spawn (top-left 3x3)
          // Don't place blocks near enemy spawn zones (bottom-right 5x5)
          const nearPlayer = (x <= 2 && y <= 2);
          const nearEnemySpawn = (x >= this.width - 5 && y >= this.height - 5);
          
          if (!nearPlayer && !nearEnemySpawn) {
            emptyTiles.push({ x, y });
          }
        }
      }
    }
    
    // Randomly place soft blocks
    const softBlockCount = Math.floor(emptyTiles.length * softBlockPercent);
    const shuffled = emptyTiles.sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < softBlockCount; i++) {
      const { x, y } = shuffled[i];
      this.tiles[y][x] = TILE_TYPES.SOFT_BLOCK;
    }
    
    // IMPORTANT: Grid should NEVER contain BOMB or EXPLOSION tiles at initialization
    // These are only added during gameplay
  }
  
  getTile(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return TILE_TYPES.SOLID_WALL;
    }
    return this.tiles[y][x];
  }
  
  setTile(x, y, type) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = type;
    }
  }
  
  isWalkable(x, y) {
    const tile = this.getTile(x, y);
    return tile === TILE_TYPES.EMPTY || tile === TILE_TYPES.POWERUP;
  }
  
  addPowerup(x, y, type) {
    this.powerups.push({ x, y, type });
    this.setTile(x, y, TILE_TYPES.POWERUP);
  }
  
  removePowerup(x, y) {
    this.powerups = this.powerups.filter(p => !(p.x === x && p.y === y));
    this.setTile(x, y, TILE_TYPES.EMPTY);
  }
  
  getPowerup(x, y) {
    return this.powerups.find(p => p.x === x && p.y === y);
  }
  
  draw(ctx) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.tiles[y][x];
        
        switch (tile) {
          case TILE_TYPES.EMPTY:
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            break;
            
          case TILE_TYPES.SOLID_WALL:
            ctx.fillStyle = '#555';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            break;
            
          case TILE_TYPES.SOFT_BLOCK:
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#654321';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * TILE_SIZE + 2, y * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            break;
            
          case TILE_TYPES.POWERUP:
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            break;
        }
      }
    }
    
    // Draw powerups
    this.powerups.forEach(powerup => {
      drawPowerup(ctx, powerup.x, powerup.y, powerup.type);
    });
  }
}
