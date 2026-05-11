import { getAppointments } from '@/app/actions/appointments';
import { getBarbershop } from '@/app/actions/barbershops';
import Link from 'next/link';
import { Plus, Clock, CheckCircle2, ChevronRight, BarChart3, Link2, Calendar, Users, DollarSign } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { AppointmentRow } from '@/components/appointments/AppointmentRow';

import { formatTime, getTodayString, getLocalDay } from '@/lib/dateUtils';

export const revalidate = 60;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatCOP(n: number) {
  return `$${n.toLocaleString('es-CO')}`;
}

export default async function DashboardHome() {
  const barbershop = await getBarbershop();
  const barbershopName = barbershop?.name?.split(' ')[0] || 'Dueño';

  const allCitas = await getAppointments();
  const todayStr = getTodayString();
  const now = new Date();

  const citasHoy = allCitas
    .filter((c: any) => getLocalDay(c.scheduled_at) === todayStr)
    .sort((a: any, b: any) =>
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    );

  const ingresosHoy = citasHoy.reduce(
    (acc: number, c: any) => acc + (Number(c.price_charged) || 0),
    0
  );
  const completadas = citasHoy.filter((c: any) => c.status === 'completed').length;
  const pendientes  = citasHoy.filter(
    (c: any) => c.status !== 'completed' && c.status !== 'cancelled'
  ).length;

  const activeTurn = citasHoy.find((c: any) => {
    const diff = (now.getTime() - new Date(c.scheduled_at).getTime()) / 60000;
    return diff >= 0 && diff < 45 && c.status !== 'completed';
  }) ?? null;

  const nextCita = citasHoy.find((c: any) =>
    new Date(c.scheduled_at) > now && c.status !== 'completed'
  ) ?? null;

  const getTimeLeft = (iso: string) => {
    const diff = Math.floor((new Date(iso).getTime() - now.getTime()) / 60000);
    return diff > 0 ? `${diff} min` : 'Ahora';
  };

  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);

  return (
    <div className="space-y-6 pb-2">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between gap-4 animate-slideUp">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">
            {getGreeting()}, {barbershopName} ✂️
          </h1>
          <p className="text-sm text-text-muted mt-0.5 capitalize">
            {dateLabel} · {citasHoy.length} citas hoy
          </p>
        </div>
        <Link href="/dashboard/agenda">
          <Button
            size="sm"
            leftIcon={<Plus size={14} />}
            className="flex-shrink-0"
          >
            Nueva cita
          </Button>
        </Link>
      </div>

      {/* ── ALERTA TURNO ACTIVO ── */}
      {activeTurn && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-success/8 border border-success/20 animate-slideUp">
          <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={15} className="text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">
              En silla ahora — {(activeTurn as any).client?.name}
            </p>
            <p className="text-xs text-text-muted">
              {(activeTurn as any).service?.name} · inició a las {formatTime(activeTurn.scheduled_at)}
            </p>
          </div>
          <button className="bg-success-bg border border-success/30 text-success text-xs font-semibold px-4 py-2 rounded-lg hover:bg-success hover:text-text-inverse transition-all flex items-center gap-1.5 flex-shrink-0">
            Completar <CheckCircle2 size={13} />
          </button>
        </div>
      )}

      {/* ── PRÓXIMA CITA ── */}
      {!activeTurn && nextCita && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-warning/8 border border-warning/20 animate-slideUp">
          <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center flex-shrink-0">
            <Clock size={15} className="text-warning" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">
              Próxima cita en {getTimeLeft(nextCita.scheduled_at)}
            </p>
            <p className="text-xs text-text-muted">
              {(nextCita as any).client?.name} · {(nextCita as any).service?.name}
            </p>
          </div>
        </div>
      )}

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Ingresos hoy"
          value={formatCOP(ingresosHoy)}
          icon={DollarSign}
          color="success"
          className="animate-slideUp stagger-1"
        />
        <StatCard
          label="Citas hoy"
          value={citasHoy.length}
          sub={`${completadas} completadas`}
          icon={Calendar}
          color="accent"
          className="animate-slideUp stagger-2"
        />
        <StatCard
          label="Pendientes"
          value={pendientes}
          sub="por completar"
          icon={Clock}
          color={pendientes > 0 ? 'warning' : 'neutral'}
          className="animate-slideUp stagger-3"
        />
        <StatCard
          label="Completadas"
          value={completadas}
          sub={citasHoy.length > 0 ? `de ${citasHoy.length} total` : 'sin citas'}
          icon={CheckCircle2}
          color="success"
          className="animate-slideUp stagger-4"
        />
      </div>

      {/* ── DOS COLUMNAS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* AGENDA DEL DÍA — 60% */}
        <div className="lg:col-span-3 animate-slideUp stagger-3">
          <Card>
            <CardHeader>
              <CardTitle>Agenda de hoy</CardTitle>
              <Link href="/dashboard/agenda">
                <Button variant="ghost" size="xs" rightIcon={<ChevronRight size={12} />}>
                  Ver completa
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {citasHoy.length === 0 ? (
                <EmptyState
                  icon="📅"
                  title="Sin citas para hoy"
                  description="Comparte tu link de reservas para recibir citas automáticamente."
                  action={{ label: 'Ir a Mi Página', href: '/dashboard/pagina' }}
                />
              ) : (
                <div className="space-y-2">
                  {citasHoy.map((cita: any, i: number) => (
                    <AppointmentRow
                      key={cita.id}
                      appointment={{
                        id: cita.id,
                        time: formatTime(cita.scheduled_at),
                        clientName: (cita as any).client?.name || 'Cliente',
                        service: (cita as any).service?.name || 'Servicio',
                        barberName: (cita as any).barber?.name,
                        status: cita.status,
                        price: Number(cita.price_charged) || undefined,
                      }}
                      className={`stagger-${Math.min(i + 1, 6)}`}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PANEL LATERAL — 40% */}
        <div className="lg:col-span-2 space-y-4 animate-slideUp stagger-4">

          {/* Resumen semanal */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Resumen semanal
            </p>
            <div className="flex items-end justify-between h-20 gap-1 mb-2">
              {[35, 65, 45, 90, 55, 30, 10].map((h, i) => (
                <div key={i} className="flex-1 bg-background-tertiary rounded-t-sm relative group h-full">
                  <div
                    className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all ${i === 3 ? 'bg-primary' : 'bg-border-strong group-hover:bg-primary/60'}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-text-muted font-mono mb-3">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={i}>{d}</span>
              ))}
            </div>
            <div className="pt-3 border-t border-border space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Ingresos</span>
                <span className="font-semibold text-text-primary">{formatCOP(ingresosHoy)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Citas</span>
                <span className="font-semibold text-text-primary">{citasHoy.length}</span>
              </div>
            </div>
          </Card>

          {/* Acciones rápidas */}
          <Card padding="sm">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Acciones rápidas
            </p>
            <div className="space-y-2">
              <Link href="/dashboard/pagina" className="block">
                <Button variant="secondary" size="sm" leftIcon={<Link2 size={13} />} className="w-full justify-start">
                  Compartir mi link
                </Button>
              </Link>
              <Link href="/dashboard/reportes" className="block">
                <Button variant="secondary" size="sm" leftIcon={<BarChart3 size={13} />} className="w-full justify-start">
                  Ver reportes
                </Button>
              </Link>
              <Link href="/dashboard/clientes" className="block">
                <Button variant="secondary" size="sm" leftIcon={<Users size={13} />} className="w-full justify-start">
                  Ver clientes
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
