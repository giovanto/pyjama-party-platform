'use client';

import dynamic from 'next/dynamic';

// Client-side dynamic imports with ssr: false
const WebVitalsReporter = dynamic(() => import('./WebVitalsReporter'), {
  ssr: false,
});

const PerformanceMonitor = dynamic(() => 
  import('./WebVitalsReporter').then(mod => ({ default: mod.PerformanceMonitor })), {
  ssr: false,
});

export default function ClientPerformanceWrapper() {
  return (
    <>
      <WebVitalsReporter />
      <PerformanceMonitor />
    </>
  );
}