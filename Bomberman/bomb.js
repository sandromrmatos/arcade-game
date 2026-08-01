// Bomb system
const BOMB_FUSE_TIME = 2000; // 2 seconds in milliseconds

class Bomb {
  constructor(x, y, range, owner) {
    this.x = x;
    this.y = y;
    this.range = range;
    this.owner = owner; // 'player' or 'enemy'
    this.placedTime = Date.now();
    this.timeLeft = BOMB_FUSE_TIME;
    this.triggered = false; // For chain reactions
  }
  
  update(deltaTime) {
    this.timeLeft -= deltaTime;
    return this.timeLeft <= 0;
  }
  
  draw(ctx, time) {
    const elapsed = Date.now() - this.placedTime;
    const progress = elapsed / BOMB_FUSE_TIME;
    
    // Pulsing animation
    const pulse = Math.sin(time * 0.01) * 0.15 + 0.85;
    const size = TILE_SIZE * 0.6 * pulse;
    
    const centerX = this.x * TILE_SIZE + TILE_SIZE / 2;
    const centerY = this.y * TILE_SIZE + TILE_SIZE / 2;
    
    // Different color based on owner
    const bombColor = this.owner === 'player' ? '#000' : '#8B0000'; // Black for player, dark red for enemy
    const fuseColor = progress > 0.7 ? '#ffff00' : (this.owner === 'player' ? '#ff6600' : '#ff3333');
    
    // Bomb body
    ctx.fillStyle = progress > 0.7 ? '#ff0000' : bombColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, size / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Owner indicator ring for enemy bombs
    if (this.owner === 'enemy') {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, size / 2 + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Fuse
    ctx.strokeStyle = fuseColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size / 2);
    ctx.lineTo(centerX, centerY - size / 2 - 8);
    ctx.stroke();
    
    // Spark at fuse tip
    if (Math.sin(time * 0.02) > 0) {
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(centerX, centerY - size / 2 - 8, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
