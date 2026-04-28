"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Store, 
  Clock, 
  Users, 
  Scissors, 
  PartyPopper,
  User,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toast } from 'react-hot-toast';
import { 
  saveOnboardingStep1, 
  saveOnboardingStep2, 
  completeOnboardingAction 
} from '@/app/actions/barbershops';
import { createBarber } from '@/app/actions/barbers';
import { createService } from '@/app/actions/services';
import { createClient } from '@/lib/supabase/client';

const STEPS = [
  { id: 1, title: 'Negocio', icon: <Store size={18} /> },
  { id: 2, title: 'Horarios', icon: <Clock size={18} /> },
  { id: 3, title: 'Barberos', icon: <Users size={18} /> },
  { id: 4, title: 'Servicios', icon: <Scissors size={18} /> }
];

const PRESET_SERVICES = [
  { name: 'Corte de cabello', price: 25000, duration: 30 },
  { name: 'Corte + Barba', price: 35000, duration: 45 },
  { name: 'Afeitado', price: 20000, duration: 20 },
  { name: 'Arreglo de barba', price: 15000, duration: 20 },
  { name: 'Tinte', price: 45000, duration: 60 },
  { name: 'Tratamiento', price: 30000, duration: 30 }
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  // Step 1 State
  const [step1Data, setStep1Data] = useState({
    name: '',
    city: '',
    whatsapp: ''
  });

  // Step 2 State
  const [hours, setHours] = useState<any>({
    monday: { active: true, open: '09:00', close: '19:00' },
    tuesday: { active: true, open: '09:00', close: '19:00' },
    wednesday: { active: true, open: '09:00', close: '19:00' },
    thursday: { active: true, open: '09:00', close: '19:00' },
    friday: { active: true, open: '09:00', close: '19:00' },
    saturday: { active: true, open: '09:00', close: '19:00' },
    sunday: { active: false, open: '09:00', close: '19:00' }
  });

  // Step 3 State
  const [barbers, setBarbers] = useState<any[]>([]);
  const [newBarber, setNewBarber] = useState({ name: '', phone: '', email: '' });

  // Step 4 State
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserData(user);
      if (user?.user_metadata?.negocio) {
        setStep1Data(prev => ({ ...prev, name: user.user_metadata.negocio }));
      }
    };
    fetchUser();
  }, []);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        if (!step1Data.name || !step1Data.city || !step1Data.whatsapp) {
          toast.error("Por favor completa todos los campos");
          setLoading(false);
          return;
        }
        await saveOnboardingStep1(step1Data);
      } else if (step === 2) {
        await saveOnboardingStep2(hours);
      } else if (step === 3) {
        if (barbers.length === 0) {
          toast.error("Agrega al menos un barbero");
          setLoading(false);
          return;
        }
      } else if (step === 4) {
        if (services.length === 0) {
          toast.error("Selecciona al menos un servicio");
          setLoading(false);
          return;
        }
      }
      setStep(prev => prev + 1);
    } catch (error: any) {
      toast.error(error.message || "Error al guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => setStep(prev => Math.max(1, prev - 1));

  const handleAddBarber = async () => {
    if (!newBarber.name) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nombre', newBarber.name);
      formData.append('telefono', newBarber.phone);
      formData.append('email', newBarber.email);
      
      const res = await createBarber(formData);
      if (res.success) {
        setBarbers(prev => [...prev, { ...newBarber, id: Date.now() }]);
        setNewBarber({ name: '', phone: '', email: '' });
        toast.success("Barbero agregado");
      } else {
        toast.error(res.error || "Error al agregar barbero");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIAmBarber = () => {
    if (userData) {
      setNewBarber({
        name: userData.user_metadata?.full_name || userData.email?.split('@')[0] || '',
        phone: '',
        email: userData.email || ''
      });
    }
  };

  const toggleService = async (preset: any) => {
    const isSelected = services.find(s => s.name === preset.name);
    if (isSelected) {
      setServices(prev => prev.filter(s => s.name !== preset.name));
    } else {
      const formData = new FormData();
      formData.append('nombre', preset.name);
      formData.append('precio', preset.price.toString());
      formData.append('duracion', preset.duration.toString());
      
      const res = await createService(formData);
      if (res.success) {
        setServices(prev => [...prev, preset]);
        toast.success(`${preset.name} agregado`);
      } else {
        toast.error(res.error || "Error al agregar servicio");
      }
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await completeOnboardingAction();
      setStep(5);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 5) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 bg-success/20 border-4 border-success/30 rounded-full flex items-center justify-center mx-auto mb-8">
            <PartyPopper size={40} className="text-success" />
          </div>
          <h1 className="text-3xl font-black text-text-primary mb-3">¡Todo listo!</h1>
          <p className="text-text-secondary text-lg mb-10 leading-relaxed">
            Tu barbería <strong>{step1Data.name}</strong> está configurada y lista para recibir citas.
          </p>
          
          <Card className="bg-background-secondary border-accent/20 mb-10 text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Negocio</span>
                <span className="text-text-primary font-bold">{step1Data.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Barberos</span>
                <span className="text-text-primary font-bold">{barbers.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary">Servicios</span>
                <span className="text-text-primary font-bold">{services.length}</span>
              </div>
            </div>
          </Card>

          <Button 
            variant="primary" 
            size="lg" 
            className="w-full h-14 text-lg font-black shadow-xl shadow-accent/20"
            onClick={() => window.location.href = '/dashboard'}
          >
            Ir al Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          {STEPS.map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border-2 ${
                step > s.id ? 'bg-success border-success text-background-primary' :
                step === s.id ? 'bg-accent border-accent text-background-primary shadow-lg shadow-accent/20' :
                'bg-background-secondary border-border text-text-tertiary'
              }`}>
                {step > s.id ? <Check size={20} /> : s.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                step >= s.id ? 'text-text-primary' : 'text-text-tertiary'
              }`}>
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 border-border-strong bg-background-secondary">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-text-primary">Bienvenido a Trimly ✂️</h2>
                    <p className="text-text-tertiary text-sm font-medium mt-1">Configura tu barbería en 4 pasos simples</p>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-text-tertiary uppercase tracking-widest">Nombre de la barbería</label>
                      <Input 
                        placeholder="Ej. Barber King" 
                        value={step1Data.name}
                        onChange={e => setStep1Data(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-text-tertiary uppercase tracking-widest">Ciudad</label>
                      <Input 
                        placeholder="Ej. Bogotá" 
                        value={step1Data.city}
                        onChange={e => setStep1Data(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-text-tertiary uppercase tracking-widest">WhatsApp del negocio</label>
                      <Input 
                        placeholder="Ej. +57 300 123 4567" 
                        value={step1Data.whatsapp}
                        onChange={e => setStep1Data(prev => ({ ...prev, whatsapp: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-text-primary">¿Cuándo atiendes?</h2>
                    <p className="text-text-tertiary text-sm font-medium mt-1">Define tus horarios base de trabajo</p>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {Object.keys(hours).map((day) => (
                      <div key={day} className={`p-4 rounded-xl border transition-all ${
                        hours[day].active ? 'bg-background-tertiary border-accent/20' : 'bg-background-tertiary/20 border-transparent opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-bold capitalize text-text-primary">{day}</span>
                          <button 
                            onClick={() => setHours((prev: any) => ({
                              ...prev,
                              [day]: { ...prev[day], active: !prev[day].active }
                            }))}
                            className={`w-10 h-6 rounded-full transition-colors relative ${
                              hours[day].active ? 'bg-accent' : 'bg-border-strong'
                            }`}
                          >
                            <div className={`w-4 h-4 bg-background-primary rounded-full absolute top-1 transition-all ${
                              hours[day].active ? 'left-5' : 'left-1'
                            }`} />
                          </button>
                        </div>
                        {hours[day].active && (
                          <div className="grid grid-cols-2 gap-3">
                            <Input 
                              type="time" 
                              value={hours[day].open}
                              onChange={e => setHours((prev: any) => ({
                                ...prev,
                                [day]: { ...prev[day], open: e.target.value }
                              }))}
                              className="h-9 px-2"
                            />
                            <Input 
                              type="time" 
                              value={hours[day].close}
                              onChange={e => setHours((prev: any) => ({
                                ...prev,
                                [day]: { ...prev[day], close: e.target.value }
                              }))}
                              className="h-9 px-2"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-text-primary">Agrega tu primer barbero</h2>
                    <p className="text-text-tertiary text-sm font-medium mt-1">Puedes agregar más después</p>
                  </div>
                  
                  {barbers.length > 0 && (
                    <div className="space-y-2 mb-6">
                      {barbers.map((b, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-success text-background-primary flex items-center justify-center">
                              <Check size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">{b.name}</p>
                              <p className="text-[10px] text-text-tertiary">{b.email || 'Sin email'}</p>
                            </div>
                          </div>
                          <button onClick={() => setBarbers(prev => prev.filter((_, idx) => idx !== i))}>
                            <Trash2 size={16} className="text-danger/50 hover:text-danger" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <Input 
                      placeholder="Nombre del barbero" 
                      value={newBarber.name}
                      onChange={e => setNewBarber(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input 
                        placeholder="WhatsApp (Opcional)" 
                        value={newBarber.phone}
                        onChange={e => setNewBarber(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <Input 
                        placeholder="Email (Opcional)" 
                        value={newBarber.email}
                        onChange={e => setNewBarber(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button variant="secondary" onClick={handleIAmBarber} className="h-10 text-xs border-dashed">
                        <User size={14} /> Soy yo mismo el barbero
                      </Button>
                      <Button variant="primary" onClick={handleAddBarber} loading={loading} className="w-full">
                        <Plus size={16} /> Agregar barbero
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-text-primary">¿Qué servicios ofreces?</h2>
                    <p className="text-text-tertiary text-sm font-medium mt-1">Agrega tus servicios principales</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {PRESET_SERVICES.map((s) => {
                      const isActive = services.find(serv => serv.name === s.name);
                      return (
                        <button
                          key={s.name}
                          onClick={() => toggleService(s)}
                          className={`p-4 rounded-xl border text-left transition-all relative ${
                            isActive ? 'bg-accent/10 border-accent' : 'bg-background-tertiary/40 border-border hover:border-border-strong'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute top-2 right-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-background-primary">
                              <Check size={10} />
                            </div>
                          )}
                          <p className="text-xs font-bold text-text-primary mb-1">{s.name}</p>
                          <p className="text-[10px] text-text-tertiary font-mono">
                            ${s.price.toLocaleString()} • {s.duration} min
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-4 border-t border-border-strong">
                    <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest text-center mb-4">
                      Servicios seleccionados: {services.length}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-10 flex items-center gap-3">
                {step > 1 && (
                  <Button 
                    variant="secondary" 
                    onClick={handleBack} 
                    className="h-12 px-6"
                  >
                    <ChevronLeft size={20} />
                  </Button>
                )}
                {step < 4 ? (
                  <Button 
                    variant="primary" 
                    className="flex-1 h-12 text-base font-black"
                    onClick={handleNext}
                    loading={loading}
                    disabled={step === 3 && barbers.length === 0}
                  >
                    Continuar <ChevronRight size={20} />
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="flex-1 h-12 text-base font-black bg-success hover:bg-success-hover border-none"
                    onClick={handleFinish}
                    loading={loading}
                    disabled={services.length === 0}
                  >
                    Finalizar configuración
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
