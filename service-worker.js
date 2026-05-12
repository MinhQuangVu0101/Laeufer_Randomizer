// Phase 0a Pre-Cutover SW: clears caches, unregisters itself, reloads clients.
// 24h+ live before Vite/workbox SW deploys. See design doc Sprint 1 Phase 0a.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
