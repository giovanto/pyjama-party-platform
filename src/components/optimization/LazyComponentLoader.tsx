'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

interface LazyComponentLoaderProps {
  componentPath: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  loadingDelay?: number;
}

// Generic error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50 text-red-700">
      <h3 className="font-medium mb-2">Component failed to load</h3>
      <p className="text-sm mb-2">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="text-sm bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
      >
        Try again
      </button>
    </div>
  );
}

// Default loading component
function DefaultLoading() {
  return (
    <div className="animate-pulse p-4">
      <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
    </div>
  );
}

/**
 * LazyComponentLoader - Dynamically loads components with error boundaries and suspense
 * 
 * Features:
 * - Code splitting at component level
 * - Error boundaries for graceful degradation
 * - Customizable loading states
 * - Performance tracking
 */
export default function LazyComponentLoader({
  componentPath,
  fallback = <DefaultLoading />,
  errorFallback,
  loadingDelay = 200
}: LazyComponentLoaderProps) {
  // Create lazy component with performance tracking
  const LazyComponent = lazy(async () => {
    const start = performance.now();
    
    try {
      const module = await import(componentPath);
      const loadTime = performance.now() - start;
      
      // Track component loading performance
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'lazy_component_load', {
          component_path: componentPath,
          load_time: loadTime,
          event_category: 'performance'
        });
      }
      
      return module;
    } catch (error) {
      console.error(`Failed to load component: ${componentPath}`, error);
      throw error;
    }
  });

  return (
    <ErrorBoundary
      FallbackComponent={errorFallback ? () => <>{errorFallback}</> : ErrorFallback}
      onError={(error) => {
        console.error(`Error in lazy component: ${componentPath}`, error);
        
        // Track errors for monitoring
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'lazy_component_error', {
            component_path: componentPath,
            error_message: error.message,
            event_category: 'error'
          });
        }
      }}
    >
      <Suspense fallback={fallback}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}

// Pre-built lazy loaders for common components
export const LazyDreamMap = () => (
  <LazyComponentLoader
    componentPath="@/components/map/DreamMap"
    fallback={
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    }
  />
);

export const LazyGrowthChart = () => (
  <LazyComponentLoader
    componentPath="@/components/dashboard/GrowthChart"
    fallback={
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading chart...</p>
        </div>
      </div>
    }
  />
);

export const LazyInterviewMode = () => (
  <LazyComponentLoader
    componentPath="@/components/interview/QuickDreamForm"
    fallback={
      <div className="w-full p-8 bg-gray-50 rounded-lg text-center">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 rounded h-6 w-3/4 mx-auto"></div>
          <div className="bg-gray-200 rounded h-4 w-1/2 mx-auto"></div>
          <div className="bg-gray-200 rounded h-10 w-full"></div>
        </div>
      </div>
    }
  />
);

// Utility to preload components
export const preloadComponent = (componentPath: string) => {
  return import(componentPath);
};

// Preload critical components on user interaction
export const preloadCriticalComponents = () => {
  const componentsToPreload = [
    '@/components/map/DreamMap',
    '@/components/dashboard/GrowthChart',
    '@/components/interview/QuickDreamForm'
  ];

  componentsToPreload.forEach((path) => {
    // Preload on user interaction
    const preload = () => preloadComponent(path);
    
    document.addEventListener('mouseenter', preload, { once: true });
    document.addEventListener('focus', preload, { once: true });
    document.addEventListener('scroll', preload, { once: true });
  });
};