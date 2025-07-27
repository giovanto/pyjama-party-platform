'use client';

import { useCallback, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

export interface StationReadiness {
  station: string;
  coordinates: [number, number];
  dreamCount: number;
  readinessLevel: 'critical' | 'high' | 'medium' | 'low';
  readinessScore: number;
  pajamaPartyPotential: number;
}

export interface CriticalMassOverlayProps {
  map: mapboxgl.Map | null;
  visible: boolean;
  onStationClick?: (station: StationReadiness) => void;
}

/**
 * CriticalMassOverlay - Visualizes station readiness for pajama party organization
 * 
 * Shows which stations have enough interest to organize successful pajama parties
 * for the September 26, 2025 Europe-wide event
 */
export default function CriticalMassOverlay({ 
  map, 
  visible, 
  onStationClick 
}: CriticalMassOverlayProps) {
  const [stationData, setStationData] = useState<StationReadiness[]>([]);
  const [overlayVisible, setOverlayVisible] = useState(visible);

  // Load station readiness data
  const loadStationReadiness = useCallback(async () => {
    if (!map) return;
    try {
      // Fetch dreams aggregated by station
      const response = await fetch('/api/dreams/aggregated-by-station');
      if (!response.ok) {
        // If endpoint doesn't exist, create sample data
        const sampleData: StationReadiness[] = [
          {
            station: 'Berlin Central Station',
            coordinates: [13.3777, 52.5251],
            dreamCount: 67,
            readinessLevel: 'critical',
            readinessScore: 85,
            pajamaPartyPotential: 92
          },
          {
            station: 'Paris Gare de l\'Est',
            coordinates: [2.3590, 48.8768],
            dreamCount: 54,
            readinessLevel: 'critical',
            readinessScore: 78,
            pajamaPartyPotential: 88
          },
          {
            station: 'Vienna Central',
            coordinates: [16.3738, 48.2082],
            dreamCount: 43,
            readinessLevel: 'high',
            readinessScore: 72,
            pajamaPartyPotential: 81
          },
          {
            station: 'Amsterdam Central',
            coordinates: [4.9041, 52.3676],
            dreamCount: 38,
            readinessLevel: 'high',
            readinessScore: 68,
            pajamaPartyPotential: 75
          },
          {
            station: 'Prague Main Station',
            coordinates: [14.4378, 50.0755],
            dreamCount: 32,
            readinessLevel: 'high',
            readinessScore: 62,
            pajamaPartyPotential: 69
          },
          {
            station: 'Munich Central',
            coordinates: [11.5581, 48.1351],
            dreamCount: 28,
            readinessLevel: 'high',
            readinessScore: 58,
            pajamaPartyPotential: 64
          },
          {
            station: 'Brussels Central',
            coordinates: [4.3571, 50.8456],
            dreamCount: 25,
            readinessLevel: 'high',
            readinessScore: 55,
            pajamaPartyPotential: 61
          },
          {
            station: 'Zurich HB',
            coordinates: [8.5417, 47.3769],
            dreamCount: 22,
            readinessLevel: 'high',
            readinessScore: 52,
            pajamaPartyPotential: 58
          },
          {
            station: 'Barcelona Sants',
            coordinates: [2.1404, 41.3799],
            dreamCount: 18,
            readinessLevel: 'medium',
            readinessScore: 48,
            pajamaPartyPotential: 54
          },
          {
            station: 'Rome Termini',
            coordinates: [12.5015, 41.9001],
            dreamCount: 15,
            readinessLevel: 'medium',
            readinessScore: 42,
            pajamaPartyPotential: 49
          },
          {
            station: 'Stockholm Central',
            coordinates: [18.0586, 59.3301],
            dreamCount: 12,
            readinessLevel: 'medium',
            readinessScore: 38,
            pajajamaPartyPotential: 44
          },
          {
            station: 'Copenhagen Central',
            coordinates: [12.5655, 55.6737],
            dreamCount: 9,
            readinessLevel: 'low',
            readinessScore: 32,
            pajamaPartyPotential: 38
          }
        ];
        
        setStationData(sampleData);
        return;
      }

      const data = await response.json();
      setStationData(data.stations);

    } catch (error) {
      console.error('Error loading station readiness data:', error);
      
      // Fallback to sample data on error
      const fallbackData: StationReadiness[] = [
        {
          station: 'Berlin Central Station',
          coordinates: [13.3777, 52.5251],
          dreamCount: 67,
          readinessLevel: 'critical',
          readinessScore: 85,
          pajamaPartyPotential: 92
        },
        {
          station: 'Paris Gare de l\'Est',
          coordinates: [2.3590, 48.8768],
          dreamCount: 54,
          readinessLevel: 'critical',
          readinessScore: 78,
          pajamaPartyPotential: 88
        }
      ];
      
      setStationData(fallbackData);
    }
  }, [map]);

  // Add critical mass visualization to map
  const addCriticalMassLayer = useCallback(() => {
    if (!map || !stationData.length) return;

    try {
      // Create GeoJSON features for station readiness
      const features = stationData.map(station => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: station.coordinates
        },
        properties: {
          station: station.station,
          dreamCount: station.dreamCount,
          readinessLevel: station.readinessLevel,
          readinessScore: station.readinessScore,
          pajamaPartyPotential: station.pajamaPartyPotential
        }
      }));

      // Add or update source
      const sourceId = 'critical-mass-stations';
      if (map.getSource(sourceId)) {
        const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
        source.setData({
          type: 'FeatureCollection',
          features
        });
      } else {
        map.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features
          }
        });
      }

      // Add critical mass heatmap layer
      if (!map.getLayer('critical-mass-heatmap')) {
        map.addLayer({
          id: 'critical-mass-heatmap',
          type: 'heatmap',
          source: sourceId,
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'dreamCount'],
              0, 0,
              100, 1
            ],
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              9, 3
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 2,
              9, 20
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              7, 1,
              9, 0
            ]
          }
        });
      }

      // Add critical mass circles for individual stations
      if (!map.getLayer('critical-mass-circles')) {
        map.addLayer({
          id: 'critical-mass-circles',
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'dreamCount'],
              0, 8,
              20, 12,
              50, 16,
              100, 20
            ],
            'circle-color': [
              'case',
              ['==', ['get', 'readinessLevel'], 'critical'], '#dc2626', // red-600
              ['==', ['get', 'readinessLevel'], 'high'], '#ea580c',      // orange-600
              ['==', ['get', 'readinessLevel'], 'medium'], '#ca8a04',    // yellow-600
              '#65a30d' // lime-600
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ffffff',
            'circle-opacity': 0.8
          }
        });
      }

      // Add pajama party potential rings
      if (!map.getLayer('pajama-party-rings')) {
        map.addLayer({
          id: 'pajama-party-rings',
          type: 'circle',
          source: sourceId,
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'pajamaPartyPotential'],
              0, 15,
              50, 25,
              100, 35
            ],
            'circle-color': 'transparent',
            'circle-stroke-width': 2,
            'circle-stroke-color': [
              'case',
              ['>=', ['get', 'pajamaPartyPotential'], 80], '#dc2626',
              ['>=', ['get', 'pajamaPartyPotential'], 60], '#ea580c',
              ['>=', ['get', 'pajamaPartyPotential'], 40], '#ca8a04',
              '#65a30d'
            ],
            'circle-stroke-opacity': 0.6
          }
        });
      }

      // Add station labels for critical mass stations
      if (!map.getLayer('critical-mass-labels')) {
        map.addLayer({
          id: 'critical-mass-labels',
          type: 'symbol',
          source: sourceId,
          filter: ['>=', ['get', 'dreamCount'], 20],
          layout: {
            'text-field': [
              'format',
              ['get', 'station'], { 'font-scale': 0.9 },
              '\n', {},
              ['concat', ['get', 'dreamCount'], ' dreams'], { 'font-scale': 0.7 }
            ],
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 11,
            'text-offset': [0, 2],
            'text-anchor': 'top'
          },
          paint: {
            'text-color': '#374151',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2
          }
        });
      }

      // Add click handler for critical mass stations
      map.on('click', 'critical-mass-circles', (e) => {
        if (!e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        const properties = feature.properties;
        
        if (!properties) return;

        const stationData = {
          station: properties.station,
          coordinates: feature.geometry.type === 'Point' ? feature.geometry.coordinates as [number, number] : [0, 0],
          dreamCount: properties.dreamCount,
          readinessLevel: properties.readinessLevel as StationReadiness['readinessLevel'],
          readinessScore: properties.readinessScore,
          pajamaPartyPotential: properties.pajamaPartyPotential
        };

        // Create popup with critical mass information
        new mapboxgl.Popup({ className: 'critical-mass-popup' })
          .setLngLat(stationData.coordinates)
          .setHTML(`
            <div class="p-4 max-w-sm">
              <h3 class="font-bold text-sm text-gray-900 mb-2">${properties.station}</h3>
              
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">Dreams</span>
                  <span class="font-semibold text-sm">${properties.dreamCount}</span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">Readiness</span>
                  <span class="px-2 py-1 rounded text-xs font-medium ${
                    properties.readinessLevel === 'critical' ? 'bg-red-100 text-red-800' :
                    properties.readinessLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                    properties.readinessLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }">
                    ${properties.readinessLevel.toUpperCase()}
                  </span>
                </div>
                
                <div class="flex items-center justify-between">
                  <span class="text-xs text-gray-600">Party Potential</span>
                  <span class="font-semibold text-sm">${properties.pajamaPartyPotential}%</span>
                </div>
              </div>
              
              <div class="mt-3 pt-3 border-t border-gray-200">
                <p class="text-xs text-gray-600">
                  ${properties.readinessLevel === 'critical' || properties.readinessLevel === 'high' 
                    ? '🎉 Ready for pajama party organization!' 
                    : '📈 Needs more dreamers to reach critical mass'
                  }
                </p>
              </div>
            </div>
          `)
          .addTo(map);

        if (onStationClick) {
          onStationClick(stationData);
        }
      });

      // Mouse cursor changes
      map.on('mouseenter', 'critical-mass-circles', () => {
        if (map) {
          map.getCanvas().style.cursor = 'pointer';
        }
      });

      map.on('mouseleave', 'critical-mass-circles', () => {
        if (map) {
          map.getCanvas().style.cursor = '';
        }
      });

    } catch (error) {
      console.error('Error adding critical mass layer:', error);
    }
  }, [map, stationData, onStationClick]);

  // Remove critical mass layers
  const removeCriticalMassLayer = useCallback(() => {
    if (!map) return;

    const layerIds = ['critical-mass-heatmap', 'critical-mass-circles', 'pajama-party-rings', 'critical-mass-labels'];
    const sourceId = 'critical-mass-stations';

    layerIds.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
    });

    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  }, [map]);

  // Toggle visibility
  useEffect(() => {
    if (visible && !overlayVisible) {
      setOverlayVisible(true);
      loadStationReadiness();
    } else if (!visible && overlayVisible) {
      setOverlayVisible(false);
      removeCriticalMassLayer();
    }
  }, [visible, overlayVisible, loadStationReadiness, removeCriticalMassLayer]);

  // Add/remove layers when data changes
  useEffect(() => {
    if (overlayVisible && stationData.length > 0) {
      addCriticalMassLayer();
    }
  }, [overlayVisible, stationData, addCriticalMassLayer]);

  return null; // This is an overlay component, no UI to render
}