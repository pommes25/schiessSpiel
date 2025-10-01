const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const robot = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    w: 40,
    h: 40,
    color: '#0ff',
    speed: 5,
    dx: 0,
    dy: 0
};

const bullets = [];
const horses = [];
let score = 0;
let gameOver = false;
let horsesSpawned = 0;
let horsesTotal = 20;

function drawRobot() {
    ctx.fillStyle = robot.color;
    ctx.fillRect(robot.x, robot.y, robot.w, robot.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(robot.x + 10, robot.y + 10, 20, 20); // Kopf
}

function drawBullet(bullet) {
    ctx.fillStyle = '#ff0';
    ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
}

function drawHorse(horse) {
    ctx.fillStyle = '#a52a2a';
    ctx.fillRect(horse.x, horse.y, horse.w, horse.h);
    ctx.fillStyle = '#fff';
    ctx.fillRect(horse.x + 5, horse.y + 5, 20, 10); // Kopf
}

function spawnHorse() {
    if (horsesSpawned < horsesTotal) {
        const x = Math.random() * (canvas.width - 30);
        horses.push({ x, y: -30, w: 30, h: 30, speed: 0.5 + Math.random() * 0.7 });
        horsesSpawned++;
    }
}

function update() {
    if (gameOver) return;
    robot.x += robot.dx;
    robot.y += robot.dy;
    robot.x = Math.max(0, Math.min(canvas.width - robot.w, robot.x));
    robot.y = Math.max(0, Math.min(canvas.height - robot.h, robot.y));

    bullets.forEach((b, i) => {
        b.y -= b.speed;
        if (b.y < 0) bullets.splice(i, 1);
    });

    horses.forEach((h, hi) => {
        h.y += h.speed;
        if (h.y > canvas.height) horses.splice(hi, 1);
        bullets.forEach((b, bi) => {
            if (
                b.x < h.x + h.w &&
                b.x + b.w > h.x &&
                b.y < h.y + h.h &&
                b.y + b.h > h.y
            ) {
                horses.splice(hi, 1);
                bullets.splice(bi, 1);
                score++;
            }
        });
        if (
            robot.x < h.x + h.w &&
            robot.x + robot.w > h.x &&
            robot.y < h.y + h.h &&
            robot.y + robot.h > h.y
        ) {
            gameOver = true;
        }
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRobot();
    bullets.forEach(drawBullet);
    horses.forEach(drawHorse);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);
    if (gameOver) {
        ctx.fillStyle = '#f00';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', canvas.width / 2 - 100, canvas.height / 2);
    }
}

function gameLoop() {
    update();
    draw();
    if (!gameOver) requestAnimationFrame(gameLoop);
}

setInterval(() => {
    if (!gameOver && Math.random() < 0.7) spawnHorse();
}, 1000);

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft' || e.key === 'a') robot.dx = -robot.speed;
    if (e.key === 'ArrowRight' || e.key === 'd') robot.dx = robot.speed;
    if (e.key === 'ArrowUp' || e.key === 'w') robot.dy = -robot.speed;
    if (e.key === 'ArrowDown' || e.key === 's') robot.dy = robot.speed;
    if (e.key === ' ' && !gameOver) {
        bullets.push({ x: robot.x + robot.w / 2 - 15, y: robot.y, w: 30, h: 30, speed: 8 }); // größere Schussfläche
    }
});
document.addEventListener('keyup', e => {
    if (["ArrowLeft", "a", "ArrowRight", "d"].includes(e.key)) robot.dx = 0;
    if (["ArrowUp", "w", "ArrowDown", "s"].includes(e.key)) robot.dy = 0;
});

// Touch-Steuerung für Handy
canvas.addEventListener('touchstart', function(e) {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const tx = touch.clientX - rect.left;
    const ty = touch.clientY - rect.top;
    // Schießen, wenn auf Roboter getippt
    if (
        tx > robot.x && tx < robot.x + robot.w &&
        ty > robot.y && ty < robot.y + robot.h
    ) {
        bullets.push({ x: robot.x + robot.w / 2 - 15, y: robot.y, w: 30, h: 30, speed: 8 }); // größere Schussfläche
    } else {
        // Bewegung: Roboter zur Touch-Position bewegen
        robot.x = tx - robot.w / 2;
        robot.y = ty - robot.h / 2;
    }
});

gameLoop();
