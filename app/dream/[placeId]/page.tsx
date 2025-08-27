import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Train, MapPin, Star, Heart, Users, Calendar } from 'lucide-react';
import { UniversalMessage, PhaseNavigation } from '@/components/journey';

type DreamRouteParams = { placeId: string }

// Helper to support Next.js typing that may pass `params` as a Promise
async function resolveParams(p: DreamRouteParams | Promise<DreamRouteParams>): Promise<DreamRouteParams> {
  return Promise.resolve(p as any)
}

interface Place {
  place_id: string;
  name: string;
  brief_description: string;
  longer_description: string;
  country: string;
  latitude: number;
  longitude: number;
  place_type: string;
  priority_score: number;
  tags: string[];
  place_image?: string;
  image_attribution?: string;
}

async function getPlaceData(placeId: string): Promise<Place | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/places/${placeId}`,
      { cache: 'revalidate', next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.place;
  } catch (error) {
    console.error('Error fetching place data:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: DreamRouteParams | Promise<DreamRouteParams> }): Promise<Metadata> {
  const { placeId } = await resolveParams(params)
  const place = await getPlaceData(placeId);
  
  if (!place) {
    return {
      title: 'Dream Destination Not Found',
      description: 'The requested dream destination could not be found.'
    };
  }

  return {
    title: `Dream of ${place.name} | European Night Train Platform`,
    description: place.brief_description || `Discover ${place.name}, ${place.country} - a beautiful destination accessible by sustainable night train travel.`,
    openGraph: {
      title: `Dream of ${place.name}`,
      description: place.brief_description || `Discover ${place.name}, ${place.country}`,
      images: place.place_image ? [
        {
          url: place.place_image,
          width: 1200,
          height: 630,
          alt: `Beautiful view of ${place.name}`,
        }
      ] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Dream of ${place.name}`,
      description: place.brief_description || `Discover ${place.name}, ${place.country}`,
      images: place.place_image ? [place.place_image] : [],
    }
  };
}

export default async function DreamDestinationPage({ params }: { params: DreamRouteParams | Promise<DreamRouteParams> }) {
  const { placeId } = await resolveParams(params)
  const place = await getPlaceData(placeId);

  if (!place) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50">
      {/* Navigation */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-sm border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Map</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                href={`/connect/${place.place_id}`}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                <Train className="h-4 w-4 inline mr-2" />
                Find Train Route
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        {/* Background Image */}
        {place.place_image && (
          <div className="absolute inset-0 z-0">
            <Image
              src={place.place_image}
              alt={`Beautiful view of ${place.name}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-700 mb-6">
              <MapPin className="h-4 w-4 text-amber-600" />
              {place.country}
              {place.priority_score > 5 && (
                <>
                  <span className="text-gray-400">•</span>
                  <Star className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-700">Popular Destination</span>
                </>
              )}
            </div>

            {/* Universal Message */}
            <UniversalMessage 
              variant="hero"
              customMessage={`Dream of waking up in ${place.name}`}
              showIcon={true}
              animated={true}
              className="text-white drop-shadow-lg mb-6"
            />
            
            {/* Phase Navigation */}
            <div className="mb-8">
              <PhaseNavigation 
                currentPhase="dream"
                variant="floating"
                className="max-w-2xl mx-auto"
              />
            </div>

            {/* Brief Description */}
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              {place.brief_description}
            </p>

            {/* Tags */}
            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {place.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* CTA Button */}
            <Link
              href={`/connect/${place.place_id}`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 font-semibold text-lg shadow-xl"
            >
              <Train className="h-6 w-6" />
              Find Your Night Train Route
            </Link>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative z-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Detailed Description */}
          {place.longer_description && (
            <div className="prose prose-lg max-w-none mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Visit {place.name}?
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {place.longer_description}
              </p>
            </div>
          )}

          {/* Movement Introduction */}
          <div className="bg-gradient-to-r from-blue-50 to-bot-blue/20 rounded-2xl p-8 mb-12">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Heart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Why Night Trains Matter
                </h3>
                <p className="text-gray-600 mb-4">
                  Traveling by night train to beautiful destinations like {place.name} is more than just a journey—it&apos;s a statement for sustainable travel and climate action.
                </p>
                <p className="text-gray-600 mb-4">
                  Every night train journey saves approximately 90% of CO₂ emissions compared to flying, while letting you wake up refreshed in incredible places across Europe.
                </p>
                <Link
                  href="/pyjama-party"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                >
                  Learn about the European Pajama Party
                  <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats & Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6 bg-amber-50 rounded-xl">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Join Dreamers</h4>
              <p className="text-gray-600 text-sm">
                Thousands of travelers dream of sustainable journeys to places like this
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Train className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sustainable Travel</h4>
              <p className="text-gray-600 text-sm">
                90% less CO₂ emissions compared to flying - travel with a clear conscience
              </p>
            </div>

            <div className="text-center p-6 bg-bot-green/10 rounded-xl">
              <div className="w-12 h-12 bg-bot-green/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-bot-green" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">September 26, 2025</h4>
              <p className="text-gray-600 text-sm">
                Join the Europe-wide Pajama Party celebrating night train travel
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Turn This Dream Into Reality?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Discover night train routes to {place.name} and join thousands of climate activists making sustainable travel a reality across Europe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/connect/${place.place_id}`}
                className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                <Train className="h-5 w-5 inline mr-2" />
                Find Train Routes
              </Link>
              <Link
                href="/pyjama-party"
                className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-medium border border-white/20"
              >
                Learn About the Movement
              </Link>
            </div>
          </div>
        </div>

        {/* Image Attribution */}
        {place.image_attribution && (
          <div className="bg-gray-50 px-4 py-3">
            <div className="max-w-4xl mx-auto">
              <p className="text-xs text-gray-500">
                Image: {place.image_attribution}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
