'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLayerManager from './MapLayerManager';
import MapPerformanceOptimizer from './MapPerformanceOptimizer';

interface DreamRoute {
  id: string;
  from: {
    name: string;
    coordinates: [number, number];
  };
  to: {
    name: string;
    coordinates: [number, number];
  };
  dreamerName: string;
  count: number;
}

interface DreamMapProps {
  className?: string;
  routes?: DreamRoute[];
  style?: string;
  center?: [number, number];
  zoom?: number;
  showLayerManager?: boolean;
  optimizePerformance?: boolean;
}

export default function DreamMap({ 
  className = '',
  routes,
  style = 'mapbox://styles/mapbox/light-v11',
  center = [13.4050, 52.5200],
  zoom = 4,
  showLayerManager = true,
  optimizePerformance = true
}: DreamMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dreamRoutes, setDreamRoutes] = useState<DreamRoute[]>(routes || []);
  const [activeLayer, setActiveLayer] = useState<string>('dream');

  // Fetch dreams from API
  const fetchDreams = useCallback(async () => {
    try {
      const response = await fetch('/api/dreams');
      if (!response.ok) throw new Error('Failed to fetch dreams');
      
      const data = await response.json();
      
      // Transform API data to match DreamRoute interface
      const transformedRoutes: DreamRoute[] = data.dreams.map((dream: {
        id: number;
        from_station: string;
        to_station: string;
        dreamer_name: string;
        from_longitude: number | null;
        from_latitude: number | null;
        to_longitude: number | null;
        to_latitude: number | null;
      }) => ({
        id: dream.id.toString(),
        from: {
          name: dream.from_station,
          coordinates: [dream.from_longitude || 0, dream.from_latitude || 0] as [number, number]
        },
        to: {
          name: dream.to_station,
          coordinates: [dream.to_longitude || 0, dream.to_latitude || 0] as [number, number]
        },
        dreamerName: dream.dreamer_name,
        count: 1 // For now, each dream counts as 1
      }));
      
      setDreamRoutes(transformedRoutes);
    } catch (error) {
      console.error('Error fetching dreams:', error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchDreams();
  }, [fetchDreams]);

  // Set up global refresh function for form submissions
  useEffect(() => {
    (window as unknown as { refreshDreamMap: () => void }).refreshDreamMap = fetchDreams;
    return () => {
      delete (window as unknown as { refreshDreamMap?: () => void }).refreshDreamMap;
    };
  }, [fetchDreams]);

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      setError('Mapbox token not configured. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.');
      return;
    }

    if (!mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: center,
        zoom: zoom,
        attributionControl: false
      });

      map.current.addControl(new mapboxgl.AttributionControl({
        compact: true
      }), 'bottom-right');

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsLoaded(true);
        initializeMapSources();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map. Please check your internet connection.');
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map.');
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [style, center, zoom]);

  const updateMapData = useCallback(() => {
    if (!map.current || !isLoaded) return;

    const routeFeatures = dreamRoutes.map(route => ({
      type: 'Feature' as const,
      geometry: {
        type: 'LineString' as const,
        coordinates: [route.from.coordinates, route.to.coordinates]
      },
      properties: {
        id: route.id,
        fromName: route.from.name,
        toName: route.to.name,
        count: route.count,
        dreamerName: route.dreamerName
      }
    }));

    const stationMap = new Map();
    dreamRoutes.forEach(route => {
      const fromKey = `${route.from.coordinates[0]},${route.from.coordinates[1]}`;
      const toKey = `${route.to.coordinates[0]},${route.to.coordinates[1]}`;
      
      if (!stationMap.has(fromKey)) {
        stationMap.set(fromKey, {
          ...route.from,
          dreamCount: 0
        });
      }
      if (!stationMap.has(toKey)) {
        stationMap.set(toKey, {
          ...route.to,
          dreamCount: 0
        });
      }
      
      stationMap.get(fromKey).dreamCount += route.count;
      stationMap.get(toKey).dreamCount += route.count;
    });

    const stationFeatures = Array.from(stationMap.values()).map(station => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: station.coordinates
      },
      properties: {
        name: station.name,
        city: station.name.split(',')[1]?.trim() || '',
        country: station.name.split(',')[2]?.trim() || '',
        longitude: station.coordinates[0],
        latitude: station.coordinates[1],
        dreamCount: station.dreamCount
      }
    }));

    const routeSource = map.current.getSource('dream-routes') as mapboxgl.GeoJSONSource;
    const stationSource = map.current.getSource('dream-stations') as mapboxgl.GeoJSONSource;

    if (routeSource) {
      routeSource.setData({
        type: 'FeatureCollection',
        features: routeFeatures
      });
    }

    if (stationSource) {
      stationSource.setData({
        type: 'FeatureCollection',
        features: stationFeatures
      });
    }
  }, [dreamRoutes, isLoaded]);

  useEffect(() => {
    if (isLoaded && map.current) {
      updateMapData();
    }
  }, [dreamRoutes, isLoaded, updateMapData]);

  const initializeMapSources = () => {
    if (!map.current) return;

    map.current.addSource('dream-routes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add clustering for stations
    map.current.addSource('dream-stations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });

    // Enhanced route lines with gradient effect
    map.current.addLayer({
      id: 'dream-routes-shadow',
      type: 'line',
      source: 'dream-routes',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#000000',
        'line-width': [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          1, 4,
          5, 6,
          10, 8
        ],
        'line-opacity': 0.1,
        'line-blur': 2
      }
    });

    map.current.addLayer({
      id: 'dream-routes-line',
      type: 'line',
      source: 'dream-routes',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          1, '#22c55e',
          5, '#16a34a',
          10, '#15803d'
        ],
        'line-width': [
          'interpolate',
          ['linear'],
          ['get', 'count'],
          1, 3,
          5, 5,
          10, 7
        ],
        'line-opacity': 0.9
      }
    });

    // Cluster circles for grouped stations
    map.current.addLayer({
      id: 'dream-stations-clusters',
      type: 'circle',
      source: 'dream-stations',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bfda',
          10,
          '#4264fb',
          30,
          '#f563c0'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          15,
          10,
          20,
          30,
          25
        ],
        'circle-opacity': 0.8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });

    // Cluster count labels
    map.current.addLayer({
      id: 'dream-stations-cluster-count',
      type: 'symbol',
      source: 'dream-stations',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    });

    // Individual station circles
    map.current.addLayer({
      id: 'dream-stations-circle',
      type: 'circle',
      source: 'dream-stations',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'dreamCount'],
          1, 6,
          5, 8,
          10, 10,
          20, 12
        ],
        'circle-color': [
          'interpolate',
          ['linear'],
          ['get', 'dreamCount'],
          1, '#22c55e',
          5, '#16a34a',
          10, '#15803d',
          20, '#14532d'
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.9
      }
    });

    // Station labels for important stations
    map.current.addLayer({
      id: 'dream-stations-labels',
      type: 'symbol',
      source: 'dream-stations',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'text-field': [
          'case',
          ['>=', ['get', 'dreamCount'], 3],
          ['get', 'city'],
          ''
        ],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 10,
        'text-offset': [0, 1.5],
        'text-anchor': 'top'
      },
      paint: {
        'text-color': '#374151',
        'text-halo-color': '#ffffff',
        'text-halo-width': 1
      }
    });

    // Click handler for clusters - zoom in
    map.current.on('click', 'dream-stations-clusters', (e) => {
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['dream-stations-clusters']
      });
      const clusterId = features[0].properties!.cluster_id;
      const source = map.current!.getSource('dream-stations') as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.current!.easeTo({
          center: features[0].geometry.type === 'Point' ? features[0].geometry.coordinates as [number, number] : [0, 0],
          zoom: zoom || 10
        });
      });
    });

    // Click handler for individual stations
    map.current.on('click', 'dream-stations-circle', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (!properties) return;

      new mapboxgl.Popup({ className: 'dream-popup' })
        .setLngLat([properties.longitude, properties.latitude])
        .setHTML(`
          <div class="p-3">
            <h3 class="font-bold text-sm text-bot-green">${properties.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${properties.city}, ${properties.country}</p>
            <div class="flex items-center text-xs">
              <span class="w-2 h-2 bg-bot-green rounded-full mr-2"></span>
              <span class="font-medium">${properties.dreamCount} dream route${properties.dreamCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        `)
        .addTo(map.current!);
    });

    // Enhanced route click handler
    map.current.on('click', 'dream-routes-line', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (!properties) return;

      new mapboxgl.Popup({ className: 'dream-popup' })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-3">
            <h3 class="font-bold text-sm text-bot-blue mb-2">${properties.fromName} → ${properties.toName}</h3>
            <div class="flex items-center text-xs">
              <span class="w-2 h-0.5 bg-bot-green mr-2"></span>
              <span class="font-medium">${properties.count} dreamer${properties.count !== 1 ? 's' : ''} want this route</span>
            </div>
            <p class="text-xs text-gray-600 mt-2 italic">Click route to see all dreamers' stories</p>
          </div>
        `)
        .addTo(map.current!);
    });

    // Mouse cursor changes for interactivity
    map.current.on('mouseenter', 'dream-stations-clusters', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'dream-stations-clusters', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });

    map.current.on('mouseenter', 'dream-stations-circle', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'dream-stations-circle', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });

    map.current.on('mouseenter', 'dream-routes-line', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'dream-routes-line', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });
  };

  if (error) {
    return (
      <div className={`dream-map-error bg-gray-100 border border-gray-300 rounded-lg p-8 text-center ${className}`}>
        <div className="text-red-600 mb-2">⚠️ Map Error</div>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`dream-map relative ${className}`}>
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bot-green mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Loading dream map...</p>
          </div>
        </div>
      )}

      {/* Layer Manager */}
      {showLayerManager && isLoaded && (
        <MapLayerManager 
          map={map.current} 
          onLayerChange={setActiveLayer}
        />
      )}

      {/* Performance Optimizer */}
      {optimizePerformance && isLoaded && (
        <MapPerformanceOptimizer 
          map={map.current}
          enabled={optimizePerformance}
        />
      )}

      {/* Legend - Updated for dual-layer system */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 text-xs shadow-md border border-white/30 max-w-xs">
        <div className="mb-2">
          <div className="font-medium text-gray-800 text-xs">
            {activeLayer === 'dream' ? '✨ Dream Layer' : '🚂 Reality Layer'}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeLayer === 'dream' ? (
            <>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-bot-green rounded"></div>
                <span className="text-gray-700">Dream Routes</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-gray-700">Places</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xs">5</div>
                <span className="text-gray-700">Clusters</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-emerald-600 rounded"></div>
                <span className="text-gray-700">Night Trains</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <span className="text-gray-700">Stations</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-0.5 bg-teal-600 rounded"></div>
                <span className="text-gray-700">Day Trains</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}