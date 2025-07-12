import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface DreamData {
  from: string;
  to: string;
  dreamerName: string;
  email: string;
  why: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body: DreamData = await request.json();
    
    const { from, to, dreamerName, email, why } = body;
    
    // Validation
    if (!from || !to || !dreamerName || !why) {
      return NextResponse.json(
        { error: 'Required fields missing' },
        { status: 400 }
      );
    }
    
    // Email is optional
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

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

    // Insert dream into database
    const { data, error } = await supabase
      .from('dreams')
      .insert({
        from_station: from.trim(),
        to_station: to.trim(),
        dreamer_name: dreamerName.trim(),
        dreamer_email: email ? email.trim().toLowerCase() : '',
        why_important: why.trim(),
        from_latitude: fromStation?.latitude || null,
        from_longitude: fromStation?.longitude || null,
        to_latitude: toStation?.latitude || null,
        to_longitude: toStation?.longitude || null,
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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

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