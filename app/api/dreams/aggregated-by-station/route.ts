import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { corsHeaders } from '@/lib/cors';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const minDreams = parseInt(searchParams.get('minDreams') || '2');

    // Get dreams aggregated by station with counts
    const { data: stationData, error } = await supabase
      .from('dreams')
      .select(`
        preferred_destination,
        count(*) as dream_count
      `)
      .group('preferred_destination')
      .having('count(*)', 'gte', minDreams)
      .order('dream_count', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch station data' },
        { status: 500, headers: { ...corsHeaders(request, ['GET']) } }
      );
    }

    // Get places data for coordinates
    const destinations = stationData?.map(item => item.preferred_destination) || [];
    
    const { data: placesData, error: placesError } = await supabase
      .from('places')
      .select('name, latitude, longitude, country_code')
      .in('name', destinations);

    if (placesError) {
      console.error('Places lookup error:', placesError);
    }

    // Combine station data with coordinates
    const aggregatedStations = stationData?.map(station => {
      const place = placesData?.find(p => p.name === station.preferred_destination);
      
      return {
        station: station.preferred_destination,
        dreamCount: station.dream_count,
        latitude: place?.latitude || null,
        longitude: place?.longitude || null,
        countryCode: place?.country_code || null,
        readyForEvent: station.dream_count >= minDreams
      };
    }) || [];

    // Calculate summary stats
    const totalStations = aggregatedStations.length;
    const readyStations = aggregatedStations.filter(s => s.readyForEvent).length;
    const totalDreams = aggregatedStations.reduce((sum, s) => sum + s.dreamCount, 0);

    return NextResponse.json({
      success: true,
      data: {
        stations: aggregatedStations,
        summary: {
          totalStations,
          readyStations,
          totalDreams,
          readyPercentage: totalStations > 0 ? Math.round((readyStations / totalStations) * 100) : 0
        },
        metadata: {
          minDreamsThreshold: minDreams,
          generatedAt: new Date().toISOString()
        }
      }
    }, { headers: { ...corsHeaders(request, ['GET']) } });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { ...corsHeaders(request, ['GET']) } }
    );
  }
}
