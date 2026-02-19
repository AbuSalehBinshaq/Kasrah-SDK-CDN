/**
 * Kasrah Games SDK v3.1.0 (CDN Version)
 * Official SDK for Kasrah Games Platform
 * 
 * Features:
 * - Auto-detection of API URL and Game ID
 * - Real Ad Rendering System (UI/UX)
 * - Cloud Save & Data Sync with Main Site
 * - Zero dependency, lightweight, and secure
 */

(function() {
    const SDK_VERSION = "3.1.0";
    const DEFAULT_API_URL = "https://kasrah-games.onrender.com";
    
    class KasrahSDK {
        constructor() {
            this.apiUrl = DEFAULT_API_URL;
            this.gameId = null;
            this.isInitialized = false;
            this.adContainer = null;
            this.playerData = {};
            
            console.log(`%c Kasrah SDK v${SDK_VERSION} Loaded `, 'background: #222; color: #bada55; font-weight: bold;');
        }

        /**
         * Initialize the SDK
         * @param {Object} config - Optional configuration
         */
        async init(config = {}) {
            this.gameId = config.gameId || this._detectGameId();
            this.apiUrl = config.apiUrl || DEFAULT_API_URL;
            this.isInitialized = true;
            console.log(`Kasrah SDK Initialized for Game: ${this.gameId || 'Unknown'}`);
            return true;
        }

        /**
         * Show a real advertisement
         * @param {Object} options - Ad options
         */
        async showAd(options = {}) {
            if (!this.isInitialized) await this.init();

            console.log("Kasrah SDK: Fetching ad...");
            
            try {
                // Using the correct API route found in the project
                const response = await fetch(`${this.apiUrl}/api/ads?position=interstitial`);
                const data = await response.json();

                if (data && data.ads && data.ads.length > 0) {
                    // Pick a random ad from the list
                    const randomAd = data.ads[Math.floor(Math.random() * data.ads.length)];
                    this._renderAdUI(randomAd, options);
                } else {
                    console.log("Kasrah SDK: No ads available, showing fallback.");
                    // Fallback ad if no ads are in DB
                    this._renderAdUI({
                        title: "Kasrah Games",
                        description: "استمتع بأفضل الألعاب المجانية على منصة كسرة!",
                        imageUrl: "https://kasrah-games.onrender.com/images/logo.png",
                        targetUrl: "https://kasrah-games.onrender.com",
                        buttonText: "العب الآن"
                    }, options);
                }
            } catch (error) {
                console.error("Kasrah SDK: Failed to load ad", error);
                if (options.onClose) options.onClose();
            }
        }

        /**
         * Save player data to the cloud
         */
        async saveData(data) {
            if (!this.isInitialized) await this.init();
            
            try {
                const response = await fetch(`${this.apiUrl}/api/sdk/cloud-save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gameId: this.gameId,
                        data: data
                    })
                });
                return await response.json();
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        /**
         * Load player data from the cloud
         */
        async loadData() {
            if (!this.isInitialized) await this.init();
            
            try {
                const response = await fetch(`${this.apiUrl}/api/sdk/cloud-save?gameId=${this.gameId}`);
                const result = await response.json();
                return result;
            } catch (error) {
                return { success: false, error: error.message };
            }
        }

        // --- Private Helper Methods ---

        _detectGameId() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('gameId') || window.location.pathname.split('/').pop() || 'test-game';
        }

        _renderAdUI(ad, options = {}) {
            // Remove existing if any
            if (this.adContainer) {
                document.body.removeChild(this.adContainer);
            }

            // Create Overlay
            this.adContainer = document.createElement('div');
            this.adContainer.id = 'kasrah-ad-overlay';
            Object.assign(this.adContainer.style, {
                position: 'fixed',
                top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.85)',
                zIndex: '2147483647', // Maximum possible z-index
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'sans-serif', color: 'white',
                backdropFilter: 'blur(5px)'
            });

            // Ad Content
            this.adContainer.innerHTML = `
                <div style="position: relative; width: 90%; max-width: 400px; background: #fff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5); color: #333; text-align: center; animation: kasrahFadeIn 0.3s ease-out;">
                    <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.1); padding: 4px 8px; border-radius: 4px; font-size: 10px; color: #666;">إعلان</div>
                    <img src="${ad.imageUrl || ad.image || 'https://via.placeholder.com/400x200?text=Kasrah+Games'}" style="width: 100%; height: 200px; object-fit: cover; display: block;">
                    <div style="padding: 25px;">
                        <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #2c3e50;">${ad.title || 'Kasrah Games'}</h3>
                        <p style="margin: 0 0 20px 0; color: #7f8c8d; font-size: 14px; line-height: 1.5;">${ad.description || 'أفضل منصة للألعاب العربية'}</p>
                        <a href="${ad.targetUrl || ad.url || '#'}" target="_blank" style="display: block; background: #e67e22; color: white; padding: 12px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; transition: 0.2s;">
                            ${ad.buttonText || 'اكتشف المزيد'}
                        </a>
                    </div>
                    <button id="kasrah-close-ad" style="position: absolute; top: 10px; left: 10px; background: #eee; border: none; color: #333; width: 30px; height: 30px; border-radius: 50%; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">&times;</button>
                </div>
                <style>
                    @keyframes kasrahFadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                </style>
            `;

            document.body.appendChild(this.adContainer);

            // Close Logic
            document.getElementById('kasrah-close-ad').onclick = () => {
                document.body.removeChild(this.adContainer);
                this.adContainer = null;
                if (options.onClose) options.onClose();
                if (options.onComplete) options.onComplete();
            };
        }
    }

    // Export to global scope
    window.KasrahSDK = new KasrahSDK();
})();
