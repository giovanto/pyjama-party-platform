/**
 * Main App Component
 * Pajama Party Platform - European Train Adventure Dreams
 */

import React, { useState, useCallback } from 'react';
import { Layout } from './components/Layout';
import { DreamForm } from './components/Forms/DreamForm';
import { MapComponent } from './components/Map';
import { CommunityStats, CommunityMessage } from './components/Community';
import { EventBanner } from './components/EventBanner';
import { FloatingNav } from './components/FloatingNav';
import { CommunityFeatures } from './components/CommunityFeatures';
import { useDreams } from './hooks';
import type { Dream } from './types';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState<'map' | 'form' | 'stats'>('map');
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [communityMessage, setCommunityMessage] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { addDream } = useDreams();

  // Handle navigation between sections
  const handleNavigation = useCallback((section: string) => {
    setActiveSection(section as 'map' | 'form' | 'stats');
    setSelectedDream(null);
  }, []);

  // Handle dream form submission success
  const handleDreamSubmitSuccess = useCallback((response: any) => {
    // Add dream optimistically to the map
    if (response.dream) {
      addDream(response.dream);
    }

    // Show community message if available
    if (response.community_message) {
      setCommunityMessage(response.community_message);
    }

    // Show success message
    setShowSuccessMessage(true);
    
    // Switch to map view to show the new dream
    setActiveSection('map');

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  }, [addDream]);

  // Handle dream form submission error
  const handleDreamSubmitError = useCallback((error: Error) => {
    console.error('Dream submission error:', error);
    // Error handling is done in the DreamForm component
  }, []);

  // Handle dream selection from map
  const handleDreamSelect = useCallback((dream: Dream) => {
    setSelectedDream(dream);
  }, []);

  // Handle community message close
  const handleCommunityMessageClose = useCallback(() => {
    setCommunityMessage(null);
  }, []);

  const handleSuccessMessageClose = useCallback(() => {
    setShowSuccessMessage(false);
  }, []);

  return (
    <Layout 
      onNavigate={handleNavigation}
      showStats={true}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Community Messages */}
        {communityMessage && (
          <CommunityMessage
            message={communityMessage}
            type="celebration"
            onClose={handleCommunityMessageClose}
            autoClose={true}
            autoCloseDelay={8000}
          />
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <CommunityMessage
            message="🎉 Your pajama party dream has been added to the map! Welcome to the adventure!"
            type="success"
            onClose={handleSuccessMessageClose}
            autoClose={true}
            autoCloseDelay={5000}
          />
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="container mx-auto px-4">
              <h1 className="hero-title">
                🚂 Pajama Party Platform
              </h1>
              <p className="hero-subtitle">
                Share your dream European train adventure! Connect with fellow dreamers, 
                discover magical destinations, and join the movement for the September 2025 
                European Pajama Party event.
              </p>
              
              {/* Event Banner */}
              <EventBanner 
                onJoinClick={() => handleNavigation('stats')}
                className="mb-8"
              />
            
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleNavigation('form')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors transform hover:scale-105"
                >
                  ✨ Add Your Dream
                </button>
                <button
                  onClick={() => handleNavigation('map')}
                  className="px-8 py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors transform hover:scale-105"
                >
                  🗺️ Explore Dreams
                </button>
                <button
                  onClick={() => handleNavigation('stats')}
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg hover:bg-purple-700 transition-colors transform hover:scale-105"
                >
                  📊 Community Stats
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="nav-tabs bg-white rounded-lg shadow-sm p-1 border border-gray-200">
              <div className="flex space-x-1">
                <button
                  onClick={() => handleNavigation('map')}
                  className={`btn px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'map' ? 'active' : ''
                  }`}
                >
                  🗺️ Dream Map
                </button>
                <button
                  onClick={() => handleNavigation('form')}
                  className={`btn px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'form' ? 'active' : ''
                  }`}
                >
                  ✨ Add Dream
                </button>
                <button
                  onClick={() => handleNavigation('stats')}
                  className={`btn px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeSection === 'stats' ? 'active' : ''
                  }`}
                >
                  📊 Community
                </button>
              </div>
            </div>
          </div>

          {/* Section Content */}
          <div className="min-h-[600px]">
            {/* Map Section */}
            {activeSection === 'map' && (
              <div id="map" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    European Dream Map
                  </h2>
                  <p className="text-gray-600">
                    Explore where dreamers want to wake up after their magical train journeys
                  </p>
                </div>
                
                <MapComponent
                  height="600px"
                  onDreamSelect={handleDreamSelect}
                  selectedDream={selectedDream}
                  showControls={true}
                  className="map-container"
                />

                {selectedDream && (
                  <div className="stats-card max-w-md mx-auto p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      🚂 {selectedDream.dreamer_name}'s Dream
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">From:</span>
                        <span className="text-gray-600 ml-2">{selectedDream.origin_station}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Dreams of:</span>
                        <span className="text-gray-600 ml-2">{selectedDream.destination_city}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Added:</span>
                        <span className="text-gray-600 ml-2">
                          {new Date(selectedDream.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Section */}
            {activeSection === 'form' && (
              <div id="form" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Share Your Dream Journey
                  </h2>
                  <p className="text-gray-600">
                    Tell us about your perfect European train adventure
                  </p>
                </div>
                
                <div className="max-w-4xl mx-auto">
                  <DreamForm
                    onSubmitSuccess={handleDreamSubmitSuccess}
                    onSubmitError={handleDreamSubmitError}
                  />
                </div>
              </div>
            )}

            {/* Stats Section */}
            {activeSection === 'stats' && (
              <div id="stats" className="space-y-12">
                <CommunityStats 
                  showTitle={true}
                  layout="horizontal"
                  className="max-w-6xl mx-auto"
                />
                <CommunityFeatures 
                  className="max-w-6xl mx-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Navigation */}
      <FloatingNav 
        onNavigate={handleNavigation}
        items={[
          {
            id: 'form',
            href: '#form',
            icon: '🌙',
            label: 'Dream',
            title: 'Share Your Dream'
          },
          {
            id: 'map',
            href: '#map',
            icon: '🗺️',
            label: 'Map',
            title: 'Dream Map'
          },
          {
            id: 'stats',
            href: '#stats',
            icon: '👥',
            label: 'Community',
            title: 'Community Stats'
          }
        ]}
      />
    </Layout>
  );
}

export default App;