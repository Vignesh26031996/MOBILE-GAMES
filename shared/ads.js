// shared/ads.js
class AdManagerClass {
    constructor() {
        this.revenue = parseFloat(localStorage.getItem('vectorPlayRevenue')) || 0;
        this.interstitialContainer = null;
    }

    // Call this to update the UI
    updateRevenueDisplay() {
        const display = document.getElementById('revenue-amount');
        if (display) {
            display.textContent = this.revenue.toFixed(2);
        }
        localStorage.setItem('vectorPlayRevenue', this.revenue.toString());
    }

    // Simulate clicking an ad and earning money
    simulateAdClick(amount = 0.05) {
        this.revenue += amount;
        this.updateRevenueDisplay();
        console.log(`Earned $${amount}. Total: $${this.revenue}`);
    }

    // Show a full screen interstitial ad
    showInterstitial(onComplete) {
        if (!this.interstitialContainer) {
            this._createInterstitialUI();
        }

        this.interstitialContainer.style.display = 'flex';
        
        // Auto-close after 5 seconds to simulate ad duration, or user can close early and earn less
        const autoClose = setTimeout(() => {
            this.closeInterstitial();
            this.simulateAdClick(0.50); // High reward for watching full ad
            if (onComplete) onComplete();
        }, 5000);

        this.interstitialContainer.querySelector('.close-ad-btn').onclick = () => {
            clearTimeout(autoClose);
            this.closeInterstitial();
            this.simulateAdClick(0.10); // Low reward for skipping
            if (onComplete) onComplete();
        };
    }

    closeInterstitial() {
        if (this.interstitialContainer) {
            this.interstitialContainer.style.display = 'none';
        }
    }

    _createInterstitialUI() {
        const adDiv = document.createElement('div');
        adDiv.className = 'interstitial-ad';
        adDiv.innerHTML = `
            <div class="interstitial-content">
                <h2 style="color:var(--neon-pink); margin-bottom:1rem;">PREMIUM AD</h2>
                <p>Support the developer! Watch this ad to continue playing.</p>
                <div style="font-size: 3rem; margin: 1rem 0;">📺</div>
                <button class="close-ad-btn">Skip Ad >></button>
            </div>
        `;
        document.body.appendChild(adDiv);
        this.interstitialContainer = adDiv;
    }
}

// Global instance
window.AdManager = new AdManagerClass();
