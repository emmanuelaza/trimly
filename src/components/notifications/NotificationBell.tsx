'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface Notif {
  id: string
  titulo: string
  cuerpo: string
  tipo: string
  created_at: string
}

export function NotificationBell({ barbershopId }: { barbershopId?: string }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [lastRead, setLastRead] = useState('')

  useEffect(() => {
    setLastRead(localStorage.getItem(`notif_read_${barbershopId}`) || '')
  }, [barbershopId])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'PUSH_RECEIVED') {
        const n: Notif = {
          id: Date.now().toString(),
          titulo: e.data.payload.title,
          cuerpo: e.data.payload.body,
          tipo: e.data.payload.tag || 'general',
          created_at: new Date().toISOString(),
        }
        setNotifs(prev => [n, ...prev].slice(0, 20))
        playChime()
      }
    }
    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  }, [])

  useEffect(() => {
    if (!barbershopId) return

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    supabase
      .from('notification_log')
      .select('id, titulo, cuerpo, tipo, created_at')
      .eq('barbershop_id', barbershopId)
      .eq('enviada', true)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setNotifs(data) })

    const channel = supabase
      .channel(`notif_bell_${barbershopId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notification_log',
        filter: `barbershop_id=eq.${barbershopId}`,
      }, (payload) => {
        setNotifs(prev => [payload.new as Notif, ...prev].slice(0, 20))
        playChime()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [barbershopId])

  function playChime() {
    try {
      const ctx = new AudioContext()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.4, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  const unread = notifs.filter(n => n.created_at > lastRead).length

  function handleOpen() {
    const next = !open
    setOpen(next)
    if (next) {
      const now = new Date().toISOString()
      setLastRead(now)
      localStorage.setItem(`notif_read_${barbershopId}`, now)
    }
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'ahora'
    if (mins < 60) return `hace ${mins}m`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `hace ${hrs}h`
    return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-background-3 text-text-secondary hover:text-text-primary transition-colors"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-primary rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5 leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 bg-background-2 border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="font-semibold text-sm text-text-primary">Notificaciones</span>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={14} />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
              {notifs.length === 0 ? (
                <p className="text-sm text-text-muted text-center py-10">Sin notificaciones aún</p>
              ) : (
                notifs.map(n => (
                  <div key={n.id} className="px-4 py-3 hover:bg-background-3 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-text-primary leading-snug">{n.titulo}</p>
                      <span className="text-[10px] text-text-muted whitespace-nowrap mt-0.5">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="text-xs text-text-muted mt-0.5">{n.cuerpo}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
