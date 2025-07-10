export default function Home() {
  return (
    <main className="main">
      {/* Hero Section */}
      <section className="hero py-16 px-4" id="hero">
        <div className="hero__container max-w-4xl mx-auto text-center">
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
        </div>
      </section>

      {/* Placeholder for other sections */}
      <section className="py-16 bg-gray-50" id="map">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-bot-dark mb-4">Map Section</h2>
          <p className="text-gray-600">Map component will be added in Phase 4</p>
        </div>
      </section>

      <section className="py-16" id="community">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-bot-dark mb-4">Community Section</h2>
          <p className="text-gray-600">Community features will be added in Phase 5</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50" id="about">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-bot-dark mb-4">About Section</h2>
          <p className="text-gray-600">About content will be added</p>
        </div>
      </section>
    </main>
  );
}
