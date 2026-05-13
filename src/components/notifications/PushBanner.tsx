'use client'

import { useState, useEffect } from 'react'
import { usePushNotifications } from '@/hooks/usePushNotifications'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'

interface Props {
  barbershopId: string
  userId: string
}

export function PushBanner({ barbershopId, userId }: Props) {
  const [dismissed, setDismissed] = useState(true)
  const { status, subscribe } = usePushNotifications(barbershopId, userId)

  useEffect(() => {
    const key = `push_dismissed_${userId}`
    const wasDismissed = localStorage.getItem(key)
    if (!wasDismissed && status === 'default') {
      setDismissed(false)
    }
  }, [status, userId])

  if (dismissed || status === 'granted' || status === 'denied' || status === 'unsupported') {
    return null
  }

  function dismiss() {
    localStorage.setItem(`push_dismissed_${userId}`, '1')
    setDismissed(true)
  }

  async function handleSubscribe() {
    const ok = await subscribe()
    if (ok) dismiss()
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
        <Button size="sm" onClick={handleSubscribe}>
          Activar
        </Button>
        <button
          onClick={dismiss}
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
