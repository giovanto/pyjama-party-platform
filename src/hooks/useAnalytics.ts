'use client';

import React from 'react';
import { useAnalytics as useAnalyticsProvider } from '@/components/layout';

// Re-export analytics hook for easier imports
export const useAnalytics = useAnalyticsProvider;

/**
 * Hook for tracking specific events with pre-defined properties
 */
export function useEventTracker() {
  const { trackEvent, hasConsent } = useAnalyticsProvider();

  const trackDashboardView = (page: string) => {
    trackEvent('dashboard_view', { page });
  };

  const trackDataExport = (exportType: 'csv' | 'json', dataType: string) => {
    trackEvent('data_export', { exportType, dataType });
  };

  const trackChartInteraction = (chartType: string, interaction: string) => {
    trackEvent('chart_interaction', { chartType, interaction });
  };

  const trackMapInteraction = (action: string, details?: Record<string, string | number>) => {
    trackEvent('map_interaction', { action, ...details });
  };

  return {
    trackDashboardView,
    trackDataExport,
    trackChartInteraction,
    trackMapInteraction,
    hasConsent,
  };
}

/**
 * Hook for fetching dashboard data with caching
 */
export function useDashboardData<T>(endpoint: string, refreshInterval?: number) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(endpoint, {
        headers: {
          'Cache-Control': 'max-age=300' // 5 minute cache
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
    
    if (refreshInterval && refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [endpoint, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}