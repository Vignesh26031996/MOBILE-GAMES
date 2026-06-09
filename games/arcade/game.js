// Vector Runner Logic
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new VectorRenderer('game-canvas');
    const scoreSpan = document.getElementById('score');
    const finalScoreSpan = document.getElementById('final-score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartBtn = document.getElementById('restart-btn');

    let gameLoop;
    let isGameOver = false;
    let score = 0;
    let frame = 0;

    // Game Entities
    let player = {
        x: 100,
        y: window.innerHeight / 2,
        vy: 0,
        radius: 15,
        color: '#45f3ff', // neon blue
        gravity: 0.6,
        jumpPower: -10,
        shape: [
            {x: 20, y: 0},
            {x: -15, y: -15},
            {x: -5, y: 0},
            {x: -15, y: 15}
        ]
    };

    let obstacles = [];
    let particles = [];

    function initGame() {
        isGameOver = false;
        score = 0;
        frame = 0;
        player.y = window.innerHeight / 2;
        player.vy = 0;
        obstacles = [];
        particles = [];
        gameOverScreen.style.display = 'none';
        scoreSpan.innerText = score;
        loop();
    }

    function jump() {
        if (isGameOver) return;
        player.vy = player.jumpPower;
        createParticles(player.x - 10, player.y, 5, player.color);
    }

    // Input handlers for mobile tap / desktop click / spacebar
    window.addEventListener('touchstart', jump);
    window.addEventListener('mousedown', jump);
    window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') jump();
    });

    restartBtn.addEventListener('click', () => {
        // Show Ad before restarting
        if (window.AdManager) {
            AdManager.showInterstitial(() => {
                initGame();
            });
        } else {
            initGame();
        }
    });

    function createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                life: 1,
                color: color
            });
        }
    }

    function update() {
        if (isGameOver) return;
        frame++;

        // Player physics
        player.vy += player.gravity;
        player.y += player.vy;

        // Floor/ceiling collision
        if (player.y > renderer.canvas.height || player.y < 0) {
            triggerGameOver();
        }

        // Spawn obstacles
        if (frame % 80 === 0) {
            let height = 50 + Math.random() * 100;
            let y = Math.random() > 0.5 ? 0 : renderer.canvas.height - height;
            let isTop = y === 0;
            
            obstacles.push({
                x: renderer.canvas.width + 50,
                y: isTop ? 0 : renderer.canvas.height,
                width: 30,
                height: height,
                color: '#ff2a7a', // neon pink
                isTop: isTop,
                speed: 6 + (score * 0.1) // Gets faster
            });
        }

        // Update obstacles
        for (let i = obstacles.length - 1; i >= 0; i--) {
            let obs = obstacles[i];
            obs.x -= obs.speed;

            // Collision Detection
            let rectX = obs.x - obs.width / 2;
            let rectY = obs.isTop ? 0 : renderer.canvas.height - obs.height;

            if (player.x + player.radius > rectX && 
                player.x - player.radius < rectX + obs.width &&
                ((obs.isTop && player.y - player.radius < obs.height) || 
                 (!obs.isTop && player.y + player.radius > rectY))) {
                triggerGameOver();
            }

            if (obs.x < -100) {
                obstacles.splice(i, 1);
                score++;
                scoreSpan.innerText = score;
            }
        }

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function draw() {
        renderer.clear();

        // Draw Player
        let angle = Math.min(Math.max(player.vy * 0.05, -0.5), 0.5);
        renderer.drawPolygon(player.x, player.y, player.shape, player.color, 15, 1, angle);

        // Draw Obstacles
        for (let obs of obstacles) {
            renderer.ctx.fillStyle = obs.color;
            renderer.ctx.shadowBlur = 15;
            renderer.ctx.shadowColor = obs.color;
            let rectY = obs.isTop ? 0 : renderer.canvas.height - obs.height;
            renderer.ctx.fillRect(obs.x - obs.width/2, rectY, obs.width, obs.height);
            // Reset shadow
            renderer.ctx.shadowBlur = 0;
        }

        // Draw Particles
        for (let p of particles) {
            renderer.ctx.fillStyle = p.color;
            renderer.ctx.globalAlpha = p.life;
            renderer.ctx.beginPath();
            renderer.ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            renderer.ctx.fill();
        }
        renderer.ctx.globalAlpha = 1.0;
    }

    function triggerGameOver() {
        isGameOver = true;
        createParticles(player.x, player.y, 30, player.color);
        finalScoreSpan.innerText = score;
        
        // Brief delay before showing screen
        setTimeout(() => {
            gameOverScreen.style.display = 'flex';
        }, 1000);
    }

    function loop() {
        update();
        draw();
        if (!isGameOver || particles.length > 0) {
            gameLoop = requestAnimationFrame(loop);
        }
    }

    initGame();
});
