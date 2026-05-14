self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(clients.claim()))

self.addEventListener('push', e => {
  const data = e.data?.json() || {}
  const title = data.title || '¡Nueva cita!'
  const options = {
    body: data.body || 'Tienes una nueva reserva',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || '/dashboard/agenda' },
    tag: 'nueva-cita',
    renotify: true,
    requireInteraction: false,
  }

  e.waitUntil(
    Promise.all([
      self.registration.showNotification(title, options),
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
        cls.forEach(c => c.postMessage({ type: 'PUSH_RECEIVED' }))
      }),
    ])
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/dashboard/agenda'
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
