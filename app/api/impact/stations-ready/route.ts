import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { corsHeaders } from '@/lib/cors';

const CACHE_CONTROL = 'public, max-age=600, stale-while-revalidate=1200';

// Critical mass thresholds for stations
const CRITICAL_MASS_THRESHOLDS = {
  READY: 50,      // Station ready for pajama party
  BUILDING: 20,   // Building momentum
  EMERGING: 5     // Early interest
};

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    
    // Get all dreams with station and email data
    const { data: dreams, error } = await supabase
      .from('public_dreams')
      .select('from_station, to_station, created_at')
      .not('from_station', 'is', null);

    if (error) {
      console.error('Error fetching station data:', error);
      return NextResponse.json(
        { error: 'Failed to fetch station data' },
        { status: 500 }
      );
    }

    // Count participants by station (both origin and destination)
    const stationMap = new Map<string, {
      totalInterest: number;
      participants: number;
      organizers: number;
      recentActivity: number;
      dreams: Array<{ date: string; isParticipant: boolean; isOrganizer: boolean }>;
    }>();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    dreams?.forEach((dream) => {
      const stations = [dream.from_station, dream.to_station].filter(Boolean);
      const isParticipant = false;
      const isOrganizer = false;
      const dreamDate = dream.created_at;
      const isRecent = new Date(dreamDate) > oneWeekAgo;

      stations.forEach((station) => {
        if (!station) return;
        
        // Extract city from station (format: "Station, City, Country")
        const parts = station.split(',');
        const city = parts.length > 1 ? parts[1].trim() : station;
        const stationKey = `${city} (${parts[parts.length - 1]?.trim() || 'Unknown'})`;

        const existing = stationMap.get(stationKey) || {
          totalInterest: 0,
          participants: 0,
          organizers: 0,
          recentActivity: 0,
          dreams: []
        };

        existing.totalInterest++;
        existing.dreams.push({ 
          date: dreamDate, 
          isParticipant, 
          isOrganizer 
        });

        if (isParticipant) existing.participants++;
        if (isOrganizer) existing.organizers++;
        if (isRecent) existing.recentActivity++;

        stationMap.set(stationKey, existing);
      });
    });

    // Categorize stations by readiness
    const readyStations: any[] = [];
    const buildingStations: any[] = [];
    const emergingStations: any[] = [];

    stationMap.forEach((data, station) => {
      const stationData = {
        station,
        totalInterest: data.totalInterest,
        participants: data.participants,
        organizers: data.organizers,
        recentActivity: data.recentActivity,
        readinessScore: calculateReadinessScore(data),
        momentum: data.recentActivity > 0 ? 'growing' : 'steady',
        hasOrganizer: data.organizers > 0,
        participationRate: Math.round((data.participants / data.totalInterest) * 100)
      };

      if (data.participants >= CRITICAL_MASS_THRESHOLDS.READY) {
        readyStations.push(stationData);
      } else if (data.participants >= CRITICAL_MASS_THRESHOLDS.BUILDING) {
        buildingStations.push(stationData);
      } else if (data.participants >= CRITICAL_MASS_THRESHOLDS.EMERGING) {
        emergingStations.push(stationData);
      }
    });

    // Sort by readiness score
    const sortByScore = (a: any, b: any) => b.readinessScore - a.readinessScore;
    readyStations.sort(sortByScore);
    buildingStations.sort(sortByScore);
    emergingStations.sort(sortByScore);

    // Calculate summary metrics
    const totalStations = stationMap.size;
    const stationsWithParticipants = Array.from(stationMap.values()).filter(s => s.participants > 0).length;
    const stationsWithOrganizers = Array.from(stationMap.values()).filter(s => s.organizers > 0).length;

    const responseData = {
      readyStations: readyStations.slice(0, 20), // Top 20
      buildingStations: buildingStations.slice(0, 15), // Top 15
      emergingStations: emergingStations.slice(0, 10), // Top 10
      summary: {
        totalStations,
        readyCount: readyStations.length,
        buildingCount: buildingStations.length,
        emergingCount: emergingStations.length,
        stationsWithParticipants,
        stationsWithOrganizers,
        coverageRate: Math.round((stationsWithParticipants / totalStations) * 100)
      },
      thresholds: CRITICAL_MASS_THRESHOLDS,
      lastUpdated: new Date().toISOString(),
    };

    const headers = { ...corsHeaders(request, ['GET']), 'Cache-Control': CACHE_CONTROL };
    return NextResponse.json(responseData, { headers });
  } catch (error) {
    console.error('Stations ready API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateReadinessScore(data: {
  totalInterest: number;
  participants: number;
  organizers: number;
  recentActivity: number;
}): number {
  let score = 0;
  
  // Base score from participants
  score += data.participants * 2;
  
  // Bonus for organizers
  score += data.organizers * 10;
  
  // Bonus for recent activity
  score += data.recentActivity * 1.5;
  
  // Bonus for participation rate
  const participationRate = data.participants / data.totalInterest;
  score += participationRate * 20;
  
  return Math.round(score * 10) / 10;
}
