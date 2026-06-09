// Vector Jump Logic
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new VectorRenderer('game-canvas');
    const scoreSpan = document.getElementById('score');
    const finalScoreSpan = document.getElementById('final-score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartBtn = document.getElementById('restart-btn');

    let gameLoop;
    let isGameOver = false;
    let score = 0;

    let player = {
        x: renderer.canvas.width / 2,
        y: renderer.canvas.height / 2,
        vx: 0,
        vy: 0,
        radius: 12,
        color: '#39ff14', // neon green
        gravity: 0.4,
        jumpPower: -12,
        speed: 6
    };

    let platforms = [];
    let movingLeft = false;
    let movingRight = false;
    let cameraY = 0;

    function initGame() {
        isGameOver = false;
        score = 0;
        scoreSpan.innerText = score;
        
        player.x = renderer.canvas.width / 2;
        player.y = renderer.canvas.height / 2;
        player.vx = 0;
        player.vy = 0;
        cameraY = 0;
        
        platforms = [];
        // Base platform
        platforms.push({ x: renderer.canvas.width / 2, y: renderer.canvas.height - 50, width: renderer.canvas.width, height: 20 });
        
        // Generate initial platforms
        let y = renderer.canvas.height - 150;
        while (y > -1000) {
            platforms.push({
                x: Math.random() * (renderer.canvas.width - 80) + 40,
                y: y,
                width: 80,
                height: 15
            });
            y -= Math.random() * 80 + 50;
        }

        gameOverScreen.style.display = 'none';
        loop();
    }

    // Controls
    const zoneLeft = document.getElementById('zone-left');
    const zoneRight = document.getElementById('zone-right');

    const handleLeftDown = (e) => { e.preventDefault(); movingLeft = true; };
    const handleLeftUp = (e) => { e.preventDefault(); movingLeft = false; };
    const handleRightDown = (e) => { e.preventDefault(); movingRight = true; };
    const handleRightUp = (e) => { e.preventDefault(); movingRight = false; };

    zoneLeft.addEventListener('touchstart', handleLeftDown);
    zoneLeft.addEventListener('touchend', handleLeftUp);
    zoneLeft.addEventListener('mousedown', handleLeftDown);
    zoneLeft.addEventListener('mouseup', handleLeftUp);
    zoneLeft.addEventListener('mouseleave', handleLeftUp);

    zoneRight.addEventListener('touchstart', handleRightDown);
    zoneRight.addEventListener('touchend', handleRightUp);
    zoneRight.addEventListener('mousedown', handleRightDown);
    zoneRight.addEventListener('mouseup', handleRightUp);
    zoneRight.addEventListener('mouseleave', handleRightUp);

    // Keyboard fallback
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') movingLeft = true;
        if (e.key === 'ArrowRight' || e.key === 'd') movingRight = true;
    });
    window.addEventListener('keyup', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a') movingLeft = false;
        if (e.key === 'ArrowRight' || e.key === 'd') movingRight = false;
    });

    restartBtn.addEventListener('click', () => {
        if (window.AdManager) {
            AdManager.showInterstitial(() => { initGame(); });
        } else {
            initGame();
        }
    });

    function update() {
        if (isGameOver) return;

        // Player physics
        if (movingLeft) player.vx = -player.speed;
        else if (movingRight) player.vx = player.speed;
        else player.vx = 0;

        player.x += player.vx;
        player.vy += player.gravity;
        player.y += player.vy;

        // Screen wrap
        if (player.x < 0) player.x = renderer.canvas.width;
        if (player.x > renderer.canvas.width) player.x = 0;

        // Camera scroll
        if (player.y < renderer.canvas.height / 2) {
            let diff = (renderer.canvas.height / 2) - player.y;
            player.y = renderer.canvas.height / 2;
            cameraY += diff;
            score += Math.floor(diff);
            scoreSpan.innerText = score;
            
            // Move platforms down
            for (let p of platforms) {
                p.y += diff;
            }
        }

        // Platform collision
        if (player.vy > 0) { // Only checking when falling down
            for (let p of platforms) {
                if (player.x > p.x - p.width/2 && player.x < p.x + p.width/2 &&
                    player.y + player.radius > p.y - p.height/2 && 
                    player.y + player.radius < p.y + p.height/2 + player.vy) {
                    // Bounce
                    player.vy = player.jumpPower;
                    // Highlight platform
                    p.hit = 10;
                    break;
                }
            }
        }

        // Remove offscreen platforms and add new ones
        for (let i = platforms.length - 1; i >= 0; i--) {
            if (platforms[i].y > renderer.canvas.height + 50) {
                platforms.splice(i, 1);
                
                // Spawn new platform above the highest one
                let highestY = platforms.reduce((min, p) => Math.min(min, p.y), renderer.canvas.height);
                platforms.push({
                    x: Math.random() * (renderer.canvas.width - 80) + 40,
                    y: highestY - (Math.random() * 80 + 50),
                    width: 80 - Math.min(40, score * 0.005), // Platforms get smaller
                    height: 15
                });
            }
        }

        // Game Over
        if (player.y > renderer.canvas.height + 100) {
            isGameOver = true;
            finalScoreSpan.innerText = score;
            gameOverScreen.style.display = 'flex';
        }
    }

    function draw() {
        renderer.clear();

        // Draw Platforms
        for (let p of platforms) {
            renderer.ctx.fillStyle = '#0b0c10';
            renderer.ctx.strokeStyle = p.hit ? '#fff' : '#45f3ff';
            if (p.hit) p.hit--;
            
            renderer.ctx.lineWidth = 2;
            renderer.ctx.shadowBlur = p.hit ? 20 : 10;
            renderer.ctx.shadowColor = renderer.ctx.strokeStyle;
            
            renderer.ctx.beginPath();
            renderer.ctx.rect(p.x - p.width/2, p.y - p.height/2, p.width, p.height);
            renderer.ctx.stroke();
            renderer.ctx.fill();
        }

        // Reset shadow
        renderer.ctx.shadowBlur = 0;

        // Draw Player
        renderer.drawCircle(player.x, player.y, player.radius, player.color, 15);
    }

    function loop() {
        update();
        draw();
        if (!isGameOver) {
            gameLoop = requestAnimationFrame(loop);
        }
    }

    initGame();
});
