import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { corsHeaders } from '@/lib/cors';

// Supported languages for the platform
const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'it', 'nl', 'da', 'sv', 'no'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

interface PlaceSearchParams {
  q?: string;           // Search query
  lang?: string;        // Language preference
  country?: string;     // Filter by country
  type?: string;        // Filter by place type
  limit?: string;       // Number of results
  offset?: string;      // Pagination offset
  lat?: string;         // Center latitude for proximity search
  lon?: string;         // Center longitude for proximity search
  radius?: string;      // Search radius in kilometers
}

interface PlaceResult {
  place_id: string;
  name: string;
  brief_description: string;
  longer_description: string;
  country: string;
  latitude: number;
  longitude: number;
  place_type: string;
  priority_score: number;
  tags: string[];
  image_url: string | null;
  image_attribution: string | null;
  distance_km?: number;
}

/**
 * Get multilingual content with fallback logic
 */
function getMultilingualContent(
  content: Record<string, any>,
  lang: SupportedLanguage,
  field: string
): string {
  // Try requested language first
  if (content[lang]?.[field]) {
    return content[lang][field];
  }
  
  // Fallback to English
  if (content.en?.[field]) {
    return content.en[field];
  }
  
  // Fallback to any available language
  for (const availableLang of Object.keys(content)) {
    if (content[availableLang]?.[field]) {
      return content[availableLang][field];
    }
  }
  
  return '';
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Build search query based on parameters
 */
// function buildSearchQuery(params: PlaceSearchParams, supabase: any) {
//   let query = supabase
//     .from('places')
//     .select(`
//       place_id,
//       place_lat,
//       place_lon,
//       place_country,
//       place_image,
//       image_attribution,
//       content,
//       place_type,
//       priority_score,
//       tags
//     `);

//   // Text search using the database function
//   if (params.q) {
//     query = query.rpc('search_places', {
//       search_query: params.q,
//       search_lang: params.lang || 'en',
//       limit_results: parseInt(params.limit || '50')
//     });
//   }

//   // Country filter
//   if (params.country) {
//     query = query.eq('place_country', params.country);
//   }

//   // Place type filter
//   if (params.type) {
//     query = query.eq('place_type', params.type);
//   }

//   // Proximity search
//   if (params.lat && params.lon) {
//     const lat = parseFloat(params.lat);
//     const lon = parseFloat(params.lon);
//     const radius = parseFloat(params.radius || '100'); // Default 100km radius

//     // Use a bounding box for initial filtering (more efficient than distance calculation)
//     const latRange = radius / 111; // Rough conversion: 1 degree lat ≈ 111 km
//     const lonRange = radius / (111 * Math.cos(lat * Math.PI / 180));

//     query = query
//       .gte('place_lat', lat - latRange)
//       .lte('place_lat', lat + latRange)
//       .gte('place_lon', lon - lonRange)
//       .lte('place_lon', lon + lonRange);
//   }

//   return query;
// }

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Extract and validate parameters
    const params: PlaceSearchParams = {
      q: searchParams.get('q') || undefined,
      lang: searchParams.get('lang') || 'en',
      country: searchParams.get('country') || undefined,
      type: searchParams.get('type') || undefined,
      limit: searchParams.get('limit') || '50',
      offset: searchParams.get('offset') || '0',
      lat: searchParams.get('lat') || undefined,
      lon: searchParams.get('lon') || undefined,
      radius: searchParams.get('radius') || undefined,
    };

    // Validate language
    const language = SUPPORTED_LANGUAGES.includes(params.lang as SupportedLanguage) 
      ? params.lang as SupportedLanguage 
      : 'en';

    // Validate numeric parameters
    const limit = Math.min(Math.max(parseInt(params.limit), 1), 100);
    const offset = Math.max(parseInt(params.offset), 0);

    // If using the search function, call it directly
    if (params.q) {
      const { data: searchResults, error } = await supabase.rpc('search_places', {
        search_query: params.q,
        search_lang: language,
        limit_results: limit
      });

      if (error) {
        console.error('Search function error:', error);
        // Fallback to basic query if search function is not available
      } else if (searchResults) {
        // Transform search results
        const transformedResults: PlaceResult[] = searchResults.map((place: any) => ({
          place_id: place.place_id,
          name: place.name || place.place_id,
          brief_description: place.brief_description || '',
          longer_description: '', // Not returned by search function
          country: place.country,
          latitude: parseFloat(place.latitude),
          longitude: parseFloat(place.longitude),
          place_type: place.place_type,
          priority_score: place.priority_score,
          tags: [], // Not returned by search function
          image_url: null,
          image_attribution: null
        }));

        return NextResponse.json({
          places: transformedResults,
          total: searchResults.length,
          limit,
          offset: 0,
          language,
          search_query: params.q
        }, { headers: { ...corsHeaders(request, ['GET']) } });
      }
    }

    // Fallback to standard query or if no search term provided
    let query = supabase
      .from('places')
      .select(`
        place_id,
        place_lat,
        place_lon,
        place_country,
        place_image,
        image_attribution,
        content,
        place_type,
        priority_score,
        tags
      `, { count: 'exact' });

    // Apply filters
    if (params.country) {
      query = query.eq('place_country', params.country);
    }

    if (params.type) {
      query = query.eq('place_type', params.type);
    }

    // Text search fallback using JSONB operators
    if (params.q && !params.lat) {
      query = query.or(`
        content->${language}->>name.ilike.%${params.q}%,
        content->en->>name.ilike.%${params.q}%,
        place_country.ilike.%${params.q}%
      `);
    }

    // Proximity search
    let centerLat: number | undefined;
    let centerLon: number | undefined;
    if (params.lat && params.lon) {
      centerLat = parseFloat(params.lat);
      centerLon = parseFloat(params.lon);
      const radius = parseFloat(params.radius || '100');

      const latRange = radius / 111;
      const lonRange = radius / (111 * Math.cos(centerLat * Math.PI / 180));

      query = query
        .gte('place_lat', centerLat - latRange)
        .lte('place_lat', centerLat + latRange)
        .gte('place_lon', centerLon - lonRange)
        .lte('place_lon', centerLon + lonRange);
    }

    // Order by priority and apply pagination
    if (!params.q) {
      query = query.order('priority_score', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data: places, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch places', details: error.message },
        { status: 500, headers: { ...corsHeaders(request, ['GET']) } }
      );
    }

    // Transform places data to API format
    const transformedPlaces: PlaceResult[] = (places || []).map((place: any) => {
      const result: PlaceResult = {
        place_id: place.place_id,
        name: getMultilingualContent(place.content || {}, language, 'name') || place.place_id,
        brief_description: getMultilingualContent(place.content || {}, language, 'brief_desc') || '',
        longer_description: getMultilingualContent(place.content || {}, language, 'longer_desc') || '',
        country: place.place_country,
        latitude: parseFloat(place.place_lat),
        longitude: parseFloat(place.place_lon),
        place_type: place.place_type || 'destination',
        priority_score: place.priority_score || 1,
        tags: place.tags || [],
        image_url: place.place_image,
        image_attribution: place.image_attribution
      };

      // Add distance if proximity search was performed
      if (centerLat !== undefined && centerLon !== undefined) {
        result.distance_km = Math.round(
          calculateDistance(centerLat, centerLon, result.latitude, result.longitude) * 10
        ) / 10;
      }

      return result;
    });

    // Sort by distance if proximity search was performed
    if (centerLat !== undefined && centerLon !== undefined) {
      transformedPlaces.sort((a, b) => (a.distance_km || 0) - (b.distance_km || 0));
    }

    return NextResponse.json({
      places: transformedPlaces,
      total: count || transformedPlaces.length,
      limit,
      offset,
      language,
      search_query: params.q || null,
      proximity_search: centerLat !== undefined ? {
        center: { lat: centerLat, lon: centerLon },
        radius_km: parseFloat(params.radius || '100')
      } : null
    }, { headers: { ...corsHeaders(request, ['GET']) } });

  } catch (error) {
    console.error('Error processing places search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { ...corsHeaders(request, ['GET']) } }
    );
  }
}
