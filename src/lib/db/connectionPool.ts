// Database connection pooling and optimization for high-traffic loads

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

interface ConnectionPoolConfig {
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
  retryAttempts: number;
  healthCheckInterval: number;
  enableQueryOptimization: boolean;
  enableCaching: boolean;
  cacheTTL: number;
}

interface CachedQuery {
  result: any;
  timestamp: number;
  ttl: number;
}

interface QueryMetrics {
  totalQueries: number;
  totalTime: number;
  avgTime: number;
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: number;
  }>;
  cacheHits: number;
  cacheMisses: number;
}

class DatabaseConnectionPool {
  private connections: SupabaseClient[] = [];
  private config: ConnectionPoolConfig;
  private queryCache = new Map<string, CachedQuery>();
  private metrics: QueryMetrics = {
    totalQueries: 0,
    totalTime: 0,
    avgTime: 0,
    slowQueries: [],
    cacheHits: 0,
    cacheMisses: 0
  };
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config: Partial<ConnectionPoolConfig> = {}) {
    this.config = {
      maxConnections: 10,
      idleTimeout: 30000, // 30 seconds
      connectionTimeout: 5000, // 5 seconds
      retryAttempts: 3,
      healthCheckInterval: 60000, // 1 minute
      enableQueryOptimization: true,
      enableCaching: true,
      cacheTTL: 300000, // 5 minutes
      ...config
    };

    this.initializePool();
    this.startHealthCheck();
  }

  private initializePool(): void {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    for (let i = 0; i < this.config.maxConnections; i++) {
      const client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        realtime: {
          params: {
            eventsPerSecond: 10 // Limit realtime events for performance
          }
        },
        global: {
          headers: {
            'Cache-Control': 'max-age=300' // 5 minutes cache
          }
        }
      });

      this.connections.push(client);
    }
  }

  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthCheck();
      this.cleanupCache();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const client = this.getConnection();
      const start = performance.now();
      
      // Simple health check query
      await client.from('analytics_events').select('count').limit(1);
      
      const duration = performance.now() - start;
      
      if (duration > 1000) { // > 1 second indicates potential issues
        console.warn(`Database health check slow: ${duration.toFixed(2)}ms`);
      }
    } catch (error) {
      console.error('Database health check failed:', error);
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.queryCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.queryCache.delete(key);
      }
    }
  }

  private getConnection(): SupabaseClient {
    // Simple round-robin selection
    const index = this.metrics.totalQueries % this.connections.length;
    return this.connections[index];
  }

  private getCacheKey(table: string, query: any): string {
    return `${table}:${JSON.stringify(query)}`;
  }

  private updateMetrics(duration: number, query: string): void {
    this.metrics.totalQueries++;
    this.metrics.totalTime += duration;
    this.metrics.avgTime = this.metrics.totalTime / this.metrics.totalQueries;

    // Track slow queries (> 500ms)
    if (duration > 500) {
      this.metrics.slowQueries.push({
        query,
        duration,
        timestamp: Date.now()
      });

      // Keep only last 100 slow queries
      if (this.metrics.slowQueries.length > 100) {
        this.metrics.slowQueries.shift();
      }
    }
  }

  // Optimized query methods
  async query<T>(
    table: string,
    queryBuilder: (client: SupabaseClient) => Promise<{ data: T; error: any }>,
    options: { 
      cache?: boolean;
      cacheTTL?: number;
      retries?: number;
      timeout?: number;
    } = {}
  ): Promise<{ data: T; error: any; fromCache?: boolean }> {
    const {
      cache = this.config.enableCaching,
      cacheTTL = this.config.cacheTTL,
      retries = this.config.retryAttempts,
      timeout = this.config.connectionTimeout
    } = options;

    const queryString = queryBuilder.toString();
    const cacheKey = this.getCacheKey(table, queryString);
    const start = performance.now();

    // Check cache first
    if (cache) {
      const cached = this.queryCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        this.metrics.cacheHits++;
        return { data: cached.result.data, error: cached.result.error, fromCache: true };
      }
      this.metrics.cacheMisses++;
    }

    let lastError: any;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const client = this.getConnection();
        
        // Add timeout wrapper
        const queryPromise = queryBuilder(client);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Query timeout')), timeout)
        );

        const result = await Promise.race([queryPromise, timeoutPromise]) as { data: T; error: any };
        const duration = performance.now() - start;

        this.updateMetrics(duration, queryString);

        // Cache successful results
        if (cache && !result.error) {
          this.queryCache.set(cacheKey, {
            result,
            timestamp: Date.now(),
            ttl: cacheTTL
          });
        }

        return result;
      } catch (error) {
        lastError = error;
        console.warn(`Query attempt ${attempt + 1} failed:`, error);
        
        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    const duration = performance.now() - start;
    this.updateMetrics(duration, queryString);

    return { data: null as T, error: lastError };
  }

  // Quota-safe methods for anonymous access
  async getDreams(limit: number = 100): Promise<{ data: any[]; error: any; fromCache?: boolean }> {
    return this.query(
      'dreams',
      (client) => client
        .from('dreams')
        .select(`
          id,
          dreamer_name,
          from_station,
          to_station,
          from_longitude,
          from_latitude,
          to_longitude,
          to_latitude,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit),
      { cache: true, cacheTTL: 60000 } // 1 minute cache for dreams
    );
  }

  async getAnalyticsEvents(limit: number = 1000): Promise<{ data: any[]; error: any; fromCache?: boolean }> {
    return this.query(
      'analytics_events',
      (client) => client
        .from('analytics_events')
        .select(`
          event_name,
          event_data,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(limit),
      { cache: true, cacheTTL: 300000 } // 5 minute cache for analytics
    );
  }

  async getImpactStats(): Promise<{ data: any; error: any; fromCache?: boolean }> {
    return this.query(
      'impact_stats',
      async (client) => {
        // Use optimized aggregation queries
        const [dreamsCount, stationsCount, routesCount] = await Promise.all([
          client.from('dreams').select('count', { count: 'exact', head: true }),
          client.from('dreams').select('from_station', { distinct: true }).select('count', { count: 'exact', head: true }),
          client.from('dreams').select('id').limit(1000) // Limit for performance
        ]);

        return {
          data: {
            total_dreams: dreamsCount.count || 0,
            unique_stations: stationsCount.count || 0,
            active_routes: routesCount.data?.length || 0
          },
          error: null
        };
      },
      { cache: true, cacheTTL: 600000 } // 10 minute cache for stats
    );
  }

  // Performance monitoring methods
  getMetrics(): QueryMetrics {
    return { ...this.metrics };
  }

  getCacheStats(): { size: number; hitRate: number } {
    const totalRequests = this.metrics.cacheHits + this.metrics.cacheMisses;
    const hitRate = totalRequests > 0 ? (this.metrics.cacheHits / totalRequests) * 100 : 0;
    
    return {
      size: this.queryCache.size,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  // Cleanup
  destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
    this.queryCache.clear();
    this.connections = [];
  }
}

// Singleton instance for the application
let dbPool: DatabaseConnectionPool | null = null;

export function getDBPool(): DatabaseConnectionPool {
  if (!dbPool) {
    dbPool = new DatabaseConnectionPool({
      maxConnections: process.env.NODE_ENV === 'production' ? 15 : 5,
      enableCaching: true,
      cacheTTL: process.env.NODE_ENV === 'production' ? 300000 : 60000, // 5 min prod, 1 min dev
      enableQueryOptimization: true
    });
  }
  return dbPool;
}

// Export for API routes
export { DatabaseConnectionPool };
export type { ConnectionPoolConfig, QueryMetrics };