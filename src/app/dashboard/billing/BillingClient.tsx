"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Check,
  ShieldCheck,
  Lock,
  RefreshCcw,
  Globe,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

interface BillingClientProps {
  barbershop: any;
  currentPlanId?: string;
}

type PlanId = 'mensual' | 'anual' | 'lifetime';

interface PlanSection {
  title: string;
  items: string[];
}

interface Plan {
  id: PlanId;
  badge: string;
  badgeClassName: string;
  planLabel: string;
  price: string;
  priceSuffix: string;
  priceSubtext: string;
  priceSubtextClassName: string;
  highlighted?: boolean;
  checkBgClassName: string;
  checkColorClassName: string;
  buttonVariant: 'primary' | 'secondary' | 'danger' | 'ghost';
  buttonClassName?: string;
  sections: PlanSection[];
}

const PLANS: Plan[] = [
  {
    id: 'mensual',
    badge: 'Flexible',
    badgeClassName: 'bg-background-tertiary text-text-secondary',
    planLabel: 'MENSUAL',
    price: '$29.900',
    priceSuffix: '/mes',
    priceSubtext: '~$7 USD/mes',
    priceSubtextClassName: 'text-success/80',
    checkBgClassName: 'bg-success-bg',
    checkColorClassName: 'text-success',
    buttonVariant: 'secondary',
    sections: [
      {
        title: 'AGENDA Y CLIENTES',
        items: [
          'Citas ilimitadas',
          'Hasta 3 barberos',
          'Historial de clientes completo',
          'Recordatorios automáticos 24h antes',
        ],
      },
      {
        title: 'AUTOMATIZACIONES',
        items: [
          'Confirmación inmediata al agendar',
          'Reporte diario del negocio por email',
        ],
      },
      {
        title: 'SOPORTE',
        items: [
          'Reportes básicos del negocio',
          'Soporte por WhatsApp',
        ],
      },
    ],
  },
  {
    id: 'anual',
    badge: 'Más popular',
    badgeClassName: 'bg-violet-500/10 text-violet-400',
    planLabel: 'ANUAL',
    price: '$249.000',
    priceSuffix: '/año',
    priceSubtext: 'Ahorras $109.800 — 2 meses gratis',
    priceSubtextClassName: 'text-success',
    highlighted: true,
    checkBgClassName: 'bg-violet-500/10',
    checkColorClassName: 'text-violet-400',
    buttonVariant: 'primary',
    sections: [
      {
        title: 'TODO LO DEL MENSUAL, MÁS:',
        items: [
          'Barberos ilimitados',
          'Recuperar clientes inactivos (45+ días)',
          'Felicitación de cumpleaños con descuento',
          'Seguimiento post-visita y reseñas',
          'Reportes avanzados',
          'Exportar reportes a Excel',
          'Métricas de retención de clientes',
          'Soporte prioritario',
        ],
      },
    ],
  },
  {
    id: 'lifetime',
    badge: 'Mejor valor',
    badgeClassName: 'bg-teal-500/10 text-teal-400',
    planLabel: 'PAGO ÚNICO',
    price: '$599.000',
    priceSuffix: ' una vez',
    priceSubtext: '~$143 USD · Acceso de por vida',
    priceSubtextClassName: 'text-success',
    checkBgClassName: 'bg-teal-500/10',
    checkColorClassName: 'text-teal-400',
    buttonVariant: 'primary',
    buttonClassName: 'bg-success hover:bg-success/90 text-background-primary border-none',
    sections: [
      {
        title: 'TODO LO DEL ANUAL, MÁS:',
        items: [
          'Sin pagos mensuales nunca más',
          'Todas las nuevas funciones gratis',
          'Onboarding personalizado 1 a 1',
          'Acceso anticipado a funciones',
          'Canal directo con el fundador',
          'Paga hoy, usa para siempre',
        ],
      },
    ],
  },
];

const TRUST_ITEMS = [
  {
    icon: <Lock size={16} />,
    iconClassName: 'bg-green-500/10 text-green-500',
    text: 'Pago 100% seguro con Mercado Pago',
  },
  {
    icon: <Check size={16} />,
    iconClassName: 'bg-violet-500/10 text-violet-400',
    text: '3 días gratis sin tarjeta',
  },
  {
    icon: <RefreshCcw size={16} />,
    iconClassName: 'bg-blue-500/10 text-blue-400',
    text: 'Cancela cuando quieras',
  },
  {
    icon: <ShieldCheck size={16} />,
    iconClassName: 'bg-orange-500/10 text-orange-400',
    text: 'Datos encriptados',
  },
  {
    icon: <Globe size={16} />,
    iconClassName: 'bg-green-500/10 text-green-500',
    text: 'Tarjetas de cualquier país',
  },
];

export default function BillingClient({ barbershop, currentPlanId }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  const isTrialing = barbershop?.subscription_status === 'trialing';

  const handleCheckout = async (planId: string) => {
    if (currentPlanId === planId) return;

    setLoading(planId);
    try {
      const res = await fetch(`/api/checkout/${planId}`, { method: 'POST' });
      const data = await res.json();

      if (data.url || data.init_point) {
        window.location.href = data.url || data.init_point;
      } else if (data.success) {
        toast.success('¡Prueba de 3 días activada!');
        router.refresh();
        setLoading(null);
      } else {
        throw new Error(data.error || 'Error al iniciar checkout');
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* ── Post-payment Status Banners ── */}
      {status === 'success' && (
        <div className="bg-success-bg border border-success/20 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-success">
              <Check size={20} />
            </div>
            <p className="text-success font-semibold">
              ¡Bienvenido a Trimly! Tu plan está activo.
            </p>
          </div>
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-success hover:bg-success/90 text-background-primary w-full sm:w-auto"
          >
            Ir al dashboard
          </Button>
        </div>
      )}

      {status === 'failed' && (
        <div className="bg-danger-bg border border-danger/20 rounded-xl p-5 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <AlertTriangle className="text-danger" size={20} />
          <p className="text-danger font-semibold">
            Hubo un problema con el pago. Intenta de nuevo.
          </p>
        </div>
      )}

      {status === 'pending' && (
        <div className="bg-warning-bg border border-warning/20 rounded-xl p-5 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <RefreshCcw className="text-warning animate-spin-slow" size={20} />
          <p className="text-warning font-semibold">
            Tu pago está siendo procesado. Te avisaremos por email.
          </p>
        </div>
      )}

      {/* ── Header ── */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary tracking-tight">
          Elige tu plan
        </h1>
        <p className="text-text-tertiary text-lg max-w-2xl mx-auto leading-relaxed">
          Trimly trabaja por ti mientras tú cortas. <br className="hidden sm:block" />
          Sin comisiones ocultas.
        </p>
      </div>

      {/* ── Trial Banner ── */}
      {isTrialing && (
        <div className="bg-accent-muted border border-accent/20 rounded-xl px-6 py-4 text-center max-w-3xl mx-auto">
          <p className="text-accent font-medium">
            Tienes 3 días de prueba gratis — todas las funciones disponibles, sin tarjeta
          </p>
        </div>
      )}

      {/* ── Plans Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative flex flex-col p-8 transition-all hover:border-border-strong ${
                plan.highlighted
                  ? 'border-2 border-accent shadow-lg shadow-accent/5'
                  : 'border border-border'
              }`}
            >
              {/* Badge */}
              <div className="mb-6">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${plan.badgeClassName}`}
                >
                  {plan.badge}
                </span>
              </div>

              {/* Plan Name */}
              <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-[0.2em] mb-2">
                {plan.planLabel}
              </p>

              {/* Price Area */}
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-4xl font-bold text-text-primary tracking-tight">
                  {plan.price}
                </span>
                <span className="text-sm text-text-secondary font-medium">
                  {plan.priceSuffix}
                </span>
              </div>

              {/* Price Subtext */}
              <p className={`text-sm font-medium mb-6 ${plan.priceSubtextClassName}`}>
                {plan.priceSubtext}
              </p>

              {/* Divider */}
              <div className="h-px bg-border w-full mb-8" />

              {/* Feature Sections */}
              <div className="space-y-8 flex-1 mb-10">
                {plan.sections.map((section, idx) => (
                  <div key={idx} className="space-y-4">
                    <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                      {section.title}
                    </p>
                    <ul className="space-y-3.5">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full ${plan.checkBgClassName} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            <Check size={12} className={plan.checkColorClassName} />
                          </div>
                          <span className="text-sm text-text-secondary leading-normal">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Action Section */}
              <div className="space-y-3 mt-auto">
                {isCurrentPlan && (
                  <div className="text-center mb-1">
                    <Badge variant="accent" className="text-[10px] uppercase font-bold px-3 py-1">
                      Plan actual
                    </Badge>
                  </div>
                )}
                <Button
                  onClick={() => handleCheckout(plan.id)}
                  loading={loading === plan.id}
                  disabled={isCurrentPlan}
                  variant={plan.buttonVariant}
                  size="lg"
                  className={`w-full font-bold h-12 ${plan.buttonClassName || ''}`}
                >
                  {isCurrentPlan ? 'Plan actual' : 'Elegir Plan'}
                </Button>
                <p className="text-center text-xs text-text-tertiary font-medium">
                  Pago seguro · Cancela en cualquier momento
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Trust Elements ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 py-8">
        {TRUST_ITEMS.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${item.iconClassName} flex items-center justify-center shrink-0 shadow-sm`}
            >
              {item.icon}
            </div>
            <p className="text-xs text-text-secondary font-medium leading-snug">
              {item.text}
            </p>
          </div>
        ))}
      </div>

      {/* ── Footnote ── */}
      <div className="text-center pt-4 border-t border-border">
        <p className="text-xs text-text-tertiary max-w-2xl mx-auto leading-relaxed">
          Precios en COP. El equivalente en USD es referencial. <br />
          Mercado Pago convierte automáticamente según la tasa del día.
        </p>
      </div>
    </div>
  );
}
