import { PyjamaPartyForm } from '@/components/forms';
import { FloatingNav } from '@/components/layout';

export default function OrganizePage() {
  return (
    <>
      <FloatingNav />
      <main className="main">
        {/* Hero Section */}
        <section className="hero py-12 sm:py-16 lg:py-20 px-4 bg-gradient-to-br from-bot-blue to-bot-green" id="hero">
          <div className="hero__container max-w-4xl mx-auto text-center">
            <h1 className="hero__title text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
              🎪 Organize a Pyjama Party
            </h1>
            <p className="hero__subtitle text-base sm:text-lg md:text-xl text-gray-100 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Lead the climate movement at your train station! Organize a pyjama party for September 26th and 
              connect with thousands of activists across Europe advocating for sustainable night trains.
            </p>
            
            <div className="hero__badges flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-4">
              <span className="hero__badge bg-gradient-to-r from-white/20 to-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-xl backdrop-blur-sm">
                🎉 September 26th, 2025
              </span>
              <span className="hero__badge bg-gradient-to-r from-white/20 to-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-xl backdrop-blur-sm">
                🌍 Europe-wide Event
              </span>
              <span className="hero__badge bg-gradient-to-r from-white/20 to-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-sm sm:text-base font-bold shadow-xl backdrop-blur-sm">
                🚂 Climate Action
              </span>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-br from-white via-bot-green/10 to-bot-blue/10" id="form">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-bot-dark mb-4">
                What You'll Get as an Organizer
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="bg-white rounded-lg p-4 shadow-lg border border-bot-green/20">
                  <div className="text-2xl mb-2">📧</div>
                  <h3 className="font-bold text-bot-dark mb-1">Discord Access</h3>
                  <p className="text-sm text-gray-600">Join the coordination channels with other organizers</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg border border-bot-green/20">
                  <div className="text-2xl mb-2">📋</div>
                  <h3 className="font-bold text-bot-dark mb-1">Party Kit PDF</h3>
                  <p className="text-sm text-gray-600">Complete organizer resources and coordination guide</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg border border-bot-green/20">
                  <div className="text-2xl mb-2">🎵</div>
                  <h3 className="font-bold text-bot-dark mb-1">Silent Disco</h3>
                  <p className="text-sm text-gray-600">Synchronized music across European stations</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-lg border border-bot-green/20">
                  <div className="text-2xl mb-2">📹</div>
                  <h3 className="font-bold text-bot-dark mb-1">Video Connectivity</h3>
                  <p className="text-sm text-gray-600">Eurovision-style connection with other stations</p>
                </div>
              </div>
            </div>
            
            <PyjamaPartyForm />
          </div>
        </section>

        {/* Info Section */}
        <section className="py-16 bg-gradient-to-br from-bot-green/20 via-white to-bot-blue/20" id="info">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-bot-dark mb-6">The Back-on-Track Movement</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-bot-green/20">
                <div className="text-3xl mb-4">🌱</div>
                <h3 className="text-xl font-semibold text-bot-dark mb-3">Climate Impact</h3>
                <p className="text-gray-700">
                  Night trains reduce aviation emissions by up to 90% for medium-distance European travel, 
                  creating a sustainable alternative for climate-conscious travelers.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-bot-blue/20">
                <div className="text-3xl mb-4">🚂</div>
                <h3 className="text-xl font-semibold text-bot-dark mb-3">European Network</h3>
                <p className="text-gray-700">
                  Building momentum for expanded night train services across Europe through coordinated 
                  grassroots action and evidence-based policy advocacy.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-lg border border-bot-green/20">
                <div className="text-3xl mb-4">🎉</div>
                <h3 className="text-xl font-semibold text-bot-dark mb-3">Community Action</h3>
                <p className="text-gray-700">
                  Synchronized pyjama parties create visible public demand for night trains while building 
                  a lasting community of climate activists across Europe.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}