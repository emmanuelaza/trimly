"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, MessageCircle, Trash2, Scissors, Plus } from 'lucide-react';
import { Card, Button, Avatar, Badge } from '@/components/ui/RedesignComponents';
import { deleteCita } from '@/app/actions/citas';

interface Props {
  citas: any[];
  clientes: any[];
  servicios: any[];
  filterDate: string;
}

export const AgendaTimeline: React.FC<Props> = ({ citas, clientes, servicios, filterDate }) => {
  const router = useRouter();
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8am to 9pm
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  const changeDate = (days: number) => {
    const d = new Date(filterDate);
    d.setDate(d.getDate() + days);
    router.push(`/dashboard/agenda?date=${d.toISOString().split('T')[0]}`);
  };

  const getCitaInSlot = (hour: number) => {
    return citas.filter(c => {
      const h = parseInt(c.hora.split(':')[0]);
      return h === hour;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Navegación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-1 bg-background-secondary border border-border p-1 rounded-xl">
           <button onClick={() => changeDate(-1)} className="p-2 hover:bg-background-tertiary rounded-lg text-text-secondary hover:text-text-primary transition-colors">
             <ChevronLeft size={20} />
           </button>
           <div className="px-6 py-1.5 text-sm font-semibold text-text-primary">
             {new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(filterDate))}
           </div>
           <button onClick={() => changeDate(1)} className="p-2 hover:bg-background-tertiary rounded-lg text-text-secondary hover:text-text-primary transition-colors">
             <ChevronRight size={20} />
           </button>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="secondary" className="h-10" onClick={() => router.push(`/dashboard/agenda?date=${new Date().toISOString().split('T')[0]}`)}>
             Hoy
           </Button>
           <Button variant="primary" className="h-10">
             <Plus size={18} /> Agendar
           </Button>
        </div>
      </div>

      {/* Timeline Grid */}
      <Card className="p-0 overflow-hidden bg-background-primary">
        <div className="flex flex-col">
          {hours.map((hour) => {
            const citasInHour = getCitaInSlot(hour);
            const isNow = hour === currentHour && filterDate === new Date().toISOString().split('T')[0];

            return (
              <div key={hour} className="group flex min-h-[100px] border-b border-border last:border-0 relative">
                {/* Horario */}
                <div className="w-20 sm:w-24 py-4 px-2 sm:px-4 border-r border-border bg-background-secondary/30 flex flex-col items-end">
                   <span className="text-xs font-mono font-bold text-text-secondary group-hover:text-text-primary transition-colors">
                     {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'pm' : 'am'}
                   </span>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-2 relative">
                  {/* Línea de hora actual */}
                  {isNow && (
                    <div className="absolute top-0 left-0 right-0 z-10" style={{ transform: `translateY(${currentMin * 1.66}px)` }}>
                      <div className="h-px bg-danger w-full relative">
                         <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-danger ring-4 ring-danger/20" />
                      </div>
                    </div>
                  )}

                  {/* Slots de citas */}
                  <div className="h-full flex flex-col gap-2">
                    {citasInHour.length > 0 ? (
                      citasInHour.map(cita => (
                        <div key={cita.id} className="bg-accent-muted border-l-4 border-accent rounded-r-lg p-3 flex justify-between items-start animate-in fade-in slide-in-from-left-2 duration-300">
                           <div className="flex items-start gap-3">
                              <Avatar initials={cita.cliente?.nombre?.substring(0,2).toUpperCase()} className="w-8 h-8 text-[10px]" />
                              <div>
                                 <p className="text-sm font-semibold text-text-primary">{cita.cliente?.nombre}</p>
                                 <p className="text-[10px] text-accent/80 font-medium uppercase tracking-tight flex items-center gap-1 mt-0.5">
                                    <Scissors size={10} /> {cita.servicio?.nombre} · {cita.hora.substring(0, 5)}
                                 </p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                             {cita.cliente?.telefono && (
                               <a 
                                 href={`https://wa.me/${cita.cliente.telefono.replace(/\D/g, '')}`} 
                                 target="_blank" 
                                 className="p-1.5 text-success hover:bg-success/10 rounded-md transition-colors"
                               >
                                 <MessageCircle size={16} />
                               </a>
                             )}
                             <button 
                               onClick={async () => await deleteCita(cita.id)}
                               className="p-1.5 text-text-tertiary hover:text-danger hover:bg-danger/10 rounded-md transition-colors"
                             >
                               <Trash2 size={16} />
                             </button>
                           </div>
                        </div>
                      ))
                    ) : (
                      <button className="h-full w-full rounded-lg hover:bg-background-tertiary/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Plus size={16} className="text-text-tertiary" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
