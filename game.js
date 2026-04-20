const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('highScore');
const gameStatusDisplay = document.getElementById('gameStatus');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameOver = false;

highScoreDisplay.textContent = highScore;

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    if (gameOver) return;
    
    const key = e.key.toLowerCase();
    
    // Arrow keys
    if (e.key === 'ArrowUp' && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (e.key === 'ArrowDown' && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (e.key === 'ArrowLeft' && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (e.key === 'ArrowRight' && direction.x === 0) nextDirection = { x: 1, y: 0 };
    
    // WASD keys
    if (key === 'w' && direction.y === 0) nextDirection = { x: 0, y: -1 };
    if (key === 's' && direction.y === 0) nextDirection = { x: 0, y: 1 };
    if (key === 'a' && direction.x === 0) nextDirection = { x: -1, y: 0 };
    if (key === 'd' && direction.x === 0) nextDirection = { x: 1, y: 0 };
    
    // Space to start/pause
    if (key === ' ') {
        e.preventDefault();
        if (!gameRunning) startGame();
        else togglePause();
    }
}

function startGame() {
    if (gameOver) {
        snake = [{ x: 10, y: 10 }];
        direction = { x: 1, y: 0 };
        nextDirection = { x: 1, y: 0 };
        score = 0;
        scoreDisplay.textContent = score;
        gameOver = false;
        gameStatusDisplay.textContent = '';
    }
    
    gameRunning = true;
    gamePaused = false;
    startBtn.textContent = 'Restart';
    pauseBtn.disabled = false;
    gameStatusDisplay.textContent = '';
}

function togglePause() {
    gamePaused = !gamePaused;
    pauseBtn.textContent = gamePaused ? 'Resume' : 'Pause';
    gameStatusDisplay.textContent = gamePaused ? 'PAUSED' : '';
}

function generateFood() {
    let newFood;
    let validPosition = false;
    
    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        validPosition = !snake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    
    food = newFood;
}

function update() {
    if (!gameRunning || gamePaused) return;
    
    direction = nextDirection;
    
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreDisplay.textContent = score;
        generateFood();
    } else {
        snake.pop();
    }
}

function endGame() {
    gameRunning = false;
    gameOver = true;
    gameStatusDisplay.textContent = `GAME OVER! Final Score: ${score}`;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
    
    startBtn.textContent = 'Play Again';
    pauseBtn.disabled = true;
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
        } else {
            // Body
            ctx.fillStyle = '#00cc00';
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
    });
    ctx.shadowBlur = 0;
    
    // Draw food
    ctx.fillStyle = '#ff4444';
    ctx.shadowColor = '#ff4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 100);
}

// Event listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
pauseBtn.disabled = true;

// Start the game loop
gameLoop();
