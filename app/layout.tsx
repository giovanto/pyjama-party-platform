import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { Header, Footer, FloatingNav, EventBanner, AnalyticsProvider } from "@/components/layout";
import ClientPerformanceWrapper from "@/components/performance/ClientPerformanceWrapper";
import { DataProvider } from "@/providers/DataProvider";

export const metadata: Metadata = {
  title: "Where Would You Like to Wake Up Tomorrow? | Back-on-Track",
  description: "Where would you like to wake up tomorrow? Join the European night train community and help build the sustainable transport network Europe deserves.",
  keywords: "night trains, sustainable transport, europe, back-on-track, pyjama party, community",
  authors: [{ name: "Back-on-Track" }],
  generator: "Next.js",
  applicationName: "Pajama Party Platform",
  referrer: "origin-when-cross-origin",
  colorScheme: "light",
  creator: "Back-on-Track Action Group",
  publisher: "Back-on-Track Action Group",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://pyjama-party.back-on-track.eu'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Where Would You Like to Wake Up Tomorrow?",
    description: "Share your dream destination and connect with fellow sustainable travel advocates across Europe.",
    type: "website",
    url: "https://pyjama-party.back-on-track.eu",
    siteName: "Pajama Party Platform",
    locale: "en_US",
    images: [
      {
        url: "https://pyjama-party.back-on-track.eu/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pajama Party Platform - European Night Train Advocacy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Where Would You Like to Wake Up Tomorrow?",
    description: "Join the European night train revolution - share your dream routes!",
    images: ["https://pyjama-party.back-on-track.eu/assets/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification IDs when available
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.mapbox.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        
        {/* Critical CSS inlined for above-the-fold content will be handled by Next.js */}
        
        {/* Icons and manifest */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="msapplication-TileColor" content="#22c55e" />
        
        {/* Performance hints */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="font-mark antialiased bg-white text-gray-900 overflow-x-hidden">
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bot-green text-white px-4 py-2 rounded-md z-50 focus:z-[100]"
        >
          Skip to main content
        </a>
        
        <AnalyticsProvider>
          <DataProvider>
            {/* Progressive loading with Suspense boundaries */}
            <Suspense fallback={<div className="h-16 bg-white" />}>
              <Header />
            </Suspense>
            
            <Suspense fallback={<div className="h-12 bg-gradient-to-r from-bot-green to-bot-blue" />}>
              <EventBanner />
            </Suspense>
            
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            
            <Suspense fallback={<div className="h-96 bg-gray-50" />}>
              <Footer />
            </Suspense>
            
            <Suspense fallback={null}>
              <FloatingNav />
            </Suspense>
            
            {/* Performance Monitoring */}
            <ClientPerformanceWrapper />
          </DataProvider>
        </AnalyticsProvider>
        
        {/* Service Worker registration for offline functionality */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
