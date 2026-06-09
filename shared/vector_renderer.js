// shared/vector_renderer.js
class VectorRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.error(`Canvas with id ${canvasId} not found.`);
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Set canvas to full window size for mobile games
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    clear() {
        this.ctx.fillStyle = '#0b0c10'; // Dark background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Helper to draw a glowing polygon
    drawPolygon(x, y, points, color, glowAmount = 10, scale = 1, rotation = 0) {
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.scale(scale, scale);

        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();

        // Neon Glow Effect
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = glowAmount;
        this.ctx.shadowColor = color;
        this.ctx.stroke();
        
        // Inner fill (faint)
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.2;
        this.ctx.fill();
        this.ctx.globalAlpha = 1.0;

        this.ctx.restore();
    }

    drawCircle(x, y, radius, color, glowAmount = 10) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowBlur = glowAmount;
        this.ctx.shadowColor = color;
        this.ctx.stroke();

        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = 0.2;
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawText(text, x, y, size, color, align = 'center') {
        this.ctx.save();
        this.ctx.font = `bold ${size}px 'Segoe UI', sans-serif`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = align;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = color;
        this.ctx.fillText(text, x, y);
        this.ctx.restore();
    }
}

window.VectorRenderer = VectorRenderer;
