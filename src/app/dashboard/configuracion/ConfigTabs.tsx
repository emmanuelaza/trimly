"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Save, Building2, Clock, Bell, User2, Scissors, ChevronDown, Smartphone, Copy, ExternalLink, MessageCircle, DollarSign, CreditCard, Check, Crown, Zap, Flame } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { updateBarbershop } from '@/app/actions/barbershops';
import { deleteService } from '@/app/actions/services';
import { deleteBarber } from '@/app/actions/barbers';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ConfigTab {
  id: string;
  label: string;
  icon: React.ElementType;
}

const TABS: ConfigTab[] = [
  { id: 'negocio',        label: 'Mi Negocio',   icon: Building2  },
  { id: 'servicios',      label: 'Servicios',    icon: Scissors   },
  { id: 'barberos',       label: 'Barberos',     icon: User2      },
  { id: 'planes',         label: 'Mis planes',   icon: CreditCard },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell     },
  { id: 'cuenta',         label: 'Mi Cuenta',    icon: User2      },
];

// Country → currency mapping
const COUNTRY_CURRENCIES: Record<string, { code: string; symbol: string; name: string }> = {
  "Colombia":       { code: "COP", symbol: "$",  name: "Peso colombiano (COP)" },
  "España":         { code: "EUR", symbol: "€",  name: "Euro (EUR)" },
  "México":         { code: "MXN", symbol: "$",  name: "Peso mexicano (MXN)" },
  "Argentina":      { code: "ARS", symbol: "$",  name: "Peso argentino (ARS)" },
  "Chile":          { code: "CLP", symbol: "$",  name: "Peso chileno (CLP)" },
  "Estados Unidos": { code: "USD", symbol: "$",  name: "Dólar estadounidense (USD)" },
  "Perú":           { code: "PEN", symbol: "S/", name: "Sol peruano (PEN)" },
  "Ecuador":        { code: "USD", symbol: "$",  name: "Dólar (USD)" },
  "Venezuela":      { code: "VES", symbol: "Bs", name: "Bolívar venezolano (VES)" },
  "Uruguay":        { code: "UYU", symbol: "$",  name: "Peso uruguayo (UYU)" },
  "Panamá":         { code: "PAB", symbol: "B/", name: "Balboa (PAB)" },
  "Costa Rica":     { code: "CRC", symbol: "₡",  name: "Colón costarricense (CRC)" },
};


export default function ConfigTabs({ data }: { data: { barbershop: any, services: any[], barbers: any[] } }) {
  const [activeTab, setActiveTab] = useState('negocio');
  const [openAccordion, setOpenAccordion] = useState<string | null>('negocio');

  const { barbershop, services, barbers } = data;

  const toggleAccordion = (id: string) =>
    setOpenAccordion(prev => (prev === id ? null : id));

  function TabNegocio() {
    const [isPending, startTransition] = React.useTransition();
    const [selectedCountry, setSelectedCountry] = useState<string>(barbershop?.country || "Colombia");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      startTransition(async () => {
        const result = await updateBarbershop(formData);
        if (result.success) {
          toast.success("Configuración guardada");
        } else {
          toast.error(result.error || "Error al guardar");
        }
      });
    };

    const bookingUrl = `trimlyapp-phi.vercel.app/book/${barbershop?.slug}`;
    const suggestedCurrency = COUNTRY_CURRENCIES[selectedCountry] || COUNTRY_CURRENCIES["Colombia"];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-accent" /> Datos del Negocio
          </h2>
          <p className="text-xs text-text-secondary">Información pública de tu barbería.</p>
        </div>

        {/* Link de Reservas */}
        <Card className="bg-accent/5 border-accent/20 border-2 p-6 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
             <Smartphone size={120} className="rotate-12" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-accent">
                <Smartphone size={18} />
                <h3 className="text-sm font-black uppercase tracking-widest">Link de Reservas Público</h3>
              </div>
              <p className="text-xs text-text-secondary max-w-md">Comparte este link en tu Instagram o WhatsApp para que tus clientes agenden solos 24/7.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="bg-background-primary border border-border rounded-lg px-4 py-2 text-[11px] font-mono text-text-secondary flex items-center gap-3 shadow-sm">
                {bookingUrl}
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`https://${bookingUrl}`);
                    toast.success("Link copiado");
                  }}
                  className="text-accent hover:scale-110 transition-transform"
                  title="Copiar link"
                >
                  <Copy size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => window.open(`https://${bookingUrl}`, '_blank')}
                  className="px-3"
                >
                  <ExternalLink size={14} />
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => {
                    const url = `https://wa.me/?text=${encodeURIComponent(`¡Hola! Ya puedes agendar tu cita en ${barbershop.name} aquí: https://${bookingUrl}`)}`;
                    window.open(url, '_blank');
                  }}
                  className="flex-1 font-bold"
                >
                  <MessageCircle size={15} /> Compartir
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Nombre Comercial</label>
                <input name="name" defaultValue={barbershop?.name || ""} className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Dirección</label>
                <input name="address" defaultValue={barbershop?.address || ""} placeholder="Calle 123..." className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">País &amp; Zona Horaria</label>
                <select 
                  name="country" 
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="Colombia">Colombia (GMT-5)</option>
                  <option value="España">España (GMT+1/2)</option>
                  <option value="México">México (GMT-6)</option>
                  <option value="Argentina">Argentina (GMT-3)</option>
                  <option value="Estados Unidos">Estados Unidos (GMT-5)</option>
                  <option value="Chile">Chile (GMT-3/4)</option>
                  <option value="Perú">Perú (GMT-5)</option>
                  <option value="Ecuador">Ecuador (GMT-5)</option>
                  <option value="Venezuela">Venezuela (GMT-4)</option>
                  <option value="Uruguay">Uruguay (GMT-3)</option>
                  <option value="Panamá">Panamá (GMT-5)</option>
                  <option value="Costa Rica">Costa Rica (GMT-6)</option>
                </select>
                <p className="text-[10px] text-text-secondary italic">Esto ajusta automáticamente el horario de tu agenda.</p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase">Teléfono</label>
                <input name="phone" defaultValue={barbershop?.phone || ""} placeholder="+57..." className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            
            {/* Currency Selector */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-text-secondary uppercase mb-4 flex items-center gap-2">
                <DollarSign size={14} className="text-accent" /> Divisa del Negocio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Moneda</label>
                  <select
                    name="currency"
                    defaultValue={barbershop?.config?.currency || suggestedCurrency.code}
                    className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors appearance-none"
                  >
                    <option value="COP">Peso colombiano (COP) — $</option>
                    <option value="EUR">Euro (EUR) — €</option>
                    <option value="MXN">Peso mexicano (MXN) — $</option>
                    <option value="ARS">Peso argentino (ARS) — $</option>
                    <option value="CLP">Peso chileno (CLP) — $</option>
                    <option value="USD">Dólar estadounidense (USD) — $</option>
                    <option value="PEN">Sol peruano (PEN) — S/</option>
                    <option value="VES">Bolívar venezolano (VES) — Bs</option>
                    <option value="UYU">Peso uruguayo (UYU) — $</option>
                    <option value="PAB">Balboa panameño (PAB) — B/</option>
                    <option value="CRC">Colón costarricense (CRC) — ₡</option>
                  </select>
                  <p className="text-[10px] text-text-secondary italic">
                    Sugerida para <span className="text-accent font-bold">{selectedCountry}</span>: <span className="font-bold">{suggestedCurrency.name}</span>
                  </p>
                </div>
                <div className="flex items-end pb-1">
                  <div className="bg-accent/5 border border-accent/20 rounded-xl px-5 py-4 flex items-center gap-4 w-full">
                    <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                      <DollarSign size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Moneda activa</p>
                      <p className="text-sm font-black text-text-primary mt-0.5">
                        {barbershop?.config?.currency || suggestedCurrency.code} &mdash; {suggestedCurrency.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-text-secondary uppercase mb-4 flex items-center gap-2">
                <Clock size={14} /> Horario de Atención
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                  <div key={day} className="p-3 bg-background-tertiary/50 border border-border rounded-lg">
                    <p className="text-[10px] font-bold text-text-secondary uppercase mb-2">{day}</p>
                    <div className="flex items-center gap-2">
                      <input name={`hours_${day.toLowerCase()}_open`} defaultValue={barbershop?.config?.hours?.[day.toLowerCase()]?.open || "09:00"} type="time" className="bg-transparent text-xs text-text-primary outline-none focus:text-accent" />
                      <span className="text-text-secondary">-</span>
                      <input name={`hours_${day.toLowerCase()}_close`} defaultValue={barbershop?.config?.hours?.[day.toLowerCase()]?.close || "19:00"} type="time" className="bg-transparent text-xs text-text-primary outline-none focus:text-accent" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando..." : <><Save size={15} /> Guardar cambios</>}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  function TabServicios() {
    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
              <Scissors size={16} className="text-accent" /> Servicios y Precios
            </h2>
            <p className="text-xs text-text-secondary">Gestiona los servicios. (Para añadir nuevos, ve a la sección principal de Servicios)</p>
          </div>
        </div>

        <div className="space-y-2">
          {services.map(s => (
            <Card key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-accent-muted`}>
                  <Scissors size={16} className={'text-accent'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{s.name}</p>
                  <p className="text-xs text-text-secondary">{s.duration_minutes} min</p>
                </div>
              </div>
              <div className="flex items-center gap-4 ml-12 sm:ml-0">
                <span className="text-sm font-mono text-text-primary">${Number(s.price).toLocaleString('es-CO')}</span>
                <Badge variant={'success'}>Activo</Badge>
                <button 
                  onClick={async () => {
                   if(confirm('¿Eliminar servicio?')) {
                     const res = await deleteService(s.id);
                     if(res.success) toast.success('Eliminado');
                     else toast.error('Error');
                   }
                  }}
                  className="text-xs text-text-secondary hover:text-danger px-2 py-1"
                >
                  Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function TabBarberos() {
    return (
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
              <User2 size={16} className="text-accent" /> Equipo de Barberos
            </h2>
          </div>
        </div>

        <div className="space-y-2">
          {barbers.map(b => (
            <Card key={b.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Avatar fallback={b.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)} />
                <div>
                  <p className="text-sm font-semibold text-text-primary">{b.name}</p>
                  <p className="text-xs text-text-secondary">Barbero</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={'success'}>Activo</Badge>
                <button 
                  onClick={async () => {
                   if(confirm('¿Eliminar barbero?')) {
                     const res = await deleteBarber(b.id);
                     if(res.success) toast.success('Eliminado');
                     else toast.error('Error');
                   }
                  }}
                  className="text-xs text-text-secondary hover:text-danger px-2 py-1"
                >
                  Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  function TabPlanes() {
    const plan   = barbershop?.plan ?? 'basico';
    const status = barbershop?.subscription_status ?? null;
    const trialEnd = barbershop?.trial_ends_at ?? null;
    const isTrial = status === 'trial' || status === 'trialing';

    const PLAN_META = {
      basico:   { label: 'Plan Básico',   icon: <Zap size={18} />,   precio: '$29.900/mes', cls: 'bg-background-tertiary text-text-secondary' },
      pro:      { label: 'Plan Filo Pro', icon: <Crown size={18} />, precio: '$79.900/mes', cls: 'bg-accent/10 text-accent' },
      lifetime: { label: 'Plan Lifetime', icon: <Flame size={18} />, precio: 'Pago único',  cls: 'bg-yellow-500/10 text-yellow-600' },
    };
    const metaKey = (plan in PLAN_META ? plan : 'basico') as keyof typeof PLAN_META;
    const planMeta = PLAN_META[metaKey];

    const features: Record<string, string[]> = {
      basico:   ['1 barbero', 'Agenda online', 'Link de reservas', 'Recordatorios automáticos', 'Hasta 100 citas/mes'],
      pro:      ['Barberos ilimitados', 'Citas ilimitadas', 'Reportes avanzados', 'Automatizaciones completas', 'Nómina y comisiones', 'Soporte prioritario'],
      lifetime: ['Todo el plan Filo Pro', 'Sin mensualidades nunca', 'Funciones futuras incluidas'],
    };
    const planKey = (plan in features ? plan : 'basico') as keyof typeof features;

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
            <CreditCard size={16} className="text-accent" /> Mis planes
          </h2>
          <p className="text-xs text-text-secondary">Tu suscripción actual y opciones de actualización.</p>
        </div>

        {/* Trial banner */}
        {isTrial && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/5 border border-warning/20">
            <span className="text-xl shrink-0">⏳</span>
            <div>
              <p className="text-sm font-bold text-warning">Período de prueba activo</p>
              {trialEnd && (
                <p className="text-xs text-text-secondary mt-0.5">
                  Vence el{' '}
                  {new Date(trialEnd).toLocaleDateString('es-CO', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Current plan card */}
        <Card className="p-5">
          <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-4">Plan actual</p>
          <div className="flex items-center gap-3 mb-5">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', planMeta.cls)}>
              {planMeta.icon}
            </div>
            <div>
              <p className="text-base font-black text-text-primary">{planMeta.label}</p>
              <p className="text-xs text-text-tertiary">{planMeta.precio}</p>
            </div>
          </div>

          <ul className="space-y-2 mb-5">
            {features[planKey].map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-text-secondary">
                <Check size={14} className="text-success shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <Link href="/dashboard/billing">
            <button className="w-full py-2.5 rounded-xl border border-accent text-accent text-sm font-bold hover:bg-accent hover:text-white transition-all">
              {plan === 'lifetime' ? 'Ver detalles del plan' : 'Mejorar o cambiar plan →'}
            </button>
          </Link>
        </Card>
      </div>
    );
  }

  function TabNotificaciones() {
    return <div className="space-y-5"><p className="text-sm text-text-secondary">Las notificaciones del sistema están ahora automatizadas por Cron Jobs y están siempre pre-configuradas para dispararse según los registros de la agenda.</p></div>;
  }

  function TabCuenta() {
    return <div className="space-y-5"><p className="text-sm text-text-secondary">Tu cuenta es administrada por la capa central de Auth de Supabase.</p></div>;
  }

  const TAB_CONTENT: Record<string, React.ReactNode> = {
    negocio:        <TabNegocio />,
    servicios:      <TabServicios />,
    barberos:       <TabBarberos />,
    planes:         <TabPlanes />,
    notificaciones: <TabNotificaciones />,
    cuenta:         <TabCuenta />,
  };

  return (
    <>
      {/* Desktop: sidebar tabs */}
      <div className="hidden md:grid md:grid-cols-4 xl:grid-cols-5 gap-8">
        <nav className="md:col-span-1 space-y-1">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-accent-muted text-accent'
                    : 'text-text-secondary hover:bg-background-secondary hover:text-text-primary'
                }`}
              >
                <tab.icon size={16} className={isActive ? 'text-accent' : ''} />
                <span className="text-sm font-medium">{tab.label}</span>
                {isActive && <div className="ml-auto w-1 h-4 bg-accent rounded-full" />}
              </button>
            );
          })}
        </nav>

        <div className="md:col-span-3 xl:col-span-4">
          <div className="page-fade" key={activeTab}>
            {TAB_CONTENT[activeTab]}
          </div>
        </div>
      </div>

      {/* Mobile: accordion */}
      <div className="md:hidden space-y-3">
        {TABS.map(tab => {
          const isOpen = openAccordion === tab.id;
          return (
            <div key={tab.id} className="bg-background-secondary border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => toggleAccordion(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left transition-all ${
                  isOpen ? 'text-accent bg-accent-muted/50' : 'text-text-primary'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isOpen ? 'bg-accent/15' : 'bg-background-tertiary'}`}>
                  <tab.icon size={16} className={isOpen ? 'text-accent' : 'text-text-secondary'} />
                </div>
                <span className="text-sm font-bold flex-1">{tab.label}</span>
                <ChevronDown
                  size={16}
                  className={`text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180 text-accent' : ''}`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-5 pb-5 pt-2 border-t border-border">
                  <div className="page-fade">
                    {TAB_CONTENT[tab.id]}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
