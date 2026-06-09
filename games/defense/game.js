// Vector Defense Logic
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new VectorRenderer('game-canvas');
    const moneySpan = document.getElementById('money');
    const healthSpan = document.getElementById('health');
    const finalWaveSpan = document.getElementById('final-wave');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartBtn = document.getElementById('restart-btn');

    let gameLoop;
    let isGameOver = false;
    let money = 150;
    let health = 20;
    let wave = 1;
    let frame = 0;

    let path = [];
    let enemies = [];
    let towers = [];
    let lasers = [];

    const TOWER_COST = 50;

    function initGame() {
        isGameOver = false;
        money = 150;
        health = 20;
        wave = 1;
        frame = 0;
        enemies = [];
        towers = [];
        lasers = [];
        
        updateUI();
        generatePath();
        gameOverScreen.style.display = 'none';
        loop();
    }

    function generatePath() {
        path = [];
        const w = renderer.canvas.width;
        const h = renderer.canvas.height;
        path.push({x: -50, y: h * 0.2});
        path.push({x: w * 0.3, y: h * 0.2});
        path.push({x: w * 0.3, y: h * 0.6});
        path.push({x: w * 0.7, y: h * 0.6});
        path.push({x: w * 0.7, y: h * 0.3});
        path.push({x: w + 50, y: h * 0.3});
    }

    function updateUI() {
        moneySpan.innerText = money;
        healthSpan.innerText = health;
    }

    function spawnEnemy() {
        let hp = 10 + (wave * 5);
        enemies.push({
            x: path[0].x,
            y: path[0].y,
            targetIndex: 1,
            speed: 1 + (wave * 0.1),
            maxHp: hp,
            hp: hp,
            radius: 10,
            color: '#ff2a7a' // neon pink
        });
    }

    function buildTower(x, y) {
        if (money >= TOWER_COST) {
            // Check if too close to path
            let tooClose = false;
            for (let i = 0; i < path.length - 1; i++) {
                let p1 = path[i];
                let p2 = path[i+1];
                let dist = distToSegmentSquared({x, y}, p1, p2);
                if (dist < 900) { // 30px
                    tooClose = true;
                    break;
                }
            }
            if (tooClose) return;

            money -= TOWER_COST;
            towers.push({
                x: x,
                y: y,
                range: 100,
                cooldown: 0,
                maxCooldown: 30,
                damage: 5,
                color: '#45f3ff' // neon blue
            });
            updateUI();
        }
    }

    // Math helpers
    function sqr(x) { return x * x; }
    function dist2(v, w) { return sqr(v.x - w.x) + sqr(v.y - w.y); }
    function distToSegmentSquared(p, v, w) {
        var l2 = dist2(v, w);
        if (l2 == 0) return dist2(p, v);
        var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t));
        return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
    }

    window.addEventListener('mousedown', (e) => buildTower(e.clientX, e.clientY));
    window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            buildTower(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, {passive: false});

    restartBtn.addEventListener('click', () => {
        if (window.AdManager) {
            AdManager.showInterstitial(() => { initGame(); });
        } else {
            initGame();
        }
    });

    function update() {
        if (isGameOver) return;
        frame++;

        // Wave logic
        if (frame % 60 === 0 && Math.random() < 0.5) {
            spawnEnemy();
        }
        if (frame % 600 === 0) {
            wave++;
        }

        // Move enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            let e = enemies[i];
            let target = path[e.targetIndex];
            if (!target) continue;

            let dx = target.x - e.x;
            let dy = target.y - e.y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            
            if (dist < e.speed) {
                e.x = target.x;
                e.y = target.y;
                e.targetIndex++;
                if (e.targetIndex >= path.length) {
                    health--;
                    enemies.splice(i, 1);
                    updateUI();
                    if (health <= 0) {
                        isGameOver = true;
                        finalWaveSpan.innerText = wave;
                        gameOverScreen.style.display = 'flex';
                    }
                }
            } else {
                e.x += (dx / dist) * e.speed;
                e.y += (dy / dist) * e.speed;
            }
        }

        // Towers logic
        lasers = [];
        for (let t of towers) {
            if (t.cooldown > 0) t.cooldown--;
            else {
                // Find target
                let target = null;
                let minDist = t.range;
                for (let e of enemies) {
                    let d = Math.sqrt(sqr(e.x - t.x) + sqr(e.y - t.y));
                    if (d < minDist) {
                        minDist = d;
                        target = e;
                    }
                }
                if (target) {
                    target.hp -= t.damage;
                    t.cooldown = t.maxCooldown;
                    lasers.push({ x1: t.x, y1: t.y, x2: target.x, y2: target.y, alpha: 1.0 });
                }
            }
        }

        // Enemy death
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].hp <= 0) {
                enemies.splice(i, 1);
                money += 10;
                updateUI();
            }
        }
    }

    function draw() {
        renderer.clear();

        // Draw path
        renderer.ctx.beginPath();
        renderer.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            renderer.ctx.lineTo(path[i].x, path[i].y);
        }
        renderer.ctx.strokeStyle = '#333'; // faint grey
        renderer.ctx.lineWidth = 40;
        renderer.ctx.lineJoin = 'round';
        renderer.ctx.stroke();

        renderer.ctx.strokeStyle = '#fffb00'; // inner glow line
        renderer.ctx.lineWidth = 2;
        renderer.ctx.shadowBlur = 10;
        renderer.ctx.shadowColor = '#fffb00';
        renderer.ctx.stroke();
        renderer.ctx.shadowBlur = 0;

        // Draw towers
        for (let t of towers) {
            renderer.drawPolygon(t.x, t.y, [
                {x: 0, y: -15}, {x: 10, y: 10}, {x: -10, y: 10}
            ], t.color, 15, 1);
        }

        // Draw enemies
        for (let e of enemies) {
            renderer.drawCircle(e.x, e.y, e.radius, e.color, 10);
            
            // Health bar
            renderer.ctx.fillStyle = 'red';
            renderer.ctx.fillRect(e.x - 10, e.y - 15, 20, 3);
            renderer.ctx.fillStyle = '#39ff14';
            renderer.ctx.fillRect(e.x - 10, e.y - 15, 20 * (e.hp / e.maxHp), 3);
        }

        // Draw lasers
        for (let l of lasers) {
            renderer.ctx.beginPath();
            renderer.ctx.moveTo(l.x1, l.y1);
            renderer.ctx.lineTo(l.x2, l.y2);
            renderer.ctx.strokeStyle = `rgba(69, 243, 255, ${l.alpha})`;
            renderer.ctx.lineWidth = 2;
            renderer.ctx.shadowBlur = 10;
            renderer.ctx.shadowColor = '#45f3ff';
            renderer.ctx.stroke();
            renderer.ctx.shadowBlur = 0;
            l.alpha -= 0.1;
        }
    }

    function loop() {
        update();
        draw();
        if (!isGameOver) {
            gameLoop = requestAnimationFrame(loop);
        }
    }

    // Handle window resize properly for path
    window.addEventListener('resize', () => {
        renderer.resize();
        generatePath();
    });

    initGame();
});
