import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Users, MapPin, Music, Heart, TreePine, Train, Zap, Globe, Clock, Headphones, Video } from 'lucide-react';
import { Countdown } from '@/components/ui';
import PyjamaPartySignupForm from '@/components/forms/PyjamaPartySignupForm';
import { EVENT_NAME, EVENT_DATE_DISPLAY, EVENT_TIME_DISPLAY, getCountdownTargetDate } from '@/lib/event';

export const metadata: Metadata = {
  title: `${EVENT_NAME} 2025 | Back-on-Track Movement`,
  description: `Join thousands across Europe on ${EVENT_DATE_DISPLAY} for the biggest climate action pajama party celebrating sustainable night train travel.`,
  openGraph: {
    title: `${EVENT_NAME} 2025`,
    description: 'The biggest climate action event celebrating sustainable night train travel across Europe',
    images: [
      {
        url: '/assets/pajama-party-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'European Pajama Party 2025 - Climate activists in pajamas at train stations',
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${EVENT_NAME} 2025`,
    description: 'Join the movement for sustainable night train travel across Europe',
  }
};

export default function PyjamaPartyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bot-light-green via-green-50 to-bot-green/20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-bot-dark-green via-bot-green to-bot-blue text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/assets/train-pattern.svg')] opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            {/* Date Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
              <Calendar className="h-4 w-4" />
              September 26, 2025 • Europe-wide Event
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-7xl font-bold mb-6 leading-tight">
              The European
              <span className="block bg-gradient-to-r from-bot-green to-bot-light-green bg-clip-text text-transparent">
                Pajama Party
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              Join thousands of climate activists across Europe for the biggest pajama party ever—
              celebrating sustainable night train travel and demanding better rail connections for our future.
            </p>

            {/* Countdown */}
            <div className="mb-12">
              <Countdown targetDate={getCountdownTargetDate()} className="justify-center" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="#signup-form"
                className="px-8 py-4 bg-gradient-to-r from-bot-green to-bot-dark-green text-white rounded-xl hover:from-bot-dark-green hover:to-bot-green transition-all transform hover:scale-105 font-semibold text-lg shadow-xl"
              >
                <Users className="h-6 w-6 inline mr-2" />
                Join the Party
              </Link>
              <Link
                href="/#map"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold text-lg border border-white/30"
              >
                <MapPin className="h-6 w-6 inline mr-2" />
                Find Your Station
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* What is the Pajama Party */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">What is the Pajama Party?</h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              A synchronized climate action event where thousands of people across Europe gather at train stations 
              in their pajamas to celebrate night train travel and demand better sustainable transport.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-bot-green/20 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-bot-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{EVENT_DATE_DISPLAY} • {EVENT_TIME_DISPLAY}</h3>
                  <p className="text-gray-600">
                    Synchronized across all European time zones, creating a wave of climate action from east to west.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-bot-light-green/30 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-bot-green" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">At Train Stations Across Europe</h3>
                  <p className="text-gray-600">
                    From Lisbon to Helsinki, Stockholm to Athens—hundreds of train stations will host these peaceful celebrations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Everyone in Pajamas</h3>
                  <p className="text-gray-600">
                    Pajamas symbolize night train travel—sleeping comfortably while journeying sustainably across Europe.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Peaceful Climate Action</h3>
                  <p className="text-gray-600">
                    A joyful, family-friendly demonstration demanding better night train connections for climate-friendly travel.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-bot-green to-bot-dark-green rounded-3xl p-8 text-white text-center">
                <div className="mb-6">
                  <Train className="h-16 w-16 mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">🌙 Sleep → 🚆 Travel → 🌅 Arrive</h3>
                  <p className="opacity-90">
                    The magic of night train travel: fall asleep in one city, wake up in another
                  </p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="text-3xl font-bold mb-2">90% Less CO₂</div>
                  <p className="text-sm opacity-90">compared to flying</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Back-on-Track Movement */}
      <section className="py-24 bg-gradient-to-br from-bot-light-green/20 to-bot-green/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              The Back-on-Track Movement
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              We're building a European movement to bring back night trains and make sustainable travel 
              accessible, affordable, and delightful for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TreePine className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Climate Action</h3>
              <p className="text-gray-600">
                Transportation accounts for 25% of EU emissions. Night trains offer a realistic, 
                comfortable alternative to short-haul flights.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-bot-green/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Globe className="h-8 w-8 text-bot-green" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">European Unity</h3>
              <p className="text-gray-600">
                Night trains connect people across borders, fostering cultural exchange and 
                European solidarity through sustainable travel.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Accessible Travel</h3>
              <p className="text-gray-600">
                Making night trains affordable and accessible democratizes sustainable travel, 
                giving everyone the option to explore Europe responsibly.
              </p>
            </div>
          </div>

          {/* Movement Stats */}
          <div className="bg-white rounded-3xl p-8 lg:p-12 shadow-xl">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Movement Impact</h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">150+</div>
                <div className="text-gray-600">Partner Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-bot-green mb-2">500k+</div>
                <div className="text-gray-600">Community Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">25</div>
                <div className="text-gray-600">Countries Participating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">2M+</div>
                <div className="text-gray-600">Social Media Reach</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Features */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">
              What to Expect
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              The European Pajama Party combines peaceful protest with joyful celebration, 
              creating an unforgettable experience for climate action.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Live Features */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Live at Your Station</h3>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-bot-light-green/30 rounded-lg flex items-center justify-center">
                  <Music className="h-5 w-5 text-bot-green" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Silent Disco</h4>
                  <p className="text-gray-600">
                    Dance in your pajamas with wireless headphones, creating a surreal and joyful atmosphere.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Community Gathering</h4>
                  <p className="text-gray-600">
                    Meet fellow climate activists, share stories, and build connections for future actions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Family Friendly</h4>
                  <p className="text-gray-600">
                    Bring your children! Pajama parties are perfect for families wanting to take climate action together.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-bot-green/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-bot-green" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Local Organizers</h4>
                  <p className="text-gray-600">
                    Each station has dedicated organizers ensuring a safe, fun, and impactful event.
                  </p>
                </div>
              </div>
            </div>

            {/* Digital Features */}
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Connected Digitally</h3>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Video className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Live Stream</h4>
                  <p className="text-gray-600">
                    Watch stations across Europe simultaneously, creating a sense of continental unity.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Headphones className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Synchronized Music</h4>
                  <p className="text-gray-600">
                    Europe-wide playlist ensures everyone dances to the same beat, from Lisbon to Helsinki.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Social Media Wave</h4>
                  <p className="text-gray-600">
                    Share photos and videos as the event rolls across time zones, amplifying our message.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-bot-blue/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-bot-blue" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Real-time Updates</h4>
                  <p className="text-gray-600">
                    Get live updates on participation numbers, media coverage, and political responses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-r from-bot-dark-green via-bot-green to-bot-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Join the Movement?</h2>
          <p className="text-xl text-white/90 mb-8">
            Every person in pajamas makes our message stronger. Together, we can bring back night trains 
            and create a more sustainable, connected Europe.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="#signup-form"
              className="px-8 py-4 bg-gradient-to-r from-bot-green to-bot-dark-green text-white rounded-xl hover:from-bot-dark-green hover:to-bot-green transition-all transform hover:scale-105 font-semibold text-lg shadow-xl"
            >
              <Users className="h-6 w-6 inline mr-2" />
              Sign Up for Your Station
            </Link>
            <Link
              href="/community"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold text-lg border border-white/30"
            >
              <Heart className="h-6 w-6 inline mr-2" />
              Join the Community
            </Link>
          </div>

          <p className="text-white/70 text-sm">
            The European Pajama Party is organized by the Back-on-Track movement in partnership with 
            climate organizations across Europe. This is a peaceful, family-friendly event.
          </p>
        </div>
      </section>

      {/* Signup Form Section */}
      <section id="signup-form" className="py-24 bg-gradient-to-br from-bot-light-green/20 via-green-50 to-bot-green/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Join Your Local Station</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sign up to participate in the {EVENT_DATE_DISPLAY} {EVENT_NAME} at a train station near you.
            </p>
          </div>

          <PyjamaPartySignupForm />
        </div>
      </section>
    </div>
  );
}
