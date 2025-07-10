/**
 * API Service Layer
 * Centralized API communication with error handling and type safety
 */

import type {
  Dream,
  DreamSubmission,
  DreamsResponse,
  DreamSubmissionResponse,
  Station,
  StationsResponse,
  PlatformStats,
  ApiError,
  StationSearchOptions,
  SearchFilters,
} from '../types';

// =====================================================
// Configuration
// =====================================================

const API_CONFIG = {
  baseUrl: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

// =====================================================
// Error Classes
// =====================================================

export class ApiError extends Error implements ApiError {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any,
    public timestamp?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network request failed') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timeout') {
    super(message, 408, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded', public retryAfter?: number) {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

// =====================================================
// Utility Functions
// =====================================================

/**
 * Create timeout promise for request cancellation
 */
function createTimeoutPromise(timeout: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError()), timeout);
  });
}

/**
 * Add delay for retry logic
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const errorData = await response.json();
    
    if (response.status === 429) {
      return new RateLimitError(
        errorData.message || 'Rate limit exceeded',
        errorData.retryAfter
      );
    }
    
    if (response.status === 400) {
      return new ValidationError(
        errorData.message || 'Validation failed',
        errorData.details
      );
    }
    
    return new ApiError(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      response.status,
      errorData.error,
      errorData.details,
      errorData.timestamp
    );
  } catch {
    return new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =====================================================
// Core API Client
// =====================================================

class ApiClient {
  private requestId: string = '';
  
  /**
   * Make HTTP request with retry logic and error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    attempt: number = 1
  ): Promise<T> {
    this.requestId = generateRequestId();
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': this.requestId,
        ...options.headers,
      },
      ...options,
    };
    
    try {
      // Create request promise with timeout
      const requestPromise = fetch(url, defaultOptions);
      const timeoutPromise = createTimeoutPromise(API_CONFIG.timeout);
      
      const response = await Promise.race([requestPromise, timeoutPromise]);
      
      // Handle HTTP errors
      if (!response.ok) {
        const error = await parseErrorResponse(response);
        
        // Retry on 5xx errors or rate limiting (with backoff)
        if (
          (response.status >= 500 || response.status === 429) &&
          attempt < API_CONFIG.retries
        ) {
          const retryDelay = API_CONFIG.retryDelay * Math.pow(2, attempt - 1);
          console.warn(`Request failed, retrying in ${retryDelay}ms (attempt ${attempt}/${API_CONFIG.retries})`);
          await delay(retryDelay);
          return this.makeRequest<T>(endpoint, options, attempt + 1);
        }
        
        throw error;
      }
      
      // Parse successful response
      const data = await response.json();
      return data;
      
    } catch (error) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new NetworkError('Network request failed. Please check your connection.');
      }
      
      // Re-throw known errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle unexpected errors
      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500,
        'UNKNOWN_ERROR'
      );
    }
  }
  
  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, API_CONFIG.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    
    return this.makeRequest<T>(url.pathname + url.search);
  }
  
  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
  
  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// =====================================================
// API Service Instances
// =====================================================

const apiClient = new ApiClient();

// =====================================================
// Dreams API Service
// =====================================================

export const dreamsAPI = {
  /**
   * Get dreams with optional filtering and pagination
   */
  async getDreams(filters: SearchFilters = {}): Promise<DreamsResponse> {
    const params = {
      limit: filters.limit || 1000,
      offset: filters.offset || 0,
      ...(filters.country && { country: filters.country }),
      ...(filters.station && { station: filters.station }),
    };
    
    return apiClient.get<DreamsResponse>('/dreams', params);
  },
  
  /**
   * Submit a new dream
   */
  async submitDream(dreamData: DreamSubmission): Promise<DreamSubmissionResponse> {
    // Validate required fields
    if (!dreamData.dreamer_name || !dreamData.origin_station || !dreamData.destination_city) {
      throw new ValidationError('Missing required fields', {
        required: ['dreamer_name', 'origin_station', 'destination_city'],
      });
    }
    
    return apiClient.post<DreamSubmissionResponse>('/dreams', dreamData);
  },
  
  /**
   * Get dreams for a specific station (community feature)
   */
  async getDreamsByStation(station: string): Promise<Dream[]> {
    const response = await this.getDreams({ station, limit: 100 });
    return response.dreams;
  },
  
  /**
   * Get dreams for a specific country
   */
  async getDreamsByCountry(country: string): Promise<Dream[]> {
    const response = await this.getDreams({ country, limit: 500 });
    return response.dreams;
  },
};

// =====================================================
// Stations API Service
// =====================================================

export const stationsAPI = {
  /**
   * Search stations by query with optional filtering
   */
  async searchStations(
    query: string,
    options: StationSearchOptions = {}
  ): Promise<StationsResponse> {
    if (!query || query.trim().length < 2) {
      throw new ValidationError('Search query must be at least 2 characters long');
    }
    
    const params = {
      q: query.trim(),
      limit: options.limit || 20,
      ...(options.country && { country: options.country }),
    };
    
    return apiClient.get<StationsResponse>('/stations', params);
  },
  
  /**
   * Get stations by country
   */
  async getStationsByCountry(country: string): Promise<Station[]> {
    const response = await this.searchStations('', { country, limit: 50 });
    return response.stations;
  },
  
  /**
   * Find station by exact name
   */
  async findStationByName(name: string): Promise<Station | null> {
    try {
      const response = await this.searchStations(name, { limit: 1 });
      const exactMatch = response.stations.find(
        station => station.name.toLowerCase() === name.toLowerCase()
      );
      return exactMatch || null;
    } catch {
      return null;
    }
  },
};

// =====================================================
// Statistics API Service
// =====================================================

export const statsAPI = {
  /**
   * Get platform statistics
   */
  async getStats(): Promise<PlatformStats> {
    return apiClient.get<PlatformStats>('/stats');
  },
  
  /**
   * Get stats with caching awareness
   */
  async getStatsWithCache(): Promise<{ stats: PlatformStats; fromCache: boolean }> {
    try {
      const response = await fetch(`${API_CONFIG.baseUrl}/stats`);
      const stats = await response.json();
      const fromCache = response.headers.get('X-Cache') === 'HIT';
      
      return { stats, fromCache };
    } catch (error) {
      const stats = await this.getStats();
      return { stats, fromCache: false };
    }
  },
};

// =====================================================
// Health and Monitoring
// =====================================================

export const healthAPI = {
  /**
   * Check API health
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const stats = await statsAPI.getStats();
      return {
        status: 'healthy',
        timestamp: stats.last_updated,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  },
  
  /**
   * Get cleanup service status
   */
  async getCleanupStatus(): Promise<any> {
    return apiClient.get('/cleanup');
  },
};

// =====================================================
// Batch Operations
// =====================================================

export const batchAPI = {
  /**
   * Get initial app data (dreams + stats)
   */
  async getInitialData(): Promise<{
    dreams: Dream[];
    stats: PlatformStats;
    timestamp: string;
  }> {
    try {
      const [dreamsResponse, stats] = await Promise.all([
        dreamsAPI.getDreams({ limit: 100 }),
        statsAPI.getStats(),
      ]);
      
      return {
        dreams: dreamsResponse.dreams,
        stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to load initial data:', error);
      throw error;
    }
  },
  
  /**
   * Refresh all data
   */
  async refreshAllData(): Promise<{
    dreams: Dream[];
    stats: PlatformStats;
    timestamp: string;
  }> {
    return this.getInitialData();
  },
};

// =====================================================
// Export Default API Object
// =====================================================

export const api = {
  dreams: dreamsAPI,
  stations: stationsAPI,
  stats: statsAPI,
  health: healthAPI,
  batch: batchAPI,
  
  // Error classes for external use
  ApiError,
  NetworkError,
  TimeoutError,
  ValidationError,
  RateLimitError,
};

export default api;