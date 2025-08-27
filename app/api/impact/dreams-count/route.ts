import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Cache control headers for public dashboard data
const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET',
};

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Get total dreams count
    const { count: totalDreams, error: dreamsError } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true });

    if (dreamsError) {
      console.error('Error fetching dreams count:', dreamsError);
      return NextResponse.json(
        { error: 'Failed to fetch dreams count' },
        { status: 500 }
      );
    }

    // Get participation signups count
    const { count: participationCount, error: participationError } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null);

    if (participationError) {
      console.error('Error fetching participation count:', participationError);
      return NextResponse.json(
        { error: 'Failed to fetch participation count' },
        { status: 500 }
      );
    }

    // Get today's dreams count
    const today = new Date().toISOString().split('T')[0];
    const { count: todayDreams, error: todayError } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`);

    if (todayError) {
      console.error('Error fetching today dreams count:', todayError);
      // Don't fail the request for this
    }

    const responseData = {
      totalDreams: totalDreams || 0,
      participationSignups: participationCount || 0,
      todayDreams: todayDreams || 0,
      lastUpdated: new Date().toISOString(),
      // Add momentum metrics
      metrics: {
        momentum: todayDreams && todayDreams > 0 ? 'growing' : 'steady',
        participationRate: totalDreams ? Math.round((participationCount || 0) / totalDreams * 100) : 0,
      }
    };

    return NextResponse.json(responseData, {
      headers: CACHE_HEADERS
    });
  } catch (error) {
    console.error('Dreams count API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}