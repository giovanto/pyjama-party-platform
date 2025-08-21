'use client';

import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

interface DreamData {
  dreams: any[];
  total: number;
  lastUpdate: Date;
}

interface DataContextType {
  dreamData: DreamData | null;
  isLoading: boolean;
  error: string | null;
  refetchDreams: () => Promise<void>;
  subscribeToUpdates: (callback: (data: DreamData) => void) => () => void;
}

const DataContext = createContext<DataContextType | null>(null);

// Global singleton for data management
class DataManager {
  private static instance: DataManager;
  private data: DreamData | null = null;
  private isLoading = false;
  private error: string | null = null;
  private subscribers = new Set<(data: DreamData) => void>();
  private updateInterval: NodeJS.Timeout | null = null;
  private requestCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private readonly UPDATE_INTERVAL = 60000; // 60 seconds
  private lastFetchTime = 0;
  private readonly MIN_FETCH_INTERVAL = 5000; // Minimum 5 seconds between fetches

  static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  private constructor() {
    // Start update interval when first subscriber is added
    this.startUpdateInterval();
    
    // Stop updates when page is hidden
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
  }

  private handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.startUpdateInterval();
      // Fetch immediately if data is stale
      if (!this.data || Date.now() - this.data.lastUpdate.getTime() > 30000) {
        this.fetchDreams();
      }
    } else {
      this.stopUpdateInterval();
    }
  }

  private startUpdateInterval() {
    if (this.updateInterval) return;
    
    this.updateInterval = setInterval(() => {
      if (this.subscribers.size > 0 && document.visibilityState === 'visible') {
        this.fetchDreams();
      }
    }, this.UPDATE_INTERVAL);
  }

  private stopUpdateInterval() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private getCachedData(key: string): any | null {
    const cached = this.requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any) {
    this.requestCache.set(key, { data, timestamp: Date.now() });
  }

  async fetchDreams(force = false): Promise<void> {
    // Prevent excessive API calls
    const now = Date.now();
    if (!force && now - this.lastFetchTime < this.MIN_FETCH_INTERVAL) {
      return;
    }

    const cacheKey = 'dreams_data';
    const cached = this.getCachedData(cacheKey);
    
    if (!force && cached && !this.isLoading) {
      if (!this.data || this.data.total !== cached.total) {
        this.data = cached;
        this.notifySubscribers();
      }
      return;
    }

    if (this.isLoading) return;

    this.isLoading = true;
    this.error = null;
    this.lastFetchTime = now;

    try {
      const response = await fetch('/api/dreams', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const dreamData: DreamData = {
        dreams: data.dreams || [],
        total: data.total || 0,
        lastUpdate: new Date()
      };

      this.data = dreamData;
      this.setCachedData(cacheKey, dreamData);
      this.notifySubscribers();

    } catch (error) {
      console.error('Error fetching dreams:', error);
      this.error = error instanceof Error ? error.message : 'Failed to fetch dreams';
      this.notifySubscribers();
    } finally {
      this.isLoading = false;
    }
  }

  subscribe(callback: (data: DreamData) => void): () => void {
    this.subscribers.add(callback);
    
    // Fetch data if we don't have it yet
    if (!this.data && !this.isLoading) {
      this.fetchDreams();
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      if (this.subscribers.size === 0) {
        this.stopUpdateInterval();
      }
    };
  }

  private notifySubscribers() {
    if (this.data) {
      this.subscribers.forEach(callback => callback(this.data!));
    }
  }

  getData() {
    return this.data;
  }

  getIsLoading() {
    return this.isLoading;
  }

  getError() {
    return this.error;
  }
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const dataManager = useRef(DataManager.getInstance());
  const [dreamData, setDreamData] = useState<DreamData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = dataManager.current.subscribe((data: DreamData) => {
      setDreamData(data);
      setIsLoading(dataManager.current.getIsLoading());
      setError(dataManager.current.getError());
    });

    // Set initial state
    setDreamData(dataManager.current.getData());
    setIsLoading(dataManager.current.getIsLoading());
    setError(dataManager.current.getError());

    return unsubscribe;
  }, []);

  const refetchDreams = useCallback(async () => {
    await dataManager.current.fetchDreams(true);
  }, []);

  const subscribeToUpdates = useCallback((callback: (data: DreamData) => void) => {
    return dataManager.current.subscribe(callback);
  }, []);

  return (
    <DataContext.Provider value={{
      dreamData,
      isLoading,
      error,
      refetchDreams,
      subscribeToUpdates
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}

// Hook for components that need dream data
export function useDreams() {
  const { dreamData, isLoading, error, refetchDreams } = useDataContext();
  
  return {
    dreams: dreamData?.dreams || [],
    total: dreamData?.total || 0,
    lastUpdate: dreamData?.lastUpdate,
    isLoading,
    error,
    refetch: refetchDreams
  };
}