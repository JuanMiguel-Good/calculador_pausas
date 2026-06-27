self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'Pausa laboral', {
      body: data.body || 'Es hora de tu pausa activa',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: data.tag || 'break-notification',
      requireInteraction: true,
      data: { url: data.url || '/#/worker' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/#/worker';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if ('focus' in w) return w.focus();
      }
      return clients.openWindow(target);
    })
  );
});
