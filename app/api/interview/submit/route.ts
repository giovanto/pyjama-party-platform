import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { InterviewDreamData } from '@/types';
import { checkRateLimit } from '@/middleware/rateLimit';

export async function POST(request: NextRequest) {
  // Apply rate limiting for interview submissions (higher limit than regular dreams)
  const rateLimitResult = checkRateLimit(request, {
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 submissions per minute (3 seconds per submission target)
    message: 'Too many submissions, please slow down'
  });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: 'Too many submissions, please slow down',
        retry_after: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitResult.total.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString()
        }
      }
    );
  }

  try {
    const body = await request.json();
    
    // Validate required fields for interview submissions
    const {
      dreamerName,
      originStation,
      destinationCity,
      email,
      why,
      collectedBy,
      sessionId,
      language,
      source
    } = body as InterviewDreamData;

    if (!dreamerName?.trim() || !originStation?.trim() || !destinationCity?.trim()) {
      return NextResponse.json(
        { error: 'Name, origin station, and destination are required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Parse origin station details
    const originParts = originStation.split(',').map(part => part.trim());
    const originCity = originParts.length > 1 ? originParts[1] : originParts[0];
    const originCountry = originParts.length > 2 ? originParts[2] : 'Unknown';

    // Try to geocode the origin station
    let originLat: number | null = null;
    let originLng: number | null = null;

    try {
      const { data: stationData } = await supabase
        .from('places')
        .select('lat, lng')
        .ilike('name', `%${originParts[0]}%`)
        .limit(1)
        .single();
      
      if (stationData) {
        originLat = stationData.lat;
        originLng = stationData.lng;
      }
    } catch (error) {
      console.log('Could not geocode origin station:', error);
    }

    // Parse destination details
    const destinationParts = destinationCity.split(',').map(part => part.trim());
    const destinationCityName = destinationParts[0];
    const destinationCountry = destinationParts.length > 1 ? destinationParts[1] : 'Unknown';

    // Try to geocode the destination
    let destinationLat: number | null = null;
    let destinationLng: number | null = null;

    try {
      const { data: destData } = await supabase
        .from('places')
        .select('lat, lng')
        .ilike('name', `%${destinationCityName}%`)
        .limit(1)
        .single();
      
      if (destData) {
        destinationLat = destData.lat;
        destinationLng = destData.lng;
      }
    } catch (error) {
      console.log('Could not geocode destination:', error);
    }

    // Check for duplicate submissions (same name, origin, destination within last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: existingDreams } = await supabase
      .from('dreams')
      .select('id')
      .eq('dreamer_name', dreamerName.trim())
      .eq('origin_station', originStation.trim())
      .eq('destination_city', destinationCity.trim())
      .gte('created_at', oneHourAgo)
      .limit(1);

    if (existingDreams && existingDreams.length > 0) {
      return NextResponse.json(
        { 
          message: 'Dream already exists',
          duplicate: true,
          id: existingDreams[0].id 
        },
        { status: 200 }
      );
    }

    // Create the dream record
    const dreamData = {
      dreamer_name: dreamerName.trim(),
      origin_station: originStation.trim(),
      origin_city: originCity,
      origin_country: originCountry,
      origin_lat: originLat,
      origin_lng: originLng,
      destination_city: destinationCity.trim(),
      destination_country: destinationCountry,
      destination_lat: destinationLat,
      destination_lng: destinationLng,
      email: email?.trim() || null,
      why_important: why?.trim() || null,
      source: source || 'interview',
      collected_by: collectedBy || null,
      session_id: sessionId || null,
      language: language || 'en',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    const { data: dream, error: dreamError } = await supabase
      .from('dreams')
      .insert(dreamData)
      .select()
      .single();

    if (dreamError) {
      console.error('Database error:', dreamError);
      return NextResponse.json(
        { error: 'Failed to save dream' },
        { status: 500 }
      );
    }

    // Record analytics event for interview submission
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'interview_dream_submitted',
        event_data: {
          dreamId: dream.id,
          sessionId,
          collectedBy,
          language,
          hasEmail: !!email,
          originCountry,
          destinationCountry,
          source: 'interview'
        },
        created_at: new Date().toISOString()
      });
    } catch (analyticsError) {
      console.log('Analytics recording failed:', analyticsError);
      // Don't fail the request for analytics errors
    }

    // Return success response optimized for quick interviews
    return NextResponse.json({
      id: dream.id,
      message: `Dream route added to the map!`,
      success: true,
      submissionTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Interview submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Options for CORS
export async function OPTIONS(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': request.headers.get('origin') || 'https://pyjama-party.back-on-track.eu',
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  return new NextResponse(null, { status: 200, headers });
}
