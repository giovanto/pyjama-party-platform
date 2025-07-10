/**
 * useDreams Hook
 * Custom hook for managing dreams data with SWR caching
 */

import { useState, useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { api } from '../services/api';
import type {
  Dream,
  DreamSubmission,
  UseDreamsReturn,
  SearchFilters,
  DreamSubmissionResponse,
} from '../types';

interface UseDreamsOptions {
  filters?: SearchFilters;
  refreshInterval?: number;
  revalidateOnFocus?: boolean;
  initialData?: Dream[];
}

/**
 * Hook for fetching and managing dreams data
 */
export function useDreams(options: UseDreamsOptions = {}): UseDreamsReturn {
  const {
    filters = {},
    refreshInterval = 30000, // 30 seconds
    revalidateOnFocus = true,
    initialData = [],
  } = options;

  const [optimisticDreams, setOptimisticDreams] = useState<Dream[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Create cache key based on filters
  const cacheKey = useMemo(() => {
    const key = ['dreams', filters];
    return JSON.stringify(key);
  }, [filters]);

  // SWR configuration
  const {
    data: dreamsResponse,
    error: fetchError,
    isLoading,
    mutate,
  } = useSWR(
    cacheKey,
    () => api.dreams.getDreams(filters),
    {
      refreshInterval,
      revalidateOnFocus,
      fallbackData: { dreams: initialData, pagination: { total: 0, limit: 1000, offset: 0, hasMore: false } },
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (error) => {
        console.error('Dreams fetch error:', error);
      },
    }
  );

  // Combine real dreams with optimistic updates
  const dreams = useMemo(() => {
    const realDreams = dreamsResponse?.dreams || [];
    return [...optimisticDreams, ...realDreams];
  }, [dreamsResponse?.dreams, optimisticDreams]);

  // Error handling
  const error = useMemo(() => {
    if (submitError) return submitError;
    if (fetchError) {
      if (fetchError.name === 'NetworkError') {
        return 'Network connection failed. Please check your internet connection.';
      }
      if (fetchError.name === 'RateLimitError') {
        return 'Too many requests. Please wait a moment before trying again.';
      }
      return fetchError.message || 'Failed to load dreams';
    }
    return null;
  }, [fetchError, submitError]);

  // Check if there are more dreams to load
  const hasMore = useMemo(() => {
    return dreamsResponse?.pagination?.hasMore || false;
  }, [dreamsResponse?.pagination?.hasMore]);

  /**
   * Add a dream optimistically
   */
  const addDream = useCallback(async (dreamData: Partial<Dream>) => {
    const optimisticDream: Dream = {
      id: `temp-${Date.now()}`,
      dreamer_name: dreamData.dreamer_name || '',
      origin_station: dreamData.origin_station || '',
      origin_country: dreamData.origin_country,
      origin_lat: dreamData.origin_lat,
      origin_lng: dreamData.origin_lng,
      destination_city: dreamData.destination_city || '',
      destination_country: dreamData.destination_country,
      destination_lat: dreamData.destination_lat,
      destination_lng: dreamData.destination_lng,
      email_verified: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Add optimistic update
    setOptimisticDreams(prev => [optimisticDream, ...prev]);
    setSubmitError(null);

    try {
      // Refresh the data to get the real dream
      await mutate();
      
      // Remove optimistic update after successful refresh
      setOptimisticDreams(prev => 
        prev.filter(dream => dream.id !== optimisticDream.id)
      );
    } catch (error) {
      // Remove optimistic update on error
      setOptimisticDreams(prev => 
        prev.filter(dream => dream.id !== optimisticDream.id)
      );
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add dream';
      setSubmitError(errorMessage);
      throw error;
    }
  }, [mutate]);

  /**
   * Submit a new dream
   */
  const submitDream = useCallback(async (dreamData: DreamSubmission): Promise<DreamSubmissionResponse> => {
    setSubmitError(null);
    
    try {
      const response = await api.dreams.submitDream(dreamData);
      
      // Add optimistic update
      await addDream(response.dream);
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit dream';
      setSubmitError(errorMessage);
      throw error;
    }
  }, [addDream]);

  /**
   * Refresh dreams data
   */
  const refresh = useCallback(async () => {
    setSubmitError(null);
    setOptimisticDreams([]); // Clear optimistic updates
    await mutate();
  }, [mutate]);

  /**
   * Load more dreams (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    const currentCount = dreams.length;
    const newFilters = {
      ...filters,
      offset: currentCount,
      limit: filters.limit || 20,
    };

    try {
      const response = await api.dreams.getDreams(newFilters);
      
      // Append new dreams to existing data
      await mutate(
        (currentData) => {
          if (!currentData) return response;
          
          return {
            ...response,
            dreams: [...currentData.dreams, ...response.dreams],
          };
        },
        false // Don't revalidate
      );
    } catch (error) {
      console.error('Load more error:', error);
      throw error;
    }
  }, [hasMore, isLoading, dreams.length, filters, mutate]);

  /**
   * Get dreams by station
   */
  const getDreamsByStation = useCallback(async (station: string): Promise<Dream[]> => {
    try {
      return await api.dreams.getDreamsByStation(station);
    } catch (error) {
      console.error('Get dreams by station error:', error);
      return [];
    }
  }, []);

  /**
   * Get dreams by country
   */
  const getDreamsByCountry = useCallback(async (country: string): Promise<Dream[]> => {
    try {
      return await api.dreams.getDreamsByCountry(country);
    } catch (error) {
      console.error('Get dreams by country error:', error);
      return [];
    }
  }, []);

  return {
    dreams,
    isLoading,
    error,
    addDream,
    submitDream,
    refresh,
    hasMore,
    loadMore,
    getDreamsByStation,
    getDreamsByCountry,
    
    // Additional metadata
    total: dreamsResponse?.pagination?.total || 0,
    pagination: dreamsResponse?.pagination,
    metadata: dreamsResponse?.metadata,
  };
}

export default useDreams;