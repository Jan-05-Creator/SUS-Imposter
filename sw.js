// Service Worker Version
const CACHE_NAME = 'sus-imposter-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.webmanifest'
];

// Installation
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                self.skipWaiting();
            })
            .catch((err) => {
                console.error('Cache installation fehler:', err);
            })
    );
});

// Aktivierung
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            self.clients.claim();
        })
    );
});

// Fetch - Cache-First Strategie
self.addEventListener('fetch', (event) => {
    // Nur GET-Anfragen cachen
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Wenn im Cache gefunden, retournieren
                if (response) {
                    return response;
                }

                // Sonst vom Netz laden und cachen
                return fetch(event.request)
                    .then((response) => {
                        // Nur erfolgreiche Responses cachen
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Response klonen, da es nur einmal konsumiert werden kann
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // Bei Fehler aus Cache laden, falls vorhanden
                        return caches.match(event.request)
                            .then((response) => {
                                if (response) {
                                    return response;
                                }
                                // Fallback: Generische Offline-Seite oder Fehler
                                throw new Error('Offline und nicht im Cache verfügbar');
                            });
                    });
            })
    );
});

// Background Sync (optional, für zukünftige Funktionen)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        event.waitUntil(
            // Hier könnten zukünftig Daten synchronisiert werden
            Promise.resolve()
        );
    }
});

// Push Notifications (optional, für zukünftige Funktionen)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Neue Benachrichtigung',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect fill="%236200ea" width="192" height="192"/><text x="50%" y="50%" font-size="120" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">SUS</text></svg>'
    };

    event.waitUntil(
        self.registration.showNotification('SUS-Imposter', options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            // Wenn Fenster offen, fokussieren
            for (let client of clientList) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Sonst neue Seite öffnen
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});
