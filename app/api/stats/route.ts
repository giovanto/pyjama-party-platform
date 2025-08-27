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
  criticalMassStations: Array<{
    stationName: string;
    city: string;
    country: string;
    attendees: number;
    status: string;
  }>;
}

export async function GET() {
  try {
    const supabase = await createClient();

    // Get total dreams count
    const { count: totalDreams } = await supabase
      .from('dreams')
      .select('*', { count: 'exact', head: true });

    // Public endpoint: avoid PII fields; approximate dreamers by dreams
    const totalDreamers = totalDreams || 0;

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
      .from('public_dreams')
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
      .from('public_dreams')
      .select('from_station, to_station, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    // Get recent parties
    const { data: recentParties } = await supabase
      .from('pyjama_parties')
      .select('station_name, created_at')
      .order('created_at', { ascending: false })
      .limit(2);

    // Get pyjama parties count and critical mass detection
    const { count: currentParties } = await supabase
      .from('public_pyjama_parties')
      .select('*', { count: 'exact', head: true });

    // Enhanced critical mass detection with better grouping
    const { data: allPartiesData } = await supabase
      .from('public_pyjama_parties')
      .select('station_name, city, country, attendees_count, status')
      .eq('status', 'planned');

    // Group nearby stations (within 50km) to avoid splitting large cities
    const mappedPartiesData: PartyData[] = (allPartiesData || []).map(party => ({
      stationName: party.station_name,
      city: party.city,
      country: party.country,
      attendeeCount: party.attendees_count,
      latitude: party.latitude,
      longitude: party.longitude
    }));
    const stationGroups = groupNearbyStations(mappedPartiesData);
    
    // Calculate critical mass based on grouped stations
    const partiesData = stationGroups
      .map(group => ({
        ...group.mainStation,
        attendeeCount: group.totalAttendees,
        stationCount: group.stations.length
      }))
      .filter(station => {
        // Enhanced critical mass criteria:
        // - 2+ people at single station, OR
        // - 3+ people across nearby stations in same city, OR  
        // - 5+ people across stations in same metropolitan area
        return station.attendeeCount >= 2 || 
               (station.stationCount >= 2 && station.attendeeCount >= 3) ||
               (station.stationCount >= 3 && station.attendeeCount >= 5);
      })
      .sort((a, b) => b.attendeeCount - a.attendeeCount); // Sort by most participants

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
      },
      criticalMassStations: (partiesData || []).map(party => ({
        stationName: party.stationName,
        city: party.city,
        country: party.country,
        attendees: party.attendeeCount,
        status: 'planned'
      }))
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
      },
      criticalMassStations: []
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

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface PartyData {
  stationName: string;
  city: string;
  country: string;
  attendeeCount: number;
  latitude?: number;
  longitude?: number;
}

interface StationGroup {
  mainStation: PartyData;
  stations: PartyData[];
  totalAttendees: number;
}

// Group nearby stations for better critical mass detection
function groupNearbyStations(parties: PartyData[]): StationGroup[] {
  const groups: StationGroup[] = [];
  
  const processed = new Set<number>();
  
  parties.forEach((party, index) => {
    if (processed.has(index) || !party.latitude || !party.longitude) return;
    
    const group = {
      mainStation: party,
      stations: [party],
      totalAttendees: party.attendeeCount || 0
    };
    
    // Find nearby stations within 50km
    parties.forEach((otherParty, otherIndex) => {
      if (index === otherIndex || processed.has(otherIndex) || !otherParty.latitude || !otherParty.longitude) return;
      
      const distance = calculateDistance(
        party.latitude!, party.longitude!,
        otherParty.latitude!, otherParty.longitude!
      );
      
      // Group stations within 50km of each other
      if (distance <= 50) {
        group.stations.push(otherParty);
        group.totalAttendees += otherParty.attendeeCount || 0;
        processed.add(otherIndex);
        
        // Use the station with most attendees as the main station
        if (otherParty.attendeeCount > group.mainStation.attendeeCount) {
          group.mainStation = otherParty;
        }
      }
    });
    
    processed.add(index);
    groups.push(group);
  });
  
  return groups;
}
