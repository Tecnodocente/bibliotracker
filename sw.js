/**
 * ==============================================================================
 * BIBLIOTRACKER IES - Service Worker V3.3.0 (Watchdog & Network-First)
 * ==============================================================================
 * Estrategia Network-First con soporte para Guardián de red y comprobación de versión.
 */

const CACHE_NAME = 'bibliotracker-v3.3.0';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon.svg'
];

// Instalación: forzar activación inmediata con skipWaiting
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-cacheados los assets estáticos esenciales v3.3.0');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activación: eliminar cachés anteriores y tomar el control de clientes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando versión de caché antigua:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Tomando el control de todos los clientes activos v3.3.0');
      return self.clients.claim();
    })
  );
});

// Mensajes desde la ventana del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Fetch con estrategia Network-First (Red primero, caché de respaldo offline)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Exclusiones estrictas: version.json, Google Apps Script, APIs externas nunca se cachean
  if (url.includes('version.json') || url.includes('script.google.com') || url.includes('googleapis.com') || url.includes('openlibrary.org')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-store' }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Estrategia Network-First para assets de la aplicación (HTML, CSS, JS, imágenes locales)
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // En caso de fallo de red o modo offline, recurrir a la caché
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === 'navigate' || event.request.destination === 'document') {
            return caches.match('./index.html');
          }
          return new Response('Contenido no disponible sin conexión', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
          });
        });
      })
  );
});
