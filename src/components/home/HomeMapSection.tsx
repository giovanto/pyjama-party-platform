'use client';

import dynamic from 'next/dynamic';
import { DreamCounter } from '@/components/dashboard';
import ProminentLayerToggle from '@/components/map/ProminentLayerToggle';
import { getMapboxToken } from '@/lib/env';

// Lazy load DreamMap only on the client
const DreamMap = dynamic(() => import('@/components/map').then(mod => ({ default: mod.DreamMap })), {
  ssr: false,
  loading: () => (
    <div className="h-96 sm:h-[500px] lg:h-[600px] w-full rounded-lg bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bot-green mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Europe map...</p>
      </div>
    </div>
  ),
});

export default function HomeMapSection() {
  const hasMapToken = Boolean(getMapboxToken());

  return (
    <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
      {/* Dream Counter */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 w-full max-w-xs">
        <DreamCounter className="shadow-lg" refreshInterval={60000} />
      </div>

      {/* Layer Toggle */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-30">
        <ProminentLayerToggle />
      </div>

      {/* Map or instructions */}
      {hasMapToken ? (
        <DreamMap 
          className="h-96 sm:h-[500px] lg:h-[600px] w-full rounded-lg"
          center={[10.0, 51.0]}
          zoom={4}
          showLayerManager={true}
          optimizePerformance={true}
          enableHeatMap={true}
          enableRealTimeUpdates={true}
          mobileOptimized={true}
        />
      ) : (
        <div className="h-96 sm:h-[500px] lg:h-[600px] w-full rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-center p-6">
          <div>
            <div className="text-2xl font-semibold text-amber-800 mb-2">Map Unavailable</div>
            <p className="text-amber-700 mb-2">No Mapbox token configured.</p>
            <p className="text-sm text-amber-700">
              Add to your .env.local: <code className="font-mono">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token</code>
            </p>
          </div>
        </div>
      )}

      {/* Impact Dashboard CTA */}
      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20">
        <a 
          href="/dashboard" 
          className="inline-flex items-center bg-bot-green text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold hover:bg-bot-dark-green transition-all duration-300 shadow-lg text-sm sm:text-base"
        >
          📊 View Impact Dashboard
        </a>
      </div>
    </div>
  );
}

