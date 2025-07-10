/**
 * Stations Search API Endpoint
 * Provides fast search functionality for European train stations
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * Station interface
 */
interface Station {
  id: string;
  external_id: string;
  name: string;
  country: string;
  country_name: string;
  city?: string;
  lat: number;
  lng: number;
  station_type: string;
  is_active: boolean;
}

/**
 * Search configuration
 */
const SEARCH_CONFIG = {
  minQueryLength: 2,
  maxQueryLength: 100,
  defaultLimit: 20,
  maxLimit: 50,
  searchTimeout: 5000, // 5 seconds
};

/**
 * Validate search parameters
 */
function validateSearchParams(query: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!query.q || typeof query.q !== 'string') {
    errors.push('Query parameter "q" is required and must be a string');
  } else {
    const searchQuery = query.q.trim();
    if (searchQuery.length < SEARCH_CONFIG.minQueryLength) {
      errors.push(`Query must be at least ${SEARCH_CONFIG.minQueryLength} characters long`);
    }
    if (searchQuery.length > SEARCH_CONFIG.maxQueryLength) {
      errors.push(`Query must be less than ${SEARCH_CONFIG.maxQueryLength} characters long`);
    }
  }
  
  if (query.country && typeof query.country !== 'string') {
    errors.push('Country parameter must be a string');
  }
  
  if (query.limit) {
    const limit = parseInt(query.limit);
    if (isNaN(limit) || limit < 1 || limit > SEARCH_CONFIG.maxLimit) {
      errors.push(`Limit must be a number between 1 and ${SEARCH_CONFIG.maxLimit}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize search query to prevent injection attacks
 */
function sanitizeSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s\-\.\'\u00C0-\u017F]/g, '') // Allow letters, numbers, spaces, hyphens, dots, apostrophes, and accented characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, SEARCH_CONFIG.maxQueryLength);
}

/**
 * Build search query with performance optimizations
 */
function buildSearchQuery(searchTerm: string, country?: string, limit: number = SEARCH_CONFIG.defaultLimit) {
  let query = supabase
    .from('stations')
    .select(`
      id,
      external_id,
      name,
      country,
      country_name,
      city,
      lat,
      lng,
      station_type
    `)
    .eq('is_active', true);
  
  // Use different search strategies based on query length and content
  const sanitizedTerm = sanitizeSearchQuery(searchTerm);
  
  if (sanitizedTerm.length >= 3) {
    // For longer queries, use full-text search with trigrams
    query = query.or(`
      searchable.ilike.%${sanitizedTerm}%,
      name.ilike.%${sanitizedTerm}%,
      city.ilike.%${sanitizedTerm}%
    `);
  } else {
    // For shorter queries, use prefix matching
    query = query.or(`
      name.ilike.${sanitizedTerm}%,
      city.ilike.${sanitizedTerm}%
    `);
  }
  
  // Add country filter if specified
  if (country) {
    const countryCode = country.trim().toUpperCase();
    if (countryCode.length === 2) {
      query = query.eq('country', countryCode);
    }
  }
  
  // Order by relevance (exact name matches first, then by popularity/importance)
  query = query
    .order('name', { ascending: true })
    .limit(limit);
  
  return query;
}

/**
 * Calculate search relevance score
 */
function calculateRelevanceScore(station: Station, searchTerm: string): number {
  const term = searchTerm.toLowerCase();
  const name = station.name.toLowerCase();
  const city = station.city?.toLowerCase() || '';
  
  let score = 0;
  
  // Exact match gets highest score
  if (name === term) {
    score += 100;
  } else if (name.startsWith(term)) {
    score += 80;
  } else if (name.includes(term)) {
    score += 60;
  }
  
  // City matches
  if (city === term) {
    score += 40;
  } else if (city.startsWith(term)) {
    score += 30;
  } else if (city.includes(term)) {
    score += 20;
  }
  
  // Station type bonus (main stations are more relevant)
  if (station.station_type === 'station') {
    score += 10;
  }
  
  // Country relevance (prefer major countries)
  const majorCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT'];
  if (majorCountries.includes(station.country)) {
    score += 5;
  }
  
  return score;
}

/**
 * Sort stations by relevance
 */
function sortByRelevance(stations: Station[], searchTerm: string): Station[] {
  return stations
    .map(station => ({
      station,
      score: calculateRelevanceScore(station, searchTerm),
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.station);
}

/**
 * Add search metadata
 */
function addSearchMetadata(stations: Station[], searchTerm: string, country?: string) {
  const countryGroups = stations.reduce((acc, station) => {
    acc[station.country] = (acc[station.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const stationTypes = stations.reduce((acc, station) => {
    acc[station.station_type] = (acc[station.station_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    query: {
      term: searchTerm,
      country: country || null,
      sanitized_term: sanitizeSearchQuery(searchTerm),
    },
    results: {
      count: stations.length,
      countries: countryGroups,
      station_types: stationTypes,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main stations search handler
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
    
    // Validate parameters
    const validation = validateSearchParams(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: 'Please check your search parameters',
        details: validation.errors,
        timestamp: new Date().toISOString(),
      });
    }
    
    const searchTerm = req.query.q as string;
    const country = req.query.country as string;
    const limit = Math.min(
      parseInt(req.query.limit as string) || SEARCH_CONFIG.defaultLimit,
      SEARCH_CONFIG.maxLimit
    );
    
    // Execute search with timeout
    const searchPromise = buildSearchQuery(searchTerm, country, limit);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Search timeout')), SEARCH_CONFIG.searchTimeout);
    });
    
    const { data: stations, error } = await Promise.race([
      searchPromise,
      timeoutPromise,
    ]) as any;
    
    if (error) {
      throw new Error(`Database search error: ${error.message}`);
    }
    
    if (!stations) {
      return res.json({
        stations: [],
        metadata: addSearchMetadata([], searchTerm, country),
      });
    }
    
    // Sort by relevance
    const sortedStations = sortByRelevance(stations, searchTerm);
    
    // Return results
    return res.json({
      stations: sortedStations,
      metadata: addSearchMetadata(sortedStations, searchTerm, country),
    });
    
  } catch (error) {
    console.error('Stations API error:', error);
    
    if (error.message === 'Search timeout') {
      return res.status(408).json({
        error: 'Search timeout',
        message: 'Search took too long to complete. Please try a more specific query.',
        timestamp: new Date().toISOString(),
      });
    }
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to search stations',
      timestamp: new Date().toISOString(),
    });
  }
}