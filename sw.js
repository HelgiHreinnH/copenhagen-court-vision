/**
 * Copenhagen Court Vision - Service Worker
 * Provides offline functionality and PWA features
 */

const CACHE_NAME = 'copenhagen-court-vision-v1.0.0';
const OFFLINE_PAGE = '/offline.html';

// Files to cache for offline functionality
const STATIC_CACHE_FILES = [
    '/',
    '/index.html',
    '/ar-experience.html',
    '/manifest.json',
    
    // Stylesheets
    '/css/main.css',
    '/css/ar-overlay.css',
    '/css/mobile-responsive.css',
    '/css/copenhagen-theme.css',
    
    // JavaScript files
    '/js/ar-manager.js',
    '/js/qr-detector.js',
    '/js/court-model.js',
    '/js/analytics.js',
    '/js/feedback.js',
    '/js/utils.js',
    
    // Critical external libraries
    'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js',
    
    // Assets (icons, images)
    '/assets/icons/android-chrome-192x192.png',
    '/assets/icons/android-chrome-512x512.png',
    '/assets/icons/apple-touch-icon.png',
    '/assets/icons/favicon-32x32.png',
    '/assets/icons/favicon-16x16.png',
    
    // Tools
    '/tools/qr-generator.html',
    '/tools/debug-dashboard.html'
];

// Files that should be network-first (always try to fetch fresh)
const NETWORK_FIRST_URLS = [
    '/ar-experience.html',
    '/tools/debug-dashboard.html'
];

// Files that should be cached but updated in background
const STALE_WHILE_REVALIDATE_URLS = [
    '/assets/models/sonder_court.glb',
    '/assets/images/'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Service Worker: Caching static files');
                return cache.addAll(STATIC_CACHE_FILES.map(url => {
                    // Handle external URLs
                    if (url.startsWith('http')) {
                        return new Request(url, { mode: 'cors' });
                    }
                    return url;
                }));
            })
            .then(() => {
                console.log('✅ Service Worker: Installation complete');
                // Force activation of new service worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('🔧 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete old caches
                        if (cacheName !== CACHE_NAME) {
                            console.log('🗑️ Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activation complete');
                // Take control of all clients immediately
                return self.clients.claim();
            })
    );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Skip analytics and tracking requests
    if (url.hostname.includes('google-analytics.com') || 
        url.hostname.includes('googletagmanager.com')) {
        return;
    }
    
    event.respondWith(
        handleFetchRequest(request)
    );
});

async function handleFetchRequest(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // Strategy 1: Network First (for critical dynamic content)
        if (NETWORK_FIRST_URLS.some(pattern => pathname.includes(pattern))) {
            return await networkFirst(request);
        }
        
        // Strategy 2: Stale While Revalidate (for assets that can be updated)
        if (STALE_WHILE_REVALIDATE_URLS.some(pattern => pathname.includes(pattern))) {
            return await staleWhileRevalidate(request);
        }
        
        // Strategy 3: Cache First (for static assets)
        return await cacheFirst(request);
        
    } catch (error) {
        console.error('Service Worker: Fetch failed', error);
        return await handleFetchError(request, error);
    }
}

// Network First strategy
async function networkFirst(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
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

// Cache First strategy
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Return cached version immediately
        return cachedResponse;
    }
    
    // Fetch from network and cache
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    // Update cache in background
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    });
    
    // Return cached version immediately if available
    return cachedResponse || fetchPromise;
}

// Handle fetch errors
async function handleFetchError(request, error) {
    const url = new URL(request.url);
    
    // For HTML requests, return offline page
    if (request.headers.get('accept')?.includes('text/html')) {
        const offlineResponse = await caches.match(OFFLINE_PAGE);
        if (offlineResponse) {
            return offlineResponse;
        }
        
        // Create basic offline response if offline page not cached
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offline - Copenhagen Court Vision</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { 
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        min-height: 100vh; 
                        margin: 0; 
                        background: #f5f5f5;
                        text-align: center;
                        padding: 20px;
                    }
                    .offline-content {
                        background: white;
                        padding: 40px;
                        border-radius: 12px;
                        box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                        max-width: 400px;
                    }
                    .offline-icon {
                        font-size: 4rem;
                        margin-bottom: 20px;
                    }
                    h1 { color: #0066CC; margin-bottom: 16px; }
                    p { color: #757575; line-height: 1.6; }
                    button {
                        background: #0066CC;
                        color: white;
                        border: none;
                        padding: 12px 24px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 16px;
                        font-weight: 600;
                        margin-top: 20px;
                    }
                    button:hover { background: #004499; }
                </style>
            </head>
            <body>
                <div class="offline-content">
                    <div class="offline-icon">📱</div>
                    <h1>You're Offline</h1>
                    <p>Copenhagen Court Vision requires an internet connection for the AR experience. Please check your connection and try again.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                </div>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    // For other requests, return a basic error response
    return new Response('Network error', { 
        status: 408,
        statusText: 'Network error'
    });
}

// Background sync for analytics
self.addEventListener('sync', (event) => {
    if (event.tag === 'analytics-sync') {
        event.waitUntil(syncAnalytics());
    }
});

async function syncAnalytics() {
    try {
        console.log('🔄 Service Worker: Syncing analytics data...');
        
        // In a real implementation, this would sync with a backend
        // For now, we'll just log the attempt
        const analyticsData = await getStoredAnalytics();
        
        if (analyticsData && analyticsData.length > 0) {
            console.log(`📊 Service Worker: Found ${analyticsData.length} analytics events to sync`);
            
            // Here you would send the data to your analytics endpoint
            // await sendAnalyticsToServer(analyticsData);
            
            console.log('✅ Service Worker: Analytics sync complete');
        }
    } catch (error) {
        console.error('❌ Service Worker: Analytics sync failed', error);
    }
}

async function getStoredAnalytics() {
    // This would typically read from IndexedDB or localStorage
    // Return empty array for now
    return [];
}

// Push notification handling (for future features)
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/assets/icons/android-chrome-192x192.png',
        badge: '/assets/icons/android-chrome-192x192.png',
        tag: 'copenhagen-court-vision',
        requireInteraction: true,
        data: {
            url: data.url || '/'
        }
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const url = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Check if there's already a window open
            for (const client of clientList) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

// Periodic background sync (for analytics cleanup)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'analytics-cleanup') {
        event.waitUntil(cleanupOldAnalytics());
    }
});

async function cleanupOldAnalytics() {
    try {
        console.log('🧹 Service Worker: Cleaning up old analytics data...');
        
        // This would clean up old analytics data to prevent storage bloat
        // Implementation would depend on your storage strategy
        
        console.log('✅ Service Worker: Analytics cleanup complete');
    } catch (error) {
        console.error('❌ Service Worker: Analytics cleanup failed', error);
    }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
    const { action, data } = event.data;
    
    switch (action) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_NAME });
            break;
            
        case 'CACHE_ANALYTICS':
            cacheAnalyticsData(data);
            break;
            
        case 'FORCE_UPDATE':
            forceUpdate();
            break;
            
        default:
            console.log('Service Worker: Unknown message action', action);
    }
});

async function cacheAnalyticsData(data) {
    try {
        // Store analytics data for later sync
        console.log('📊 Service Worker: Caching analytics data');
        
        // In a real implementation, you might store this in IndexedDB
        // For now, we'll just acknowledge the request
        
    } catch (error) {
        console.error('Service Worker: Failed to cache analytics', error);
    }
}

async function forceUpdate() {
    try {
        console.log('🔄 Service Worker: Forcing cache update...');
        
        // Clear current cache
        await caches.delete(CACHE_NAME);
        
        // Re-cache static files
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(STATIC_CACHE_FILES);
        
        console.log('✅ Service Worker: Cache update complete');
        
        // Notify all clients of the update
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ action: 'CACHE_UPDATED' });
        });
        
    } catch (error) {
        console.error('Service Worker: Force update failed', error);
    }
}

// Error handling
self.addEventListener('error', (event) => {
    console.error('Service Worker: Global error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Unhandled promise rejection', event.reason);
});

// Logging for debugging
console.log('🔧 Service Worker: Registered and ready');

// Send ready message to clients
self.clients.matchAll().then(clients => {
    clients.forEach(client => {
        client.postMessage({ 
            action: 'SW_READY', 
            version: CACHE_NAME 
        });
    });
});