'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDashboardData, useEventTracker } from '@/hooks/useAnalytics';

interface StationData {
  station: string;
  totalInterest: number;
  participants: number;
  organizers: number;
  recentActivity: number;
  readinessScore: number;
  momentum: 'growing' | 'steady';
  hasOrganizer: boolean;
  participationRate: number;
}

interface StationReadinessData {
  readyStations: StationData[];
  buildingStations: StationData[];
  emergingStations: StationData[];
  summary: {
    totalStations: number;
    readyCount: number;
    buildingCount: number;
    emergingCount: number;
    stationsWithParticipants: number;
    stationsWithOrganizers: number;
    coverageRate: number;
  };
  thresholds: {
    READY: number;
    BUILDING: number;
    EMERGING: number;
  };
  lastUpdated: string;
}

interface StationReadinessProps {
  className?: string;
  maxStations?: number;
}

export default function StationReadiness({ 
  className = '',
  maxStations = 5 
}: StationReadinessProps) {
  const { trackDashboardView, trackChartInteraction } = useEventTracker();
  const { data, loading, error } = useDashboardData<StationReadinessData>('/api/impact/stations-ready');
  const [selectedCategory, setSelectedCategory] = React.useState<'ready' | 'building' | 'emerging'>('ready');

  React.useEffect(() => {
    trackDashboardView('station-readiness');
  }, [trackDashboardView]);

  const handleCategoryChange = (category: 'ready' | 'building' | 'emerging') => {
    setSelectedCategory(category);
    trackChartInteraction('station-readiness', `category-${category}`);
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-2xl p-8 text-center ${className}`}>
        <div className="text-red-600 font-medium mb-2">Unable to load station readiness</div>
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const getStationsByCategory = () => {
    switch (selectedCategory) {
      case 'ready':
        return data.readyStations.slice(0, maxStations);
      case 'building':
        return data.buildingStations.slice(0, maxStations);
      case 'emerging':
        return data.emergingStations.slice(0, maxStations);
      default:
        return [];
    }
  };

  const getCategoryColor = (category: 'ready' | 'building' | 'emerging') => {
    switch (category) {
      case 'ready':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'building':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'emerging':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getReadinessIcon = (station: StationData) => {
    if (station.participants >= data.thresholds.READY) return '🚀';
    if (station.participants >= data.thresholds.BUILDING) return '🚧';
    return '🌱';
  };

  const currentStations = getStationsByCategory();

  return (
    <div className={`bg-white rounded-2xl p-6 border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <span className="text-2xl">🎪</span>
            Station Readiness
          </h3>
          <p className="text-sm text-gray-600">Critical mass for September 26th event</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            selectedCategory === 'ready' 
              ? 'bg-green-50 border-green-200 ring-2 ring-green-300' 
              : 'bg-green-50 border-green-200 hover:shadow-md'
          }`}
          onClick={() => handleCategoryChange('ready')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🚀</span>
            <span className="text-2xl font-bold text-green-600">
              {data.summary.readyCount}
            </span>
          </div>
          <div className="text-sm font-medium text-green-800">Ready Stations</div>
          <div className="text-xs text-green-600">
            {data.thresholds.READY}+ participants
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            selectedCategory === 'building' 
              ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300' 
              : 'bg-blue-50 border-blue-200 hover:shadow-md'
          }`}
          onClick={() => handleCategoryChange('building')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🚧</span>
            <span className="text-2xl font-bold text-blue-600">
              {data.summary.buildingCount}
            </span>
          </div>
          <div className="text-sm font-medium text-blue-800">Building</div>
          <div className="text-xs text-blue-600">
            {data.thresholds.BUILDING}-{data.thresholds.READY - 1} participants
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
            selectedCategory === 'emerging' 
              ? 'bg-yellow-50 border-yellow-200 ring-2 ring-yellow-300' 
              : 'bg-yellow-50 border-yellow-200 hover:shadow-md'
          }`}
          onClick={() => handleCategoryChange('emerging')}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🌱</span>
            <span className="text-2xl font-bold text-yellow-600">
              {data.summary.emergingCount}
            </span>
          </div>
          <div className="text-sm font-medium text-yellow-800">Emerging</div>
          <div className="text-xs text-yellow-600">
            {data.thresholds.EMERGING}-{data.thresholds.BUILDING - 1} participants
          </div>
        </motion.div>
      </div>

      {/* Station List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 capitalize">
            {selectedCategory} Stations
          </h4>
          <div className="text-xs text-gray-500">
            Top {maxStations} by readiness score
          </div>
        </div>

        {currentStations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">
              {selectedCategory === 'ready' ? '🎯' : selectedCategory === 'building' ? '🏗️' : '🌱'}
            </div>
            <p>
              No {selectedCategory} stations yet. 
              {selectedCategory === 'ready' && ' Be the first to reach critical mass!'}
              {selectedCategory === 'building' && ' Help build momentum at your local station!'}
              {selectedCategory === 'emerging' && ' Start the movement at your station!'}
            </p>
          </div>
        ) : (
          currentStations.map((station, index) => (
            <motion.div
              key={station.station}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">{getReadinessIcon(station)}</div>
                <div>
                  <div className="font-medium text-gray-900">{station.station}</div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{station.totalInterest} total interest</span>
                    <span>{station.participationRate}% participation</span>
                    {station.hasOrganizer && (
                      <span className="text-bot-green font-medium">📋 Has organizer</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-bot-blue mb-1">
                  {station.participants}
                </div>
                <div className="text-xs text-gray-500">participants</div>
                {station.momentum === 'growing' && (
                  <div className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Growing
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Coverage Stats */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900">{data.summary.totalStations}</div>
            <div className="text-xs text-gray-600">Total stations</div>
          </div>
          <div>
            <div className="text-lg font-bold text-bot-green">{data.summary.stationsWithOrganizers}</div>
            <div className="text-xs text-gray-600">With organizers</div>
          </div>
          <div className="sm:block hidden">
            <div className="text-lg font-bold text-bot-blue">{data.summary.coverageRate}%</div>
            <div className="text-xs text-gray-600">Coverage rate</div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}