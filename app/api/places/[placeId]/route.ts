import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Supported languages for the platform
const SUPPORTED_LANGUAGES = ['en', 'de', 'fr', 'es', 'it', 'nl', 'da', 'sv', 'no'] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

interface PlaceDetails {
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
  tolerance: number;
  multilingual_content: Record<string, any>;
  related_places?: PlaceDetails[];
  nearby_stations?: any[];
  route_connections?: any[];
  source_info: {
    type: string;
    import_date?: string;
    version?: string;
  };
}

/**
 * Get multilingual content with fallback logic
 */
function getMultilingualContent(
  content: Record<string, any>,
  lang: SupportedLanguage,
  field: string
): string {
  if (content[lang]?.[field]) {
    return content[lang][field];
  }
  
  if (content.en?.[field]) {
    return content.en[field];
  }
  
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
  const R = 6371;
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
 * Find related places based on proximity, country, and tags
 */
async function findRelatedPlaces(
  supabase: any,
  place: any,
  language: SupportedLanguage,
  limit: number = 6
): Promise<PlaceDetails[]> {
  const { data: relatedPlaces } = await supabase
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
    `)
    .neq('place_id', place.place_id)
    .or(`place_country.eq.${place.place_country},tags.ov.{${place.tags?.join(',') || ''}}`)
    .order('priority_score', { ascending: false })
    .limit(limit);

  if (!relatedPlaces) return [];

  return relatedPlaces.map((relatedPlace: any) => ({
    place_id: relatedPlace.place_id,
    name: getMultilingualContent(relatedPlace.content || {}, language, 'name') || relatedPlace.place_id,
    brief_description: getMultilingualContent(relatedPlace.content || {}, language, 'brief_desc') || '',
    longer_description: getMultilingualContent(relatedPlace.content || {}, language, 'longer_desc') || '',
    country: relatedPlace.place_country,
    latitude: parseFloat(relatedPlace.place_lat),
    longitude: parseFloat(relatedPlace.place_lon),
    place_type: relatedPlace.place_type || 'destination',
    priority_score: relatedPlace.priority_score || 1,
    tags: relatedPlace.tags || [],
    image_url: relatedPlace.place_image,
    image_attribution: relatedPlace.image_attribution,
    tolerance: 0,
    multilingual_content: relatedPlace.content || {},
    source_info: {
      type: 'related'
    }
  }));
}

/**
 * Find nearby train stations
 */
async function findNearbyStations(
  supabase: any,
  latitude: number,
  longitude: number,
  radiusKm: number = 50,
  limit: number = 10
) {
  const latRange = radiusKm / 111;
  const lonRange = radiusKm / (111 * Math.cos(latitude * Math.PI / 180));

  const { data: stations } = await supabase
    .from('stations')
    .select('*')
    .gte('latitude', latitude - latRange)
    .lte('latitude', latitude + latRange)
    .gte('longitude', longitude - lonRange)
    .lte('longitude', longitude + lonRange)
    .limit(limit);

  if (!stations) return [];

  return stations.map((station: any) => ({
    ...station,
    distance_km: Math.round(
      calculateDistance(latitude, longitude, station.latitude, station.longitude) * 10
    ) / 10
  })).sort((a, b) => a.distance_km - b.distance_km);
}

/**
 * Find route connections from this place
 */
async function findRouteConnections(
  supabase: any,
  placeId: string,
  language: SupportedLanguage,
  limit: number = 10
) {
  const { data: routes } = await supabase
    .from('routes')
    .select(`
      *,
      from_place:places!routes_from_place_id_fkey(*),
      to_place:places!routes_to_place_id_fkey(*)
    `)
    .or(`from_place_id.eq.${placeId},to_place_id.eq.${placeId}`)
    .order('current_demand_score', { ascending: false })
    .limit(limit);

  if (!routes) return [];

  return routes.map((route: any) => ({
    route_id: route.id,
    route_name: route.route_name,
    from_place: {
      place_id: route.from_place?.place_id,
      name: getMultilingualContent(route.from_place?.content || {}, language, 'name')
    },
    to_place: {
      place_id: route.to_place?.place_id,
      name: getMultilingualContent(route.to_place?.content || {}, language, 'name')
    },
    demand_score: route.current_demand_score,
    exists_currently: route.exists_currently,
    service_type: route.service_type,
    advocacy_priority: route.advocacy_priority,
    total_dreams: route.total_dreams
  }));
}

export async function GET(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const placeId = params.placeId;
    const language = (searchParams.get('lang') || 'en') as SupportedLanguage;
    const includeRelated = searchParams.get('include_related') !== 'false';
    const includeStations = searchParams.get('include_stations') !== 'false';
    const includeRoutes = searchParams.get('include_routes') !== 'false';

    // Validate language
    const validLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : 'en';

    // Fetch the main place
    const { data: place, error } = await supabase
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
        tags,
        lat_lon_tolerance,
        source_type,
        source_data,
        created_at,
        updated_at
      `)
      .eq('place_id', placeId)
      .single();

    if (error || !place) {
      return NextResponse.json(
        { error: 'Place not found', place_id: placeId },
        { status: 404 }
      );
    }

    // Build the main place details object
    const placeDetails: PlaceDetails = {
      place_id: place.place_id,
      name: getMultilingualContent(place.content || {}, validLanguage, 'name') || place.place_id,
      brief_description: getMultilingualContent(place.content || {}, validLanguage, 'brief_desc') || '',
      longer_description: getMultilingualContent(place.content || {}, validLanguage, 'longer_desc') || '',
      country: place.place_country,
      latitude: parseFloat(place.place_lat),
      longitude: parseFloat(place.place_lon),
      place_type: place.place_type || 'destination',
      priority_score: place.priority_score || 1,
      tags: place.tags || [],
      image_url: place.place_image,
      image_attribution: place.image_attribution,
      tolerance: place.lat_lon_tolerance || 3.0,
      multilingual_content: place.content || {},
      source_info: {
        type: place.source_type || 'unknown',
        import_date: place.source_data?.import_date,
        version: place.source_data?.import_version
      }
    };

    // Fetch related data in parallel
    const [relatedPlaces, nearbyStations, routeConnections] = await Promise.all([
      includeRelated ? findRelatedPlaces(supabase, place, validLanguage) : Promise.resolve([]),
      includeStations ? findNearbyStations(supabase, placeDetails.latitude, placeDetails.longitude) : Promise.resolve([]),
      includeRoutes ? findRouteConnections(supabase, placeId, validLanguage) : Promise.resolve([])
    ]);

    // Add related data to response
    if (includeRelated) {
      placeDetails.related_places = relatedPlaces;
    }
    
    if (includeStations) {
      placeDetails.nearby_stations = nearbyStations;
    }
    
    if (includeRoutes) {
      placeDetails.route_connections = routeConnections;
    }

    // Add metadata about available languages
    const availableLanguages = Object.keys(place.content || {});

    return NextResponse.json({
      place: placeDetails,
      metadata: {
        requested_language: validLanguage,
        available_languages: availableLanguages,
        includes: {
          related_places: includeRelated,
          nearby_stations: includeStations,
          route_connections: includeRoutes
        },
        last_updated: place.updated_at
      }
    });

  } catch (error) {
    console.error('Error fetching place details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Update place information (for future admin functionality)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { placeId: string } }
) {
  try {
    const supabase = await createClient();
    const placeId = params.placeId;
    const updates = await request.json();

    // TODO: Add authentication check for admin users
    // For now, this endpoint is disabled in production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Place updates not available in production' },
        { status: 403 }
      );
    }

    // Validate updates object
    const allowedFields = [
      'content', 'place_type', 'priority_score', 'tags', 
      'lat_lon_tolerance', 'place_image', 'image_attribution'
    ];
    
    const validUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(validUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('places')
      .update(validUpdates)
      .eq('place_id', placeId)
      .select()
      .single();

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update place' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      place: data,
      updated_fields: Object.keys(validUpdates)
    });

  } catch (error) {
    console.error('Error updating place:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}