/**
 * Kasrah Games SDK v3.2.0 (CDN Version)
 * Official SDK for Kasrah Games Platform
 * 
 * Features:
 * - Auto-detection of API URL and Game ID
 * - Independent Ad Rendering System (UI/UX)
 * - Cloud Save & Data Sync with Main Site (Prisma)
 * - Zero dependency, lightweight, and secure
 */

(function() {
    const SDK_VERSION = "3.2.0";
    const DEFAULT_API_URL = "https://kasrah-games.onrender.com";
    
    class KasrahSDK {
        constructor() {
            this.apiUrl = DEFAULT_API_URL;
            this.gameId = null;
            this.isInitialized = false;
            this.adContainer = null;
            
            console.log(`%c Kasrah SDK v${SDK_VERSION} Loaded `, 'background: #222; color: #bada55; font-weight: bold;');
        }

        /**
         * Initialize the SDK
         */
        async init(config = {}) {
            this.gameId = config.gameId || this._detectGameId();
            this.apiUrl = config.apiUrl || DEFAULT_API_URL;
            this.isInitialized = true;
            console.log(`Kasrah SDK Initialized for Game: ${this.gameId}`);
            return true;
        }

        /**
         * Show an Interstitial Ad
         * Note: This is currently a standalone UI for the SDK to avoid interference with site ads.
         */
        async showAd(options = {}) {
            if (!this.isInitialized) await this.init();

            console.log("Kasrah SDK: Displaying ad...");
            
            // For now, we use a high-quality fallback/default ad for the SDK 
            // to ensure it works independently of the site's internal ad system.
            this._renderAdUI({
                title: "Kasrah Games",
                description: "استمتع بأفضل الألعاب المجانية على منصة كسرة!",
                imageUrl: "https://kasrah-games.onrender.com/images/logo.png",
                targetUrl: "https://kasrah-games.onrender.com",
                buttonText: "العب الآن"
            }, options);
        }

        /**
         * Save player data to the cloud (Uses Prisma on Render)
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
                console.error("Kasrah SDK: Save failed", error);
                return { success: false, error: error.message };
            }
        }

        /**
         * Load player data from the cloud (Uses Prisma on Render)
         */
        async loadData() {
            if (!this.isInitialized) await this.init();
            
            try {
                const response = await fetch(`${this.apiUrl}/api/sdk/cloud-save?gameId=${this.gameId}`);
                const result = await response.json();
                return result;
            } catch (error) {
                console.error("Kasrah SDK: Load failed", error);
                return { success: false, error: error.message };
            }
        }

        // --- Private Helper Methods ---

        _detectGameId() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('gameId') || window.location.pathname.split('/').pop() || 'test-game';
        }

        _renderAdUI(ad, options = {}) {
            if (this.adContainer) document.body.removeChild(this.adContainer);

            this.adContainer = document.createElement('div');
            this.adContainer.id = 'kasrah-ad-overlay';
            Object.assign(this.adContainer.style, {
                position: 'fixed',
                top: '0', left: '0', width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: '2147483647',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'sans-serif', color: 'white',
                backdropFilter: 'blur(8px)'
            });

            this.adContainer.innerHTML = `
                <div style="position: relative; width: 90%; max-width: 400px; background: #fff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.6); color: #333; text-align: center; animation: kasrahPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                    <div style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.05); padding: 4px 10px; border-radius: 6px; font-size: 11px; color: #888; font-weight: bold;">AD</div>
                    <div style="height: 220px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                        <img src="${ad.imageUrl}" style="max-width: 180px; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.1));">
                    </div>
                    <div style="padding: 30px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 22px; color: #1a1a1a;">${ad.title}</h3>
                        <p style="margin: 0 0 25px 0; color: #666; font-size: 15px; line-height: 1.6;">${ad.description}</p>
                        <a href="${ad.targetUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, #e67e22, #d35400); color: white; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 17px; box-shadow: 0 4px 15px rgba(230, 126, 34, 0.3);">
                            ${ad.buttonText}
                        </a>
                    </div>
                    <button id="kasrah-close-ad" style="position: absolute; top: 15px; left: 15px; background: #f1f2f6; border: none; color: #2f3542; width: 32px; height: 32px; border-radius: 50%; font-size: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;">&times;</button>
                </div>
                <style>
                    @keyframes kasrahPop { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
                    #kasrah-close-ad:hover { background: #dfe4ea; transform: rotate(90deg); }
                </style>
            `;

            document.body.appendChild(this.adContainer);

            document.getElementById('kasrah-close-ad').onclick = () => {
                document.body.removeChild(this.adContainer);
                this.adContainer = null;
                if (options.onClose) options.onClose();
            };
        }
    }

    window.KasrahSDK = new KasrahSDK();
})();
