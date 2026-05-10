'use client'

import React, { useEffect, useState } from 'react';
import { getBarberDashboardDataByToken } from '@/app/actions/barber-dashboard';
import { useBarberSession } from '@/hooks/useBarberSession';
import { Card } from '@/components/ui/RedesignComponents';
import { Calendar as CalendarIcon } from 'lucide-react';

export default function BarberAgendaPage() {
  const { session, loading } = useBarberSession();
  const [data, setData] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (session) {
      setIsFetching(true);
      getBarberDashboardDataByToken(session.barberId, session.token).then(result => {
        setData(result);
        setIsFetching(false);
      });
    }
  }, [session]);

  if (loading || (session && !data && isFetching)) return (
    <div className="min-h-screen flex items-center justify-center bg-background-primary">
      <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!session) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background-primary">
      <h1 className="text-xl font-bold">Acceso requerido</h1>
      <p className="text-text-secondary text-sm mt-2">Usa tu link de acceso para entrar.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-primary">Mi Agenda</h1>
        <p className="text-sm text-text-tertiary mt-1">Consulta tus citas programadas</p>
      </div>

      <Card className="min-h-[600px] flex flex-col items-center justify-center border-dashed opacity-60">
        <CalendarIcon size={48} className="text-text-tertiary mb-4" />
        <p className="text-sm font-medium text-text-secondary">El calendario completo estará disponible pronto.</p>
        <p className="text-xs text-text-tertiary mt-2 text-center max-w-xs">
          Por ahora puedes ver tus próximas citas en la pantalla de Inicio.
        </p>
      </Card>
    </div>
  );
}
