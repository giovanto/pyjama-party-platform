/**
 * Dreams API Endpoint
 * Handles GET (retrieve dreams) and POST (submit dreams) requests
 */

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createAPIResponse, createErrorResponse } from './_middleware';

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * Dream submission interface
 */
interface DreamSubmission {
  dreamer_name: string;
  origin_station: string;
  origin_country?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_city: string;
  destination_country?: string;
  destination_lat?: number;
  destination_lng?: number;
  email?: string;
}

/**
 * Database dream interface
 */
interface Dream {
  id: string;
  dreamer_name: string;
  origin_station: string;
  origin_country?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_city: string;
  destination_country?: string;
  destination_lat?: number;
  destination_lng?: number;
  email?: string;
  email_verified: boolean;
  created_at: string;
  expires_at: string;
}

/**
 * Validation rules for dream submission
 */
const VALIDATION_RULES = {
  dreamer_name: {
    required: true,
    minLength: 2,
    maxLength: 255,
    pattern: /^[a-zA-ZÀ-ÿ\s\-'\.]+$/,
  },
  origin_station: {
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  destination_city: {
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  coordinates: {
    latRange: [-90, 90],
    lngRange: [-180, 180],
  },
};

/**
 * Validate dream submission data
 */
function validateDreamSubmission(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.dreamer_name || typeof data.dreamer_name !== 'string') {
    errors.push('dreamer_name is required and must be a string');
  } else {
    const name = data.dreamer_name.trim();
    if (name.length < VALIDATION_RULES.dreamer_name.minLength) {
      errors.push(`dreamer_name must be at least ${VALIDATION_RULES.dreamer_name.minLength} characters`);
    }
    if (name.length > VALIDATION_RULES.dreamer_name.maxLength) {
      errors.push(`dreamer_name must be less than ${VALIDATION_RULES.dreamer_name.maxLength} characters`);
    }
    if (!VALIDATION_RULES.dreamer_name.pattern.test(name)) {
      errors.push('dreamer_name contains invalid characters');
    }
  }
  
  if (!data.origin_station || typeof data.origin_station !== 'string') {
    errors.push('origin_station is required and must be a string');
  } else {
    const station = data.origin_station.trim();
    if (station.length < VALIDATION_RULES.origin_station.minLength) {
      errors.push(`origin_station must be at least ${VALIDATION_RULES.origin_station.minLength} characters`);
    }
    if (station.length > VALIDATION_RULES.origin_station.maxLength) {
      errors.push(`origin_station must be less than ${VALIDATION_RULES.origin_station.maxLength} characters`);
    }
  }
  
  if (!data.destination_city || typeof data.destination_city !== 'string') {
    errors.push('destination_city is required and must be a string');
  } else {
    const city = data.destination_city.trim();
    if (city.length < VALIDATION_RULES.destination_city.minLength) {
      errors.push(`destination_city must be at least ${VALIDATION_RULES.destination_city.minLength} characters`);
    }
    if (city.length > VALIDATION_RULES.destination_city.maxLength) {
      errors.push(`destination_city must be less than ${VALIDATION_RULES.destination_city.maxLength} characters`);
    }
  }
  
  // Validate optional email
  if (data.email) {
    if (typeof data.email !== 'string') {
      errors.push('email must be a string');
    } else {
      const email = data.email.trim();
      if (email.length > VALIDATION_RULES.email.maxLength) {
        errors.push(`email must be less than ${VALIDATION_RULES.email.maxLength} characters`);
      }
      if (!VALIDATION_RULES.email.pattern.test(email)) {
        errors.push('email format is invalid');
      }
    }
  }
  
  // Validate coordinates if provided
  if (data.origin_lat !== undefined || data.origin_lng !== undefined) {
    if (typeof data.origin_lat !== 'number' || typeof data.origin_lng !== 'number') {
      errors.push('origin coordinates must be numbers');
    } else {
      const [minLat, maxLat] = VALIDATION_RULES.coordinates.latRange;
      const [minLng, maxLng] = VALIDATION_RULES.coordinates.lngRange;
      
      if (data.origin_lat < minLat || data.origin_lat > maxLat) {
        errors.push(`origin_lat must be between ${minLat} and ${maxLat}`);
      }
      if (data.origin_lng < minLng || data.origin_lng > maxLng) {
        errors.push(`origin_lng must be between ${minLng} and ${maxLng}`);
      }
    }
  }
  
  if (data.destination_lat !== undefined || data.destination_lng !== undefined) {
    if (typeof data.destination_lat !== 'number' || typeof data.destination_lng !== 'number') {
      errors.push('destination coordinates must be numbers');
    } else {
      const [minLat, maxLat] = VALIDATION_RULES.coordinates.latRange;
      const [minLng, maxLng] = VALIDATION_RULES.coordinates.lngRange;
      
      if (data.destination_lat < minLat || data.destination_lat > maxLat) {
        errors.push(`destination_lat must be between ${minLat} and ${maxLat}`);
      }
      if (data.destination_lng < minLng || data.destination_lng > maxLng) {
        errors.push(`destination_lng must be between ${minLng} and ${maxLng}`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize dream submission data
 */
function sanitizeDreamSubmission(data: any): DreamSubmission {
  return {
    dreamer_name: data.dreamer_name?.trim() || '',
    origin_station: data.origin_station?.trim() || '',
    origin_country: data.origin_country?.trim()?.toUpperCase() || undefined,
    origin_lat: typeof data.origin_lat === 'number' ? Number(data.origin_lat.toFixed(8)) : undefined,
    origin_lng: typeof data.origin_lng === 'number' ? Number(data.origin_lng.toFixed(8)) : undefined,
    destination_city: data.destination_city?.trim() || '',
    destination_country: data.destination_country?.trim()?.toUpperCase() || undefined,
    destination_lat: typeof data.destination_lat === 'number' ? Number(data.destination_lat.toFixed(8)) : undefined,
    destination_lng: typeof data.destination_lng === 'number' ? Number(data.destination_lng.toFixed(8)) : undefined,
    email: data.email?.trim() || undefined,
  };
}

/**
 * Get all dreams with pagination
 */
async function handleGetDreams(req: VercelRequest, res: VercelResponse) {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 1000, 1000);
    const offset = parseInt(req.query.offset as string) || 0;
    const country = req.query.country as string;
    const station = req.query.station as string;
    
    // Build query
    let query = supabase
      .from('dreams')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    // Add filters
    if (country) {
      query = query.eq('origin_country', country.toUpperCase());
    }
    
    if (station) {
      query = query.ilike('origin_station', `%${station}%`);
    }
    
    // Add pagination
    query = query.range(offset, offset + limit - 1);
    
    const { data: dreams, error, count } = await query;
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Transform data to hide sensitive information
    const sanitizedDreams = dreams?.map(dream => ({
      ...dream,
      email: undefined, // Never expose email addresses
    })) || [];
    
    return res.json({
      dreams: sanitizedDreams,
      pagination: {
        total: count || sanitizedDreams.length,
        limit,
        offset,
        hasMore: sanitizedDreams.length === limit,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        filters: {
          country: country || null,
          station: station || null,
        },
      },
    });
    
  } catch (error) {
    console.error('GET /api/dreams error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve dreams',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Submit a new dream
 */
async function handlePostDream(req: VercelRequest, res: VercelResponse) {
  try {
    // Validate content type
    if (!req.headers['content-type']?.includes('application/json')) {
      return res.status(400).json({
        error: 'Invalid content type',
        message: 'Content-Type must be application/json',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Validate and sanitize input
    const validation = validateDreamSubmission(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please check your input data',
        details: validation.errors,
        timestamp: new Date().toISOString(),
      });
    }
    
    const dreamData = sanitizeDreamSubmission(req.body);
    
    // Insert dream into database
    const { data, error } = await supabase
      .from('dreams')
      .insert([dreamData])
      .select()
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    // Check for community formation
    const communityMessage = await checkCommunityFormation(dreamData.origin_station);
    
    // Hide sensitive information in response
    const sanitizedDream = {
      ...data,
      email: undefined,
    };
    
    return res.status(201).json({
      success: true,
      dream: sanitizedDream,
      community_message: communityMessage,
      message: 'Dream added successfully! Your pajama party adventure awaits! 🚂✨',
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('POST /api/dreams error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit dream',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Check if a community is forming at this station
 */
async function checkCommunityFormation(originStation: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('dreams')
      .select('dreamer_name, created_at')
      .eq('origin_station', originStation)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      return null;
    }
    
    const count = data.length;
    
    if (count >= 5) {
      return `🎉 Amazing! ${count} dreamers from ${originStation} are planning pajama parties! This is becoming a movement! 🚂✨`;
    } else if (count >= 3) {
      return `🌟 Wonderful! ${count} dreamers from ${originStation} are planning pajama parties! Community is forming! 🎪`;
    } else if (count >= 2) {
      return `💫 Great! ${count} dreamers from ${originStation} are planning pajama parties! You're not alone! 🤝`;
    }
    
    return null;
    
  } catch (error) {
    console.error('Community check error:', error);
    return null;
  }
}

/**
 * Main API handler
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check environment variables
    if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
      return res.status(500).json({
        error: 'Server configuration error',
        message: 'Database connection not configured',
        timestamp: new Date().toISOString(),
      });
    }
    
    // Route to appropriate handler
    switch (req.method) {
      case 'GET':
        return await handleGetDreams(req, res);
      case 'POST':
        return await handlePostDream(req, res);
      default:
        return res.status(405).json({
          error: 'Method not allowed',
          message: `${req.method} method is not supported`,
          allowed: ['GET', 'POST'],
          timestamp: new Date().toISOString(),
        });
    }
    
  } catch (error) {
    console.error('Dreams API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    });
  }
}