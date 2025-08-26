import { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Users, ExternalLink, BookOpen } from 'lucide-react';
import { DreamMap } from '@/components/map';
import { UniversalMessage, PhaseNavigation } from '@/components/journey';

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center">
            <UniversalMessage
              variant="hero"
              customMessage="Join the growing movement"
              showIcon={true}
              animated={true}
              className="mb-4"
            />

            <div className="mb-6">
              <PhaseNavigation
                currentPhase="community"
                variant="breadcrumb"
                className="justify-center"
              />
            </div>

            <p className="text-base sm:text-lg text-gray-600 mb-6 max-w-3xl mx-auto leading-relaxed">
              Connect with climate advocates, coordinate your local station, and help bring back night trains across Europe.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="https://discord.gg/backontrack"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#5865F2] text-white rounded-xl hover:bg-[#4752C4] transition-all font-semibold text-base shadow-sm"
              >
                <MessageCircle className="h-5 w-5 inline mr-2" aria-hidden="true" />
                Join Discord
              </Link>
              <Link
                href="/organize"
                className="px-6 py-3 bg-bot-green text-white rounded-xl hover:bg-bot-dark-green transition-all font-semibold text-base shadow-sm"
              >
                <Users className="h-5 w-5 inline mr-2" aria-hidden="true" />
                Become an Organizer
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Station Readiness Map */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Station Readiness Map</h2>
                <p className="text-gray-600">
                  Track which stations are preparing for the pajama party and where momentum is building.
                </p>
              </div>
              <div className="h-96">
                <DreamMap className="w-full h-full" optimizePerformance={true} />
              </div>
              <div className="p-4 border-t border-gray-200 text-sm text-gray-600">
                Looking for numbers? Visit the <Link href="/dashboard" className="text-bot-blue hover:underline">Dashboard</Link> for live metrics.
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Organizer Resources */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Organizer Resources</h3>
              <div className="space-y-3">
                <Link
                  href="https://toolkit.backontrack.eu/party-guide"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BookOpen className="h-5 w-5 text-gray-600" aria-hidden="true" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Party Planning Guide</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </Link>

                <Link
                  href="https://toolkit.backontrack.eu/media-kit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-5" aria-hidden="true">📣</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Social Media Kit</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </Link>

                <Link
                  href="https://toolkit.backontrack.eu/legal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="inline-flex items-center justify-center w-5" aria-hidden="true">⚖️</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">Legal Guidelines</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
