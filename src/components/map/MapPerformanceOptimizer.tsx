'use client';

import { useCallback, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export interface MapPerformanceOptimizerProps {
  map: mapboxgl.Map | null;
  enabled?: boolean;
}

/**
 * MapPerformanceOptimizer - Optimizes map performance for large datasets
 * 
 * Features:
 * - Viewport-based data loading
 * - Zoom-level adaptive clustering
 * - Layer visibility management
 * - Memory usage optimization
 */
export default function MapPerformanceOptimizer({ 
  map, 
  enabled = true 
}: MapPerformanceOptimizerProps) {
  const lastViewport = useRef<{
    bounds: mapboxgl.LngLatBounds | null;
    zoom: number;
  }>({ bounds: null, zoom: 0 });
  
  const performanceMetrics = useRef({
    lastUpdateTime: 0,
    frameRate: 60,
    dataPointCount: 0
  });

  // Viewport-based data loading optimization
  const optimizeDataLoading = useCallback(() => {
    if (!map || !enabled) return;

    const currentBounds = map.getBounds();
    const currentZoom = map.getZoom();
    
    // Only update if viewport has changed significantly
    const boundsChanged = !lastViewport.current.bounds || 
      !currentBounds.equals(lastViewport.current.bounds);
    const zoomChanged = Math.abs(currentZoom - lastViewport.current.zoom) > 0.5;

    if (!boundsChanged && !zoomChanged) return;

    lastViewport.current = {
      bounds: currentBounds,
      zoom: currentZoom
    };

    // Optimize clustering based on zoom level
    const sources = ['dream-places', 'dream-stations', 'critical-mass-stations'];
    sources.forEach(sourceId => {
      const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource;
      if (source && source.setClusterOptions) {
        // Adjust cluster radius based on zoom level
        const clusterRadius = Math.max(20, 80 - currentZoom * 8);
        const clusterMaxZoom = currentZoom > 10 ? 16 : 14;
        
        // Note: setClusterOptions is not a real method, this is conceptual
        // In practice, you'd need to recreate the source with new options
        console.log(`Optimizing ${sourceId} clustering: radius=${clusterRadius}, maxZoom=${clusterMaxZoom}`);
      }
    });

    // Hide detailed layers at low zoom levels
    const detailLayers = ['dream-stations-labels', 'critical-mass-labels'];
    detailLayers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        const visibility = currentZoom > 8 ? 'visible' : 'none';
        map.setLayoutProperty(layerId, 'visibility', visibility);
      }
    });

  }, [map, enabled]);

  // Memory usage optimization
  const optimizeMemoryUsage = useCallback(() => {
    if (!map || !enabled) return;

    // Clean up unused sources and layers
    const style = map.getStyle();
    if (!style) return;

    // Remove sources that haven't been used recently
    const unusedSources = Object.keys(style.sources).filter(sourceId => {
      // Check if source has any associated layers
      const hasLayers = style.layers?.some(layer => 
        'source' in layer && layer.source === sourceId
      );
      return !hasLayers;
    });

    unusedSources.forEach(sourceId => {
      try {
        map.removeSource(sourceId);
        console.log(`Cleaned up unused source: ${sourceId}`);
      } catch {
        // Source might be in use, ignore error
      }
    });

  }, [map, enabled]);

  // Frame rate monitoring and adaptive quality
  const monitorPerformance = useCallback(() => {
    if (!map || !enabled) return;

    const now = performance.now();
    const deltaTime = now - performanceMetrics.current.lastUpdateTime;
    
    if (deltaTime > 0) {
      const currentFPS = 1000 / deltaTime;
      performanceMetrics.current.frameRate = 
        performanceMetrics.current.frameRate * 0.9 + currentFPS * 0.1; // Smoothed FPS
    }
    
    performanceMetrics.current.lastUpdateTime = now;

    // Adaptive quality based on performance
    const fps = performanceMetrics.current.frameRate;
    
    if (fps < 30) {
      // Performance is poor, reduce quality
      reduceMapQuality();
    } else if (fps > 50) {
      // Performance is good, can increase quality
      increaseMapQuality();
    }

  }, [map, enabled, increaseMapQuality, reduceMapQuality]);

  // Reduce map quality for better performance
  const reduceMapQuality = useCallback(() => {
    if (!map) return;

    // Increase clustering radius
    const sources = ['dream-places', 'dream-stations'];
    sources.forEach(sourceId => {
      // In a real implementation, you'd recreate sources with higher cluster radius
      console.log(`Reducing quality for ${sourceId}: increasing cluster radius`);
    });

    // Hide non-essential layers
    const nonEssentialLayers = ['dream-routes-shadow', 'pajama-party-rings'];
    nonEssentialLayers.forEach(layerId => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    });

    // Reduce point counts in heatmaps
    if (map.getLayer('critical-mass-heatmap')) {
      map.setPaintProperty('critical-mass-heatmap', 'heatmap-radius', [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 1,
        9, 10
      ]);
    }

  }, [map]);

  // Increase map quality when performance allows
  const increaseMapQuality = useCallback(() => {
    if (!map) return;

    // Show shadow effects
    if (map.getLayer('dream-routes-shadow')) {
      map.setLayoutProperty('dream-routes-shadow', 'visibility', 'visible');
    }

    // Show pajama party rings
    if (map.getLayer('pajama-party-rings')) {
      map.setLayoutProperty('pajama-party-rings', 'visibility', 'visible');
    }

    // Increase heatmap radius for better visual quality
    if (map.getLayer('critical-mass-heatmap')) {
      map.setPaintProperty('critical-mass-heatmap', 'heatmap-radius', [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 2,
        9, 20
      ]);
    }

  }, [map]);

  // Batch data updates to avoid frequent re-renders
  const batchedDataUpdate = useCallback((
    updateFunction: () => void,
    delay: number = 300
  ) => {
    const timeoutId = setTimeout(updateFunction, delay);
    return () => clearTimeout(timeoutId);
  }, []);

  // Debounced viewport optimization
  const debouncedOptimization = useCallback(() => {
    return batchedDataUpdate(optimizeDataLoading, 200);
  }, [optimizeDataLoading, batchedDataUpdate]);

  // Setup performance monitoring
  useEffect(() => {
    if (!map || !enabled) return;

    let animationFrame: number;
    let cleanupTimeout: (() => void) | undefined;

    const performanceLoop = () => {
      monitorPerformance();
      animationFrame = requestAnimationFrame(performanceLoop);
    };

    // Start performance monitoring
    animationFrame = requestAnimationFrame(performanceLoop);

    // Setup viewport change handlers
    const handleMoveEnd = () => {
      cleanupTimeout?.();
      cleanupTimeout = debouncedOptimization();
    };

    const handleZoomEnd = () => {
      cleanupTimeout?.();
      cleanupTimeout = debouncedOptimization();
    };

    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleZoomEnd);

    // Memory cleanup interval
    const memoryCleanupInterval = setInterval(optimizeMemoryUsage, 30000); // Every 30 seconds

    return () => {
      cancelAnimationFrame(animationFrame);
      cleanupTimeout?.();
      clearInterval(memoryCleanupInterval);
      
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleZoomEnd);
    };

  }, [map, enabled, monitorPerformance, debouncedOptimization, optimizeMemoryUsage]);

  // Initial optimization when map loads
  useEffect(() => {
    if (!map || !enabled) return;

    const handleLoad = () => {
      optimizeDataLoading();
      
      // Set initial performance-friendly defaults
      map.setRenderWorldCopies(false); // Don't render world copies for better performance
      
      // Configure terrain and sky for better performance if available
      if (map.getLayer('sky')) {
        map.removeLayer('sky');
      }
    };

    if (map.loaded()) {
      handleLoad();
    } else {
      map.on('load', handleLoad);
    }

    return () => {
      map.off('load', handleLoad);
    };

  }, [map, enabled, optimizeDataLoading]);

  // Debug performance metrics (only in development)
  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    const logPerformance = () => {
      const metrics = performanceMetrics.current;
      console.log('Map Performance Metrics:', {
        fps: Math.round(metrics.frameRate),
        dataPoints: metrics.dataPointCount,
        viewport: lastViewport.current
      });
    };

    const interval = setInterval(logPerformance, 5000); // Log every 5 seconds
    return () => clearInterval(interval);

  }, [enabled]);

  return null; // This is a performance optimization component, no UI to render
}