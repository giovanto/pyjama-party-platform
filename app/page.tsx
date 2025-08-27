import JourneyOverview from '@/components/journey/JourneyOverview';
import { t } from '@/i18n';
import HomeMapSection from '@/components/home/HomeMapSection';
import Link from 'next/link';

// Map section is encapsulated in a client component

export default function Home() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bot-green/10 via-bot-light-green/5 to-bot-blue/10 relative overflow-hidden">
        <div className="hero__container max-w-7xl mx-auto relative z-10">
          
          {/* Hero Title */}
          <div className="text-center mb-12">
              <h1 suppressHydrationWarning className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                {t('home.hero.subtitle')}
              </p>
              
              {/* Back-on-Track Identity */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 mb-8 border border-bot-green/20 max-w-2xl mx-auto">
                <p className="text-lg font-semibold text-bot-green mb-2">
                  A Back-on-Track Action Group Initiative
                </p>
                <p className="text-gray-700">
                  Building the case for night trains through community voices and data-driven advocacy
                </p>
              </div>
            </div>

            {/* Map Section */}
            <div className="mb-12" id="map">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('home.map.title')}</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">{t('home.map.subtitle')}</p>
              </div>
              <HomeMapSection />
            </div>

            {/* Action CTAs */}
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/dream" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-2">✨</div>
                <div className="font-bold text-lg">Add Your Dream</div>
                <div className="text-gray-600 text-sm">Share your night train route</div>
              </Link>
              <Link href="/pyjama-party" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-2">🎉</div>
                <div className="font-bold text-lg">Join the Pajama Party</div>
                <div className="text-gray-600 text-sm">Participate or organize locally</div>
              </Link>
              <Link href="/dashboard" className="bg-white rounded-xl border p-6 shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-2">📊</div>
                <div className="font-bold text-lg">Impact Dashboard</div>
                <div className="text-gray-600 text-sm">Live data and exports</div>
              </Link>
            </div>
          </div>
        </section>

        {/* Journey Overview */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <JourneyOverview className="" />
          </div>
        </section>

            {/* Community Teaser / Anchor */}
            <section id="community" className="py-12">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('home.communityTeaser.title')}</h3>
                <p className="text-gray-600 mb-4">{t('home.communityTeaser.subtitle')}</p>
                <a href="/community" className="inline-flex items-center bg-bot-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-bot-dark-green transition-colors">Go to Community</a>
              </div>
            </section>

            {/* About Section */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About This Initiative</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">🚂</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Night Train Advocacy</h3>
                <p className="text-gray-600 text-sm">
                  Promoting sustainable transport alternatives to aviation across Europe
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Data-Driven Approach</h3>
                <p className="text-gray-600 text-sm">
                  Collecting community demand to support policy advocacy efforts
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Climate Action</h3>
                <p className="text-gray-600 text-sm">
                  Supporting European climate goals through sustainable transport
                </p>
              </div>
            </div>

            {/* Resources Section */}
            <div className="mt-16 pt-16 border-t border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Involved</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <a 
                  href="/resources"
                  className="bg-gray-50 rounded-lg p-6 text-center hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <div className="text-3xl mb-3">📋</div>
                  <h4 className="font-bold text-gray-900 mb-2">Resources</h4>
                  <p className="text-gray-600 text-sm">Download organizer kits and guidelines</p>
                </a>
                
                <a 
                  href="/dashboard"
                  className="bg-bot-green/5 rounded-lg p-6 text-center hover:bg-bot-green/10 transition-colors border border-bot-green/20"
                >
                  <div className="text-3xl mb-3">📈</div>
                  <h4 className="font-bold text-gray-900 mb-2">Impact Dashboard</h4>
                  <p className="text-gray-600 text-sm">View public transparency data</p>
                </a>
              </div>
            </div>

            {/* Partners Section Placeholder */}
            <div className="mt-16 pt-16 border-t border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Collaboration Partners</h3>
                <div className="bg-gray-50 rounded-lg p-8 border border-gray-200">
                  <p className="text-gray-500 italic">Partner organizations will be displayed here</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
  );
}
