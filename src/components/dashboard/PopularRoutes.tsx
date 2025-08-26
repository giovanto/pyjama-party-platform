'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDashboardData, useEventTracker } from '@/hooks/useAnalytics';

interface PopularRoutesData {
  popularRoutes: Array<{
    route: string;
    from: string;
    to: string;
    dreamCount: number;
    percentage: number;
  }>;
  popularDestinations: Array<{
    city: string;
    dreamCount: number;
  }>;
  popularOrigins: Array<{
    city: string;
    dreamCount: number;
  }>;
  totalRoutes: number;
  totalDreams: number;
  lastUpdated: string;
}

interface PopularRoutesProps {
  className?: string;
  showDestinations?: boolean;
  maxRoutes?: number;
}

export default function PopularRoutes({ 
  className = '', 
  showDestinations = true,
  maxRoutes = 10 
}: PopularRoutesProps) {
  const { trackDashboardView, trackChartInteraction } = useEventTracker();
  const { data, loading, error } = useDashboardData<PopularRoutesData>('/api/impact/routes-popular');
  const [selectedTab, setSelectedTab] = React.useState<'routes' | 'destinations' | 'origins'>('routes');

  React.useEffect(() => {
    trackDashboardView('popular-routes');
  }, [trackDashboardView]);

  const handleTabChange = (tab: 'routes' | 'destinations' | 'origins') => {
    setSelectedTab(tab);
    trackChartInteraction('popular-routes', `tab-${tab}`);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-8 border border-gray-200 shadow-sm ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-2xl p-8 text-center ${className}`} role="alert">
        <div className="text-red-700 font-medium mb-1">Unable to load popular routes</div>
        <div className="text-sm text-red-600 mb-1">{error}</div>
        <div className="text-xs text-red-700">Check Supabase configuration.</div>
      </div>
    );
  }

  if (!data) return null;

  const displayRoutes = data.popularRoutes.slice(0, maxRoutes);
  const displayDestinations = data.popularDestinations.slice(0, maxRoutes);
  const displayOrigins = data.popularOrigins.slice(0, maxRoutes);

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-2xl">🚂</span>
            Most Requested Routes
          </h3>
          <p className="text-sm text-gray-600">
            {data.totalDreams.toLocaleString()} dreams across {data.totalRoutes} unique routes
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      {showDestinations && (
        <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
          {([
            { key: 'routes', label: 'Routes', icon: '🛤️' },
            { key: 'destinations', label: 'Destinations', icon: '🎯' },
            { key: 'origins', label: 'Origins', icon: '🏠' }
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                selectedTab === tab.key
                  ? 'bg-white text-bot-green shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="space-y-3">
        {selectedTab === 'routes' && (
          <>
            {displayRoutes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🤔</div>
                <p>No route data available yet. Be the first to share a dream route!</p>
              </div>
            ) : (
              displayRoutes.map((route, index) => (
                <motion.div
                  key={route.route}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-bot-green/5 to-bot-blue/5 rounded-lg border border-bot-green/10 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-bot-green text-white rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {route.from.split(',')[0]} → {route.to.split(',')[0]}
                      </div>
                      <div className="text-xs text-gray-500">
                        {route.from.split(',').slice(1).join(',').trim()} → {route.to.split(',').slice(1).join(',').trim()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-bot-blue">{route.dreamCount}</div>
                    <div className="text-xs text-gray-500">{route.percentage}% of all dreams</div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {selectedTab === 'destinations' && (
          <>
            {displayDestinations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🎯</div>
                <p>No destination data available yet.</p>
              </div>
            ) : (
              displayDestinations.map((destination, index) => (
                <motion.div
                  key={destination.city}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-bot-blue/5 to-bot-green/5 rounded-lg border border-bot-blue/10 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-bot-blue text-white rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div className="font-semibold text-gray-900">{destination.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-bot-green">{destination.dreamCount}</div>
                    <div className="text-xs text-gray-500">dreams</div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}

        {selectedTab === 'origins' && (
          <>
            {displayOrigins.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🏠</div>
                <p>No origin data available yet.</p>
              </div>
            ) : (
              displayOrigins.map((origin, index) => (
                <motion.div
                  key={origin.city}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-bot-dark-green/5 to-bot-green/5 rounded-lg border border-bot-dark-green/10 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-bot-dark-green text-white rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div className="font-semibold text-gray-900">{origin.city}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-bot-green">{origin.dreamCount}</div>
                    <div className="text-xs text-gray-500">dreams</div>
                  </div>
                </motion.div>
              ))
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div>Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}</div>
          <div className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-bot-green rounded-full animate-pulse"></span>
            Live data
          </div>
        </div>
      </div>
    </div>
  );
}
