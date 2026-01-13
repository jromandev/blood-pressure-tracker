const CACHE_NAME = 'hearthpulse-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-HTTP(S) requests (chrome-extension, etc.)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Skip WebSocket and other special requests
  if (event.request.url.includes('ws://') || event.request.url.includes('wss://')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Only cache GET requests
          if (event.request.method !== 'GET') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((err) => {
              // Silently fail cache write errors
              console.log('Cache write failed:', err);
            });

          return response;
        }).catch((error) => {
          // Network error - return a basic error response
          console.log('Fetch failed:', error);
          throw error;
        });
      })
  );
});
