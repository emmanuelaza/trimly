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
    const stored = localStorage.getItem('trimly_barber_session')

    if (!stored) {
      setLoading(false)
      setSession(null)
      return
    }

    try {
      const parsed: BarberSession = JSON.parse(stored)

      // Verificar si la sesión expiró
      const now = new Date()
      const expires = new Date(parsed.expiresAt)

      if (now > expires) {
        localStorage.removeItem('trimly_barber_session')
        setSession(null)
        setLoading(false)
        return
      }

      setSession(parsed)
      setLoading(false)
    } catch (error) {
      console.error("Error parsing barber session:", error);
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
