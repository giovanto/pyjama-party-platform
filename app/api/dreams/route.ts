import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateDreamSubmission, validatePaginationParams } from '@/lib/validation';
import type { DreamSubmissionRequest, DreamRoute } from '@/types/api';

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

    // Look up station coordinates
    const { data: fromStation } = await supabase
      .from('stations')
      .select('latitude, longitude')
      .ilike('name', `%${from.split(',')[0].trim()}%`)
      .limit(1)
      .single();

    const { data: toStation } = await supabase
      .from('stations')
      .select('latitude, longitude')
      .ilike('name', `%${to.split(',')[0].trim()}%`)
      .limit(1)
      .single();

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

    return NextResponse.json({
      success: true,
      message: 'Dream route submitted successfully!',
      id: data.id
    }, { status: 201 });

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
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Validate pagination parameters
    const pagination = validatePaginationParams(
      searchParams.get('limit'),
      searchParams.get('offset')
    );
    const { limit, offset } = pagination;

    // Get dreams with pagination
    const { data: dreams, error, count } = await supabase
      .from('dreams')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dreams' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      dreams: dreams || [],
      total: count || 0,
      limit,
      offset
    });

  } catch (error) {
    console.error('Error fetching dreams:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}