'use client';

import { useCallback, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import CriticalMassOverlay from './CriticalMassOverlay';
import { useRealityLayerData, REALITY_STATIONS, REALITY_ROUTES } from './RealityLayerData';

export interface MapLayer {
  id: string;
  name: string;
  description: string;
  icon: string;
  sourceData: unknown;
  layerConfig: mapboxgl.LayerSpecification[];
  visible: boolean;
}

export interface MapLayerManagerProps {
  map: mapboxgl.Map | null;
  onLayerChange?: (activeLayer: string) => void;
}

/**
 * MapLayerManager - Handles dual-layer system for Dream ↔ Reality switching
 * 
 * Dream Layer: Shows inspirational destinations from TripHop data + user dreams
 * Reality Layer: Shows current rail infrastructure + existing night train routes
 */
export default function MapLayerManager({ map, onLayerChange }: MapLayerManagerProps) {
  const [activeLayer, setActiveLayer] = useState<'dream' | 'reality'>('dream');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [showCriticalMass, setShowCriticalMass] = useState(false);
  const realityData = useRealityLayerData();

  // Initialize layer configurations
  const initializeLayers = useCallback(() => {
    const dreamLayer: MapLayer = {
      id: 'dream',
      name: 'Dream Layer',
      description: 'Inspirational destinations and dream routes',
      icon: '✨',
      sourceData: null,
      layerConfig: [
        {
          id: 'dream-places-clusters',
          type: 'circle',
          source: 'dream-places',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#fbbf24', // amber-400
              10,
              '#f59e0b', // amber-500
              30,
              '#d97706'  // amber-600
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
            'circle-opacity': 0.9,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff'
          }
        },
        {
          id: 'dream-places-individual',
          type: 'circle',
          source: 'dream-places',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'priority_score'],
              1, 6,
              5, 8,
              10, 12
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'priority_score'],
              1, '#fbbf24',
              5, '#f59e0b',
              10, '#d97706'
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9
          }
        },
        {
          id: 'dream-routes',
          type: 'line',
          source: 'dream-routes',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#22c55e',
            'line-width': [
              'interpolate',
              ['linear'],
              ['get', 'count'],
              1, 3,
              5, 5,
              10, 7
            ],
            'line-opacity': 0.8
          }
        }
      ],
      visible: true
    };

    const realityLayer: MapLayer = {
      id: 'reality',
      name: 'Reality Layer', 
      description: 'Current rail infrastructure and services',
      icon: '🚂',
      sourceData: null,
      layerConfig: [
        {
          id: 'existing-stations',
          type: 'circle',
          source: 'reality-stations',
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'connectivity_score'],
              0, 4,
              50, 8,
              100, 12
            ],
            'circle-color': [
              'case',
              ['get', 'has_night_train'], '#059669', // emerald-600 for night train stations
              ['get', 'is_major_hub'], '#0d9488',    // teal-600 for major hubs
              '#6b7280'  // gray-500 for regular stations
            ],
            'circle-stroke-width': [
              'case',
              ['get', 'has_night_train'], 3,
              2
            ],
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9
          }
        },
        {
          id: 'existing-stations-labels',
          type: 'symbol',
          source: 'reality-stations',
          filter: ['get', 'has_night_train'],
          layout: {
            'text-field': ['get', 'city'],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 10,
            'text-offset': [0, 1.5],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': '#065f46',
            'text-halo-color': '#ffffff',
            'text-halo-width': 1
          }
        },
        {
          id: 'existing-night-routes-shadow',
          type: 'line',
          source: 'reality-routes',
          filter: ['==', ['get', 'service_type'], 'night_train'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#000000',
            'line-width': 6,
            'line-opacity': 0.1,
            'line-blur': 2
          }
        },
        {
          id: 'existing-night-routes',
          type: 'line',
          source: 'reality-routes',
          filter: ['==', ['get', 'service_type'], 'night_train'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': [
              'case',
              ['==', ['get', 'frequency'], 'Daily'], '#059669',
              ['==', ['get', 'frequency'], 'Suspended'], '#dc2626',
              '#f59e0b'
            ],
            'line-width': [
              'case',
              ['==', ['get', 'frequency'], 'Daily'], 5,
              ['==', ['get', 'frequency'], 'Suspended'], 3,
              4
            ],
            'line-opacity': [
              'case',
              ['==', ['get', 'frequency'], 'Suspended'], 0.4,
              0.8
            ],
            'line-dasharray': [
              'case',
              ['==', ['get', 'frequency'], 'Suspended'], [3, 3],
              [1, 0]
            ]
          }
        },
        {
          id: 'existing-day-routes',
          type: 'line',
          source: 'reality-routes',
          filter: ['==', ['get', 'service_type'], 'day_train'],
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#0d9488',
            'line-width': 2,
            'line-opacity': 0.4
          }
        }
      ],
      visible: false
    };

    setLayers([dreamLayer, realityLayer]);
  }, []);

  // Initialize layers when component mounts
  useEffect(() => {
    initializeLayers();
  }, [initializeLayers]);

  // Add/remove map layers based on visibility
  const updateMapLayers = useCallback((targetLayer: 'dream' | 'reality') => {
    if (!map) return;

    setIsTransitioning(true);

    const dreamLayers = ['dream-places-clusters', 'dream-places-individual', 'dream-routes', 'dream-routes-shadow', 'dream-stations-clusters', 'dream-stations-cluster-count', 'dream-stations-circle', 'dream-stations-labels'];
    const realityLayers = ['existing-stations', 'existing-stations-labels', 'existing-night-routes-shadow', 'existing-night-routes', 'existing-day-routes'];

    try {
      if (targetLayer === 'dream') {
        // Hide reality layers
        realityLayers.forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
          }
        });

        // Show dream layers (existing ones from DreamMap)
        dreamLayers.forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
          }
        });

      } else {
        // Hide dream layers
        dreamLayers.forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'none');
          }
        });

        // Add reality layers if they don't exist
        if (!map.getSource('reality-stations')) {
          addRealityDataSources();
        }

        // Show reality layers
        realityLayers.forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setLayoutProperty(layerId, 'visibility', 'visible');
          }
        });
      }

      setActiveLayer(targetLayer);
      onLayerChange?.(targetLayer);
      
      // Emit event for ProminentLayerToggle coordination
      window.dispatchEvent(new CustomEvent('mapLayerChanged', { 
        detail: { layer: targetLayer } 
      }));

    } catch (error) {
      console.error('Error updating map layers:', error);
    } finally {
      setTimeout(() => setIsTransitioning(false), 300);
    }
  }, [map, onLayerChange]);

  // Add reality data sources and layers
  const addRealityDataSources = useCallback(() => {
    if (!map) return;

    try {
      // Add reality stations source (placeholder - will be populated with real data)
      if (!map.getSource('reality-stations')) {
        map.addSource('reality-stations', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });
      }

      // Add reality routes source
      if (!map.getSource('reality-routes')) {
        map.addSource('reality-routes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });
      }

      // Add reality layer configurations
      const realityLayer = layers.find(l => l.id === 'reality');
      if (realityLayer) {
        realityLayer.layerConfig.forEach(layerConfig => {
          if (!map.getLayer(layerConfig.id)) {
            map.addLayer({
              ...layerConfig,
              layout: {
                ...layerConfig.layout,
                visibility: 'none'
              }
            });
          }
        });
      }
      
      // Add click handlers for reality layers
      if (!map.getLayer('existing-stations-click-handler')) {
        // Click handler for reality stations
        map.on('click', 'existing-stations', (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const feature = e.features[0];
          const properties = feature.properties;
          
          if (!properties) return;
          
          const operatorList = properties.operator ? 
            (Array.isArray(properties.operator) ? properties.operator : [properties.operator]).join(', ') 
            : 'None';
          
          new mapboxgl.Popup({ className: 'reality-popup' })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3">
                <h3 class="font-bold text-sm text-emerald-700">${properties.name}</h3>
                <p class="text-xs text-gray-600 mb-2">${properties.city}, ${properties.country}</p>
                
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Night trains:</span>
                    <span class="font-medium ${properties.has_night_train ? 'text-emerald-600' : 'text-gray-400'}">
                      ${properties.has_night_train ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Operators:</span>
                    <span class="font-medium text-gray-800">${operatorList}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Hub status:</span>
                    <span class="font-medium ${properties.is_major_hub ? 'text-blue-600' : 'text-gray-600'}">
                      ${properties.is_major_hub ? 'Major Hub' : 'Regional'}
                    </span>
                  </div>
                </div>
                
                <div class="mt-2 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs">
                  <strong>Reality Layer:</strong> Current operational status
                </div>
              </div>
            `)
            .addTo(map);
        });
        
        // Click handler for reality routes
        map.on('click', 'existing-night-routes', (e) => {
          if (!e.features || e.features.length === 0) return;
          
          const feature = e.features[0];
          const properties = feature.properties;
          
          if (!properties) return;
          
          const statusColor = properties.frequency === 'Daily' ? 'emerald' :
                           properties.frequency === 'Suspended' ? 'red' : 'amber';
          
          new mapboxgl.Popup({ className: 'reality-popup' })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="p-3">
                <h3 class="font-bold text-sm text-${statusColor}-700">${properties.name}</h3>
                <p class="text-xs text-gray-600 mb-2">${properties.route}</p>
                
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Operator:</span>
                    <span class="font-medium text-gray-800">${properties.operator}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Frequency:</span>
                    <span class="font-medium text-${statusColor}-600">${properties.frequency}</span>
                  </div>
                  ${properties.duration ? `
                    <div class="flex justify-between">
                      <span class="text-gray-600">Duration:</span>
                      <span class="font-medium text-gray-800">${properties.duration}</span>
                    </div>
                  ` : ''}
                  ${properties.departure && properties.arrival ? `
                    <div class="flex justify-between">
                      <span class="text-gray-600">Schedule:</span>
                      <span class="font-medium text-gray-800">${properties.departure} → ${properties.arrival}</span>
                    </div>
                  ` : ''}
                </div>
                
                <div class="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <strong>Active Route:</strong> ${properties.frequency === 'Suspended' ? 'Service suspended' : 'Currently operating'}
                </div>
              </div>
            `)
            .addTo(map);
        });
        
        // Mouse cursor changes
        ['existing-stations', 'existing-night-routes'].forEach(layerId => {
          map.on('mouseenter', layerId, () => {
            map.getCanvas().style.cursor = 'pointer';
          });
          
          map.on('mouseleave', layerId, () => {
            map.getCanvas().style.cursor = '';
          });
        });
      }

    } catch (error) {
      console.error('Error adding reality data sources:', error);
    }
  }, [map, layers]);

  // Load TripHop places data for dream layer
  const loadDreamPlacesData = useCallback(async () => {
    if (!map) return;

    try {
      const response = await fetch('/api/places/search?limit=1000');
      if (!response.ok) throw new Error('Failed to fetch places');
      
      const data = await response.json();
      
      const placesFeatures = data.places.map((place: {
        place_id: string;
        name: string;
        country: string;
        longitude: number;
        latitude: number;
        place_type: string;
        priority_score: number;
        tags: string[];
      }) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [place.longitude, place.latitude]
        },
        properties: {
          place_id: place.place_id,
          name: place.name,
          country: place.country,
          place_type: place.place_type,
          priority_score: place.priority_score,
          tags: place.tags
        }
      }));

      // Update dream places source
      const dreamPlacesSource = map.getSource('dream-places') as mapboxgl.GeoJSONSource;
      if (dreamPlacesSource) {
        dreamPlacesSource.setData({
          type: 'FeatureCollection',
          features: placesFeatures
        });
      } else {
        // Add new source with clustering
        map.addSource('dream-places', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: placesFeatures
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 60
        });

        // Add dream layer configurations
        const dreamLayer = layers.find(l => l.id === 'dream');
        if (dreamLayer) {
          dreamLayer.layerConfig.forEach(layerConfig => {
            if (!map.getLayer(layerConfig.id)) {
              map.addLayer(layerConfig);
            }
          });
        }
      }

    } catch (error) {
      console.error('Error loading dream places data:', error);
    }
  }, [map, layers]);

  // Load reality infrastructure data from comprehensive dataset
  const loadRealityData = useCallback(async () => {
    if (!map) return;

    try {
      // Use comprehensive reality data from RealityLayerData
      const stationFeatures = realityData.stations;
      const routeFeatures = realityData.routes;

      // Update reality sources
      const stationsSource = map.getSource('reality-stations') as mapboxgl.GeoJSONSource;
      const routesSource = map.getSource('reality-routes') as mapboxgl.GeoJSONSource;

      if (stationsSource) {
        stationsSource.setData({
          type: 'FeatureCollection',
          features: stationFeatures
        });
      }

      if (routesSource) {
        routesSource.setData({
          type: 'FeatureCollection',
          features: routeFeatures
        });
      }

      console.log(`Loaded ${stationFeatures.length} reality stations and ${routeFeatures.length} reality routes`);

    } catch (error) {
      console.error('Error loading reality data:', error);
    }
  }, [map, realityData]);

  // Handle layer switching
  const handleLayerSwitch = useCallback((layer: 'dream' | 'reality') => {
    if (layer === activeLayer || isTransitioning) return;
    
    updateMapLayers(layer);
    
    // Load appropriate data if not already loaded
    if (layer === 'dream') {
      loadDreamPlacesData();
    } else {
      loadRealityData();
    }
  }, [activeLayer, isTransitioning, updateMapLayers, loadDreamPlacesData, loadRealityData]);

  // Load initial data when map is ready
  useEffect(() => {
    if (map && layers.length > 0) {
      loadDreamPlacesData();
      // Pre-load reality data for smooth transitions
      setTimeout(() => {
        addRealityDataSources();
        loadRealityData();
      }, 1000);
    }
  }, [map, layers, loadDreamPlacesData, loadRealityData, addRealityDataSources]);

  return (
    <>
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 z-10">
        <div className="p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">Map Layers</div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleLayerSwitch('dream')}
              disabled={isTransitioning}
              data-layer="dream"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${activeLayer === 'dream' 
                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-lg">✨</span>
              <div className="text-left">
                <div className="font-medium">Dream Layer</div>
                <div className="text-xs opacity-75">Inspiration & Dreams</div>
              </div>
            </button>

            <button
              onClick={() => handleLayerSwitch('reality')}
              disabled={isTransitioning}
              data-layer="reality"
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all
                ${activeLayer === 'reality' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }
                ${isTransitioning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <span className="text-lg">🚂</span>
              <div className="text-left">
                <div className="font-medium">Reality Layer</div>
                <div className="text-xs opacity-75">
                  {realityData.analysis.coverage.active_routes} active routes
                </div>
              </div>
            </button>
          </div>

          {/* Critical Mass Toggle */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs font-medium text-gray-700 mb-2">Overlays</div>
            <button
              onClick={() => setShowCriticalMass(!showCriticalMass)}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all w-full
                ${showCriticalMass 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <span className="text-lg">🎯</span>
              <div className="text-left">
                <div className="font-medium">Critical Mass</div>
                <div className="text-xs opacity-75">Pajama Party Readiness</div>
              </div>
            </button>
          </div>

          {isTransitioning && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-600">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              Switching layers...
            </div>
          )}
        </div>
      </div>

      {/* Critical Mass Overlay */}
      <CriticalMassOverlay 
        map={map} 
        visible={showCriticalMass}
        onStationClick={(station) => {
          console.log('Critical mass station clicked:', station);
        }}
      />
    </>
  );
}