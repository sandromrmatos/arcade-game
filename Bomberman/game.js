// Main game controller
let currentLanguage = "en";

const translations = {
  en: {
    title: "Bomberman",
    levelLabel: "Level:",
    livesLabel: "Lives:",
    scoreLabel: "Score:",
    enemiesLabel: "Enemies:",
    startButton: "Start Game",
    restartButton: "Restart",
    controlsText: "<strong>Controls:</strong> Arrow Keys to move • Spacebar to place bomb",
    levelComplete: "Level Complete!",
    levelCompleteText: "Great job! Ready for the next level?",
    gameOver: "Game Over!",
    gameOverText: "You ran out of lives. Your final score: ",
    victory: "Victory!",
    victoryText: "You completed all 4 levels! Final score: ",
    continue: "Continue"
  },
  pt: {
    title: "Bomberman",
    levelLabel: "Nível:",
    livesLabel: "Vidas:",
    scoreLabel: "Pontuação:",
    enemiesLabel: "Inimigos:",
    startButton: "Iniciar Jogo",
    restartButton: "Reiniciar",
    controlsText: "<strong>Controlos:</strong> Setas para mover • Barra de espaço para colocar bomba",
    levelComplete: "Nível Completo!",
    levelCompleteText: "Bom trabalho! Pronto para o próximo nível?",
    gameOver: "Jogo Terminado!",
    gameOverText: "Ficou sem vidas. Pontuação final: ",
    victory: "Vitória!",
    victoryText: "Completou todos os 4 níveis! Pontuação final: ",
    continue: "Continuar"
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function updateLanguage() {
  document.getElementById("game-title").textContent = t("title");
  document.getElementById("level-label").textContent = t("levelLabel");
  document.getElementById("lives-label").textContent = t("livesLabel");
  document.getElementById("score-label").textContent = t("scoreLabel");
  document.getElementById("enemies-label").textContent = t("enemiesLabel");
  document.getElementById("start-btn").textContent = t("startButton");
  document.getElementById("restart-btn").textContent = t("restartButton");
  document.getElementById("controls-text").innerHTML = t("controlsText");
}

// Get language from parent window
function getParentLanguage() {
  if (window.parent && window.parent !== window) {
    try {
      const parentLang = window.parent.localStorage.getItem("arcadeLanguage");
      if (parentLang) {
        currentLanguage = parentLang;
      }
    } catch (e) {
      console.log("Cannot access parent language, using default");
    }
  }
}

// Listen for language changes from parent
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "languageChange") {
    currentLanguage = event.data.language;
    updateLanguage();
  }
});

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.currentLevel = 1;
    this.lives = 3;
    this.score = 0;
    this.gameState = 'menu'; // menu, playing, paused, levelComplete, gameOver, victory
    
    this.grid = null;
    this.player = null;
    this.enemies = [];
    this.bombs = [];
    this.explosions = [];
    
    this.keys = {};
    this.lastFrameTime = 0;
    this.animationId = null;
    
    this.setupEventListeners();
    this.initLevel();
    this.updateHUD();
  }
  
  setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      if (e.key === ' ') {
        e.preventDefault();
        if (this.gameState === 'playing' && this.player) {
          this.player.placeBomb(this.grid, this.bombs);
        }
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
    
    // Buttons
    document.getElementById('start-btn').addEventListener('click', () => {
      this.startGame();
    });
    
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.restartGame();
    });
    
    document.getElementById('message-btn').addEventListener('click', () => {
      this.handleMessageButton();
    });
  }
  
  initLevel() {
    const config = getLevelConfig(this.currentLevel);
    
    // Setup canvas size
    this.canvas.width = config.gridWidth * TILE_SIZE;
    this.canvas.height = config.gridHeight * TILE_SIZE;
    
    // Create grid
    this.grid = new Grid(config.gridWidth, config.gridHeight, config.softBlockPercent);
    
    // Create player at top-left safe zone
    this.player = new Player(1, 1, config.playerSpeed);
    this.player.explosionRange = config.explosionRange;
    
    // Create enemies at random positions (avoiding player area)
    this.enemies = [];
    for (let i = 0; i < config.enemyCount; i++) {
      const pos = this.findSafeEnemySpawn();
      if (pos) {
        this.enemies.push(new Enemy(pos.x, pos.y, config.playerSpeed + 50));
      } else {
        console.error(`Failed to spawn enemy ${i + 1} of ${config.enemyCount}`);
      }
    }
    
    console.log(`Level ${this.currentLevel} initialized with ${this.enemies.length} enemies (expected ${config.enemyCount})`);
    
    // Clear bombs and explosions
    this.bombs = [];
    this.explosions = [];
  }
  
  findSafeEnemySpawn() {
    const attempts = 200; // Increase attempts
    for (let i = 0; i < attempts; i++) {
      // Spawn in bottom-right area to be far from player
      const x = Math.floor(Math.random() * (this.grid.width - 6)) + 3;
      const y = Math.floor(Math.random() * (this.grid.height - 6)) + 3;
      
      // Not near player (at least 4 tiles away in manhattan distance)
      const dist = Math.abs(x - 1) + Math.abs(y - 1);
      if (dist < 4) continue;
      
      // Must be walkable
      if (!this.grid.isWalkable(x, y)) continue;
      
      // Not on top of another enemy
      if (this.enemies.some(e => e.x === x && e.y === y)) continue;
      
      return { x, y };
    }
    
    // Fallback: try bottom-right corner area specifically
    for (let y = this.grid.height - 2; y >= this.grid.height - 5; y--) {
      for (let x = this.grid.width - 2; x >= this.grid.width - 5; x--) {
        if (this.grid.isWalkable(x, y) && !this.enemies.some(e => e.x === x && e.y === y)) {
          return { x, y };
        }
      }
    }
    
    console.error("Failed to find spawn position for enemy!");
    return null;
  }
  
  startGame() {
    // Verify we have enemies before starting
    const config = getLevelConfig(this.currentLevel);
    if (this.enemies.length < config.enemyCount) {
      console.error(`Cannot start - only ${this.enemies.length} of ${config.enemyCount} enemies spawned`);
      alert(`Error: Could not spawn all enemies. Please restart the game.`);
      return;
    }
    
    this.gameState = 'playing';
    document.getElementById('start-btn').style.display = 'none';
    document.getElementById('restart-btn').style.display = 'inline-block';
    this.canvas.focus();
    this.lastFrameTime = performance.now(); // Initialize lastFrameTime
    this.gameLoop(performance.now());
  }
  
  restartGame() {
    this.currentLevel = 1;
    this.lives = 3;
    this.score = 0;
    this.initLevel();
    this.updateHUD();
    this.startGame();
  }
  
  gameLoop(timestamp) {
    if (this.gameState !== 'playing') return;
    
    const deltaTime = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;
    
    this.update(deltaTime);
    this.draw(timestamp);
    
    this.animationId = requestAnimationFrame((t) => this.gameLoop(t));
  }
  
  update(deltaTime) {
    // Handle player movement
    if (this.player && this.player.alive) {
      if (this.keys['ArrowUp']) this.player.move('up', this.grid, this.bombs);
      if (this.keys['ArrowDown']) this.player.move('down', this.grid, this.bombs);
      if (this.keys['ArrowLeft']) this.player.move('left', this.grid, this.bombs);
      if (this.keys['ArrowRight']) this.player.move('right', this.grid, this.bombs);
    }
    
    // Update enemies
    this.enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.update(this.grid, this.bombs, this.explosions);
      }
    });
    
    // Update bombs
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      
      if (bomb.update(deltaTime)) {
        // Bomb exploded
        const explosion = new Explosion(bomb.x, bomb.y, bomb.range, this.grid, this, bomb.owner);
        this.explosions.push(explosion);
        
        // Remove bomb
        this.grid.setTile(bomb.x, bomb.y, TILE_TYPES.EMPTY);
        this.bombs.splice(i, 1);
        
        // Return bomb to player if it was theirs
        if (bomb.owner === 'player' && this.player) {
          this.player.currentBombs--;
        }
      }
    }
    
    // Update explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      if (!this.explosions[i].isActive()) {
        this.explosions[i].cleanup(this.grid);
        this.explosions.splice(i, 1);
      }
    }
    
    // Check collisions
    if (this.player && this.player.alive) {
      if (this.player.checkExplosionCollision(this.explosions)) {
        this.handlePlayerDeath();
      }
    }
    
    this.enemies.forEach(enemy => {
      if (enemy.alive) {
        enemy.checkExplosionCollision(this.explosions);
      }
    });
    
    // Check win condition
    this.checkWinCondition();
    this.updateHUD();
  }
  
  draw(time) {
    // Clear canvas
    this.ctx.fillStyle = '#1a1a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.grid.draw(this.ctx);
    
    // Draw bombs
    this.bombs.forEach(bomb => bomb.draw(this.ctx, time));
    
    // Draw explosions
    this.explosions.forEach(explosion => explosion.draw(this.ctx, time));
    
    // Draw player
    if (this.player) {
      this.player.draw(this.ctx, time);
    }
    
    // Draw enemies
    this.enemies.forEach(enemy => enemy.draw(this.ctx, time));
  }
  
  handlePlayerDeath() {
    console.log(`Player died! Lives remaining: ${this.lives - 1}`);
    this.lives--;
    this.updateHUD();
    
    if (this.lives <= 0) {
      console.log("Game Over - No lives remaining");
      this.gameOver();
    } else {
      console.log(`Respawning player at (1,1)`);
      // Respawn player
      this.player = new Player(1, 1, getLevelConfig(this.currentLevel).playerSpeed);
      this.player.explosionRange = getLevelConfig(this.currentLevel).explosionRange;
    }
  }
  
  checkWinCondition() {
    // Only check win condition if game is actually playing and we've started the level
    if (this.gameState !== 'playing') return;
    
    const aliveEnemies = this.enemies.filter(e => e.alive).length;
    const totalEnemies = this.enemies.length;
    
    // Only trigger win if we actually had enemies to begin with and they're all dead
    if (totalEnemies > 0 && aliveEnemies === 0) {
      // Prevent multiple triggers
      if (this.gameState === 'playing') {
        this.levelComplete();
      }
    }
  }
  
  levelComplete() {
    this.gameState = 'levelComplete';
    this.addScore(100 * this.currentLevel); // Bonus for completing level
    
    if (this.currentLevel >= 4) {
      this.victory();
    } else {
      this.showMessage(t("levelComplete"), t("levelCompleteText"));
    }
  }
  
  victory() {
    this.gameState = 'victory';
    this.showMessage(t("victory"), t("victoryText") + this.score);
    this.saveScore();
  }
  
  gameOver() {
    this.gameState = 'gameOver';
    this.showMessage(t("gameOver"), t("gameOverText") + this.score);
    this.saveScore();
  }
  
  showMessage(title, text) {
    document.getElementById('message-title').textContent = title;
    document.getElementById('message-text').textContent = text;
    document.getElementById('message-overlay').classList.remove('hidden');
  }
  
  hideMessage() {
    document.getElementById('message-overlay').classList.add('hidden');
  }
  
  handleMessageButton() {
    this.hideMessage();
    
    if (this.gameState === 'levelComplete') {
      this.currentLevel++;
      this.initLevel();
      this.updateHUD();
      this.startGame();
    } else if (this.gameState === 'gameOver' || this.gameState === 'victory') {
      document.getElementById('restart-btn').style.display = 'inline-block';
    }
  }
  
  addScore(points) {
    this.score += points;
    this.updateHUD();
  }
  
  updateHUD() {
    document.getElementById('level').textContent = this.currentLevel;
    document.getElementById('lives').textContent = this.lives;
    document.getElementById('score').textContent = this.score;
    const aliveEnemies = this.enemies.filter(e => e.alive).length;
    document.getElementById('enemies').textContent = aliveEnemies;
  }
  
  saveScore() {
    if (this.score === 0) return;
    
    // Save score to parent leaderboard
    if (window.parent && window.parent.saveGameScore) {
      window.parent.saveGameScore("Bomberman", {
        score: this.score,
        level: this.currentLevel
      }).then((result) => {
        console.log("Bomberman score saved successfully");
        if (result && result.isNewBest && window.parent.showNewBestScore) {
          window.parent.showNewBestScore("Bomberman", { score: this.score, level: this.currentLevel });
        }
      }).catch(err => {
        console.error("Error saving Bomberman score:", err);
      });
    }
  }
}

// Initialize game when page loads
let game;

window.addEventListener('load', () => {
  getParentLanguage();
  updateLanguage();
  game = new Game();
});
