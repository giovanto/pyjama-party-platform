'use client';

import { useEffect, useMemo, useState } from 'react';

/**
 * RealityLayerData - Comprehensive European night train network data
 * 
 * This component provides realistic data for the Reality Layer showing:
 * - Existing night train routes (ÖBB Nightjet, Snälltåget, etc.)
 * - Major European railway stations with night train services
 * - Operating schedules and frequencies
 * - Route gaps to contrast with dream network
 */

// Major European railway stations with night train services
export const REALITY_STATIONS = [
  // Austria
  { id: 'vienna-hbf', name: 'Vienna Hauptbahnhof', city: 'Vienna', country: 'Austria', coordinates: [16.3738, 48.2082], has_night_train: true, is_major_hub: true, operator: ['ÖBB'] },
  { id: 'innsbruck-hbf', name: 'Innsbruck Hauptbahnhof', city: 'Innsbruck', country: 'Austria', coordinates: [11.4041, 47.2632], has_night_train: true, is_major_hub: false, operator: ['ÖBB'] },
  { id: 'salzburg-hbf', name: 'Salzburg Hauptbahnhof', city: 'Salzburg', country: 'Austria', coordinates: [13.0458, 47.8131], has_night_train: true, is_major_hub: false, operator: ['ÖBB'] },
  
  // Germany
  { id: 'berlin-hbf', name: 'Berlin Hauptbahnhof', city: 'Berlin', country: 'Germany', coordinates: [13.3777, 52.5251], has_night_train: true, is_major_hub: true, operator: ['ÖBB', 'SJ'] },
  { id: 'munich-hbf', name: 'München Hauptbahnhof', city: 'Munich', country: 'Germany', coordinates: [11.5581, 48.1351], has_night_train: true, is_major_hub: true, operator: ['ÖBB'] },
  { id: 'hamburg-hbf', name: 'Hamburg Hauptbahnhof', city: 'Hamburg', country: 'Germany', coordinates: [10.0067, 53.5528], has_night_train: true, is_major_hub: true, operator: ['ÖBB', 'SJ'] },
  { id: 'dresden-hbf', name: 'Dresden Hauptbahnhof', city: 'Dresden', country: 'Germany', coordinates: [13.7318, 51.0408], has_night_train: true, is_major_hub: false, operator: ['ÖBB'] },
  { id: 'cologne-hbf', name: 'Köln Hauptbahnhof', city: 'Cologne', country: 'Germany', coordinates: [6.9589, 50.9429], has_night_train: false, is_major_hub: true, operator: [] },
  
  // Switzerland
  { id: 'zurich-hb', name: 'Zürich Hauptbahnhof', city: 'Zurich', country: 'Switzerland', coordinates: [8.5417, 47.3769], has_night_train: true, is_major_hub: true, operator: ['ÖBB'] },
  { id: 'basel-sbb', name: 'Basel SBB', city: 'Basel', country: 'Switzerland', coordinates: [7.5893, 47.5476], has_night_train: true, is_major_hub: false, operator: ['ÖBB'] },
  
  // Italy
  { id: 'rome-termini', name: 'Roma Termini', city: 'Rome', country: 'Italy', coordinates: [12.5015, 41.9010], has_night_train: true, is_major_hub: true, operator: ['ÖBB', 'Trenitalia'] },
  { id: 'milan-centrale', name: 'Milano Centrale', city: 'Milan', country: 'Italy', coordinates: [9.2040, 45.4871], has_night_train: true, is_major_hub: true, operator: ['ÖBB', 'Trenitalia'] },
  { id: 'venice-santa-lucia', name: 'Venezia Santa Lucia', city: 'Venice', country: 'Italy', coordinates: [12.3207, 45.4418], has_night_train: true, is_major_hub: false, operator: ['ÖBB', 'Trenitalia'] },
  { id: 'florence-smn', name: 'Firenze Santa Maria Novella', city: 'Florence', country: 'Italy', coordinates: [11.2486, 43.7766], has_night_train: true, is_major_hub: false, operator: ['ÖBB', 'Trenitalia'] },
  { id: 'livorno-centrale', name: 'Livorno Centrale', city: 'Livorno', country: 'Italy', coordinates: [10.3099, 43.5506], has_night_train: true, is_major_hub: false, operator: ['ÖBB'] },
  { id: 'la-spezia-centrale', name: 'La Spezia Centrale', city: 'La Spezia', country: 'Italy', coordinates: [9.8366, 44.1065], has_night_train: true, is_major_hub: false, operator: ['ÖBB'] },
  
  // France
  { id: 'paris-est', name: 'Paris Gare de l\'Est', city: 'Paris', country: 'France', coordinates: [2.3590, 48.8768], has_night_train: true, is_major_hub: true, operator: ['ÖBB'] },
  { id: 'paris-austerlitz', name: 'Paris Gare d\'Austerlitz', city: 'Paris', country: 'France', coordinates: [2.3659, 48.8434], has_night_train: true, is_major_hub: true, operator: ['SNCF'] },
  { id: 'nice-ville', name: 'Nice-Ville', city: 'Nice', country: 'France', coordinates: [7.2620, 43.7034], has_night_train: true, is_major_hub: false, operator: ['SNCF'] },
  { id: 'marseille-st-charles', name: 'Marseille-Saint-Charles', city: 'Marseille', country: 'France', coordinates: [5.3811, 43.3029], has_night_train: false, is_major_hub: true, operator: [] },
  
  // Netherlands
  { id: 'amsterdam-centraal', name: 'Amsterdam Centraal', city: 'Amsterdam', country: 'Netherlands', coordinates: [4.9000, 52.3789], has_night_train: true, is_major_hub: true, operator: ['ÖBB'] },
  
  // Belgium
  { id: 'brussels-central', name: 'Bruxelles-Central', city: 'Brussels', country: 'Belgium', coordinates: [4.3571, 50.8456], has_night_train: true, is_major_hub: true, operator: ['ÖBB'] },
  
  // Czech Republic
  { id: 'prague-hl-n', name: 'Praha hlavní nádraží', city: 'Prague', country: 'Czech Republic', coordinates: [14.4355, 50.0832], has_night_train: true, is_major_hub: true, operator: ['ÖBB', 'CD'] },
  
  // Poland
  { id: 'warsaw-central', name: 'Warszawa Centralna', city: 'Warsaw', country: 'Poland', coordinates: [21.0034, 52.2289], has_night_train: true, is_major_hub: true, operator: ['PKP'] },
  { id: 'krakow-glowny', name: 'Kraków Główny', city: 'Krakow', country: 'Poland', coordinates: [19.9450, 50.0669], has_night_train: true, is_major_hub: false, operator: ['PKP'] },
  
  // Sweden
  { id: 'stockholm-central', name: 'Stockholm Central', city: 'Stockholm', country: 'Sweden', coordinates: [18.0583, 59.3308], has_night_train: true, is_major_hub: true, operator: ['SJ', 'Snälltåget'] },
  { id: 'gothenburg-central', name: 'Göteborg Central', city: 'Gothenburg', country: 'Sweden', coordinates: [11.9729, 57.7085], has_night_train: true, is_major_hub: false, operator: ['SJ'] },
  { id: 'malmo-central', name: 'Malmö Central', city: 'Malmö', country: 'Sweden', coordinates: [13.0007, 55.6089], has_night_train: true, is_major_hub: false, operator: ['SJ', 'Snälltåget'] },
  
  // Denmark
  { id: 'copenhagen-central', name: 'København H', city: 'Copenhagen', country: 'Denmark', coordinates: [12.5655, 55.6721], has_night_train: true, is_major_hub: true, operator: ['SJ'] },
  
  // Slovenia
  { id: 'ljubljana', name: 'Ljubljana', city: 'Ljubljana', country: 'Slovenia', coordinates: [14.5059, 46.0569], has_night_train: true, is_major_hub: false, operator: ['SŽ'] },
  
  // Croatia
  { id: 'zagreb-glav', name: 'Zagreb Glavni kolodvor', city: 'Zagreb', country: 'Croatia', coordinates: [15.9779, 45.8061], has_night_train: true, is_major_hub: false, operator: ['HŽ'] },
  { id: 'split', name: 'Split', city: 'Split', country: 'Croatia', coordinates: [16.4397, 43.5089], has_night_train: true, is_major_hub: false, operator: ['HŽ'] }
];

// Current night train routes with realistic schedules and operators
export const REALITY_ROUTES = [
  // ÖBB Nightjet Network
  {
    id: 'nj-vienna-hamburg',
    name: 'Nightjet EN 420/421',
    operator: 'ÖBB Nightjet',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Vienna → Hamburg',
    coordinates: [
      [16.3738, 48.2082], // Vienna
      [14.4355, 50.0832], // Prague
      [13.7318, 51.0408], // Dresden
      [13.3777, 52.5251], // Berlin
      [10.0067, 53.5528]  // Hamburg
    ],
    stations: ['vienna-hbf', 'prague-hl-n', 'dresden-hbf', 'berlin-hbf', 'hamburg-hbf'],
    duration: '14h 15m',
    departure: '20:40',
    arrival: '10:55'
  },
  {
    id: 'nj-vienna-zurich',
    name: 'Nightjet EN 466/467',
    operator: 'ÖBB Nightjet',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Vienna → Zurich',
    coordinates: [
      [16.3738, 48.2082], // Vienna
      [13.0458, 47.8131], // Salzburg
      [11.4041, 47.2632], // Innsbruck
      [8.5417, 47.3769]   // Zurich
    ],
    stations: ['vienna-hbf', 'salzburg-hbf', 'innsbruck-hbf', 'zurich-hb'],
    duration: '11h 30m',
    departure: '20:40',
    arrival: '08:10'
  },
  {
    id: 'nj-vienna-rome',
    name: 'Nightjet EN 294/295',
    operator: 'ÖBB Nightjet',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Vienna → Rome',
    coordinates: [
      [16.3738, 48.2082], // Vienna
      [15.9779, 45.8061], // Zagreb (seasonal)
      [12.5015, 41.9010]  // Rome
    ],
    stations: ['vienna-hbf', 'zagreb-glav', 'rome-termini'],
    duration: '14h 10m',
    departure: '20:15',
    arrival: '10:25'
  },
  {
    id: 'nj-munich-rome',
    name: 'Nightjet EN 294/295',
    operator: 'ÖBB Nightjet',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Munich → Rome',
    coordinates: [
      [11.5581, 48.1351], // Munich
      [11.4041, 47.2632], // Innsbruck
      [12.3207, 45.4418], // Venice
      [11.2486, 43.7766], // Florence
      [12.5015, 41.9010]  // Rome
    ],
    stations: ['munich-hbf', 'innsbruck-hbf', 'venice-santa-lucia', 'florence-smn', 'rome-termini'],
    duration: '13h 25m',
    departure: '20:25',
    arrival: '09:50'
  },
  {
    id: 'nj-vienna-paris',
    name: 'Nightjet EN 454/455',
    operator: 'ÖBB Nightjet',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Vienna → Paris',
    coordinates: [
      [16.3738, 48.2082], // Vienna
      [11.5581, 48.1351], // Munich
      [8.5417, 47.3769],  // Zurich
      [2.3590, 48.8768]   // Paris
    ],
    stations: ['vienna-hbf', 'munich-hbf', 'zurich-hb', 'paris-est'],
    duration: '14h 45m',
    departure: '19:40',
    arrival: '10:25'
  },
  {
    id: 'nj-vienna-amsterdam',
    name: 'Nightjet EN 458/459',
    operator: 'ÖBB Nightjet',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Vienna → Amsterdam',
    coordinates: [
      [16.3738, 48.2082], // Vienna
      [11.5581, 48.1351], // Munich
      [6.9589, 50.9429],  // Cologne (day connection)
      [4.9000, 52.3789]   // Amsterdam
    ],
    stations: ['vienna-hbf', 'munich-hbf', 'cologne-hbf', 'amsterdam-centraal'],
    duration: '13h 50m',
    departure: '20:40',
    arrival: '10:30'
  },
  {
    id: 'nj-vienna-brussels',
    name: 'Nightjet EN 464/465',
    operator: 'ÖBB Nightjet',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Vienna → Brussels',
    coordinates: [
      [16.3738, 48.2082], // Vienna
      [11.5581, 48.1351], // Munich
      [4.3571, 50.8456]   // Brussels
    ],
    stations: ['vienna-hbf', 'munich-hbf', 'brussels-central'],
    duration: '14h 20m',
    departure: '20:40',
    arrival: '11:00'
  },
  
  // SJ (Swedish Railways) Night Trains
  {
    id: 'sj-stockholm-malmo',
    name: 'SJ Nattåg 94/95',
    operator: 'SJ',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Stockholm → Malmö',
    coordinates: [
      [18.0583, 59.3308], // Stockholm
      [11.9729, 57.7085], // Gothenburg
      [13.0007, 55.6089]  // Malmö
    ],
    stations: ['stockholm-central', 'gothenburg-central', 'malmo-central'],
    duration: '8h 45m',
    departure: '22:55',
    arrival: '07:40'
  },
  {
    id: 'sj-stockholm-berlin',
    name: 'SJ Nattåg 1245/1246',
    operator: 'SJ',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Stockholm → Berlin',
    coordinates: [
      [18.0583, 59.3308], // Stockholm
      [13.0007, 55.6089], // Malmö
      [12.5655, 55.6721], // Copenhagen
      [10.0067, 53.5528], // Hamburg
      [13.3777, 52.5251]  // Berlin
    ],
    stations: ['stockholm-central', 'malmo-central', 'copenhagen-central', 'hamburg-hbf', 'berlin-hbf'],
    duration: '15h 20m',
    departure: '18:25',
    arrival: '09:45'
  },
  
  // Snälltåget (Private Swedish operator)
  {
    id: 'sn-stockholm-berlin',
    name: 'Snälltåget',
    operator: 'Snälltåget',
    service_type: 'night_train',
    frequency: 'Seasonal',
    route: 'Stockholm → Berlin',
    coordinates: [
      [18.0583, 59.3308], // Stockholm
      [13.0007, 55.6089], // Malmö
      [13.3777, 52.5251]  // Berlin
    ],
    stations: ['stockholm-central', 'malmo-central', 'berlin-hbf'],
    duration: '12h 30m',
    departure: '19:30',
    arrival: '08:00'
  },
  
  // SNCF Intercités de Nuit (Limited service)
  {
    id: 'sncf-paris-nice',
    name: 'Intercités de Nuit 5772/5773',
    operator: 'SNCF',
    service_type: 'night_train',
    frequency: '4x per week',
    route: 'Paris → Nice',
    coordinates: [
      [2.3659, 48.8434], // Paris Austerlitz
      [7.2620, 43.7034]  // Nice
    ],
    stations: ['paris-austerlitz', 'nice-ville'],
    duration: '11h 15m',
    departure: '20:50',
    arrival: '08:05'
  },
  
  // Thello (Suspended but historically important)
  {
    id: 'thello-paris-venice',
    name: 'Thello (Suspended)',
    operator: 'Thello',
    service_type: 'night_train',
    frequency: 'Suspended',
    route: 'Paris → Venice',
    coordinates: [
      [2.3590, 48.8768], // Paris Gare de Lyon
      [9.2040, 45.4871], // Milan
      [12.3207, 45.4418] // Venice
    ],
    stations: ['paris-est', 'milan-centrale', 'venice-santa-lucia'],
    duration: '14h 30m',
    departure: '19:15',
    arrival: '09:45'
  },
  
  // RegioJet (Czech/Slovak operator)
  {
    id: 'rj-prague-krakow',
    name: 'RegioJet RJ 1031/1030',
    operator: 'RegioJet',
    service_type: 'night_train',
    frequency: 'Daily',
    route: 'Prague → Krakow',
    coordinates: [
      [14.4355, 50.0832], // Prague
      [19.9450, 50.0669]  // Krakow
    ],
    stations: ['prague-hl-n', 'krakow-glowny'],
    duration: '7h 45m',
    departure: '23:05',
    arrival: '06:50'
  }
];

// Route gaps analysis - areas with high demand but no night train service
export const NETWORK_GAPS = [
  {
    id: 'gap-london-europe',
    description: 'No direct night trains from London to continental Europe',
    affected_routes: ['London → Paris', 'London → Brussels', 'London → Amsterdam'],
    potential_demand: 'Very High',
    barrier: 'Channel Tunnel restrictions'
  },
  {
    id: 'gap-spain-europe',
    description: 'Limited night train connections to/from Spain',
    affected_routes: ['Madrid → Paris', 'Barcelona → Milan', 'Madrid → Lisbon'],
    potential_demand: 'High',
    barrier: 'Gauge differences, limited cross-border services'
  },
  {
    id: 'gap-eastern-europe',
    description: 'Sparse night train network in Eastern Europe',
    affected_routes: ['Warsaw → Budapest', 'Prague → Bucharest', 'Vienna → Sofia'],
    potential_demand: 'Medium-High',
    barrier: 'Infrastructure investment needed'
  },
  {
    id: 'gap-nordic-connections',
    description: 'Limited connections between Nordic countries and central Europe',
    affected_routes: ['Oslo → Copenhagen', 'Helsinki → Stockholm', 'Bergen → Oslo'],
    potential_demand: 'Medium',
    barrier: 'Geographic distances, ferry connections'
  },
  {
    id: 'gap-uk-ireland',
    description: 'No night train services within British Isles',
    affected_routes: ['London → Edinburgh', 'London → Dublin', 'Glasgow → Belfast'],
    potential_demand: 'High',
    barrier: 'Political priority, sea crossings'
  }
];

/**
 * Custom hook to provide reality layer data with filtering and analysis
 */
export function useRealityLayerData() {
  const [stations, setStations] = useState<any[] | null>(null);
  const [routes, setRoutes] = useState<any[] | null>(null);

  // Fetch pre-generated static dataset first (instant load), then fall back
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Static file preferred for instant load
        let res = await fetch('/reality-network.geojson', { cache: 'force-cache' });
        if (!res.ok) {
          // Fallback to dynamic API if static not present
          res = await fetch('/api/reality/map', { cache: 'no-store' });
        }
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            const stationsData = Array.isArray(data.stations)
              ? data.stations
              : (data.stations?.features || []);
            const routesData = Array.isArray(data.routes)
              ? data.routes
              : (data.routes?.features || []);
            setStations(stationsData);
            setRoutes(routesData);
          }
          return;
        }
      } catch (e) {
        console.warn('Falling back to static reality dataset:', e);
      }
      // Fallback to static arrays if API unavailable
      const stationData = REALITY_STATIONS.map(station => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: station.coordinates },
        properties: {
          ...station,
          service_quality: station.has_night_train ? (station.operator.length > 1 ? 'excellent' : 'good') : 'none',
          connectivity_score: station.has_night_train ? Math.min(station.operator.length * 25, 100) : 0
        }
      }));
      const routeData = REALITY_ROUTES.map(route => ({
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: route.coordinates },
        properties: {
          ...route,
          service_quality: route.frequency === 'Daily' ? 'excellent' :
            route.frequency.includes('week') ? 'good' :
            route.frequency === 'Seasonal' ? 'limited' : 'suspended',
          route_importance: route.stations.length > 4 ? 'major' : 'regional'
        }
      }));
      if (!cancelled) {
        setStations(stationData);
        setRoutes(routeData);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Analysis functions
  const getNetworkCoverage = useMemo(() => {
    const totalStations = (stations?.length ?? REALITY_STATIONS.length);
    const nightTrainStations = (stations?.length ?? 0); // API currently returns only night-train stations
    return {
      coverage_percentage: Math.round((nightTrainStations / totalStations) * 100),
      active_routes: (routes?.length ?? REALITY_ROUTES.filter(r => r.frequency !== 'Suspended').length),
      major_operators: ['ÖBB Nightjet', 'SJ', 'SNCF', 'Snälltåget'],
      network_gaps: NETWORK_GAPS.length
    };
  }, []);

  const getOperatorAnalysis = useMemo(() => {
    const operatorStats = REALITY_ROUTES.reduce((acc, route) => {
      if (!acc[route.operator]) {
        acc[route.operator] = { routes: 0, countries: new Set() };
      }
      acc[route.operator].routes++;
      
      // Add countries served by this route
      route.stations.forEach(stationId => {
        const station = REALITY_STATIONS.find(s => s.id === stationId);
        if (station) {
          acc[route.operator].countries.add(station.country);
        }
      });
      
      return acc;
    }, {} as Record<string, { routes: number; countries: Set<string> }>);

    // Convert Set to array for serialization
    return Object.entries(operatorStats).map(([operator, stats]) => ({
      operator,
      routes: stats.routes,
      countries: Array.from(stats.countries),
      market_share: Math.round((stats.routes / REALITY_ROUTES.length) * 100)
    }));
  }, []);

  return {
    stations: stations || [],
    routes: routes || [],
    gaps: NETWORK_GAPS,
    analysis: {
      coverage: getNetworkCoverage,
      operators: getOperatorAnalysis
    }
  };
}

// Constants already exported above as named exports
