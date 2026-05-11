'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface BarberSession {
  barberId: string
  barbershopId: string
  barberName: string
  token: string
  expiresAt: string
}

export function useBarberSession() {
  const router = useRouter()
  const [session, setSession] = useState<BarberSession | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('trimly_barber_session')

      if (!stored) {
        setSession(null)
        setLoading(false)
        return
      }

      const parsed: BarberSession = JSON.parse(stored)

      if (parsed.expiresAt) {
        const now = new Date()
        const expires = new Date(parsed.expiresAt)
        if (now > expires) {
          localStorage.removeItem('trimly_barber_session')
          setSession(null)
          setLoading(false)
          return
        }
      }

      setSession(parsed)
      setLoading(false)
    } catch (error) {
      console.error('Error reading barber session:', error)
      localStorage.removeItem('trimly_barber_session')
      setSession(null)
      setLoading(false)
    }
  }, [])

  const logout = () => {
    localStorage.removeItem('trimly_barber_session')
    router.push('/')
  }

  return { session, loading, logout }
}
