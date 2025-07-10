/**
 * useStations Hook
 * Custom hook for station search functionality with debouncing and caching
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { api } from '../services/api';
import type {
  Station,
  UseStationsReturn,
  StationSearchOptions,
} from '../types';

interface UseStationsOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxCacheSize?: number;
  cacheExpiryMs?: number;
}

interface CacheEntry {
  data: Station[];
  timestamp: number;
  query: string;
  options?: StationSearchOptions;
}

/**
 * Hook for station search functionality
 */
export function useStations(options: UseStationsOptions = {}): UseStationsReturn {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    maxCacheSize = 50,
    cacheExpiryMs = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');

  // Cache for search results
  const cache = useRef(new Map<string, CacheEntry>());
  const abortController = useRef<AbortController | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  /**
   * Generate cache key from query and options
   */
  const generateCacheKey = useCallback((query: string, searchOptions?: StationSearchOptions): string => {
    const key = {
      query: query.toLowerCase().trim(),
      country: searchOptions?.country?.toUpperCase(),
      limit: searchOptions?.limit,
    };
    return JSON.stringify(key);
  }, []);

  /**
   * Check if cache entry is valid
   */
  const isCacheValid = useCallback((entry: CacheEntry): boolean => {
    const now = Date.now();
    return (now - entry.timestamp) < cacheExpiryMs;
  }, [cacheExpiryMs]);

  /**
   * Get stations from cache
   */
  const getFromCache = useCallback((query: string, searchOptions?: StationSearchOptions): Station[] | null => {
    const cacheKey = generateCacheKey(query, searchOptions);
    const entry = cache.current.get(cacheKey);
    
    if (entry && isCacheValid(entry)) {
      return entry.data;
    }
    
    // Remove expired entry
    if (entry) {
      cache.current.delete(cacheKey);
    }
    
    return null;
  }, [generateCacheKey, isCacheValid]);

  /**
   * Store stations in cache
   */
  const storeInCache = useCallback((
    query: string,
    data: Station[],
    searchOptions?: StationSearchOptions
  ): void => {
    const cacheKey = generateCacheKey(query, searchOptions);
    
    // Limit cache size
    if (cache.current.size >= maxCacheSize) {
      // Remove oldest entry
      const oldestKey = cache.current.keys().next().value;
      if (oldestKey) {
        cache.current.delete(oldestKey);
      }
    }
    
    cache.current.set(cacheKey, {
      data,
      timestamp: Date.now(),
      query,
      options: searchOptions,
    });
  }, [generateCacheKey, maxCacheSize]);

  /**
   * Clear search results and reset state
   */
  const clearStations = useCallback(() => {
    setStations([]);
    setError(null);
    setLastQuery('');
    
    // Cancel any pending requests
    if (abortController.current) {
      abortController.current.abort();
      abortController.current = null;
    }
    
    // Clear debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  /**
   * Perform the actual search
   */
  const performSearch = useCallback(async (
    query: string,
    searchOptions?: StationSearchOptions
  ): Promise<void> => {
    const trimmedQuery = query.trim();
    
    // Validate query length
    if (trimmedQuery.length < minQueryLength) {
      clearStations();
      return;
    }

    // Check cache first
    const cachedResults = getFromCache(trimmedQuery, searchOptions);
    if (cachedResults) {
      setStations(cachedResults);
      setError(null);
      setLastQuery(trimmedQuery);
      return;
    }

    // Cancel previous request
    if (abortController.current) {
      abortController.current.abort();
    }

    // Create new abort controller
    abortController.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setLastQuery(trimmedQuery);

    try {
      const response = await api.stations.searchStations(trimmedQuery, searchOptions);
      
      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        return;
      }

      const stationResults = response.stations;
      
      // Store in cache
      storeInCache(trimmedQuery, stationResults, searchOptions);
      
      // Update state
      setStations(stationResults);
      setError(null);
      
    } catch (err) {
      // Ignore aborted requests
      if (abortController.current?.signal.aborted) {
        return;
      }

      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setStations([]);
      
      console.error('Station search error:', err);
    } finally {
      if (!abortController.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [minQueryLength, getFromCache, storeInCache, clearStations]);

  /**
   * Debounced search function
   */
  const searchStations = useCallback(async (
    query: string,
    searchOptions?: StationSearchOptions
  ): Promise<void> => {
    // Clear previous debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // If query is empty or too short, clear immediately
    if (!query || query.trim().length < minQueryLength) {
      clearStations();
      return;
    }

    // Debounce the search
    debounceTimer.current = setTimeout(() => {
      performSearch(query, searchOptions);
    }, debounceMs);
  }, [performSearch, clearStations, debounceMs, minQueryLength]);

  /**
   * Immediate search (no debouncing)
   */
  const searchImmediate = useCallback(async (
    query: string,
    searchOptions?: StationSearchOptions
  ): Promise<void> => {
    // Clear debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    await performSearch(query, searchOptions);
  }, [performSearch]);

  /**
   * Get stations by country
   */
  const getStationsByCountry = useCallback(async (country: string): Promise<Station[]> => {
    try {
      return await api.stations.getStationsByCountry(country);
    } catch (err) {
      console.error('Get stations by country error:', err);
      return [];
    }
  }, []);

  /**
   * Find station by exact name
   */
  const findStationByName = useCallback(async (name: string): Promise<Station | null> => {
    try {
      return await api.stations.findStationByName(name);
    } catch (err) {
      console.error('Find station by name error:', err);
      return null;
    }
  }, []);

  /**
   * Get suggestions based on current query
   */
  const suggestions = useMemo(() => {
    if (!lastQuery || lastQuery.length < minQueryLength) {
      return [];
    }
    
    // Return top 5 stations that match
    return stations.slice(0, 5);
  }, [stations, lastQuery, minQueryLength]);

  /**
   * Check if currently searching
   */
  const isSearching = useMemo(() => {
    return isLoading && lastQuery.length >= minQueryLength;
  }, [isLoading, lastQuery, minQueryLength]);

  /**
   * Get cache statistics
   */
  const cacheStats = useMemo(() => {
    const now = Date.now();
    const entries = Array.from(cache.current.values());
    const validEntries = entries.filter(entry => isCacheValid(entry));
    
    return {
      totalEntries: cache.current.size,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
    };
  }, [isCacheValid]);

  /**
   * Clear cache manually
   */
  const clearCache = useCallback(() => {
    cache.current.clear();
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Cancel any pending requests
      if (abortController.current) {
        abortController.current.abort();
      }
      
      // Clear debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    stations,
    isLoading: isSearching,
    error,
    searchStations,
    searchImmediate,
    clearStations,
    getStationsByCountry,
    findStationByName,
    
    // Additional utilities
    suggestions,
    lastQuery,
    cacheStats,
    clearCache,
  };
}

export default useStations;