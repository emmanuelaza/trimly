'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export type PushStatus = 'unsupported' | 'denied' | 'granted' | 'default'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

export function usePushNotifications(barbershopId?: string, userId?: string) {
  const [status, setStatus] = useState<PushStatus>('default')

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported')
      return
    }
    setStatus(Notification.permission as PushStatus)
  }, [])

  async function subscribe(): Promise<boolean> {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return false
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })

      const subJson = sub.toJSON()
      const supabase = getSupabase()

      await supabase.from('push_subscriptions').upsert(
        {
          user_id: userId,
          barbershop_id: barbershopId,
          endpoint: subJson.endpoint,
          keys_p256dh: subJson.keys?.p256dh,
          keys_auth: subJson.keys?.auth,
          notif_nueva_cita: true,
          notif_cancelacion: true,
        },
        { onConflict: 'user_id,endpoint' }
      )

      setStatus('granted')
      return true
    } catch (err) {
      console.error('Push subscription error:', err)
      return false
    }
  }

  async function unsubscribe(): Promise<void> {
    const reg = await navigator.serviceWorker.getRegistration()
    const sub = await reg?.pushManager.getSubscription()
    if (sub) {
      await sub.unsubscribe()
      const supabase = getSupabase()
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId ?? '')
        .eq('endpoint', sub.endpoint)
    }
    setStatus('default')
  }

  return { status, subscribe, unsubscribe }
}
