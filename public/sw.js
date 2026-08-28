const SW_VERSION = 'hc-pwa-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  let payload = {};

  try {
    payload = event.data?.json() || {};
  } catch {
    payload = { body: event.data?.text() };
  }

  const title = payload.title || 'Hogar Conectado';
  const options = {
    body: payload.body || 'Tenés una consulta por responder.',
    icon: '/pwa-icon.svg',
    badge: '/pwa-icon.svg',
    tag: payload.tag || SW_VERSION,
    renotify: true,
    data: {
      url: payload.url || '/consultas',
      ...(payload.data || {})
    }
  };

  event.waitUntil(Promise.all([
    self.registration.showNotification(title, options),
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
      windows.forEach(client => client.postMessage({ type: 'HC_CONSULTA_NUEVA' }));
    })
  ]));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const destination = new URL(event.notification.data?.url || '/consultas', self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find(client => client.url.startsWith(self.location.origin));

    if (existing) {
      await existing.navigate(destination);
      return existing.focus();
    }

    return self.clients.openWindow(destination);
  })());
});
