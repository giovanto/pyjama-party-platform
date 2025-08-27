import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

type StopRecord = {
  stop_id: string;
  stop_name: string;
  stop_country: string;
  stop_cityname?: string;
  stop_lat: number;
  stop_lon: number;
};

// Simple in-memory cache
let cached: { data: any; ts: number } | null = null;
const TTL_MS = 1000 * 60 * 10; // 10 minutes

export async function GET() {
  try {
    if (cached && Date.now() - cached.ts < TTL_MS) {
      return NextResponse.json(cached.data, { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=1200' } });
    }

    const base = path.join(process.cwd(), 'data', 'Back-on-Track_night-train-data', 'data', 'latest');

    // Load stops mapping
    const stopsRaw = await fs.readFile(path.join(base, 'stops.json'), 'utf8');
    const stopsObj: Record<string, StopRecord> = JSON.parse(stopsRaw);

    // Build a normalized index for tolerant lookup (case-insensitive)
    const stopIndex = new Map<string, StopRecord>();
    for (const [name, rec] of Object.entries(stopsObj)) {
      stopIndex.set(name.trim().toLowerCase(), rec);
    }

    // Helper to resolve a station name into coordinates using best-effort rules
    const resolveStation = (label: string): [number, number] | null => {
      const key = label.trim().toLowerCase();
      const exact = stopIndex.get(key);
      if (exact) return [Number(exact.stop_lon), Number(exact.stop_lat)];

      // Try stripping city qualifiers like "/" or additional annotations
      const simplified = key.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
      const simpleHit = stopIndex.get(simplified);
      if (simpleHit) return [Number(simpleHit.stop_lon), Number(simpleHit.stop_lat)];

      // Try matching before separators
      const primary = key.split('-').shift()?.split('/').shift()?.trim() || key;
      for (const [n, rec] of stopIndex.entries()) {
        if (n === primary) return [Number(rec.stop_lon), Number(rec.stop_lat)];
      }
      return null;
    };

    // Load map routes summary (with via strings)
    const mapRaw = await fs.readFile(path.join(base, 'view_ontd_map.json'), 'utf8');
    const mapObj: Record<string, any> = JSON.parse(mapRaw);

    const routeFeatures: any[] = [];
    const stationSet = new Map<string, { id: string; name: string; city?: string; country?: string; lat: number; lon: number }>();

    for (const [id, r] of Object.entries(mapObj)) {
      const operator = r.agency_id || 'Unknown';
      const frequency = r.service_id_0 || r.service_id_1 || 'Unknown';
      const name = r.trip_short_name_0 || r.trip_short_name_1 || `Route ${id}`;

      const origin = r.origin_trip_0 || r.origin_trip_1;
      const dest = r.destination_trip_0 || r.destination_trip_1;
      const viaStr = r.via_0 || r.via_1 || '';
      const stops: string[] = [origin, ...viaStr.split(' - ').filter(Boolean), dest].filter(Boolean);

      const coords: [number, number][] = [];
      for (const s of stops) {
        const c = resolveStation(s);
        if (c) {
          coords.push(c);
          const rec = stopsObj[s] || stopsObj[s.trim()];
          const idNorm = (rec?.stop_id || s).toString();
          if (!stationSet.has(idNorm)) {
            stationSet.set(idNorm, {
              id: idNorm,
              name: rec?.stop_name || s,
              city: rec?.stop_cityname,
              country: rec?.stop_country,
              lat: c[1],
              lon: c[0]
            });
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

    const stationFeatures = Array.from(stationSet.values()).map(s => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
      properties: {
        id: s.id,
        name: s.name,
        city: s.city || '',
        country: s.country || '',
        has_night_train: true,
        is_major_hub: false,
        operator: [],
        connectivity_score: 50
      }
    }));

    const payload = {
      stations: stationFeatures,
      routes: routeFeatures,
      lastUpdated: new Date().toISOString()
    };
    cached = { data: payload, ts: Date.now() };
    return NextResponse.json(payload, { headers: { 'Cache-Control': 's-maxage=600, stale-while-revalidate=1200' } });
  } catch (e) {
    console.error('Reality map API error:', e);
    return NextResponse.json({ error: 'Failed to load reality data' }, { status: 500 });
  }
}
