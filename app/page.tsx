import { DreamForm } from '@/components/forms';
import { DreamMap } from '@/components/map';
import { StatsPanel, CriticalMassPanel } from '@/components/community';
import { FloatingNav } from '@/components/layout';
import { Countdown, ScrollingTestimonials } from '@/components/ui';

export default function Home() {
  // Note: Map component should fetch real data from /api/dreams

  return (
    <>
      <FloatingNav />
      <main className="main">
      {/* Hero Section */}
      <section className="hero py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bot-green/20 via-bot-light-green/15 to-bot-blue/20 relative overflow-hidden" id="hero">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-bot-green animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 rounded-full bg-bot-blue animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-bot-light-green animate-pulse delay-500"></div>
          <div className="absolute bottom-32 right-10 w-12 h-12 rounded-full bg-bot-green animate-pulse delay-1500"></div>
        </div>
        
        <div className="hero__container max-w-7xl mx-auto relative z-10">
          {/* Hero Title Section */}
          <div className="text-center mb-12 px-4 sm:px-6 lg:px-8">
            <h1 className="hero__title text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Where would you like to wake up tomorrow?
            </h1>
            
            <p className="hero__subtitle text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Imagine waking up in <span className="text-bot-blue font-semibold">Barcelona</span> after falling asleep in Amsterdam. 
              <span className="text-bot-green font-semibold">Rome</span> after Paris. 
              <span className="text-bot-dark-green font-semibold">Stockholm</span> after Berlin.
            </p>

            <div className="bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-2xl p-6 sm:p-8 mb-8 border border-bot-green/30 max-w-4xl mx-auto">
              <p className="text-lg sm:text-xl text-bot-dark font-semibold mb-4">
                Your dream route could become reality.
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-6">
                Join the Back-on-Track Action Group&apos;s movement to bring back night trains across Europe. 
                Share your dream routes and help us organize the most epic pajama party for climate action the continent has ever seen.
              </p>
              
              {/* Action Tags */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                <span className="inline-flex items-center px-4 py-2 bg-bot-green text-white rounded-full font-medium text-sm shadow-md">
                  🚂 Night Train Revival
                </span>
                <span className="inline-flex items-center px-4 py-2 bg-bot-blue text-white rounded-full font-medium text-sm shadow-md">
                  🌍 Climate Action
                </span>
                <span className="inline-flex items-center px-4 py-2 bg-bot-dark-green text-white rounded-full font-medium text-sm shadow-md">
                  🎉 Community Power
                </span>
              </div>
              
              <p className="text-sm text-gray-600 italic">
                New to climate activism? This platform is your accessible entry point to meaningful environmental action.
              </p>
            </div>

            {/* Clear CTA pointing to form */}
            <div className="mb-8">
              <p className="text-lg text-bot-green font-bold mb-4 animate-pulse">
                👇 Share your dream route now! 👇
              </p>
            </div>
          </div>

          {/* Main Content: Form + Event Details Side by Side */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start px-4 sm:px-6 lg:px-8">
            {/* Left: Dream Form (Priority on mobile/tablet) */}
            <div className="lg:order-1 order-2">
              <DreamForm />
            </div>

            {/* Right: Event Details (Moved from hero) */}
            <div className="lg:order-2 order-1 lg:sticky lg:top-8">
              <div className="bg-gradient-to-r from-bot-green via-bot-dark-green to-bot-blue text-white rounded-3xl p-8 shadow-xl border-2 border-bot-green/30">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3">🎉 Europe-Wide Pajama Party</h2>
                  <p className="text-xl font-semibold text-bot-light-green mb-4">September 26, 2025</p>
                  <div className="mb-6">
                    <Countdown 
                      targetDate={new Date('2025-09-26T00:00:00.000Z')}
                      className="flex justify-center"
                    />
                  </div>
                </div>
                
                <div className="grid gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <span className="text-xl mr-3">🎧</span>
                      Silent Disco at Every Station
                    </h3>
                    <p className="text-white/90 leading-relaxed text-sm">
                      Dance in your pajamas to synchronized music across Europe! Each station will host a silent disco 
                      where participants wear wireless headphones, creating a surreal, joyful spectacle.
                    </p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <h3 className="text-lg font-bold mb-3 flex items-center">
                      <span className="text-xl mr-3">📺</span>
                      Live Stream Connection
                    </h3>
                    <p className="text-white/90 leading-relaxed text-sm">
                      Watch stations across Europe come alive simultaneously! Our live stream will connect all participating 
                      cities, showing the scale of our movement in real-time.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                  <h3 className="text-lg font-bold mb-4">🌍 Event Timeline</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm mb-6">
                    <div>
                      <div className="text-base font-semibold text-bot-light-green">19:00</div>
                      <div className="text-xs">Gathering</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-bot-light-green">19:30</div>
                      <div className="text-xs">Silent disco</div>
                    </div>
                    <div>
                      <div className="text-base font-semibold text-bot-light-green">21:00</div>
                      <div className="text-xs">Live finale</div>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 rounded-xl p-4">
                    <h4 className="font-bold mb-2 flex items-center justify-center text-sm">
                      <span className="mr-2">📺</span>
                      Watch Live from All Stations
                    </h4>
                    <a 
                      href="#" 
                      className="inline-flex items-center bg-white/30 hover:bg-white/40 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      <span className="mr-1">🔗</span>
                      Live Stream (Sept 26th)
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section - Immediately after form */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-bot-green/20 via-bot-light-green/10 to-bot-blue/15" id="map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">Dream Routes Across Europe</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore the most requested night train connections from our community. 
              Each route represents collective advocacy for sustainable transport and climate action.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 shadow-sm">
            <DreamMap 
              className="h-80 sm:h-96 lg:h-[500px] xl:h-[600px] w-full rounded-lg"
              center={[10.0, 51.0]}
              zoom={4}
            />
          </div>
        </div>
      </section>

      {/* Dynamic Testimonials */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-bot-light-green/10 to-bot-green/10" id="testimonials">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollingTestimonials />
        </div>
      </section>

      {/* Ready Stations - Critical Mass */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white" id="ready-stations">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Stations Ready for Action</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These stations have reached critical mass with 2+ participants ready for the September 26th event. 
              Will your station be next?
            </p>
          </div>
          
          <CriticalMassPanel className="mb-12" />
          
          <div className="text-center">
            <a 
              href="/organize" 
              className="inline-flex items-center bg-gradient-to-r from-bot-green to-bot-dark-green text-white px-8 py-4 rounded-xl font-semibold hover:from-bot-dark-green hover:to-bot-green transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              🎪 Organize Your Station&apos;s Party
            </a>
          </div>
        </div>
      </section>

      {/* Motivation Section - Why This Matters */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white" id="motivation">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Why Your Dream Route Matters</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Night trains can reduce carbon emissions by up to 90% compared to flights. Your dream route helps us 
              build the case for a comprehensive European night train network.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Success Story Text */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-bot-green/10 to-bot-blue/10 rounded-xl p-8 sm:p-10 border border-bot-green/20 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">🎉 2024 Success Story</h3>
                <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                  Last October, our Trans-Europe Pyjama Party took place in <strong>11 cities</strong> across Europe. 
                  From Barcelona to Berlin, activists gathered in pyjamas at train stations for silent disco parties 
                  that generated significant media coverage.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  This creative, non-disruptive approach proved that climate activism can be both impactful and fun, 
                  reaching audiences across Spain, Germany, Denmark, France, and Portugal.
                </p>
                <a 
                  href="https://back-on-track.eu/projects-and-activities/trans-europe-pyjama-party-2024/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-bot-green text-white px-6 py-3 rounded-lg hover:bg-bot-dark-green font-semibold transition-colors shadow-md"
                >
                  Read our 2024 impact report →
                </a>
              </div>
            </div>
            
            {/* Statistics Cards */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-bot-green/20 text-center">
                <div className="text-4xl font-bold text-bot-green mb-2">11</div>
                <div className="text-gray-600 text-sm font-medium">Cities participated</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-bot-blue/20 text-center">
                <div className="text-3xl mb-2">🌍</div>
                <div className="text-gray-600 text-sm font-medium">International media coverage</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-bot-light-green/20 text-center">
                <div className="text-3xl mb-2">🎧</div>
                <div className="text-gray-600 text-sm font-medium">Silent disco innovation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Movement Impact Stats */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-bot-blue/10 to-bot-green/15" id="impact">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">Our Growing Movement</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how our community is building momentum for sustainable European transport
            </p>
          </div>
          
          <div className="mb-16">
            <StatsPanel className="max-w-4xl mx-auto" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-bot-light-green/25 via-bot-green/20 to-bot-blue/25" id="about">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-10 leading-tight">About the Back-on-Track Action Group</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-left">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-bot-green/20 hover:shadow-xl transition-all duration-300">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">Climate Action</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Making climate activism accessible and impactful while advocating for sustainable transport solutions 
                that reduce aviation emissions and support the European Green Deal.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg border border-bot-blue/20 hover:shadow-xl transition-all duration-300">
              <div className="text-3xl mb-4">🚂</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">Night Train Revival</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Promoting the revival and expansion of night train networks across Europe 
                through evidence-based advocacy and community-driven demand demonstration.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg border border-bot-light-green/20 hover:shadow-xl transition-all duration-300">
              <div className="text-3xl mb-4">🎉</div>
              <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight">Community Organizing</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Building a grassroots movement through coordinated community actions that welcome everyone 
                to climate activism — from seasoned advocates to curious newcomers.
              </p>
            </div>
          </div>
          
          {/* Join Our Action Group - Integrated */}
          <div className="mt-16 pt-16 border-t border-white/30">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Join Our Action Group</h3>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                Connect with climate advocates across Europe. Get updates, coordinate with your local station, 
                and be part of the movement for sustainable transport.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-bot-green/20 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Back-on-Track Discord</h4>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  Join our community for event coordination, route discussions, and climate action planning.
                </p>
                <a 
                  href="https://discord.gg/wyKQZCwP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gradient-to-r from-bot-blue to-bot-green text-white px-8 py-4 rounded-xl font-semibold hover:from-bot-green hover:to-bot-blue transition-all duration-300 shadow-lg transform hover:scale-105"
                >
                  <span className="mr-2">💬</span>
                  Join Discord Community
                </a>
                <p className="text-xs text-gray-500 mt-3">Free to join • Pyjama party channels coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
