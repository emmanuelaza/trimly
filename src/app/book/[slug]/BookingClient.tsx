"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Scissors, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  MessageCircle,
  MapPin,
  Check
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import { getOccupiedSlots, confirmBooking } from '@/app/actions/booking';
import { createClient } from '@/lib/supabase/client';

function buildScheduledAt(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return date.toISOString();
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota'
  });
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota'
  });
}

const supabaseClient = createClient();

interface BookingClientProps {
  barbershop: any;
  services: any[];
  barbers: any[];
}

export default function BookingClient({ barbershop, services, barbers }: BookingClientProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  // Selection state
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBarber, setSelectedBarber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);

  // Client info
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    acceptReminders: true
  });

  // Fetch booked slots
  const fetchBookedSlots = async () => {
    if (!selectedBarber || !selectedDate) return;
    
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateStart = new Date(y, m - 1, d, 0, 0, 0, 0);
    const dateEnd = new Date(y, m - 1, d, 23, 59, 59, 999);

    const { data } = await supabaseClient
      .from('appointments')
      .select('scheduled_at, duration_minutes, status')
      .eq('barber_id', selectedBarber.id)
      .gte('scheduled_at', dateStart.toISOString())
      .lte('scheduled_at', dateEnd.toISOString())
      .in('status', ['confirmed', 'pending']);

    setBookedAppointments(data || []);
  };

  useEffect(() => {
    if (step === 3 && selectedBarber && selectedDate) {
      fetchBookedSlots();
    }
  }, [step, selectedBarber, selectedDate]);

  // Realtime subscription
  useEffect(() => {
    if (step !== 3 || !supabaseClient || !selectedBarber) return;

    const channel = supabaseClient
      .channel(`slots-${selectedBarber.id}-${selectedDate}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: `barber_id=eq.${selectedBarber.id}`
        },
        () => {
          fetchBookedSlots();
        }
      )
      .subscribe();

    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, [step, barbershop.id, selectedBarber, selectedDate]);

  const slots = useMemo(() => {
    if (!selectedService || !selectedDate) return [];
    
    // Fix: Use local date parts to avoid timezone shifts when getting the day name
    const [y, m, d] = selectedDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const dayConfig = (barbershop.opening_hours || {
      monday: { active: true, open: "09:00", close: "19:00" },
      tuesday: { active: true, open: "09:00", close: "19:00" },
      wednesday: { active: true, open: "09:00", close: "19:00" },
      thursday: { active: true, open: "09:00", close: "19:00" },
      friday: { active: true, open: "09:00", close: "19:00" },
      saturday: { active: true, open: "09:00", close: "19:00" },
      sunday: { active: false, open: "09:00", close: "19:00" }
    })[dayName];

    if (!dayConfig || !dayConfig.active) return [];

    const generated = [];
    let current = new Date(`2000-01-01T${dayConfig.open}:00`);
    const end = new Date(`2000-01-01T${dayConfig.close}:00`);
    const duration = selectedService.duration_minutes || 30;

    // Don't show past times if today
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const nowHours = new Date().getHours();
    const nowMinutes = new Date().getMinutes();

    while (current < end) {
      const h = current.getHours();
      const m = current.getMinutes();
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      let isAvailable = true;
      
      // 1. Check if past
      if (isToday) {
        if (h < nowHours || (h === nowHours && m <= nowMinutes)) {
          isAvailable = false;
        }
      }

      // 2. Check if occupied (exact duration logic, no buffer)
      const slotStart = new Date(y, m - 1, d, h, m);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      const isOccupied = bookedAppointments.some(apt => {
        const aptStart = new Date(apt.scheduled_at);
        const aptDuration = (apt.duration_minutes || 30);
        const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
        
        return slotStart < aptEnd && slotEnd > aptStart;
      });

      if (isOccupied) isAvailable = false;

      generated.push({ time: timeStr, available: isAvailable });
      current.setMinutes(current.getMinutes() + duration);
    }
    return generated;
  }, [selectedService, selectedDate, barbershop.opening_hours, bookedAppointments]);

  // Check if selected slot became occupied (silent reset)
  useEffect(() => {
    // If we already finished or are loading, ignore updates to the slots list
    if (finished || loading) return;

    if (step === 4 && selectedTime) {
      const currentSlot = slots.find(s => s.time === selectedTime);
      if (currentSlot && !currentSlot.available) {
        // If it's taken by someone else while we are on Step 4, we go back
        setSelectedTime(null);
        setStep(3);
      }
    }
  }, [slots, step, selectedTime, finished, loading]);

  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);

  const handleConfirm = async () => {
    if (!clientInfo.name || !clientInfo.phone) return;
    
    setLoading(true);
    try {
      if (!selectedTime) return;
      const scheduledAtISO = buildScheduledAt(selectedDate, selectedTime);

      const response = await fetch('/api/book/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          barbershopId: barbershop.id,
          barberId: selectedBarber?.id || null,
          serviceId: selectedService.id,
          scheduledAt: scheduledAtISO,
          clientName: clientInfo.name,
          clientPhone: clientInfo.phone,
          clientEmail: clientInfo.email,
          priceCharged: selectedService.price
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Confirmation error:', response.status, result);
        
        if (response.status === 409) {
          // Case 2: Slot taken
          setSelectedTime(null);
          setStep(3);
          fetchBookedSlots();
        } else {
          // Case 3: Other errors - stay on step 4
          toast.error("No se pudo confirmar la cita. Por favor intenta de nuevo.");
        }
        return;
      }

      // Case 1: Success
      setConfirmedAppointment(result);
      setFinished(true);

    } catch (error: any) {
      console.error("Network error during confirmation:", error);
      toast.error("Error de conexión. Revisa tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setStep(prev => Math.max(1, prev - 1));

  if (finished) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-black text-text-primary mb-2">¡Tu cita está confirmada!</h1>
          <p className="text-text-tertiary mb-8">Te esperamos en la barbería.</p>

          <Card className="text-left p-6 space-y-4 mb-8 bg-background-secondary border-accent/20">
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Fecha</span>
              <span className="text-text-primary font-bold">
                {formatDate(selectedDate)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Hora</span>
              <span className="text-text-primary font-bold">
                {selectedTime}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-tertiary">Barbero</span>
              <span className="text-text-primary font-bold">{selectedBarber?.name || 'Sin preferencia'}</span>
            </div>
          </Card>

          <Button 
            variant="primary" 
            className="w-full h-12 font-bold mb-4"
            onClick={() => {
              const start = `${selectedDate.replace(/-/g, '')}T${selectedTime?.replace(/:/g, '')}00`;
              const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=Cita+en+${encodeURIComponent(barbershop.name)}&dates=${start}/${start}&details=Servicio:+${encodeURIComponent(selectedService.name)}`;
              window.open(url, '_blank');
            }}
          >
            Agregar a Google Calendar
          </Button>
          
          <p className="text-xs text-text-tertiary">Trimly · Sistema de Reservas</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      <header className="p-6 text-center space-y-2">
        <h1 className="text-3xl font-black text-text-primary tracking-tight">{barbershop.name}</h1>
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-text-tertiary uppercase tracking-widest">
          <span className="flex items-center gap-1"><MapPin size={12} /> {barbershop.city}</span>
          <a href={`https://wa.me/${barbershop.whatsapp?.replace(/\+/g, '')}`} className="flex items-center gap-1 text-accent"><MessageCircle size={12} /> WhatsApp</a>
        </div>
      </header>

      <div className="px-6 mb-8 flex gap-1">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${step >= s ? 'bg-accent' : 'bg-border-strong'}`} />
        ))}
      </div>

      <main className="flex-1 px-6 pb-24">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
              <h2 className="text-xl font-black text-text-primary mb-6">Selecciona un servicio</h2>
              <div className="space-y-3">
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep(2); }}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                      selectedService?.id === s.id ? 'border-accent bg-accent/5' : 'border-border hover:border-border-strong'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-black text-text-primary group-hover:text-accent transition-colors">{s.name}</p>
                      <p className="text-xs text-text-tertiary mt-1">{s.duration_minutes} min • ${s.price.toLocaleString()}</p>
                    </div>
                    <ChevronRight size={18} className="text-text-tertiary" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
              <h2 className="text-xl font-black text-text-primary mb-6">Barbero y Fecha</h2>
              
              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3">¿Quién te atiende?</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => setSelectedBarber(null)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    selectedBarber === null ? 'border-accent bg-accent/5' : 'border-border'
                  }`}
                >
                  <div className="w-10 h-10 bg-background-tertiary rounded-full flex items-center justify-center mx-auto mb-2 text-text-tertiary">
                    <User size={20} />
                  </div>
                  <p className="text-xs font-bold">Sin preferencia</p>
                </button>
                {barbers.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBarber(b)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      selectedBarber?.id === b.id ? 'border-accent bg-accent/5' : 'border-border'
                    }`}
                  >
                    <div className="w-10 h-10 bg-accent text-background-primary rounded-full flex items-center justify-center mx-auto mb-2 font-black text-xs">
                      {b.name.substring(0, 2).toUpperCase()}
                    </div>
                    <p className="text-xs font-bold">{b.name}</p>
                  </button>
                ))}
              </div>

              <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3">Selecciona el día</p>
              <Input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="mb-8 h-12 font-bold"
              />

              <Button variant="primary" className="w-full h-12 font-bold" onClick={() => setStep(3)}>
                Ver horas disponibles
              </Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
              <h2 className="text-xl font-black text-text-primary mb-6">Selecciona la hora</h2>
              
              {loading ? (
                <div className="py-12 text-center text-text-tertiary">Cargando disponibilidad...</div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(s => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => { setSelectedTime(s.time); setStep(4); }}
                      className={`py-3 rounded-xl border-2 text-xs font-black transition-all ${
                        !s.available ? 'bg-background-tertiary/50 border-transparent text-text-tertiary cursor-not-allowed opacity-50' :
                        selectedTime === s.time ? 'bg-accent text-background-primary border-accent shadow-lg shadow-accent/20' :
                        'bg-accent/10 border-accent/20 text-accent hover:bg-accent hover:text-background-primary hover:border-accent'
                      }`}
                    >
                      {s.available ? s.time : 'Ocupado'}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-text-tertiary bg-background-tertiary rounded-2xl">
                  No hay horas disponibles para este día.
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
              <h2 className="text-xl font-black text-text-primary mb-6">Tus datos</h2>
              
              <Card className="p-5 bg-background-secondary border-accent/20 mb-8 space-y-2">
                <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">Resumen</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-primary">{selectedService.name}</span>
                  <span className="text-sm font-black text-accent">${selectedService.price.toLocaleString()}</span>
                </div>
                <div className="text-xs text-text-tertiary">
                  {formatDate(selectedDate)} • {selectedTime}
                </div>
                <div className="text-xs text-text-tertiary">
                  Barbero: {selectedBarber?.name || 'Sin preferencia'}
                </div>
              </Card>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-1">Nombre completo</label>
                  <Input 
                    placeholder="Tu nombre" 
                    value={clientInfo.name}
                    onChange={e => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-1">Celular</label>
                  <Input 
                    placeholder="300 123 4567" 
                    value={clientInfo.phone}
                    onChange={e => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-12"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-text-tertiary uppercase tracking-widest px-1">Email (opcional)</label>
                  <Input 
                    placeholder="tu@email.com" 
                    value={clientInfo.email}
                    onChange={e => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12"
                  />
                </div>

                {clientInfo.email && (
                  <label className="flex items-center gap-3 p-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={clientInfo.acceptReminders}
                      onChange={e => setClientInfo(prev => ({ ...prev, acceptReminders: e.target.checked }))}
                      className="w-5 h-5 accent-accent"
                    />
                    <span className="text-xs text-text-tertiary">Quiero recibir un recordatorio por email</span>
                  </label>
                )}

                <Button 
                  variant="primary" 
                  className="w-full h-14 text-lg font-black mt-4 shadow-xl shadow-accent/20"
                  onClick={handleConfirm}
                  loading={loading}
                >
                  Confirmar cita <Check size={20} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Footer for Back Button */}
      {step > 1 && !finished && (
        <div className="fixed bottom-0 left-0 w-full p-6 bg-background-primary/80 backdrop-blur-md border-t border-border flex justify-center">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-sm font-black text-text-tertiary hover:text-text-primary transition-colors uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Atrás
          </button>
        </div>
      )}
    </div>
  );
}
