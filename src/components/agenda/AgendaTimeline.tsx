"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, Scissors, User2, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { AppointmentForm } from './AppointmentForm';
import { AppointmentDetails } from './AppointmentDetails';

interface Props {
  allCitas: any[];
  clientes: any[];
  servicios: any[];
  barberos: any[];
  initialDate: string;
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

function getDayName(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'long' });
}

export const AgendaTimeline: React.FC<Props> = ({ allCitas = [], clientes, servicios, barberos, initialDate }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [filterDate, setFilterDate] = useState(initialDate);
  const [isMobile, setIsMobile] = useState(false);
  
  // Side Panel State
  const [panelMode, setPanelMode] = useState<'none' | 'new' | 'details' | 'edit'>('none');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentWeekStart = useMemo(() => weekStart(filterDate), [filterDate]);
  const weekDays = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => addDays(currentWeekStart, i)); // Lunes a Sábado
  }, [currentWeekStart]);

  const changeWeek = (n: number) => {
    setFilterDate(addDays(filterDate, n * 7));
  };

  const getCitasForDay = (dayStr: string) => {
    return allCitas.filter(c => {
      const d = new Date(c.scheduled_at);
      const isoLocal = d.getFullYear() + "-" + 
                       String(d.getMonth() + 1).padStart(2, '0') + "-" + 
                       String(d.getDate()).padStart(2, '0');
      return isoLocal === dayStr;
    }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  };

  const handleCitaClick = (cita: any) => {
    setSelectedAppointment(cita);
    setPanelMode('details');
  };

  const handleNewClick = () => {
    setSelectedAppointment(null);
    setPanelMode('new');
  };

  const AppointmentCard = ({ cita }: { cita: any }) => {
    const isCancelled = cita.status === 'cancelled';
    const isCompleted = cita.status === 'completed';
    const date = new Date(cita.scheduled_at);
    const timeStart = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    
    // Calcular fin (pobremente, asumiendo 45min si no hay duración)
    const duration = cita.service?.duration_minutes || 45;
    const timeEnd = new Date(date.getTime() + duration * 60000).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

    let bgClass = "bg-orange-500/10 border-orange-500/20";
    let statusLabel = "Confirmada";
    let statusColor = "bg-orange-500";

    if (isCompleted) {
      bgClass = "bg-green-500/10 border-green-500/20";
      statusLabel = "Completada";
      statusColor = "bg-green-500";
    }
    if (isCancelled) {
      bgClass = "bg-red-500/10 border-red-500/20 opacity-60";
      statusLabel = "Cancelada";
      statusColor = "bg-red-500";
    }

    return (
      <button 
        onClick={() => handleCitaClick(cita)}
        className={`w-full text-left p-3 rounded-xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${bgClass}`}
      >
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-mono font-bold text-text-tertiary">
            {timeStart} - {timeEnd}
          </span>
          <div className={`w-2 h-2 rounded-full ${statusColor}`} />
        </div>
        
        <p className={`text-sm font-bold text-text-primary leading-tight ${isCancelled ? 'line-through' : ''}`}>
          {cita.client?.name}
        </p>
        
        <div className="mt-2 space-y-1">
          <p className="text-[10px] text-text-tertiary flex items-center gap-1">
            <Scissors size={10} /> {cita.service?.name}
          </p>
          <p className="text-[10px] text-text-tertiary flex items-center gap-1 font-medium">
            <User2 size={10} className="text-accent" /> {cita.barber?.name}
          </p>
        </div>
      </button>
    );
  };

  const DayColumn = ({ day }: { day: string }) => {
    const citas = getCitasForDay(day);
    const isToday = day === new Date().toISOString().split('T')[0];

    return (
      <div className={`space-y-4 min-h-[300px] flex flex-col ${isMobile && day !== filterDate ? 'hidden' : ''}`}>
        <div className={`p-3 rounded-xl sticky top-0 z-10 backdrop-blur-md border ${isToday ? 'bg-accent/10 border-accent/20' : 'bg-background-secondary/50 border-border'}`}>
          <p className={`text-[10px] uppercase font-black tracking-tighter ${isToday ? 'text-accent' : 'text-text-tertiary'}`}>
            {getDayName(day)}
          </p>
          <p className="text-xl font-bold text-text-primary">
            {new Date(day).getDate()} <span className="text-xs text-text-tertiary font-medium">{new Date(day).toLocaleDateString('es-CO', { month: 'short' })}</span>
          </p>
        </div>

        <div className="flex-1 space-y-3">
          {citas.length > 0 ? (
            citas.map(cita => <AppointmentCard key={cita.id} cita={cita} />)
          ) : (
            <div className="py-10 text-center border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2">
              <CalendarIcon size={24} className="text-text-tertiary/20" />
              <p className="text-[11px] text-text-tertiary font-medium">Sin citas este día</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Navigation ────────────────────────────────── */}
      <div className="flex items-center justify-between bg-background-secondary/50 p-2 rounded-2xl border border-border">
        <div className="flex items-center gap-2">
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-background-tertiary rounded-xl transition-all">
            <ChevronLeft size={20} className="text-text-secondary" />
          </button>
          <div className="px-4 text-sm font-bold text-text-primary">
            {isMobile ? formatDateLong(filterDate) : `Semana del ${new Date(currentWeekStart).getDate()} de ${new Date(currentWeekStart).toLocaleDateString('es-CO', { month: 'long' })}`}
          </div>
          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-background-tertiary rounded-xl transition-all">
            <ChevronRight size={20} className="text-text-secondary" />
          </button>
        </div>

        {!isMobile && (
          <Button onClick={handleNewClick} className="shadow-lg shadow-accent/20">
            <Plus size={18} /> Nueva Cita
          </Button>
        )}
      </div>

      {/* ── Mobile Day Navigation ─────────────────────── */}
      {isMobile && (
        <div className="flex justify-between items-center bg-background-tertiary rounded-xl p-1">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d, i) => {
            const date = addDays(currentWeekStart, i);
            const active = filterDate === date;
            return (
              <button 
                key={d} 
                onClick={() => setFilterDate(date)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all ${active ? 'bg-accent text-background-primary' : 'text-text-tertiary'}`}
              >
                {d}
              </button>
            )
          })}
        </div>
      )}

      {/* ── Grid Views ────────────────────────────────── */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3 lg:grid-cols-6'}`}>
        {weekDays.map(day => (
          <DayColumn key={day} day={day} />
        ))}
      </div>

      {/* ── Floating Action Button (Mobile) ───────────── */}
      {isMobile && (
        <button 
          onClick={handleNewClick}
          className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-background-primary rounded-full shadow-2xl flex items-center justify-center z-50 animate-bounce-subtle"
        >
          <Plus size={28} />
        </button>
      )}

      {/* ── Side Panels ───────────────────────────────── */}
      <SlidePanel 
        isOpen={panelMode !== 'none'} 
        onClose={() => setPanelMode('none')}
        title={panelMode === 'new' ? 'Agendar Nueva Cita' : panelMode === 'edit' ? 'Editar Cita' : 'Detalles de la Cita'}
      >
        {panelMode === 'new' && (
          <AppointmentForm 
            clientes={clientes} 
            servicios={servicios} 
            barberos={barberos}
            onSuccess={() => setPanelMode('none')}
            initialDate={filterDate}
          />
        )}

        {panelMode === 'details' && selectedAppointment && (
          <AppointmentDetails 
            appointment={selectedAppointment}
            onClose={() => setPanelMode('none')}
            onEdit={() => setPanelMode('edit')}
          />
        )}

        {panelMode === 'edit' && selectedAppointment && (
          <AppointmentForm 
            clientes={clientes} 
            servicios={servicios} 
            barberos={barberos}
            onSuccess={() => setPanelMode('none')}
            editingAppointment={selectedAppointment}
          />
        )}
      </SlidePanel>
    </div>
  );
};

function formatDateLong(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}
