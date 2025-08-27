'use client';

import { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface ProminentLayerToggleProps {
  className?: string;
  onLayerChange?: (layer: 'dream' | 'reality') => void;
}

/**
 * ProminentLayerToggle - Large, prominent toggle for switching map layers
 * Designed for homepage integration to make layer switching obvious
 */
export default function ProminentLayerToggle({ 
  className = '',
  onLayerChange
}: ProminentLayerToggleProps) {
  const [activeLayer, setActiveLayer] = useState<'dream' | 'reality'>('dream');
  const { trackEvent } = useAnalytics();

  const handleLayerSwitch = (layer: 'dream' | 'reality') => {
    const previousLayer = activeLayer;
    setActiveLayer(layer);
    onLayerChange?.(layer);
    
    // Track layer switch analytics
    trackEvent('homepage_layer_switched', {
      from_layer: previousLayer,
      to_layer: layer,
      interface: 'prominent_toggle',
      location: 'homepage_map'
    });
    
    // Also trigger the MapLayerManager buttons for coordination
    setTimeout(() => {
      const mapLayerBtns = document.querySelectorAll(`[data-layer="${layer}"]`);
      mapLayerBtns.forEach(btn => {
        if (btn instanceof HTMLButtonElement && !btn.disabled) {
          btn.click();
        }
      });
    }, 100);
  };

  // Listen for external layer changes (from MapLayerManager)
  useEffect(() => {
    const handleLayerUpdate = (event: CustomEvent<{layer: string}>) => {
      if (event.detail.layer === 'dream' || event.detail.layer === 'reality') {
        setActiveLayer(event.detail.layer);
      }
    };

    window.addEventListener('mapLayerChanged' as any, handleLayerUpdate);
    return () => {
      window.removeEventListener('mapLayerChanged' as any, handleLayerUpdate);
    };
  }, []);

  return (
    <div className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-3 sm:p-4 max-w-xs sm:max-w-none ${className}`}>
      <div className="text-center mb-2 sm:mb-3">
        <div className="text-xs sm:text-sm font-bold text-gray-800 mb-1">🎯 View Mode</div>
        <div className="text-xs text-gray-600 hidden sm:block">Switch between dreams & reality</div>
      </div>
      
      <div className="bg-gray-100 p-1 rounded-lg flex">
        <button 
          onClick={() => handleLayerSwitch('dream')}
          className={`flex-1 px-2 sm:px-3 py-2 text-xs font-medium rounded-md transition-all ${
            activeLayer === 'dream'
              ? 'bg-amber-500 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <span>✨</span>
            <span className="hidden sm:inline">Dreams</span>
          </div>
        </button>
        <button 
          onClick={() => handleLayerSwitch('reality')}
          className={`flex-1 px-2 sm:px-3 py-2 text-xs font-medium rounded-md transition-all ${
            activeLayer === 'reality'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-1">
            <span>🚂</span>
            <span className="hidden sm:inline">Reality</span>
          </div>
        </button>
      </div>
      
      <div className="mt-2 sm:mt-3 text-xs text-center hidden sm:block">
        <div className="text-gray-600">
          {activeLayer === 'dream' 
            ? 'Explore community demand patterns'
            : 'View current infrastructure'
          }
        </div>
      </div>
      
      {/* Advocacy tips based on active layer - Desktop only for space */}
      <div className="mt-2 p-2 rounded-lg text-xs text-center hidden lg:block">
        {activeLayer === 'dream' ? (
          <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded">
            💡 <strong>Advocacy tip:</strong> Dreams show unmet demand - perfect for policy arguments!
          </div>
        ) : (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
            📋 <strong>Context:</strong> Reality shows existing services - compare with dreams to find gaps!
          </div>
        )}
      </div>
    </div>
  );
}