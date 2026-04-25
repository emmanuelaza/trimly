"use client";

import React, { useState } from 'react';
import { Save, Building2, Clock, Bell, User2, Scissors, ChevronRight, ChevronDown, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { updateBarbershop } from '@/app/actions/barbershops';
import { deleteService } from '@/app/actions/services';
import { deleteBarber } from '@/app/actions/barbers';
import toast from 'react-hot-toast';

interface ConfigTab {
  id: string;
  label: string;
  icon: React.ElementType;
}

const TABS: ConfigTab[] = [
  { id: 'negocio', label: 'Mi Negocio', icon: Building2 },
  { id: 'servicios', label: 'Servicios', icon: Scissors },
  { id: 'barberos', label: 'Barberos', icon: User2 },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { id: 'cuenta', label: 'Mi Cuenta', icon: User2 },
];

export default function ConfigTabs({ data }: { data: { barbershop: any, services: any[], barbers: any[] } }) {
  const [activeTab, setActiveTab] = useState('negocio');
  const [openAccordion, setOpenAccordion] = useState<string | null>('negocio');

  const { barbershop, services, barbers } = data;

  const toggleAccordion = (id: string) =>
    setOpenAccordion(prev => (prev === id ? null : id));

  function TabNegocio() {
    const [isPending, startTransition] = React.useTransition();

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

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-accent" /> Datos del Negocio
          </h2>
          <p className="text-xs text-text-tertiary">Información pública de tu barbería.</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Nombre Comercial</label>
                <input name="name" defaultValue={barbershop?.name || ""} className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Dirección</label>
                <input name="address" defaultValue={barbershop?.address || ""} placeholder="Calle 123..." className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
              </div>
               <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-tertiary uppercase">Teléfono</label>
                <input name="phone" defaultValue={barbershop?.phone || ""} placeholder="+57..." className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-xs font-bold text-text-secondary uppercase mb-4 flex items-center gap-2">
                <Clock size={14} /> Horario de Atención
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                  <div key={day} className="p-3 bg-background-tertiary/50 border border-border rounded-lg">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase mb-2">{day}</p>
                    <div className="flex items-center gap-2">
                      <input name={`hours_${day.toLowerCase()}_open`} defaultValue={barbershop?.config?.hours?.[day.toLowerCase()]?.open || "09:00"} type="time" className="bg-transparent text-xs text-text-primary outline-none focus:text-accent" />
                      <span className="text-text-tertiary">-</span>
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
            <p className="text-xs text-text-tertiary">Gestiona los servicios. (Para añadir nuevos, ve a la sección principal de Servicios)</p>
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
                  <p className="text-xs text-text-tertiary">{s.duration_minutes} min</p>
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
                  className="text-xs text-text-tertiary hover:text-danger px-2 py-1"
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
                  <p className="text-xs text-text-tertiary">Barbero</p>
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
                  className="text-xs text-text-tertiary hover:text-danger px-2 py-1"
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

  function TabNotificaciones() {
    return <div className="space-y-5"><p className="text-sm text-text-tertiary">Las notificaciones del sistema están ahora automatizadas por Cron Jobs y están siempre pre-configuradas para dispararse según los registros de la agenda.</p></div>;
  }

  function TabCuenta() {
    return <div className="space-y-5"><p className="text-sm text-text-tertiary">Tu cuenta es administrada por la capa central de Auth de Supabase.</p></div>;
  }

  const TAB_CONTENT: Record<string, React.ReactNode> = {
    negocio: <TabNegocio />,
    servicios: <TabServicios />,
    barberos: <TabBarberos />,
    notificaciones: <TabNotificaciones />,
    cuenta: <TabCuenta />,
  };

  return (
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
                  : 'text-text-tertiary hover:bg-background-secondary hover:text-text-secondary'
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
  );
}
