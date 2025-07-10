import { DreamForm } from '@/components/forms';
import { DreamMap } from '@/components/map';
import { StatsPanel } from '@/components/community';

export default function Home() {
  const mockRoutes = [
    {
      id: '1',
      from: { name: 'Berlin Hauptbahnhof', coordinates: [13.3690, 52.5251] as [number, number] },
      to: { name: 'Vienna Central Station', coordinates: [16.3792, 48.1851] as [number, number] },
      dreamerName: 'Anna',
      count: 23
    },
    {
      id: '2', 
      from: { name: 'Paris Gare de Lyon', coordinates: [2.3732, 48.8447] as [number, number] },
      to: { name: 'Madrid Puerta de Atocha', coordinates: [-3.6906, 40.4063] as [number, number] },
      dreamerName: 'Carlos',
      count: 18
    },
    {
      id: '3',
      from: { name: 'Amsterdam Centraal', coordinates: [4.9000, 52.3789] as [number, number] },
      to: { name: 'Roma Termini', coordinates: [12.5010, 41.9009] as [number, number] },
      dreamerName: 'Sofia',
      count: 15
    }
  ];

  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero py-16 px-4" id="hero">
        <div className="hero__container max-w-6xl mx-auto text-center">
          <h1 className="hero__title text-4xl md:text-6xl font-bold text-bot-dark mb-6">
            Where would you like to wake up tomorrow?
          </h1>
          <p className="hero__subtitle text-lg md:text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Join the movement for sustainable night trains across Europe! Share your dream destination, 
            connect with fellow travelers, and organize pajama parties at train stations to make your voice heard.
          </p>
          <p className="hero__entry-point text-lg text-bot-green mb-8 font-medium">
            ✨ New to activism? Perfect! This is your gateway to grassroots action for climate-friendly transport.
          </p>
          <div className="hero__badges flex flex-wrap justify-center gap-4 mb-12">
            <span className="hero__badge bg-bot-green text-white px-4 py-2 rounded-full text-sm font-medium">
              🚂 Night Train Advocacy
            </span>
            <span className="hero__badge bg-bot-blue text-white px-4 py-2 rounded-full text-sm font-medium">
              🌍 European Community
            </span>
            <span className="hero__badge bg-bot-light-green text-white px-4 py-2 rounded-full text-sm font-medium">
              👥 Local Action
            </span>
          </div>

          {/* Dream Form */}
          <div className="max-w-2xl mx-auto">
            <DreamForm />
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-gray-50" id="map">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bot-dark mb-4">Dream Routes Across Europe</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore the most wanted night train connections as envisioned by our community. 
              Each line represents dreams shared by fellow travelers.
            </p>
          </div>
          <DreamMap 
            className="h-96 w-full"
            routes={mockRoutes}
            center={[10.0, 51.0]}
            zoom={4}
          />
        </div>
      </section>

      {/* Community Section */}
      <section className="py-16" id="community">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-bot-dark mb-4">Our Growing Community</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Together we&apos;re building momentum for sustainable transport. See how your dreams 
              contribute to a movement that&apos;s reshaping European travel.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h3 className="text-2xl font-bold text-bot-dark mb-6">Why Night Trains Matter</h3>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Night trains offer a sustainable alternative to short-haul flights, reducing carbon emissions 
                    by up to 90% while connecting European cities in comfort.
                  </p>
                  <p>
                    By sharing your dream routes, you&apos;re helping us identify the most wanted connections 
                    and build the case for expanded night train services across Europe.
                  </p>
                  <p>
                    Join pajama parties at train stations to make your voice heard and show demand 
                    for climate-friendly transport options.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <StatsPanel />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50" id="about">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-bot-dark mb-6">About the Pajama Party Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-bot-dark mb-3">Climate Action</h3>
              <p className="text-gray-600">
                Advocating for sustainable transport solutions that reduce aviation emissions 
                and support the European Green Deal.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">🚂</div>
              <h3 className="text-xl font-semibold text-bot-dark mb-3">Night Trains</h3>
              <p className="text-gray-600">
                Promoting the revival and expansion of night train networks across Europe 
                for comfortable, low-carbon travel.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-bot-dark mb-3">Community</h3>
              <p className="text-gray-600">
                Building a grassroots movement of travelers, activists, and citizens 
                working together for better transport options.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
