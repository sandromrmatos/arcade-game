// Power-up system
const POWERUP_TYPES = {
  BOMB_UP: 'bomb_up',
  FIRE_UP: 'fire_up',
  SPEED_UP: 'speed_up'
};

const POWERUP_CHANCE = 0.2; // 20% chance on soft block destruction

function getRandomPowerup() {
  if (Math.random() > POWERUP_CHANCE) {
    return null;
  }
  
  const types = Object.values(POWERUP_TYPES);
  return types[Math.floor(Math.random() * types.length)];
}

function drawPowerup(ctx, x, y, type) {
  const centerX = x * TILE_SIZE + TILE_SIZE / 2;
  const centerY = y * TILE_SIZE + TILE_SIZE / 2;
  const radius = TILE_SIZE / 3;
  
  // Draw circle background
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw icon
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  let icon = '';
  switch (type) {
    case POWERUP_TYPES.BOMB_UP:
      icon = 'B+';
      break;
    case POWERUP_TYPES.FIRE_UP:
      icon = 'F+';
      break;
    case POWERUP_TYPES.SPEED_UP:
      icon = 'S+';
      break;
  }
  
  ctx.fillText(icon, centerX, centerY);
}
