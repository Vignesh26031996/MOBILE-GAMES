// Vector Connect Logic
document.addEventListener('DOMContentLoaded', () => {
    const renderer = new VectorRenderer('game-canvas');
    const scoreSpan = document.getElementById('score');
    const timeSpan = document.getElementById('time');
    const finalScoreSpan = document.getElementById('final-score');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartBtn = document.getElementById('restart-btn');

    let gameLoop;
    let isGameOver = false;
    let score = 0;
    let timeLeft = 60;
    let lastTime = Date.now();

    const ROWS = 6;
    const COLS = 6;
    const COLORS = ['#45f3ff', '#ff2a7a', '#39ff14', '#fffb00']; // neon colors
    
    let grid = [];
    let cellSize = 0;
    let offsetX = 0;
    let offsetY = 0;

    let isDragging = false;
    let currentPath = []; // Array of {r, c}
    let pointerX = 0;
    let pointerY = 0;

    function initGame() {
        isGameOver = false;
        score = 0;
        timeLeft = 60;
        scoreSpan.innerText = score;
        timeSpan.innerText = timeLeft;
        gameOverScreen.style.display = 'none';
        
        setupGrid();
        lastTime = Date.now();
        loop();
    }

    function setupGrid() {
        // Calculate cell size based on screen width
        let maxGridWidth = Math.min(renderer.canvas.width * 0.9, 500);
        cellSize = maxGridWidth / COLS;
        offsetX = (renderer.canvas.width - maxGridWidth) / 2;
        offsetY = (renderer.canvas.height - (cellSize * ROWS)) / 2;

        grid = [];
        for (let r = 0; r < ROWS; r++) {
            let row = [];
            for (let c = 0; c < COLS; c++) {
                row.push({
                    color: COLORS[Math.floor(Math.random() * COLORS.length)],
                    scale: 0, // for spawn animation
                    targetScale: 1
                });
            }
            grid.push(row);
        }
    }

    function getGridPos(px, py) {
        let c = Math.floor((px - offsetX) / cellSize);
        let r = Math.floor((py - offsetY) / cellSize);
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) return {r, c};
        return null;
    }

    // Input handlers
    function handlePointerDown(e) {
        if (isGameOver) return;
        isDragging = true;
        updatePointer(e);
        let pos = getGridPos(pointerX, pointerY);
        if (pos) {
            currentPath = [pos];
        }
    }

    function handlePointerMove(e) {
        if (!isDragging || isGameOver) return;
        updatePointer(e);
        let pos = getGridPos(pointerX, pointerY);
        if (pos && currentPath.length > 0) {
            let lastPos = currentPath[currentPath.length - 1];
            // Check if adjacent and same color
            if (Math.abs(lastPos.r - pos.r) <= 1 && Math.abs(lastPos.c - pos.c) <= 1) {
                if (!(lastPos.r === pos.r && lastPos.c === pos.c)) {
                    let startColor = grid[currentPath[0].r][currentPath[0].c].color;
                    let targetColor = grid[pos.r][pos.c].color;
                    
                    if (startColor === targetColor) {
                        // Check if not already in path
                        let indexInPath = currentPath.findIndex(p => p.r === pos.r && p.c === pos.c);
                        if (indexInPath === -1) {
                            currentPath.push(pos);
                        } else if (indexInPath === currentPath.length - 2) {
                            // Backtracking
                            currentPath.pop();
                        }
                    }
                }
            }
        }
    }

    function handlePointerUp() {
        if (!isDragging) return;
        isDragging = false;
        
        if (currentPath.length >= 3) {
            // Clear nodes
            score += currentPath.length * 10;
            scoreSpan.innerText = score;
            
            for (let pos of currentPath) {
                grid[pos.r][pos.c] = null; // Mark empty
            }
            
            // Gravity: make nodes fall down
            for (let c = 0; c < COLS; c++) {
                let emptySpaces = 0;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (grid[r][c] === null) {
                        emptySpaces++;
                    } else if (emptySpaces > 0) {
                        grid[r + emptySpaces][c] = grid[r][c];
                        grid[r][c] = null;
                    }
                }
                // Spawn new nodes at top
                for (let r = 0; r < emptySpaces; r++) {
                    grid[r][c] = {
                        color: COLORS[Math.floor(Math.random() * COLORS.length)],
                        scale: 0,
                        targetScale: 1
                    };
                }
            }
        }
        currentPath = [];
    }

    function updatePointer(e) {
        if (e.touches && e.touches.length > 0) {
            pointerX = e.touches[0].clientX;
            pointerY = e.touches[0].clientY;
        } else {
            pointerX = e.clientX;
            pointerY = e.clientY;
        }
    }

    window.addEventListener('touchstart', handlePointerDown, {passive: false});
    window.addEventListener('touchmove', handlePointerMove, {passive: false});
    window.addEventListener('touchend', handlePointerUp);
    
    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    restartBtn.addEventListener('click', () => {
        if (window.AdManager) {
            AdManager.showInterstitial(() => {
                initGame();
            });
        } else {
            initGame();
        }
    });

    function update() {
        if (isGameOver) return;
        
        let now = Date.now();
        if (now - lastTime >= 1000) {
            timeLeft--;
            timeSpan.innerText = timeLeft;
            lastTime = now;
            if (timeLeft <= 0) {
                isGameOver = true;
                finalScoreSpan.innerText = score;
                gameOverScreen.style.display = 'flex';
            }
        }

        // Animate scale
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] && grid[r][c].scale < grid[r][c].targetScale) {
                    grid[r][c].scale += 0.1;
                }
            }
        }
    }

    function draw() {
        renderer.clear();

        // Draw selection path
        if (currentPath.length > 0) {
            renderer.ctx.beginPath();
            let startPos = currentPath[0];
            renderer.ctx.moveTo(offsetX + startPos.c * cellSize + cellSize/2, offsetY + startPos.r * cellSize + cellSize/2);
            for (let i = 1; i < currentPath.length; i++) {
                let pos = currentPath[i];
                renderer.ctx.lineTo(offsetX + pos.c * cellSize + cellSize/2, offsetY + pos.r * cellSize + cellSize/2);
            }
            if (isDragging) {
                renderer.ctx.lineTo(pointerX, pointerY);
            }
            renderer.ctx.strokeStyle = grid[currentPath[0].r][currentPath[0].c].color;
            renderer.ctx.lineWidth = 4;
            renderer.ctx.shadowBlur = 10;
            renderer.ctx.shadowColor = renderer.ctx.strokeStyle;
            renderer.ctx.stroke();
            renderer.ctx.shadowBlur = 0;
        }

        // Draw nodes
        let nodeRadius = cellSize * 0.3;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                let node = grid[r][c];
                if (node) {
                    let cx = offsetX + c * cellSize + cellSize/2;
                    let cy = offsetY + r * cellSize + cellSize/2;
                    let isSelected = currentPath.some(p => p.r === r && p.c === c);
                    let scale = node.scale * (isSelected ? 1.2 : 1.0);
                    renderer.drawCircle(cx, cy, nodeRadius * scale, node.color, isSelected ? 20 : 5);
                }
            }
        }
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
