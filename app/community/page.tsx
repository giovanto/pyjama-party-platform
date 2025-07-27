import { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Users, MapPin, Calendar, ExternalLink, Award, TrendingUp, Heart, Share2, BookOpen, Headphones } from 'lucide-react';
import { StatsPanel, CriticalMassPanel } from '@/components/community';
import { DreamMap } from '@/components/map';

export const metadata: Metadata = {
  title: 'Community Hub | European Night Train Platform',
  description: 'Connect with thousands of climate activists organizing the European Pajama Party and advocating for sustainable night train travel.',
  openGraph: {
    title: 'European Night Train Community',
    description: 'Join the movement for sustainable train travel across Europe',
    type: 'website',
  }
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/community-pattern.svg')] opacity-10"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8">
              <Users className="h-4 w-4" />
              Active Community Members: 47,623
            </div>

            <h1 className="text-3xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to the
              <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Community Hub
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
              Connect with climate activists across Europe, track station readiness, 
              and coordinate the biggest pajama party in history.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="https://discord.gg/backontrack"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] transition-all transform hover:scale-105 font-semibold text-lg shadow-xl"
              >
                <MessageCircle className="h-6 w-6 inline mr-2" />
                Join Discord Server
              </Link>
              <Link
                href="/participate"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all font-semibold text-lg border border-white/30"
              >
                <Calendar className="h-6 w-6 inline mr-2" />
                Sign Up for September 26th
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="https://discord.gg/backontrack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] transition-colors"
                >
                  <MessageCircle className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Join Discord</div>
                    <div className="text-sm opacity-90">Real-time coordination</div>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Link>

                <Link
                  href="/organize"
                  className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Users className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Become Organizer</div>
                    <div className="text-sm opacity-90">Lead your station</div>
                  </div>
                </Link>

                <Link
                  href="https://toolkit.backontrack.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                >
                  <BookOpen className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Organizer Toolkit</div>
                    <div className="text-sm opacity-90">Resources & guides</div>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </Link>

                <Link
                  href="/pyjama-party"
                  className="flex items-center gap-3 p-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors"
                >
                  <Share2 className="h-6 w-6" />
                  <div>
                    <div className="font-semibold">Share Movement</div>
                    <div className="text-sm opacity-90">Spread the word</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Station Readiness Map */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Station Readiness Map</h2>
                <p className="text-gray-600">
                  Track which stations are ready for the September 26th pajama party
                </p>
              </div>
              <div className="h-96">
                <DreamMap
                  className="w-full h-full"
                  showLayerManager={true}
                  optimizePerformance={true}
                />
              </div>
            </div>

            {/* Recent Updates */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Recent Updates</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Berlin Hauptbahnhof Reaches Critical Mass!</div>
                    <div className="text-gray-600 text-sm mb-2">
                      Berlin just hit 250+ confirmed attendees, making it the first station ready for September 26th.
                    </div>
                    <div className="text-blue-600 text-xs">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">New Organizer: Amsterdam Central</div>
                    <div className="text-gray-600 text-sm mb-2">
                      Sara van der Berg just signed up to organize the Amsterdam pajama party. Welcome Sara! 🎉
                    </div>
                    <div className="text-green-600 text-xs">5 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Headphones className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Silent Disco Playlist Released</div>
                    <div className="text-gray-600 text-sm mb-2">
                      The official Europe-wide pajama party playlist is now available for organizers to preview.
                    </div>
                    <div className="text-purple-600 text-xs">1 day ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Featured in European Parliament</div>
                    <div className="text-gray-600 text-sm mb-2">
                      MEP Anna Cavazzini mentioned our movement in her speech about sustainable transport policy.
                    </div>
                    <div className="text-orange-600 text-xs">3 days ago</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="https://discord.gg/backontrack"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  See More Updates in Discord
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Community Achievements */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Community Achievements</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                  <div className="text-4xl font-bold text-blue-600 mb-2">156</div>
                  <div className="text-gray-700 font-medium">Stations with Organizers</div>
                  <div className="text-sm text-gray-500">Across 25 European countries</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl">
                  <div className="text-4xl font-bold text-green-600 mb-2">47.6k</div>
                  <div className="text-gray-700 font-medium">Community Members</div>
                  <div className="text-sm text-gray-500">And growing every day</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                  <div className="text-4xl font-bold text-purple-600 mb-2">2.3M</div>
                  <div className="text-gray-700 font-medium">Social Media Reach</div>
                  <div className="text-sm text-gray-500">Spreading climate awareness</div>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl">
                  <div className="text-4xl font-bold text-orange-600 mb-2">12</div>
                  <div className="text-gray-700 font-medium">Media Mentions</div>
                  <div className="text-sm text-gray-500">In major European outlets</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Stats Panel */}
            <StatsPanel />

            {/* Critical Mass Panel */}
            <CriticalMassPanel />

            {/* Discord Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Discord Activity</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">#general</div>
                    <div className="text-gray-600 text-xs">847 messages today</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">#organizers</div>
                    <div className="text-gray-600 text-xs">234 messages today</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">#media-sharing</div>
                    <div className="text-gray-600 text-xs">156 messages today</div>
                  </div>
                </div>
              </div>

              <Link
                href="https://discord.gg/backontrack"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full px-4 py-3 bg-[#5865F2] text-white rounded-lg hover:bg-[#4752C4] transition-colors font-medium text-center block"
              >
                Join the Conversation
              </Link>
            </div>

            {/* Resources */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Organizer Resources</h3>
              <div className="space-y-3">
                <Link
                  href="https://toolkit.backontrack.eu/party-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Party Planning Guide</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  href="https://toolkit.backontrack.eu/media-kit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Share2 className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Social Media Kit</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>

                <Link
                  href="https://toolkit.backontrack.eu/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Award className="h-5 w-5 text-gray-600" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Legal Guidelines</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6">
              <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
              <p className="text-white/90 text-sm mb-4">
                Our community support team is here to help you organize an amazing pajama party.
              </p>
              <Link
                href="mailto:support@backontrack.eu"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors text-sm font-medium"
              >
                <Heart className="h-4 w-4" />
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}