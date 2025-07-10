/**
 * Mock Server Configuration
 * MSW (Mock Service Worker) setup for API mocking
 */

import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { Dream, Station, PlatformStats } from '../../types';

// Mock data
const mockDreams: Dream[] = [
  {
    id: '1',
    dreamer_name: 'Alice',
    origin_station: 'Berlin Hauptbahnhof',
    origin_country: 'DE',
    origin_lat: 52.5251,
    origin_lng: 13.3691,
    destination_city: 'Barcelona beach sunrise',
    destination_country: 'ES',
    destination_lat: 41.3851,
    destination_lng: 2.1734,
    email: 'alice@example.com',
    email_verified: false,
    created_at: new Date('2024-01-01').toISOString(),
    expires_at: new Date('2024-01-31').toISOString(),
  },
  {
    id: '2',
    dreamer_name: 'Bob',
    origin_station: 'Amsterdam Centraal',
    origin_country: 'NL',
    origin_lat: 52.3791,
    origin_lng: 4.9003,
    destination_city: 'Prague castle view',
    destination_country: 'CZ',
    destination_lat: 50.0755,
    destination_lng: 14.4378,
    email_verified: false,
    created_at: new Date('2024-01-02').toISOString(),
    expires_at: new Date('2024-02-01').toISOString(),
  },
];

const mockStations: Station[] = [
  {
    id: '1',
    name: 'Berlin Hauptbahnhof',
    country: 'DE',
    country_name: 'Germany',
    city: 'Berlin',
    lat: 52.5251,
    lng: 13.3691,
    station_type: 'station',
  },
  {
    id: '2',
    name: 'Amsterdam Centraal',
    country: 'NL',
    country_name: 'Netherlands',
    city: 'Amsterdam',
    lat: 52.3791,
    lng: 4.9003,
    station_type: 'station',
  },
  {
    id: '3',
    name: 'Paris Gare du Nord',
    country: 'FR',
    country_name: 'France',
    city: 'Paris',
    lat: 48.8808,
    lng: 2.3555,
    station_type: 'station',
  },
];

const mockStats: PlatformStats = {
  total_dreams: 2,
  active_stations: 2,
  communities_forming: 0,
  last_updated: new Date().toISOString(),
};

// Mock API handlers
export const handlers = [
  // Dreams endpoints
  http.get('/api/dreams', ({ request }) => {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '1000');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    const paginatedDreams = mockDreams.slice(offset, offset + limit);
    
    return HttpResponse.json({
      dreams: paginatedDreams,
      total: paginatedDreams.length,
      limit,
      offset,
    });
  }),

  http.post('/api/dreams', async ({ request }) => {
    const body = await request.json() as any;
    
    // Validate required fields
    if (!body.dreamer_name || !body.origin_station || !body.destination_city) {
      return HttpResponse.json(
        {
          error: 'Missing required fields',
          required: ['dreamer_name', 'origin_station', 'destination_city'],
        },
        { status: 400 }
      );
    }

    // Create new dream
    const newDream: Dream = {
      id: String(mockDreams.length + 1),
      dreamer_name: body.dreamer_name,
      origin_station: body.origin_station,
      origin_country: body.origin_country,
      origin_lat: body.origin_lat,
      origin_lng: body.origin_lng,
      destination_city: body.destination_city,
      destination_country: body.destination_country,
      destination_lat: body.destination_lat,
      destination_lng: body.destination_lng,
      email: body.email,
      email_verified: false,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    mockDreams.push(newDream);

    // Check for community formation
    const stationDreams = mockDreams.filter(d => d.origin_station === body.origin_station);
    let communityMessage = null;
    
    if (stationDreams.length >= 2) {
      communityMessage = `🎉 ${stationDreams.length} people from ${body.origin_station} are planning pajama parties! Join the movement!`;
    }

    return HttpResponse.json({
      success: true,
      dream: newDream,
      community_message: communityMessage,
    });
  }),

  // Stations endpoint
  http.get('/api/stations', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q')?.toLowerCase() || '';
    const country = url.searchParams.get('country')?.toUpperCase();
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (query.length < 2) {
      return HttpResponse.json(
        { error: 'Query parameter "q" must be at least 2 characters long' },
        { status: 400 }
      );
    }

    let filteredStations = mockStations.filter(station =>
      station.name.toLowerCase().includes(query) ||
      station.city?.toLowerCase().includes(query)
    );

    if (country) {
      filteredStations = filteredStations.filter(station =>
        station.country === country
      );
    }

    return HttpResponse.json(filteredStations.slice(0, limit));
  }),

  // Stats endpoint
  http.get('/api/stats', () => {
    // Calculate dynamic stats based on current mock data
    const stationCounts = mockDreams.reduce((acc, dream) => {
      acc[dream.origin_station] = (acc[dream.origin_station] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const communitiesForming = Object.values(stationCounts)
      .filter(count => count >= 2).length;

    const stats: PlatformStats = {
      total_dreams: mockDreams.length,
      active_stations: Object.keys(stationCounts).length,
      communities_forming: communitiesForming,
      last_updated: new Date().toISOString(),
    };

    return HttpResponse.json(stats);
  }),

  // Error simulation handlers
  http.get('/api/dreams/error', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  http.post('/api/dreams/error', () => {
    return HttpResponse.json(
      { error: 'Database connection failed' },
      { status: 500 }
    );
  }),
];

// Create and export the server
export const server = setupServer(...handlers);

// Export mock data for tests
export { mockDreams, mockStations, mockStats };