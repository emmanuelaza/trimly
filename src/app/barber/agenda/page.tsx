'use client'

import { useEffect, useState, useTransition, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useBarberSession } from '@/hooks/useBarberSession';
import { NuevaCitaModal } from '@/app/barber/dashboard/NuevaCitaModal';
import {
  ChevronLeft, ChevronRight, Calendar,
  CheckCircle2, UserX, Plus,
  Phone, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Appt {
  id: string;
  scheduled_at: string;
  status: string;
  notes: string | null;
  price_charged: number | null;
  clientName: string;
  clientPhone: string | null;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
}

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

const cop = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

function weekBounds(offset: number) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function weekLabel(monday: Date, sunday: Date): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  const m = monday.toLocaleDateString('es-ES', opts);
  const s = sunday.toLocaleDateString('es-ES', opts);
  return `${m} – ${s}`;
}

function dayHeader(date: Date): string {
  return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' });
}

function isToday(date: Date): boolean {
  const t = new Date();
  return date.toDateString() === t.toDateString();
}

function groupByDay(appts: Appt[]): { date: Date; label: string; items: Appt[] }[] {
  const map = new Map<string, { date: Date; items: Appt[] }>();
  for (const a of appts) {
    const d = new Date(a.scheduled_at);
    const key = d.toDateString();
    if (!map.has(key)) map.set(key, { date: d, items: [] });
    map.get(key)!.items.push(a);
  }
  return Array.from(map.entries()).map(([, v]) => ({
    date: v.date,
    label: dayHeader(v.date),
    items: v.items,
  }));
}

export default function BarberAgendaPage() {
  const { session, loading } = useBarberSession();
  const [weekOffset, setWeekOffset] = useState(0);
  const [appts, setAppts] = useState<Appt[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [detailAppt, setDetailAppt] = useState<Appt | null>(null);
  const [nuevaCitaOpen, setNuevaCitaOpen] = useState(false);
  const [, startTransition] = useTransition();

  const { monday, sunday } = weekBounds(weekOffset);

  const fetchAppts = useCallback(() => {
    if (!session) return;
    const { monday: start, sunday: end } = weekBounds(weekOffset);
    setIsFetching(true);
    getSupabase()
      .from('appointments')
      .select('id, scheduled_at, status, notes, price_charged, clients(name, phone), services(name, price, duration_minutes)')
      .eq('barber_id', session.barberId)
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
      .order('scheduled_at', { ascending: true })
      .then(({ data }) => {
        const mapped: Appt[] = (data ?? []).map((a: any) => ({
          id: a.id,
          scheduled_at: a.scheduled_at,
          status: a.status,
          notes: a.notes ?? null,
          price_charged: a.price_charged ?? null,
          clientName: a.clients?.name ?? 'Cliente',
          clientPhone: a.clients?.phone ?? null,
          serviceName: a.services?.name ?? 'Servicio',
          servicePrice: Number(a.services?.price ?? 0),
          serviceDuration: Number(a.services?.duration_minutes ?? 30),
        }));
        setAppts(mapped);
        setIsFetching(false);
      });
  }, [session, weekOffset]);

  useEffect(() => { fetchAppts(); }, [fetchAppts]);

  const updateStatus = (id: string, status: 'completed' | 'no_show' | 'cancelled') => {
    setActionId(id);
    startTransition(async () => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      setActionId(null);
      if (error) { toast.error('Error al actualizar'); return; }
      const labels: Record<string, string> = { completed: 'Cita completada ✓', no_show: 'Marcada como no-show', cancelled: 'Cita cancelada' };
      toast.success(labels[status]);
      setDetailAppt(null);
      fetchAppts();
    });
  };

  if (loading) return (
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
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-text-primary">Mi Agenda</h1>
          <p className="text-sm text-text-tertiary mt-0.5">
            {isFetching ? 'Cargando...' : `${appts.length} cita${appts.length !== 1 ? 's' : ''} esta semana`}
          </p>
        </div>
        <button
          onClick={() => setNuevaCitaOpen(true)}
          className="hidden md:flex items-center gap-2 bg-accent text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-accent/90 transition-colors min-h-[44px]"
        >
          <Plus size={16} /> Nueva cita
        </button>
      </div>

      {/* Week navigation */}
      <div className="flex items-center gap-2 bg-background-secondary border border-border rounded-2xl p-1">
        <button
          onClick={() => setWeekOffset((v) => v - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-text-primary">{weekLabel(monday, sunday)}</p>
          {weekOffset !== 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="text-xs text-accent hover:underline"
            >
              Volver a esta semana
            </button>
          )}
        </div>

        <button
          onClick={() => setWeekOffset((v) => v + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary hover:bg-background-tertiary hover:text-text-primary transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Content */}
      {isFetching ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : grupos.length === 0 ? (
        <div className="bg-background-secondary border border-dashed border-border rounded-2xl py-16 flex flex-col items-center text-center opacity-60">
          <Calendar size={44} className="text-text-tertiary mb-4" />
          <p className="text-sm font-medium text-text-secondary">Sin citas esta semana</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grupos.map(({ date, label, items }) => (
            <div key={date.toDateString()} className="space-y-3">
              <div className="flex items-center gap-3">
                <p className={`text-xs font-black uppercase tracking-widest ${isToday(date) ? 'text-accent' : 'text-text-tertiary'}`}>
                  {isToday(date) ? '— HOY —' : label}
                </p>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-tertiary">{items.length}</span>
              </div>

              {items.map((appt) => {
                const timeStr = new Date(appt.scheduled_at).toLocaleTimeString('es-ES', {
                  hour: '2-digit', minute: '2-digit', hour12: false,
                });
                const isActionable = appt.status === 'confirmed' || appt.status === 'pending';
                return (
                  <div
                    key={appt.id}
                    className="bg-background-secondary border border-border rounded-2xl p-4 flex flex-col gap-3 cursor-pointer hover:border-border-strong transition-all"
                    onClick={() => setDetailAppt(appt)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-background-tertiary rounded-xl flex flex-col items-center justify-center border border-border shrink-0">
                        <Clock size={11} className="text-text-tertiary mb-0.5" />
                        <span className="text-sm font-black text-accent font-mono">{timeStr}</span>
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-base font-bold text-text-primary truncate">{appt.clientName}</p>
                        <p className="text-xs text-text-tertiary">{appt.serviceName} · {appt.serviceDuration} min</p>
                        {appt.clientPhone && (
                          <a
                            href={`https://wa.me/${appt.clientPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                          >
                            <Phone size={11} /> {appt.clientPhone}
                          </a>
                        )}
                        {appt.notes && (
                          <p className="text-xs text-text-secondary italic">"{appt.notes}"</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-sm font-bold text-text-primary">
                          {cop(appt.price_charged ?? appt.servicePrice)}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${STATUS_COLORS[appt.status] ?? 'bg-text-tertiary'}`}>
                          {STATUS_LABELS[appt.status] ?? appt.status}
                        </span>
                      </div>
                    </div>

                    {/* Quick actions (inline, mobile-friendly) */}
                    {isActionable && (
                      <div className="flex gap-2 pt-2 border-t border-border/40" onClick={(e) => e.stopPropagation()}>
                        <button
                          disabled={actionId === appt.id}
                          onClick={() => updateStatus(appt.id, 'completed')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-success/10 text-success text-xs font-bold hover:bg-success/20 disabled:opacity-50 transition-colors min-h-[44px]"
                        >
                          <CheckCircle2 size={13} /> Completar
                        </button>
                        <button
                          disabled={actionId === appt.id}
                          onClick={() => updateStatus(appt.id, 'no_show')}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-background-tertiary text-text-secondary text-xs font-bold hover:bg-danger/10 hover:text-danger disabled:opacity-50 transition-colors min-h-[44px]"
                        >
                          <UserX size={13} /> No apareció
                        </button>
                        <button
                          disabled={actionId === appt.id}
                          onClick={() => updateStatus(appt.id, 'cancelled')}
                          className="px-3 py-2.5 rounded-xl bg-background-tertiary text-text-tertiary text-xs font-bold hover:bg-danger/10 hover:text-danger disabled:opacity-50 transition-colors min-h-[44px]"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Cita detail drawer */}
      {detailAppt && (
        <>
          <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" onClick={() => setDetailAppt(null)} />
          <div className="fixed inset-x-0 bottom-0 z-[210] bg-background-secondary border border-border-strong rounded-t-2xl p-6 space-y-4 max-h-[85dvh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-text-primary">Detalle de cita</h3>
              <button onClick={() => setDetailAppt(null)} className="text-text-tertiary hover:text-text-primary p-2">✕</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-text-tertiary">Cliente</span><span className="font-bold">{detailAppt.clientName}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Servicio</span><span className="font-bold">{detailAppt.serviceName}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Fecha</span><span className="font-bold">{new Date(detailAppt.scheduled_at).toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Precio</span><span className="font-bold">{cop(detailAppt.price_charged ?? detailAppt.servicePrice)}</span></div>
              <div className="flex justify-between"><span className="text-text-tertiary">Estado</span><span className={`font-bold text-white text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[detailAppt.status]}`}>{STATUS_LABELS[detailAppt.status]}</span></div>
              {detailAppt.notes && <div className="flex justify-between"><span className="text-text-tertiary">Notas</span><span className="italic text-right max-w-[60%]">"{detailAppt.notes}"</span></div>}
            </div>
            {(detailAppt.status === 'confirmed' || detailAppt.status === 'pending') && (
              <div className="flex gap-2 pt-2 border-t border-border">
                <button onClick={() => updateStatus(detailAppt.id, 'completed')} disabled={actionId === detailAppt.id} className="flex-1 flex items-center justify-center gap-2 bg-success/10 text-success font-bold py-3 rounded-xl hover:bg-success/20 min-h-[44px] text-sm"><CheckCircle2 size={16} /> Completar</button>
                <button onClick={() => updateStatus(detailAppt.id, 'no_show')} disabled={actionId === detailAppt.id} className="flex-1 flex items-center justify-center gap-2 bg-background-tertiary text-text-secondary font-bold py-3 rounded-xl hover:bg-danger/10 hover:text-danger min-h-[44px] text-sm"><UserX size={16} /> No apareció</button>
              </div>
            )}
          </div>
        </>
      )}

      {/* FAB mobile */}
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
        onCreated={() => { setNuevaCitaOpen(false); fetchAppts(); }}
        barberId={session.barberId}
        barbershopId={session.barbershopId}
      />
    </div>
  );
}
