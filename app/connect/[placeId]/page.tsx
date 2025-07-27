'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Search, MapPin, Train, Clock, Users, TreePine, Zap } from 'lucide-react';
import { DreamMap } from '@/components/map';

interface Place {
  place_id: string;
  name: string;
  brief_description: string;
  country: string;
  latitude: number;
  longitude: number;
  place_type: string;
  place_image?: string;
}

interface Station {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  has_night_train?: boolean;
}

interface RouteInfo {
  distance: number;
  duration: string;
  climate_impact: {
    train_co2: number;
    flight_co2: number;
    savings_percentage: number;
  };
  route_exists: boolean;
  suggested_connections: string[];
}

export default function TrainConnectionPage() {
  const params = useParams();
  const placeId = params.placeId as string;

  const [place, setPlace] = useState<Place | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Station[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<Station | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Fetch place data
  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const response = await fetch(`/api/places/${placeId}`);
        if (response.ok) {
          const data = await response.json();
          setPlace(data.place);
        }
      } catch (error) {
        console.error('Error fetching place:', error);
      }
    };

    if (placeId) {
      fetchPlace();
    }
  }, [placeId]);

  // Search for origin stations
  const searchStations = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/stations/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.stations || []);
      } else {
        // Fallback to sample data if API not available
        const sampleStations: Station[] = [
          { id: '1', name: 'Berlin Hauptbahnhof', city: 'Berlin', country: 'Germany', latitude: 52.5251, longitude: 13.3777, has_night_train: true },
          { id: '2', name: 'Paris Gare de l\'Est', city: 'Paris', country: 'France', latitude: 48.8768, longitude: 2.3590, has_night_train: true },
          { id: '3', name: 'Vienna Central', city: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738, has_night_train: true },
          { id: '4', name: 'Amsterdam Central', city: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041, has_night_train: false },
          { id: '5', name: 'Brussels Central', city: 'Brussels', country: 'Belgium', latitude: 50.8456, longitude: 4.3571, has_night_train: false },
        ].filter(station => 
          station.name.toLowerCase().includes(query.toLowerCase()) ||
          station.city.toLowerCase().includes(query.toLowerCase()) ||
          station.country.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(sampleStations);
      }
    } catch (error) {
      console.error('Error searching stations:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchStations]);

  // Calculate route information
  const calculateRoute = useCallback(async (origin: Station) => {
    if (!place) return;

    setIsLoading(true);
    try {
      // Calculate distance (simplified great circle distance)
      const lat1 = origin.latitude * Math.PI / 180;
      const lat2 = place.latitude * Math.PI / 180;
      const deltaLat = (place.latitude - origin.latitude) * Math.PI / 180;
      const deltaLon = (place.longitude - origin.longitude) * Math.PI / 180;

      const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = 6371 * c; // Earth's radius in km

      // Estimate travel time (average 80 km/h for trains)
      const hours = Math.round(distance / 80);
      const duration = hours > 24 ? `${Math.floor(hours/24)}d ${hours%24}h` : `${hours}h`;

      // Calculate climate impact
      const train_co2 = Math.round(distance * 0.014); // kg CO2 per km for trains
      const flight_co2 = Math.round(distance * 0.255); // kg CO2 per km for flights
      const savings_percentage = Math.round(((flight_co2 - train_co2) / flight_co2) * 100);

      const routeInfo: RouteInfo = {
        distance: Math.round(distance),
        duration,
        climate_impact: {
          train_co2,
          flight_co2,
          savings_percentage
        },
        route_exists: distance < 2000, // Assume routes exist for reasonable distances
        suggested_connections: distance > 1000 
          ? ['Consider overnight connections', 'Multiple train segments available']
          : ['Direct or same-day connection possible']
      };

      setRouteInfo(routeInfo);
    } catch (error) {
      console.error('Error calculating route:', error);
    } finally {
      setIsLoading(false);
    }
  }, [place]);

  // Handle origin selection
  const handleOriginSelect = (station: Station) => {
    setSelectedOrigin(station);
    setSearchQuery(station.name);
    setSearchResults([]);
    calculateRoute(station);
  };

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading destination...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-sm border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href={`/dream/${placeId}`}
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to {place.name}</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMap(!showMap)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center lg:text-left">
              <div className="flex items-center gap-2 text-blue-600 mb-4">
                <Train className="h-5 w-5" />
                <span className="font-medium">Night Train Connection</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                How to reach {place.name}
              </h1>
              <p className="text-xl text-gray-600">
                Find sustainable train routes from your location to this beautiful destination
              </p>
            </div>

            {/* Origin Search */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Where are you traveling from?
              </h2>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for your departure station..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
                  {searchResults.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleOriginSelect(station)}
                      className="w-full text-left px-4 py-3 hover:bg-white hover:shadow-sm transition-all border-b border-gray-200 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{station.name}</div>
                          <div className="text-sm text-gray-600">{station.city}, {station.country}</div>
                        </div>
                        {station.has_night_train && (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <Train className="h-4 w-4" />
                            <span>Night Train</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {isLoading && searchQuery && (
                <div className="mt-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  Searching stations...
                </div>
              )}
            </div>

            {/* Route Information */}
            {selectedOrigin && routeInfo && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  Route: {selectedOrigin.city} → {place.name}
                </h3>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{routeInfo.distance} km</div>
                      <div className="text-sm text-gray-600">Distance</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{routeInfo.duration}</div>
                      <div className="text-sm text-gray-600">Travel Time</div>
                    </div>
                  </div>
                </div>

                {/* Climate Impact */}
                <div className="bg-green-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <TreePine className="h-5 w-5" />
                    Climate Impact
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-700">{routeInfo.climate_impact.train_co2}</div>
                      <div className="text-xs text-green-600">kg CO₂ by train</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{routeInfo.climate_impact.flight_co2}</div>
                      <div className="text-xs text-red-500">kg CO₂ by flight</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">{routeInfo.climate_impact.savings_percentage}%</div>
                      <div className="text-xs text-blue-600">CO₂ savings</div>
                    </div>
                  </div>
                </div>

                {/* Route Status */}
                <div className={`rounded-xl p-4 mb-6 ${
                  routeInfo.route_exists 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                    routeInfo.route_exists ? 'text-blue-800' : 'text-amber-800'
                  }`}>
                    <Zap className="h-5 w-5" />
                    {routeInfo.route_exists ? 'Route Available' : 'Route Under Development'}
                  </h4>
                  <ul className={`text-sm space-y-1 ${
                    routeInfo.route_exists ? 'text-blue-700' : 'text-amber-700'
                  }`}>
                    {routeInfo.suggested_connections.map((connection, index) => (
                      <li key={index}>• {connection}</li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href={`/participate?from=${selectedOrigin.id}&to=${placeId}`}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-medium text-center"
                  >
                    <Users className="h-5 w-5 inline mr-2" />
                    Join This Route Dream
                  </Link>
                  <Link
                    href="/pyjama-party"
                    className="flex-1 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                  >
                    Learn About the Movement
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Map Section */}
          <div className="lg:sticky lg:top-24">
            {showMap && (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Route Visualization</h3>
                  <p className="text-sm text-gray-600">Interactive map showing your journey</p>
                </div>
                <div className="h-96">
                  <DreamMap
                    className="w-full h-full"
                    center={place ? [place.longitude, place.latitude] : undefined}
                    zoom={6}
                    showLayerManager={false}
                    optimizePerformance={true}
                  />
                </div>
              </div>
            )}

            {/* Quick Info */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mt-8">
              <h3 className="font-semibold text-gray-900 mb-4">Why Choose Night Trains?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <TreePine className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Sustainable Travel</div>
                    <div className="text-sm text-gray-600">Up to 90% less CO₂ than flying</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Time Efficient</div>
                    <div className="text-sm text-gray-600">Sleep while you travel, arrive refreshed</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-gray-900">Community Impact</div>
                    <div className="text-sm text-gray-600">Join the European night train renaissance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}