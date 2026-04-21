"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, MessageCircle, Trash2, Scissors, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { deleteAppointment } from '@/app/actions/appointments';

interface Props {
  citas: any[];       // day-filtered citas (for day view)
  allCitas?: any[];   // all citas (for week view — falls back to citas)
  clientes: any[];
  servicios: any[];
  filterDate: string;
}


// 8am – 9pm
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8);

function formatHour(h: number) {
  const period = h >= 12 ? 'pm' : 'am';
  const h12 = h > 12 ? h - 12 : h;
  return `${h12}:00 ${period}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function weekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // Monday as start
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
}

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

/* ── Day View ─────────────────────────────────────────── */
function DayView({ citas, filterDate, currentTimeOffset }: { citas: any[]; filterDate: string; currentTimeOffset: number }) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const isToday = filterDate === todayStr;
  const currentMin = now.getMinutes();

  const getCitasInHour = (hour: number) =>
    citas.filter(c => new Date(c.scheduled_at).getHours() === hour);

  return (
    <Card className="p-0 overflow-hidden bg-background-primary">
      <div className="flex flex-col divide-y divide-border">
        {HOURS.map(hour => {
          const citasInHour = getCitasInHour(hour);
          const isCurrentHour = isToday && hour === now.getHours();

          return (
            <div key={hour} className="group flex min-h-[80px] relative">
              {/* Hour gutter */}
              <div className="w-20 sm:w-24 py-3 px-3 sm:px-4 border-r border-border bg-background-secondary/40 flex-shrink-0 flex flex-col items-end">
                <span className="text-[11px] font-mono font-semibold text-text-tertiary group-hover:text-text-secondary transition-colors">
                  {formatHour(hour)}
                </span>
              </div>

              {/* Content area */}
              <div className="flex-1 p-2 relative">
                {/* Current time line */}
                {isCurrentHour && (
                  <div
                    className="absolute left-0 right-0 z-10 flex items-center pointer-events-none"
                    style={{ top: `${(currentMin / 60) * 100}%` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-danger flex-shrink-0 ring-2 ring-danger/30" />
                    <div className="flex-1 h-px bg-danger" />
                  </div>
                )}

                {citasInHour.length > 0 ? (
                  <div className="flex flex-col gap-1.5">
                    {citasInHour.map((cita: any) => (
                      <div
                        key={cita.id}
                        className="bg-accent-muted border-l-4 border-accent rounded-r-xl px-3 py-2.5 flex justify-between items-start"
                      >
                        <div className="flex items-center gap-2.5">
                          <Avatar
                            fallback={cita.client?.name?.substring(0, 2).toUpperCase() || '??'}
                            size="sm"
                          />
                          <div>
                            <p className="text-sm font-semibold text-text-primary leading-tight">{cita.client?.name}</p>
                            <p className="text-[11px] text-accent/80 font-medium flex items-center gap-1 mt-0.5">
                              <Scissors size={9} />
                              {cita.service?.name} · {new Date(cita.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {cita.client?.phone && (
                            <a
                              href={`https://wa.me/${cita.client.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors"
                            >
                              <MessageCircle size={14} />
                            </a>
                          )}
                          <button
                            onClick={async () => await deleteAppointment(cita.id)}
                            className="p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <button className="h-full w-full rounded-xl hover:bg-background-tertiary/60 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 text-text-tertiary">
                    <Plus size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ── Week View ─────────────────────────────────────────── */
function WeekView({ allCitas, weekDays }: { allCitas: any[]; weekDays: string[] }) {
  const todayStr = new Date().toISOString().split('T')[0];

  const getCitasForDay = (dateStr: string) =>
    allCitas.filter((c: any) => c.scheduled_at.startsWith(dateStr)).sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  return (
    <Card className="p-0 overflow-hidden bg-background-primary">
      {/* Header row */}
      <div className="grid border-b border-border" style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}>
        <div className="border-r border-border" />
        {weekDays.map(day => {
          const isToday = day === todayStr;
          return (
            <div
              key={day}
              className={`py-3 text-center border-r border-border last:border-r-0 ${isToday ? 'bg-accent-muted' : ''}`}
            >
              <p className={`text-[10px] uppercase font-bold tracking-wider ${isToday ? 'text-accent' : 'text-text-tertiary'}`}>
                {new Date(day).toLocaleDateString('es-CO', { weekday: 'short' })}
              </p>
              <p className={`text-base font-semibold mt-0.5 ${isToday ? 'text-accent' : 'text-text-primary'}`}>
                {new Date(day).getDate()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Time rows */}
      <div className="max-h-[600px] overflow-y-auto">
        {HOURS.map(hour => (
          <div
            key={hour}
            className="grid border-b border-border last:border-b-0 min-h-[60px]"
            style={{ gridTemplateColumns: `80px repeat(7, 1fr)` }}
          >
            {/* Hour label */}
            <div className="border-r border-border bg-background-secondary/30 flex items-start justify-end px-2 pt-1.5">
              <span className="text-[10px] font-mono text-text-tertiary">{formatHour(hour)}</span>
            </div>

            {/* Day columns */}
            {weekDays.map(day => {
              const citasThisSlot = getCitasForDay(day).filter(c => new Date(c.scheduled_at).getHours() === hour);
              const isToday = day === todayStr;
              return (
                <div
                  key={day}
                  className={`border-r border-border last:border-r-0 p-1 ${isToday ? 'bg-accent-muted/20' : 'hover:bg-background-tertiary/30 transition-colors'}`}
                >
                  {citasThisSlot.map((cita: any) => (
                    <div
                      key={cita.id}
                      className="bg-accent-muted border-l-2 border-accent rounded-r-md px-1.5 py-1 mb-0.5"
                    >
                      <p className="text-[10px] font-semibold text-text-primary truncate leading-tight">{cita.client?.name}</p>
                      <p className="text-[9px] text-accent/70 truncate">{cita.service?.name}</p>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── Main Export ───────────────────────────────────────── */
export const AgendaTimeline: React.FC<Props> = ({ citas, allCitas, clientes, servicios, filterDate }) => {
  const router = useRouter();
  const [view, setView] = useState<'dia' | 'semana'>('dia');

  const now = new Date();

  const changeDate = (days: number) => {
    const next = addDays(filterDate, days);
    router.push(`/dashboard/agenda?date=${next}`);
  };

  // Week days starting Monday
  const weekDays = useMemo(() => {
    const start = weekStart(filterDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [filterDate]);

  const weekLabel = `${formatDateShort(weekDays[0])} – ${formatDateShort(weekDays[6])} ${new Date(weekDays[0]).getFullYear()}`;

  // For week view we need all citas (passed as prop), for day view we already filter upstream
  const currentTimeOffset = (now.getHours() - 8) * 80 + (now.getMinutes() / 60) * 80;

  return (
    <div className="space-y-6">
      {/* ── Navigation header ──────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Date navigator */}
        <div className="flex items-center gap-1 bg-background-secondary border border-border p-1 rounded-xl">
          <button
            onClick={() => changeDate(view === 'dia' ? -1 : -7)}
            className="p-2 hover:bg-background-tertiary rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="px-4 py-1 text-sm font-semibold text-text-primary min-w-[200px] text-center">
            {view === 'dia' ? formatDateLong(filterDate) : weekLabel}
          </div>
          <button
            onClick={() => changeDate(view === 'dia' ? 1 : 7)}
            className="p-2 hover:bg-background-tertiary rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/dashboard/agenda?date=${now.toISOString().split('T')[0]}`)}
          >
            Hoy
          </Button>

          {/* View toggle */}
          <div className="inline-flex bg-background-tertiary rounded-lg p-1">
            <button
              onClick={() => setView('dia')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === 'dia' ? 'bg-border-strong text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Día
            </button>
            <button
              onClick={() => setView('semana')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === 'semana' ? 'bg-border-strong text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              Semana
            </button>
          </div>

          <Button size="sm" onClick={() => router.push('?new=1')}>
            <Plus size={16} /> Agendar
          </Button>
        </div>
      </div>

      {/* ── View ────────────────────────────────────────── */}
      <div className="page-fade">
        {view === 'dia' ? (
          <DayView
            citas={citas}
            filterDate={filterDate}
            currentTimeOffset={currentTimeOffset}
          />
        ) : (
          <WeekView
            allCitas={allCitas ?? citas}
            weekDays={weekDays}
          />
        )}
      </div>
    </div>
  );
};
