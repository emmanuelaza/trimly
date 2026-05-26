"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check, ChevronRight, ChevronLeft, Store, Clock, Users, Scissors,
  User, Plus, Trash2, Copy, ExternalLink, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from 'react-hot-toast';
import {
  saveOnboardingStep1, saveOnboardingStep2,
  completeOnboardingAction
} from '@/app/actions/barbershops';
import { createBarber } from '@/app/actions/barbers';
import { createService } from '@/app/actions/services';
import { createClient } from '@/lib/supabase/client';
import { OnboardingProgress } from '@/components/onboarding/OnboardingProgress';
import { OnboardingConfetti } from '@/components/onboarding/OnboardingConfetti';
import { cn } from '@/lib/utils';

const PRESET_SERVICES = [
  { name: 'Corte de cabello', price: 25000, duration: 30 },
  { name: 'Corte + Barba', price: 35000, duration: 45 },
  { name: 'Afeitado', price: 20000, duration: 20 },
  { name: 'Arreglo de barba', price: 15000, duration: 20 },
  { name: 'Tinte', price: 45000, duration: 60 },
  { name: 'Tratamiento', price: 30000, duration: 30 },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [slug, setSlug] = useState('');
  const router = useRouter();

  // Step 1
  const [step1, setStep1] = useState({ name: '', city: '', whatsapp: '' });

  // Step 2
  const [hours, setHours] = useState<any>({
    monday:    { active: true,  open: '09:00', close: '19:00' },
    tuesday:   { active: true,  open: '09:00', close: '19:00' },
    wednesday: { active: true,  open: '09:00', close: '19:00' },
    thursday:  { active: true,  open: '09:00', close: '19:00' },
    friday:    { active: true,  open: '09:00', close: '19:00' },
    saturday:  { active: true,  open: '09:00', close: '17:00' },
    sunday:    { active: false, open: '09:00', close: '14:00' },
  });

  // Step 3
  const [barbers, setBarbers] = useState<any[]>([]);
  const [newBarber, setNewBarber] = useState({ name: '', phone: '', email: '' });

  // Step 4
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserData(user);
      if (user?.user_metadata?.negocio) {
        setStep1(p => ({ ...p, name: user.user_metadata.negocio }));
      }
      // get slug
      const { data: bs } = await supabase.from('barbershops').select('slug,name').eq('owner_id', user?.id ?? '').maybeSingle();
      setSlug(bs?.slug || '');
      if (bs?.name) setStep1(p => ({ ...p, name: bs.name }));
    };
    fetchUser();
  }, []);

  const bookingUrl = `trimlyapp-phi.vercel.app/book/${slug}`;

  const handleNext = async () => {
    setLoading(true);
    try {
      if (step === 1) {
        if (!step1.name || !step1.city || !step1.whatsapp) {
          toast.error('Completa todos los campos'); return;
        }
        await saveOnboardingStep1(step1);
      } else if (step === 2) {
        await saveOnboardingStep2(hours);
      } else if (step === 3) {
        if (barbers.length === 0) { toast.error('Agrega al menos un barbero'); return; }
      } else if (step === 4) {
        if (services.length === 0) { toast.error('Selecciona al menos un servicio'); return; }
        await completeOnboardingAction();
        setDone(true);
        return;
      }
      setStep(p => p + 1);
    } catch (e: any) {
      toast.error(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBarber = async () => {
    if (!newBarber.name) { toast.error('El nombre es obligatorio'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('nombre', newBarber.name);
      fd.append('telefono', newBarber.phone);
      fd.append('email', newBarber.email);
      const res = await createBarber(fd);
      if (res.success) {
        setBarbers(p => [...p, { ...newBarber, id: Date.now() }]);
        setNewBarber({ name: '', phone: '', email: '' });
        toast.success('Barbero agregado');
      } else toast.error(res.error || 'Error');
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const toggleService = async (preset: any) => {
    const exists = services.find(s => s.name === preset.name);
    if (exists) { setServices(p => p.filter(s => s.name !== preset.name)); return; }
    const fd = new FormData();
    fd.append('nombre', preset.name);
    fd.append('precio', preset.price.toString());
    fd.append('duracion', preset.duration.toString());
    const res = await createService(fd);
    if (res.success) { setServices(p => [...p, preset]); toast.success(`${preset.name} agregado`); }
    else toast.error(res.error || 'Error');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${bookingUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-6 text-center">
        <OnboardingConfetti />
        <div className="w-full max-w-sm space-y-8 relative z-10">
          <div className="mx-auto w-24 h-24 rounded-full border-4 border-accent flex items-center justify-center bg-accent/10 animate-in zoom-in duration-500">
            <Check size={44} className="text-accent" strokeWidth={3} />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-black text-text-primary">¡Tu barbería está lista! 🎉</h1>
            <p className="text-text-secondary leading-relaxed">
              Ya puedes recibir reservas. Comparte tu link con tus clientes.
            </p>
          </div>

          <div className="bg-background-secondary border border-border rounded-xl p-4 flex items-center gap-3">
            <span className="text-xs font-mono text-accent flex-1 text-left break-all">{bookingUrl}</span>
            <button onClick={copyLink} className="text-text-secondary hover:text-accent transition-colors flex-shrink-0">
              <Copy size={16} />
            </button>
          </div>
          {copied && <p className="text-xs text-accent font-bold -mt-4">✓ Link copiado</p>}

          <div className="bg-primary/8 border border-primary/20 rounded-xl p-5 text-center">
            <p className="font-semibold text-text-primary">🎁 Tu configuración asistida incluida</p>
            <p className="text-sm text-text-muted mt-1">
              Escríbenos por WhatsApp y te ayudamos a configurar todo en menos de 10 minutos.
            </p>
            <a
              href={`https://wa.me/573016315482?text=${encodeURIComponent('Hola Emmanuel, acabo de registrarme en Trimly y quiero ayuda con la configuración')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-lg"
            >
              Solicitar configuración asistida 💬
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <Button variant="secondary" className="w-full" onClick={() => window.open(`https://${bookingUrl}`, '_blank')}>
              <ExternalLink size={16} /> Ver mi página pública
            </Button>
            <Button
              className="w-full"
              style={{ background: '#25D366', border: 'none' }}
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`¡Hola! Ya puedes agendar tu cita en ${step1.name}: https://${bookingUrl}`)}`, '_blank')}
            >
              <MessageCircle size={16} /> Compartir por WhatsApp
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => router.push('/dashboard')}>
              Ir al dashboard →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Scissors size={16} className="text-background-primary" />
            </div>
            <span className="text-lg font-black text-text-primary">Trimly</span>
          </div>
        </div>

        <OnboardingProgress current={step} total={4} onGoTo={s => s < step && setStep(s)} />

        <Card className="p-6 sm:p-8 border-border-strong bg-background-secondary space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">

          {step === 1 && (
            <>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4"><Store size={24} className="text-accent" /></div>
                <h2 className="text-2xl font-black text-text-primary">Bienvenido a Trimly ✂️</h2>
                <p className="text-text-secondary text-sm mt-1">Cuéntanos sobre tu barbería</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Nombre de la barbería</label>
                  <Input placeholder="Ej. Barber King" value={step1.name} onChange={e => setStep1(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest">Ciudad</label>
                  <Input placeholder="Ej. Bogotá" value={step1.city} onChange={e => setStep1(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-text-secondary uppercase tracking-widest">WhatsApp del negocio</label>
                  <Input placeholder="Ej. +57 300 123 4567" value={step1.whatsapp} onChange={e => setStep1(p => ({ ...p, whatsapp: e.target.value }))} />
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4"><Clock size={24} className="text-accent" /></div>
                <h2 className="text-2xl font-black text-text-primary">¿Cuándo atiendes?</h2>
                <p className="text-text-secondary text-sm mt-1">Define tus horarios base</p>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {Object.keys(hours).map(day => (
                  <div key={day} className={cn('p-3 rounded-xl border transition-all', hours[day].active ? 'bg-background-tertiary border-accent/20' : 'bg-background-tertiary/20 border-transparent opacity-50')}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold capitalize text-text-primary">{day}</span>
                      <button
                        onClick={() => setHours((p: any) => ({ ...p, [day]: { ...p[day], active: !p[day].active } }))}
                        className={cn('w-9 h-5 rounded-full relative transition-colors', hours[day].active ? 'bg-accent' : 'bg-border-strong')}
                      >
                        <div className={cn('w-3.5 h-3.5 bg-background-primary rounded-full absolute top-[3px] transition-all', hours[day].active ? 'left-[18px]' : 'left-[3px]')} />
                      </button>
                    </div>
                    {hours[day].active && (
                      <div className="grid grid-cols-2 gap-2">
                        <Input type="time" value={hours[day].open} className="h-8 px-2 text-sm"
                          onChange={e => setHours((p: any) => ({ ...p, [day]: { ...p[day], open: e.target.value } }))} />
                        <Input type="time" value={hours[day].close} className="h-8 px-2 text-sm"
                          onChange={e => setHours((p: any) => ({ ...p, [day]: { ...p[day], close: e.target.value } }))} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4"><Users size={24} className="text-accent" /></div>
                <h2 className="text-2xl font-black text-text-primary">Agrega tus barberos</h2>
                <p className="text-text-secondary text-sm mt-1">Al menos uno para continuar</p>
              </div>
              {barbers.length > 0 && (
                <div className="space-y-2">
                  {barbers.map((b, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-accent/10 border border-accent/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent text-background-primary flex items-center justify-center font-black text-sm">
                          {b.name[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-text-primary">{b.name}</span>
                      </div>
                      <button onClick={() => setBarbers(p => p.filter((_, idx) => idx !== i))}>
                        <Trash2 size={14} className="text-text-tertiary hover:text-danger" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-3">
                <Input placeholder="Nombre del barbero" value={newBarber.name} onChange={e => setNewBarber(p => ({ ...p, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="WhatsApp" value={newBarber.phone} onChange={e => setNewBarber(p => ({ ...p, phone: e.target.value }))} />
                  <Input placeholder="Email" value={newBarber.email} onChange={e => setNewBarber(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1 h-9 text-xs border-dashed"
                    onClick={() => setNewBarber({ name: userData?.user_metadata?.full_name || userData?.email?.split('@')[0] || '', phone: '', email: userData?.email || '' })}>
                    <User size={14} /> Soy yo el barbero
                  </Button>
                  <Button className="flex-1 h-9 text-xs" onClick={handleAddBarber} disabled={loading}>
                    <Plus size={14} /> Agregar
                  </Button>
                </div>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4"><Scissors size={24} className="text-accent" /></div>
                <h2 className="text-2xl font-black text-text-primary">¿Qué servicios ofreces?</h2>
                <p className="text-text-secondary text-sm mt-1">Selecciona los más comunes · puedes editarlos después</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {PRESET_SERVICES.map(s => {
                  const active = services.find(sv => sv.name === s.name);
                  return (
                    <button key={s.name} onClick={() => toggleService(s)}
                      className={cn('p-3 rounded-xl border text-left transition-all relative', active ? 'bg-accent/10 border-accent' : 'bg-background-tertiary/40 border-border hover:border-border-strong')}>
                      {active && <div className="absolute top-2 right-2 w-4 h-4 bg-accent rounded-full flex items-center justify-center"><Check size={10} className="text-background-primary" /></div>}
                      <p className="text-xs font-bold text-text-primary mb-0.5">{s.name}</p>
                      <p className="text-[10px] text-text-secondary font-mono">${s.price.toLocaleString()} · {s.duration}min</p>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-text-secondary text-center">{services.length} servicio{services.length !== 1 ? 's' : ''} seleccionado{services.length !== 1 ? 's' : ''}</p>
            </>
          )}

          <div className="flex items-center gap-3 pt-2">
            {step > 1 && (
              <Button variant="secondary" onClick={() => setStep(p => p - 1)} className="h-12 px-5">
                <ChevronLeft size={18} />
              </Button>
            )}
            <Button
              className="flex-1 h-12 text-base font-black"
              onClick={handleNext}
              disabled={loading || (step === 3 && barbers.length === 0) || (step === 4 && services.length === 0)}
            >
              {loading ? 'Guardando...' : step === 4 ? '🚀 Finalizar' : <>Continuar <ChevronRight size={18} /></>}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
