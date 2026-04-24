"use client";

import React, { useTransition } from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { toggleAutomation } from '@/app/actions/barbershops';
import toast from 'react-hot-toast';

interface AutomationDef {
  id: string;
  type: any;
  group: string;
  emoji: string;
  title: string;
  desc: string;
  isNew?: boolean;
}

const AUTOMATION_DEFS: AutomationDef[] = [
  { id: "1", type: "reminder_24h", group: "ANTES DE LA CITA", emoji: "⏰", title: "Recordatorio 24h antes", desc: "Envía un Email automático recordando la cita del día siguiente." },
  { id: "2", type: "confirmation", group: "ANTES DE LA CITA", emoji: "✅", title: "Confirmación al agendar", desc: "Mensaje inmediato con los detalles de la reserva." },
  { id: "3", type: "post_visit", group: "DESPUÉS DE LA CITA", emoji: "⭐", title: "Seguimiento post-visita", desc: "¿Cómo te quedó el corte? Pide reseñas 24h después." },
  { id: "4", type: "daily_report", group: "DESPUÉS DE LA CITA", emoji: "📈", title: "Reporte diario al cierre", desc: "Recibe en tu email un resumen de cómo le fue al negocio hoy a las 8PM." },
  { id: "5", type: "recover_inactive", group: "RETENCIÓN DE CLIENTES", emoji: "💔", title: "Recuperar inactivos", desc: "Mensaje automático a los clientes que llevan más de 45 días sin venir.", isNew: true },
  { id: "6", type: "birthday", group: "RETENCIÓN DE CLIENTES", emoji: "🎂", title: "Felicitación de cumpleaños", desc: "Envía un descuento sorpresa en el día especial del cliente." }
];

export default function AutomatizacionesClient({ initialAutomations, stats }: { initialAutomations: any[], stats: any }) {
  const [isPending, startTransition] = useTransition();

  const getIsActive = (type: string) => initialAutomations.find(a => a.type === type)?.is_active || false;

  const handleToggle = (type: string, current: boolean) => {
    startTransition(async () => {
      try {
        await toggleAutomation(type, !current);
        toast.success(`${current ? 'Desactivado' : 'Activado'} correctamente`);
      } catch (e) {
        toast.error("Error al actualizar");
      }
    });
  };

  const grouped = AUTOMATION_DEFS.reduce((acc: Record<string, typeof AUTOMATION_DEFS>, curr) => {
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
        <StatCard label="CITAS RECORDADAS" value={stats.recordadas} sub="este mes" color="success" />
        <StatCard label="CLIENTES RECUPERADOS" value={stats.recuperados} sub="último mes" color="accent" />
        <StatCard label="NO-SHOWS EVITADOS" value={stats.evitados} sub="estimados" color="info" />
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
                return (
                  <Card key={item.id} className={`p-5 flex items-start sm:items-center justify-between gap-4 border-border-strong transition-all ${isActive ? 'border-accent/30 bg-accent-muted/5' : 'hover:border-border-stronger'}`}>
                    <div className="flex items-start gap-4 flex-1">
                      <span className="text-2xl leading-none mt-1">{item.emoji}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary text-sm">{item.title}</h3>
                          {item.isNew && <span className="bg-accent-muted text-accent px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Nuevo</span>}
                        </div>
                        <p className="text-sm text-text-secondary">{item.desc}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <label className={`relative inline-flex items-center cursor-pointer ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={isActive} 
                          onChange={() => handleToggle(item.type, isActive)} 
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
