'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CookieConsentBannerProps {
  onConsentChange?: (consent: boolean) => void;
}

export default function CookieConsentBanner({ onConsentChange }: CookieConsentBannerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('pajama-party-analytics-consent');
    if (consent === null) {
      setShowBanner(true);
      setHasConsent(null);
    } else {
      const consentValue = consent === 'true';
      setHasConsent(consentValue);
      setShowBanner(false);
      onConsentChange?.(consentValue);
    }
  }, [onConsentChange]);

  const handleAccept = () => {
    localStorage.setItem('pajama-party-analytics-consent', 'true');
    setHasConsent(true);
    setShowBanner(false);
    onConsentChange?.(true);
    
    // Initialize analytics if consent given
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('consent-given');
    }
  };

  const handleDecline = () => {
    localStorage.setItem('pajama-party-analytics-consent', 'false');
    setHasConsent(false);
    setShowBanner(false);
    onConsentChange?.(false);
  };

  const handleRevoke = () => {
    localStorage.removeItem('pajama-party-analytics-consent');
    setHasConsent(null);
    setShowBanner(true);
    onConsentChange?.(false);
  };

  return (
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-bot-green via-bot-dark-green to-bot-blue text-white shadow-2xl border-t-4 border-white/20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🚂</span>
                    <h3 className="text-lg font-bold">We count dreams to lobby for night trains!</h3>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90 max-w-3xl">
                    We use privacy-first analytics (no cookies, no tracking) to count how many Europeans want night trains. 
                    This data helps us demonstrate to policymakers that there's massive public support for sustainable transport. 
                    Your participation data will be shared anonymously in our advocacy dashboard and automatically deleted after 30 days.
                  </p>
                  <div className="mt-2 text-xs opacity-80">
                    <span className="font-medium">🔒 Privacy-first:</span> No personal data stored • No tracking across sites • GDPR compliant • Auto-deletion after 30 days
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                  <button
                    onClick={handleAccept}
                    className="bg-white text-bot-dark-green px-6 py-3 rounded-xl font-bold hover:bg-bot-light-green hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    ✨ Help lobby for trains
                  </button>
                  <button
                    onClick={handleDecline}
                    className="bg-transparent border-2 border-white/40 text-white px-6 py-3 rounded-xl font-medium hover:border-white hover:bg-white/10 transition-all duration-200"
                  >
                    No thanks
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy settings for users who have already made a choice */}
      {hasConsent !== null && !showBanner && (
        <div className="fixed bottom-4 right-4 z-40">
          <button
            onClick={handleRevoke}
            className="bg-gray-600 hover:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg opacity-60 hover:opacity-100 transition-all duration-200"
            title="Change privacy settings"
          >
            Privacy Settings
          </button>
        </div>
      )}
    </>
  );
}

// Type declaration for Plausible
declare global {
  interface Window {
    plausible: (event: string, options?: { props?: Record<string, string | number> }) => void;
  }
}