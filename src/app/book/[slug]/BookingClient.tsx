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
import { createClient } from '@supabase/supabase-js';

import { buildScheduledAt, formatTime, formatDate, getTodayString } from '@/lib/dateUtils';

let supabaseClientInstance: ReturnType<typeof createClient> | null = null;

const getSupabase = () => {
  if (!supabaseClientInstance) {
    supabaseClientInstance = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabaseClientInstance;
};

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
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookedAppointments, setBookedAppointments] = useState<any[]>([]);

  // Client info
  const [clientInfo, setClientInfo] = useState({
    name: '',
    phone: '',
    email: '',
    acceptReminders: true
  });

  const showOccupiedToast = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } transition-all duration-300 max-w-sm w-full bg-background-secondary text-text-primary shadow-2xl rounded-xl flex items-center p-4 border border-border`}
      >
        <Clock className="w-5 h-5 text-accent mr-3 shrink-0" />
        <p className="text-sm font-semibold leading-tight">
          Este horario ya no está disponible. Escoge el que más te convenga.
        </p>
      </div>
    ), {
      duration: 3000,
      position: isMobile ? 'bottom-center' : 'top-right',
      id: 'occupied-toast'
    });
  };

  const fetchBookedSlots = async () => {
    if (!selectedDate) return;
    
    const startIso = buildScheduledAt(selectedDate, '00:00');
    const endIso = buildScheduledAt(selectedDate, '23:59');

    let query = getSupabase()
      .from('appointments')
      .select('scheduled_at, duration_minutes, status, barber_id')
      .eq('barbershop_id', barbershop.id)
      .gte('scheduled_at', startIso)
      .lte('scheduled_at', endIso)
      .in('status', ['confirmed', 'pending']);

    if (selectedBarber) {
      query = query.eq('barber_id', selectedBarber.id);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching booked slots:", error);
    }

    setBookedAppointments(data || []);
  };

  useEffect(() => {
    if (step === 3 && selectedBarber && selectedDate) {
      fetchBookedSlots();
    }
  }, [step, selectedBarber, selectedDate]);

  // Realtime subscription
  useEffect(() => {
    if (step !== 3) return;

    const channelName = selectedBarber 
      ? `slots-barber-${selectedBarber.id}-${selectedDate}`
      : `slots-shop-${barbershop.id}-${selectedDate}`;

    const filter = selectedBarber
      ? `barber_id=eq.${selectedBarber.id}`
      : `barbershop_id=eq.${barbershop.id}`;

    const channel = getSupabase()
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'appointments',
          filter: filter
        },
        () => {
          fetchBookedSlots();
        }
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
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
    const isToday = selectedDate === getTodayString();
    const nowBogotaStr = new Date().toLocaleString("en-US", { timeZone: "America/Bogota" });
    const nowBogota = new Date(nowBogotaStr);
    const nowHours = nowBogota.getHours();
    const nowMinutes = nowBogota.getMinutes();

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

      let overlappingCount = 0;
      bookedAppointments.forEach(apt => {
        const aptBogotaStr = new Date(apt.scheduled_at).toLocaleString('en-US', { timeZone: 'America/Bogota' });
        const aptStart = new Date(aptBogotaStr);
        const aptDuration = (apt.duration_minutes || 30);
        const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
        
        if (slotStart < aptEnd && slotEnd > aptStart) {
          overlappingCount++;
        }
      });

      if (selectedBarber) {
        if (overlappingCount > 0) isAvailable = false;
      } else {
        const totalBarbers = barbers.length > 0 ? barbers.length : 1;
        if (overlappingCount >= totalBarbers) isAvailable = false;
      }

      generated.push({ time: timeStr, available: isAvailable });
      current.setMinutes(current.getMinutes() + duration);
    }
    return generated;
  }, [selectedService, selectedDate, barbershop.opening_hours, bookedAppointments]);

  useEffect(() => {
    // If we already finished or are loading, ignore updates to the slots list
    if (finished || loading) return;

    if (selectedTime) {
      const currentSlot = slots.find(s => s.time === selectedTime);
      if (currentSlot && !currentSlot.available) {
        // If it's taken by someone else, we just deselect it silently
        setSelectedTime(null);
      }
    }
  }, [slots, selectedTime, finished, loading]);

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
          showOccupiedToast();
          // Just fetch updated slots, the useEffect will handle deselecting the time
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
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-sm mx-auto">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-semibold text-text-primary mb-2">¡Tu cita está confirmada!</h1>
          <p className="text-sm text-text-secondary mb-8">Te esperamos en la barbería.</p>

          <Card className="text-left border-accent/20">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Fecha</span>
                <span className="text-text-primary font-medium">
                  {formatDate(selectedDate)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Hora</span>
                <span className="text-text-primary font-medium">
                  {selectedTime}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Barbero</span>
                <span className="text-text-primary font-medium">{selectedBarber?.name || 'Sin preferencia'}</span>
              </div>
            </div>
          </Card>

          <Button 
            variant="primary" 
            className="w-full h-12 font-medium mt-8 mb-4"
            onClick={() => {
              const [y, m, d] = selectedDate.split('-').map(Number);
              const [hh, mm] = (selectedTime || "00:00").split(':').map(Number);
              const startStr = `${y}${m.toString().padStart(2, '0')}${d.toString().padStart(2, '0')}T${hh.toString().padStart(2, '0')}${mm.toString().padStart(2, '0')}00`;
              const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=Cita+en+${encodeURIComponent(barbershop.name)}&dates=${startStr}/${startStr}&details=Servicio:+${encodeURIComponent(selectedService.name)}`;
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
    <div className="max-w-md mx-auto min-h-screen flex flex-col bg-background-primary">
      <header className="p-8 text-center space-y-3">
        <h1 className="text-3xl font-semibold text-text-primary tracking-tight">{barbershop.name}</h1>
        <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><MapPin size={12} className="text-accent" /> {barbershop.city}</span>
          <a href={`https://wa.me/${barbershop.whatsapp?.replace(/\+/g, '')}`} className="flex items-center gap-1.5 text-accent hover:opacity-80 transition-opacity">
            <MessageCircle size={12} /> WhatsApp
          </a>
        </div>
      </header>

      <div className="px-8 mb-10 flex gap-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-accent' : 'bg-border'}`} />
        ))}
      </div>

      <main className="flex-1 px-8 pb-32">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Selecciona un servicio</h2>
              <div className="space-y-3">
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedService(s); setStep(2); }}
                    className={`w-full text-left p-5 rounded-xl border transition-all flex items-center justify-between group ${
                      selectedService?.id === s.id 
                      ? 'border-accent bg-accent/5 ring-1 ring-accent/20' 
                      : 'border-border bg-background-secondary hover:border-border-strong'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{s.name}</p>
                      <p className="text-xs text-text-secondary mt-1">{s.duration_minutes} min • ${s.price.toLocaleString()}</p>
                    </div>
                    <ChevronRight size={18} className="text-text-tertiary group-hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Barbero y Fecha</h2>
              
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">¿Quién te atiende?</p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => setSelectedBarber(null)}
                  className={`p-5 rounded-xl border transition-all ${
                    selectedBarber === null 
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/20' 
                    : 'border-border bg-background-secondary hover:border-border-strong'
                  }`}
                >
                  <div className="w-10 h-10 bg-background-tertiary rounded-full flex items-center justify-center mx-auto mb-2 text-text-secondary">
                    <User size={20} />
                  </div>
                  <p className="text-xs font-medium text-text-primary">Sin preferencia</p>
                </button>
                {barbers.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBarber(b)}
                    className={`p-5 rounded-xl border transition-all ${
                      selectedBarber?.id === b.id 
                      ? 'border-accent bg-accent/5 ring-1 ring-accent/20' 
                      : 'border-border bg-background-secondary hover:border-border-strong'
                    }`}
                  >
                    <div className="w-10 h-10 bg-accent text-background-primary rounded-full flex items-center justify-center mx-auto mb-2 font-semibold text-xs">
                      {b.name.substring(0, 2).toUpperCase()}
                    </div>
                    <p className="text-xs font-medium text-text-primary">{b.name}</p>
                  </button>
                ))}
              </div>

              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-3">Selecciona el día</p>
              <Input 
                type="date" 
                min={getTodayString()}
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="mb-8 h-12 font-medium"
              />

              <Button variant="primary" className="w-full h-12 font-medium" onClick={() => setStep(3)}>
                Ver horas disponibles
              </Button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Selecciona la hora</h2>
              
              {loading ? (
                <div className="py-12 text-center text-text-tertiary">Cargando disponibilidad...</div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {slots.map(s => (
                    <button
                      key={s.time}
                      onClick={() => { 
                        if (!s.available) {
                          showOccupiedToast();
                          return;
                        }
                        setSelectedTime(s.time); 
                        setStep(4); 
                      }}
                      className={`py-3 rounded-xl border transition-all text-xs font-semibold ${
                        !s.available ? 'bg-background-primary border-border/50 text-text-tertiary opacity-40 cursor-default' :
                        selectedTime === s.time ? 'bg-accent text-background-primary border-accent shadow-lg shadow-accent/20' :
                        'bg-background-secondary border-border text-text-primary hover:border-accent hover:text-accent'
                      }`}
                    >
                      {s.available ? formatTime(s.time) : 'Ocupado'}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-text-secondary bg-background-secondary border border-border rounded-xl">
                  No hay horas disponibles para este día.
                </div>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -10, opacity: 0 }}>
              <h2 className="text-xl font-semibold text-text-primary mb-6">Confirmar cita</h2>
              
              <Card className="mb-8 border-accent/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                    <Scissors size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary">{selectedService?.name}</p>
                    <p className="text-xs text-text-secondary">
                      {formatDate(selectedDate)} • {selectedTime}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-text-secondary">Barbero</span>
                  <span className="font-medium text-text-primary">{selectedBarber?.name || 'Sin preferencia'}</span>
                </div>
              </Card>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">Nombre completo</label>
                  <Input 
                    placeholder="Tu nombre" 
                    value={clientInfo.name}
                    onChange={e => setClientInfo(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">Celular</label>
                  <Input 
                    placeholder="300 123 4567" 
                    value={clientInfo.phone}
                    onChange={e => setClientInfo(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest px-1">Email (opcional)</label>
                  <Input 
                    placeholder="tu@email.com" 
                    value={clientInfo.email}
                    onChange={e => setClientInfo(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                {clientInfo.email && (
                  <label className="flex items-center gap-3 p-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={clientInfo.acceptReminders}
                      onChange={e => setClientInfo(prev => ({ ...prev, acceptReminders: e.target.checked }))}
                      className="w-4 h-4 rounded border-border bg-background-tertiary text-accent focus:ring-accent accent-accent"
                    />
                    <span className="text-[11px] text-text-secondary">Quiero recibir un recordatorio por email</span>
                  </label>
                )}

                <Button 
                  variant="primary" 
                  className="w-full h-14 text-base font-semibold mt-6 shadow-lg shadow-accent/10"
                  onClick={handleConfirm}
                  loading={loading}
                  disabled={!selectedTime}
                >
                  {selectedTime ? (
                    <>Confirmar cita <Check size={18} className="ml-1" /></>
                  ) : (
                    "Hora ocupada, vuelve y elige otra"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Fixed Footer for Back Button */}
      {step > 1 && !finished && (
        <div className="fixed bottom-0 left-0 w-full p-8 bg-background-primary/80 backdrop-blur-md border-t border-border flex justify-center z-40">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-text-primary transition-colors tracking-widest"
          >
            <ChevronLeft size={16} /> VOLVER
          </button>
        </div>
      )}
    </div>
  );
}
