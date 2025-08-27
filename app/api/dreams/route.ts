import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateDreamSubmission, validatePaginationParams } from '@/lib/validation';

// In-memory cache for hot data (production would use Redis)
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 60000; // 1 minute cache for GET requests
const STATION_CACHE_TTL = 3600000; // 1 hour cache for station lookups

function getCachedData(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Clean expired entries
  }
  return null;
}

function setCachedData(key: string, data: any, ttl: number = CACHE_TTL): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

// Station lookup cache to avoid repeated queries
async function getStationCoordinates(supabase: any, stationName: string) {
  const cacheKey = `station:${stationName.toLowerCase().trim()}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const { data: station } = await supabase
    .from('stations')
    .select('latitude, longitude')
    .ilike('name', `%${stationName.split(',')[0].trim()}%`)
    .limit(1)
    .single();

  setCachedData(cacheKey, station, STATION_CACHE_TTL);
  return station;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Validate request data using Zod schema
    const validation = validateDreamSubmission(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.error 
        },
        { status: 400 }
      );
    }
    
    const { from, to, dreamerName, email, why, routeType, travelPurpose } = validation.data;

    // Look up station coordinates with caching
    const [fromStation, toStation] = await Promise.all([
      getStationCoordinates(supabase, from),
      getStationCoordinates(supabase, to)
    ]);

    // Insert dream into database with enhanced fields
    const { data, error } = await supabase
      .from('dreams')
      .insert({
        from_station: from,
        to_station: to,
        dreamer_name: dreamerName,
        dreamer_email: email || '',
        why_important: why,
        from_latitude: fromStation?.latitude || null,
        from_longitude: fromStation?.longitude || null,
        to_latitude: toStation?.latitude || null,
        to_longitude: toStation?.longitude || null,
        route_type: routeType,
        travel_purpose: travelPurpose || null,
        estimated_demand: 1,
        status: 'submitted'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save dream route' },
        { status: 500 }
      );
    }

    // Invalidate relevant caches after successful insert
    cache.delete('dreams:recent');
    cache.delete('dreams:stats');

    const response = NextResponse.json({
      success: true,
      message: 'Dream route submitted successfully!',
      id: data.id
    }, { status: 201 });

    // Add performance headers
    response.headers.set('Cache-Control', 'no-cache');
    return response;

  } catch (error) {
    console.error('Error processing dream submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Validate pagination parameters
    const pagination = validatePaginationParams(
      searchParams.get('limit'),
      searchParams.get('offset')
    );
    const { limit, offset } = pagination;

    // Create cache key based on request parameters
    const cacheKey = `dreams:${limit}:${offset}`;
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      const response = NextResponse.json(cachedResult);
      response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
      response.headers.set('X-Cache', 'HIT');
      return response;
    }

    const supabase = await createClient();

    // Optimize query - only select non-PII fields for map display
    const { data: dreams, error, count } = await supabase
      .from('public_dreams')
      .select(`
        id, 
        from_station, 
        to_station, 
        from_latitude, 
        from_longitude, 
        to_latitude, 
        to_longitude,
        created_at
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dreams' },
        { status: 500 }
      );
    }

    const result = {
      dreams: dreams || [],
      total: count || 0,
      limit,
      offset
    };

    // Cache the result
    setCachedData(cacheKey, result);

    const response = NextResponse.json(result);
    
    // Add performance and caching headers
    response.headers.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    response.headers.set('X-Cache', 'MISS');
    response.headers.set('Vary', 'Accept-Encoding');
    
    return response;

  } catch (error) {
    console.error('Error fetching dreams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
