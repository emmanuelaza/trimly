'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { Wallet, TrendingUp, CheckCircle2, CalendarDays, Clock, AlertCircle } from 'lucide-react';
import type { BarberGananciasData } from '@/app/actions/barber-dashboard';
import { useBarberSession } from '@/hooks/useBarberSession';

const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

type Period = 'this_month' | 'last_month' | 'all';

function getPeriodBounds(period: Period): { start: string; end: string } {
  const now = new Date();
  if (period === 'this_month') {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(),
    };
  }
  if (period === 'last_month') {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999).toISOString(),
    };
  }
  return {
    start: new Date(2020, 0, 1).toISOString(),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(),
  };
}

const TABS: { id: Period; label: string }[] = [
  { id: 'this_month', label: 'Este mes' },
  { id: 'last_month', label: 'Mes anterior' },
  { id: 'all', label: 'Total' },
];

function KpiCard({ label, value, icon: Icon, accent }: {
  label: string; value: string; icon: React.ElementType; accent?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-2 border ${accent ? 'bg-accent/5 border-accent/20' : 'bg-background-secondary border-border'}`}>
      <div className="flex items-start justify-between gap-1">
        <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider leading-tight line-clamp-2">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-accent/15' : 'bg-background-tertiary'}`}>
          <Icon size={14} className={accent ? 'text-accent' : 'text-text-secondary'} />
        </div>
      </div>
      <p className={`text-base font-black leading-tight tabular-nums break-all ${accent ? 'text-accent' : 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

export default function BarberGananciasPage() {
  const { session, loading } = useBarberSession();
  const [period, setPeriod] = useState<Period>('this_month');
  const [data, setData] = useState<BarberGananciasData | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const fetchData = useCallback(() => {
    if (!session) return;
    setIsFetching(true);
    const { start, end } = getPeriodBounds(period);
    import('@/app/actions/barber-dashboard').then(async (actions) => {
      const result = await actions.getBarberGanancias(session.barberId, session.token, start, end);
      setData(result);
      setIsFetching(false);
    });
  }, [session, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const gananciaByAppt = (price: number) => {
    if (!data?.esquema) return price;
    if (data.esquema.type === 'percentage') return price * ((data.esquema.percentage ?? 0) / 100);
    return price;
  };

  const promedioCita = data && data.citas.length > 0
    ? data.totalGenerado / data.citas.length
    : 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-primary tracking-tight">Mis ganancias</h1>
        {data?.esquema && (
          <p className="text-sm text-text-tertiary mt-1">
            {data.esquema.type === 'percentage'
              ? `Esquema: ${data.esquema.percentage}% por servicio`
              : data.esquema.type === 'fixed_monthly'
              ? `Esquema: salario fijo ${cop(data.esquema.fixed_amount ?? 0)}/mes`
              : null}
          </p>
        )}
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 p-1 bg-background-secondary border border-border rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPeriod(tab.id)}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all min-h-[44px] ${
              period === tab.id
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Payment status badge */}
      {!isFetching && data?.pagoInfo && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border ${
          data.pagoInfo.status === 'paid'
            ? 'bg-success/10 border-success/30'
            : 'bg-warning/10 border-warning/30'
        }`}>
          {data.pagoInfo.status === 'paid'
            ? <CheckCircle2 size={18} className="text-success shrink-0" />
            : <AlertCircle size={18} className="text-warning shrink-0" />}
          <p className="text-sm font-medium text-text-primary">
            {data.pagoInfo.status === 'paid' ? (
              <>
                <span className="text-success font-bold">Pagado</span>
                {data.pagoInfo.payment_date && (
                  <> el {new Date(data.pagoInfo.payment_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}</>
                )}
                {data.pagoInfo.payment_method && <> vía {data.pagoInfo.payment_method}</>}
              </>
            ) : (
              <span className="text-warning font-bold">Pago pendiente</span>
            )}
          </p>
        </div>
      )}

      {/* KPI grid */}
      {isFetching ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-background-secondary border border-border rounded-2xl p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Total generado"    value={cop(data?.totalGenerado ?? 0)}      icon={TrendingUp}   />
          <KpiCard label="Mis ganancias"     value={cop(data?.misGanancias ?? 0)}        icon={Wallet}       accent />
          <KpiCard label="Citas completadas" value={String(data?.citas.length ?? 0)}    icon={CheckCircle2} />
          <KpiCard label="Promedio / cita"   value={cop(promedioCita)}                  icon={CalendarDays} />
        </div>
      )}

      {/* Historial */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-text-secondary" />
          <h2 className="text-base font-black text-text-primary uppercase tracking-wider">Historial</h2>
          {!isFetching && (data?.citas.length ?? 0) > 0 && (
            <span className="bg-background-tertiary text-text-secondary text-[10px] font-black px-2 py-0.5 rounded-full">
              {data!.citas.length}
            </span>
          )}
        </div>

        {!isFetching && (data?.citas.length ?? 0) === 0 ? (
          <div className="bg-background-secondary border border-dashed border-border rounded-2xl py-12 flex flex-col items-center text-center opacity-60">
            <Wallet size={36} className="text-text-tertiary mb-3" />
            <p className="text-sm font-medium text-text-secondary">Sin citas completadas en este período</p>
          </div>
        ) : (
          <div className="bg-background-secondary border border-border rounded-2xl overflow-hidden">
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {(data?.citas ?? []).map((appt) => {
                const precio = appt.price_charged ?? appt.servicePrice;
                const miParte = data?.esquema?.type === 'fixed_monthly' ? null : gananciaByAppt(precio);
                return (
                  <div key={appt.id} className="p-4 flex items-center gap-3">
                    <div className="w-11 h-11 bg-background-tertiary rounded-xl flex flex-col items-center justify-center shrink-0 border border-border">
                      <span className="text-[9px] text-text-tertiary leading-tight">
                        {new Date(appt.scheduled_at).toLocaleDateString('es-CO', { month: 'short' }).replace('.', '')}
                      </span>
                      <span className="text-sm font-black text-accent leading-tight">
                        {new Date(appt.scheduled_at).getDate()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary truncate">{appt.clientName}</p>
                      <p className="text-xs text-text-tertiary">{appt.serviceName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-text-primary tabular-nums">{cop(precio)}</p>
                      {miParte !== null && (
                        <p className="text-xs font-bold text-accent tabular-nums">{cop(miParte)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-background-tertiary">
                  <tr>
                    <th className="px-5 py-3.5 text-[10px] font-black text-text-tertiary uppercase tracking-wider">Fecha</th>
                    <th className="px-5 py-3.5 text-[10px] font-black text-text-tertiary uppercase tracking-wider">Cliente</th>
                    <th className="px-5 py-3.5 text-[10px] font-black text-text-tertiary uppercase tracking-wider">Servicio</th>
                    <th className="px-5 py-3.5 text-[10px] font-black text-text-tertiary uppercase tracking-wider text-right">Precio</th>
                    <th className="px-5 py-3.5 text-[10px] font-black text-text-tertiary uppercase tracking-wider text-right">Mi parte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data?.citas ?? []).map((appt) => {
                    const precio = appt.price_charged ?? appt.servicePrice;
                    return (
                      <tr key={appt.id} className="hover:bg-background-tertiary/50 transition-colors">
                        <td className="px-5 py-4 text-xs text-text-secondary whitespace-nowrap">
                          {new Date(appt.scheduled_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-text-primary">{appt.clientName}</td>
                        <td className="px-5 py-4 text-xs text-text-tertiary">{appt.serviceName}</td>
                        <td className="px-5 py-4 text-sm text-text-primary text-right tabular-nums">{cop(precio)}</td>
                        <td className="px-5 py-4 text-sm font-bold text-accent text-right tabular-nums">
                          {data?.esquema?.type === 'fixed_monthly' ? '—' : cop(gananciaByAppt(precio))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {(data?.citas.length ?? 0) > 0 && (
                  <tfoot className="border-t-2 border-border bg-background-secondary">
                    <tr>
                      <td colSpan={3} className="px-5 py-4 text-xs font-black text-text-secondary uppercase tracking-wider">Total período</td>
                      <td className="px-5 py-4 text-sm font-bold text-text-primary text-right tabular-nums">
                        {cop(data!.totalGenerado)}
                      </td>
                      <td className="px-5 py-4 text-base font-black text-accent text-right tabular-nums">
                        {cop(data!.misGanancias)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
