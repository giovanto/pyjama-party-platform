/**
 * MapComponent - Interactive map showing pajama party dreams
 * Uses Mapbox GL JS to display European train stations and dream connections
 */

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useDreams } from '../../hooks';
import type { Dream, MapComponentProps } from '../../types';

// Mapbox CSS
import 'mapbox-gl/dist/mapbox-gl.css';

export function MapComponent({
  className = '',
  onDreamSelect,
  selectedDream,
  showControls = true,
  height = '600px',
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  const { dreams, isLoading: dreamsLoading, error: dreamsError } = useDreams();

  // Initialize Mapbox
  useEffect(() => {
    if (!mapContainer.current) return;

    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      setMapError('Mapbox access token is not configured');
      return;
    }

    mapboxgl.accessToken = accessToken;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [10.4515, 51.1657], // Center of Europe
        zoom: 4,
        maxZoom: 12,
        minZoom: 2,
        attributionControl: false,
      });

      map.current.on('load', () => {
        setIsMapLoaded(true);
        setMapError(null);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Failed to load map. Please check your internet connection.');
      });

      // Add navigation controls if enabled
      if (showControls) {
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      }

      // Add attribution
      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
        'bottom-left'
      );

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [showControls]);

  // Update map markers when dreams change
  useEffect(() => {
    if (!map.current || !isMapLoaded || dreamsLoading || dreamsError) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each dream
    dreams.forEach((dream) => {
      if (!dream.origin_lat || !dream.origin_lng) return;

      const markerEl = createMarkerElement(dream);
      
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([dream.origin_lng, dream.origin_lat])
        .addTo(map.current!);

      // Add click handler
      markerEl.addEventListener('click', () => {
        onDreamSelect?.(dream);
      });

      markersRef.current.push(marker);

      // Add popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: true,
      }).setHTML(createPopupContent(dream));

      marker.setPopup(popup);
    });

    // Fit map to show all markers if we have dreams
    if (dreams.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      dreams.forEach((dream) => {
        if (dream.origin_lat && dream.origin_lng) {
          bounds.extend([dream.origin_lng, dream.origin_lat]);
        }
      });

      if (!bounds.isEmpty()) {
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 8,
        });
      }
    }

  }, [dreams, isMapLoaded, dreamsLoading, dreamsError, onDreamSelect]);

  // Highlight selected dream
  useEffect(() => {
    if (!selectedDream || !map.current) return;

    // Find and highlight the selected dream marker
    const selectedMarkerEl = markersRef.current.find(marker => {
      const lngLat = marker.getLngLat();
      return (
        selectedDream.origin_lat === lngLat.lat &&
        selectedDream.origin_lng === lngLat.lng
      );
    });

    if (selectedMarkerEl) {
      // Pan to selected marker
      map.current.flyTo({
        center: [selectedDream.origin_lng!, selectedDream.origin_lat!],
        zoom: 8,
        duration: 1000,
      });
    }
  }, [selectedDream]);

  // Create marker element
  const createMarkerElement = (dream: Dream) => {
    const el = document.createElement('div');
    el.className = 'dream-marker';
    el.innerHTML = `
      <div class="relative">
        <div class="w-8 h-8 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-600 transition-colors flex items-center justify-center">
          <span class="text-white text-sm font-bold">🚂</span>
        </div>
        <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </div>
    `;
    return el;
  };

  // Create popup content
  const createPopupContent = (dream: Dream) => {
    const createdDate = new Date(dream.created_at).toLocaleDateString();
    return `
      <div class="p-2 min-w-64">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-lg">🚂</span>
          <h3 class="font-bold text-gray-900">${dream.dreamer_name}</h3>
        </div>
        <div class="space-y-2 text-sm">
          <div>
            <span class="font-medium text-gray-700">From:</span>
            <span class="text-gray-600 ml-1">${dream.origin_station}</span>
          </div>
          <div>
            <span class="font-medium text-gray-700">Dreams of:</span>
            <span class="text-gray-600 ml-1">${dream.destination_city}</span>
          </div>
          <div class="text-xs text-gray-500 pt-1 border-t">
            Added ${createdDate}
          </div>
        </div>
      </div>
    `;
  };

  const containerClasses = `relative bg-gray-100 rounded-lg overflow-hidden ${className}`;

  return (
    <div className={containerClasses} style={{ height }}>
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading Overlay */}
      {(dreamsLoading || !isMapLoaded) && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {!isMapLoaded ? 'Loading map...' : 'Loading dreams...'}
            </p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {(mapError || dreamsError) && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center p-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to load map
            </h3>
            <p className="text-gray-600 mb-4">
              {mapError || dreamsError}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Dreams Counter */}
      {isMapLoaded && !mapError && !dreamsError && (
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">🚂</span>
            <span className="font-semibold text-gray-900">
              {dreams.length} dream{dreams.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Map Legend */}
      {isMapLoaded && dreams.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-lg">
          <div className="text-xs text-gray-600">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Dream starting point</span>
            </div>
            <div className="text-gray-500">
              Click markers for details
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MapComponent;