'use client'

import { useEffect, useState } from 'react';
import { getBarberDashboardDataByToken } from '@/app/actions/barber-dashboard';
import type { BarberDashData } from '@/app/actions/barber-dashboard';
import { useBarberSession } from '@/hooks/useBarberSession';
import { Card, StatCard } from '@/components/ui/RedesignComponents';

import { Wallet, TrendingUp, CheckCircle2 } from 'lucide-react';

const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

export default function BarberGananciasPage() {
  const { session, loading } = useBarberSession();
  const [data, setData] = useState<BarberDashData | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (session) {
      setIsFetching(true);
      getBarberDashboardDataByToken(session.barberId, session.token).then((result) => {
        setData(result);
        setIsFetching(false);
      });
    }
  }, [session]);

  if (loading || (session && isFetching)) return (
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

  const gananciaByAppt = (price: number) => {
    if (!data.esquema) return price;
    if (data.esquema.tipo === 'porcentaje') return price * (data.esquema.porcentaje ?? 0) / 100;
    return price;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-primary">Mis Ganancias</h1>
        <p className="text-sm text-text-tertiary mt-1">Resumen de ganancias del mes en curso</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          label="Mis Ganancias (Mes)"
          value={cop(data.stats.misGananciasMes)}
          icon={Wallet}
          color="accent"
        />
        <StatCard
          label="Total Generado (Mes)"
          value={cop(data.stats.totalGeneradoMes)}
          icon={TrendingUp}
          color="success"
        />
      </div>

      {data.esquema && (
        <Card>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Tu esquema de pago</p>
            {data.esquema.tipo === 'porcentaje' && (
              <p className="text-sm text-text-primary">Porcentaje — <span className="font-bold text-accent">{data.esquema.porcentaje}%</span> de cada servicio</p>
            )}
            {data.esquema.tipo === 'fijo_mensual' && (
              <p className="text-sm text-text-primary">Salario fijo — <span className="font-bold text-accent">{cop(data.esquema.monto_fijo ?? 0)}</span> por mes</p>
            )}
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">Historial de servicios</h3>
        </div>
        {data.citasCompletadas.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm text-text-tertiary italic">Aún no hay servicios completados registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-background-secondary border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Fecha</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Cliente</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest">Servicio</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Cobrado</th>
                  <th className="px-6 py-4 text-[10px] font-black text-text-tertiary uppercase tracking-widest text-right">Tu ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.citasCompletadas.map((appt) => (
                  <tr key={appt.id} className="hover:bg-background-secondary/50 transition-colors">
                    <td className="px-6 py-4 text-xs text-text-secondary whitespace-nowrap">
                      {new Date(appt.scheduled_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-text-primary">{appt.clientName}</td>
                    <td className="px-6 py-4 text-xs text-text-tertiary">{appt.serviceName}</td>
                    <td className="px-6 py-4 text-sm text-text-primary text-right tabular-nums">
                      {cop(appt.price_charged ?? appt.servicePrice)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-accent text-right tabular-nums">
                      {data.esquema?.tipo === 'fijo_mensual'
                        ? '—'
                        : cop(gananciaByAppt(appt.price_charged ?? appt.servicePrice))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border bg-background-secondary">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-xs font-black text-text-secondary uppercase tracking-widest">Total</td>
                  <td className="px-6 py-4 text-sm font-bold text-text-primary text-right tabular-nums">
                    {cop(data.stats.totalGeneradoMes)}
                  </td>
                  <td className="px-6 py-4 text-base font-black text-accent text-right tabular-nums">
                    {cop(data.stats.misGananciasMes)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {data.citasCompletadas.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <CheckCircle2 size={13} className="text-success" />
          {data.citasCompletadas.length} cita{data.citasCompletadas.length !== 1 ? 's' : ''} completada{data.citasCompletadas.length !== 1 ? 's' : ''} este mes
        </div>
      )}
    </div>
  );
}
