import type { Metadata } from 'next';
import { DreamCounter, PopularRoutes, GrowthChart, StationReadiness, DataExport } from '@/components/dashboard';
import { FloatingNav } from '@/components/layout';

// SEO Metadata for advocacy sharing
export const metadata: Metadata = {
  title: 'Impact Dashboard | Pajama Party Platform - Night Train Movement Data',
  description: 'Real-time data showing the growing European movement for night trains. See how many people are dreaming of sustainable transport and which routes are most requested.',
  keywords: [
    'night trains',
    'climate action',
    'sustainable transport', 
    'European rail',
    'advocacy data',
    'transportation policy',
    'environmental activism',
    'public transport',
    'carbon emissions',
    'European Green Deal'
  ],
  authors: [{ name: 'Back-on-Track Action Group' }],
  creator: 'Back-on-Track Action Group',
  publisher: 'Pajama Party Platform',
  
  // Open Graph for social media sharing
  openGraph: {
    title: 'European Night Train Movement - Live Impact Data',
    description: 'See the real-time growth of Europe\'s night train movement. Thousands of citizens are demanding sustainable transport alternatives. Join the advocacy!',
    url: 'https://pajama-party-platform.vercel.app/impact',
    siteName: 'Pajama Party Platform',
    type: 'website',
    locale: 'en_EU',
    images: [
      {
        url: '/assets/og-impact-dashboard.jpg', // We'd create this image
        width: 1200,
        height: 630,
        alt: 'Night Train Movement Impact Dashboard showing growing advocacy data across Europe',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@BackOnTrackEU', // If they have Twitter
    title: 'European Night Train Movement - Live Data',
    description: 'Real-time advocacy data showing the growing demand for sustainable night trains across Europe.',
    images: ['/assets/twitter-impact-dashboard.jpg'], // We'd create this image
  },
  
  // Additional metadata for advocacy
  other: {
    'theme-color': '#10B981', // bot-green color
    'advocacy-data': 'public',
    'data-source': 'European citizens demanding night trains',
    'update-frequency': 'real-time',
  },
  
  // Robots and indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function ImpactDashboard() {
  return (
    <>
      <FloatingNav />
      <main className="min-h-screen bg-gradient-to-br from-bot-green/5 via-white to-bot-blue/5">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                European Night Train Movement
              </h1>
              <div className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Real-time data showing the growing demand for sustainable transport across Europe
              </div>
              
              {/* Key Message for Advocacy */}
              <div className="bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-2xl p-8 mb-8 border border-bot-green/20 max-w-5xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl mr-3">🚂</span>
                  <h2 className="text-2xl font-bold text-bot-dark-green">
                    Data-Driven Advocacy for Policy Change
                  </h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  This dashboard provides public, real-time data demonstrating citizen demand for night train 
                  connections across Europe. Every data point represents a person choosing sustainable transport 
                  over flying, reducing CO₂ emissions by up to 90%.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/60 rounded-xl p-4 border border-bot-green/20">
                    <div className="text-2xl font-bold text-bot-green mb-1">🌍</div>
                    <div className="text-sm font-medium text-gray-800">Policy Impact</div>
                    <div className="text-xs text-gray-600">Data shared with transport ministers</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-bot-blue/20">
                    <div className="text-2xl font-bold text-bot-blue mb-1">📊</div>
                    <div className="text-sm font-medium text-gray-800">Transparent Data</div>
                    <div className="text-xs text-gray-600">Public, exportable, privacy-first</div>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4 border border-bot-dark-green/20">
                    <div className="text-2xl font-bold text-bot-dark-green mb-1">⚡</div>
                    <div className="text-sm font-medium text-gray-800">Real-Time</div>
                    <div className="text-xs text-gray-600">Updates every 5-10 minutes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Main Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <DreamCounter className="lg:col-span-1" refreshInterval={30000} />
              <StationReadiness className="lg:col-span-1" maxStations={8} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
              <GrowthChart className="xl:col-span-1" height={400} />
              <PopularRoutes className="xl:col-span-1" maxRoutes={10} showDestinations={true} />
            </div>

            {/* Export and Info Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <DataExport className="lg:col-span-1" />
              
              {/* Advocacy Information */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📢</span>
                  How This Data Drives Policy Change
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-bot-green text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Demonstrating Citizen Demand</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Each dream route submission shows policymakers that citizens actively want sustainable transport 
                        options. This counters industry claims of "insufficient demand" for night train services.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-bot-blue text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Identifying Priority Routes</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Popular route data helps transport authorities understand which connections should be 
                        prioritized for development, ensuring limited infrastructure budgets create maximum impact.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-bot-dark-green text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Building Local Movements</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Station readiness data shows where citizens are organized and ready to advocate locally, 
                        helping coordinate grassroots pressure on national and regional governments.
                      </p>
                    </div>
                  </div>

                  <div className="bg-bot-green/5 rounded-lg p-4 border border-bot-green/20 mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">🎯</span>
                      <span className="font-medium text-bot-dark-green">Policy Target</span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      This data directly supports the European Green Deal's target of making rail the dominant 
                      mode of transport for medium-distance travel by 2030, helping achieve the EU's climate goals.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-bot-green via-bot-dark-green to-bot-blue text-white rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-4">Add Your Voice to the Movement</h3>
                <p className="text-lg mb-6 opacity-90">
                  Every dream route makes our case stronger. Share your sustainable travel vision and 
                  help us demonstrate the massive public support for night trains across Europe.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="/"
                    className="inline-flex items-center bg-white text-bot-dark-green px-8 py-4 rounded-xl font-semibold hover:bg-bot-light-green hover:text-white transition-all duration-300 shadow-lg transform hover:scale-105"
                  >
                    <span className="mr-2">💭</span>
                    Share Your Dream Route
                  </a>
                  <a 
                    href="/participate"
                    className="inline-flex items-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-bot-dark-green transition-all duration-300"
                  >
                    <span className="mr-2">🎪</span>
                    Join September 26th Event
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}