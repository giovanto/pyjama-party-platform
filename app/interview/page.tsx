'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { QuickDreamForm, OfflineQueue, VolunteerDashboard } from '@/components/interview';
import { InterviewDreamData, OfflineQueueItem } from '@/types';

// Separate component for search params to handle Suspense boundary
function InterviewContent() {
  const searchParams = useSearchParams();
  
  // Extract URL parameters
  const stationParam = searchParams.get('station');
  const languageParam = searchParams.get('lang') as 'en' | 'de' | 'fr' | null;
  const volunteerParam = searchParams.get('volunteer');
  const eventParam = searchParams.get('event');
  
  // Generate session ID
  const [sessionId] = useState(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  
  const [language] = useState<'en' | 'de' | 'fr'>(languageParam || 'en');
  const [stationCode] = useState(stationParam || '');
  const [volunteerId] = useState(volunteerParam || `vol_${Date.now()}`);
  const [showDashboard, setShowDashboard] = useState(false);
  const [queueSize, setQueueSize] = useState(0);

  // Translations
  const translations = {
    en: {
      title: "Dream Route Collection Station",
      subtitle: "September 26th Pajama Party Interview Mode",
      instructions: "Help people share their dream night train routes in 30 seconds",
      toggleDashboard: "Volunteer Dashboard",
      hideDashboard: "Hide Dashboard",
      queueStatus: "Offline Queue",
      itemsWaiting: "items waiting to sync",
      welcome: "Welcome, Volunteer!",
      stationInfo: "Station",
      eventInfo: "Event Date",
      quickStart: [
        "1. Show this screen to travelers",
        "2. Help them fill in their dream destination",
        "3. Submit in under 30 seconds",
        "4. Encourage the next person!"
      ]
    },
    de: {
      title: "Traumrouten-Sammelstation",
      subtitle: "26. September Pyjama-Party Interview-Modus",
      instructions: "Helfen Sie Menschen dabei, ihre Traum-Nachtzugrouten in 30 Sekunden zu teilen",
      toggleDashboard: "Freiwilligen-Dashboard",
      hideDashboard: "Dashboard ausblenden",
      queueStatus: "Offline-Warteschlange",
      itemsWaiting: "Elemente warten auf Synchronisation",
      welcome: "Willkommen, Freiwilliger!",
      stationInfo: "Bahnhof",
      eventInfo: "Veranstaltungsdatum",
      quickStart: [
        "1. Zeigen Sie diesen Bildschirm den Reisenden",
        "2. Helfen Sie ihnen, ihr Traumziel einzugeben",
        "3. Übermittlung in unter 30 Sekunden",
        "4. Ermutigen Sie die nächste Person!"
      ]
    },
    fr: {
      title: "Station de Collecte de Routes de Rêve",
      subtitle: "Mode Interview Pajama Party du 26 septembre",
      instructions: "Aidez les gens à partager leurs routes de trains de nuit de rêve en 30 secondes",
      toggleDashboard: "Tableau de Bord Bénévole",
      hideDashboard: "Masquer le Tableau de Bord",
      queueStatus: "File d'Attente Hors Ligne",
      itemsWaiting: "éléments en attente de synchronisation",
      welcome: "Bienvenue, Bénévole !",
      stationInfo: "Gare",
      eventInfo: "Date d'Événement",
      quickStart: [
        "1. Montrez cet écran aux voyageurs",
        "2. Aidez-les à saisir leur destination de rêve",
        "3. Soumettez en moins de 30 secondes",
        "4. Encouragez la personne suivante !"
      ]
    }
  };

  const t = translations[language];

  // Handle form submission
  const handleSubmit = async (data: InterviewDreamData) => {
    // The form will handle the actual submission
    console.log('Interview submission:', data);
  };

  // Handle offline queue updates
  const handleOfflineQueue = (item: OfflineQueueItem) => {
    console.log('New offline queue item:', item);
  };

  // Update queue size when it changes
  const handleQueueUpdate = (size: number) => {
    setQueueSize(size);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bot-green/5 via-white to-bot-blue/5">
      {/* Skip to content link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-bot-green text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>
      {/* Mobile-optimized header */}
      <header className="bg-white shadow-sm border-b-2 border-bot-green/20" role="banner">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 id="page-title" className="text-xl sm:text-2xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
              {stationCode && (
                <div className="mt-1 text-sm text-bot-green font-medium">
                  {t.stationInfo}: {stationCode.replace('-', ' ')}
                </div>
              )}
            </div>
            
            {/* Dashboard toggle */}
            <div className="flex items-center space-x-2">
              {queueSize > 0 && (
                <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  {queueSize} {t.itemsWaiting}
                </div>
              )}
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="px-3 py-2 bg-bot-green text-white rounded-lg text-sm font-medium hover:bg-bot-dark-green transition-colors"
              >
                {showDashboard ? t.hideDashboard : t.toggleDashboard}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Volunteer Dashboard (collapsible) */}
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <VolunteerDashboard
              sessionId={sessionId}
              stationCode={stationCode}
              language={language}
              targetSubmissions={50}
            />
          </motion.div>
        )}

        {/* Offline Queue Status */}
        <div className="mb-6">
          <OfflineQueue 
            language={language}
            onQueueUpdate={handleQueueUpdate}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Instructions (Hidden on small screens when dashboard is shown) */}
          <div className={`lg:col-span-1 ${showDashboard ? 'hidden lg:block' : ''}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 mb-4">{t.welcome}</h3>
              <div className="space-y-4">
                <div className="text-sm">
                  <div className="font-medium text-gray-700 mb-2">{t.instructions}</div>
                  <ol className="space-y-1 text-gray-600">
                    {t.quickStart.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
                
                {eventParam && (
                  <div className="text-sm">
                    <div className="font-medium text-gray-700">{t.eventInfo}:</div>
                    <div className="text-gray-600">{new Date(eventParam).toLocaleDateString()}</div>
                  </div>
                )}
                
                {/* Real-time stats */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Session: {sessionId.slice(-8)}</div>
                    <div>Volunteer: {volunteerId.slice(-8)}</div>
                    <div>Language: {language.toUpperCase()}</div>
                    <div>Target: 30s per submission</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dream Collection Form */}
          <div className="lg:col-span-2">
            <QuickDreamForm
              stationCode={stationCode}
              language={language}
              sessionId={sessionId}
              volunteerId={volunteerId}
              onSubmit={handleSubmit}
              onOfflineQueue={handleOfflineQueue}
            />
          </div>
        </div>
      </div>

      {/* Footer with emergency contact */}
      <div className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="text-center text-sm text-gray-600">
            <div className="mb-2">
              🚄 Pajama Party Platform - September 26th, 2025 - Dream Route Collection
            </div>
            <div>
              Need help? Contact: volunteer-support@back-on-track.eu
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense wrapper
export default function InterviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-bot-green/5 via-white to-bot-blue/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🌟</div>
          <div className="text-lg font-medium text-gray-600">Loading Interview Station...</div>
        </div>
      </div>
    }>
      <InterviewContent />
    </Suspense>
  );
}
