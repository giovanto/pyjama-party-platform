/**
 * Import official Back-on-Track graphics into public/assets
 *
 * Usage:
 *   node scripts/import-brand-assets.js
 *
 * Notes:
 * - Requires network access. URLs are examples; update to exact assets from https://back-on-track.eu/graphics/
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSETS = [
  // Update with the exact asset URLs once confirmed
  { url: 'https://back-on-track.eu/graphics/bot-logo.svg', file: 'bot-logo.svg' },
  { url: 'https://back-on-track.eu/graphics/og-default.jpg', file: 'og-default.jpg' },
  { url: 'https://back-on-track.eu/graphics/poster-a4-en.png', file: 'poster-a4-en.png' },
];

const outDir = path.join(process.cwd(), 'public', 'assets', 'brand');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        if (response.statusCode && response.statusCode >= 400) {
          return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        }
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve(dest)));
      })
      .on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

(async () => {
  console.log(`Importing ${ASSETS.length} assets to ${outDir}...`);
  for (const asset of ASSETS) {
    const dest = path.join(outDir, asset.file);
    try {
      await download(asset.url, dest);
      console.log(`✔︎ ${asset.file}`);
    } catch (e) {
      console.error(`✖ Failed: ${asset.url} -> ${asset.file}:`, e.message);
    }
  }
  console.log('Done. Update image references to /assets/brand/* where appropriate.');
})();

