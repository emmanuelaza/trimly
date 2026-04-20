"use client";

import React, { useState } from 'react';
import { Save, Building2, Clock, Bell, User2, Scissors, ChevronRight, ChevronDown, Settings, Smartphone } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

// ─── Types ─────────────────────────────────────────────────
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

// ─── Tab Content Panels ────────────────────────────────────
function TabNegocio() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
          <Building2 size={16} className="text-accent" /> Datos del Negocio
        </h2>
        <p className="text-xs text-text-tertiary">Información pública de tu barbería.</p>
      </div>

      <Card>
        <form className="space-y-6">
          {/* Logo */}
          <div className="flex items-center gap-4 pb-5 border-b border-border">
            <Avatar fallback="TB" size="lg" className="rounded-2xl text-xl" />
            <div>
              <Button variant="secondary" size="sm" type="button">Cambiar Logo</Button>
              <p className="text-[10px] text-text-tertiary mt-2">Recomendado: 400×400px, PNG o JPG. Máx 2MB.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Nombre Comercial</label>
              <input name="negocio" defaultValue="Trimly Barbershop" className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Dirección</label>
              <input name="direccion" placeholder="Calle 123 #45-67, Bogotá" className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Teléfono</label>
              <input name="telefono" placeholder="+57 300 000 0000" className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase">Horario Central</label>
              <input name="horario" defaultValue="09:00 - 18:00" className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
            </div>
          </div>

          {/* Schedule per day */}
          <div>
            <p className="text-[10px] font-bold text-text-tertiary uppercase mb-3">Días de atención</p>
            <div className="space-y-2">
              {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, i) => (
                <div key={day} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${i < 6 ? 'bg-accent' : 'bg-background-tertiary border border-border'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background-primary transition-all shadow-sm ${i < 6 ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <span className={`text-sm font-medium ${i < 6 ? 'text-text-primary' : 'text-text-tertiary'}`}>{day}</span>
                  </div>
                  {i < 6 && (
                    <div className="flex items-center gap-2">
                      <input type="time" defaultValue="09:00" className="bg-background-tertiary border border-border rounded-md px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent" />
                      <span className="text-text-tertiary text-xs">–</span>
                      <input type="time" defaultValue="18:00" className="bg-background-tertiary border border-border rounded-md px-2 py-1 text-xs text-text-primary focus:outline-none focus:border-accent" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">
              <Save size={15} /> Guardar cambios
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function TabServicios() {
  const [servicios, setServicios] = useState([
    { id: '1', nombre: 'Corte Clásico', precio: 35000, duracion: 30, activo: true },
    { id: '2', nombre: 'Corte + Barba', precio: 55000, duracion: 45, activo: true },
    { id: '3', nombre: 'Afeitado de Barba', precio: 25000, duracion: 20, activo: true },
    { id: '4', nombre: 'Keratina', precio: 80000, duracion: 60, activo: false },
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
            <Scissors size={16} className="text-accent" /> Servicios y Precios
          </h2>
          <p className="text-xs text-text-tertiary">Gestiona los servicios que ofreces.</p>
        </div>
        <Button size="sm">+ Añadir servicio</Button>
      </div>

      <div className="space-y-2">
        {servicios.map(s => (
          <Card key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.activo ? 'bg-accent-muted' : 'bg-background-tertiary'}`}>
                <Scissors size={16} className={s.activo ? 'text-accent' : 'text-text-tertiary'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">{s.nombre}</p>
                <p className="text-xs text-text-tertiary">{s.duracion} min</p>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-12 sm:ml-0">
              <span className="text-sm font-mono text-text-primary">${s.precio.toLocaleString('es-CO')}</span>
              <Badge variant={s.activo ? 'success' : 'neutral'}>{s.activo ? 'Activo' : 'Inactivo'}</Badge>
              <Button variant="ghost" size="sm" type="button">Editar</Button>
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
          <p className="text-xs text-text-tertiary">Gestiona los miembros de tu equipo.</p>
        </div>
        <Button size="sm">+ Invitar barbero</Button>
      </div>

      <div className="space-y-2">
        {[
          { nombre: 'Carlos Reyes', rol: 'Propietario', activo: true },
          { nombre: 'Andrés Moreno', rol: 'Barbero', activo: true },
          { nombre: 'Luis Páez', rol: 'Barbero', activo: false },
        ].map(b => (
          <Card key={b.nombre} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Avatar fallback={b.nombre.split(' ').map(n => n[0]).join('').substring(0, 2)} />
              <div>
                <p className="text-sm font-semibold text-text-primary">{b.nombre}</p>
                <p className="text-xs text-text-tertiary">{b.rol}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={b.activo ? 'success' : 'neutral'}>{b.activo ? 'Activo' : 'Inactivo'}</Badge>
              <Button variant="ghost" size="sm">Editar</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Invite form */}
      <Card className="border-dashed">
        <p className="text-xs text-text-tertiary mb-3">Invitar por email</p>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            className="flex-1 bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors"
          />
          <Button>Enviar invitación</Button>
        </div>
      </Card>
    </div>
  );
}

function TabNotificaciones() {
  const [toggles, setToggles] = useState({
    sms24: true,
    whatsapp2: true,
    nuevaCita: false,
  });

  const toggle = (key: keyof typeof toggles) =>
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const rows = [
    { key: 'sms24' as const, label: 'Recordatorio SMS al cliente', sub: '24 horas antes de la cita', icon: Smartphone },
    { key: 'whatsapp2' as const, label: 'Recordatorio WhatsApp al cliente', sub: '2 horas antes de la cita', icon: Smartphone },
    { key: 'nuevaCita' as const, label: 'Notificación nueva cita al barbero', sub: 'Cuando se agenda una cita', icon: Bell },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
          <Bell size={16} className="text-accent" /> Notificaciones
        </h2>
        <p className="text-xs text-text-tertiary">Configura cuándo y cómo se envían recordatorios.</p>
      </div>

      <Card>
        <div className="divide-y divide-border">
          {rows.map(row => (
            <div key={row.key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-background-tertiary flex items-center justify-center flex-shrink-0 mt-0.5">
                  <row.icon size={15} className="text-text-secondary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{row.label}</p>
                  <p className="text-xs text-text-tertiary mt-0.5">{row.sub}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(row.key)}
                className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ml-4 ${toggles[row.key] ? 'bg-accent' : 'bg-background-tertiary border border-border'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-background-primary transition-all shadow-sm ${toggles[row.key] ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TabCuenta() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest flex items-center gap-2 mb-1">
          <User2 size={16} className="text-accent" /> Mi Cuenta
        </h2>
        <p className="text-xs text-text-tertiary">Credenciales y plan actual.</p>
      </div>

      <Card className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase">Email</label>
            <input type="email" defaultValue="barbero@trimly.co" className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase">Nueva contraseña</label>
            <input type="password" placeholder="••••••••" className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary focus:outline-none focus:border-accent transition-colors" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button>
            <Save size={15} /> Guardar cambios
          </Button>
        </div>
      </Card>

      {/* Plan */}
      <Card className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1">Plan actual</p>
          <div className="flex items-center gap-2">
            <Badge variant="info">Pro</Badge>
            <span className="text-sm text-text-secondary">$29 USD / mes</span>
          </div>
        </div>
        <Button variant="secondary" size="sm">Cambiar plan</Button>
      </Card>

      {/* Danger zone */}
      <Card className="border-danger/30 bg-danger-bg/30">
        <p className="text-xs font-bold text-danger uppercase tracking-wider mb-3">Zona de peligro</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Cerrar sesión</p>
            <p className="text-xs text-text-tertiary">Salir de tu cuenta en este dispositivo.</p>
          </div>
          <form action="/auth/signout" method="post">
            <Button type="submit" variant="danger" size="sm">Cerrar sesión</Button>
          </form>
        </div>
      </Card>
    </div>
  );
}

// Map tab id → component
const TAB_CONTENT: Record<string, React.ReactNode> = {
  negocio: <TabNegocio />,
  servicios: <TabServicios />,
  barberos: <TabBarberos />,
  notificaciones: <TabNotificaciones />,
  cuenta: <TabCuenta />,
};

// ─── Main Page ─────────────────────────────────────────────
export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('negocio');
  const [openAccordion, setOpenAccordion] = useState<string | null>('negocio');

  const toggleAccordion = (id: string) =>
    setOpenAccordion(prev => (prev === id ? null : id));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Configuración</h1>
        <p className="text-sm text-text-tertiary mt-1">Personaliza tu perfil, negocio y preferencias.</p>
      </div>

      {/* ── Desktop: vertical tabs ── */}
      <div className="hidden md:grid md:grid-cols-4 xl:grid-cols-5 gap-8">
        {/* Tab rail */}
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

        {/* Content panel */}
        <div className="md:col-span-3 xl:col-span-4">
          <div className="page-fade" key={activeTab}>
            {TAB_CONTENT[activeTab]}
          </div>
        </div>
      </div>

      {/* ── Mobile: accordion ── */}
      <div className="md:hidden space-y-2">
        {TABS.map(tab => {
          const isOpen = openAccordion === tab.id;
          return (
            <div key={tab.id} className="rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => toggleAccordion(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${isOpen ? 'bg-background-secondary' : 'bg-background-secondary/50 hover:bg-background-secondary'}`}
              >
                <tab.icon size={16} className={isOpen ? 'text-accent' : 'text-text-tertiary'} />
                <span className={`text-sm font-semibold flex-1 ${isOpen ? 'text-text-primary' : 'text-text-secondary'}`}>{tab.label}</span>
                {isOpen
                  ? <ChevronDown size={16} className="text-accent transition-transform" />
                  : <ChevronRight size={16} className="text-text-tertiary" />
                }
              </button>
              {isOpen && (
                <div className="px-4 py-5 border-t border-border bg-background-primary/50 page-fade">
                  {TAB_CONTENT[tab.id]}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
