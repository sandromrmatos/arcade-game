const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const timerEl = document.getElementById('timer');
const overlay = document.getElementById('overlay');
const overlayText = document.getElementById('overlay-text');
const restartBtn = document.getElementById('restart-btn');
const diffButtons = document.querySelectorAll('#difficulty-select button');

const TILE_SIZE = 30;
const ROWS = 20;
const COLS = 20;

// Maze layout
const baseMaze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,2,1],
    [1,3,1,0,1,2,1,0,2,2,2,2,1,0,1,2,0,1,3,1],
    [1,2,1,0,1,2,1,0,1,1,1,1,1,0,1,2,0,1,2,1],
    [1,2,2,2,2,2,2,0,2,2,2,2,2,0,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,2,1],
    [1,2,1,0,1,2,1,0,2,2,2,2,1,0,1,2,0,1,2,1],
    [1,2,2,0,2,2,2,2,2,1,1,2,2,2,2,2,0,2,2,1],
    [1,1,1,0,1,1,1,1,2,1,1,2,1,1,1,1,0,1,1,1],
    [1,2,2,0,2,2,2,2,2,2,2,2,2,2,2,2,0,2,2,1],
    [1,2,1,0,1,2,1,0,1,1,1,1,1,0,1,2,0,1,2,1],
    [1,3,1,0,1,2,1,0,2,2,2,2,1,0,1,2,0,1,3,1],
    [1,2,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1],
    [1,3,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let maze = [];
let pacman = { x: 9, y: 15, dirX: 0, dirY: 0 };
let ghosts = [];
let score = 0;
let lives = 3;
let startTime = null;
let elapsed = 0;
let gameRunning = false;
let difficulty = null;

// Movement timers
let pacmanMoveTimer = 0;
let ghostMoveTimer = 0;

// Power pellet state
let ghostsFrozen = false;
let ghostsEdible = false;
let freezeEndTime = 0;
let edibleEndTime = 0;

const ghostColors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];

function resetMaze() {
    maze = baseMaze.map(r => r.slice());
}

function initGhosts() {
    ghosts = [
        { x: 9, y: 9, dirX: 1, dirY: 0, color: ghostColors[0], eaten: false, respawnTimer: 0 },
        { x: 10, y: 9, dirX: -1, dirY: 0, color: ghostColors[1], eaten: false, respawnTimer: 0 },
        { x: 9, y: 10, dirX: 0, dirY: 1, color: ghostColors[2], eaten: false, respawnTimer: 0 },
        { x: 10, y: 10, dirX: 0, dirY: -1, color: ghostColors[3], eaten: false, respawnTimer: 0 }
    ];
}

function setDifficulty(diff) {
    difficulty = diff;
}

diffButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        setDifficulty(btn.dataset.diff);
        startGame();
    });
});

function startGame() {
    resetMaze();
    pacman = { x: 9, y: 15, dirX: 0, dirY: 0 };
    initGhosts();
    score = 0;
    lives = 3;
    startTime = performance.now();
    elapsed = 0;
    pacmanMoveTimer = 0;
    ghostMoveTimer = 0;
    ghostsFrozen = false;
    ghostsEdible = false;
    freezeEndTime = 0;
    edibleEndTime = 0;
    gameRunning = true;
    overlay.classList.add('hidden');
    updateUI();

    requestAnimationFrame(loop);
}

restartBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
    if (!gameRunning) return;

    if (e.key === 'ArrowUp') tryMove(0, -1);
    if (e.key === 'ArrowDown') tryMove(0, 1);
    if (e.key === 'ArrowLeft') tryMove(-1, 0);
    if (e.key === 'ArrowRight') tryMove(1, 0);
});

function tryMove(dx, dy) {
    const nx = pacman.x + dx;
    const ny = pacman.y + dy;
    if (!isWall(nx, ny)) {
        pacman.dirX = dx;
        pacman.dirY = dy;
    }
}

function isWall(x, y) {
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
    return maze[y][x] === 1;
}

function updateUI() {
    scoreEl.textContent = score;
    livesEl.textContent = lives;
    timerEl.textContent = elapsed.toFixed(1);
}

function update(delta) {
    if (!gameRunning) return;

    const now = performance.now();
    elapsed = (now - startTime) / 1000;

    if (ghostsFrozen && now >= freezeEndTime) ghostsFrozen = false;
    if (ghostsEdible && now >= edibleEndTime) ghostsEdible = false;

    movePacman(delta);
    handlePacmanTile();
    moveGhosts(delta);

    checkCollisions();
    checkWin();

    updateUI();
}

function movePacman(delta) {
    pacmanMoveTimer += delta;

    if (pacmanMoveTimer < 0.12) return;
    pacmanMoveTimer = 0;

    const nx = pacman.x + pacman.dirX;
    const ny = pacman.y + pacman.dirY;

    if (!isWall(nx, ny)) {
        pacman.x = nx;
        pacman.y = ny;
    }
}

function handlePacmanTile() {
    const tile = maze[pacman.y][pacman.x];

    if (tile === 2) {
        maze[pacman.y][pacman.x] = 0;
        score += 1;
    }

    if (tile === 3) {
        maze[pacman.y][pacman.x] = 0;
        score += 5;

        ghostsFrozen = true;
        ghostsEdible = true;

        freezeEndTime = performance.now() + 4000;
        edibleEndTime = performance.now() + 4000;
    }
}

function moveGhosts(delta) {
    ghostMoveTimer += delta;

    let ghostDelay = 0.28;
    if (difficulty === 'medium') ghostDelay = 0.24;
    if (difficulty === 'hard') ghostDelay = 0.20;

    ghostDelay -= Math.min(score * 0.0005, 0.08);

    if (ghostMoveTimer < ghostDelay) return;
    ghostMoveTimer = 0;

    ghosts.forEach(g => {
        if (g.eaten) {
            g.respawnTimer -= ghostDelay;
            if (g.respawnTimer <= 0) {
                g.eaten = false;
                g.x = 9;
                g.y = 10;
            }
            return;
        }

        if (ghostsFrozen) return;

        if (difficulty === 'hard') chaseGhost(g);
        else randomGhost(g);
    });
}

function randomGhost(g) {
    const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];

    const nx = g.x + g.dirX;
    const ny = g.y + g.dirY;

    if (!isWall(nx, ny)) {
        g.x = nx;
        g.y = ny;
        return;
    }

    const shuffled = dirs.sort(() => Math.random() - 0.5);
    for (let d of shuffled) {
        const tx = g.x + d.dx;
        const ty = g.y + d.dy;
        if (!isWall(tx, ty)) {
            g.dirX = d.dx;
            g.dirY = d.dy;
            g.x = tx;
            g.y = ty;
            break;
        }
    }
}

function chaseGhost(g) {
    const dirs = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 }
    ];

    let best = null;
    let bestDist = Infinity;

    dirs.forEach(d => {
        const nx = g.x + d.dx;
        const ny = g.y + d.dy;
        if (!isWall(nx, ny)) {
            const dist = Math.abs(nx - pacman.x) + Math.abs(ny - pacman.y);
            if (dist < bestDist) {
                bestDist = dist;
                best = d;
            }
        }
    });

    if (!best) return randomGhost(g);

    g.dirX = best.dx;
    g.dirY = best.dy;
    g.x += best.dx;
    g.y += best.dy;
}

function checkCollisions() {
    ghosts.forEach(g => {
        if (g.eaten) return;

        if (g.x === pacman.x && g.y === pacman.y) {
            if (ghostsEdible) {
                g.eaten = true;
                g.respawnTimer = 3;
                score += 50;
            } else {
                loseLife();
            }
        }
    });
}

function loseLife() {
    lives -= 1;

    // Lose 25 points but never below 0
    score = Math.max(0, score - 25);

    if (lives <= 0) {
        gameRunning = false;
        overlayText.textContent = "Game Over";
        overlay.classList.remove('hidden');
        return;
    }

    pacman = { x: 9, y: 15, dirX: 0, dirY: 0 };
    initGhosts();
}

function checkWin() {
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (maze[y][x] === 2 || maze[y][x] === 3) return;
        }
    }

    gameRunning = false;
    overlayText.textContent = `You win! Time: ${elapsed.toFixed(1)}s | Score: ${score}`;
    overlay.classList.remove('hidden');
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const tile = maze[y][x];
            const px = x * TILE_SIZE;
            const py = y * TILE_SIZE;

            if (tile === 1) {
                ctx.fillStyle = '#0000ff';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);
            } else {
                ctx.fillStyle = '#000';
                ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

                if (tile === 2) {
                    ctx.fillStyle = '#ffff00';
                    ctx.beginPath();
                    ctx.arc(px + 15, py + 15, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (tile === 3) {
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(px + 15, py + 15, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }

    const pacX = pacman.x * TILE_SIZE + 15;
    const pacY = pacman.y * TILE_SIZE + 15;

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(pacX, pacY, 13, 0, Math.PI * 2);
    ctx.fill();

    ghosts.forEach(g => {
        const gx = g.x * TILE_SIZE + 15;
        const gy = g.y * TILE_SIZE + 15;

        if (g.eaten) {
            ctx.fillStyle = '#888';
        } else if (ghostsEdible) {
            ctx.fillStyle = '#0000ff';
        } else {
            ctx.fillStyle = g.color;
        }

        ctx.beginPath();
        ctx.arc(gx, gy, 13, Math.PI, 0);
        ctx.lineTo(gx + 13, gy + 13);
        ctx.lineTo(gx - 13, gy + 13);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(gx - 5, gy - 5, 3, 0, Math.PI * 2);
        ctx.arc(gx + 5, gy - 5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00f';
        ctx.beginPath();
        ctx.arc(gx - 5, gy - 5, 1.5, 0, Math.PI * 2);
        ctx.arc(gx + 5, gy - 5, 1.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

let lastTime = performance.now();
function loop(now) {
    const delta = (now - lastTime) / 1000;
    lastTime = now;

    update(delta);
    draw();

    if (gameRunning) {
        requestAnimationFrame(loop);
    }
}
