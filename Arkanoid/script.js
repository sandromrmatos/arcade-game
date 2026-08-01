const gameArea = document.getElementById("gameArea");
const bricksContainer = document.getElementById("bricksContainer");
const paddleEl = document.getElementById("paddle");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const statusMessageEl = document.getElementById("statusMessage");
const difficultySelect = document.getElementById("difficulty");
const startButton = document.getElementById("startButton");
const resetButton = document.getElementById("resetButton");
const leftArrow = document.getElementById("leftArrow");
const rightArrow = document.getElementById("rightArrow");

// Bilingual translations
let currentLanguage = "en";

const translations = {
  en: {
    title: "Arkanoid",
    difficultyLabel: "Difficulty:",
    easy: "Easy",
    hard: "Hard",
    startButton: "Start",
    resetButton: "Reset",
    scoreLabel: "Score:",
    livesLabel: "Lives:",
    youWin: "You win!",
    gameOver: "Game over"
  },
  pt: {
    title: "Arkanoid",
    difficultyLabel: "Dificuldade:",
    easy: "Fácil",
    hard: "Difícil",
    startButton: "Iniciar",
    resetButton: "Reiniciar",
    scoreLabel: "Pontuação:",
    livesLabel: "Vidas:",
    youWin: "Ganhou!",
    gameOver: "Jogo Terminado"
  }
};

function t(key) {
  return translations[currentLanguage][key] || key;
}

function updateLanguage() {
  document.querySelector("h1").textContent = t("title");
  document.getElementById("difficultyLabel").textContent = t("difficultyLabel");
  difficultySelect.options[0].textContent = t("easy");
  difficultySelect.options[1].textContent = t("hard");
  document.getElementById("startButton").textContent = t("startButton");
  document.getElementById("resetButton").textContent = t("resetButton");
  document.getElementById("scoreLabel").textContent = t("scoreLabel");
  document.getElementById("livesLabel").textContent = t("livesLabel");
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

let gameWidth, gameHeight;

let bricks = [];
let balls = [];
let paddle = {
  x: 0,
  width: 80,
  height: 12,
  speed: 6
};

let score = 0;
let lives = 3;
let running = false;
let difficulty = "easy";
let gameStarted = false;

let baseBallSpeed = 3;
let speedMultiplier = 1;
let lastTime = 0;

const difficultyConfig = {
  easy: { speedIncreaseThreshold: 80, speedIncreaseFactor: 1.05 },
  hard: { speedIncreaseThreshold: 50, speedIncreaseFactor: 1.12 }
};

const brickRows = 6;
const bricksPerRow = 10;
const brickMargin = 4;

function resizeGameArea() {
  const rect = gameArea.getBoundingClientRect();
  gameWidth = rect.width;
  gameHeight = rect.height;
}

function resetGameState() {
  score = 0;
  lives = 3;
  speedMultiplier = 1;
  bricks = [];
  balls = [];
  scoreEl.textContent = score;
  livesEl.textContent = lives;
  statusMessageEl.textContent = "";
}

function createBricks() {
  bricksContainer.innerHTML = "";
  bricks = [];

  const brickWidth =
    (gameWidth - brickMargin * (bricksPerRow + 1)) / bricksPerRow;
  const brickHeight = 18;

  for (let row = 0; row < brickRows; row++) {
    for (let col = 0; col < bricksPerRow; col++) {
      const x = brickMargin + col * (brickWidth + brickMargin);
      const y = brickMargin + row * (brickHeight + brickMargin);

      let type;

      if (row === 2 || row === 3) {
        type = "red"; // strong
      } else if (Math.random() < 0.15) {
        type = "green"; // power-up
      } else {
        type = "blue"; // normal
      }

      const brickEl = document.createElement("div");
      brickEl.classList.add("brick");

      if (type === "blue") brickEl.classList.add("brick-blue");
      if (type === "red") brickEl.classList.add("brick-red");
      if (type === "green") brickEl.classList.add("brick-green");

      brickEl.style.width = `${brickWidth}px`;
      brickEl.style.height = `${brickHeight}px`;
      brickEl.style.left = `${x}px`;
      brickEl.style.top = `${y}px`;

      bricksContainer.appendChild(brickEl);

      bricks.push({
        x,
        y,
        width: brickWidth,
        height: brickHeight,
        type,
        hitsRemaining: type === "red" ? 2 : 1,
        el: brickEl
      });
    }
  }
}

function createInitialBall() {
  balls = [];
  const ball = {
    x: gameWidth / 2,
    y: gameHeight * 0.6,
    radius: 6,
    vx: baseBallSpeed * (Math.random() < 0.5 ? -1 : 1),
    vy: -baseBallSpeed
  };
  balls.push(ball);
  renderBalls();
}

function addBall(x, y) {
  const ball = {
    x,
    y,
    radius: 6,
    vx: baseBallSpeed * speedMultiplier * (Math.random() < 0.5 ? -1 : 1),
    vy: -baseBallSpeed * speedMultiplier
  };
  balls.push(ball);
}

function renderBalls() {
  const existingBalls = gameArea.querySelectorAll(".ball");
  existingBalls.forEach(b => b.remove());

  balls.forEach(ball => {
    const ballEl = document.createElement("div");
    ballEl.classList.add("ball");
    ballEl.style.left = `${ball.x - ball.radius}px`;
    ballEl.style.top = `${ball.y - ball.radius}px`;
    gameArea.appendChild(ballEl);
    ball.el = ballEl;
  });
}

function positionPaddle() {
  paddleEl.style.width = `${paddle.width}px`;
  paddleEl.style.left = `${paddle.x}px`;
}

function centerPaddle() {
  paddle.x = (gameWidth - paddle.width) / 2;
  positionPaddle();
}

function startGame() {
  if (running) return;
  resizeGameArea();
  resetGameState();
  difficulty = difficultySelect.value;
  createBricks();
  paddle.width = 80;
  centerPaddle();
  createInitialBall();
  running = true;
  gameStarted = true;
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

function endGame(win) {
  running = false;
  statusMessageEl.textContent = win ? t("youWin") : t("gameOver");
  
  // Save score to leaderboard
  if (gameStarted && score > 0) {
    if (window.parent && window.parent.saveGameScore) {
      window.parent.saveGameScore("Arkanoid", {
        score: score
      }).then((result) => {
        console.log("Arkanoid score saved successfully");
        if (result && result.isNewBest && window.parent.showNewBestScore) {
          window.parent.showNewBestScore("Arkanoid", { score: score });
        }
      }).catch(err => {
        console.error("Error saving Arkanoid score:", err);
      });
    } else {
      console.error("saveGameScore function not found in parent window");
    }
  }
}

function resetGame() {
  running = false;
  gameStarted = false;
  resetGameState();
  bricksContainer.innerHTML = "";
  const existingBalls = gameArea.querySelectorAll(".ball");
  existingBalls.forEach(b => b.remove());
  centerPaddle();
}

function updateBall(ball, dt) {
  const speedFactor = speedMultiplier;
  ball.x += ball.vx * dt * speedFactor;
  ball.y += ball.vy * dt * speedFactor;

  if (ball.x - ball.radius < 0) {
    ball.x = ball.radius;
    ball.vx *= -1;
  } else if (ball.x + ball.radius > gameWidth) {
    ball.x = gameWidth - ball.radius;
    ball.vx *= -1;
  }

  if (ball.y - ball.radius < 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }

  const paddleTop = gameHeight - 16 - paddle.height;
  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;

  if (
    ball.y + ball.radius >= paddleTop &&
    ball.y + ball.radius <= paddleTop + paddle.height &&
    ball.x >= paddleLeft &&
    ball.x <= paddleRight &&
    ball.vy > 0
  ) {
    ball.y = paddleTop - ball.radius;
    ball.vy *= -1;

    const hitPos = (ball.x - paddleLeft) / paddle.width - 0.5;
    ball.vx = baseBallSpeed * 2 * hitPos;
  }

  if (ball.y - ball.radius > gameHeight) {
    ball.dead = true;
  }
}

function handleBricksCollision(ball) {
  for (const brick of bricks) {
    if (brick.hitsRemaining <= 0) continue;

    if (
      ball.x + ball.radius > brick.x &&
      ball.x - ball.radius < brick.x + brick.width &&
      ball.y + ball.radius > brick.y &&
      ball.y - ball.radius < brick.y + brick.height
    ) {
      ball.vy *= -1;

      brick.hitsRemaining -= 1;
      brick.el.classList.add("hit-glow");
      setTimeout(() => brick.el.classList.remove("hit-glow"), 120);

      if (brick.type === "red") score += 20;
      else if (brick.type === "green") score += 15;
      else score += 10;

      scoreEl.textContent = score;

      const cfg = difficultyConfig[difficulty];
      if (score % cfg.speedIncreaseThreshold === 0) {
        speedMultiplier *= cfg.speedIncreaseFactor;
      }

      if (brick.hitsRemaining <= 0) {
        brick.el.remove();
        brick.removed = true;

        if (brick.type === "green") {
          const r = Math.random();
          if (r < 0.33) {
            paddle.width = Math.min(paddle.width + 30, gameWidth * 0.5);
            positionPaddle();
          } else if (r < 0.66) {
            paddle.width = Math.max(paddle.width - 20, 40);
            positionPaddle();
          } else {
            addBall(ball.x, ball.y);
          }
        }
      }

      break;
    }
  }

  if (bricks.every(b => b.hitsRemaining <= 0)) {
    endGame(true);
  }
}

function gameLoop(timestamp) {
  if (!running) return;
  const dt = (timestamp - lastTime) / 16.67;
  lastTime = timestamp;

  balls.forEach(ball => {
    updateBall(ball, dt);
    handleBricksCollision(ball);
  });

  balls = balls.filter(ball => !ball.dead);

  if (balls.length === 0) {
    lives -= 1;
    livesEl.textContent = lives;
    if (lives <= 0) {
      endGame(false);
    } else {
      createInitialBall();
    }
  }

  balls.forEach(ball => {
    if (!ball.el) return;
    ball.el.style.left = `${ball.x - ball.radius}px`;
    ball.el.style.top = `${ball.y - ball.radius}px`;
  });

  requestAnimationFrame(gameLoop);
}

/* Controls */

let leftPressed = false;
let rightPressed = false;

document.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") leftPressed = true;
  if (e.key === "ArrowRight") rightPressed = true;
});

document.addEventListener("keyup", e => {
  if (e.key === "ArrowLeft") leftPressed = false;
  if (e.key === "ArrowRight") rightPressed = false;
});

function updatePaddlePosition() {
  if (leftPressed) paddle.x -= paddle.speed;
  if (rightPressed) paddle.x += paddle.speed;

  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > gameWidth)
    paddle.x = gameWidth - paddle.width;

  positionPaddle();
}

setInterval(() => {
  if (!running) return;
  updatePaddlePosition();
}, 16);

function movePaddleLeft() {
  paddle.x -= paddle.speed * 3;
  if (paddle.x < 0) paddle.x = 0;
  positionPaddle();
}

function movePaddleRight() {
  paddle.x += paddle.speed * 3;
  if (paddle.x + paddle.width > gameWidth)
    paddle.x = gameWidth - paddle.width;
  positionPaddle();
}

// Mobile arrow button controls
let leftInterval = null;
let rightInterval = null;

// Initialize everything when DOM is ready
window.addEventListener("load", () => {
  // Mobile arrow button controls
  leftArrow.addEventListener("mousedown", () => {
    if (!running) return;
    movePaddleLeft();
    leftInterval = setInterval(movePaddleLeft, 50);
  });

  leftArrow.addEventListener("mouseup", () => {
    if (leftInterval) {
      clearInterval(leftInterval);
      leftInterval = null;
    }
  });

  leftArrow.addEventListener("mouseleave", () => {
    if (leftInterval) {
      clearInterval(leftInterval);
      leftInterval = null;
    }
  });

  leftArrow.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!running) return;
    movePaddleLeft();
    leftInterval = setInterval(movePaddleLeft, 50);
  });

  leftArrow.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (leftInterval) {
      clearInterval(leftInterval);
      leftInterval = null;
    }
  });

  rightArrow.addEventListener("mousedown", () => {
    if (!running) return;
    movePaddleRight();
    rightInterval = setInterval(movePaddleRight, 50);
  });

  rightArrow.addEventListener("mouseup", () => {
    if (rightInterval) {
      clearInterval(rightInterval);
      rightInterval = null;
    }
  });

  rightArrow.addEventListener("mouseleave", () => {
    if (rightInterval) {
      clearInterval(rightInterval);
      rightInterval = null;
    }
  });

  rightArrow.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (!running) return;
    movePaddleRight();
    rightInterval = setInterval(movePaddleRight, 50);
  });

  rightArrow.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (rightInterval) {
      clearInterval(rightInterval);
      rightInterval = null;
    }
  });

  startButton.addEventListener("click", startGame);
  resetButton.addEventListener("click", resetGame);

  // Initialize language
  getParentLanguage();
  updateLanguage();
  
  // Initialize game area
  resizeGameArea();
  centerPaddle();
});

window.addEventListener("resize", () => {
  resizeGameArea();
  centerPaddle();
});
