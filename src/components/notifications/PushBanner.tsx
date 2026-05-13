'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

interface Props {
  barbershopId: string
  userId: string
}

export function PushBanner({ barbershopId, userId }: Props) {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    if (Notification.permission !== 'default') return
    const dismissed = localStorage.getItem(`push_banner_${userId}`)
    if (!dismissed) setShow(true)
  }, [userId])

  if (!show) return null

  async function activate() {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setShow(false)
        return
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) {
        console.error('VAPID key not found')
        return
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          barbershopId,
          userId,
        }),
      })

      setShow(false)
      new Notification('¡Notificaciones activadas! 🔔', {
        body: 'Te avisaremos cuando llegue una cita nueva',
        icon: '/logo-icon.png',
      })
    } catch (err) {
      console.error('Error activando push:', err)
    } finally {
      setLoading(false)
    }
  }

  function dismiss() {
    localStorage.setItem(`push_banner_${userId}`, '1')
    setShow(false)
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 mb-4 bg-primary/8 border border-primary/20 rounded-xl">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/milo.png" alt="Milo" className="w-7 h-7 flex-shrink-0" />
        <p className="text-sm text-text-primary">
          <span className="font-semibold">¿Quieres saber al instante cuando llegue una cita? 🔔</span>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={activate}
          disabled={loading}
          className="px-3 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Activando...' : 'Activar'}
        </button>
        <button
          onClick={dismiss}
          className="text-text-muted hover:text-text-primary transition-colors p-1 rounded"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buf = new ArrayBuffer(rawData.length)
  const view = new Uint8Array(buf)
  for (let i = 0; i < rawData.length; i++) view[i] = rawData.charCodeAt(i)
  return buf
}
