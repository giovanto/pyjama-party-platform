/**
 * Platform Statistics API Endpoint
 * Provides real-time statistics about the pajama party platform
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * Platform statistics interface
 */
interface PlatformStats {
  total_dreams: number;
  active_stations: number;
  communities_forming: number;
  countries_represented: number;
  dreams_today: number;
  dreams_this_week: number;
  top_destinations: Array<{
    city: string;
    count: number;
  }>;
  top_origin_stations: Array<{
    station: string;
    country: string;
    count: number;
  }>;
  geographic_distribution: Array<{
    country: string;
    country_name: string;
    dream_count: number;
  }>;
  recent_activity: Array<{
    timeframe: string;
    dream_count: number;
  }>;
  last_updated: string;
}

/**
 * Cache configuration
 */
const CACHE_CONFIG = {
  maxAge: 300, // 5 minutes in seconds
  staleWhileRevalidate: 600, // 10 minutes
};

/**
 * Cache implementation (simple in-memory cache)
 * Note: In production, consider Redis or similar for distributed caching
 */
class StatsCache {
  private static instance: StatsCache;
  private cache = new Map<string, { data: any; timestamp: number; expires: number }>();
  
  static getInstance(): StatsCache {
    if (!StatsCache.instance) {
      StatsCache.instance = new StatsCache();
    }
    return StatsCache.instance;
  }
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(key: string, data: any, ttl: number = CACHE_CONFIG.maxAge * 1000): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expires: now + ttl,
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const cache = StatsCache.getInstance();

/**
 * Get current date boundaries for time-based queries
 */
function getDateBoundaries() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return {
    today: today.toISOString(),
    weekAgo: weekAgo.toISOString(),
    now: now.toISOString(),
  };
}

/**
 * Calculate total active dreams
 */
async function getTotalDreams(): Promise<number> {
  const { count, error } = await supabase
    .from('dreams')
    .select('*', { count: 'exact', head: true })
    .gt('expires_at', new Date().toISOString());
  
  if (error) {
    console.error('Error fetching total dreams:', error);
    return 0;
  }
  
  return count || 0;
}

/**
 * Calculate unique active stations
 */
async function getActiveStations(): Promise<number> {
  const { data, error } = await supabase
    .from('dreams')
    .select('origin_station')
    .gt('expires_at', new Date().toISOString())
    .not('origin_station', 'is', null);
  
  if (error) {
    console.error('Error fetching active stations:', error);
    return 0;
  }
  
  const uniqueStations = new Set(data?.map(dream => dream.origin_station) || []);
  return uniqueStations.size;
}

/**
 * Calculate communities forming (stations with 2+ dreamers)
 */
async function getCommunitiesForming(): Promise<number> {
  const { data, error } = await supabase
    .from('dreams')
    .select('origin_station')
    .gt('expires_at', new Date().toISOString())
    .not('origin_station', 'is', null);
  
  if (error) {
    console.error('Error fetching communities data:', error);
    return 0;
  }
  
  const stationCounts = (data || []).reduce((acc, dream) => {
    acc[dream.origin_station] = (acc[dream.origin_station] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.values(stationCounts).filter(count => count >= 2).length;
}

/**
 * Get countries represented
 */
async function getCountriesRepresented(): Promise<number> {
  const { data, error } = await supabase
    .from('dreams')
    .select('origin_country')
    .gt('expires_at', new Date().toISOString())
    .not('origin_country', 'is', null);
  
  if (error) {
    console.error('Error fetching countries data:', error);
    return 0;
  }
  
  const uniqueCountries = new Set(data?.map(dream => dream.origin_country) || []);
  return uniqueCountries.size;
}

/**
 * Get dreams count for specific timeframes
 */
async function getDreamsInTimeframe(startDate: string): Promise<number> {
  const { count, error } = await supabase
    .from('dreams')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startDate)
    .gt('expires_at', new Date().toISOString());
  
  if (error) {
    console.error('Error fetching timeframe dreams:', error);
    return 0;
  }
  
  return count || 0;
}

/**
 * Get top destinations
 */
async function getTopDestinations(limit: number = 10): Promise<Array<{ city: string; count: number }>> {
  const { data, error } = await supabase
    .from('dreams')
    .select('destination_city')
    .gt('expires_at', new Date().toISOString())
    .not('destination_city', 'is', null);
  
  if (error) {
    console.error('Error fetching destinations:', error);
    return [];
  }
  
  const destinationCounts = (data || []).reduce((acc, dream) => {
    const city = dream.destination_city.trim();
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(destinationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([city, count]) => ({ city, count }));
}

/**
 * Get top origin stations
 */
async function getTopOriginStations(limit: number = 10): Promise<Array<{ station: string; country: string; count: number }>> {
  const { data, error } = await supabase
    .from('dreams')
    .select('origin_station, origin_country')
    .gt('expires_at', new Date().toISOString())
    .not('origin_station', 'is', null);
  
  if (error) {
    console.error('Error fetching origin stations:', error);
    return [];
  }
  
  const stationCounts = (data || []).reduce((acc, dream) => {
    const key = `${dream.origin_station}|${dream.origin_country || 'Unknown'}`;
    acc[key] = {
      station: dream.origin_station,
      country: dream.origin_country || 'Unknown',
      count: (acc[key]?.count || 0) + 1,
    };
    return acc;
  }, {} as Record<string, { station: string; country: string; count: number }>);
  
  return Object.values(stationCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get geographic distribution
 */
async function getGeographicDistribution(): Promise<Array<{ country: string; country_name: string; dream_count: number }>> {
  const { data: dreamsData, error: dreamsError } = await supabase
    .from('dreams')
    .select('origin_country')
    .gt('expires_at', new Date().toISOString())
    .not('origin_country', 'is', null);
  
  if (dreamsError) {
    console.error('Error fetching geographic data:', dreamsError);
    return [];
  }
  
  // Get country names from stations table
  const { data: stationsData, error: stationsError } = await supabase
    .from('stations')
    .select('country, country_name')
    .eq('is_active', true);
  
  if (stationsError) {
    console.error('Error fetching country names:', stationsError);
  }
  
  // Create country name mapping
  const countryNames = (stationsData || []).reduce((acc, station) => {
    acc[station.country] = station.country_name;
    return acc;
  }, {} as Record<string, string>);
  
  // Count dreams by country
  const countryCounts = (dreamsData || []).reduce((acc, dream) => {
    const country = dream.origin_country;
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(countryCounts)
    .map(([country, count]) => ({
      country,
      country_name: countryNames[country] || country,
      dream_count: count,
    }))
    .sort((a, b) => b.dream_count - a.dream_count);
}

/**
 * Get recent activity (last 7 days, grouped by day)
 */
async function getRecentActivity(): Promise<Array<{ timeframe: string; dream_count: number }>> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const { data, error } = await supabase
    .from('dreams')
    .select('created_at')
    .gte('created_at', weekAgo.toISOString())
    .gt('expires_at', new Date().toISOString());
  
  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
  
  // Group by day
  const activityByDay = (data || []).reduce((acc, dream) => {
    const date = new Date(dream.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Fill in missing days with 0
  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    result.push({
      timeframe: date,
      dream_count: activityByDay[date] || 0,
    });
  }
  
  return result;
}

/**
 * Compile comprehensive platform statistics
 */
async function compileStats(): Promise<PlatformStats> {
  const dateBoundaries = getDateBoundaries();
  
  // Execute all queries in parallel for better performance
  const [
    totalDreams,
    activeStations,
    communitiesForming,
    countriesRepresented,
    dreamsToday,
    dreamsThisWeek,
    topDestinations,
    topOriginStations,
    geographicDistribution,
    recentActivity,
  ] = await Promise.all([
    getTotalDreams(),
    getActiveStations(),
    getCommunitiesForming(),
    getCountriesRepresented(),
    getDreamsInTimeframe(dateBoundaries.today),
    getDreamsInTimeframe(dateBoundaries.weekAgo),
    getTopDestinations(10),
    getTopOriginStations(10),
    getGeographicDistribution(),
    getRecentActivity(),
  ]);
  
  return {
    total_dreams: totalDreams,
    active_stations: activeStations,
    communities_forming: communitiesForming,
    countries_represented: countriesRepresented,
    dreams_today: dreamsToday,
    dreams_this_week: dreamsThisWeek,
    top_destinations: topDestinations,
    top_origin_stations: topOriginStations,
    geographic_distribution: geographicDistribution,
    recent_activity: recentActivity,
    last_updated: new Date().toISOString(),
  };
}

/**
 * Main stats API handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: `${req.method} method is not supported`,
      allowed: ['GET'],
      timestamp: new Date().toISOString(),
    });
  }
  
  try {
    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Database connection not configured',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Check cache first
    const cacheKey = 'platform_stats';
    const cachedStats = cache.get(cacheKey);
    
    if (cachedStats) {
      // Set cache headers
      res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.maxAge}, stale-while-revalidate=${CACHE_CONFIG.staleWhileRevalidate}`);
      res.setHeader('X-Cache', 'HIT');
      return res.json(cachedStats);
    }
    
    // Compile fresh statistics
    const stats = await compileStats();
    
    // Cache the results
    cache.set(cacheKey, stats);
    
    // Set cache headers
    res.setHeader('Cache-Control', `public, max-age=${CACHE_CONFIG.maxAge}, stale-while-revalidate=${CACHE_CONFIG.staleWhileRevalidate}`);
    res.setHeader('X-Cache', 'MISS');
    
    return res.json(stats);
    
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve platform statistics',
      timestamp: new Date().toISOString(),
    });
  }
}