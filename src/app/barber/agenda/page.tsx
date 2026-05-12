'use client'

import { useEffect, useState, useTransition } from 'react';
import { getBarberDashboardDataByToken, completeAppointment } from '@/app/actions/barber-dashboard';
import type { BarberAppt } from '@/app/actions/barber-dashboard';
import { useBarberSession } from '@/hooks/useBarberSession';
import { Card, Button, Badge } from '@/components/ui/RedesignComponents';
import { Calendar, Clock, CheckCircle2, Phone } from 'lucide-react';
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
  return apptDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
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

export default function BarberAgendaPage() {
  const { session, loading } = useBarberSession();
  const router = useRouter();
  const [appts, setAppts] = useState<BarberAppt[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [completingId, setCompletingId] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setIsFetching(true);
      getBarberDashboardDataByToken(session.barberId, session.token).then((result) => {
        setAppts(result?.proximasCitas ?? []);
        setIsFetching(false);
      });
    }
  }, [session]);

  const handleComplete = (id: string) => {
    setCompletingId(id);
    startTransition(async () => {
      const result = await completeAppointment(id);
      setCompletingId(null);
      if (result.success) {
        toast.success('Cita completada');
        setAppts((prev) => prev.filter((a) => a.id !== id));
        router.refresh();
      } else {
        toast.error('Error al completar');
      }
    });
  };

  if (loading || (session && isFetching)) return (
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

  const grupos = groupByDay(appts);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-primary">Mi Agenda</h1>
        <p className="text-sm text-text-tertiary mt-1">
          {appts.length === 0 ? 'Sin citas próximas' : `${appts.length} cita${appts.length !== 1 ? 's' : ''} programada${appts.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {grupos.length === 0 ? (
        <Card className="py-16 border-dashed flex flex-col items-center justify-center text-center opacity-60">
          <Calendar size={48} className="text-text-tertiary mb-4" />
          <p className="text-sm font-medium text-text-secondary">No tienes citas próximas.</p>
          <p className="text-xs text-text-tertiary mt-2 max-w-xs">
            Cuando tengas citas agendadas aparecerán aquí agrupadas por día.
          </p>
        </Card>
      ) : (
        <div className="space-y-8">
          {grupos.map(({ label, items }) => (
            <div key={label} className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-xs font-black text-accent uppercase tracking-widest">{label}</p>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-tertiary">{items.length} cita{items.length !== 1 ? 's' : ''}</span>
              </div>

              {items.map((appt) => (
                <Card key={appt.id} className="hover:border-border-strong transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-background-tertiary rounded-2xl flex flex-col items-center justify-center border border-border shrink-0">
                        <Clock size={12} className="text-text-tertiary mb-0.5" />
                        <span className="text-sm font-black text-accent">
                          {new Date(appt.scheduled_at).toLocaleTimeString('es-ES', {
                            hour: '2-digit', minute: '2-digit', hour12: false,
                          })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-base font-bold text-text-primary">{appt.clientName}</p>
                        <p className="text-xs text-text-tertiary">{appt.serviceName} · {appt.serviceDuration} min</p>
                        {appt.clientPhone && (
                          <a
                            href={`https://wa.me/${appt.clientPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            <Phone size={11} /> {appt.clientPhone}
                          </a>
                        )}
                        {appt.notes && (
                          <p className="text-xs text-text-secondary italic">"{appt.notes}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-0 border-border/50">
                      <span className="text-sm font-bold text-text-primary">
                        {cop(appt.price_charged ?? appt.servicePrice)}
                      </span>
                      <Badge variant={appt.status === 'confirmed' ? 'default' : 'warning'} className="text-[10px] py-1 px-2">
                        {appt.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </Badge>
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
    </div>
  );
}
