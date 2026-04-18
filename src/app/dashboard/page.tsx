import { getCitas } from '@/app/actions/citas';
import Link from 'next/link';
import { Plus, Clock, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 60;

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.negocio || user?.user_metadata?.full_name || "Barbero";
  
  const allCitas = await getCitas();
  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  // Filtrar citas hoy y ordenar por hora
  const citasHoy = allCitas
    .filter((c: any) => c.fecha === todayStr)
    .sort((a: any, b: any) => a.hora.localeCompare(b.hora));

  const ingresosHoy = citasHoy.reduce((acc: number, c: any) => acc + (Number(c.precio_cobrado) || 0), 0);
  const completadas = citasHoy.filter((c: any) => c.estado === 'completada').length;
  const pendientes = citasHoy.length - completadas;

  // Encontrar turno activo (muy simplificado: cita más cercana pasada que no esté completada o la actual)
  const activeTurn = citasHoy.find((c: any) => {
    const [h, m] = c.hora.split(':').map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(h, m, 0);
    // Margen de 45 min para considerarlo "en silla"
    const diff = (now.getTime() - appointmentTime.getTime()) / (1000 * 60);
    return diff >= 0 && diff < 45 && c.estado !== 'completada';
  }) || null;

  // Próxima cita
  const nextCita = citasHoy.find((c: any) => {
    const [h, m] = c.hora.split(':').map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(h, m, 0);
    return appointmentTime > now;
  }) || null;

  const getTimeLeft = (hora: string) => {
    const [h, m] = hora.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0);
    const diff = Math.floor((target.getTime() - now.getTime()) / (1000 * 60));
    return diff > 0 ? `${diff} min` : "Ahora";
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="space-y-10">
      {/* 1.1 Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] text-text-tertiary uppercase tracking-[0.2em] font-bold">
            {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)}
          </p>
          <h1 className="text-3xl font-semibold text-text-primary mt-1">Buenos días, {userName.split(' ')[0]}</h1>
        </div>
        <Link href="/dashboard/agenda">
          <Button className="w-full md:w-auto">
            <Plus size={18} /> Nueva cita
          </Button>
        </Link>
      </div>

      {/* 1.2 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          label="Citas Hoy" 
          value={citasHoy.length} 
          sub={`${completadas} completadas · ${pendientes} pendientes`} 
        />
        <StatCard 
          label="Ingresos (COP)" 
          value={`$${ingresosHoy.toLocaleString()}`} 
          sub={`$${(ingresosHoy / 4000).toFixed(2)} USD aprox`}
          trend="↑ 12%" 
        />
        <StatCard 
          label="Próxima Cita" 
          value={nextCita ? getTimeLeft(nextCita.hora) : "--"} 
          sub={nextCita ? `${nextCita.cliente?.nombre} · ${nextCita.servicio?.nombre}` : "No hay más citas"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Columna Izquierda: Turno y Cola */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* 1.3 Turno Activo (Hero) */}
          <section>
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">Actualidad</h2>
            {activeTurn ? (
              <Card className="border-accent/30 ring-1 ring-accent/10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider">En silla ahora</span>
                  </div>
                  <span className="text-xs text-text-tertiary font-mono">Inició {activeTurn.hora.substring(0, 5)}</span>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-text-primary mb-1">{activeTurn.cliente?.nombre}</p>
                    <p className="text-sm text-text-secondary">{activeTurn.servicio?.nombre} · ${Number(activeTurn.precio_cobrado).toLocaleString()}</p>
                    <p className="text-xs text-text-tertiary mt-2">Cliente regular · {activeTurn.cliente?.notas || 'Sin notas'}</p>
                  </div>
                  <Button variant="primary" className="bg-success-bg text-success hover:bg-success hover:text-background-primary border border-success/20">
                    Completar <CheckCircle2 size={16} />
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="bg-background-secondary/50 border border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-background-tertiary flex items-center justify-center mb-4 text-text-tertiary">
                   <Clock size={24} />
                </div>
                <p className="text-sm font-medium text-text-secondary">Sin turno activo</p>
                <p className="text-xs text-text-tertiary mt-1">
                  {nextCita ? `Próxima cita en ${getTimeLeft(nextCita.hora)}` : "Relájate, no hay más citas por ahora."}
                </p>
              </div>
            )}
          </section>

          {/* 1.4 Cola de espera */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Cola de espera</h2>
              <Link href="/dashboard/agenda" className="text-xs text-accent hover:underline px-2 py-1">Ver agenda completa</Link>
            </div>
            
            <div className="space-y-1">
              {citasHoy.length === 0 ? (
                <Card className="flex flex-col items-center py-12 text-center border-dashed">
                   <User size={32} className="text-text-tertiary mb-3 opacity-20" />
                   <p className="text-sm text-text-secondary">No hay citas programadas para hoy</p>
                </Card>
              ) : (
                citasHoy.map((cita: any) => {
                  const isPast = nextCita && cita.hora < (nextCita?.hora || "");
                  const isNext = nextCita?.id === cita.id;
                  
                  return (
                    <div 
                      key={cita.id} 
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all group cursor-pointer ${
                        isNext ? 'bg-background-secondary border border-border sm:translate-x-1' : 'hover:bg-background-secondary/50'
                      } ${isPast && cita.estado === 'completada' ? 'opacity-40' : ''}`}
                    >
                      <Avatar fallback={getInitials(cita.cliente?.nombre || "C")} className="flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{cita.cliente?.nombre}</p>
                        <p className="text-xs text-text-tertiary">{cita.servicio?.nombre} · {cita.hora.substring(0, 5)}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-mono text-text-secondary">${Number(cita.precio_cobrado).toLocaleString()}</p>
                        {isNext ? (
                          <Badge variant="warning">En {getTimeLeft(cita.hora)}</Badge>
                        ) : cita.estado === 'completada' ? (
                          <Badge variant="success">Listo</Badge>
                        ) : (
                          <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-tighter">Pendiente</span>
                        )}
                      </div>
                      
                      <div className="hidden group-hover:flex items-center ml-2 text-text-tertiary">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Columna Derecha: Panel Lateral (Stats extra) */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="bg-background-primary">
              <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">Resumen Semanal</h3>
              {/* Aquí iría un gráfico pequeño o resumen de productividad */}
              <div className="space-y-4">
                 <div className="flex justify-between items-end h-24 gap-1">
                    {[35, 65, 45, 90, 55, 30, 10].map((h, i) => (
                      <div key={i} className="flex-1 bg-background-tertiary rounded-t-sm relative group">
                        <div 
                          className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all group-hover:bg-accent-text ${i === 3 ? 'bg-accent' : 'bg-border-strong'}`} 
                          style={{ height: `${h}%` }}
                        />
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between text-[10px] text-text-tertiary font-mono">
                    <span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span>
                 </div>
                 <div className="pt-4 border-t border-border mt-4">
                    <p className="text-xs text-text-secondary">Día más productivo: <span className="text-text-primary font-bold">Jueves</span></p>
                    <p className="text-[10px] text-text-tertiary mt-1">Promedio: $450k / día</p>
                 </div>
              </div>
           </Card>

           <Card className="bg-background-primary">
              <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4">Acciones de Fidelización</h3>
              <div className="space-y-4">
                 <div className="p-3 bg-accent-muted rounded-lg border border-accent/10">
                    <p className="text-xs font-medium text-accent">¡Recupera a Juan!</p>
                    <p className="text-[10px] text-accent/70 mt-0.5">No nos visita hace 22 días. ¿Enviar recordatorio?</p>
                    <Button variant="primary" className="w-full mt-3 py-1.5 text-xs h-auto">Contactar ahora</Button>
                 </div>
                 <div className="p-3 bg-background-tertiary rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                       <div>
                          <p className="text-xs font-medium text-text-primary">Aniversario: Carlos</p>
                          <p className="text-[10px] text-text-tertiary mt-0.5">Hoy cumple 1 año como cliente.</p>
                       </div>
                       <Badge variant="info">VIP</Badge>
                    </div>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
