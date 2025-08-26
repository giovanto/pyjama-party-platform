'use client';

import { useEffect, useRef, useState, useCallback, useMemo, memo, ReactNode } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapLayerManager from './MapLayerManager';
import MapPerformanceOptimizer from './MapPerformanceOptimizer';
import HeatMapOverlay from './HeatMapOverlay';
import RouteAdvocacyPopup from './RouteAdvocacyPopup';
import MapExportTool from './MapExportTool';
import { useRealityLayerData } from './RealityLayerData';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDreams } from '@/providers/DataProvider';

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
  enableHeatMap?: boolean;
  enableRealTimeUpdates?: boolean;
  enableAdvocacyPopups?: boolean;
  enableMapExport?: boolean;
  mobileOptimized?: boolean;
  // Optional: when testing or when map cannot load, render a fallback node instead of the default error
  fallback?: ReactNode;
}

const DreamMap = memo(function DreamMap({ 
  className = '',
  routes,
  style = 'mapbox://styles/mapbox/light-v11',
  center = [13.4050, 52.5200],
  zoom = 4,
  showLayerManager = true,
  optimizePerformance = true,
  enableHeatMap = true,
  enableRealTimeUpdates = true,
  enableAdvocacyPopups = true,
  enableMapExport = true,
  mobileOptimized = true,
  fallback
}: DreamMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] = useState<string>('dream');
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showExportTool, setShowExportTool] = useState(false);
  const [advocacyPopup, setAdvocacyPopup] = useState<{
    visible: boolean;
    routeId?: string;
    stationId?: string;
    coordinates: [number, number];
  } | null>(null);
  const [newRouteAnimations, setNewRouteAnimations] = useState<string[]>([]);
  
  const { trackEvent } = useAnalytics();
  const realityData = useRealityLayerData();
  
  // Use global data provider instead of local API calls
  const { dreams, total, lastUpdate, isLoading: dreamsLoading, error: dreamsError, refetch } = useDreams();

  // Memoized configuration for map optimization
  const mapConfig = useMemo(() => ({
    container: null,
    style: style,
    center: center,
    zoom: zoom,
    attributionControl: false,
    touchZoomRotate: mobileOptimized,
    touchPitch: !mobileOptimized,
    dragRotate: !mobileOptimized,
    doubleClickZoom: true,
    scrollZoom: true,
    boxZoom: !mobileOptimized,
    keyboard: !mobileOptimized,
    // Performance optimizations
    renderWorldCopies: false,
    antialias: false, // Disable for better performance on lower-end devices
    failIfMajorPerformanceCaveat: false,
    preserveDrawingBuffer: false,
    trackResize: true,
    transformRequest: (url: string, resourceType: string) => {
      // Add CDN optimization for tiles
      if (resourceType === 'Tile' && url.includes('mapbox.com')) {
        return {
          url: url,
          headers: {
            'Cache-Control': 'public, max-age=86400'
          }
        };
      }
      return { url };
    }
  }), [style, center, zoom, mobileOptimized]);

  // Transform dreams from global provider to DreamRoute format
  const dreamRoutes = useMemo(() => {
    if (!dreams) return routes || [];
    
    return dreams.map((dream: any) => ({
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
      count: 1, // For now, each dream counts as 1
      createdAt: dream.created_at
    }));
  }, [dreams, routes]);

  // Set up global refresh function for form submissions  
  useEffect(() => {
    (window as unknown as { refreshDreamMap: () => void }).refreshDreamMap = () => refetch();
    return () => {
      delete (window as unknown as { refreshDreamMap?: () => void }).refreshDreamMap;
    };
  }, [refetch]);

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      setError('Mapbox token not configured. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN environment variable.');
      return;
    }

    if (!mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      const config = {
        ...mapConfig,
        container: mapContainer.current
      };
      map.current = new mapboxgl.Map(config);

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

  // Memoized GeoJSON data processing for better performance
  const { routeFeatures, stationFeatures } = useMemo(() => {
    const routes = dreamRoutes.map(route => ({
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

    // Optimize station processing with Map for O(1) lookup
    const stationMap = new Map<string, {
      name: string;
      coordinates: [number, number];
      dreamCount: number;
    }>();
    
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
      
      stationMap.get(fromKey)!.dreamCount += route.count;
      stationMap.get(toKey)!.dreamCount += route.count;
    });

    const stations = Array.from(stationMap.values()).map(station => ({
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

    return { routeFeatures: routes, stationFeatures: stations };
  }, [dreamRoutes]);

  // Optimized map data update function
  const updateMapData = useCallback(() => {
    if (!map.current || !isLoaded) return;

    // Use requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      const routeSource = map.current?.getSource('dream-routes') as mapboxgl.GeoJSONSource;
      const stationSource = map.current?.getSource('dream-stations') as mapboxgl.GeoJSONSource;

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
    });
  }, [routeFeatures, stationFeatures, isLoaded]);

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
      id: 'dream-routes',
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

    // Click handler for individual stations with advocacy popup
    map.current.on('click', 'dream-stations-circle', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (!properties) return;

      if (enableAdvocacyPopups) {
        // Show advocacy popup for station
        setAdvocacyPopup({
          visible: true,
          stationId: `station-${properties.longitude}-${properties.latitude}`,
          coordinates: [properties.longitude, properties.latitude]
        });
        
        trackEvent('station_clicked_advocacy', {
          station_name: properties.name,
          dream_count: properties.dreamCount
        });
      } else {
        // Fallback to simple popup
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
      }
    });

    // Enhanced route click handler with advocacy popup
    map.current.on('click', 'dream-routes', (e) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (!properties) return;

      if (enableAdvocacyPopups) {
        // Show advocacy popup instead of simple popup
        setAdvocacyPopup({
          visible: true,
          routeId: properties.id,
          coordinates: [e.lngLat.lng, e.lngLat.lat]
        });
        
        trackEvent('route_clicked_advocacy', {
          route_id: properties.id,
          from: properties.fromName,
          to: properties.toName
        });
      } else {
        // Fallback to simple popup
        new mapboxgl.Popup({ className: 'dream-popup' })
          .setLngLat(e.lngLat)
          .setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-sm text-bot-blue mb-2">${properties.fromName} → ${properties.toName}</h3>
              <div class="flex items-center text-xs">
                <span class="w-2 h-0.5 bg-bot-green mr-2"></span>
                <span class="font-medium">${properties.count} dreamer${properties.count !== 1 ? 's' : ''} want this route</span>
              </div>
              <p class="text-xs text-gray-600 mt-2 italic">Enable advocacy mode for detailed statistics</p>
            </div>
          `)
          .addTo(map.current!);
      }
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

    map.current.on('mouseenter', 'dream-routes', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = 'pointer';
      }
    });

    map.current.on('mouseleave', 'dream-routes', () => {
      if (map.current) {
        map.current.getCanvas().style.cursor = '';
      }
    });
  };

  if (error) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className={`dream-map-error bg-white border border-amber-300 rounded-lg p-8 text-center ${className}`} role="alert" aria-live="assertive">
        <div className="text-amber-700 font-semibold mb-2"><span role="img" aria-label="warning">⚠️</span> Map Unavailable</div>
        <p className="text-gray-700 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className={`dream-map relative ${className}`} role="application" aria-label="Interactive dream route map">
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-lg overflow-hidden"
        style={{ minHeight: '400px' }}
        role="img"
        aria-label="Interactive map showing dream train routes across Europe"
        tabIndex={0}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg" role="status" aria-live="polite">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bot-green mx-auto mb-2" aria-hidden="true"></div>
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
      
      {/* Heat Map Overlay */}
      {enableHeatMap && isLoaded && (
        <HeatMapOverlay
          map={map.current}
          routes={dreamRoutes.map(route => ({
            id: route.id,
            from: route.from,
            to: route.to,
            demand_count: route.count,
            popularity_score: route.count * Math.max(5, dreamRoutes.length / 10) // Dynamic scoring based on total activity
          }))}
          visible={showHeatMap}
          onHeatUpdate={(heatData) => {
            trackEvent('heat_map_updated', { points: heatData.length });
          }}
        />
      )}
      
      {/* Map Export Tool */}
      {enableMapExport && isLoaded && (
        <MapExportTool
          map={map.current}
          visible={showExportTool}
          onToggle={setShowExportTool}
        />
      )}
      
      {/* Advocacy Popup */}
      {advocacyPopup?.visible && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-30 p-4" role="dialog" aria-modal="true" aria-labelledby="advocacy-popup-title">
          <RouteAdvocacyPopup
            routeId={advocacyPopup.routeId}
            stationId={advocacyPopup.stationId}
            coordinates={advocacyPopup.coordinates}
            onClose={() => setAdvocacyPopup(null)}
            onExport={(data) => {
              console.log('Advocacy data exported:', data);
              trackEvent('advocacy_data_exported', {
                type: advocacyPopup.routeId ? 'route' : 'station'
              });
            }}
          />
        </div>
      )}

      {/* Performance Optimizer */}
      {optimizePerformance && isLoaded && (
        <MapPerformanceOptimizer 
          map={map.current}
          enabled={optimizePerformance}
        />
      )}

      {/* Advanced Control Panel */}
      <div className="absolute bottom-4 left-4 space-y-2">
        {/* Main Legend */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3 text-xs shadow-md border border-white/30 max-w-xs" role="complementary" aria-labelledby="map-legend-heading">
          <div className="flex items-center justify-between mb-2">
            <h3 id="map-legend-heading" className="font-medium text-gray-800 text-xs">
              {activeLayer === 'dream' ? <><span role="img" aria-label="sparkles">✨</span> Dream Layer</> : <><span role="img" aria-label="train">🚂</span> Reality Layer</>}
            </h3>
            <div className="text-xs text-gray-500">
              {dreamRoutes.length} routes
            </div>
          </div>
          
          <div className="space-y-1">
            {activeLayer === 'dream' ? (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-bot-green rounded" aria-hidden="true"></div>
                  <span className="text-gray-700">Dream Routes</span>
                  {showHeatMap && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" aria-hidden="true"></div>
                      {enableRealTimeUpdates && (
                        <span className="text-xs text-red-600 font-medium" role="status" aria-label="Live updates enabled">LIVE</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-400 rounded-full" aria-hidden="true"></div>
                  <span className="text-gray-700">Demand Hubs</span>
                </div>
                {newRouteAnimations.length > 0 && (
                  <div className="flex items-center gap-2 text-green-600" role="status" aria-live="polite">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" aria-hidden="true"></div>
                    <span className="font-medium">{newRouteAnimations.length} new route{newRouteAnimations.length > 1 ? 's' : ''}!</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-emerald-600 rounded" aria-hidden="true"></div>
                  <span className="text-gray-700">Night Trains</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full" aria-hidden="true"></div>
                  <span className="text-gray-700">Active Stations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-teal-600 rounded" aria-hidden="true"></div>
                  <span className="text-gray-700">Day Trains</span>
                </div>
              </>
            )}
          </div>
          
          {enableRealTimeUpdates && lastUpdate && (
            <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs text-gray-500" role="status" aria-live="polite">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
              <span>Live updates</span>
              <time className="ml-auto" dateTime={lastUpdate.toISOString()}>{lastUpdate.toLocaleTimeString()}</time>
            </div>
          )}
        </div>
        
        {/* Feature Controls */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-md border border-white/30" role="toolbar" aria-label="Map feature controls">
          <div className="grid grid-cols-2 gap-1">
            {enableHeatMap && (
              <button
                onClick={() => {
                  setShowHeatMap(!showHeatMap);
                  trackEvent('heat_map_toggled', { enabled: !showHeatMap });
                }}
                data-heat-toggle="true"
                className={`p-2 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                  showHeatMap
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                aria-pressed={showHeatMap}
                aria-label={`${showHeatMap ? 'Hide' : 'Show'} heat map overlay`}
              >
                <span role="img" aria-label="fire">🔥</span> Heat
              </button>
            )}
            
            {enableMapExport && (
              <button
                onClick={() => {
                  setShowExportTool(!showExportTool);
                  trackEvent('export_tool_toggled', { enabled: !showExportTool });
                }}
                data-export-toggle="true"
                className={`p-2 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showExportTool
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
                aria-pressed={showExportTool}
                aria-label={`${showExportTool ? 'Hide' : 'Show'} export tool`}
              >
                <span role="img" aria-label="camera">📷</span> Export
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default DreamMap;
