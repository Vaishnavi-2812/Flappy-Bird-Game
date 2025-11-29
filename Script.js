// --- Game Setup and Variables ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreAudio = document.getElementById('scoreAudio');
const gameOverAudio = document.getElementById('gameOverAudio');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const optionsMenu = document.getElementById('options-menu');
const birdSelector = document.getElementById('birdSelector');

let gameRunning = false;
let score = 0;
let gravity = 0.2; // Default gravity
let jumpVelocity = -4; // Default jump power

// Bird Object
const bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 15,
    velocity: 0,
    selectedBird: 'yellow',
    color: 'yellow' // Default bird color
};

// Pipe Array
let pipes = [];
let pipeGap = 150;
let pipeWidth = 50;
let frames = 0; // Game frames counter

// --- Requirement 2: Bird Selection Logic ---

function applyBirdEffect(birdType) {
    bird.selectedBird = birdType;
    // Apply game-affecting changes (The "effective" part)
    switch (birdType) {
        case 'red':
            // Red Bird: Fast fall (more difficult)
            gravity = 0.3;
            bird.color = 'red';
            break;
        case 'blue':
            // Blue Bird: Slow fall (easier)
            gravity = 0.15;
            bird.color = 'blue';
            break;
        case 'yellow':
        default:
            // Default Yellow Bird
            gravity = 0.2;
            bird.color = 'yellow';
            break;
    }
}

// Event listeners for UI
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);
document.getElementById('optionsButton').addEventListener('click', showOptions);
document.getElementById('saveOptionsButton').addEventListener('click', saveOptions);

// Keyboard/Tap listeners for game control
document.addEventListener('keydown', handleInput);
canvas.addEventListener('click', jump);

function handleInput(e) {
    if (e.code === 'Space' && gameRunning) {
        jump();
    }
}

function jump() {
    if (gameRunning) {
        bird.velocity = jumpVelocity;
    }
}

// --- Game Functions ---

function startGame() {
    // Apply currently selected bird's effect
    applyBirdEffect(birdSelector.value); 

    score = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    frames = 0;
    gameRunning = true;
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    optionsMenu.classList.add('hidden');

    // Start the game loop
    gameLoop();
}

function showOptions() {
    startScreen.classList.add('hidden');
    optionsMenu.classList.remove('hidden');
}

function saveOptions() {
    // Get the selected value and apply its effect immediately
    applyBirdEffect(birdSelector.value); 
    
    // Go back to start screen
    optionsMenu.classList.add('hidden');
    startScreen.classList.remove('hidden');
}


function drawBird() {
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = bird.color; // Use selected color
    ctx.fill();
    ctx.closePath();
}

function drawPipes() {
    ctx.fillStyle = 'green';
    ctx.strokeStyle = '#000';
    pipes.forEach(p => {
        // Top pipe
        ctx.fillRect(p.x, 0, pipeWidth, p.height);
        ctx.strokeRect(p.x, 0, pipeWidth, p.height);
        // Bottom pipe
        const bottomY = p.height + pipeGap;
        ctx.fillRect(p.x, bottomY, pipeWidth, canvas.height - bottomY);
        ctx.strokeRect(p.x, bottomY, pipeWidth, canvas.height - bottomY);
    });
}

function updateGame() {
    // 1. Bird Physics
    bird.velocity += gravity;
    bird.y += bird.velocity;

    // 2. Add New Pipes (e.g., every 90 frames)
    if (frames % 90 === 0) {
        const minHeight = 50;
        const maxHeight = canvas.height - pipeGap - minHeight;
        const pipeHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        pipes.push({ 
            x: canvas.width, 
            height: pipeHeight, 
            passed: false 
        });
    }

    // 3. Move and Clean Pipes
    pipes.forEach(p => {
        p.x -= 2; // Pipe speed
        // Remove pipes that move off-screen
        if (p.x + pipeWidth < 0) {
            pipes.shift();
        }
        
        // Check for score (Requirement 1: Score Audio)
        if (p.x + pipeWidth < bird.x && !p.passed) {
            score++;
            p.passed = true;
            scoreAudio.currentTime = 0; // Rewind to play immediately
            scoreAudio.play();
        }
    });

    // 4. Collision Detection
    if (checkCollision()) {
        endGame();
        return; // Stop updating
    }

    // 5. Keep bird on screen (Ground/Ceiling collision)
    if (bird.y + bird.radius > canvas.height || bird.y - bird.radius < 0) {
        endGame();
        return; // Stop updating
    }

    frames++;
}

function checkCollision() {
    for (const p of pipes) {
        // Basic rectangular collision check for simplicity
        const isXOverlap = bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + pipeWidth;
        
        // Check collision with top pipe OR bottom pipe
        if (isXOverlap) {
            const isTopCollision = bird.y - bird.radius < p.height;
            const isBottomCollision = bird.y + bird.radius > p.height + pipeGap;

            if (isTopCollision || isBottomCollision) {
                return true;
            }
        }
    }
    return false;
}

function endGame() {
    gameRunning = false;
    // Requirement 1: Game Over Audio
    gameOverAudio.currentTime = 0; 
    gameOverAudio.play();
    
    document.getElementById('finalScore').textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawPipes();
    drawBird();

    // Draw Score
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, 10, 40);
}

// --- Main Game Loop ---
function gameLoop() {
    if (gameRunning) {
        updateGame();
        draw();
        requestAnimationFrame(gameLoop); // Smoother animation
    }
}