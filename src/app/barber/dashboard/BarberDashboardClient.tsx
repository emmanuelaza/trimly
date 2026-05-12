"use client";

import React, { useTransition, useState } from 'react';
import { StatCard, Card, Button, Badge } from '@/components/ui/RedesignComponents';
import { Calendar, TrendingUp, CheckCircle2, Clock, ChevronDown, ChevronUp, Wallet } from 'lucide-react';
import { completeAppointment } from '@/app/actions/barber-dashboard';
import type { BarberDashData, BarberAppt } from '@/app/actions/barber-dashboard';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function dayLabel(dateStr: string): string {
  const apptDate = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (apptDate.toDateString() === today.toDateString()) return 'Hoy';
  if (apptDate.toDateString() === tomorrow.toDateString()) return 'Mañana';
  return apptDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
}

function groupByDay(appts: BarberAppt[]): { label: string; items: BarberAppt[] }[] {
  const map = new Map<string, BarberAppt[]>();
  for (const a of appts) {
    const key = new Date(a.scheduled_at).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return Array.from(map.entries()).map(([, items]) => ({
    label: dayLabel(items[0].scheduled_at),
    items,
  }));
}

export default function BarberDashboardClient({ data }: { data: BarberDashData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [showAllCompleted, setShowAllCompleted] = useState(false);

  const handleComplete = (id: string) => {
    setCompletingId(id);
    startTransition(async () => {
      const result = await completeAppointment(id);
      setCompletingId(null);
      if (result.success) {
        toast.success('Cita completada');
        router.refresh();
      } else {
        toast.error('Error al completar');
      }
    });
  };

  const grupos = groupByDay(data.proximasCitas);
  const completadasVisible = showAllCompleted ? data.citasCompletadas : data.citasCompletadas.slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Citas Hoy" value={data.stats.citasHoy} icon={Calendar} color="accent" />
        <StatCard label="Próximas Citas" value={data.stats.proximasCitas} icon={Clock} color="accent" />
        <StatCard label="Mis Ganancias (Mes)" value={cop(data.stats.misGananciasMes)} icon={TrendingUp} color="success" />
      </div>

      {/* Próximas Citas */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Clock size={20} className="text-accent" />
          Próximas citas
        </h2>

        {grupos.length === 0 ? (
          <Card className="py-12 border-dashed flex flex-col items-center justify-center text-center opacity-60">
            <Calendar size={40} className="mb-4 text-text-tertiary" />
            <p className="text-sm font-medium text-text-secondary">No tienes citas próximas.</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {grupos.map(({ label, items }) => (
              <div key={label} className="space-y-3">
                <p className="text-xs font-black text-accent uppercase tracking-widest">{label}</p>
                {items.map((appt) => (
                  <Card key={appt.id} className="hover:border-border-strong transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-background-tertiary rounded-2xl flex flex-col items-center justify-center border border-border shrink-0">
                          <span className="text-xs font-black text-accent">
                            {new Date(appt.scheduled_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit', minute: '2-digit', hour12: false,
                            })}
                          </span>
                        </div>
                        <div>
                          <p className="text-base font-bold text-text-primary">{appt.clientName}</p>
                          <p className="text-xs text-text-tertiary">{appt.serviceName} · {appt.serviceDuration} min</p>
                          {appt.notes && (
                            <p className="text-xs text-text-secondary italic mt-0.5">"{appt.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-text-primary">
                          {cop(appt.price_charged ?? appt.servicePrice)}
                        </span>
                        <Button
                          size="sm"
                          className="bg-accent hover:bg-accent/90 text-[11px] h-9 whitespace-nowrap"
                          onClick={() => handleComplete(appt.id)}
                          disabled={isPending && completingId === appt.id}
                        >
                          {completingId === appt.id ? '...' : 'Completada'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Citas realizadas */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <CheckCircle2 size={20} className="text-success" />
          Citas realizadas
        </h2>

        {data.citasCompletadas.length === 0 ? (
          <Card className="py-8 border-dashed flex flex-col items-center justify-center text-center opacity-60">
            <p className="text-sm text-text-secondary">Aún no hay citas completadas.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {completadasVisible.map((appt) => (
              <Card key={appt.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} className="text-success" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">{appt.clientName}</p>
                    <p className="text-xs text-text-tertiary">
                      {appt.serviceName} · {new Date(appt.scheduled_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-text-primary">
                    {cop(appt.price_charged ?? appt.servicePrice)}
                  </span>
                  <Badge variant="success" className="gap-1 py-1 px-2.5 text-[11px]">
                    <CheckCircle2 size={11} /> Completada
                  </Badge>
                </div>
              </Card>
            ))}
            {data.citasCompletadas.length > 5 && (
              <button
                onClick={() => setShowAllCompleted((v) => !v)}
                className="w-full py-3 text-xs text-text-tertiary hover:text-accent flex items-center justify-center gap-1 transition-colors"
              >
                {showAllCompleted
                  ? <><ChevronUp size={14} /> Ver menos</>
                  : <><ChevronDown size={14} /> Ver todas ({data.citasCompletadas.length})</>}
              </button>
            )}
          </div>
        )}
      </section>

      {/* Mis Ganancias */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Wallet size={20} className="text-accent" />
          Mis ganancias
        </h2>
        <Card>
          <div className="space-y-0 divide-y divide-border">
            <div className="flex justify-between items-center py-4">
              <p className="text-sm text-text-secondary">Total generado (mes)</p>
              <p className="text-sm font-bold text-text-primary">{cop(data.stats.totalGeneradoMes)}</p>
            </div>
            {data.esquema?.type === 'percentage' && (
              <div className="flex justify-between items-center py-4">
                <p className="text-sm text-text-secondary">Tu parte ({data.esquema.percentage}%)</p>
                <p className="text-base font-black text-accent">{cop(data.stats.misGananciasMes)}</p>
              </div>
            )}
            {data.esquema?.type === 'fixed_monthly' && (
              <div className="flex justify-between items-center py-4">
                <p className="text-sm text-text-secondary">Tu salario fijo mensual</p>
                <p className="text-base font-black text-accent">{cop(data.stats.misGananciasMes)}</p>
              </div>
            )}
            {!data.esquema && (
              <div className="flex justify-between items-center py-4">
                <p className="text-sm text-text-secondary">Tus ganancias</p>
                <p className="text-base font-black text-accent">{cop(data.stats.misGananciasMes)}</p>
              </div>
            )}
            <div className="flex justify-between items-center pt-4">
              <p className="text-sm font-semibold text-text-primary">Este mes</p>
              <p className="text-xl font-black text-accent">{cop(data.stats.misGananciasMes)}</p>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
