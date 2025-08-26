'use client';

import { useEffect } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export default function WebVitalsReporter() {
  useEffect(() => {
    // Only load web-vitals in the browser
    if (typeof window === 'undefined') return;

    const reportWebVitals = async () => {
      try {
        // web-vitals v5 API uses onCLS/onFID/... handlers
        const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import('web-vitals');
        
        const sendMetric = (metric: WebVitalsMetric) => {
          // Send to analytics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'web_vital', {
              event_category: 'Web Vitals',
              event_label: metric.id,
              value: Math.round(metric.value),
              metric_name: metric.name,
              metric_rating: metric.rating,
              custom_map: {
                metric_value: metric.value
              }
            });
          }

          // Also send to custom analytics endpoint for performance monitoring
          fetch('/api/analytics/web-vitals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: metric.name,
              value: metric.value,
              id: metric.id,
              rating: metric.rating,
              url: window.location.pathname,
              userAgent: navigator.userAgent,
              timestamp: Date.now()
            })
          }).catch(err => {
            console.warn('Failed to send web vitals metric:', err);
          });

          // Log for development
          if (process.env.NODE_ENV === 'development') {
            console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`);
          }
        };

        // Track all Core Web Vitals
        onCLS(sendMetric);
        onFID(sendMetric);
        onFCP(sendMetric);
        onLCP(sendMetric);
        onTTFB(sendMetric);

      } catch (error) {
        console.warn('Failed to load web-vitals:', error);
      }
    };

    // Report vitals after page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', reportWebVitals);
    } else {
      reportWebVitals();
    }

    // Track page visibility changes for more accurate LCP measurements
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Final web vitals measurement before page unload
        reportWebVitals();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('DOMContentLoaded', reportWebVitals);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // This component renders nothing - it's just for tracking
  return null;
}

// Performance observer for additional metrics
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track long tasks that could cause jank
        if (entry.entryType === 'longtask') {
          console.warn(`Long task detected: ${entry.duration}ms`);
          
          // Send to analytics if task is significantly long
          if (entry.duration > 100) {
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'long_task', {
                event_category: 'Performance',
                event_label: 'JavaScript Long Task',
                value: Math.round(entry.duration),
                custom_map: {
                  task_duration: entry.duration
                }
              });
            }
          }
        }

        // Track layout shifts beyond CLS
        if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
          if ((entry as any).value > 0.1) {
            console.warn(`Layout shift detected: ${(entry as any).value}`);
          }
        }

        // Track resource loading performance
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const metrics = {
            dns_lookup: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp_connect: navEntry.connectEnd - navEntry.connectStart,
            server_response: navEntry.responseStart - navEntry.requestStart,
            dom_processing: navEntry.domContentLoadedEventStart - navEntry.responseEnd,
            total_load: navEntry.loadEventEnd - navEntry.navigationStart
          };

          // Log navigation timing in development
          if (process.env.NODE_ENV === 'development') {
            console.table(metrics);
          }
        }
      }
    });

    // Observe different performance entry types
    try {
      observer.observe({ entryTypes: ['longtask', 'layout-shift', 'navigation'] });
    } catch (error) {
      console.warn('Performance observer not fully supported:', error);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
