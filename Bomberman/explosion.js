// Explosion system
const EXPLOSION_DURATION = 300; // milliseconds

class Explosion {
  constructor(x, y, range, grid, game, owner) {
    this.tiles = [];
    this.startTime = Date.now();
    this.duration = EXPLOSION_DURATION;
    this.owner = owner; // 'player' or 'enemy' - who placed the bomb
    
    // Calculate explosion tiles
    this.calculateExplosion(x, y, range, grid, game);
  }
  
  calculateExplosion(centerX, centerY, range, grid, game) {
    // Center tile
    this.addExplosionTile(centerX, centerY, grid, game);
    
    // Four directions
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }   // right
    ];
    
    directions.forEach(dir => {
      for (let i = 1; i <= range; i++) {
        const x = centerX + dir.dx * i;
        const y = centerY + dir.dy * i;
        
        const tile = grid.getTile(x, y);
        
        // Stop at solid walls
        if (tile === TILE_TYPES.SOLID_WALL) {
          break;
        }
        
        // Add explosion tile
        this.addExplosionTile(x, y, grid, game);
        
        // Stop at soft blocks (but destroy them)
        if (tile === TILE_TYPES.SOFT_BLOCK) {
          break;
        }
      }
    });
  }
  
  addExplosionTile(x, y, grid, game) {
    const tile = grid.getTile(x, y);
    
    // Destroy soft blocks
    if (tile === TILE_TYPES.SOFT_BLOCK) {
      grid.setTile(x, y, TILE_TYPES.EMPTY);
      
      // Maybe spawn powerup
      const powerupType = getRandomPowerup();
      if (powerupType) {
        grid.addPowerup(x, y, powerupType);
      }
      
      // Score points
      game.addScore(10);
    }
    
    // Trigger chain reactions with other bombs
    if (tile === TILE_TYPES.BOMB) {
      const bomb = game.bombs.find(b => b.x === x && b.y === y);
      if (bomb && !bomb.triggered) {
        bomb.triggered = true;
        bomb.timeLeft = 0; // Explode immediately
      }
    }
    
    this.tiles.push({ x, y });
    grid.setTile(x, y, TILE_TYPES.EXPLOSION);
  }
  
  isActive() {
    return Date.now() - this.startTime < this.duration;
  }
  
  cleanup(grid) {
    this.tiles.forEach(({ x, y }) => {
      if (grid.getTile(x, y) === TILE_TYPES.EXPLOSION) {
        grid.setTile(x, y, TILE_TYPES.EMPTY);
      }
    });
  }
  
  draw(ctx, time) {
    const elapsed = Date.now() - this.startTime;
    const alpha = 1 - (elapsed / this.duration);
    
    // Different color based on owner
    const baseColor = this.owner === 'enemy' ? '200, 50, 50' : '255, 100, 0'; // Red for enemy, orange for player
    const highlightColor = this.owner === 'enemy' ? '255, 100, 100' : '255, 200, 0';
    
    this.tiles.forEach(({ x, y }) => {
      // Flickering explosion effect
      const flicker = Math.sin(time * 0.02) * 0.2 + 0.8;
      
      ctx.fillStyle = `rgba(${baseColor}, ${alpha * flicker})`;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      
      ctx.fillStyle = `rgba(${highlightColor}, ${alpha * flicker * 0.7})`;
      ctx.fillRect(
        x * TILE_SIZE + TILE_SIZE / 4,
        y * TILE_SIZE + TILE_SIZE / 4,
        TILE_SIZE / 2,
        TILE_SIZE / 2
      );
    });
  }
  
  checkCollision(x, y) {
    return this.tiles.some(tile => tile.x === x && tile.y === y);
  }
  
  // Check if this explosion can damage a specific entity
  canDamage(entityType) {
    // Enemy bombs only damage player
    if (this.owner === 'enemy') {
      return entityType === 'player';
    }
    // Player bombs damage everyone
    return true;
  }
}
