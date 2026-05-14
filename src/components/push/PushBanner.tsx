'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'
import { usePushNotifications } from '@/hooks/usePushNotifications'

interface PushBannerProps {
  barbershopId: string
  userId: string
}

export function PushBanner({ barbershopId, userId }: PushBannerProps) {
  const { status, subscribe } = usePushNotifications(barbershopId, userId)
  const [dismissed, setDismissed] = useState(false)
  const [loading, setLoading] = useState(false)
  const audioCtx = useRef<AudioContext | null>(null)

  // Listen for push messages from SW and play sound
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'PUSH_RECEIVED') playSound()
    }

    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [])

  // Re-register SW on mount so it's always active
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  function playSound() {
    try {
      if (!audioCtx.current) audioCtx.current = new AudioContext()
      const ctx = audioCtx.current
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  async function handleEnable() {
    setLoading(true)
    await subscribe()
    setLoading(false)
  }

  if (dismissed || status === 'denied' || status === 'unsupported' || status === 'granted') {
    return null
  }

  return (
    <div className="flex items-center gap-3 bg-primary/10 border border-primary/25 rounded-xl px-4 py-3 mx-4 mt-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/15 flex-shrink-0">
        <Bell size={14} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary">Activa las notificaciones</p>
        <p className="text-[11px] text-text-muted">Recibe alertas cuando lleguen nuevas citas</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleEnable}
          disabled={loading}
          className="text-[11px] font-bold bg-primary text-text-inverse px-3 py-1.5 rounded-lg hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {loading ? '...' : 'Activar'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-text-muted hover:text-text-secondary p-1 rounded transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
