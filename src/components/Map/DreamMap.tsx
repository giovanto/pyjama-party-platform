'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
}

export default function DreamMap({ 
  className = '',
  routes = [],
  style = 'mapbox://styles/mapbox/light-v11',
  center = [13.4050, 52.5200],
  zoom = 4
}: DreamMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

    const routeFeatures = routes.map(route => ({
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
    routes.forEach(route => {
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
  }, [routes, isLoaded]);

  useEffect(() => {
    if (isLoaded && map.current) {
      updateMapData();
    }
  }, [routes, isLoaded, updateMapData]);

  const initializeMapSources = () => {
    if (!map.current) return;

    map.current.addSource('dream-routes', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    map.current.addSource('dream-stations', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
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
          1, 2,
          5, 4,
          10, 6
        ],
        'line-opacity': 0.8
      }
    });

    map.current.addLayer({
      id: 'dream-stations-circle',
      type: 'circle',
      source: 'dream-stations',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['get', 'dreamCount'],
          1, 4,
          5, 6,
          10, 8,
          20, 10
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
        'circle-opacity': 0.8
      }
    });

    map.current.on('click', 'dream-stations-circle', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (!properties) return;

      new mapboxgl.Popup()
        .setLngLat([properties.longitude, properties.latitude])
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-sm">${properties.name}</h3>
            <p class="text-xs text-gray-600">${properties.city}, ${properties.country}</p>
            <p class="text-xs mt-1">${properties.dreamCount} dream routes</p>
          </div>
        `)
        .addTo(map.current!);
    });

    map.current.on('click', 'dream-routes-line', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (!properties) return;

      new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-sm">${properties.fromName} → ${properties.toName}</h3>
            <p class="text-xs text-gray-600">${properties.count} dreamers want this route</p>
          </div>
        `)
        .addTo(map.current!);
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

      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span>Dream routes</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Stations</span>
        </div>
      </div>
    </div>
  );
}