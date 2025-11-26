const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;

let bird = { x: 50, y: 250, width: 30, height: 30, gravity: 0, jump: -6 };
let pipeWidth = 60;
let pipeGap = 150;
let pipeX = 400;
let pipeY = Math.floor(Math.random() * 300) + 50;

let gameOver = false;

function drawBird() {
    ctx.fillStyle = "red";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = "green";
    // top pipe
    ctx.fillRect(pipeX, 0, pipeWidth, pipeY);

    // bottom pipe
    ctx.fillRect(pipeX, pipeY + pipeGap, pipeWidth, canvas.height);
}

function update() {
    if (!gameOver) {
        // Bird gravity
        bird.gravity += 0.3;
        bird.y += bird.gravity;

        // Move pipes
        pipeX -= 3;

        // Reset pipes
        if (pipeX < -pipeWidth) {
            pipeX = canvas.width;
            pipeY = Math.floor(Math.random() * 300) + 50;
        }

        // Collision detection
        if (
            bird.y + bird.height > canvas.height ||
            bird.y < 0 ||
            (bird.x + bird.width > pipeX &&
                bird.x < pipeX + pipeWidth &&
                (bird.y < pipeY || bird.y + bird.height > pipeY + pipeGap))
        ) {
            gameOver = true;
        }
    }

    // Clear screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();

    if (gameOver) {
        ctx.fillStyle = "black";
        ctx.font = "40px Arial";
        ctx.fillText("GAME OVER", 80, 300);
    }

    requestAnimationFrame(update);
}

document.addEventListener("keydown", () => {
    if (!gameOver) {
        bird.gravity = bird.jump;
    } else {
        // restart
        bird.y = 250;
        bird.gravity = 0;
        pipeX = 400;
        gameOver = false;
    }
});

update();
