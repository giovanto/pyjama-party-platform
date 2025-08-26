// Service Worker for Pajama Party Platform
// Handles caching for performance optimization

const CACHE_NAME = 'pajama-party-v1.0.0';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/assets/bot-logo.svg',
];

// API endpoints to cache with strategy
const API_ENDPOINTS = [
  '/api/dreams',
  '/api/stats',
  '/api/impact',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    try {
      const staticCache = await caches.open(STATIC_CACHE);
      // Add assets individually; skip any that 404 to avoid install failure
      await Promise.all(
        STATIC_ASSETS.map(async (url) => {
          try {
            const resp = await fetch(url, { cache: 'no-cache' });
            if (resp && resp.ok) {
              await staticCache.put(url, resp.clone());
            }
          } catch (e) {
            // Ignore missing assets in development
          }
        })
      );
      await caches.open(API_CACHE);
    } finally {
      self.skipWaiting();
    }
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/offline');
      })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  if (request.destination === 'image' || 
      request.destination === 'script' || 
      request.destination === 'style' ||
      url.pathname.includes('_next/static')) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Default strategy for other requests
  event.respondWith(fetch(request));
});

// Network-first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Only cache successful GET requests
    if (request.method === 'GET' && networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(networkResponse => {
      if (networkResponse.status === 200) {
        caches.open(STATIC_CACHE).then(cache => {
          cache.put(request, networkResponse);
        });
      }
    });
    return cachedResponse;
  }

  // Not in cache, fetch from network
  const networkResponse = await fetch(request);
  
  if (networkResponse.status === 200) {
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Background sync for form submissions when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'dream-submission') {
    event.waitUntil(processPendingSubmissions());
  }
});

async function processPendingSubmissions() {
  // This would handle offline form submissions
  // Implementation would depend on IndexedDB storage
  console.log('Processing pending dream submissions...');
}

// Handle push notifications for event updates
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/assets/bot-logo.svg',
    data: data.data,
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
