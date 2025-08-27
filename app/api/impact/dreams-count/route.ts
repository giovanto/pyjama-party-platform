import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { corsHeaders } from '@/lib/cors';

// Cache control headers for public dashboard data
const CACHE_CONTROL = 'public, max-age=300, stale-while-revalidate=600';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get total dreams count
    const { count: totalDreams, error: dreamsError } = await supabase
      .from('public_dreams')
      .select('*', { count: 'exact', head: true });

    if (dreamsError) {
      console.error('Error fetching dreams count:', dreamsError);
      return NextResponse.json(
        { error: 'Failed to fetch dreams count' },
        { status: 500 }
      );
    }

    // Get participation signups count
    const participationCount = 0;

    // Get today's dreams count
    const today = new Date().toISOString().split('T')[0];
    const { count: todayDreams, error: todayError } = await supabase
      .from('public_dreams')
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

    const headers = { ...corsHeaders(request, ['GET']), 'Cache-Control': CACHE_CONTROL };
    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error('Dreams count API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
