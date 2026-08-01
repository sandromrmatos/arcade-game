// Level configurations
const LEVELS = [
  {
    level: 1,
    gridWidth: 13,
    gridHeight: 11,
    softBlockPercent: 0.4,
    enemyCount: 1,
    explosionRange: 2,
    playerSpeed: 150
  },
  {
    level: 2,
    gridWidth: 15,
    gridHeight: 13,
    softBlockPercent: 0.5,
    enemyCount: 2,
    explosionRange: 2,
    playerSpeed: 130
  },
  {
    level: 3,
    gridWidth: 17,
    gridHeight: 15,
    softBlockPercent: 0.6,
    enemyCount: 3,
    explosionRange: 3,
    playerSpeed: 120
  },
  {
    level: 4,
    gridWidth: 19,
    gridHeight: 17,
    softBlockPercent: 0.65,
    enemyCount: 5,
    explosionRange: 3,
    playerSpeed: 110
  }
];

console.log(`Bomberman: Loaded ${LEVELS.length} levels configuration`);

function getLevelConfig(levelNum) {
  const config = LEVELS[levelNum - 1] || LEVELS[0];
  console.log(`Getting level config for level ${levelNum}:`, config);
  return config;
}
