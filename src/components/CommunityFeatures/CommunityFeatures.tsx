/**
 * CommunityFeatures Component
 * Displays detailed community organizing features and action group information
 */

import React from 'react';

export interface CommunityFeaturesProps {
  className?: string;
}

export function CommunityFeatures({ className = '' }: CommunityFeaturesProps) {
  const handleJoinActionGroup = () => {
    window.open('mailto:action-wg@back-on-track.eu', '_blank');
  };

  const handleJoinDiscord = () => {
    // Discord invite link - would be configured via environment
    window.open('https://discord.gg/backontrack', '_blank');
  };

  const handleLearnMore = () => {
    window.open('https://back-on-track.eu/about/', '_blank');
  };

  return (
    <div className={`community-features-section ${className}`}>
      {/* Main Title */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Organize Pajama Parties for Night Trains
        </h2>
        <p className="text-xl text-gray-600 max-w-4xl mx-auto">
          This platform connects you with fellow activists to organize pajama parties at train stations. 
          Together, we show Europe we want better night train connections!
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="community-feature">
          <div className="community-feature__icon text-4xl mb-4">🏠</div>
          <h3 className="community-feature__title text-xl font-bold mb-4">
            Pajama Party Organizing
          </h3>
          <p className="community-feature__text text-gray-600">
            When 2+ people from your station want the same destination, we'll help you organize 
            a cozy pajama party to demand that night train route
          </p>
        </div>
        
        <div className="community-feature">
          <div className="community-feature__icon text-4xl mb-4">🌍</div>
          <h3 className="community-feature__title text-xl font-bold mb-4">
            European-Wide Action
          </h3>
          <p className="community-feature__text text-gray-600">
            Join simultaneous pajama parties across Europe on September 26, 2025 - 
            imagine the impact when hundreds of stations unite!
          </p>
        </div>
        
        <div className="community-feature">
          <div className="community-feature__icon text-4xl mb-4">🎯</div>
          <h3 className="community-feature__title text-xl font-bold mb-4">
            Grassroots Activism
          </h3>
          <p className="community-feature__text text-gray-600">
            Your participation creates real data that Back-on-Track uses to lobby for policy changes. 
            Every pajama party counts!
          </p>
        </div>
      </div>

      {/* Action Group Section */}
      <div className="action-group-section bg-gray-50 p-8 rounded-xl mb-12">
        <h3 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
          🎯 Join the Back-on-Track Action Group
        </h3>
        <p className="text-gray-700 mb-6">
          The Action Group is one of three working groups within Back-on-Track, focused on{' '}
          <strong>grassroots activism</strong> and creative public engagement. While our Lobby Group 
          works on policy and our Communications Group spreads awareness, we organize fun, 
          impactful activities like pajama parties that bring the night train movement to the streets.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="action-group-feature">
            <h4 className="text-lg font-bold text-primary mb-2">🎪 Creative Activism</h4>
            <p className="text-sm text-gray-600">
              Organize pajama parties, flash mobs, and other fun events that attract media 
              attention and public support for night trains.
            </p>
          </div>
          <div className="action-group-feature">
            <h4 className="text-lg font-bold text-primary mb-2">🗺️ Local Coordination</h4>
            <p className="text-sm text-gray-600">
              Help coordinate activities in your city or region. No policy expertise needed - 
              just enthusiasm and organization skills!
            </p>
          </div>
          <div className="action-group-feature">
            <h4 className="text-lg font-bold text-primary mb-2">🚀 Growing Impact</h4>
            <p className="text-sm text-gray-600">
              Be part of a growing movement. The Action Group is expanding across Europe - 
              help us reach more cities and more people!
            </p>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={handleJoinActionGroup}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold mr-4 hover:bg-accent transition-colors"
          >
            Join Action Group
          </button>
          <button
            onClick={handleLearnMore}
            className="text-accent hover:text-primary transition-colors"
          >
            Learn more about Back-on-Track →
          </button>
        </div>
      </div>

      {/* Back-on-Track Mission */}
      <div className="bot-mission-section bg-blue-50 p-8 rounded-xl border-l-4 border-primary mb-12">
        <h3 className="text-2xl font-bold text-primary mb-4">
          🚂 Back-on-Track: Rebuilding Europe's Night Train Network
        </h3>
        <p className="text-gray-700 mb-6">
          Back-on-Track is a European non-profit organization with{' '}
          <strong>476 members across 9 countries</strong>, working to restore sustainable 
          night train connections across Europe. We operate through three coordinated groups:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bot-group">
            <h4 className="text-lg font-bold text-accent mb-2">🏛️ Lobby Group</h4>
            <p className="text-sm text-gray-600">Policy advocacy and government relations</p>
          </div>
          <div className="bot-group">
            <h4 className="text-lg font-bold text-accent mb-2">📢 Communications Group</h4>
            <p className="text-sm text-gray-600">Media outreach and public awareness</p>
          </div>
          <div className="bot-group">
            <h4 className="text-lg font-bold text-primary mb-2">🎪 Action Group</h4>
            <p className="text-sm text-gray-600">Grassroots activism and creative engagement</p>
          </div>
        </div>
        
        <div className="text-center">
          <button
            onClick={() => window.open('https://back-on-track.eu', '_blank')}
            className="bg-primary text-white px-6 py-3 rounded-lg font-bold mr-4 hover:bg-accent transition-colors"
          >
            Explore Back-on-Track →
          </button>
          <button
            onClick={() => window.open('https://back-on-track.eu/mailing-lists/', '_blank')}
            className="text-accent hover:text-primary transition-colors"
          >
            Join our Newsletter
          </button>
        </div>
      </div>

      {/* Community CTA */}
      <div className="community-cta bg-gradient-to-r from-primary to-accent text-white p-8 rounded-xl text-center mb-12">
        <button
          onClick={handleJoinDiscord}
          className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transform hover:-translate-y-1 transition-all mb-4"
        >
          Join our Discord Community
        </button>
        <p className="text-white/90">
          Connect with fellow Europeans, get pajama party organizing kits, and coordinate local activism. 
          All backgrounds welcome!
        </p>
      </div>

      {/* Welcome Message */}
      <div className="community-welcome bg-white p-8 rounded-xl border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          🤗 Everyone is Welcome
        </h3>
        <p className="text-gray-700">
          Whether you're a seasoned activist or someone who just loves trains, whether you're 16 or 60, 
          from any background or corner of Europe - this movement needs YOU. No experience required, 
          just passion for sustainable travel and community.
        </p>
      </div>
    </div>
  );
}

export default CommunityFeatures;