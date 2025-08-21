'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { getCLS, getFCP, getFID, getLCP, getTTFB, type Metric } from 'web-vitals';

interface PerformanceConfig {
  enableWebVitals: boolean;
  enableResourceHints: boolean;
  enableImageOptimization: boolean;
  enableFontOptimization: boolean;
  enableCacheOptimization: boolean;
  batchAnalyticsEvents: boolean;
  memoryThreshold: number; // MB
  performanceThreshold: {
    lcp: number; // ms
    fcp: number; // ms
    cls: number; // score
    fid: number; // ms
    ttfb: number; // ms
  };
}

const defaultConfig: PerformanceConfig = {
  enableWebVitals: true,
  enableResourceHints: true,
  enableImageOptimization: true,
  enableFontOptimization: true,
  enableCacheOptimization: true,
  batchAnalyticsEvents: true,
  memoryThreshold: 100, // 100MB
  performanceThreshold: {
    lcp: 2500, // Good: ≤2.5s
    fcp: 1800, // Good: ≤1.8s
    cls: 0.1,  // Good: ≤0.1
    fid: 100,  // Good: ≤100ms
    ttfb: 800  // Good: ≤800ms
  }
};

/**
 * PerformanceOptimizer - Comprehensive performance monitoring and optimization
 * 
 * Features:
 * - Web Vitals monitoring with thresholds
 * - Resource preloading and prefetching
 * - Memory leak detection
 * - Image optimization hints
 * - Font loading optimization
 * - Cache optimization
 * - Analytics event batching
 */
export default function PerformanceOptimizer({ 
  config = defaultConfig 
}: { 
  config?: Partial<PerformanceConfig> 
}) {
  const fullConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  const metricsBuffer = useRef<Metric[]>([]);
  const memoryCheckInterval = useRef<NodeJS.Timeout>();
  const analyticsQueue = useRef<any[]>([]);
  const lastFlushTime = useRef<number>(Date.now());

  // Web Vitals tracking with performance thresholds
  const trackWebVitals = useCallback(() => {
    if (!fullConfig.enableWebVitals) return;

    const sendToAnalytics = (metric: Metric) => {
      const { name, value, rating } = metric;
      const threshold = fullConfig.performanceThreshold[name.toLowerCase() as keyof typeof fullConfig.performanceThreshold];
      const isGood = value <= threshold;

      metricsBuffer.current.push(metric);

      // Send to analytics with performance assessment
      const analyticsEvent = {
        event: 'web_vitals',
        metric_name: name,
        metric_value: value,
        metric_rating: rating,
        is_good: isGood,
        threshold,
        url: window.location.pathname,
        user_agent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || 'unknown',
        timestamp: Date.now()
      };

      if (fullConfig.batchAnalyticsEvents) {
        analyticsQueue.current.push(analyticsEvent);
      } else {
        sendAnalyticsEvent(analyticsEvent);
      }

      // Log poor performance in development
      if (process.env.NODE_ENV === 'development' && !isGood) {
        console.warn(`🚨 Poor ${name} performance: ${value}ms (threshold: ${threshold}ms)`);
      }
    };

    // Track all Core Web Vitals
    getCLS(sendToAnalytics);
    getFCP(sendToAnalytics);
    getFID(sendToAnalytics);
    getLCP(sendToAnalytics);
    getTTFB(sendToAnalytics);
  }, [fullConfig]);

  // Memory leak detection
  const monitorMemoryUsage = useCallback(() => {
    if (!('memory' in performance)) return;

    const memory = (performance as any).memory;
    const usedMemoryMB = memory.usedJSHeapSize / 1024 / 1024;
    const totalMemoryMB = memory.totalJSHeapSize / 1024 / 1024;
    const memoryUsagePercent = (usedMemoryMB / totalMemoryMB) * 100;

    // Track memory usage
    if (fullConfig.batchAnalyticsEvents) {
      analyticsQueue.current.push({
        event: 'memory_usage',
        used_memory_mb: Math.round(usedMemoryMB),
        total_memory_mb: Math.round(totalMemoryMB),
        usage_percent: Math.round(memoryUsagePercent),
        timestamp: Date.now()
      });
    }

    // Warn about high memory usage
    if (usedMemoryMB > fullConfig.memoryThreshold) {
      console.warn(`🚨 High memory usage: ${Math.round(usedMemoryMB)}MB`);
      
      // Trigger garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
    }
  }, [fullConfig]);

  // Send analytics event (with error handling)
  const sendAnalyticsEvent = useCallback((event: any) => {
    try {
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event.event, event);
      }
      
      // Also send to our custom analytics endpoint
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }, []);

  // Batch analytics events for better performance
  const flushAnalyticsQueue = useCallback(() => {
    if (analyticsQueue.current.length === 0) return;

    const events = [...analyticsQueue.current];
    analyticsQueue.current = [];

    // Send batched events
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events })
    }).catch(console.error);

    lastFlushTime.current = Date.now();
  }, []);

  // Resource hints optimization
  const optimizeResourceHints = useCallback(() => {
    if (!fullConfig.enableResourceHints) return;

    // Preconnect to critical domains
    const criticalDomains = [
      'https://api.mapbox.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Prefetch likely next pages
    const prefetchPages = ['/participate', '/impact', '/community'];
    prefetchPages.forEach(page => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  }, [fullConfig]);

  // Image loading optimization
  const optimizeImageLoading = useCallback(() => {
    if (!fullConfig.enableImageOptimization) return;

    // Lazy load images below the fold
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));

    // Preload critical images
    const criticalImages = document.querySelectorAll('img[data-critical]');
    criticalImages.forEach(img => {
      const image = img as HTMLImageElement;
      if (image.dataset.src) {
        image.src = image.dataset.src;
        image.removeAttribute('data-src');
      }
    });
  }, [fullConfig]);

  // Font loading optimization
  const optimizeFontLoading = useCallback(() => {
    if (!fullConfig.enableFontOptimization) return;

    // Use font-display: swap for better FCP
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
        src: url('/fonts/inter.woff2') format('woff2');
      }
    `;
    document.head.appendChild(style);

    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = '/fonts/inter.woff2';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);
  }, [fullConfig]);

  // Cache optimization
  const optimizeCaching = useCallback(() => {
    if (!fullConfig.enableCacheOptimization) return;

    // Service Worker registration for offline support
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered:', registration);
        })
        .catch(error => {
          console.log('SW registration failed:', error);
        });
    }

    // Cache critical resources
    if ('caches' in window) {
      caches.open('critical-v1').then(cache => {
        cache.addAll([
          '/',
          '/participate',
          '/assets/bot-logo.svg',
          '/sw.js'
        ]).catch(console.error);
      });
    }
  }, [fullConfig]);

  // Initialize optimizations
  useEffect(() => {
    // Start performance monitoring
    trackWebVitals();
    optimizeResourceHints();
    optimizeImageLoading();
    optimizeFontLoading();
    optimizeCaching();

    // Set up memory monitoring
    memoryCheckInterval.current = setInterval(monitorMemoryUsage, 30000);

    // Set up analytics queue flushing
    const flushInterval = setInterval(() => {
      const timeSinceLastFlush = Date.now() - lastFlushTime.current;
      if (analyticsQueue.current.length > 0 && timeSinceLastFlush > 5000) {
        flushAnalyticsQueue();
      }
    }, 5000);

    // Flush on page unload
    const handleBeforeUnload = () => {
      flushAnalyticsQueue();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      if (memoryCheckInterval.current) {
        clearInterval(memoryCheckInterval.current);
      }
      clearInterval(flushInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      flushAnalyticsQueue(); // Final flush
    };
  }, [trackWebVitals, monitorMemoryUsage, flushAnalyticsQueue, optimizeResourceHints, optimizeImageLoading, optimizeFontLoading, optimizeCaching]);

  // Performance report (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const reportPerformance = () => {
      if (metricsBuffer.current.length === 0) return;

      console.group('🚀 Performance Report');
      metricsBuffer.current.forEach(metric => {
        const { name, value, rating } = metric;
        const threshold = fullConfig.performanceThreshold[name.toLowerCase() as keyof typeof fullConfig.performanceThreshold];
        const isGood = value <= threshold;
        
        console.log(
          `${name}: ${value}ms (${rating}) ${isGood ? '✅' : '❌'} (threshold: ${threshold}ms)`
        );
      });
      console.groupEnd();
    };

    const timer = setTimeout(reportPerformance, 5000);
    return () => clearTimeout(timer);
  }, [fullConfig]);

  return null; // This component doesn't render anything
}