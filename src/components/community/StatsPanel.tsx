'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StatsData {
  totalDreams: number;
  totalDreamers: number;
  topRoutes: Array<{
    from: string;
    to: string;
    count: number;
  }>;
  topCountries: Array<{
    country: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: 'dream' | 'party';
    location: string;
    timestamp: string;
  }>;
  campaignGoals: {
    dreamsTarget: number;
    dreamersTarget: number;
    partiesTarget: number;
    currentParties: number;
  };
}

interface StatsPanelProps {
  className?: string;
}

export default function StatsPanel({ className = '' }: StatsPanelProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError('Failed to load community stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className={`stats-panel bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`stats-panel bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="text-center text-gray-600">
          <div className="text-2xl mb-2">📊</div>
          <p className="text-sm">{error || 'No stats available'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`stats-panel bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-bot-dark mb-6">Community Impact</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div 
          className="text-center p-4 bg-bot-light-green bg-opacity-20 rounded-lg"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold text-bot-green">{stats.totalDreams}</div>
          <div className="text-sm text-gray-600">Dream Routes</div>
        </motion.div>
        
        <motion.div 
          className="text-center p-4 bg-bot-blue rounded-lg"
          whileHover={{ scale: 1.05 }}
        >
          <div className="text-3xl font-bold text-white">{stats.totalDreamers}</div>
          <div className="text-sm text-white/80">Active Dreamers</div>
        </motion.div>
      </div>

      {/* Progress Bars */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-bot-dark mb-4">Campaign Progress</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Dream Routes</span>
              <span>{stats.totalDreams} / {stats.campaignGoals.dreamsTarget}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-bot-green h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(stats.totalDreams, stats.campaignGoals.dreamsTarget)}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Active Dreamers</span>
              <span>{stats.totalDreamers} / {stats.campaignGoals.dreamersTarget}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-bot-blue h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(stats.totalDreamers, stats.campaignGoals.dreamersTarget)}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Pajama Parties</span>
              <span>{stats.campaignGoals.currentParties} / {stats.campaignGoals.partiesTarget}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div 
                className="bg-purple-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage(stats.campaignGoals.currentParties, stats.campaignGoals.partiesTarget)}%` }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Top Routes */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-bot-dark mb-4">Most Wanted Routes</h3>
        <div className="space-y-2">
          {stats.topRoutes.slice(0, 5).map((route, index) => (
            <motion.div 
              key={`${route.from}-${route.to}`}
              className="flex justify-between items-center p-2 rounded hover:bg-gray-50"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span className="text-sm font-medium">
                {route.from} → {route.to}
              </span>
              <span className="text-sm text-bot-green font-semibold">
                {route.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-bot-dark mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {stats.recentActivity.slice(0, 5).map((activity, index) => (
            <motion.div 
              key={index}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="text-lg">
                {activity.type === 'dream' ? '💭' : '🎉'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">
                  {activity.type === 'dream' ? 'New dream route' : 'Pajama party'}
                </div>
                <div className="text-xs text-gray-600">{activity.location}</div>
              </div>
              <div className="text-xs text-gray-400">
                {formatTimeAgo(activity.timestamp)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}