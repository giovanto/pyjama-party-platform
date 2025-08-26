import { Metadata } from 'next';
import { EVENT_DATE_DISPLAY, EVENT_TIME_DISPLAY } from '@/lib/event';

export const metadata: Metadata = {
  title: 'About Back-on-Track | European Night Train Advocacy',
  description: 'Learn about Back-on-Track Action Group, our mission to revive European night trains, and the 6-phase journey toward sustainable transport.',
  keywords: 'Back-on-Track, night trains, European transport, sustainable travel, advocacy',
};

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">About Back-on-Track</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          We&apos;re building the movement to revive European night trains and create a sustainable, 
          connected continent where you can travel from city to city while you sleep.
        </p>
      </div>

      {/* Mission Statement */}
      <div className="bg-gradient-to-br from-bot-green/10 via-bot-light-green/5 to-bot-blue/10 rounded-2xl p-8 mb-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-lg text-gray-700 mb-4">
              Back-on-Track Action Group is a European non-profit advocacy organization dedicated to 
              reviving and expanding the network of night trains across Europe.
            </p>
            <p className="text-gray-600 mb-6">
              We believe that night trains are not just a romantic notion from the past, but a vital 
              part of Europe&apos;s sustainable transport future. By connecting cities while passengers 
              sleep, night trains offer a climate-friendly alternative to short-haul flights.
            </p>
            <div className="bg-white/60 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Legal Status:</strong> AISBL (International Non-Profit Association under Belgian Law)<br />
                <strong>Founded:</strong> 2019<br />
                <strong>Network:</strong> Active across many European countries
              </p>
            </div>
          </div>
          <div className="bg-white/50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-bot-green mb-4">🚆 Our Goals</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start space-x-3">
                <span className="text-bot-green font-bold">✓</span>
                <span>Demonstrate public demand for night train routes to EU policymakers</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-bot-green font-bold">✓</span>
                <span>Coordinate grassroots advocacy events across Europe</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-bot-green font-bold">✓</span>
                <span>Support policy changes that make night trains viable</span>
              </li>
              <li className="flex items-start space-x-3">
                <span className="text-bot-green font-bold">✓</span>
                <span>Connect communities advocating for sustainable transport</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* The 6-Phase Journey */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">The 6-Phase Journey</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our strategic approach to building the night train movement, from individual dreams 
            to European-wide policy change.
          </p>
        </div>

        <div className="space-y-8">
          {/* Phase 1: Dream */}
          <div className="flex items-start space-x-6 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-bot-green/20 p-4 rounded-xl">
              <span className="text-3xl">🌙</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Phase 1: Dream</h3>
              <p className="text-gray-600 mb-4">
                <strong>Share your night train dreams.</strong> Every journey starts with a destination in mind. 
                Tell us where you&apos;d like to wake up tomorrow, and help us map the routes Europeans really want.
              </p>
              <div className="bg-bot-green/10 rounded-lg p-4">
                <p className="text-sm text-bot-dark-green">
                  <strong>Current Status:</strong> A growing collection of dream routes | 
                  <strong>Top Route:</strong> Frequently requested connections across Europe | 
                  <strong>Impact:</strong> Data shared with EU transport stakeholders
                </p>
              </div>
            </div>
          </div>

          {/* Phase 2: Participate */}
          <div className="flex items-start space-x-6 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-green-100 p-4 rounded-xl">
              <span className="text-3xl">🎉</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Phase 2: Participate</h3>
              <p className="text-gray-600 mb-4">
                <strong>Join the European Pajama Party on {EVENT_DATE_DISPLAY}.</strong> Put on your pajamas and gather 
                at train stations across Europe. Show policymakers that citizens are ready for night trains.
              </p>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Date:</strong> {EVENT_DATE_DISPLAY} ({EVENT_TIME_DISPLAY}) | 
                  <strong>Stations:</strong> Many locations across Europe | 
                  <strong>Partnership:</strong> Stay Grounded climate coalition
                </p>
              </div>
            </div>
          </div>

          {/* Phase 3: Connect */}
          <div className="flex items-start space-x-6 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-100 p-4 rounded-xl">
              <span className="text-3xl">🔗</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Phase 3: Connect</h3>
              <p className="text-gray-600 mb-4">
                <strong>Build connections across the movement.</strong> Find fellow advocates in your city, 
                coordinate with other stations, and strengthen the network fighting for sustainable transport.
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Network:</strong> An active community of advocates | 
                  <strong>Cities:</strong> Coordinators in multiple cities | 
                  <strong>Growth:</strong> Consistent interest month over month
                </p>
              </div>
            </div>
          </div>

          {/* Phase 4: Organize */}
          <div className="flex items-start space-x-6 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-orange-100 p-4 rounded-xl">
              <span className="text-3xl">📋</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Phase 4: Organize</h3>
              <p className="text-gray-600 mb-4">
                <strong>Become a station organizer.</strong> Take leadership in your city, coordinate local 
                events, and help turn individual dreams into collective action for policy change.
              </p>
              <div className="bg-orange-50 rounded-lg p-4">
                <p className="text-sm text-orange-800">
                  <strong>Organizers:</strong> 150+ station leaders | 
                  <strong>Training:</strong> Monthly workshops | 
                  <strong>Resources:</strong> Complete organizer toolkit available
                </p>
              </div>
            </div>
          </div>

          {/* Phase 5: Community */}
          <div className="flex items-start space-x-6 bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-bot-blue/20 p-4 rounded-xl">
              <span className="text-3xl">👥</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Phase 5: Community</h3>
              <p className="text-gray-600 mb-4">
                <strong>Build a lasting movement.</strong> Connect with transport advocates, climate activists, 
                and policy experts to create a unified voice for sustainable European transport.
              </p>
              <div className="bg-bot-blue/10 rounded-lg p-4">
                <p className="text-sm text-bot-blue">
                  <strong>Partners:</strong> 25+ climate organizations | 
                  <strong>Reach:</strong> 50,000+ newsletter subscribers | 
                  <strong>Impact:</strong> Featured in 100+ media articles
                </p>
              </div>
            </div>
          </div>

          {/* Phase 6: Pajama Party */}
          <div className="flex items-start space-x-6 bg-gradient-to-r from-bot-green to-bot-dark-green text-white rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-white/20 p-4 rounded-xl">
              <span className="text-3xl">🌙</span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3">Phase 6: European Pajama Party</h3>
              <p className="text-white/90 mb-4">
                <strong>Make it happen!</strong> The culmination of our journey - a coordinated European event 
                that demonstrates massive public support for night trains and pushes policy forward.
              </p>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/80">
                  <strong>Date:</strong> {EVENT_DATE_DISPLAY} | 
                  <strong>Goal:</strong> 10,000 participants across Europe | 
                  <strong>Impact:</strong> Direct influence on EU transport policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team & Organization */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How We&apos;re Organized</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Back-on-Track operates as a distributed network of volunteers and working groups 
            across Europe, united by our passion for sustainable transport.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="text-center mb-4">
              <div className="bg-bot-green/10 p-4 rounded-full inline-block mb-3">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Action Group</h3>
            </div>
            <p className="text-gray-600 text-center">
              Grassroots advocacy and event coordination. Currently co-led by Giovanni and Ellie, 
              organizing the European Pajama Party on {EVENT_DATE_DISPLAY}.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="text-center mb-4">
              <div className="bg-bot-blue/10 p-4 rounded-full inline-block mb-3">
                <span className="text-3xl">🏛️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Lobby Group</h3>
            </div>
            <p className="text-gray-600 text-center">
              EU policy engagement and institutional relationships. Works directly with MEPs, 
              transport ministers, and the European Commission.
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="text-center mb-4">
              <div className="bg-bot-green/20 p-4 rounded-full inline-block mb-3">
                <span className="text-3xl">📢</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Communications</h3>
            </div>
            <p className="text-gray-600 text-center">
              Media relations, content creation, and public outreach. Manages our multilingual 
              communications across European audiences.
            </p>
          </div>
        </div>
      </div>

      {/* Key Achievements (soft copy) */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Achievements</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Since our founding, we&apos;ve made steady progress toward reviving European night trains.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-gray-600">Thousands of dream routes submitted from across Europe</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Dozens of cities preparing for {EVENT_DATE_DISPLAY}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Active chapters across the European Union</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600">Regular media features and growing public awareness</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-bot-green to-bot-dark-green rounded-2xl p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Join the Movement?</h2>
        <p className="text-xl mb-8 text-white/90">
          Whether you want to share a dream route, organize in your city, or participate in the 
          the {EVENT_DATE_DISPLAY} event, there&apos;s a place for you in the Back-on-Track community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            href="/dream"
            className="bg-white text-bot-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            🌙 Share Your Dream Route
          </a>
          <a 
            href="/pyjama-party"
            className="bg-bot-light-green text-white px-8 py-3 rounded-lg font-semibold hover:bg-bot-green transition-colors duration-200"
          >
            🎉 Join {EVENT_DATE_DISPLAY} Event
          </a>
          <a 
            href="/community"
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-bot-green transition-all duration-200"
          >
            👥 Connect with Community
          </a>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-16 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h3>
        <div className="space-y-2 text-gray-600">
          <p>
            <strong>General Contact:</strong> <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a>
          </p>
          <p>
            <strong>Press Inquiries:</strong> <a href="mailto:giovanni.backontrac@gmail.com" className="text-bot-green hover:underline">giovanni.backontrac@gmail.com</a>
          </p>
          <p>
            <strong>Website:</strong> <a href="https://back-on-track.eu" className="text-bot-green hover:underline" target="_blank" rel="noopener noreferrer">back-on-track.eu</a>
          </p>
        </div>
      </div>
    </div>
  );
}
