'use client';

import { useState } from 'react';
import { Check, Zap, Crown, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface Props {
  barbershop: any;
}

const PLANES = [
  {
    id: 'basico',
    label: 'Básico',
    precio: '$29.900',
    periodo: '/mes',
    badge: null,
    icon: <Zap size={20} />,
    features: [
      '1 barbero',
      'Agenda online',
      'Link de reservas',
      'Recordatorios automáticos',
      'Hasta 100 citas/mes',
    ],
    destacado: false,
  },
  {
    id: 'pro',
    label: 'Filo Pro',
    precio: '$79.900',
    periodo: '/mes',
    badge: 'Más popular',
    icon: <Crown size={20} />,
    features: [
      'Todo el plan Básico',
      'Barberos ilimitados',
      'Citas ilimitadas',
      'Reportes avanzados',
      'Automatizaciones completas',
      'Nómina y comisiones',
      'Soporte prioritario',
    ],
    destacado: true,
  },
  {
    id: 'lifetime',
    label: 'Lifetime',
    precio: '$559.000',
    periodo: ' pago único',
    badge: '🔥 Mejor valor',
    icon: <Flame size={20} />,
    features: [
      'Todo el plan Filo Pro',
      'Sin mensualidades nunca',
      'Funciones futuras incluidas',
    ],
    destacado: false,
  },
];

function planBadge(plan: string | null, status: string | null) {
  if (plan === 'lifetime') return { label: 'Plan Lifetime 🔥', cls: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30' };
  if (plan === 'pro')      return { label: 'Plan Filo Pro',    cls: 'bg-accent/10 text-accent border-accent/30' };
  return                          { label: 'Plan Básico',      cls: 'bg-background-tertiary text-text-secondary border-border' };
}

export default function PlanesClient({ barbershop }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const plan   = barbershop?.plan ?? 'basico';
  const status = barbershop?.subscription_status ?? null;
  const trialEnd = barbershop?.trial_ends_at ?? null;
  const isTrial = status === 'trial' || status === 'trialing';

  const badge = planBadge(plan, status);

  const handleSelect = (planId: string) => setSelectedPlan(planId);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Mis planes</h1>
        <p className="text-sm text-text-tertiary mt-1">Gestiona tu suscripción a Trimly</p>
      </div>

      {/* Trial banner */}
      {isTrial && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-warning/5 border border-warning/20">
          <span className="text-2xl shrink-0">⏳</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-warning">Estás en período de prueba</p>
            {trialEnd && (
              <p className="text-sm text-text-secondary mt-0.5">
                Tu prueba vence el{' '}
                <strong>
                  {new Date(trialEnd).toLocaleDateString('es-CO', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </strong>
              </p>
            )}
          </div>
          <Button size="sm" onClick={() => setSelectedPlan('pro')}>Activar mi plan</Button>
        </div>
      )}

      {/* Current plan card */}
      <div className="p-6 rounded-2xl bg-background-secondary border border-border">
        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-3">Plan actual</p>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              {plan === 'lifetime' ? <Flame size={20} /> : plan === 'pro' ? <Crown size={20} /> : <Zap size={20} />}
            </div>
            <div>
              <span className={cn('inline-block text-xs font-bold px-2.5 py-1 rounded-full border', badge.cls)}>
                {badge.label}
              </span>
              {plan === 'lifetime' ? (
                <p className="text-xs text-text-tertiary mt-1">Pago único de por vida</p>
              ) : (
                <p className="text-xs text-text-tertiary mt-1">
                  {plan === 'pro' ? '$79.900' : '$29.900'}/mes
                </p>
              )}
            </div>
          </div>
          {plan !== 'lifetime' && (
            <Button variant="secondary" size="sm" onClick={() => setSelectedPlan('pro')}>
              Mejorar plan
            </Button>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div>
        <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest mb-4">Planes disponibles</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANES.map(p => (
            <div
              key={p.id}
              className={cn(
                'relative rounded-2xl border p-6 flex flex-col gap-5 transition-all',
                p.destacado
                  ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                  : 'border-border bg-background-secondary hover:border-border-strong',
                plan === p.id && 'ring-2 ring-accent/30',
              )}
            >
              {/* Badge */}
              {p.badge && (
                <span className={cn(
                  'absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-black px-3 py-1 rounded-full whitespace-nowrap',
                  p.destacado ? 'bg-accent text-white' : 'bg-warning/20 text-warning border border-warning/30',
                )}>
                  {p.badge}
                </span>
              )}

              {/* Header */}
              <div>
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3',
                  p.destacado ? 'bg-accent text-white' : 'bg-background-tertiary text-text-secondary')}>
                  {p.icon}
                </div>
                <p className="text-base font-black text-text-primary">{p.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-text-primary">{p.precio}</span>
                  <span className="text-xs text-text-tertiary">{p.periodo}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 flex-1">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-text-secondary">
                    <Check size={14} className="text-success shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {plan === p.id ? (
                <div className="w-full text-center text-xs font-bold text-success bg-success/10 rounded-xl py-2.5">
                  ✓ Plan actual
                </div>
              ) : (
                <Button
                  variant={p.destacado ? 'primary' : 'secondary'}
                  className="w-full"
                  onClick={() => handleSelect(p.id)}
                >
                  Seleccionar
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact modal */}
      {selectedPlan && (
        <Modal
          isOpen
          onClose={() => setSelectedPlan(null)}
          title="Activar plan"
          footer={
            <Button className="w-full" onClick={() => setSelectedPlan(null)}>Entendido</Button>
          }
        >
          <div className="text-center space-y-4 py-2">
            <span className="text-5xl">💬</span>
            <p className="text-base font-bold text-text-primary">
              Para activar el plan{' '}
              <span className="text-accent capitalize">
                {PLANES.find(p => p.id === selectedPlan)?.label}
              </span>
            </p>
            <p className="text-sm text-text-secondary">
              Contáctanos por WhatsApp y te ayudamos en minutos. Solo escríbenos y en menos de 24 horas tu plan estará activo.
            </p>
            <div className="bg-background-tertiary/50 rounded-xl p-4">
              <p className="text-xs text-text-tertiary">
                Escríbenos: <span className="font-bold text-text-primary">soporte@trimlyapp.co</span>
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
