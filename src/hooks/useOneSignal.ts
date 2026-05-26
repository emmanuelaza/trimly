'use client'

import { useEffect } from 'react'

export function useOneSignal(externalId?: string) {
  useEffect(() => {
    if (!externalId) return
    if (typeof window === 'undefined') return

    const init = async () => {
      const OneSignal = (window as any).OneSignal
      if (!OneSignal) return
      await OneSignal.login(externalId)
    }

    if ((window as any).OneSignalDeferred) {
      (window as any).OneSignalDeferred.push(init)
    }
  }, [externalId])

  async function requestPermission() {
    const OneSignal = (window as any).OneSignal
    if (!OneSignal) return false
    await OneSignal.Slidedown.promptPush()
    const permission = await OneSignal.Notifications.permission
    return permission
  }

  return { requestPermission }
}
