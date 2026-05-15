"use client";

import { useTransition, useState } from 'react';
import { Calendar, CheckCircle2, Clock, Wallet, TrendingUp, UserX } from 'lucide-react';
import { completeAppointment, markNoShow } from '@/app/actions/barber-dashboard';
import type { BarberDashData, BarberAppt } from '@/app/actions/barber-dashboard';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-accent',
  pending:   'bg-warning',
  completed: 'bg-success',
  no_show:   'bg-text-tertiary',
  cancelled: 'bg-danger',
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  pending:   'Pendiente',
  completed: 'Completada',
  no_show:   'No apareció',
  cancelled: 'Cancelada',
};

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Hoy';
  if (d.toDateString() === tomorrow.toDateString()) return 'Mañana';
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
}

function groupByDay(appts: BarberAppt[]) {
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

function KpiCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 flex flex-col gap-2 border ${accent ? 'bg-accent/5 border-accent/20' : 'bg-background-secondary border-border'}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider leading-none">{label}</p>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-accent/15' : 'bg-background-tertiary'}`}>
          <Icon size={14} className={accent ? 'text-accent' : 'text-text-secondary'} />
        </div>
      </div>
      <p className={`text-xl font-black leading-none tabular-nums ${accent ? 'text-accent' : 'text-text-primary'}`}>{value}</p>
    </div>
  );
}

function AppointmentRow({
  appt,
  showActions,
  onComplete,
  onNoShow,
  loading,
}: {
  appt: BarberAppt;
  showActions: boolean;
  onComplete: (id: string) => void;
  onNoShow: (id: string) => void;
  loading: string | null;
}) {
  const timeStr = new Date(appt.scheduled_at).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
  const isConfirmed = appt.status === 'confirmed' || appt.status === 'pending';

  return (
    <div className="bg-background-secondary border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        {/* Time block */}
        <div className="w-14 h-14 bg-background-tertiary rounded-xl flex flex-col items-center justify-center border border-border shrink-0">
          <span className="text-xs text-text-tertiary">
            {new Date(appt.scheduled_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '')}
          </span>
          <span className="text-sm font-black text-accent font-mono">{timeStr}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-text-primary truncate">{appt.clientName}</p>
          <p className="text-xs text-text-tertiary">{appt.serviceName} · {appt.serviceDuration} min</p>
          {appt.notes && (
            <p className="text-xs text-text-secondary italic mt-0.5 truncate">"{appt.notes}"</p>
          )}
        </div>

        {/* Status + price */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-sm font-bold text-text-primary">
            {cop(appt.price_charged ?? appt.servicePrice)}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${STATUS_COLORS[appt.status] ?? 'bg-text-tertiary'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            {STATUS_LABELS[appt.status] ?? appt.status}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      {showActions && isConfirmed && (
        <div className="flex gap-2 pt-1 border-t border-border/50">
          <button
            onClick={() => onComplete(appt.id)}
            disabled={loading === appt.id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-success/10 text-success text-xs font-bold hover:bg-success/20 disabled:opacity-50 transition-colors min-h-[44px]"
          >
            <CheckCircle2 size={14} />
            {loading === appt.id ? '...' : 'Completar'}
          </button>
          <button
            onClick={() => onNoShow(appt.id)}
            disabled={loading === appt.id}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-text-tertiary/10 text-text-secondary text-xs font-bold hover:bg-danger/10 hover:text-danger disabled:opacity-50 transition-colors min-h-[44px]"
          >
            <UserX size={14} />
            {loading === appt.id ? '...' : 'No apareció'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function BarberDashboardClient({ data }: { data: BarberDashData }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [actionId, setActionId] = useState<string | null>(null);

  const handleComplete = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      const res = await completeAppointment(id);
      setActionId(null);
      if (res.success) {
        toast.success('Cita completada ✓');
        router.refresh();
      } else {
        toast.error('Error al completar');
      }
    });
  };

  const handleNoShow = (id: string) => {
    setActionId(id);
    startTransition(async () => {
      const res = await markNoShow(id);
      setActionId(null);
      if (res.success) {
        toast.success('Marcada como no-show');
        router.refresh();
      } else {
        toast.error('Error al actualizar');
      }
    });
  };

  const proximosGrupos = groupByDay(data.proximasCitas).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 4 KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Citas hoy"       value={String(data.stats.citasHoy)}        icon={Calendar}      />
        <KpiCard label="Completadas hoy" value={String(data.stats.completadasHoy)}  icon={CheckCircle2}  />
        <KpiCard label="Ganancias hoy"   value={cop(data.stats.gananciasHoy)}       icon={TrendingUp} accent />
        <KpiCard label="Ganancias mes"   value={cop(data.stats.misGananciasMes)}    icon={Wallet}     accent />
      </div>

      {/* Citas de HOY */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-accent" />
          <h2 className="text-base font-black text-text-primary uppercase tracking-wider">
            Citas de hoy
          </h2>
          {data.stats.citasHoy > 0 && (
            <span className="bg-accent text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {data.stats.citasHoy}
            </span>
          )}
        </div>

        {data.citasHoy.length === 0 ? (
          <div className="bg-background-secondary border border-dashed border-border rounded-2xl py-12 flex flex-col items-center text-center opacity-60">
            <Calendar size={36} className="text-text-tertiary mb-3" />
            <p className="text-sm font-medium text-text-secondary">No tienes citas hoy 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.citasHoy.map((appt) => (
              <AppointmentRow
                key={appt.id}
                appt={appt}
                showActions
                onComplete={handleComplete}
                onNoShow={handleNoShow}
                loading={actionId}
              />
            ))}
          </div>
        )}
      </section>

      {/* Próximas citas */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-text-secondary" />
          <h2 className="text-base font-black text-text-primary uppercase tracking-wider">
            Próximas citas
          </h2>
          {data.stats.proximasCitas > 0 && (
            <span className="bg-background-tertiary text-text-secondary text-[10px] font-black px-2 py-0.5 rounded-full">
              {data.stats.proximasCitas}
            </span>
          )}
        </div>

        {proximosGrupos.length === 0 ? (
          <div className="bg-background-secondary border border-dashed border-border rounded-2xl py-10 flex flex-col items-center text-center opacity-60">
            <p className="text-sm text-text-secondary">Sin citas programadas esta semana</p>
          </div>
        ) : (
          <div className="space-y-5">
            {proximosGrupos.map(({ label, items }) => (
              <div key={label} className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-accent uppercase tracking-widest">{label}</p>
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-text-tertiary">{items.length}</span>
                </div>
                {items.map((appt) => (
                  <AppointmentRow
                    key={appt.id}
                    appt={appt}
                    showActions={false}
                    onComplete={handleComplete}
                    onNoShow={handleNoShow}
                    loading={actionId}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
