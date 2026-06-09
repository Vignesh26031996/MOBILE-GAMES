// Simple logic for the Hub page
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Ads and Revenue Manager on the hub
    if (window.AdManager) {
        AdManager.updateRevenueDisplay();

        const clickAdBtn = document.getElementById('click-ad-btn');
        if (clickAdBtn) {
            clickAdBtn.addEventListener('click', () => {
                AdManager.simulateAdClick(0.15); // Add $0.15 for banner click
                // Show floating money effect
                showFloatingText('+$0.15', clickAdBtn);
            });
        }
    }
});

function showFloatingText(text, targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const floating = document.createElement('div');
    floating.textContent = text;
    floating.style.position = 'absolute';
    floating.style.left = (rect.left + rect.width / 2) + 'px';
    floating.style.top = rect.top + 'px';
    floating.style.color = '#39ff14'; // neon green
    floating.style.fontWeight = 'bold';
    floating.style.fontSize = '1.2rem';
    floating.style.pointerEvents = 'none';
    floating.style.transition = 'all 1s ease-out';
    floating.style.transform = 'translate(-50%, 0)';
    floating.style.zIndex = '1000';
    floating.style.textShadow = '0 0 5px #39ff14';
    
    document.body.appendChild(floating);

    // Animate up and fade out
    setTimeout(() => {
        floating.style.transform = 'translate(-50%, -50px)';
        floating.style.opacity = '0';
    }, 50);

    setTimeout(() => {
        floating.remove();
    }, 1000);
}
