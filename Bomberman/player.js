// Player character
class Player {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed; // milliseconds per tile
    this.direction = 'down';
    this.isMoving = false;
    this.lastMoveTime = 0;
    
    // Power-ups
    this.maxBombs = 1;
    this.currentBombs = 0;
    this.explosionRange = 2;
    this.speedBonus = 1.0;
    
    this.alive = true;
  }
  
  canMove(direction, grid, bombs) {
    let targetX = this.x;
    let targetY = this.y;
    
    switch (direction) {
      case 'up': targetY--; break;
      case 'down': targetY++; break;
      case 'left': targetX--; break;
      case 'right': targetX++; break;
    }
    
    // Allow walking over bombs (standard Bomberman behavior)
    const tile = grid.getTile(targetX, targetY);
    if (tile === TILE_TYPES.BOMB) {
      return true;
    }
    
    return grid.isWalkable(targetX, targetY);
  }
  
  move(direction, grid, bombs) {
    const now = Date.now();
    if (now - this.lastMoveTime < this.speed / this.speedBonus) {
      return;
    }
    
    if (!this.canMove(direction, grid, bombs)) {
      return;
    }
    
    this.direction = direction;
    
    switch (direction) {
      case 'up': this.y--; break;
      case 'down': this.y++; break;
      case 'left': this.x--; break;
      case 'right': this.x++; break;
    }
    
    this.lastMoveTime = now;
    
    // Check for powerup pickup
    const powerup = grid.getPowerup(this.x, this.y);
    if (powerup) {
      this.collectPowerup(powerup.type);
      grid.removePowerup(this.x, this.y);
    }
  }
  
  placeBomb(grid, bombs) {
    if (this.currentBombs >= this.maxBombs) {
      return false;
    }
    
    // Check if there's already a bomb here
    if (bombs.some(b => b.x === this.x && b.y === this.y)) {
      return false;
    }
    
    const bomb = new Bomb(this.x, this.y, this.explosionRange, 'player');
    bombs.push(bomb);
    grid.setTile(this.x, this.y, TILE_TYPES.BOMB);
    this.currentBombs++;
    
    return true;
  }
  
  collectPowerup(type) {
    let message = '';
    switch (type) {
      case POWERUP_TYPES.BOMB_UP:
        this.maxBombs++;
        message = `💣 Bomb Up! Max bombs: ${this.maxBombs}`;
        break;
      case POWERUP_TYPES.FIRE_UP:
        this.explosionRange++;
        message = `🔥 Fire Up! Explosion range: ${this.explosionRange}`;
        break;
      case POWERUP_TYPES.SPEED_UP:
        this.speedBonus += 0.1;
        message = `⚡ Speed Up! Speed: ${Math.round(this.speedBonus * 100)}%`;
        break;
    }
    
    // Show message
    if (message) {
      const messageEl = document.getElementById('powerup-message');
      if (messageEl) {
        messageEl.textContent = message;
        // Clear message after 3 seconds
        setTimeout(() => {
          messageEl.textContent = '';
        }, 3000);
      }
    }
  }
  
  checkExplosionCollision(explosions) {
    for (const explosion of explosions) {
      if (explosion.checkCollision(this.x, this.y) && explosion.canDamage('player')) {
        this.alive = false;
        return true;
      }
    }
    return false;
  }
  
  draw(ctx, time) {
    if (!this.alive) return;
    
    const centerX = this.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = this.y * TILE_SIZE + TILE_SIZE / 2;
    const size = TILE_SIZE * 0.7;
    
    // Body (white)
    ctx.fillStyle = '#fff';
    ctx.fillRect(
      centerX - size / 2,
      centerY - size / 2,
      size,
      size * 0.8
    );
    
    // Head
    ctx.fillStyle = '#ffdbac';
    ctx.beginPath();
    ctx.arc(centerX, centerY - size / 3, size / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - size / 3 - 2, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 4, centerY - size / 3 - 2, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Direction indicator
    ctx.fillStyle = '#4CAF50';
    switch (this.direction) {
      case 'up':
        ctx.fillRect(centerX - 3, centerY - size / 2 - 5, 6, 8);
        break;
      case 'down':
        ctx.fillRect(centerX - 3, centerY + size / 2 - 3, 6, 8);
        break;
      case 'left':
        ctx.fillRect(centerX - size / 2 - 5, centerY - 3, 8, 6);
        break;
      case 'right':
        ctx.fillRect(centerX + size / 2 - 3, centerY - 3, 8, 6);
        break;
    }
  }
}
