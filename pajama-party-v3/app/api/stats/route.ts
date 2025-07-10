import { NextResponse } from 'next/server';

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
    const mockStats: StatsData = {
      totalDreams: 247,
      totalDreamers: 189,
      topRoutes: [
        { from: 'Berlin', to: 'Vienna', count: 23 },
        { from: 'Paris', to: 'Madrid', count: 18 },
        { from: 'Amsterdam', to: 'Rome', count: 15 },
        { from: 'Copenhagen', to: 'Stockholm', count: 12 },
        { from: 'Prague', to: 'Budapest', count: 10 }
      ],
      topCountries: [
        { country: 'Germany', count: 67 },
        { country: 'France', count: 45 },
        { country: 'Spain', count: 32 },
        { country: 'Italy', count: 28 },
        { country: 'Netherlands', count: 25 }
      ],
      recentActivity: [
        { type: 'dream', location: 'Berlin → Vienna', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
        { type: 'party', location: 'Prague Central Station', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
        { type: 'dream', location: 'Amsterdam → Rome', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
        { type: 'dream', location: 'Paris → Madrid', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
        { type: 'party', location: 'Copenhagen Central Station', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString() }
      ],
      campaignGoals: {
        dreamsTarget: 1000,
        dreamersTarget: 500,
        partiesTarget: 50,
        currentParties: 12
      }
    };

    return NextResponse.json(mockStats);

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}