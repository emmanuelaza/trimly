'use client'

import React, { useEffect, useState } from 'react';
import { getBarberDashboardDataByToken } from '@/app/actions/barber-dashboard';
import { useBarberSession } from '@/hooks/useBarberSession';
import { Card, StatCard, Badge } from '@/components/ui/RedesignComponents';
import { Wallet, Clock } from 'lucide-react';

export default function BarberGananciasPage() {
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

  if (!session || !data) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-background-primary">
      <h1 className="text-xl font-bold">Acceso requerido</h1>
      <p className="text-text-secondary text-sm mt-2">Usa tu link de acceso para entrar.</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-primary">Mis Ganancias</h1>
        <p className="text-sm text-text-tertiary mt-1">Sigue el detalle de lo que has ganado este mes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          label="Total Ganado este Mes" 
          value={`$${data.stats.earningsMonth.toLocaleString()}`} 
          icon={Wallet} 
          color="accent"
        />
        <StatCard 
          label="Estado del Pago" 
          value="Pendiente" 
          icon={Clock} 
          color="warning"
        />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Detalle de Servicios</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-background-secondary border-b border-border">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Cliente</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Servicio</th>
                <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Tu Ganancia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.todayAppointments.filter((a: any) => a.status === 'completed').map((app: any) => (
                <tr key={app.id}>
                  <td className="px-6 py-4 text-xs text-text-secondary">{new Date(app.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium text-text-primary">{app.client_name || 'Cliente'}</td>
                  <td className="px-6 py-4 text-xs text-text-tertiary">{app.service_name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-accent text-right">
                    ${(Number(app.price) * (Number(data.barber.barber_payment_schemes?.[0]?.percentage) || 0) / 100).toLocaleString()}
                  </td>
                </tr>
              ))}
              {data.todayAppointments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-text-tertiary italic">Aún no hay servicios completados registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
