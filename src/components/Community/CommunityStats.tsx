/**
 * CommunityStats Component
 * Displays community statistics and formation messages
 */

import React from 'react';
import { useStats, useDreams } from '../../hooks';
import type { CommunityStatsProps } from '../../types';

export function CommunityStats({ 
  className = '',
  showTitle = true,
  layout = 'horizontal',
}: CommunityStatsProps) {
  const { stats, isLoading: statsLoading, error: statsError } = useStats();
  const { dreams, isLoading: dreamsLoading } = useDreams();

  // Calculate community formations
  const getCommunityInfo = () => {
    if (!dreams.length) return null;

    const stationCounts = dreams.reduce((acc, dream) => {
      const station = dream.origin_station;
      acc[station] = (acc[station] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const communities = Object.entries(stationCounts)
      .filter(([, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Top 5 communities

    return {
      communities,
      totalCommunities: communities.length,
      largestCommunity: communities[0] || null,
    };
  };

  const communityInfo = getCommunityInfo();

  if (statsLoading || dreamsLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className={`text-center p-6 ${className}`}>
        <div className="text-red-500 text-2xl mb-2">⚠️</div>
        <p className="text-gray-600">Unable to load community stats</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const layoutClasses = layout === 'vertical' 
    ? 'grid grid-cols-1 gap-4' 
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4';

  return (
    <div className={`${className}`}>
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Community Statistics
          </h2>
          <p className="text-gray-600">
            See how the pajama party movement is growing across Europe
          </p>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className={layoutClasses}>
        {/* Total Dreams */}
        <div className="stats-card bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg mr-4">
              <span className="text-2xl text-blue-600">💭</span>
            </div>
            <div>
              <p className="stats-number text-2xl font-bold text-gray-900">
                {stats.total_dreams}
              </p>
              <p className="text-sm text-gray-600">Dreams Shared</p>
            </div>
          </div>
        </div>

        {/* Active Stations */}
        <div className="stats-card bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg mr-4">
              <span className="text-2xl text-green-600">🚉</span>
            </div>
            <div>
              <p className="stats-number text-2xl font-bold text-gray-900">
                {stats.active_stations}
              </p>
              <p className="text-sm text-gray-600">Active Stations</p>
            </div>
          </div>
        </div>

        {/* Communities Forming */}
        <div className="stats-card bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg mr-4">
              <span className="text-2xl text-purple-600">🎉</span>
            </div>
            <div>
              <p className="stats-number text-2xl font-bold text-gray-900">
                {stats.communities_forming}
              </p>
              <p className="text-sm text-gray-600">Communities Forming</p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Formations */}
      {communityInfo && communityInfo.communities.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎪 Active Communities
          </h3>
          <div className="community-feature bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="space-y-4">
                {communityInfo.communities.map(([station, count], index) => (
                  <div key={station} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{station}</p>
                        <p className="text-sm text-gray-600">
                          {count} dreamers ready to party!
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(count, 5))].map((_, i) => (
                        <span key={i} className="text-lg">🚂</span>
                      ))}
                      {count > 5 && <span className="text-gray-500 text-sm">+{count - 5}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Encouragement Message */}
      {stats.total_dreams > 0 && stats.communities_forming === 0 && (
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🌟</span>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Community Formation Coming Soon!
              </h3>
              <p className="text-gray-600 text-sm">
                We have {stats.total_dreams} dreamers from {stats.active_stations} stations. 
                Communities form when 2+ people share the same origin station. 
                Keep sharing your dreams!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {stats.total_dreams === 0 && (
        <div className="mt-8 text-center py-12">
          <div className="text-6xl mb-4">🚂</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Be the First Dreamer!
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            No dreams have been shared yet. Be the first to add your pajama party 
            adventure to the map and start building our community!
          </p>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Last updated: {new Date(stats.last_updated).toLocaleString()}
      </div>
    </div>
  );
}

export default CommunityStats;