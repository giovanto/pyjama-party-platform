'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InterviewDreamData, Station, OfflineQueueItem } from '@/types';
import { useAnalytics } from '@/components/layout/AnalyticsProvider';

interface QuickDreamFormProps {
  stationCode?: string;
  language?: 'en' | 'de' | 'fr';
  sessionId?: string;
  volunteerId?: string;
  onSubmit?: (data: InterviewDreamData) => Promise<void>;
  onOfflineQueue?: (item: OfflineQueueItem) => void;
}

const translations = {
  en: {
    title: "Where would you like to wake up tomorrow?",
    subtitle: "Quick 30-second dream route collection",
    name: "Your first name",
    namePlaceholder: "Maria, João, Emma...",
    from: "Starting station",
    to: "Dream destination",
    toPlaceholder: "Barcelona, Prague, Stockholm...",
    email: "Email (optional)",
    emailPlaceholder: "your@email.com",
    emailHelp: "Get connected with fellow travelers",
    why: "Why this route?",
    whyPlaceholder: "Tell us why this route matters...",
    submit: "Add to Map",
    submitting: "Adding...",
    success: "Dream Added!",
    successMessage: "Thank you! Your dream route is now on the map.",
    nextPerson: "Next person, please!",
    offline: "Offline - queued for sync",
    required: "required",
    optional: "optional"
  },
  de: {
    title: "Wo möchtest du morgen aufwachen?",
    subtitle: "Schnelle 30-Sekunden Traumroute erfassen",
    name: "Dein Vorname",
    namePlaceholder: "Maria, Klaus, Emma...",
    from: "Startbahnhof",
    to: "Traumziel",
    toPlaceholder: "Barcelona, Prag, Stockholm...",
    email: "E-Mail (optional)",
    emailPlaceholder: "deine@email.de",
    emailHelp: "Verbinde dich mit anderen Reisenden",
    why: "Warum diese Route?",
    whyPlaceholder: "Erzähl uns, warum diese Route wichtig ist...",
    submit: "Zur Karte hinzufügen",
    submitting: "Wird hinzugefügt...",
    success: "Traum hinzugefügt!",
    successMessage: "Danke! Deine Traumroute ist jetzt auf der Karte.",
    nextPerson: "Nächste Person, bitte!",
    offline: "Offline - wartet auf Synchronisation",
    required: "erforderlich",
    optional: "optional"
  },
  fr: {
    title: "Où aimerais-tu te réveiller demain ?",
    subtitle: "Collection rapide de route de rêve en 30 secondes",
    name: "Ton prénom",
    namePlaceholder: "Maria, Pierre, Emma...",
    from: "Gare de départ",
    to: "Destination de rêve",
    toPlaceholder: "Barcelone, Prague, Stockholm...",
    email: "Email (optionnel)",
    emailPlaceholder: "ton@email.fr",
    emailHelp: "Connecte-toi avec d'autres voyageurs",
    why: "Pourquoi cette route ?",
    whyPlaceholder: "Dis-nous pourquoi cette route compte...",
    submit: "Ajouter à la carte",
    submitting: "Ajout en cours...",
    success: "Rêve ajouté !",
    successMessage: "Merci ! Ta route de rêve est maintenant sur la carte.",
    nextPerson: "Personne suivante, s'il vous plaît !",
    offline: "Hors ligne - en attente de synchronisation",
    required: "requis",
    optional: "optionnel"
  }
};

export default function QuickDreamForm({
  stationCode = '',
  language = 'en',
  sessionId,
  volunteerId,
  onSubmit,
  onOfflineQueue
}: QuickDreamFormProps) {
  const { trackEvent } = useAnalytics();
  const t = translations[language];
  
  const [formData, setFormData] = useState<InterviewDreamData>({
    dreamerName: '',
    originStation: stationCode,
    destinationCity: '',
    email: '',
    why: '',
    sessionId,
    collectedBy: volunteerId,
    language,
    source: 'interview'
  });

  const [stations, setStations] = useState<Station[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [submissionTime, setSubmissionTime] = useState<number | null>(null);
  const [startTime] = useState(Date.now());

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Pre-fill station if provided
  useEffect(() => {
    if (stationCode) {
      // Decode station name from code or fetch from API
      const fetchStation = async () => {
        try {
          const response = await fetch(`/api/stations/search?code=${stationCode}`);
          if (response.ok) {
            const data = await response.json();
            if (data.stations?.[0]) {
              const station = data.stations[0];
              setFormData(prev => ({
                ...prev,
                originStation: `${station.name}, ${station.city}, ${station.country}`
              }));
            }
          }
        } catch (error) {
          console.log('Could not fetch station details, using code:', stationCode);
          // Fallback to station code
          setFormData(prev => ({
            ...prev,
            originStation: stationCode.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
          }));
        }
      };
      
      fetchStation();
    }
  }, [stationCode]);

  const handleInputChange = (field: keyof InterviewDreamData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Track input progress for optimization
    trackEvent('interview_input_progress', {
      field,
      sessionId,
      stationCode,
      language,
      timeElapsed: Date.now() - startTime
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.dreamerName.trim() || !formData.destinationCity.trim()) {
      trackEvent('interview_validation_error', {
        missing: [
          !formData.dreamerName.trim() ? 'name' : '',
          !formData.destinationCity.trim() ? 'destination' : ''
        ].filter(Boolean).join(','),
        sessionId,
        stationCode
      });
      return;
    }

    setIsSubmitting(true);
    const submissionStart = Date.now();
    
    trackEvent('interview_submission_started', {
      sessionId,
      stationCode,
      language,
      hasEmail: !!formData.email,
      timeToSubmit: submissionStart - startTime
    });

    try {
      if (isOffline) {
        // Queue for offline sync
        const queueItem: OfflineQueueItem = {
          id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          data: formData,
          timestamp: new Date().toISOString(),
          retryCount: 0,
          status: 'pending'
        };
        
        // Save to local storage
        const existingQueue = JSON.parse(localStorage.getItem('interviewQueue') || '[]');
        existingQueue.push(queueItem);
        localStorage.setItem('interviewQueue', JSON.stringify(existingQueue));
        
        onOfflineQueue?.(queueItem);
        
        trackEvent('interview_queued_offline', {
          sessionId,
          stationCode,
          queueSize: existingQueue.length
        });
      } else {
        // Submit online
        if (onSubmit) {
          await onSubmit(formData);
        } else {
          const response = await fetch('/api/interview/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });

          if (!response.ok) {
            throw new Error('Submission failed');
          }
        }

        trackEvent('interview_submission_completed', {
          sessionId,
          stationCode,
          language,
          hasEmail: !!formData.email,
          submissionTime: Date.now() - submissionStart,
          totalTime: Date.now() - startTime
        });
      }

      // Show success
      setSubmissionTime(Date.now() - startTime);
      setShowSuccess(true);
      
      // Auto-reset for next person after 3 seconds
      setTimeout(() => {
        setFormData({
          dreamerName: '',
          originStation: stationCode,
          destinationCity: '',
          email: '',
          why: '',
          sessionId,
          collectedBy: volunteerId,
          language,
          source: 'interview'
        });
        setShowSuccess(false);
        setSubmissionTime(null);
      }, 3000);
      
    } catch (error) {
      console.error('Submission error:', error);
      trackEvent('interview_submission_error', {
        sessionId,
        stationCode,
        error: error instanceof Error ? error.message : 'unknown'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-bot-green via-bot-green to-bot-dark-green text-white rounded-3xl p-8 text-center shadow-2xl"
      >
        <div className="text-6xl mb-4">🌟</div>
        <h2 className="text-3xl font-bold mb-2">{t.success}</h2>
        <p className="text-xl mb-4">{t.successMessage}</p>
        {submissionTime && (
          <p className="text-sm opacity-90 mb-4">
            Completed in {Math.round(submissionTime / 1000)}s
          </p>
        )}
        <div className="text-2xl font-bold animate-pulse">
          {t.nextPerson}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-sm text-gray-600">{t.subtitle}</p>
        {isOffline && (
          <div className="mt-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
            {t.offline}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Name - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.name} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.dreamerName}
            onChange={(e) => handleInputChange('dreamerName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-bot-green bg-gray-50 font-medium text-lg"
            placeholder={t.namePlaceholder}
            required
            autoComplete="given-name"
          />
        </div>

        {/* Origin Station - Pre-filled */}
        {formData.originStation && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.from}
            </label>
            <div className="px-4 py-3 bg-bot-green/10 border-2 border-bot-green/20 rounded-xl text-lg font-medium text-gray-700">
              {formData.originStation}
            </div>
          </div>
        )}

        {/* Destination - Required */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.to} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.destinationCity}
            onChange={(e) => handleInputChange('destinationCity', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-bot-green bg-gray-50 font-medium text-lg"
            placeholder={t.toPlaceholder}
            required
            autoComplete="off"
          />
        </div>

        {/* Email - Optional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.email} <span className="text-gray-400">({t.optional})</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-bot-green bg-gray-50"
            placeholder={t.emailPlaceholder}
            autoComplete="email"
          />
          <p className="text-xs text-gray-500 mt-1">{t.emailHelp}</p>
        </div>

        {/* Why - Optional but encouraged */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.why} <span className="text-gray-400">({t.optional})</span>
          </label>
          <textarea
            value={formData.why}
            onChange={(e) => handleInputChange('why', e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-bot-green bg-gray-50 resize-none"
            placeholder={t.whyPlaceholder}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || !formData.dreamerName.trim() || !formData.destinationCity.trim()}
          className="w-full bg-gradient-to-r from-bot-green to-bot-dark-green text-white py-4 rounded-2xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⭐</span>
              {t.submitting}
            </>
          ) : (
            <>
              🗺️ {t.submit}
            </>
          )}
        </motion.button>
      </div>

      {/* Progress indicator */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-500">
          Target: 30s per submission
        </div>
        {startTime && (
          <div className="text-xs text-gray-400 mt-1">
            Current: {Math.round((Date.now() - startTime) / 1000)}s
          </div>
        )}
      </div>
    </motion.form>
  );
}