# Kasrah SDK v1.0.0

Advanced Ad & Analytics Platform for Web Games

## Quick Start

```html
<script src="https://cdn.kasrah-games.com/kasrah-sdk.js"></script>

<script>
  await KasrahSDK.init({
    gameId: 'my-game',
    apiUrl: 'https://kasrah-games-v2.com/api/sdk'
  });

  // Show ad
  await KasrahSDK.showInterstitial();

  // Save player data
  await KasrahSDK.saveData({ level: 5, score: 1000 });
</script>
```

## Features

- ✅ Auto-detection of Game ID
- ✅ Interstitial & Rewarded Ads
- ✅ Responsive Banner Ads
- ✅ Cloud Save System
- ✅ Event Tracking & Analytics
- ✅ Zero Dependencies
- ✅ SDK Inspector Tool

## Documentation

See `DOCUMENTATION.md` for complete API reference and examples.

## Support

Email: support@kasrah-games.com
