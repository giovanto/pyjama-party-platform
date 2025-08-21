'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

interface RouteData {
  id: string;
  from: {
    name: string;
    coordinates: [number, number];
  };
  to: {
    name: string;
    coordinates: [number, number];
  };
  demand_count: number;
  popularity_score: number;
}

interface HeatMapOverlayProps {
  map: mapboxgl.Map | null;
  routes: RouteData[];
  visible: boolean;
  intensity?: number;
  radius?: number;
  maxZoom?: number;
  onHeatUpdate?: (heatData: any) => void;
}

/**
 * HeatMapOverlay - Advanced heat mapping for route demand visualization
 * 
 * Features:
 * - Demand density visualization using color intensity
 * - Route popularity heat gradients (green → amber → red)
 * - Station clustering based on demand levels
 * - Smooth transitions and performance optimization
 */
export default function HeatMapOverlay({
  map,
  routes,
  visible,
  intensity = 0.6,
  radius = 30,
  maxZoom = 18,
  onHeatUpdate
}: HeatMapOverlayProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [heatData, setHeatData] = useState<any[]>([]);
  const animationRef = useRef<number>();
  
  // Calculate route demand intensity
  const calculateRouteIntensity = useCallback((route: RouteData) => {
    // Base intensity on demand count and popularity score
    const demandFactor = Math.min(route.demand_count / 10, 1); // Normalize to 0-1
    const popularityFactor = Math.min(route.popularity_score / 100, 1); // Normalize to 0-1
    
    return (demandFactor * 0.7 + popularityFactor * 0.3) * intensity;
  }, [intensity]);

  // Generate heat map data points along routes
  const generateHeatData = useCallback(() => {
    const heatPoints: any[] = [];
    
    routes.forEach(route => {
      const routeIntensity = calculateRouteIntensity(route);
      const [fromLng, fromLat] = route.from.coordinates;
      const [toLng, toLat] = route.to.coordinates;
      
      // Generate points along the route for heat visualization
      const steps = Math.max(5, Math.floor(route.demand_count / 2)); // More points for higher demand
      
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const lng = fromLng + (toLng - fromLng) * ratio;
        const lat = fromLat + (toLat - fromLat) * ratio;
        
        // Add heat point with diminishing intensity toward route ends
        const centerWeight = 1 - Math.abs(ratio - 0.5) * 0.4; // Peak in middle
        const pointIntensity = routeIntensity * centerWeight;
        
        heatPoints.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          properties: {
            intensity: pointIntensity,
            demand_count: route.demand_count,
            route_id: route.id,
            weight: pointIntensity
          }
        });
      }
      
      // Add extra intensity at endpoints (stations)
      [route.from.coordinates, route.to.coordinates].forEach(coords => {
        heatPoints.push({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coords
          },
          properties: {
            intensity: routeIntensity * 1.2, // Station boost
            demand_count: route.demand_count,
            route_id: route.id,
            weight: routeIntensity * 1.2,
            is_station: true
          }
        });
      });
    });
    
    setHeatData(heatPoints);
    onHeatUpdate?.(heatPoints);
    
    return heatPoints;
  }, [routes, calculateRouteIntensity, onHeatUpdate]);

  // Initialize heat map layers
  const initializeHeatLayers = useCallback(() => {
    if (!map || isInitialized) return;
    
    try {
      // Add heat map source
      if (!map.getSource('route-heat')) {
        map.addSource('route-heat', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });
      }
      
      // Heat map layer with gradient
      if (!map.getLayer('route-heatmap')) {
        map.addLayer({
          id: 'route-heatmap',
          type: 'heatmap',
          source: 'route-heat',
          maxzoom: maxZoom,
          paint: {
            // Heatmap weight based on intensity property
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'weight'],
              0, 0,
              1, 1
            ],
            
            // Heatmap intensity increases with zoom
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 1,
              maxZoom, 3
            ],
            
            // Heatmap color gradient: green → amber → red for advocacy impact
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(34, 197, 94, 0)', // transparent green
              0.2, 'rgba(34, 197, 94, 0.2)', // light green (emerging demand)
              0.4, 'rgba(251, 191, 36, 0.4)', // amber (medium demand)
              0.6, 'rgba(245, 158, 11, 0.6)', // orange (high demand)
              0.8, 'rgba(239, 68, 68, 0.8)', // red (critical mass)
              1, 'rgba(220, 38, 38, 1)' // dark red (maximum demand)
            ],
            
            // Heatmap radius
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, radius * 0.5,
              6, radius,
              14, radius * 1.5
            ],
            
            // Heatmap opacity
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0, 0.9,
              14, 0.7,
              maxZoom, 0.5
            ]
          }
        });
      }
      
      // Add route demand visualization layer (circles for high-zoom levels)
      if (!map.getLayer('route-demand-circles')) {
        map.addLayer({
          id: 'route-demand-circles',
          type: 'circle',
          source: 'route-heat',
          minzoom: 12,
          filter: ['==', ['get', 'is_station'], true],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'demand_count'],
              1, 4,
              5, 8,
              10, 12,
              20, 16
            ],
            'circle-color': [
              'interpolate',
              ['linear'],
              ['get', 'intensity'],
              0, '#22c55e', // green (low demand)
              0.3, '#fbbf24', // amber (medium demand)
              0.6, '#f59e0b', // orange (high demand)
              0.8, '#ef4444', // red (critical mass)
              1, '#dc2626' // dark red (maximum)
            ],
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              12, 0,
              14, 0.8,
              18, 0.9
            ],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-opacity': 0.8
          }
        });
      }
      
      // Pulsing animation layer for high-demand stations
      if (!map.getLayer('route-demand-pulse')) {
        map.addLayer({
          id: 'route-demand-pulse',
          type: 'circle',
          source: 'route-heat',
          minzoom: 10,
          filter: [
            'all',
            ['==', ['get', 'is_station'], true],
            ['>=', ['get', 'demand_count'], 5]
          ],
          paint: {
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['get', 'demand_count'],
              5, 12,
              10, 18,
              20, 24
            ],
            'circle-color': 'rgba(239, 68, 68, 0.1)',
            'circle-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0.3,
              14, 0.6
            ],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#ef4444',
            'circle-stroke-opacity': 0.4
          }
        });
      }
      
      setIsInitialized(true);
      
    } catch (error) {
      console.error('Error initializing heat map layers:', error);
    }
  }, [map, isInitialized, radius, maxZoom]);

  // Update heat map data
  const updateHeatData = useCallback(() => {
    if (!map || !isInitialized) return;
    
    const heatPoints = generateHeatData();
    const source = map.getSource('route-heat') as mapboxgl.GeoJSONSource;
    
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: heatPoints
      });
    }
  }, [map, isInitialized, generateHeatData]);

  // Animate pulsing effect for high-demand stations
  const animatePulse = useCallback(() => {
    if (!map || !visible) return;
    
    const pulseLayer = map.getLayer('route-demand-pulse');
    if (!pulseLayer) return;
    
    const timestamp = Date.now();
    const pulseIntensity = Math.abs(Math.sin(timestamp * 0.003)) * 0.8 + 0.2;
    
    try {
      map.setPaintProperty('route-demand-pulse', 'circle-opacity', pulseIntensity * 0.6);
      map.setPaintProperty('route-demand-pulse', 'circle-stroke-opacity', pulseIntensity);
      
      animationRef.current = requestAnimationFrame(animatePulse);
    } catch (error) {
      // Layer might not exist or map might be disposed
    }
  }, [map, visible]);

  // Toggle visibility
  const toggleVisibility = useCallback(() => {
    if (!map || !isInitialized) return;
    
    const layers = ['route-heatmap', 'route-demand-circles', 'route-demand-pulse'];
    const visibility = visible ? 'visible' : 'none';
    
    layers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        try {
          map.setLayoutProperty(layerId, 'visibility', visibility);
        } catch (error) {
          console.error(`Error setting visibility for layer ${layerId}:`, error);
        }
      }
    });
    
    // Start/stop pulse animation
    if (visible) {
      animatePulse();
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [map, isInitialized, visible, animatePulse]);

  // Initialize when map is ready
  useEffect(() => {
    if (map && !isInitialized) {
      initializeHeatLayers();
    }
  }, [map, initializeHeatLayers, isInitialized]);

  // Update data when routes change
  useEffect(() => {
    if (isInitialized && routes.length > 0) {
      updateHeatData();
    }
  }, [routes, isInitialized, updateHeatData]);

  // Toggle visibility when prop changes
  useEffect(() => {
    toggleVisibility();
  }, [visible, toggleVisibility]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Add click handlers for advocacy popups
  useEffect(() => {
    if (!map || !isInitialized) return;
    
    const handleStationClick = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      if (!e.features || e.features.length === 0) return;
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (!properties) return;
      
      // Create advocacy popup with demand statistics
      new mapboxgl.Popup({
        className: 'heat-station-popup',
        maxWidth: '300px'
      })
        .setLngLat(e.lngLat)
        .setHTML(`
          <div class="p-4 bg-white rounded-lg">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-3 h-3 rounded-full" style="background-color: ${
                properties.intensity > 0.8 ? '#dc2626' :
                properties.intensity > 0.6 ? '#ef4444' :
                properties.intensity > 0.3 ? '#f59e0b' : '#22c55e'
              }"></div>
              <h3 class="font-bold text-sm">High-Demand Station</h3>
            </div>
            
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Demand Level:</span>
                <span class="font-medium">${properties.demand_count} routes</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Priority Score:</span>
                <span class="font-medium">${Math.round(properties.intensity * 100)}%</span>
              </div>
            </div>
            
            <div class="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs">
              <strong>Policy Impact:</strong> This station shows critical mass demand for night train connections. Share this data with local transport authorities.
            </div>
            
            <button 
              onclick="window.exportHeatMapData?.('${properties.route_id}')"
              class="mt-2 w-full px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Export Advocacy Data
            </button>
          </div>
        `)
        .addTo(map);
    };
    
    map.on('click', 'route-demand-circles', handleStationClick);
    
    // Mouse cursor changes
    map.on('mouseenter', 'route-demand-circles', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    map.on('mouseleave', 'route-demand-circles', () => {
      map.getCanvas().style.cursor = '';
    });
    
    return () => {
      map.off('click', 'route-demand-circles', handleStationClick);
      map.off('mouseenter', 'route-demand-circles');
      map.off('mouseleave', 'route-demand-circles');
    };
  }, [map, isInitialized]);

  return null; // This is a pure map overlay component
}