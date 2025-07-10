/**
 * useStats Hook
 * Custom hook for platform statistics with caching and real-time updates
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { api } from '../services/api';
import type { PlatformStats, UseStatsReturn } from '../types';

interface UseStatsOptions {
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  enabled?: boolean;
  onUpdate?: (stats: PlatformStats) => void;
}

/**
 * Hook for fetching and managing platform statistics
 */
export function useStats(options: UseStatsOptions = {}): UseStatsReturn {
  const {
    refreshInterval = 60000, // 1 minute
    revalidateOnFocus = true,
    enabled = true,
    onUpdate,
  } = options;

  const [lastManualRefresh, setLastManualRefresh] = useState<string | null>(null);

  // SWR configuration for stats
  const {
    data: stats,
    error: fetchError,
    isLoading,
    mutate,
  } = useSWR(
    enabled ? 'platform_stats' : null,
    () => api.stats.getStats(),
    {
      refreshInterval,
      revalidateOnFocus,
      dedupingInterval: 30000, // Dedupe requests within 30 seconds
      errorRetryCount: 3,
      errorRetryInterval: 2000,
      keepPreviousData: true, // Keep showing previous data while loading new data
      onSuccess: (data) => {
        onUpdate?.(data);
      },
      onError: (error) => {
        console.error('Stats fetch error:', error);
      },
    }
  );

  // Error handling
  const error = useMemo(() => {
    if (!fetchError) return null;
    
    if (fetchError.name === 'NetworkError') {
      return 'Network connection failed. Statistics may be outdated.';
    }
    
    if (fetchError.name === 'RateLimitError') {
      return 'Too many requests. Statistics will refresh automatically.';
    }
    
    return fetchError.message || 'Failed to load statistics';
  }, [fetchError]);

  // Last updated timestamp
  const lastUpdated = useMemo(() => {
    if (lastManualRefresh) return lastManualRefresh;
    return stats?.last_updated || null;
  }, [stats?.last_updated, lastManualRefresh]);

  // Stats with calculated additional metrics
  const enhancedStats = useMemo(() => {
    if (!stats) return null;

    // Calculate additional derived metrics
    const avgDreamsPerStation = stats.active_stations > 0 
      ? Math.round((stats.total_dreams / stats.active_stations) * 10) / 10
      : 0;

    const communityFormationRate = stats.active_stations > 0
      ? Math.round((stats.communities_forming / stats.active_stations) * 100)
      : 0;

    const growthMetrics = {
      avg_dreams_per_station: avgDreamsPerStation,
      community_formation_rate: communityFormationRate,
      dreams_per_country: stats.countries_represented > 0
        ? Math.round((stats.total_dreams / stats.countries_represented) * 10) / 10
        : 0,
    };

    // Calculate trends from recent activity
    const trends = calculateTrends(stats.recent_activity);

    return {
      ...stats,
      growth_metrics: growthMetrics,
      trends,
    };
  }, [stats]);

  /**
   * Calculate trends from recent activity data
   */
  function calculateTrends(recentActivity: Array<{ timeframe: string; dream_count: number }>) {
    if (recentActivity.length < 2) {
      return {
        daily_trend: 0,
        weekly_total: recentActivity.reduce((sum, day) => sum + day.dream_count, 0),
        is_growing: false,
      };
    }

    const sorted = [...recentActivity].sort((a, b) => a.timeframe.localeCompare(b.timeframe));
    const recent = sorted.slice(-3); // Last 3 days
    const earlier = sorted.slice(0, -3);

    const recentAvg = recent.reduce((sum, day) => sum + day.dream_count, 0) / recent.length;
    const earlierAvg = earlier.length > 0 
      ? earlier.reduce((sum, day) => sum + day.dream_count, 0) / earlier.length
      : recentAvg;

    const dailyTrend = recentAvg - earlierAvg;
    const weeklyTotal = sorted.reduce((sum, day) => sum + day.dream_count, 0);

    return {
      daily_trend: Math.round(dailyTrend * 10) / 10,
      weekly_total: weeklyTotal,
      is_growing: dailyTrend > 0,
    };
  }

  /**
   * Manually refresh statistics
   */
  const refresh = useCallback(async (): Promise<void> => {
    try {
      setLastManualRefresh(new Date().toISOString());
      await mutate();
    } catch (error) {
      console.error('Manual refresh error:', error);
      throw error;
    }
  }, [mutate]);

  /**
   * Get fresh statistics (bypass cache)
   */
  const getFreshStats = useCallback(async (): Promise<PlatformStats> => {
    try {
      const freshStats = await api.stats.getStats();
      // Update the cache with fresh data
      await mutate(freshStats, false);
      return freshStats;
    } catch (error) {
      console.error('Get fresh stats error:', error);
      throw error;
    }
  }, [mutate]);

  /**
   * Get statistics with cache information
   */
  const getStatsWithCacheInfo = useCallback(async () => {
    try {
      const { stats: freshStats, fromCache } = await api.stats.getStatsWithCache();
      
      if (!fromCache) {
        // Update the cache with fresh data
        await mutate(freshStats, false);
      }
      
      return {
        stats: freshStats,
        fromCache,
        cacheAge: fromCache ? getCacheAge() : 0,
      };
    } catch (error) {
      console.error('Get stats with cache info error:', error);
      throw error;
    }
  }, [mutate]);

  /**
   * Calculate cache age in seconds
   */
  const getCacheAge = useCallback((): number => {
    if (!stats?.last_updated) return 0;
    
    const lastUpdate = new Date(stats.last_updated);
    const now = new Date();
    
    return Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
  }, [stats?.last_updated]);

  /**
   * Check if data is stale (older than refresh interval)
   */
  const isStale = useMemo(() => {
    const cacheAge = getCacheAge();
    return cacheAge > (refreshInterval / 1000);
  }, [getCacheAge, refreshInterval]);

  /**
   * Get formatted last updated time
   */
  const formattedLastUpdated = useMemo(() => {
    if (!lastUpdated) return 'Never';
    
    const date = new Date(lastUpdated);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }, [lastUpdated]);

  /**
   * Auto-refresh when tab becomes visible
   */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isStale) {
        refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh, isStale]);

  return {
    stats: enhancedStats,
    isLoading,
    error,
    refresh,
    lastUpdated,
    
    // Additional utilities
    getFreshStats,
    getStatsWithCacheInfo,
    isStale,
    cacheAge: getCacheAge(),
    formattedLastUpdated,
  };
}

export default useStats;