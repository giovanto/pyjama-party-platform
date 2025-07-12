import { DreamForm } from '@/components/forms';
import { DreamMap } from '@/components/map';
import { StatsPanel, CriticalMassPanel } from '@/components/community';
import { FloatingNav } from '@/components/layout';
import { Countdown } from '@/components/ui';

export default function Home() {
  // Note: Map component should fetch real data from /api/dreams

  return (
    <>
      <FloatingNav />
      <main className="main">
      {/* Hero Section */}
      <section className="hero py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bot-green to-bot-blue" id="hero">
        <div className="hero__container max-w-7xl mx-auto text-center">
          <h1 className="hero__title text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-bot-dark mb-6 sm:mb-8 leading-tight">
            Where would you like to wake up tomorrow?
          </h1>
          <p className="hero__subtitle text-lg sm:text-xl md:text-2xl text-gray-800 mb-6 sm:mb-8 max-w-4xl mx-auto px-2 leading-relaxed font-medium">
            Join the Back-on-Track Action Group&apos;s mission to revolutionize European transport! Share your dream night train routes, 
            connect with climate advocates, and organize pyjama parties at stations to demand sustainable travel options.
          </p>
          <p className="hero__entry-point text-lg sm:text-xl text-bot-dark bg-bot-light-green/20 rounded-xl p-4 sm:p-6 mb-8 sm:mb-10 font-semibold max-w-3xl mx-auto border-2 border-bot-green/30">
            ✨ New to climate activism? Perfect! This pyjama party platform is your fun entry point to meaningful environmental action.
          </p>
          <div className="hero__badges flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-4">
            <span className="hero__badge bg-gradient-to-r from-bot-green to-bot-dark-green text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-xl border-2 border-bot-light-green/30 transform hover:scale-105 transition-all duration-200">
              🚂 Back-on-Track Action
            </span>
            <span className="hero__badge bg-gradient-to-r from-bot-blue to-bot-green text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-xl border-2 border-bot-light-green/30 transform hover:scale-105 transition-all duration-200">
              🌍 Climate Advocacy
            </span>
            <span className="hero__badge bg-gradient-to-r from-bot-light-green to-bot-green text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-xl border-2 border-bot-green/30 transform hover:scale-105 transition-all duration-200">
              🎉 Pajama Party Activism
            </span>
          </div>

          {/* September 26 Event Banner */}
          <div className="event-banner bg-gradient-to-r from-bot-green via-bot-light-green to-bot-blue text-white rounded-2xl p-6 sm:p-8 lg:p-10 mb-12 sm:mb-16 mx-2 sm:mx-4 shadow-2xl border-4 border-bot-light-green/40 transform hover:scale-[1.01] transition-all duration-300">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">🎉 Europe-Wide Pajama Party</h2>
              <p className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 text-bot-light-green">September 26, 2025</p>
              <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-95 leading-relaxed max-w-2xl mx-auto">
                Join thousands across Europe for synchronized pyjama parties at train stations. 
                Your dream becomes part of a continental movement for night trains!
              </p>
              <Countdown 
                targetDate={new Date('2025-09-26T00:00:00.000Z')}
                className="flex justify-center"
              />
            </div>
          </div>

          {/* Dream Form */}
          <div className="max-w-3xl mx-auto px-2 sm:px-4">
            <DreamForm />
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-bot-green/70 via-bot-light-green/50 to-bot-blue/60" id="map">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-bot-dark mb-6 leading-tight">Dream Routes Across Europe</h2>
            <p className="text-lg sm:text-xl text-gray-800 max-w-3xl mx-auto px-2 leading-relaxed font-medium">
              Explore the most wanted night train connections envisioned by the Back-on-Track Action Group community. 
              Each line represents collective dreams for sustainable transport and climate action.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20 shadow-xl">
            <DreamMap 
              className="h-80 sm:h-96 lg:h-[500px] xl:h-[600px] w-full rounded-xl"
              center={[10.0, 51.0]}
              zoom={4}
            />
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-bot-blue/60 via-white to-bot-green/70" id="community">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 sm:mb-18 lg:mb-20">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-bot-dark mb-6 leading-tight">Our Growing Action Group</h2>
            <p className="text-lg sm:text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed font-medium">
              Together we&apos;re building momentum for climate-friendly transport through fun, accessible activism. 
              See how your pyjama party contributions strengthen the Back-on-Track movement.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-white to-bot-green/5 rounded-2xl shadow-xl p-8 sm:p-10 lg:p-12 border border-bot-green/20">
                <h3 className="text-2xl sm:text-3xl font-bold text-bot-dark mb-8 leading-tight">Why Back-on-Track Matters</h3>
                <div className="space-y-6 text-gray-800 text-lg leading-relaxed">
                  <p className="font-medium">
                    Night trains offer a sustainable alternative to short-haul flights, reducing carbon emissions 
                    by up to 90% while connecting European cities in comfort — perfect for climate action.
                  </p>
                  <p>
                    By sharing your dream routes, you&apos;re helping the Back-on-Track Action Group identify priority connections 
                    and build compelling evidence for expanded night train services across Europe.
                  </p>
                  <p>
                    Join our signature pyjama parties at train stations — a fun, accessible way to demonstrate public demand 
                    for sustainable transport while building community around climate action.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <StatsPanel />
              <CriticalMassPanel />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-bot-light-green/80 via-bot-green/60 to-bot-blue/70" id="about">
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-bot-dark mb-8 sm:mb-12 lg:mb-16 leading-tight">About the Back-on-Track Action Group</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 text-left">
            <div className="bg-gradient-to-br from-white to-bot-green/5 rounded-2xl p-8 sm:p-10 shadow-xl border border-bot-green/20 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-6">🌱</div>
              <h3 className="text-xl sm:text-2xl font-bold text-bot-dark mb-4 leading-tight">Climate Action</h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                Making climate activism accessible and fun while advocating for sustainable transport solutions 
                that reduce aviation emissions and support the European Green Deal.
              </p>
            </div>
            <div className="bg-gradient-to-br from-white to-bot-blue/5 rounded-2xl p-8 sm:p-10 shadow-xl border border-bot-blue/20 transform hover:scale-105 transition-all duration-300">
              <div className="text-5xl mb-6">🚂</div>
              <h3 className="text-xl sm:text-2xl font-bold text-bot-dark mb-4 leading-tight">Night Train Revival</h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                Promoting the revival and expansion of night train networks across Europe 
                through evidence-based advocacy and community-driven demand demonstration.
              </p>
            </div>
            <div className="bg-gradient-to-br from-white to-bot-light-green/5 rounded-2xl p-8 sm:p-10 shadow-xl border border-bot-light-green/20 transform hover:scale-105 transition-all duration-300 md:col-span-2 lg:col-span-1">
              <div className="text-5xl mb-6">🎉</div>
              <h3 className="text-xl sm:text-2xl font-bold text-bot-dark mb-4 leading-tight">Pajama Party Activism</h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                Building a grassroots movement through fun, inclusive pyjama parties that welcome everyone 
                to climate action — from seasoned activists to curious newcomers.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
