'use client'

import React from 'react';
import { useBarberSession } from '@/hooks/useBarberSession';
import BarberDashboardClient from './BarberDashboardClient';
import { LogOut, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/RedesignComponents';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background-primary">
      <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mb-6 text-4xl">
        🔒
      </div>
      <h1 className="text-2xl font-bold text-text-primary tracking-tight">Acceso requerido</h1>
      <p className="text-text-secondary text-sm mt-3 max-w-xs leading-relaxed">
        Necesitas un link de acceso válido para entrar a tu panel. 
        Pídele al dueño de tu barbería que te envíe uno por WhatsApp.
      </p>
    </div>
  )

  const displayData = data || {
    barber: { name: session.barberName },
    stats: { appointmentsToday: 0, earningsToday: 0, earningsMonth: 0 },
    todayAppointments: []
  };

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">Hola, {session.barberName} 👋</h1>
          <p className="text-sm text-text-tertiary mt-1 flex items-center gap-2">
            <CalendarIcon size={14} className="text-accent" />
            Hoy es {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-border-strong text-text-secondary hover:text-danger"
          onClick={logout}
        >
          <LogOut size={16} />
          Cerrar Sesión
        </Button>
      </div>

      <BarberDashboardClient initialData={displayData} />
    </div>
  );
}
