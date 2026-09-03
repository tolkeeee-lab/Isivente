// Isivente PWA Service Worker
const CACHE_NAME = "isivente-cache-v1";
const OFFLINE_URLS = [
  "/admin",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache clone if valid network response
        if (response && response.status === 200 && response.type === "basic") {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.mode === "navigate") {
            return caches.match("/admin");
          }
        });
      })
  );
});

// Écouteur de clic sur la notification mobile pour ouvrir le dashboard
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes("/admin") && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/admin");
      }
    })
  );
});

// Écouteur d'affichage de notification depuis le Service Worker
self.addEventListener("push", (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || "🎉 Nouvelle Commande Isivente !";
      const options = {
        body: data.body || "Vous avez reçu une nouvelle commande.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        vibrate: [200, 100, 200, 100, 200],
        tag: "order_" + Date.now(),
        data: { url: "/admin" }
      };
      event.waitUntil(self.registration.showNotification(title, options));
    } catch {}
  }
});
