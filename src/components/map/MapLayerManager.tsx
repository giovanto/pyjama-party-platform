'use client';

import { useCallback, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import CriticalMassOverlay from './CriticalMassOverlay';

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
              'case',
              ['get', 'has_night_train'], 8,
              ['get', 'is_major_hub'], 6,
              4
            ],
            'circle-color': [
              'case',
              ['get', 'has_night_train'], '#059669', // emerald-600
              ['get', 'is_major_hub'], '#0d9488',    // teal-600
              '#6b7280'  // gray-500
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.9
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
            'line-color': '#059669',
            'line-width': 4,
            'line-opacity': 0.8
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
            'line-opacity': 0.6
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
    const realityLayers = ['existing-stations', 'existing-night-routes', 'existing-day-routes'];

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

  // Load reality infrastructure data
  const loadRealityData = useCallback(async () => {
    if (!map) return;

    try {
      // For now, create sample reality data
      // In production, this would fetch from OpenRailMaps API or similar
      const sampleStations = [
        { id: '1', name: 'Berlin Hauptbahnhof', coordinates: [13.3777, 52.5251], has_night_train: true, is_major_hub: true },
        { id: '2', name: 'Paris Gare de l\'Est', coordinates: [2.3590, 48.8768], has_night_train: true, is_major_hub: true },
        { id: '3', name: 'Vienna Central', coordinates: [16.3738, 48.2082], has_night_train: true, is_major_hub: true },
        { id: '4', name: 'Zurich HB', coordinates: [8.5417, 47.3769], has_night_train: true, is_major_hub: true },
        { id: '5', name: 'Munich Hauptbahnhof', coordinates: [11.5581, 48.1351], has_night_train: false, is_major_hub: true }
      ];

      const stationFeatures = sampleStations.map(station => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: station.coordinates
        },
        properties: {
          id: station.id,
          name: station.name,
          has_night_train: station.has_night_train,
          is_major_hub: station.is_major_hub
        }
      }));

      // Sample night train routes
      const sampleRoutes = [
        {
          id: 'nightjet-berlin-paris',
          name: 'Nightjet Berlin-Paris',
          service_type: 'night_train',
          coordinates: [[13.3777, 52.5251], [2.3590, 48.8768]]
        },
        {
          id: 'nightjet-vienna-zurich',
          name: 'Nightjet Vienna-Zurich',
          service_type: 'night_train',
          coordinates: [[16.3738, 48.2082], [8.5417, 47.3769]]
        }
      ];

      const routeFeatures = sampleRoutes.map(route => ({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        },
        properties: {
          id: route.id,
          name: route.name,
          service_type: route.service_type
        }
      }));

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

    } catch (error) {
      console.error('Error loading reality data:', error);
    }
  }, [map]);

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
                <div className="text-xs opacity-75">Current Infrastructure</div>
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