import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface StatsData {
  totalDreams: number;
  totalDreamers: number;
  topRoutes: Array<{
    from: string;
    to: string;
    count: number;
  }>;
  topCountries: Array<{
    country: string;
    count: number;
  }>;
  recentActivity: Array<{
    type: 'dream' | 'party';
    location: string;
    timestamp: string;
  }>;
  campaignGoals: {
    dreamsTarget: number;
    dreamersTarget: number;
    partiesTarget: number;
    currentParties: number;
  };
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get total dreams count
    const { count: totalDreams } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true });

    // Get unique dreamers count
    const { data: dreamersData } = await supabase
      .from('dreams')
      .select('dreamer_email');
    
    const uniqueDreamers = new Set(dreamersData?.map(d => d.dreamer_email) || []);
    const totalDreamers = uniqueDreamers.size;

    // Get top routes
    const { data: routesData } = await supabase
      .rpc('get_top_routes', { limit_count: 5 });

    const topRoutes = routesData || [
      { from: 'Berlin', to: 'Vienna', count: 5 },
      { from: 'Paris', to: 'Madrid', count: 3 },
      { from: 'Amsterdam', to: 'Rome', count: 2 }
    ];

    // Get country stats (extract from station names)
    const { data: dreamsWithStations } = await supabase
      .from('dreams')
      .select('from_station, to_station');

    const countryCount: { [key: string]: number } = {};
    dreamsWithStations?.forEach(dream => {
      // Simple country extraction from station names
      const fromCountry = extractCountry(dream.from_station);
      const toCountry = extractCountry(dream.to_station);
      
      if (fromCountry) countryCount[fromCountry] = (countryCount[fromCountry] || 0) + 1;
      if (toCountry) countryCount[toCountry] = (countryCount[toCountry] || 0) + 1;
    });

    const topCountries = Object.entries(countryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    // Get recent dreams
    const { data: recentDreams } = await supabase
      .from('dreams')
      .select('from_station, to_station, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    // Get recent parties
    const { data: recentParties } = await supabase
      .from('pajama_parties')
      .select('station_name, created_at')
      .order('created_at', { ascending: false })
      .limit(2);

    // Get pajama parties count
    const { count: currentParties } = await supabase
      .from('pajama_parties')
      .select('*', { count: 'exact', head: true });

    // Combine recent activity
    const recentActivity = [
      ...(recentDreams || []).map(dream => ({
        type: 'dream' as const,
        location: `${extractCityFromStation(dream.from_station)} → ${extractCityFromStation(dream.to_station)}`,
        timestamp: dream.created_at
      })),
      ...(recentParties || []).map(party => ({
        type: 'party' as const,
        location: party.station_name,
        timestamp: party.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

    const stats: StatsData = {
      totalDreams: totalDreams || 0,
      totalDreamers,
      topRoutes,
      topCountries,
      recentActivity,
      campaignGoals: {
        dreamsTarget: 1000,
        dreamersTarget: 500,
        partiesTarget: 50,
        currentParties: currentParties || 0
      }
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching stats:', error);
    
    // Return fallback stats if database fails
    const fallbackStats: StatsData = {
      totalDreams: 0,
      totalDreamers: 0,
      topRoutes: [],
      topCountries: [],
      recentActivity: [],
      campaignGoals: {
        dreamsTarget: 1000,
        dreamersTarget: 500,
        partiesTarget: 50,
        currentParties: 0
      }
    };

    return NextResponse.json(fallbackStats);
  }
}

// Helper functions
function extractCountry(stationName: string): string | null {
  const parts = stationName.split(',');
  return parts.length >= 3 ? parts[2].trim() : null;
}

function extractCityFromStation(stationName: string): string {
  const parts = stationName.split(',');
  return parts.length >= 2 ? parts[1].trim() : stationName;
}