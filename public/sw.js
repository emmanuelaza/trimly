self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {}
  const title = data.title || 'Trimly'
  const options = {
    body: data.body || '',
    icon: '/logo-icon.png',
    badge: '/logo-icon.png',
    tag: data.tag || 'trimly',
    data: { url: data.url || '/' },
    renotify: true,
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) { c.focus(); return }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
