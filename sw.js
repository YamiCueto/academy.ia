/* ===================================
   SERVICE WORKER - Cache y Offline
   =================================== */

const CACHE_NAME = 'academia-ia-v1.0.0';
const CACHE_ASSETS = [
    '/',
    '/index.html',
    '/assets/css/main.css',
    '/assets/css/layout.css',
    '/assets/css/components.css',
    '/assets/css/responsive.css',
    '/assets/css/accessibility.css',
    '/assets/js/app.js',
    '/manifest.json'
];

// Install event - Cache assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching assets');
                return cache.addAll(CACHE_ASSETS);
            })
            .catch(err => {
                console.log('Service Worker: Error caching assets', err);
            })
    );
});

// Activate event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Clearing old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event - Serve from cache when offline
self.addEventListener('fetch', (event) => {
    console.log('Service Worker: Fetching', event.request.url);
    
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                return response || fetch(event.request)
                    .catch(() => {
                        // If offline and no cache, return offline page
                        if (event.request.destination === 'document') {
                            return caches.match('/');
                        }
                    });
            })
    );
});

// Message event - Update cache when requested
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});