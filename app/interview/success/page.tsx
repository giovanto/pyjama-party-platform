'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Success content component to handle search params
function SuccessContent() {
  const searchParams = useSearchParams();
  
  const dreamerName = searchParams.get('name') || 'Dreamer';
  const destination = searchParams.get('destination') || 'your dream destination';
  const sessionId = searchParams.get('session');
  const language = (searchParams.get('lang') as 'en' | 'de' | 'fr') || 'en';
  const submissionTime = searchParams.get('time');
  
  const [countdown, setCountdown] = useState(5);
  const [showMap, setShowMap] = useState(false);

  // Auto redirect countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Redirect back to interview page
          if (sessionId) {
            window.location.href = `/interview?station=${searchParams.get('station') || ''}&lang=${language}`;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, language, searchParams]);

  // Show map after 2 seconds
  useEffect(() => {
    const mapTimer = setTimeout(() => setShowMap(true), 2000);
    return () => clearTimeout(mapTimer);
  }, []);

  const translations = {
    en: {
      title: "Dream Added to the Map!",
      thankYou: "Thank you",
      dreamAdded: "Your dream route is now part of the European night train movement",
      destination: "Destination",
      submissionTime: "Completed in",
      seconds: "seconds",
      nextPerson: "Next person, please!",
      autoRedirect: "Returning to collection in",
      viewMap: "View All Dreams",
      continueCollecting: "Continue Collecting",
      impact: "Your contribution helps build the case for better night train connections across Europe",
      encouragement: [
        "🌟 Every dream route matters!",
        "🚄 You're building the future of European travel",
        "🌍 Sustainable transport starts with shared dreams",
        "🤝 Together we're creating change"
      ],
      socialShare: "Share this movement",
      website: "Visit our main platform"
    },
    de: {
      title: "Traum zur Karte hinzugefügt!",
      thankYou: "Danke",
      dreamAdded: "Ihre Traumroute ist jetzt Teil der europäischen Nachtzug-Bewegung",
      destination: "Ziel",
      submissionTime: "Abgeschlossen in",
      seconds: "Sekunden",
      nextPerson: "Nächste Person, bitte!",
      autoRedirect: "Zurück zur Sammlung in",
      viewMap: "Alle Träume anzeigen",
      continueCollecting: "Weiter sammeln",
      impact: "Ihr Beitrag hilft dabei, bessere Nachtzugverbindungen in Europa zu schaffen",
      encouragement: [
        "🌟 Jede Traumroute zählt!",
        "🚄 Sie bauen die Zukunft des europäischen Reisens auf",
        "🌍 Nachhaltiger Verkehr beginnt mit gemeinsamen Träumen",
        "🤝 Gemeinsam schaffen wir Veränderung"
      ],
      socialShare: "Diese Bewegung teilen",
      website: "Besuchen Sie unsere Hauptplattform"
    },
    fr: {
      title: "Rêve Ajouté à la Carte !",
      thankYou: "Merci",
      dreamAdded: "Votre route de rêve fait maintenant partie du mouvement européen des trains de nuit",
      destination: "Destination",
      submissionTime: "Terminé en",
      seconds: "secondes",
      nextPerson: "Personne suivante, s'il vous plaît !",
      autoRedirect: "Retour à la collecte dans",
      viewMap: "Voir Tous les Rêves",
      continueCollecting: "Continuer la Collecte",
      impact: "Votre contribution aide à construire le dossier pour de meilleures connexions de trains de nuit en Europe",
      encouragement: [
        "🌟 Chaque route de rêve compte !",
        "🚄 Vous construisez l'avenir du voyage européen",
        "🌍 Le transport durable commence par des rêves partagés",
        "🤝 Ensemble, nous créons le changement"
      ],
      socialShare: "Partager ce mouvement",
      website: "Visitez notre plateforme principale"
    }
  };

  const t = translations[language];
  const encouragement = t.encouragement[Math.floor(Math.random() * t.encouragement.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bot-green via-bot-green to-bot-dark-green text-white">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            className="text-8xl sm:text-9xl mb-6"
          >
            🌟
          </motion.div>

          {/* Main Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {t.title}
            </h1>
            <div className="text-xl sm:text-2xl mb-2">
              {t.thankYou}, <span className="font-semibold">{dreamerName}</span>!
            </div>
            <p className="text-lg opacity-90">
              {t.dreamAdded}
            </p>
          </motion.div>

          {/* Route Details */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8"
          >
            <div className="text-lg font-medium mb-2">{t.destination}:</div>
            <div className="text-2xl font-bold mb-4">{destination}</div>
            
            {submissionTime && (
              <div className="text-sm opacity-80">
                {t.submissionTime} {submissionTime} {t.seconds}
              </div>
            )}
          </motion.div>

          {/* Impact Message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mb-8"
          >
            <div className="text-lg mb-3">{encouragement}</div>
            <p className="text-sm opacity-80 max-w-lg mx-auto">
              {t.impact}
            </p>
          </motion.div>

          {/* Map Visualization Teaser */}
          {showMap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                <div className="text-sm opacity-80 mb-2">Your route is now visible on the map</div>
                <div className="h-32 bg-gradient-to-r from-bot-blue/30 to-bot-green/30 rounded-lg flex items-center justify-center">
                  <div className="text-4xl">🗺️</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Person Call-to-Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mb-8"
          >
            <div className="text-3xl sm:text-4xl font-bold mb-4 animate-pulse">
              {t.nextPerson}
            </div>
            
            {/* Auto-redirect countdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 inline-block">
              <div className="text-lg font-medium">
                {t.autoRedirect} <span className="font-bold text-2xl">{countdown}</span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href={`/interview?station=${searchParams.get('station') || ''}&lang=${language}`}
              className="bg-white text-bot-green px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {t.continueCollecting}
            </Link>
            
            <Link
              href="/"
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-medium hover:bg-white/30 transition-colors"
            >
              {t.viewMap}
            </Link>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="mt-8 pt-8 border-t border-white/20"
          >
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a 
                href="https://back-on-track.eu" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                {t.website}
              </a>
              <a 
                href="https://twitter.com/BackOnTrackEU" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                {t.socialShare}
              </a>
            </div>
            
            <div className="mt-4 text-xs text-white/60">
              Session ID: {sessionId?.slice(-8) || 'N/A'}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function InterviewSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-bot-green via-bot-green to-bot-dark-green text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">🌟</div>
          <div className="text-xl font-medium">Loading success page...</div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}