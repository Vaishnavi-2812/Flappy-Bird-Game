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

// Load the bird image (Requires red-bird.png file)
const birdImage = new Image();
birdImage.src = 'red-bird.png'; 
birdImage.onerror = () => {
    console.error('❌ ERROR: Failed to load red-bird.png. Check file name and path.');
};

// Bird Object (using width/height for image drawing)
const bird = {
    x: 50,
    y: canvas.height / 2,
    width: 34, // Sprite size
    height: 24, // Sprite size
    velocity: 0,
    selectedBird: 'red' // Tracks current setting
};

// Pipe Array
let pipes = [];
let pipeGap = 150;
let pipeWidth = 50;
let frames = 0; // Game frames counter

// --- Requirement 2: Bird Selection Logic (Changing Physics Effect) ---

function applyBirdEffect(birdType) {
    bird.selectedBird = birdType;
    
    switch (birdType) {
        case 'red':
            // Red Bird: Fast fall (more difficult)
            gravity = 0.3;
            jumpVelocity = -4; 
            break;
        case 'blue':
            // Blue Bird: Slow fall (easier)
            gravity = 0.15;
            jumpVelocity = -3.5; // Slightly weaker jump for the "easier" feel
            break;
        case 'yellow':
        default:
            // Default Bird: Normal physics
            gravity = 0.2;
            jumpVelocity = -4;
            break;
    }
}

// Event Listeners
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);
document.getElementById('optionsButton').addEventListener('click', showOptions);
document.getElementById('saveOptionsButton').addEventListener('click', saveOptions);

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

    gameLoop();
}

function showOptions() {
    startScreen.classList.add('hidden');
    optionsMenu.classList.remove('hidden');
}

function saveOptions() {
    applyBirdEffect(birdSelector.value); 
    
    optionsMenu.classList.add('hidden');
    startScreen.classList.remove('hidden');
}

function drawBird() {
    // Draws the bird image, centering it around the bird's (x, y) coordinates
    ctx.drawImage(
        birdImage, 
        bird.x - bird.width / 2, // Top-left X
        bird.y - bird.height / 2, // Top-left Y
        bird.width, 
        bird.height
    );
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

    // 2. Add New Pipes
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

    // 3. Move and Score Pipes
    pipes.forEach(p => {
        p.x -= 2; // Pipe speed
        if (p.x + pipeWidth < 0) {
            pipes.shift(); // Remove off-screen pipes
        }
        
        // 🟢 Score Audio (Requirement 1)
        if (p.x + pipeWidth < bird.x && !p.passed) {
            score++;
            p.passed = true;
            scoreAudio.currentTime = 0; 
            scoreAudio.play().catch(e => console.log("Audio skipped or failed to play: " + e)); // Add catch for auto-play errors
        }
    });

    // 4. Collision Detection
    if (checkCollision()) {
        endGame();
        return; 
    }

    // 5. Ground/Ceiling Collision
    if (bird.y + bird.height / 2 > canvas.height || bird.y - bird.height / 2 < 0) {
        endGame();
        return; 
    }

    frames++;
}

function checkCollision() {
    for (const p of pipes) {
        // Bird Bounding Box
        const birdLeft = bird.x - bird.width / 2;
        const birdRight = bird.x + bird.width / 2;
        const birdTop = bird.y - bird.height / 2;
        const birdBottom = bird.y + bird.height / 2;

        // Pipe Bounding Box
        const pipeLeft = p.x;
        const pipeRight = p.x + pipeWidth;
        const pipeTopHeight = p.height; 
        const pipeBottomY = p.height + pipeGap; 

        // Check for horizontal overlap
        const isXOverlap = birdRight > pipeLeft && birdLeft < pipeRight;
        
        if (isXOverlap) {
            // Collision with top pipe OR bottom pipe
            const isTopCollision = birdTop < pipeTopHeight;
            const isBottomCollision = birdBottom > pipeBottomY;

            if (isTopCollision || isBottomCollision) {
                return true;
            }
        }
    }
    return false;
}

function endGame() {
    gameRunning = false;
    // 🟢 Game Over Audio (Requirement 1)
    gameOverAudio.currentTime = 0; 
    gameOverAudio.play().catch(e => console.log("Audio skipped or failed to play: " + e));
    
    document.getElementById('finalScore').textContent = score;
    gameOverScreen.classList.remove('hidden');
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    drawPipes();
    // Only draw the bird if the image is loaded
    if (birdImage.complete && birdImage.naturalHeight !== 0) {
        drawBird(); 
    }

    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText('Score: ' + score, 10, 40);
}

// --- Main Game Loop ---
function gameLoop() {
    if (gameRunning) {
        updateGame();
        draw();
        requestAnimationFrame(gameLoop);
    }
}