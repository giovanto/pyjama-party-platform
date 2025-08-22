'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DreamActivity {
  id: string;
  from: string;
  to: string;
  timestamp: Date;
  country: string;
}

export interface ParticipationStats {
  totalParticipants: number;
  stationsReady: number;
  dreamsShared: number;
  routesPlanned: number;
  organizersActive: number;
  communityMembers: number;
}

export interface RecentActivityProps {
  className?: string;
  variant?: 'full' | 'compact' | 'ticker';
  showTicker?: boolean;
  showCounters?: boolean;
  showGrowth?: boolean;
  maxItems?: number;
}

/**
 * DreamsTicker - Shows recent dreams in a scrolling ticker
 */
export function DreamsTicker({ 
  className = '',
  speed = 'normal',
  maxItems = 10 
}: { 
  className?: string;
  speed?: 'slow' | 'normal' | 'fast';
  maxItems?: number;
}) {
  const [dreams, setDreams] = useState<DreamActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching recent dreams from API
    const fetchRecentDreams = async () => {
      try {
        // In a real app, this would be an API call to /api/dreams/recent
        const mockDreams: DreamActivity[] = [
          { id: '1', from: 'Amsterdam', to: 'Barcelona', timestamp: new Date(Date.now() - 120000), country: 'NL' },
          { id: '2', from: 'Berlin', to: 'Rome', timestamp: new Date(Date.now() - 300000), country: 'DE' },
          { id: '3', from: 'Paris', to: 'Stockholm', timestamp: new Date(Date.now() - 450000), country: 'FR' },
          { id: '4', from: 'Vienna', to: 'Prague', timestamp: new Date(Date.now() - 600000), country: 'AT' },
          { id: '5', from: 'Madrid', to: 'Lisbon', timestamp: new Date(Date.now() - 800000), country: 'ES' },
          { id: '6', from: 'Brussels', to: 'Copenhagen', timestamp: new Date(Date.now() - 1000000), country: 'BE' },
          { id: '7', from: 'Munich', to: 'Zurich', timestamp: new Date(Date.now() - 1200000), country: 'DE' },
          { id: '8', from: 'Lyon', to: 'Milan', timestamp: new Date(Date.now() - 1400000), country: 'FR' },
        ];
        
        setDreams(mockDreams.slice(0, maxItems));
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch recent dreams:', error);
        setLoading(false);
      }
    };

    fetchRecentDreams();
    const interval = setInterval(fetchRecentDreams, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [maxItems]);

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const animationDuration = speed === 'slow' ? 60 : speed === 'fast' ? 20 : 40;

  if (loading) {
    return (
      <div className={`bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-lg border border-bot-green/20 ${className}`}>
      <div className="p-3 border-b border-bot-green/20">
        <h3 className="text-sm font-semibold text-bot-dark-green flex items-center">
          <span className="mr-2">✨</span>
          Recent Dreams
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-bot-green/20 text-bot-dark-green">
            Live
          </span>
        </h3>
      </div>
      
      <div className="relative overflow-hidden h-32">
        <motion.div
          className="flex flex-col space-y-2 p-3"
          animate={{
            y: [0, -dreams.length * 40]
          }}
          transition={{
            duration: animationDuration,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {[...dreams, ...dreams].map((dream, index) => (
            <motion.div
              key={`${dream.id}-${index}`}
              className="flex items-center justify-between bg-white/60 rounded-lg p-2 text-sm"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-bot-green animate-pulse"></div>
                <span className="font-medium text-gray-900">
                  {dream.from} → {dream.to}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {getTimeAgo(dream.timestamp)}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * ParticipationCounters - Shows real-time participation statistics
 */
export function ParticipationCounters({ 
  className = '',
  animated = true 
}: { 
  className?: string;
  animated?: boolean;
}) {
  const [stats, setStats] = useState<ParticipationStats>({
    totalParticipants: 0,
    stationsReady: 0,
    dreamsShared: 0,
    routesPlanned: 0,
    organizersActive: 0,
    communityMembers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real app, this would be an API call to /api/stats
        const mockStats: ParticipationStats = {
          totalParticipants: 1247,
          stationsReady: 18,
          dreamsShared: 2856,
          routesPlanned: 842,
          organizersActive: 34,
          communityMembers: 573
        };
        
        setStats(mockStats);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { key: 'dreamsShared', label: 'Dreams Shared', icon: '✨', color: 'text-amber-600' },
    { key: 'totalParticipants', label: 'Participants', icon: '🎉', color: 'text-blue-600' },
    { key: 'stationsReady', label: 'Stations Ready', icon: '🚂', color: 'text-green-600' },
    { key: 'routesPlanned', label: 'Routes Planned', icon: '🗺️', color: 'text-purple-600' },
    { key: 'organizersActive', label: 'Organizers', icon: '👥', color: 'text-emerald-600' },
    { key: 'communityMembers', label: 'Community', icon: '🌍', color: 'text-pink-600' }
  ];

  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 text-center shadow-sm border animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className}`}>
      {statItems.map((item, index) => {
        const value = stats[item.key as keyof ParticipationStats];
        
        return (
          <motion.div
            key={item.key}
            className="bg-white rounded-lg p-4 text-center shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            initial={animated ? { opacity: 0, y: 20 } : {}}
            animate={animated ? { opacity: 1, y: 0 } : {}}
            transition={animated ? { delay: index * 0.1 } : {}}
            whileHover={animated ? { scale: 1.05 } : {}}
          >
            <div className={`text-2xl mb-1 ${item.color}`}>
              {item.icon}
            </div>
            <motion.div
              className={`text-2xl font-bold ${item.color} mb-1`}
              initial={animated ? { scale: 0 } : {}}
              animate={animated ? { scale: 1 } : {}}
              transition={animated ? { delay: index * 0.1 + 0.2, type: "spring" } : {}}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.div>
            <div className="text-xs text-gray-600 font-medium">
              {item.label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * CommunityGrowth - Shows movement growth visualization
 */
export function CommunityGrowth({ 
  className = '',
  timeframe = '7d' 
}: { 
  className?: string;
  timeframe?: '24h' | '7d' | '30d';
}) {
  const [growthData, setGrowthData] = useState({
    percentage: 0,
    trend: 'up' as 'up' | 'down' | 'stable',
    newMembers: 0,
    totalGrowth: 0
  });

  useEffect(() => {
    // Simulate fetching growth data
    const mockGrowth = {
      percentage: 23.5,
      trend: 'up' as const,
      newMembers: 147,
      totalGrowth: 342
    };
    
    setGrowthData(mockGrowth);
  }, [timeframe]);

  const getTrendIcon = () => {
    switch (growthData.trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      default:
        return '📊';
    }
  };

  const getTrendColor = () => {
    switch (growthData.trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Movement Growth</h3>
        <select
          value={timeframe}
          onChange={(e) => setGrowthData({ ...growthData })}
          className="text-sm border border-gray-300 rounded-lg px-2 py-1"
        >
          <option value="24h">Last 24h</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${getTrendColor()} flex items-center justify-center`}>
            <span className="mr-2">{getTrendIcon()}</span>
            +{growthData.percentage}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Growth Rate</p>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-emerald-600">
            +{growthData.newMembers.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600 mt-1">New Members</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-green-200">
        <p className="text-sm text-gray-700 text-center">
          <span className="font-medium text-emerald-600">
            +{growthData.totalGrowth} people
          </span>{' '}
          joined the climate action movement this {timeframe === '24h' ? 'day' : timeframe === '7d' ? 'week' : 'month'}
        </p>
      </div>
    </div>
  );
}

/**
 * RecentActivity - Main component combining all social proof elements
 */
export function RecentActivity({
  className = '',
  variant = 'full',
  showTicker = true,
  showCounters = true,
  showGrowth = true,
  maxItems = 10
}: RecentActivityProps) {
  if (variant === 'compact') {
    return (
      <div className={`space-y-4 ${className}`}>
        {showCounters && (
          <ParticipationCounters animated={false} />
        )}
        {showTicker && (
          <DreamsTicker maxItems={5} speed="fast" />
        )}
      </div>
    );
  }

  if (variant === 'ticker') {
    return (
      <div className={className}>
        <DreamsTicker maxItems={maxItems} />
      </div>
    );
  }

  // Full variant
  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Live Movement Activity
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          See how our community is growing and taking action for sustainable transport across Europe
        </p>
      </div>

      {showCounters && (
        <ParticipationCounters />
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {showTicker && (
          <DreamsTicker maxItems={maxItems} />
        )}
        
        {showGrowth && (
          <CommunityGrowth />
        )}
      </div>
    </div>
  );
}

export default RecentActivity;