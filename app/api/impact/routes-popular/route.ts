import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { corsHeaders } from '@/lib/cors';
import { checkRateLimit, RATE_LIMIT_CONFIGS, getRateLimitHeaders } from '@/middleware/rateLimit';

const CACHE_CONTROL = 'public, max-age=600, stale-while-revalidate=1200';

export async function GET(request: Request) {
  const rl = await checkRateLimit(request, RATE_LIMIT_CONFIGS.reads);
  if (!rl.allowed) {
    const headers = { ...corsHeaders(request, ['GET']), ...getRateLimitHeaders(rl) };
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers });
  }
  try {
    const supabase = await createClient();
    
    // Get popular routes by counting dreams between station pairs
    const { data: routes, error } = await supabase
      .from('public_dreams')
      .select('from_station, to_station')
      .not('from_station', 'is', null)
      .not('to_station', 'is', null);

    if (error) {
      console.error('Error fetching routes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch routes' },
        { status: 500 }
      );
    }

    // Count route frequency
    const routeMap = new Map<string, { count: number; from: string; to: string }>();
    
    routes?.forEach((dream) => {
      const routeKey = `${dream.from_station}->${dream.to_station}`;
      const existing = routeMap.get(routeKey);
      if (existing) {
        existing.count++;
      } else {
        routeMap.set(routeKey, {
          count: 1,
          from: dream.from_station,
          to: dream.to_station
        });
      }
    });

    // Convert to array and sort by popularity
    const popularRoutes = Array.from(routeMap.entries())
      .map(([route, data]) => ({
        route,
        from: data.from,
        to: data.to,
        dreamCount: data.count,
        percentage: routes ? Math.round((data.count / routes.length) * 100) : 0
      }))
      .sort((a, b) => b.dreamCount - a.dreamCount)
      .slice(0, 20); // Top 20 routes

    // Get popular destination cities
    const destinationMap = new Map<string, number>();
    routes?.forEach((dream) => {
      if (dream.to_station) {
        // Extract city from station string (format: "Station, City, Country")
        const parts = dream.to_station.split(',');
        const city = parts.length > 1 ? parts[1].trim() : dream.to_station;
        destinationMap.set(city, (destinationMap.get(city) || 0) + 1);
      }
    });

    const popularDestinations = Array.from(destinationMap.entries())
      .map(([city, count]) => ({ city, dreamCount: count }))
      .sort((a, b) => b.dreamCount - a.dreamCount)
      .slice(0, 10);

    // Get popular origin cities
    const originMap = new Map<string, number>();
    routes?.forEach((dream) => {
      if (dream.from_station) {
        const parts = dream.from_station.split(',');
        const city = parts.length > 1 ? parts[1].trim() : dream.from_station;
        originMap.set(city, (originMap.get(city) || 0) + 1);
      }
    });

    const popularOrigins = Array.from(originMap.entries())
      .map(([city, count]) => ({ city, dreamCount: count }))
      .sort((a, b) => b.dreamCount - a.dreamCount)
      .slice(0, 10);

    const responseData = {
      popularRoutes,
      popularDestinations,
      popularOrigins,
      totalRoutes: routeMap.size,
      totalDreams: routes?.length || 0,
      lastUpdated: new Date().toISOString(),
    };

    const headers = { ...corsHeaders(request, ['GET']), 'Cache-Control': CACHE_CONTROL };
    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error('Popular routes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
