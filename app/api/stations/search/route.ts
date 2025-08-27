import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { corsHeaders } from '@/lib/cors';

interface Station {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    if (query.length < 2) {
      return NextResponse.json({
        stations: [],
        query
      }, { headers: { ...corsHeaders(request, ['GET']) } });
    }

    // Search stations in database using full-text search
    const { data: stations, error } = await supabase
      .from('stations')
      .select('id, name, city, country, latitude, longitude')
      .or(`name.ilike.%${query}%,city.ilike.%${query}%,country.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to search stations' },
        { status: 500, headers: { ...corsHeaders(request, ['GET']) } }
      );
    }

    // Transform to expected format
    const formattedStations: Station[] = (stations || []).map(station => ({
      id: station.id,
      name: station.name,
      city: station.city,
      country: station.country,
      coordinates: [station.longitude, station.latitude] as [number, number]
    }));

    return NextResponse.json({
      stations: formattedStations,
      query,
      total: formattedStations.length
    }, { headers: { ...corsHeaders(request, ['GET']) } });

  } catch (error) {
    console.error('Error searching stations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { ...corsHeaders(request, ['GET']) } }
    );
  }
}
