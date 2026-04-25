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
  const [showPicker, setShowPicker] = useState(false);
  
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

  const changeYear = (n: number) => {
    const d = new Date(filterDate);
    d.setFullYear(d.getFullYear() + n);
    setFilterDate(d.toISOString().split('T')[0]);
  };

  const jumpToMonth = (month: number) => {
    const d = new Date(filterDate);
    d.setMonth(month);
    setFilterDate(d.toISOString().split('T')[0]);
    setShowPicker(false);
  };

  const getCitasForDay = (dayStr: string) => {
    return allCitas.filter(c => {
      // Use explicit Bogotá timezone for filtering
      const d = new Date(c.scheduled_at);
      const isoLocal = d.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' }); // YYYY-MM-DD
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
    // Use America/Bogota to display exactly the intended time
    const date = new Date(cita.scheduled_at);
    const timeFormat: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' };
    const timeStart = date.toLocaleTimeString('es-CO', timeFormat);
    
    const duration = cita.service?.duration_minutes || 45;
    const timeEnd = new Date(date.getTime() + duration * 60000).toLocaleTimeString('es-CO', timeFormat);

    let bgClass = "bg-orange-500/10 border-orange-500/20";
    let statusColor = "bg-orange-500";

    if (isCompleted) {
      bgClass = "bg-green-500/10 border-green-500/20";
      statusColor = "bg-green-500";
    }
    if (isCancelled) {
      bgClass = "bg-red-500/10 border-red-500/20 opacity-60";
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
    const isToday = day === new Date().toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });

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

  const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  return (
    <div className="space-y-6 pb-20">
      {/* ── Navigation ────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-background-secondary/50 p-3 rounded-2xl border border-border gap-4">
        <div className="flex items-center gap-2 relative">
          <button onClick={() => changeYear(-1)} className="p-2 hover:bg-background-tertiary rounded-xl transition-all text-text-tertiary hover:text-accent" title="Año anterior">
            <ChevronLeft size={16} />
            <ChevronLeft size={16} className="-ml-3" />
          </button>
          
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-background-tertiary rounded-xl transition-all">
            <ChevronLeft size={20} className="text-text-secondary" />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowPicker(!showPicker)}
              className="px-4 py-2 text-sm font-bold text-text-primary hover:bg-background-tertiary rounded-xl transition-all flex items-center gap-2 border border-transparent hover:border-border"
            >
              {isMobile ? formatDateLong(filterDate) : `Semana del ${new Date(currentWeekStart).getDate()} de ${new Date(currentWeekStart).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}`}
              <ChevronRight size={14} className={`transform transition-transform ${showPicker ? 'rotate-90' : ''}`} />
            </button>

            {showPicker && (
              <div className="absolute top-full left-0 mt-2 p-4 bg-background-primary border border-border rounded-2xl shadow-2xl z-[60] min-w-[300px] animate-in fade-in zoom-in-95 duration-200">
                <div className="grid grid-cols-3 gap-2">
                  {MONTHS.map((m, i) => (
                    <button
                      key={m}
                      onClick={() => jumpToMonth(i)}
                      className={`py-2 text-[11px] font-bold rounded-lg transition-all ${new Date(filterDate).getMonth() === i ? 'bg-accent text-background-primary' : 'hover:bg-background-tertiary text-text-secondary'}`}
                    >
                      {m.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-background-tertiary rounded-xl transition-all">
            <ChevronRight size={20} className="text-text-secondary" />
          </button>

          <button onClick={() => changeYear(1)} className="p-2 hover:bg-background-tertiary rounded-xl transition-all text-text-tertiary hover:text-accent" title="Año siguiente">
            <ChevronRight size={16} />
            <ChevronRight size={16} className="-ml-3" />
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
