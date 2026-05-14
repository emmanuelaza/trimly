"use client";

import { useTransition, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { toggleAutomation } from '@/app/actions/barbershops';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface AutomationDef {
  id: string;
  type: string;
  group: string;
  emoji: string;
  title: string;
  desc: string;
  isNew?: boolean;
}

const AUTOMATION_DEFS: AutomationDef[] = [
  { id: "1", type: "reminder_24h",    group: "ANTES DE LA CITA",        emoji: "⏰", title: "Recordatorio 24h antes",       desc: "Envía un email automático recordando la cita del día siguiente." },
  { id: "2", type: "confirmation",    group: "ANTES DE LA CITA",        emoji: "✅", title: "Confirmación al agendar",      desc: "Mensaje inmediato con los detalles de la reserva." },
  { id: "3", type: "post_visit",      group: "DESPUÉS DE LA CITA",      emoji: "⭐", title: "Seguimiento post-visita",      desc: "¿Cómo te quedó el corte? Pide reseñas 24h después." },
  { id: "4", type: "daily_report",    group: "DESPUÉS DE LA CITA",      emoji: "📈", title: "Reporte diario al cierre",     desc: "Recibe en tu email un resumen del negocio cada noche." },
  { id: "5", type: "recover_inactive",group: "RETENCIÓN DE CLIENTES",   emoji: "💔", title: "Recuperar inactivos",          desc: "Mensaje a clientes que llevan más de 45 días sin venir.", isNew: true },
  { id: "6", type: "birthday",        group: "RETENCIÓN DE CLIENTES",   emoji: "🎂", title: "Felicitación de cumpleaños",   desc: "Envía un descuento sorpresa en el día especial del cliente." },
  { id: "7", type: "push_nueva_cita", group: "NOTIFICACIONES EN VIVO",  emoji: "🔔", title: "Notificación de nueva cita",   desc: "Recibe una alerta instantánea en el navegador cuando llegue una reserva.", isNew: true },
];

interface Props {
  initialAutomations: any[];
  stats: any;
  barbershopId: string;
  userId: string;
}

export default function AutomatizacionesClient({ initialAutomations, stats, barbershopId, userId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { subscribe, unsubscribe, status: pushStatus } = usePushNotifications(barbershopId, userId);

  // Local optimistic state so the toggle reacts instantly
  const [activeStates, setActiveStates] = useState<Record<string, boolean>>(
    () => Object.fromEntries(
      AUTOMATION_DEFS.map(def => [
        def.type,
        initialAutomations.find(a => a.type === def.type)?.is_active ?? false,
      ])
    )
  );

  const getIsActive = (type: string) => activeStates[type] ?? false;

  const handleToggle = (type: string, current: boolean) => {
    startTransition(async () => {
      try {
        if (type === 'push_nueva_cita') {
          if (!current) {
            if (!('Notification' in window) || !('serviceWorker' in navigator)) {
              toast.error('Tu navegador no soporta notificaciones push');
              return;
            }
            const ok = await subscribe();
            if (!ok) {
              toast.error('Necesitas permitir las notificaciones en el navegador para activar esto');
              return;
            }
          } else {
            await unsubscribe();
          }
        }

        // Optimistic update — changes the toggle immediately
        setActiveStates(prev => ({ ...prev, [type]: !current }));

        await toggleAutomation(type, !current);
        toast.success(current ? 'Desactivado correctamente' : 'Activado correctamente');
        router.refresh();
      } catch {
        // Revert on error
        setActiveStates(prev => ({ ...prev, [type]: current }));
        toast.error('Error al actualizar');
      }
    });
  };

  const grouped = AUTOMATION_DEFS.reduce((acc: Record<string, AutomationDef[]>, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Automatizaciones</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Trimly trabaja por ti mientras tú cortas. El sistema funcionando en piloto automático.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="CITAS RECORDADAS"    value={stats.recordadas}  sub="este mes"    color="success" />
        <StatCard label="CLIENTES RECUPERADOS" value={stats.recuperados} sub="último mes"  color="accent" />
        <StatCard label="NO-SHOWS EVITADOS"   value={stats.evitados}    sub="estimados"   color="info" />
      </div>

      <div className="max-w-4xl space-y-10">
        {Object.entries(grouped).map(([groupName, items]) => (
          <div key={groupName}>
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em] mb-4">
              {groupName}
            </h2>
            <div className="grid gap-3">
              {items.map(item => {
                const isActive = getIsActive(item.type);
                const isPush = item.type === 'push_nueva_cita';
                const pushBlocked = isPush && pushStatus === 'denied';

                return (
                  <Card
                    key={item.id}
                    className={`p-5 flex items-start sm:items-center justify-between gap-4 border-border-strong transition-all ${
                      isActive ? 'border-accent/30 bg-accent-muted/5' : 'hover:border-border-stronger'
                    }`}
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-2xl leading-none mt-1">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                          {item.isNew && (
                            <span className="bg-accent-muted text-accent px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                              Nuevo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-text-secondary">{item.desc}</p>
                        {pushBlocked && (
                          <p className="text-xs text-warning mt-1">
                            Notificaciones bloqueadas en el navegador. Actívalas desde la configuración del sitio.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <label
                        className={`relative inline-flex items-center ${
                          isPending || pushBlocked ? 'opacity-50 pointer-events-none' : 'cursor-pointer'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={isActive}
                          onChange={() => handleToggle(item.type, isActive)}
                          disabled={isPending || pushBlocked}
                        />
                        <div className="w-12 h-6 bg-border-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-checked:after:bg-background-primary mr-2" />
                        <span className="text-xs font-medium text-text-tertiary w-14 text-right">
                          {isActive ? 'Activo' : 'Pausado'}
                        </span>
                      </label>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
