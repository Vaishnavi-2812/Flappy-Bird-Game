const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 400;
canvas.height = 600;

let birdImg = new Image();
// YOUR BIRD IMAGE (base64)
birdImg.src = "data:image/webp;base64,UklGRlQdAABXRUJQVlA4IEgdAADQcACdASoEARgBPjEYikMiIaEUOezgIAMEpu/HyZjuWZL/t/48eExZnrP5A/lJ8xdYfrH3z/rP";

// Game variables
let birdX = 50;
let birdY = 150;
let velocity = 0;
let gravity = 1.3;
let gap = 140;
let pipes = [];
let score = 0;
let gameOver = false;

pipes.push({ x: 400, top: Math.random() * 250 + 50 });

function drawBird() {
    ctx.drawImage(birdImg, birdX, birdY, 45, 45);
}

function drawPipes() {
    ctx.fillStyle = "green";
    pipes.forEach(pipe => {
        ctx.fillRect(pipe.x, 0, 60, pipe.top);
        ctx.fillRect(pipe.x, pipe.top + gap, 60, canvas.height - pipe.top - gap);
    });
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();

    velocity += gravity;
    birdY += velocity;

    pipes.forEach(pipe => {
        pipe.x -= 1; // SLOW PIPE SPEED ONLY

        if (pipe.x < -60) {
            pipe.x = canvas.width;
            pipe.top = Math.random() * 250 + 50;
            score++;
        }

        if (
            birdX + 45 > pipe.x &&
            birdX < pipe.x + 60 &&
            (birdY < pipe.top || birdY + 45 > pipe.top + gap)
        ) {
            endGame();
        }
    });

    if (birdY + 45 > canvas.height || birdY < 0) {
        endGame();
    }

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameOver = true;

    ctx.fillStyle = "black";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over!", 110, 260);

    document.getElementById("retryBtn").style.display = "block";
}

function restartGame() {
    location.reload();
}

window.addEventListener("keydown", () => {
    if (!gameOver) velocity = -12;
});

window.addEventListener("mousedown", () => {
    if (!gameOver) velocity = -12;
});

gameLoop();
