'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, MapPin, Heart, Calendar, CheckCircle, AlertCircle, Star } from 'lucide-react';

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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    
    if (fromParam) {
      // In a real implementation, fetch station details from the API
      setStationSearch('Berlin Hauptbahnhof'); // Example
    }
  }, [searchParams]);

  // Search for stations with accessibility announcements
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
        setFormErrors(prev => ({...prev, station: 'Unable to search stations. Please try again.'}));
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
    setFormErrors(prev => ({...prev, station: ''}));
    
    // Announce selection to screen readers
    const announcement = `Selected station: ${station.name}, ${station.city}, ${station.country}`;
    const announcementEl = document.getElementById('station-announcement');
    if (announcementEl) {
      announcementEl.textContent = announcement;
    }
  };

  const handleLevelSelect = (level: ParticipationLevel['id']) => {
    setSelectedLevel(level);
    setFormData(prev => ({ ...prev, participation_level: level }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.station_id && !selectedStation) {
      errors.station = 'Please select a train station';
    }
    
    if (!formData.privacy_consent) {
      errors.privacy = 'You must accept the privacy policy to continue';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Focus on first error field
      const firstError = Object.keys(formErrors)[0];
      const errorField = document.getElementById(firstError === 'privacy' ? 'privacy-consent' : firstError);
      if (errorField) {
        errorField.focus();
      }
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
        // Announce success to screen readers
        const successEl = document.getElementById('form-status');
        if (successEl) {
          successEl.textContent = 'Successfully joined the European Pajama Party!';
        }
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
        <main className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" aria-hidden="true" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to the Movement! <span role="img" aria-label="celebration">🎉</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8">
              Thank you for joining the European Pajama Party! We'll send you updates about 
              {selectedStation ? ` ${selectedStation.name}` : ' your station'} and the movement.
            </p>

            <section className="bg-purple-50 rounded-2xl p-6 mb-8" aria-labelledby="next-steps-heading">
              <h2 id="next-steps-heading" className="font-semibold text-purple-900 mb-2">What happens next?</h2>
              <ul className="text-left text-purple-800 space-y-2">
                <li>• You'll receive a welcome email with event details</li>
                <li>• Get updates about your local station's organization</li>
                <li>• Join our Discord community for real-time coordination</li>
                <li>• Receive your digital pajama party badge</li>
              </ul>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/community"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Join Community Discord
              </Link>
              <Link
                href="/pyjama-party"
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Share the Movement
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              <time dateTime="2025-09-26T20:00">Mark your calendar: September 26, 2025 at 8 PM local time</time>
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Skip to content link for screen readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-sm border-b border-purple-200" role="navigation" aria-label="Page navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/pyjama-party"
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded"
              aria-label="Go back to event information page"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              <span className="font-medium">Back to Event Info</span>
            </Link>
            
            <div className="flex items-center gap-2 text-sm text-gray-600" role="text" aria-label="Event date">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <time dateTime="2025-09-26">September 26, 2025</time>
            </div>
          </div>
        </div>
      </nav>

      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 id="page-title" className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Join the European Pajama Party
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sign up to participate in the biggest climate action celebration in Europe. 
            Choose how you want to contribute to the movement.
          </p>
        </header>

        {/* Live region for form announcements */}
        <div id="form-status" aria-live="polite" aria-atomic="true" className="sr-only"></div>
        <div id="station-announcement" aria-live="polite" aria-atomic="true" className="sr-only"></div>

        <form onSubmit={handleSubmit} className="space-y-8" role="form" aria-labelledby="page-title" noValidate>
          {/* Personal Information */}
          <section className="bg-white rounded-2xl p-8 shadow-lg" role="group" aria-labelledby="personal-info-heading">
            <h2 id="personal-info-heading" className="text-2xl font-semibold text-gray-900 mb-6">Personal Information</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  aria-required="true"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Your full name"
                  aria-describedby="name-help name-error"
                  aria-invalid={formErrors.name ? 'true' : 'false'}
                />
                <div id="name-help" className="sr-only">Enter your full name for event registration</div>
                {formErrors.name && (
                  <p id="name-error" className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  aria-required="true"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com"
                  aria-describedby="email-help email-error"
                  aria-invalid={formErrors.email ? 'true' : 'false'}
                />
                <div id="email-help" className="sr-only">Enter your email address for event updates and communications</div>
                {formErrors.email && (
                  <p id="email-error" className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
                    {formErrors.email}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Station Selection */}
          <section className="bg-white rounded-2xl p-8 shadow-lg" role="group" aria-labelledby="station-selection-heading">
            <h2 id="station-selection-heading" className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Station</h2>
            
            <div className="relative">
              <label htmlFor="station-search" className="sr-only">Search for train station</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="station-search"
                name="station-search"
                value={stationSearch}
                onChange={(e) => setStationSearch(e.target.value)}
                placeholder="Search for your local train station..."
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  formErrors.station ? 'border-red-500' : 'border-gray-300'
                }`}
                aria-describedby="station-search-help station-error"
                aria-autocomplete="list"
                aria-expanded={stationResults.length > 0}
                aria-haspopup="listbox"
                role="combobox"
                aria-controls="station-results"
              />
              <div id="station-search-help" className="sr-only">Type to search for your local train station from the list</div>
              {formErrors.station && (
                <p id="station-error" className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
                  {formErrors.station}
                </p>
              )}
            </div>

            {/* Station Results */}
            {stationResults.length > 0 && (
              <div 
                className="mt-4 bg-gray-50 rounded-lg max-h-64 overflow-y-auto" 
                role="listbox" 
                aria-label="Station search results" 
                id="station-results"
              >
                {stationResults.map((station) => (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => handleStationSelect(station)}
                    className="w-full text-left px-4 py-4 hover:bg-white hover:shadow-sm transition-all border-b border-gray-200 last:border-b-0 focus:outline-none focus:bg-white focus:shadow-sm"
                    role="option"
                    aria-selected={selectedStation?.id === station.id}
                    aria-describedby={`station-desc-${station.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{station.name}</div>
                        <div className="text-sm text-gray-600">{station.city}, {station.country}</div>
                        <div className="flex items-center gap-4 mt-2 text-sm" id={`station-desc-${station.id}`}>
                          <span className="text-blue-600">
                            ~{station.expected_attendance} expected attendees
                          </span>
                          {station.has_organizer && (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-4 w-4" aria-hidden="true" />
                              <span>Has organizer</span>
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
          </section>

          {/* Participation Level */}
          <section className="bg-white rounded-2xl p-8 shadow-lg" role="group" aria-labelledby="participation-level-heading">
            <h2 id="participation-level-heading" className="text-2xl font-semibold text-gray-900 mb-6">How Do You Want to Participate?</h2>
            
            <div className="grid gap-4" role="radiogroup" aria-labelledby="participation-level-heading" aria-required="true">
              {participationLevels.map((level) => {
                const IconComponent = level.icon;
                return (
                  <button
                    key={level.id}
                    type="button"
                    onClick={() => handleLevelSelect(level.id)}
                    className={`text-left p-6 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      selectedLevel === level.id 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    role="radio"
                    aria-checked={selectedLevel === level.id}
                    aria-describedby={`level-desc-${level.id}`}
                    aria-labelledby={`level-name-${level.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${level.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                        <IconComponent className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 id={`level-name-${level.id}`} className="text-lg font-semibold text-gray-900 mb-2">{level.name}</h3>
                        <div id={`level-desc-${level.id}`}>
                          <p className="text-gray-600 mb-2">{level.description}</p>
                          <p className="text-sm text-gray-500 font-medium">{level.commitment}</p>
                        </div>
                      </div>
                      {selectedLevel === level.id && (
                        <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0" aria-hidden="true" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Optional Message */}
          <section className="bg-white rounded-2xl p-8 shadow-lg" role="group" aria-labelledby="additional-info-heading">
            <h2 id="additional-info-heading" className="text-2xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tell us why you're joining the movement, any special skills you have, or questions..."
                aria-describedby="message-help"
              />
              <div id="message-help" className="sr-only">Optional: Share why you're joining, your skills, or any questions</div>
            </div>
          </section>

          {/* Consent and Newsletter */}
          <section className="bg-white rounded-2xl p-8 shadow-lg" role="group" aria-labelledby="communication-prefs-heading">
            <h2 id="communication-prefs-heading" className="text-2xl font-semibold text-gray-900 mb-6">Communication Preferences</h2>
            
            <fieldset className="space-y-4">
              <legend className="sr-only">Communication and privacy preferences</legend>
              
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="newsletter-opt-in"
                  name="newsletter"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData(prev => ({ ...prev, newsletter: e.target.checked }))}
                  className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                  aria-describedby="newsletter-desc"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Newsletter & Updates</div>
                  <div id="newsletter-desc" className="text-sm text-gray-600">
                    Receive updates about the pajama party, your local station, and the Back-on-Track movement.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  name="privacy_consent"
                  required
                  aria-required="true"
                  checked={formData.privacy_consent}
                  onChange={(e) => setFormData(prev => ({ ...prev, privacy_consent: e.target.checked }))}
                  className={`mt-1 h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    formErrors.privacy ? 'border-red-500' : ''
                  }`}
                  aria-describedby="privacy-desc privacy-error"
                  aria-invalid={formErrors.privacy ? 'true' : 'false'}
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    Privacy Policy & Terms <span className="text-red-500" aria-label="required">*</span>
                  </div>
                  <div id="privacy-desc" className="text-sm text-gray-600">
                    I agree to the <Link href="/privacy" className="text-purple-600 hover:text-purple-700 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1" aria-label="Read privacy policy (opens in new window)" target="_blank">privacy policy</Link> and <Link href="/terms" className="text-purple-600 hover:text-purple-700 underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1" aria-label="Read terms of service (opens in new window)" target="_blank">terms of service</Link>.
                  </div>
                  {formErrors.privacy && (
                    <p id="privacy-error" className="text-red-500 text-sm mt-1" role="alert" aria-live="polite">
                      {formErrors.privacy}
                    </p>
                  )}
                </div>
              </label>
            </fieldset>
          </section>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3" role="alert" aria-live="polite">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" aria-hidden="true" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed transform-none' : ''
              }`}
              aria-describedby={isSubmitting ? 'submit-status' : undefined}
              aria-disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white inline mr-2" aria-hidden="true"></div>
                  <span id="submit-status">Joining the Movement...</span>
                </>
              ) : (
                <>
                  <Heart className="h-6 w-6 inline mr-2" aria-hidden="true" />
                  Join the European Pajama Party
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              By joining, you become part of a Europe-wide movement for sustainable travel
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function ParticipatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600">Loading participation form...</p>
        </div>
      </div>
    }>
      <ParticipatePageContent />
    </Suspense>
  );
}