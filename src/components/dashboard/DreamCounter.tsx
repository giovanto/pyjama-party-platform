'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDashboardData, useEventTracker } from '@/hooks/useAnalytics';

interface DreamsCountData {
  totalDreams: number;
  participationSignups: number;
  todayDreams: number;
  lastUpdated: string;
  metrics: {
    momentum: 'growing' | 'steady';
    participationRate: number;
  };
}

interface DreamCounterProps {
  className?: string;
  refreshInterval?: number;
}

export default function DreamCounter({ className = '', refreshInterval = 30000 }: DreamCounterProps) {
  const { trackDashboardView } = useEventTracker();
  const { data, loading, error } = useDashboardData<DreamsCountData>('/api/impact/dreams-count', refreshInterval);

  React.useEffect(() => {
    trackDashboardView('dream-counter');
  }, [trackDashboardView]);

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-2xl p-8 border border-bot-green/20 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-16 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-2xl p-8 text-center ${className}`}>
        <div className="text-red-600 font-medium mb-2">Unable to load dream counter</div>
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={`bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-2xl p-8 border border-bot-green/20 text-center ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
          <span className="text-2xl">💭</span>
          Dreams Shared Across Europe
        </h3>
        <p className="text-sm text-gray-600">Real-time advocacy momentum</p>
      </div>

      {/* Main Counter */}
      <div className="mb-8">
        <motion.div
          key={data.totalDreams}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.3 }}
          className="text-6xl sm:text-7xl font-bold text-transparent bg-gradient-to-r from-bot-green to-bot-blue bg-clip-text mb-2"
        >
          {data.totalDreams.toLocaleString()}
        </motion.div>
        <div className="text-lg text-gray-700 font-medium">Total Night Train Dreams</div>
      </div>

      {/* Sub-metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white/60 rounded-xl p-4 border border-bot-green/20">
          <motion.div
            key={data.participationSignups}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="text-3xl font-bold text-bot-blue mb-1"
          >
            {data.participationSignups.toLocaleString()}
          </motion.div>
          <div className="text-sm text-gray-600">Ready for Sept 26th</div>
          <div className="text-xs text-bot-green font-medium mt-1">
            {data.metrics.participationRate}% participation rate
          </div>
        </div>

        <div className="bg-white/60 rounded-xl p-4 border border-bot-blue/20">
          <motion.div
            key={data.todayDreams}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.2, delay: 0.2 }}
            className="text-3xl font-bold text-bot-green mb-1"
          >
            {data.todayDreams.toLocaleString()}
          </motion.div>
          <div className="text-sm text-gray-600">Dreams Today</div>
          <div className="text-xs flex items-center justify-center gap-1 mt-1">
            <span className={`inline-block w-2 h-2 rounded-full ${
              data.metrics.momentum === 'growing' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></span>
            <span className="text-gray-500 capitalize">{data.metrics.momentum}</span>
          </div>
        </div>
      </div>

      {/* Impact Message */}
      <div className="bg-bot-green/10 rounded-xl p-4 border border-bot-green/30">
        <div className="text-sm font-medium text-bot-dark-green mb-2">
          🌍 Policy Impact
        </div>
        <div className="text-xs text-gray-700 leading-relaxed">
          Every dream strengthens our case to European policymakers that citizens want sustainable transport. 
          This data will be presented to transport ministers across Europe.
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-xs text-gray-500">
        Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}
      </div>
    </div>
  );
}