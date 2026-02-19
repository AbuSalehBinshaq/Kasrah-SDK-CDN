/**
 * Kasrah Games SDK v3.0.0 (CDN Version)
 * Official SDK for Kasrah Games Platform
 * 
 * Features:
 * - Auto-detection of API URL and Game ID
 * - Real Ad Rendering System (UI/UX)
 * - Cloud Save & Data Sync with Main Site
 * - Zero dependency, lightweight, and secure
 */

(function() {
    const SDK_VERSION = "3.0.0";
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
            // 1. Auto-detect Game ID from URL if not provided
            this.gameId = config.gameId || this._detectGameId();
            this.apiUrl = config.apiUrl || DEFAULT_API_URL;

            if (!this.gameId) {
                console.warn("Kasrah SDK: Game ID not found. Some features may be limited.");
            }

            this.isInitialized = true;
            console.log(`Kasrah SDK Initialized for Game: ${this.gameId || 'Unknown'}`);
            
            // 2. Track Session Start
            this._trackEvent('session_start');
            return true;
        }

        /**
         * Show a real advertisement
         * @param {string} type - 'interstitial' or 'rewarded'
         */
        async showAd(type = 'interstitial') {
            if (!this.isInitialized) await this.init();

            console.log(`Kasrah SDK: Fetching ${type} ad...`);
            
            try {
                const response = await fetch(`${this.apiUrl}/api/sdk/ads-pro?gameId=${this.gameId}&type=${type}`);
                const data = await response.json();

                if (data && data.ad) {
                    this._renderAdUI(data.ad);
                } else {
                    console.log("Kasrah SDK: No ads available at the moment.");
                }
            } catch (error) {
                console.error("Kasrah SDK: Failed to load ad", error);
            }
        }

        /**
         * Save player data to the cloud
         * @param {Object} data - Data to save
         */
        async saveCloudData(data) {
            if (!this.isInitialized) await this.init();
            
            console.log("Kasrah SDK: Saving data to cloud...");
            try {
                const response = await fetch(`${this.apiUrl}/api/sdk/cloud-save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gameId: this.gameId,
                        data: data,
                        timestamp: Date.now()
                    })
                });
                return await response.json();
            } catch (error) {
                console.error("Kasrah SDK: Cloud save failed", error);
                return { success: false, error: error.message };
            }
        }

        /**
         * Load player data from the cloud
         */
        async loadCloudData() {
            if (!this.isInitialized) await this.init();
            
            try {
                const response = await fetch(`${this.apiUrl}/api/sdk/cloud-save?gameId=${this.gameId}`);
                const result = await response.json();
                return result.data || {};
            } catch (error) {
                console.error("Kasrah SDK: Cloud load failed", error);
                return {};
            }
        }

        // --- Private Helper Methods ---

        _detectGameId() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('gameId') || window.location.pathname.split('/').pop();
        }

        _renderAdUI(ad) {
            // Create Overlay
            this.adContainer = document.createElement('div');
            Object.assign(this.adContainer.style, {
                position: 'fixed',
                top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: '999999',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Arial, sans-serif', color: 'white'
            });

            // Ad Content
            this.adContainer.innerHTML = `
                <div style="position: relative; max-width: 80%; background: #1a1a1a; border-radius: 15px; overflow: hidden; box-shadow: 0 0 30px rgba(0,0,0,0.5);">
                    <div style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); padding: 5px 10px; border-radius: 5px; font-size: 12px;">ADVERTISEMENT</div>
                    <img src="${ad.imageUrl}" style="max-width: 100%; display: block;">
                    <div style="padding: 20px; text-align: center;">
                        <h3 style="margin: 0 0 10px 0;">${ad.title}</h3>
                        <p style="margin: 0 0 20px 0; color: #ccc;">${ad.description}</p>
                        <a href="${ad.targetUrl}" target="_blank" style="display: inline-block; background: #ffcc00; color: black; padding: 12px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; transition: transform 0.2s;">
                            ${ad.buttonText || 'Learn More'}
                        </a>
                    </div>
                    <button id="kasrah-close-ad" style="position: absolute; top: 10px; left: 10px; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">&times;</button>
                </div>
            `;

            document.body.appendChild(this.adContainer);

            // Close Logic
            document.getElementById('kasrah-close-ad').onclick = () => {
                document.body.removeChild(this.adContainer);
                this.adContainer = null;
                this._trackEvent('ad_close', { adId: ad.id });
            };

            this._trackEvent('ad_impression', { adId: ad.id });
        }

        async _trackEvent(event, params = {}) {
            try {
                fetch(`${this.apiUrl}/api/sdk/analytics`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        gameId: this.gameId,
                        event: event,
                        params: params,
                        url: window.location.href
                    })
                });
            } catch (e) {}
        }
    }

    // Export to global scope
    window.KasrahSDK = new KasrahSDK();
})();
