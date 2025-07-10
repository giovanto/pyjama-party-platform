import { NextRequest, NextResponse } from 'next/server';

interface Station {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
}

const MOCK_STATIONS: Station[] = [
  { id: 'berlin-hbf', name: 'Berlin Hauptbahnhof', city: 'Berlin', country: 'Germany', coordinates: [13.3690, 52.5251] },
  { id: 'vienna-central', name: 'Vienna Central Station', city: 'Vienna', country: 'Austria', coordinates: [16.3792, 48.1851] },
  { id: 'paris-gare-de-lyon', name: 'Gare de Lyon', city: 'Paris', country: 'France', coordinates: [2.3732, 48.8447] },
  { id: 'madrid-puerta-atocha', name: 'Madrid Puerta de Atocha', city: 'Madrid', country: 'Spain', coordinates: [-3.6906, 40.4063] },
  { id: 'rome-termini', name: 'Roma Termini', city: 'Rome', country: 'Italy', coordinates: [12.5010, 41.9009] },
  { id: 'amsterdam-centraal', name: 'Amsterdam Centraal', city: 'Amsterdam', country: 'Netherlands', coordinates: [4.9000, 52.3789] },
  { id: 'zurich-hb', name: 'Zürich Hauptbahnhof', city: 'Zurich', country: 'Switzerland', coordinates: [8.5402, 47.3784] },
  { id: 'copenhagen-central', name: 'Copenhagen Central Station', city: 'Copenhagen', country: 'Denmark', coordinates: [12.5655, 55.6730] },
  { id: 'stockholm-central', name: 'Stockholm Central Station', city: 'Stockholm', country: 'Sweden', coordinates: [18.0590, 59.3301] },
  { id: 'oslo-central', name: 'Oslo Central Station', city: 'Oslo', country: 'Norway', coordinates: [10.7528, 59.9116] },
  { id: 'brussels-central', name: 'Brussels Central Station', city: 'Brussels', country: 'Belgium', coordinates: [4.3571, 50.8453] },
  { id: 'prague-main', name: 'Praha hlavní nádraží', city: 'Prague', country: 'Czech Republic', coordinates: [14.4356, 50.0839] },
  { id: 'budapest-keleti', name: 'Budapest Keleti', city: 'Budapest', country: 'Hungary', coordinates: [19.0815, 47.5000] },
  { id: 'warsaw-central', name: 'Warszawa Centralna', city: 'Warsaw', country: 'Poland', coordinates: [21.0030, 52.2286] },
  { id: 'lisbon-oriente', name: 'Lisboa Oriente', city: 'Lisbon', country: 'Portugal', coordinates: [-9.0983, 38.7681] },
  { id: 'barcelona-sants', name: 'Barcelona Sants', city: 'Barcelona', country: 'Spain', coordinates: [2.1404, 41.3792] },
  { id: 'munich-hbf', name: 'München Hauptbahnhof', city: 'Munich', country: 'Germany', coordinates: [11.5608, 48.1405] },
  { id: 'frankfurt-hbf', name: 'Frankfurt (Main) Hauptbahnhof', city: 'Frankfurt', country: 'Germany', coordinates: [8.6625, 50.1073] },
  { id: 'cologne-hbf', name: 'Köln Hauptbahnhof', city: 'Cologne', country: 'Germany', coordinates: [6.9589, 50.9430] },
  { id: 'hamburg-hbf', name: 'Hamburg Hauptbahnhof', city: 'Hamburg', country: 'Germany', coordinates: [10.0063, 53.5527] }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    
    if (query.length < 2) {
      return NextResponse.json({
        stations: [],
        query
      });
    }

    const filteredStations = MOCK_STATIONS.filter(station => 
      station.name.toLowerCase().includes(query) ||
      station.city.toLowerCase().includes(query) ||
      station.country.toLowerCase().includes(query)
    ).slice(0, 10);

    return NextResponse.json({
      stations: filteredStations,
      query,
      total: filteredStations.length
    });

  } catch (error) {
    console.error('Error searching stations:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}