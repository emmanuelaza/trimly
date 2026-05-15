'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useBarberSession } from '@/hooks/useBarberSession';
import BarberDashboardClient from './BarberDashboardClient';
import { NuevaCitaModal } from './NuevaCitaModal';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import miloImg from '@/assets/milo.png';

export default function BarberDashboardPage() {
  const { session, loading } = useBarberSession();
  const [data, setData] = React.useState<any>(null);
  const [isFetching, setIsFetching] = React.useState(false);
  const [nuevaCitaOpen, setNuevaCitaOpen] = useState(false);

  const fetchData = React.useCallback(() => {
    if (!session) return;
    setIsFetching(true);
    import('@/app/actions/barber-dashboard').then(async (actions) => {
      const result = await actions.getBarberDashboardDataByToken(session.barberId, session.token);
      setData(result);
      setIsFetching(false);
    });
  }, [session]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading || (session && !data && isFetching)) return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-text-tertiary text-sm font-medium">Cargando tus datos...</p>
      </div>
    </div>
  );

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center max-w-sm mx-auto">
      <div className="relative w-20 h-20 mb-4 opacity-80">
        <Image src={miloImg} alt="Milo" fill className="object-contain" />
      </div>
      <h1 className="text-xl font-bold">Necesitas tu link de acceso</h1>
      <p className="text-text-secondary text-sm mt-2 leading-relaxed">
        Para entrar a tu panel necesitas el link que te envió el dueño de la barbería.
      </p>
      <div className="mt-6 p-4 bg-background-secondary rounded-xl text-sm text-text-secondary text-left w-full space-y-1">
        <p className="font-semibold text-text-primary mb-1">¿Cómo acceder?</p>
        <p>1. Busca el mensaje de WhatsApp del dueño</p>
        <p>2. Toca el link que te enviaron</p>
        <p>3. Entra directo a tu panel</p>
      </div>
    </div>
  );

  const displayData = data || {
    barber: { id: '', name: session.barberName, barbershopName: '' },
    esquema: null,
    stats: { citasHoy: 0, completadasHoy: 0, gananciasHoy: 0, proximasCitas: 0, totalGeneradoMes: 0, misGananciasMes: 0 },
    citasHoy: [],
    proximasCitas: [],
    citasCompletadas: [],
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Hola, {session.barberName} ✂️
          </h1>
          <p className="text-sm text-text-tertiary mt-1 flex items-center gap-1.5">
            <CalendarIcon size={13} className="text-accent" />
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <button
          onClick={() => setNuevaCitaOpen(true)}
          className="flex items-center gap-2 bg-accent text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors shrink-0 min-h-[44px]"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nueva cita</span>
        </button>
      </div>

      <BarberDashboardClient data={displayData} />

      {/* Floating + button (mobile) */}
      <button
        onClick={() => setNuevaCitaOpen(true)}
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-accent text-white rounded-full shadow-lg shadow-accent/30 flex items-center justify-center z-40 active:scale-95 transition-transform"
        aria-label="Nueva cita"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      <NuevaCitaModal
        isOpen={nuevaCitaOpen}
        onClose={() => setNuevaCitaOpen(false)}
        onCreated={() => { setNuevaCitaOpen(false); fetchData(); }}
        barberId={session.barberId}
        barbershopId={session.barbershopId}
      />
    </div>
  );
}
