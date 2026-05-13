'use client'

import React from 'react';
import Image from 'next/image';
import { useBarberSession } from '@/hooks/useBarberSession';
import BarberDashboardClient from './BarberDashboardClient';
import { LogOut, Calendar as CalendarIcon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/RedesignComponents';
import miloImg from '@/assets/milo.png';
import { usePushNotifications } from '@/hooks/usePushNotifications';

function PushPrompt({ session }: { session: { barberId: string; barbershopId: string } }) {
  const { status, subscribe } = usePushNotifications(session.barbershopId, session.barberId)
  if (status !== 'default') return null
  return (
    <div className="flex items-center gap-3 p-4 bg-accent/8 border border-accent/20 rounded-xl mb-4">
      <Bell size={18} className="text-accent flex-shrink-0" />
      <p className="text-sm flex-1 text-text-primary">
        Activa las notificaciones para saber cuándo tienes una cita nueva 🔔
      </p>
      <Button size="sm" onClick={subscribe}>Activar</Button>
    </div>
  )
}

export default function BarberDashboardPage() {
  const { session, loading, logout } = useBarberSession();
  const [data, setData] = React.useState<any>(null);
  const [isFetching, setIsFetching] = React.useState(false);

  React.useEffect(() => {
    if (session) {
      setIsFetching(true);
      import('@/app/actions/barber-dashboard').then(async (actions) => {
        const result = await actions.getBarberDashboardDataByToken(session.barberId, session.token);
        setData(result);
        setIsFetching(false);
      });
    }
  }, [session]);

  if (loading || (session && !data && isFetching)) return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-text-tertiary text-sm font-medium">Cargando tus datos...</p>
      </div>
    </div>
  )

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center max-w-sm mx-auto">
      <div className="relative w-20 h-20 mb-4 opacity-80">
        <Image src={miloImg} alt="Milo" fill className="object-contain" />
      </div>

      <h1 className="text-xl font-bold">
        Necesitas tu link de acceso
      </h1>

      <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
        Para entrar a tu panel necesitas el link que te envió el dueño de la barbería.
        Búscalo en tus mensajes de WhatsApp.
      </p>

      <div className="mt-6 p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground text-left w-full">
        <p className="font-semibold text-foreground mb-1">¿Cómo acceder?</p>
        <p>1. Busca el mensaje de WhatsApp del dueño de tu barbería</p>
        <p className="mt-1">2. Toca el link que te enviaron</p>
        <p className="mt-1">3. Entra directo a tu panel</p>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        ¿No tienes el link? Pídele al dueño de tu barbería que te lo envíe desde
        Trimly → Equipo → Generar acceso
      </p>
    </div>
  )

  const displayData = data || {
    barber: { id: '', name: session.barberName, barbershopName: '' },
    esquema: null,
    stats: { citasHoy: 0, proximasCitas: 0, totalGeneradoMes: 0, misGananciasMes: 0 },
    proximasCitas: [],
    citasCompletadas: [],
  };

  return (
    <div className="space-y-10 pb-20">
      <PushPrompt session={session} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Hola, {session.barberName} 👋</h1>
          <p className="text-sm text-text-tertiary mt-1 flex items-center gap-2">
            <CalendarIcon size={14} className="text-accent" />
            Hoy es {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 border-border-strong text-text-secondary hover:text-danger"
          onClick={logout}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </Button>
      </div>

      <BarberDashboardClient data={displayData} />
    </div>
  );
}
