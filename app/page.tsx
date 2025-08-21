'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DreamForm } from '@/components/forms';
import { FloatingNav } from '@/components/layout';
import { Countdown } from '@/components/ui';
import { DreamCounter } from '@/components/dashboard';

// Lazy load map for better performance
const DreamMap = dynamic(() => import('@/components/map').then(mod => ({ default: mod.DreamMap })), {
  ssr: false,
  loading: () => (
    <div className="h-96 sm:h-[500px] lg:h-[600px] w-full rounded-lg bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bot-green mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Loading Europe map...</p>
      </div>
    </div>
  ),
});

const ProminentLayerToggle = dynamic(() => import('@/components/map').then(mod => ({ default: mod.ProminentLayerToggle })), {
  ssr: false,
  loading: () => <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>,
});

export default function Home() {
  return (
    <>
      <FloatingNav />
      <main className="main">
        {/* Hero Section */}
        <section className="hero py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-bot-green/10 via-bot-light-green/5 to-bot-blue/10 relative overflow-hidden">
          <div className="hero__container max-w-7xl mx-auto relative z-10">
            
            {/* Hero Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                European Night Train Dreams
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Share your dream night train route. Help us demonstrate demand for sustainable transport across Europe.
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
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Dream Routes Across Europe</h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Explore community demand for night train connections. Each route represents advocacy for sustainable transport.
                </p>
              </div>
              
              <div className="relative bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                {/* Dream Counter */}
                <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 w-full max-w-xs">
                  <DreamCounter className="shadow-lg" refreshInterval={60000} />
                </div>
                
                {/* Layer Toggle */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-30">
                  <ProminentLayerToggle />
                </div>
                
                {/* Map */}
                <DreamMap 
                  className="h-96 sm:h-[500px] lg:h-[600px] w-full rounded-lg"
                  center={[10.0, 51.0]}
                  zoom={4}
                  showLayerManager={true}
                  optimizePerformance={true}
                  enableHeatMap={true}
                  enableRealTimeUpdates={true}
                  mobileOptimized={true}
                />
                
                {/* Impact Dashboard CTA */}
                <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 z-20">
                  <a 
                    href="/impact" 
                    className="inline-flex items-center bg-bot-green text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold hover:bg-bot-dark-green transition-all duration-300 shadow-lg text-sm sm:text-base"
                  >
                    📊 View Impact Dashboard
                  </a>
                </div>
              </div>
            </div>

            {/* Action Section */}
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Left: Dream Form */}
              <div className="lg:order-1 order-2">
                <div className="text-center mb-6 lg:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Share Your Dream Route</h3>
                  <p className="text-gray-600">
                    Where would you travel by night train? Your input helps build the advocacy case.
                  </p>
                </div>
                <DreamForm />
              </div>

              {/* Right: September Event */}
              <div className="lg:order-2 order-1 lg:sticky lg:top-8">
                <div className="bg-gradient-to-r from-bot-green to-bot-blue text-white rounded-2xl p-8 shadow-lg">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">European Pajama Party</h3>
                    <p className="text-xl font-semibold text-bot-light-green mb-4">September 26, 2025</p>
                    <div className="mb-4">
                      <Countdown 
                        targetDate={new Date('2025-09-26T19:00:00.000Z')}
                        className="flex justify-center"
                      />
                    </div>
                    <p className="text-white/90 text-sm">19:00-20:00 CEST</p>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <h4 className="font-bold mb-2 flex items-center">
                        <span className="mr-2">🎧</span>
                        Silent Disco at Stations
                      </h4>
                      <p className="text-white/90 text-sm">
                        Synchronized music across European train stations
                      </p>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                      <h4 className="font-bold mb-2 flex items-center">
                        <span className="mr-2">📹</span>
                        Live Stream Connection
                      </h4>
                      <p className="text-white/90 text-sm">
                        Watch all participating cities simultaneously
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <a 
                      href="/interview"
                      className="inline-flex items-center bg-white text-bot-green px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      🎤 Interview Mode
                    </a>
                  </div>
                </div>
              </div>
            </div>
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
                  href="/impact"
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
    </>
  );
}