'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CookieConsentBanner } from './index';

interface AnalyticsContextType {
  hasConsent: boolean;
  trackEvent: (event: string, properties?: Record<string, string | number>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  hasConsent: false,
  trackEvent: () => {},
});

export const useAnalytics = () => useContext(AnalyticsContext);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export default function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check initial consent state
    const consent = localStorage.getItem('pajama-party-analytics-consent');
    if (consent === 'true') {
      setHasConsent(true);
      loadPlausibleScript();
    }
    setIsLoaded(true);
  }, []);

  const loadPlausibleScript = () => {
    if (typeof window === 'undefined' || document.querySelector('[data-domain]')) {
      return; // Already loaded or not in browser
    }

    const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    if (!domain) {
      console.warn('NEXT_PUBLIC_PLAUSIBLE_DOMAIN not configured');
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.setAttribute('data-domain', domain);
    script.src = 'https://plausible.io/js/script.js';
    
    document.head.appendChild(script);
  };

  const handleConsentChange = (consent: boolean) => {
    setHasConsent(consent);
    
    if (consent) {
      loadPlausibleScript();
    } else {
      // Remove analytics script if consent revoked
      const script = document.querySelector('script[data-domain]');
      if (script) {
        script.remove();
      }
    }
  };

  const trackEvent = (event: string, properties?: Record<string, string | number>) => {
    if (!hasConsent || typeof window === 'undefined' || !window.plausible) {
      return;
    }

    try {
      if (properties) {
        window.plausible(event, { props: properties });
      } else {
        window.plausible(event);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  // Also send events to our internal API for dashboard aggregation
  const trackInternalEvent = async (event: string, properties?: Record<string, string | number>) => {
    if (!hasConsent) return;

    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          properties: properties || {},
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Internal analytics error:', error);
    }
  };

  const enhancedTrackEvent = (event: string, properties?: Record<string, string | number>) => {
    // Track with Plausible
    trackEvent(event, properties);
    
    // Track internally for dashboard
    trackInternalEvent(event, properties);
  };

  if (!isLoaded) {
    return <>{children}</>;
  }

  return (
    <AnalyticsContext.Provider value={{ hasConsent, trackEvent: enhancedTrackEvent }}>
      {children}
      <CookieConsentBanner onConsentChange={handleConsentChange} />
    </AnalyticsContext.Provider>
  );
}