const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const retryBtn = document.getElementById("retryBtn");

// SOUND ELEMENTS
const jumpSound = document.getElementById("jumpSound");
const gameOverSound = document.getElementById("gameOverSound");
const pointSound = document.getElementById("pointSound");

canvas.width = 400;
canvas.height = 600;

let birdColor = "red";
let score = 0;

let bird, pipeX, pipeY, pipeWidth, pipeGap, gameOver;

function resetValues() {
    bird = { x: 50, y: 250, width: 30, height: 30, gravity: 0, jump: -6 };
    pipeWidth = 60;
    pipeGap = 150;
    pipeX = 400;
    pipeY = Math.floor(Math.random() * 300) + 50;
    gameOver = false;
    score = 0;

    retryBtn.style.display = "none";
}

resetValues();

function drawBird() {
    ctx.fillStyle = birdColor;
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = "green";
    ctx.fillRect(pipeX, 0, pipeWidth, pipeY);
    ctx.fillRect(pipeX, pipeY + pipeGap, pipeWidth, canvas.height);
}

function update() {
    if (!gameOver) {
        bird.gravity += 0.3;
        bird.y += bird.gravity;

        pipeX -= 3;

        if (pipeX < -pipeWidth) {
            pipeX = canvas.width;
            pipeY = Math.floor(Math.random() * 300) + 50;

            score++;
            pointSound.play();  // play score sound
        }

        if (
            bird.y + bird.height > canvas.height ||
            bird.y < 0 ||
            (bird.x + bird.width > pipeX &&
             bird.x < pipeX + pipeWidth &&
             (bird.y < pipeY || bird.y + bird.height > pipeY + pipeGap))
        ) {
            gameOver = true;
            retryBtn.style.display = "block";
            gameOverSound.play();     // GAME OVER SOUND
        }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();

    // SCORE DISPLAY
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("Score: " + score, 10, 40);

    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", 80, 290);
    }

    requestAnimationFrame(update);
}

document.addEventListener("keydown", () => {
    if (!gameOver) {
        bird.gravity = bird.jump;
        jumpSound.play();  // jump sound
    }
});

// Restart Game
function restartGame() {
    resetValues();
}

// SETTINGS
function openSettings() {
    document.getElementById("settingsPopup").style.display = "block";
}

function closeSettings() {
    document.getElementById("settingsPopup").style.display = "none";
}

function changeBirdColor(color) {
    birdColor = color;
}

update();
