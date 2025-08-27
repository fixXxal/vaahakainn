// Service Worker for VAAHAKAINN
// Provides offline functionality and caching for better performance

const CACHE_NAME = 'vaahakainn-v1.0.0';
const urlsToCache = [
  '/',
  '/static/styles.css',
  '/static/enhanced-interactions.js',
  '/static/fonts/faruma.css',
  '/static/logovhk.PNG',
  '/static/manifest.json'
];

// Install event - cache essential resources
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('VAAHAKAINN: Caching essential resources');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('VAAHAKAINN: Service Worker installed successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('VAAHAKAINN: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('VAAHAKAINN: Service Worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', function(event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Return cached version if available
        if (response) {
          console.log('VAAHAKAINN: Serving from cache:', event.request.url);
          return response;
        }

        // Otherwise, fetch from network
        return fetch(event.request).then(function(response) {
          // Don't cache if not successful
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          // Cache dynamic content
          caches.open(CACHE_NAME)
            .then(function(cache) {
              // Only cache specific file types
              const url = event.request.url;
              if (url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/i) ||
                  url.endsWith('/') ||
                  url.includes('/stories/') ||
                  url.includes('/episodes/')) {
                console.log('VAAHAKAINN: Caching new resource:', url);
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(function(error) {
          console.log('VAAHAKAINN: Network request failed:', error);
          
          // Return offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/').then(function(response) {
              return response || new Response(
                `<!DOCTYPE html>
                <html lang="ar" dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>VAAHAKAINN - Offline</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background: linear-gradient(135deg, #f8e8f0, #e8d1dc);
                            color: white;
                            text-align: center;
                            padding: 2em;
                            margin: 0;
                            min-height: 100vh;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-direction: column;
                        }
                        .offline-content {
                            background: rgba(255,255,255,0.1);
                            padding: 3em;
                            border-radius: 20px;
                            max-width: 500px;
                        }
                        .offline-icon {
                            font-size: 4em;
                            margin-bottom: 1em;
                            animation: bounce 2s infinite;
                        }
                        @keyframes bounce {
                            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
                            40% { transform: translateY(-10px); }
                            60% { transform: translateY(-5px); }
                        }
                        .retry-btn {
                            background: #e8d1dc;
                            color: #1a1a1a;
                            padding: 1em 2em;
                            border: none;
                            border-radius: 25px;
                            font-size: 1em;
                            font-weight: bold;
                            cursor: pointer;
                            margin-top: 2em;
                            transition: all 0.3s ease;
                        }
                        .retry-btn:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 15px rgba(218, 165, 32, 0.3);
                        }
                    </style>
                </head>
                <body>
                    <div class="offline-content">
                        <div class="offline-icon">📚</div>
                        <h1>VAAHAKAINN</h1>
                        <h2>You're Offline</h2>
                        <p>It seems you're not connected to the internet right now. Please check your connection and try again.</p>
                        <button class="retry-btn" onclick="window.location.reload()">
                            🔄 Try Again
                        </button>
                    </div>
                </body>
                </html>`,
                {
                  headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                  }
                }
              );
            });
          }
          
          // For other requests, try to return cached version or a simple error
          return caches.match(event.request) || new Response('Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('VAAHAKAINN: Background sync triggered');
    event.waitUntil(
      // Perform background sync tasks
      updateCachedContent()
    );
  }
});

// Push notification support (for future features)
self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    console.log('VAAHAKAINN: Push notification received:', data);
    
    const options = {
      body: data.body || 'New story available now!',
      icon: '/static/logovhk.PNG',
      badge: '/static/logovhk.PNG',
      data: data,
      actions: [
        {
          action: 'open',
          title: 'Open',
          icon: '/static/logovhk.PNG'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'VAAHAKAINN', options)
    );
  }
});

// Notification click handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Helper function to update cached content
async function updateCachedContent() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Update each cached resource
    const updatePromises = requests.map(async (request) => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
          console.log('VAAHAKAINN: Updated cached resource:', request.url);
        }
      } catch (error) {
        console.log('VAAHAKAINN: Failed to update cached resource:', request.url, error);
      }
    });

    await Promise.all(updatePromises);
    console.log('VAAHAKAINN: Cache update completed');
  } catch (error) {
    console.error('VAAHAKAINN: Cache update failed:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('VAAHAKAINN: Skip waiting requested');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    getCacheSize().then(size => {
      event.ports[0].postMessage({
        type: 'CACHE_SIZE',
        size: size
      });
    });
  }
});

// Helper function to get cache size
async function getCacheSize() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    let totalSize = 0;
    
    for (const request of requests) {
      try {
        const response = await cache.match(request);
        if (response) {
          const blob = await response.blob();
          totalSize += blob.size;
        }
      } catch (error) {
        console.log('VAAHAKAINN: Error calculating cache size for:', request.url);
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('VAAHAKAINN: Error getting cache size:', error);
    return 0;
  }
}