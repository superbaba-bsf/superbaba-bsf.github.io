// Super Baba: minimal service worker so the site installs as an app.
// Network first for pages and files; cached copy only when offline. Never touches API calls.
const CACHE = 'sb-shell-v4';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-store' }).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('/')))
  );
});

// Web Push: review request after delivery.
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) {}
  const title = d.title || 'سوبر بابا';
  e.waitUntil(self.registration.showNotification(title, {
    body: d.body || '',
    icon: '/assets/hero.png',
    badge: '/assets/hero.png',
    tag: d.tag || 'sb-review',
    renotify: true,
    requireInteraction: !!d.sticky,
    lang: 'ar',
    dir: 'rtl',
    vibrate: [200, 100, 200, 100, 300],
    data: { url: d.url || '/' }
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || '/', self.location.origin).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if (c.url === url && 'focus' in c) return c.focus();
      if (c.url.startsWith(self.location.origin) && 'navigate' in c) return c.navigate(url).then(x => (x || c).focus());
    }
    return clients.openWindow(url);
  }));
});
