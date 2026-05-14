self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e =>
  e.waitUntil(clients.claim()))

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
