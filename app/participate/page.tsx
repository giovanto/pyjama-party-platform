'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, MapPin, Heart, Mail, Calendar, CheckCircle, AlertCircle, Star, Shield } from 'lucide-react';

interface Station {
  id: string;
  name: string;
  city: string;
  country: string;
  has_organizer: boolean;
  expected_attendance: number;
  readiness_level: 'critical' | 'high' | 'medium' | 'low';
}

interface ParticipationLevel {
  id: 'show_up' | 'help_organize' | 'local_coordinator';
  name: string;
  description: string;
  commitment: string;
  icon: any;
  color: string;
}

function ParticipatePageContent() {
  const searchParams = useSearchParams();
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [stationSearch, setStationSearch] = useState('');
  const [stationResults, setStationResults] = useState<Station[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<ParticipationLevel['id']>('show_up');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    station_id: '',
    participation_level: 'show_up',
    message: '',
    newsletter: true,
    privacy_consent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const participationLevels: ParticipationLevel[] = [
    {
      id: 'show_up',
      name: 'Show Up & Celebrate',
      description: 'Join the party in your pajamas, dance, and be part of the movement',
      commitment: 'Just show up on September 26th',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      id: 'help_organize',
      name: 'Help Organize',
      description: 'Assist with event planning, promotion, and on-the-day coordination',
      commitment: '2-4 hours per month leading up to the event',
      icon: Heart,
      color: 'bg-purple-500'
    },
    {
      id: 'local_coordinator',
      name: 'Local Coordinator',
      description: 'Lead the organization for your station, coordinate with authorities',
      commitment: '5-10 hours per month, ongoing responsibility',
      icon: Star,
      color: 'bg-orange-500'
    }
  ];

  // Pre-fill form if coming from a route
  useEffect(() => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    
    if (fromParam) {
      // In a real implementation, fetch station details from the API
      setStationSearch('Berlin Hauptbahnhof'); // Example
    }
  }, [searchParams]);

  // Search for stations
  useEffect(() => {
    const searchStations = async () => {
      if (!stationSearch.trim() || stationSearch.length < 2) {
        setStationResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/stations/search?q=${encodeURIComponent(stationSearch)}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          setStationResults(data.stations || []);
        } else {
          // Fallback sample data
          const sampleStations: Station[] = [
            { 
              id: '1', 
              name: 'Berlin Hauptbahnhof', 
              city: 'Berlin', 
              country: 'Germany', 
              has_organizer: true, 
              expected_attendance: 250,
              readiness_level: 'critical'
            },
            { 
              id: '2', 
              name: 'Paris Gare de l\'Est', 
              city: 'Paris', 
              country: 'France', 
              has_organizer: true, 
              expected_attendance: 180,
              readiness_level: 'high'
            },
            { 
              id: '3', 
              name: 'Amsterdam Central', 
              city: 'Amsterdam', 
              country: 'Netherlands', 
              has_organizer: false, 
              expected_attendance: 45,
              readiness_level: 'medium'
            },
            { 
              id: '4', 
              name: 'Madrid Atocha', 
              city: 'Madrid', 
              country: 'Spain', 
              has_organizer: false, 
              expected_attendance: 15,
              readiness_level: 'low'
            },
          ].filter(station => 
            station.name.toLowerCase().includes(stationSearch.toLowerCase()) ||
            station.city.toLowerCase().includes(stationSearch.toLowerCase())
          );
          setStationResults(sampleStations);
        }
      } catch (error) {
        console.error('Error searching stations:', error);
      }
    };

    const timeoutId = setTimeout(searchStations, 300);
    return () => clearTimeout(timeoutId);
  }, [stationSearch]);

  const handleStationSelect = (station: Station) => {
    setSelectedStation(station);
    setStationSearch(station.name);
    setStationResults([]);
    setFormData(prev => ({ ...prev, station_id: station.id }));
  };

  const handleLevelSelect = (level: ParticipationLevel['id']) => {
    setSelectedLevel(level);
    setFormData(prev => ({ ...prev, participation_level: level }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.privacy_consent) {
      setError('Please accept the privacy policy to continue.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/pyjama-parties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dreamer_name: formData.name,
          email_address: formData.email,
          station_name: selectedStation?.name || stationSearch,
          additional_info: formData.message
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to submit. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to the Movement! 🎉
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Thank you for joining the European Pajama Party! We'll send you updates about 
              {selectedStation ? ` ${selectedStation.name}` : ' your station'} and the movement.
            </p>

            <div className="bg-purple-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-purple-900 mb-2">What happens next?</h3>
              <ul className="text-left text-purple-800 space-y-2">
                <li>• You'll receive a welcome email with event details</li>
                <li>• Get updates about your local station's organization</li>
                <li>• Join our Discord community for real-time coordination</li>
                <li>• Receive your digital pajama party badge</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/community"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                Join Community Discord
              </Link>
              <Link
                href="/pyjama-party"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Share the Movement
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              Mark your calendar: September 26, 2025 at 8 PM local time
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Navigation */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/pyjama-party"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Event Info</span>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              September 26, 2025
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Join the European Pajama Party
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sign up to participate in the biggest climate action celebration in Europe. 
            Choose how you want to contribute to the movement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          {/* Station Selection */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Station</h2>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                placeholder="Search for your local train station..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Station Results */}
            {stationResults.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                {stationResults.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => handleStationSelect(station)}
                    className="w-full text-left px-4 py-4 hover:bg-white hover:shadow-sm transition-all border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{station.name}</div>
                        <div className="text-sm text-gray-600">{station.city}, {station.country}</div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-blue-600">
                            ~{station.expected_attendance} expected attendees
                          </span>
                          {station.has_organizer && (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" />
                              Has organizer
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        station.readiness_level === 'critical' ? 'bg-red-100 text-red-800' :
                        station.readiness_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        station.readiness_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {station.readiness_level.toUpperCase()} READINESS
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Participation Level */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">How Do You Want to Participate?</h2>
            
            <div className="grid gap-4">
              {participationLevels.map((level) => {
                const IconComponent = level.icon;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleLevelSelect(level.id)}
                    className={`text-left p-6 rounded-xl border-2 transition-all ${
                      selectedLevel === level.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${level.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{level.name}</h3>
                        <p className="text-gray-600 mb-2">{level.description}</p>
                        <p className="text-sm text-gray-500 font-medium">{level.commitment}</p>
                      </div>
                      {selectedLevel === level.id && (
                        <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Message */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tell us why you're joining the movement, any special skills you have, or questions..."
              />
            </div>
          </div>

          {/* Consent and Newsletter */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Communication Preferences</h2>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Newsletter & Updates</div>
                  <div className="text-sm text-gray-600">
                    Receive updates about the pajama party, your local station, and the Back-on-Track movement.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.privacy_consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacy_consent: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Privacy Policy & Terms *
                  </div>
                  <div className="text-sm text-gray-600">
                    I agree to the <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline">privacy policy</Link> and <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline">terms of service</Link>.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting || !formData.privacy_consent}
              className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2"></div>
                  Joining the Movement...
                </>
              ) : (
                <>
                  <Heart className="h-6 w-6 inline mr-2" />
                  Join the European Pajama Party
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              By joining, you become part of a Europe-wide movement for sustainable travel
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ParticipatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading participation form...</p>
        </div>
      </div>
    }>
      <ParticipatePageContent />
    </Suspense>
  );
}