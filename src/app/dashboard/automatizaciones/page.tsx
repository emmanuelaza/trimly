import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';

export default function AutomatizacionesPage() {
  const automations = [
    {
      id: "recordatorio_24h",
      group: "ANTES DE LA CITA",
      emoji: "⏰",
      title: "Recordatorio 24h antes",
      desc: "Envía un WhatsApp o Email automático recordando la cita del día siguiente.",
      active: true,
    },
    {
      id: "confirmacion_inmediata",
      group: "ANTES DE LA CITA",
      emoji: "✅",
      title: "Confirmación al agendar",
      desc: "Mensaje inmediato con los detalles de la reserva.",
      active: true,
    },
    {
      id: "seguimiento_post",
      group: "DESPUÉS DE LA CITA",
      emoji: "⭐",
      title: "Seguimiento post-visita",
      desc: "¿Cómo te quedó el corte? Pide reseñas 24h después.",
      active: false,
    },
    {
      id: "reporte_diario",
      group: "DESPUÉS DE LA CITA",
      emoji: "📈",
      title: "Reporte diario al cierre",
      desc: "Recibe en tu email un resumen de cómo le fue al negocio hoy a las 8PM.",
      active: true,
    },
    {
      id: "recuperar_inactivos",
      group: "RETENCIÓN DE CLIENTES",
      emoji: "💔",
      title: "Recuperar inactivos",
      desc: "Mensaje automático a los clientes que llevan más de 45 días sin venir.",
      active: false,
      isNew: true,
    },
    {
      id: "cumpleanos",
      group: "RETENCIÓN DE CLIENTES",
      emoji: "🎂",
      title: "Felicitación de cumpleaños",
      desc: "Envía un descuento sorpresa en el día especial del cliente.",
      active: false,
    }
  ];

  const grouped = automations.reduce((acc: Record<string, typeof automations>, curr) => {
    if (!acc[curr.group]) acc[curr.group] = [];
    acc[curr.group].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Automatizaciones</h1>
        <p className="text-sm text-text-tertiary mt-1">
          Trimly trabaja por ti mientras tú cortas. Todo el sistema funcionando en piloto automático.
        </p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="CITAS RECORDADAS" value="47" sub="este mes" color="success" />
        <StatCard label="CLIENTES RECUPERADOS" value="8" sub="último mes" color="accent" />
        <StatCard label="NO-SHOWS EVITADOS" value="12" sub="estimados" color="info" />
      </div>

      <div className="max-w-4xl space-y-10">
        {Object.entries(grouped).map(([groupName, items]) => (
          <div key={groupName}>
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-[0.15em] mb-4">
              {groupName}
            </h2>
            <div className="grid gap-3">
              {items.map(item => (
                <Card key={item.id} className="p-5 flex items-start sm:items-center justify-between gap-4 border-border-strong hover:border-accent/40 transition-colors">
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
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked={item.active} />
                      <div className="w-12 h-6 bg-border-strong peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent peer-checked:after:bg-background-primary mr-2" />
                      <span className="text-xs font-medium text-text-tertiary">
                        {item.active ? 'Activo' : 'Pausado'}
                      </span>
                    </label>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
