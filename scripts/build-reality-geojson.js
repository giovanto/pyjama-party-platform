/**
 * Build a static GeoJSON bundle of the Reality Layer from dataset files.
 * Output: public/reality-network.geojson
 */
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

async function main() {
  const base = path.join(process.cwd(), 'data', 'Back-on-Track_night-train-data', 'data', 'latest');
  const outDir = path.join(process.cwd(), 'public');
  const outFile = path.join(outDir, 'reality-network.geojson');

  try {
    // If the dataset (a git submodule) isn't available in the build
    // environment (e.g. Vercel failed to fetch submodules), don't fail the
    // build. Prefer any pre-committed output, otherwise emit a minimal
    // placeholder to keep the app functional.
    if (!fs.existsSync(base)) {
      if (fs.existsSync(outFile)) {
        console.log(`⚠︎ Dataset not found at ${base}. Using existing ${outFile}.`);
        return;
      }

      console.log(`⚠︎ Dataset not found at ${base}. Emitting minimal placeholder ${outFile}.`);
      if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
      const placeholder = {
        type: 'RealityNetwork',
        lastUpdated: new Date().toISOString(),
        stations: { type: 'FeatureCollection', features: [] },
        routes: { type: 'FeatureCollection', features: [] },
      };
      await fsp.writeFile(outFile, JSON.stringify(placeholder));
      return;
    }

    // Ensure output directory exists
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Read dataset files
    const stopsRaw = await fsp.readFile(path.join(base, 'stops.json'), 'utf8');
    const mapRaw = await fsp.readFile(path.join(base, 'view_ontd_map.json'), 'utf8');

    const stopsObj = JSON.parse(stopsRaw);
    const mapObj = JSON.parse(mapRaw);

    // Normalize index for name → record
    const stopIndex = new Map();
    for (const [name, rec] of Object.entries(stopsObj)) {
      stopIndex.set(String(name).trim().toLowerCase(), rec);
    }

    const resolveStation = (label) => {
      if (!label) return null;
      const key = String(label).trim().toLowerCase();
      const exact = stopIndex.get(key);
      if (exact) return [Number(exact.stop_lon), Number(exact.stop_lat)];
      // strip parens, extra spaces
      const simplified = key.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
      const simpleHit = stopIndex.get(simplified);
      if (simpleHit) return [Number(simpleHit.stop_lon), Number(simpleHit.stop_lat)];
      // try primary segment
      const primary = key.split('-').shift()?.split('/').shift()?.trim() || key;
      const maybe = stopIndex.get(primary);
      if (maybe) return [Number(maybe.stop_lon), Number(maybe.stop_lat)];
      return null;
    };

    const stationSet = new Map();
    const routeFeatures = [];

    for (const [id, r] of Object.entries(mapObj)) {
      const operator = r.agency_id || 'Unknown';
      const frequency = r.service_id_0 || r.service_id_1 || 'Unknown';
      const name = r.trip_short_name_0 || r.trip_short_name_1 || `Route ${id}`;
      const origin = r.origin_trip_0 || r.origin_trip_1;
      const dest = r.destination_trip_0 || r.destination_trip_1;
      const viaStr = r.via_0 || r.via_1 || '';
      const stops = [origin, ...viaStr.split(' - ').filter(Boolean), dest].filter(Boolean);

      const coords = [];
      for (const s of stops) {
        const c = resolveStation(s);
        if (c) {
          coords.push(c);
          const rec = stopsObj[s] || stopsObj[s?.trim?.() || ''];
          const idNorm = String(rec?.stop_id || s);
          if (!stationSet.has(idNorm)) {
            stationSet.set(idNorm, {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [c[0], c[1]] },
              properties: {
                id: idNorm,
                name: rec?.stop_name || s,
                city: rec?.stop_cityname || '',
                country: rec?.stop_country || '',
                has_night_train: true,
                is_major_hub: false,
                operator: [],
                connectivity_score: 50,
              }
            })
          }
        }
      }

      if (coords.length >= 2) {
        routeFeatures.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: coords },
          properties: {
            id,
            name,
            operator,
            service_type: 'night_train',
            frequency,
            route: `${origin} → ${dest}`
          }
        });
      }
    }

    const stationFeatures = Array.from(stationSet.values());
    const output = {
      type: 'RealityNetwork',
      lastUpdated: new Date().toISOString(),
      stations: { type: 'FeatureCollection', features: stationFeatures },
      routes: { type: 'FeatureCollection', features: routeFeatures },
    };

    await fsp.writeFile(outFile, JSON.stringify(output));
    console.log(`✔︎ Wrote ${outFile} with ${stationFeatures.length} stations and ${routeFeatures.length} routes`);
  } catch (e) {
    console.error('✖ Failed to build reality-network.geojson:', e.message);
    // Do not fail the build on data issues; keep previous artifact if any.
    // This is important for platforms that don't fetch git submodules.
    // If there's no prior artifact, write a placeholder to keep the app alive.
    const outDir = path.join(process.cwd(), 'public');
    const outFile = path.join(outDir, 'reality-network.geojson');
    try {
      if (fs.existsSync(outFile)) {
        console.log(`⚠︎ Keeping existing ${outFile} after failure.`);
      } else {
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const placeholder = {
          type: 'RealityNetwork',
          lastUpdated: new Date().toISOString(),
          stations: { type: 'FeatureCollection', features: [] },
          routes: { type: 'FeatureCollection', features: [] },
        };
        await fsp.writeFile(outFile, JSON.stringify(placeholder));
        console.log(`⚠︎ Wrote placeholder ${outFile}.`);
      }
    } catch (writeErr) {
      console.error('✖ Additionally failed to ensure placeholder artifact:', writeErr.message);
    }
  }
}

main();
