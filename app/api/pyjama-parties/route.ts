import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { corsHeaders } from '@/lib/cors';

interface PyjamaPartyData {
  stationName: string;
  city: string;
  country: string;
  organizerName: string;
  organizerEmail: string;
  partyDate: string;
  description?: string;
  expectedAttendees: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: PyjamaPartyData = await request.json();
    
    const { 
      stationName, 
      city, 
      country, 
      organizerName, 
      organizerEmail, 
      partyDate,
      description,
      expectedAttendees
    } = body;
    
    // Validation
    if (!stationName || !city || !country || !organizerName || !partyDate) {
      return NextResponse.json(
        { error: 'Required fields missing: stationName, city, country, organizerName, partyDate' },
        { status: 400, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }
    
    // Email validation (optional field)
    if (organizerEmail && !/\S+@\S+\.\S+/.test(organizerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }

    // Date validation
    const parsedDate = new Date(partyDate);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }

    // Check if party already exists for this station and date
    const { data: existingParty } = await supabase
      .from('pyjama_parties')
      .select('id')
      .eq('station_name', stationName.trim())
      .eq('party_date', parsedDate.toISOString())
      .single();

    if (existingParty) {
      return NextResponse.json(
        { error: 'A pyjama party is already organized for this station on this date' },
        { status: 409, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }

    // Insert pyjama party into database
    const { data, error } = await supabase
      .from('pyjama_parties')
      .insert({
        station_name: stationName.trim(),
        city: city.trim(),
        country: country.trim(),
        organizer_name: organizerName.trim(),
        organizer_email: organizerEmail ? organizerEmail.trim().toLowerCase() : '',
        party_date: parsedDate.toISOString(),
        description: description?.trim() || null,
        attendees_count: expectedAttendees || 1,
        status: 'planned'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create pyjama party' },
        { status: 500, headers: { ...corsHeaders(request, ['POST']) } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pyjama party created successfully!',
      id: data.id,
      party: {
        id: data.id,
        stationName: data.station_name,
        city: data.city,
        country: data.country,
        organizerName: data.organizer_name,
        partyDate: data.party_date,
        description: data.description,
        attendeesCount: data.attendees_count,
        status: data.status
      }
    }, { status: 201, headers: { ...corsHeaders(request, ['POST']) } });

  } catch (error) {
    console.error('Error creating pyjama party:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { ...corsHeaders(request, ['POST']) } }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const station = searchParams.get('station');
    const upcoming = searchParams.get('upcoming') === 'true';

    let query = supabase
      .from('public_pyjama_parties')
      .select('id, station_name, city, country, party_date, description, attendees_count, status, created_at', { count: 'exact' });

    // Filter by station if provided
    if (station) {
      query = query.ilike('station_name', `%${station}%`);
    }

    // Filter upcoming parties only
    if (upcoming) {
      query = query.gte('party_date', new Date().toISOString());
    }

    // Apply pagination and ordering
    const { data: parties, error, count } = await query
      .order('party_date', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pyjama parties' },
        { status: 500, headers: { ...corsHeaders(request, ['GET']) } }
      );
    }

    // Transform data for frontend
    const formattedParties = (parties || []).map(party => ({
      id: party.id,
      stationName: party.station_name,
      city: party.city,
      country: party.country,
      partyDate: party.party_date,
      description: party.description,
      attendeesCount: party.attendees_count,
      status: party.status,
      createdAt: party.created_at
    }));

    return NextResponse.json({
      parties: formattedParties,
      total: count || 0,
      limit,
      offset
    }, { headers: { ...corsHeaders(request, ['GET']) } });

  } catch (error) {
    console.error('Error fetching pyjama parties:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { ...corsHeaders(request, ['GET']) } }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { id, attendeesCount, status, description } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Party ID is required' },
        { status: 400, headers: { ...corsHeaders(request, ['PUT']) } }
      );
    }

    // Update party
    const { data, error } = await supabase
      .from('pyjama_parties')
      .update({
        ...(attendeesCount !== undefined && { attendees_count: attendeesCount }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update pyjama party' },
        { status: 500, headers: { ...corsHeaders(request, ['PUT']) } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Pyjama party updated successfully!',
      party: {
        id: data.id,
        stationName: data.station_name,
        city: data.city,
        country: data.country,
        organizerName: data.organizer_name,
        partyDate: data.party_date,
        description: data.description,
        attendeesCount: data.attendees_count,
        status: data.status
      }
    }, { headers: { ...corsHeaders(request, ['PUT']) } });

  } catch (error) {
    console.error('Error updating pyjama party:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { ...corsHeaders(request, ['PUT']) } }
    );
  }
}

// Preflight for cross-origin POST/PUT to this collection endpoint
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, { status: 204, headers: { ...corsHeaders(request, ['GET','POST','PUT','OPTIONS']) } });
}
