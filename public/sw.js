self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e =>
  e.waitUntil(clients.claim()))

self.addEventListener('push', e => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo-icon.png',
      badge: '/logo-icon.png',
      vibrate: [100, 50, 100],
      tag: data.tag || 'trimly',
      renotify: true,
      data: { url: data.url || '/dashboard' }
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/dashboard'
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client)
          return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
