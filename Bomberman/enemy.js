// Enemy AI
class Enemy {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.direction = 'down';
    this.lastMoveTime = 0;
    this.lastBombTime = 0;
    this.bombCooldown = 4000 + Math.random() * 3000; // 4-7 seconds
    this.alive = true;
    this.moveDelay = speed + Math.random() * 100; // Slight variation
    this.escapeMode = false; // Flag for escape behavior after placing bomb
    this.escapeBombPos = null; // Position of bomb to escape from
  }
  
  update(grid, bombs, explosions) {
    if (!this.alive) return;
    
    const now = Date.now();
    
    // Check if we're near any bombs and need to escape
    const nearbyBomb = this.findNearbyBomb(bombs);
    if (nearbyBomb) {
      this.escapeMode = true;
      this.escapeBombPos = nearbyBomb;
    } else if (this.escapeMode && this.isSafeFromBomb(grid, bombs)) {
      // We've escaped successfully
      this.escapeMode = false;
      this.escapeBombPos = null;
    }
    
    // Try to move
    if (now - this.lastMoveTime > this.moveDelay) {
      if (this.escapeMode) {
        this.escapeFromBomb(grid, bombs, explosions);
      } else {
        this.tryMove(grid, explosions, bombs);
      }
      this.lastMoveTime = now;
    }
    
    // Only try to place bomb if not in escape mode and cooldown expired
    if (!this.escapeMode && now - this.lastBombTime > this.bombCooldown) {
      if (Math.random() < 0.3) { // 30% chance to attempt bomb placement
        if (this.shouldPlaceBomb(grid, bombs, explosions)) {
          this.placeBomb(grid, bombs);
          this.lastBombTime = now;
          this.escapeMode = true; // Immediately enter escape mode
          this.escapeBombPos = { x: this.x, y: this.y };
        }
      }
    }
  }
  
  findNearbyBomb(bombs) {
    // Find any PLAYER bomb within danger range (3 tiles)
    // Enemies don't need to escape from enemy bombs
    for (const bomb of bombs) {
      if (bomb.owner === 'player') {
        const dist = Math.abs(bomb.x - this.x) + Math.abs(bomb.y - this.y);
        if (dist <= 3) {
          return bomb;
        }
      }
    }
    return null;
  }
  
  isSafeFromBomb(grid, bombs) {
    // Check if we're safe from all PLAYER bombs
    for (const bomb of bombs) {
      if (bomb.owner === 'player' && this.wouldBeHitByBomb(bomb, this.x, this.y, grid)) {
        return false;
      }
    }
    return true;
  }
  
  wouldBeHitByBomb(bomb, targetX, targetY, grid) {
    // Check if position would be hit by this bomb's explosion
    if (bomb.x === targetX && bomb.y === targetY) return true;
    
    const range = bomb.range || 2;
    
    // Check horizontal line
    if (bomb.y === targetY) {
      const minX = Math.min(bomb.x, targetX);
      const maxX = Math.max(bomb.x, targetX);
      if (maxX - minX <= range) {
        // Check if any solid wall blocks
        let blocked = false;
        for (let x = minX + 1; x < maxX; x++) {
          if (grid.getTile(x, targetY) === TILE_TYPES.SOLID_WALL) {
            blocked = true;
            break;
          }
        }
        if (!blocked) return true;
      }
    }
    
    // Check vertical line
    if (bomb.x === targetX) {
      const minY = Math.min(bomb.y, targetY);
      const maxY = Math.max(bomb.y, targetY);
      if (maxY - minY <= range) {
        // Check if any solid wall blocks
        let blocked = false;
        for (let y = minY + 1; y < maxY; y++) {
          if (grid.getTile(targetX, y) === TILE_TYPES.SOLID_WALL) {
            blocked = true;
            break;
          }
        }
        if (!blocked) return true;
      }
    }
    
    return false;
  }
  
  escapeFromBomb(grid, bombs, explosions) {
    // Find the best escape direction
    const directions = [
      { dir: 'up', x: this.x, y: this.y - 1 },
      { dir: 'down', x: this.x, y: this.y + 1 },
      { dir: 'left', x: this.x - 1, y: this.y },
      { dir: 'right', x: this.x + 1, y: this.y }
    ];
    
    const safeMoves = [];
    
    for (const move of directions) {
      // Check if walkable (allow walking over bombs)
      const tile = grid.getTile(move.x, move.y);
      if (tile !== TILE_TYPES.EMPTY && tile !== TILE_TYPES.POWERUP && tile !== TILE_TYPES.BOMB) {
        continue;
      }
      
      // Check if safe from player explosions
      const inExplosion = explosions.some(exp => exp.checkCollision(move.x, move.y) && exp.canDamage('enemy'));
      if (inExplosion) continue;
      
      // Check if safe from player bombs only
      let safeFromPlayerBombs = true;
      for (const bomb of bombs) {
        if (bomb.owner === 'player' && this.wouldBeHitByBomb(bomb, move.x, move.y, grid)) {
          safeFromPlayerBombs = false;
          break;
        }
      }
      
      if (safeFromPlayerBombs) {
        // Calculate distance from bomb we're escaping
        const dist = this.escapeBombPos 
          ? Math.abs(move.x - this.escapeBombPos.x) + Math.abs(move.y - this.escapeBombPos.y)
          : 0;
        safeMoves.push({ ...move, distance: dist });
      }
    }
    
    if (safeMoves.length > 0) {
      // Prefer moves that take us further from the bomb
      safeMoves.sort((a, b) => b.distance - a.distance);
      const move = safeMoves[0];
      this.x = move.x;
      this.y = move.y;
      this.direction = move.dir;
    }
  }
  
  tryMove(grid, explosions, bombs) {
    // Get possible moves
    const directions = ['up', 'down', 'left', 'right'];
    const possibleMoves = [];
    
    for (const dir of directions) {
      let targetX = this.x;
      let targetY = this.y;
      
      switch (dir) {
        case 'up': targetY--; break;
        case 'down': targetY++; break;
        case 'left': targetX--; break;
        case 'right': targetX++; break;
      }
      
      // Check if walkable (allow walking over bombs)
      const tile = grid.getTile(targetX, targetY);
      if (tile !== TILE_TYPES.EMPTY && tile !== TILE_TYPES.POWERUP && tile !== TILE_TYPES.BOMB) {
        continue;
      }
      
      // Check if safe from player explosions
      const isSafe = !explosions.some(exp => exp.checkCollision(targetX, targetY) && exp.canDamage('enemy'));
      if (!isSafe) continue;
      
      // Check if safe from player bombs only
      let safeFromPlayerBombs = true;
      for (const bomb of bombs) {
        if (bomb.owner === 'player' && this.wouldBeHitByBomb(bomb, targetX, targetY, grid)) {
          safeFromPlayerBombs = false;
          break;
        }
      }
      
      possibleMoves.push({
        dir,
        x: targetX,
        y: targetY,
        safeFromBombs: safeFromPlayerBombs
      });
    }
    
    if (possibleMoves.length === 0) return;
    
    // Strongly prefer moves that are safe from player bombs
    const safeMoves = possibleMoves.filter(m => m.safeFromBombs);
    const movesToConsider = safeMoves.length > 0 ? safeMoves : possibleMoves;
    
    // Random move from safe options
    const move = movesToConsider[Math.floor(Math.random() * movesToConsider.length)];
    this.x = move.x;
    this.y = move.y;
    this.direction = move.dir;
  }
  
  shouldPlaceBomb(grid, bombs, explosions) {
    // Don't place bomb if we're already standing on one
    if (bombs.some(b => b.x === this.x && b.y === this.y)) {
      return false;
    }
    
    // Don't place bomb if we're in danger from player explosions
    if (explosions.some(exp => exp.checkCollision(this.x, this.y) && exp.canDamage('enemy'))) {
      return false;
    }
    
    // Since enemy bombs don't hurt enemies, they can place bombs more freely
    // Just check if there's a nearby player bomb that might trap us
    const dangerousPlayerBomb = bombs.find(b => 
      b.owner === 'player' && 
      this.wouldBeHitByBomb(b, this.x, this.y, grid)
    );
    
    if (dangerousPlayerBomb) {
      // Only place if we have an escape route from player bombs
      if (!this.hasEscapeRouteFromPlayerBombs(grid, bombs, explosions)) {
        return false;
      }
    }
    
    return true;
  }
  
  hasEscapeRouteFromPlayerBombs(grid, bombs, explosions) {
    // Check if there's at least one safe tile from player bombs
    const directions = [
      { x: this.x, y: this.y - 1 },
      { x: this.x, y: this.y + 1 },
      { x: this.x - 1, y: this.y },
      { x: this.x + 1, y: this.y }
    ];
    
    for (const pos of directions) {
      // Check if walkable (including bombs)
      const tile = grid.getTile(pos.x, pos.y);
      if (tile !== TILE_TYPES.EMPTY && tile !== TILE_TYPES.POWERUP && tile !== TILE_TYPES.BOMB) {
        continue;
      }
      
      // Check if safe from explosions
      if (explosions.some(exp => exp.checkCollision(pos.x, pos.y) && exp.canDamage('enemy'))) {
        continue;
      }
      
      // Check if safe from player bombs only
      let safeFromPlayerBombs = true;
      for (const bomb of bombs) {
        if (bomb.owner === 'player' && this.wouldBeHitByBomb(bomb, pos.x, pos.y, grid)) {
          safeFromPlayerBombs = false;
          break;
        }
      }
      
      if (safeFromPlayerBombs) {
        return true; // Found at least one escape route
      }
    }
    
    return false; // No escape route found
  }
  
  placeBomb(grid, bombs) {
    // Check if there's already a bomb here
    if (bombs.some(b => b.x === this.x && b.y === this.y)) {
      return false;
    }
    
    const bomb = new Bomb(this.x, this.y, 2, 'enemy');
    bombs.push(bomb);
    grid.setTile(this.x, this.y, TILE_TYPES.BOMB);
    
    return true;
  }
  
  checkExplosionCollision(explosions) {
    for (const explosion of explosions) {
      if (explosion.checkCollision(this.x, this.y) && explosion.canDamage('enemy')) {
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
    
    // Body (red, flashing if in escape mode)
    const color = this.escapeMode && Math.sin(time * 0.02) > 0 ? '#ff8888' : '#ff4444';
    ctx.fillStyle = color;
    ctx.fillRect(
      centerX - size / 2,
      centerY - size / 2,
      size,
      size * 0.8
    );
    
    // Head
    ctx.fillStyle = '#990000';
    ctx.beginPath();
    ctx.arc(centerX, centerY - size / 3, size / 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Eyes (angry)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - size / 3 - 2, 3, 0, Math.PI * 2);
    ctx.arc(centerX + 4, centerY - size / 3 - 2, 3, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - size / 3 - 1, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 4, centerY - size / 3 - 1, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
