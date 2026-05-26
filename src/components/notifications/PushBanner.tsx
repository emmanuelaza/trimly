'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'

interface Props {
  userId: string
}

export function PushBanner({ userId }: Props) {
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const dismissed = localStorage.getItem(`os_banner_${userId}`)
    if (dismissed) return

    const checkPermission = async () => {
      if (!('Notification' in window)) return
      if (Notification.permission === 'default') {
        setShow(true)
      }
    }
    checkPermission()
  }, [userId])

  if (!show) return null

  async function activate() {
    setLoading(true)
    try {
      const OneSignal = (window as any).OneSignal
      if (OneSignal) {
        await OneSignal.login(userId)
        await OneSignal.Slidedown.promptPush()
        await OneSignal.User.addTag('role', 'owner')
      }
      localStorage.setItem(`os_banner_${userId}`, '1')
      setShow(false)
    } catch (err) {
      console.error('OneSignal error:', err)
    } finally {
      setLoading(false)
    }
  }

  function dismiss() {
    localStorage.setItem(`os_banner_${userId}`, '1')
    setShow(false)
  }

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 mb-4 bg-primary/8 border border-primary/20 rounded-xl">
      <div className="flex items-center gap-3">
        <Bell size={18} className="text-primary flex-shrink-0" />
        <p className="text-sm font-medium text-text-primary">
          Activa las notificaciones para saber al instante cuando llegue una cita 🔔
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={activate}
          disabled={loading}
          className="px-3 py-1.5 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors"
        >
          {loading ? 'Activando...' : 'Activar'}
        </button>
        <button onClick={dismiss} className="text-text-muted p-1 rounded hover:text-text-primary">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
