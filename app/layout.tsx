import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer, FloatingNav, EventBanner, AnalyticsProvider } from "@/components/layout";

export const metadata: Metadata = {
  title: "Where Would You Like to Wake Up Tomorrow? | Back-on-Track",
  description: "Where would you like to wake up tomorrow? Join the European night train community and help build the sustainable transport network Europe deserves.",
  keywords: "night trains, sustainable transport, europe, back-on-track, pyjama party, community",
  authors: [{ name: "Back-on-Track" }],
  openGraph: {
    title: "Where Would You Like to Wake Up Tomorrow?",
    description: "Share your dream destination and connect with fellow sustainable travel advocates across Europe.",
    type: "website",
    url: "https://pyjama-party.back-on-track.eu",
    images: [
      {
        url: "https://pyjama-party.back-on-track.eu/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pajama Party Platform",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-mark antialiased">
        <AnalyticsProvider>
          <Header />
          <EventBanner />
          {children}
          <Footer />
          <FloatingNav />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
