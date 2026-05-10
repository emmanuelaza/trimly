'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import miloImg from '@/assets/milo.png'

export default function BarberAccessPage() {
  const { token } = useParams()
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState<'loading'|'valid'|'invalid'|'expired'>('loading')
  const [barberName, setBarberName] = useState('')

  useEffect(() => {
    async function validateToken() {
      try {
        // Buscar el token en la BD
        const { data: tokenData, error } = await supabase
            .from('barber_tokens')
            .select(`
              id,
              barber_id,
              barbershop_id,
              expires_at,
              is_active,
              barbers (
                id,
                name,
                barbershop_id
              )
            `)
            .eq('token', token)
            .single()

        if (error || !tokenData) {
          setStatus('invalid')
          return
        }

        // Verificar si está activo
        if (!tokenData.is_active) {
          setStatus('invalid')
          return
        }

        // Verificar si expiró
        const now = new Date()
        const expires = new Date(tokenData.expires_at)
        if (now > expires) {
          setStatus('expired')
          return
        }

        // Token válido — guardar sesión del barbero en localStorage
        const barberSession = {
          barberId: tokenData.barber_id,
          barbershopId: tokenData.barbershop_id,
          barberName: tokenData.barbers?.name,
          token: token,
          expiresAt: tokenData.expires_at,
          accessedAt: new Date().toISOString()
        }

        localStorage.setItem(
          'trimly_barber_session',
          JSON.stringify(barberSession)
        )

        // Registrar el último uso del token
        await supabase
          .from('barber_tokens')
          .update({ last_used_at: new Date().toISOString() })
          .eq('token', token)

        setBarberName(tokenData.barbers?.name || '')
        setStatus('valid')

        // Redirigir al dashboard del barbero
        setTimeout(() => {
          router.push('/barber/dashboard')
        }, 1500)

      } catch (err) {
        console.error('Token validation error:', err)
        setStatus('invalid')
      }
    }

    if (token) validateToken()
  }, [token, router, supabase])

  // UI según el estado

  if (status === 'loading') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-primary p-8">
      <div className="relative w-20 h-20 animate-bounce mb-4">
        <Image src={miloImg} alt="Milo" fill className="object-contain" />
      </div>
      <p className="text-text-secondary text-sm font-medium">
        Verificando tu acceso...
      </p>
    </div>
  )

  if (status === 'valid') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-primary p-8">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 text-2xl">
        ✂️
      </div>
      <h1 className="text-2xl font-bold text-center text-text-primary">
        ¡Hola, {barberName}! 👋
      </h1>
      <p className="text-text-secondary text-center mt-2 text-sm">
        Entrando a tu panel...
      </p>
      <div className="mt-6 w-48 h-1 bg-background-tertiary rounded-full overflow-hidden">
        <div className="h-full bg-accent animate-[loading_1.5s_ease-in-out] rounded-full" style={{ width: '100%' }} />
      </div>
      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )

  if (status === 'expired') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-primary p-8 text-center">
      <div className="text-5xl mb-6">⏰</div>
      <h1 className="text-xl font-bold text-text-primary">
        Este link expiró
      </h1>
      <p className="text-text-secondary text-sm mt-3 max-w-xs leading-relaxed">
        Los links de acceso duran 7 días por seguridad. 
        Pídele al dueño de la barbería que te genere uno nuevo.
      </p>
    </div>
  )

  if (status === 'invalid') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-primary p-8 text-center">
      <div className="text-5xl mb-6">🚫</div>
      <h1 className="text-xl font-bold text-text-primary">
        Link inválido o revocado
      </h1>
      <p className="text-text-secondary text-sm mt-3 max-w-xs leading-relaxed">
        Este link no es válido o fue desactivado por el dueño de la barbería. 
        Pídele que te genere uno nuevo.
      </p>
    </div>
  )

  return null;
}
