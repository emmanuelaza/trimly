"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Check, 
  ShieldCheck, 
  Lock, 
  RefreshCcw, 
  Globe, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  Zap,
  Star,
  Infinity,
  MessageCircle,
  BarChart3,
  FileSpreadsheet,
  Users,
  Calendar,
  Gift,
  Search,
  ChevronRight,
  PartyPopper,
  XCircle
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { differenceInDays, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface BillingClientProps {
  barbershop: any;
  currentPlanId?: string;
}

const PLANS = [
  {
    id: 'mensual',
    name: 'Plan Mensual',
    price: '$29.900',
    period: 'COP / mes',
    usd: '~$7 USD/mes',
    badge: 'Flexible',
    sections: [
      {
        title: 'AGENDA Y CLIENTES',
        items: ['Citas ilimitadas', 'Hasta 3 barberos', 'Historial de clientes completo', 'Recordatorios automáticos 24h antes']
      },
      {
        title: 'AUTOMATIZACIONES',
        items: ['Confirmación inmediata al agendar', 'Reporte diario del negocio por email']
      },
      {
        title: 'SOPORTE',
        items: ['Reportes básicos del negocio', 'Soporte por WhatsApp']
      }
    ]
  },
  {
    id: 'anual',
    name: 'Plan Anual',
    price: '$249.000',
    period: 'COP / año',
    usd: '~$59 USD/año',
    badge: 'Más popular',
    popular: true,
    savings: 'Ahorras $109.800 — 2 meses gratis',
    sections: [
      {
        title: 'TODO LO DEL MENSUAL, MÁS:',
        items: [
          'Barberos ilimitados',
          'Recuperar clientes inactivos (45+ días sin visita)',
          'Felicitación de cumpleaños con descuento',
          'Seguimiento post-visita y pedido de reseñas',
          'Reportes avanzados con métricas de retención',
          'Exportar reportes a Excel',
          'Métricas de retención de clientes',
          'Soporte prioritario'
        ]
      }
    ]
  },
  {
    id: 'lifetime',
    name: 'Plan Lifetime',
    price: '$599.000',
    period: 'pago único',
    usd: '~$143 USD',
    badge: 'Mejor valor',
    subtext: 'Acceso de por vida',
    sections: [
      {
        title: 'TODO LO DEL ANUAL, MÁS:',
        items: [
          'Sin pagos mensuales nunca más',
          'Todas las nuevas funciones gratis para siempre',
          'Onboarding personalizado 1 a 1',
          'Acceso anticipado a nuevas funciones',
          'Canal directo con el fundador',
          'Paga hoy, usa para siempre'
        ]
      }
    ]
  }
];

export default function BillingClient({ barbershop, currentPlanId }: BillingClientProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const expired = searchParams.get('expired');

  const trialEndsAt = barbershop?.trial_ends_at;
  const isTrialing = barbershop?.subscription_status === 'trialing';
  
  const trialDays = trialEndsAt 
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const handleCheckout = async (planId: string) => {
    if (currentPlanId === planId) return;
    
    setLoading(planId);
    try {
      const res = await fetch(`/api/checkout/${planId}`, { method: 'POST' });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
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

  if (status === 'success') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-4"
        >
          <PartyPopper size={48} />
        </motion.div>
        <h1 className="text-4xl font-black text-text-primary">¡Bienvenido a Trimly!</h1>
        <p className="text-xl text-text-secondary max-w-md">Tu plan está activo. Estamos listos para potenciar tu barbería.</p>
        <Button 
          size="lg" 
          onClick={() => router.push('/dashboard')}
          className="px-12 py-6 text-lg font-bold"
        >
          Ir al dashboard
        </Button>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-white mb-4"
        >
          <XCircle size={48} />
        </motion.div>
        <h1 className="text-4xl font-black text-text-primary">Hubo un problema con el pago</h1>
        <p className="text-xl text-text-secondary max-w-md">No pudimos procesar tu transacción. Por favor, inténtalo de nuevo.</p>
        <Button 
          size="lg" 
          variant="secondary"
          onClick={() => router.push('/dashboard/billing')}
          className="px-12 py-6 text-lg font-bold"
        >
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-black text-text-primary tracking-tight">Elige tu plan</h1>
        <p className="text-text-tertiary text-xl max-w-2xl mx-auto">
          Trimly trabaja por ti mientras tú cortas. Sin comisiones ocultas.
        </p>
      </div>

      {/* Trial Banner */}
      {isTrialing && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center justify-center gap-3 text-center font-bold ${
            trialDays <= 2 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-accent/10 text-accent border border-accent/20'
          }`}
        >
          {trialDays <= 2 ? <AlertTriangle size={20} /> : <Zap size={20} />}
          <span>
            {trialDays >= 3 
              ? `Tienes ${trialDays} días de prueba gratis — todas las funciones disponibles, sin tarjeta`
              : trialDays > 0 
                ? `Tu prueba vence en ${trialDays} ${trialDays === 1 ? 'día' : 'días'} — elige un plan`
                : 'Tu prueba ha vencido — elige un plan para continuar'}
          </span>
        </motion.div>
      )}

      {expired && !isTrialing && (
        <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl flex items-center justify-center gap-3 font-bold border border-red-500/20">
          <AlertTriangle size={20} />
          <span>Tu acceso ha expirado. Por favor selecciona un plan para continuar.</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col p-8 border-2 transition-all hover:translate-y-[-4px] ${
              plan.popular 
                ? 'border-accent shadow-2xl shadow-accent/10 ring-4 ring-accent/5' 
                : 'border-border hover:border-accent/30'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge variant="accent" className="px-6 py-1.5 text-xs font-black shadow-lg">MÁS POPULAR</Badge>
              </div>
            )}
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-accent uppercase tracking-widest bg-accent/10 px-2 py-1 rounded">
                  {plan.badge}
                </span>
                {currentPlanId === plan.id && (
                  <Badge variant="secondary" className="font-bold">Plan actual</Badge>
                )}
              </div>
              <h3 className="text-3xl font-black text-text-primary">{plan.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-text-primary">{plan.price}</span>
                <span className="text-text-tertiary text-sm font-bold uppercase tracking-tighter">{plan.period}</span>
              </div>
              <div className="space-y-1">
                {plan.savings && <p className="text-accent text-sm font-black">{plan.savings}</p>}
                {plan.subtext && <p className="text-text-primary text-sm font-bold">{plan.subtext}</p>}
                <p className="text-text-tertiary text-xs font-mono">{plan.usd}</p>
              </div>
            </div>

            <div className="space-y-8 flex-1 mb-10">
              {plan.sections.map((section, idx) => (
                <div key={idx} className="space-y-4">
                  <p className="text-[10px] font-black text-text-tertiary uppercase tracking-widest border-b border-border pb-2">
                    {section.title}
                  </p>
                  <ul className="space-y-3">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check size={16} className="text-accent mt-0.5 shrink-0" />
                        <span className="text-sm text-text-secondary leading-tight">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => handleCheckout(plan.id)}
                loading={loading === plan.id}
                disabled={currentPlanId === plan.id}
                variant={plan.popular ? 'primary' : 'secondary'}
                className={`w-full py-6 rounded-2xl font-black text-base shadow-xl transition-all ${
                  plan.popular ? 'shadow-accent/20' : 'shadow-black/5'
                }`}
              >
                {currentPlanId === plan.id ? 'Plan actual' : 'Empezar gratis 3 días'}
              </Button>
              <p className="text-center text-[11px] font-bold text-text-tertiary">
                3 días gratis · Sin tarjeta de crédito
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Trust Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-16 border-t border-b border-border">
        <TrustItem icon={<Lock size={20} />} title="Pago 100% seguro" sub="con Mercado Pago" />
        <TrustItem icon={<Zap size={20} />} title="3 días gratis" sub="sin tarjeta de crédito" />
        <TrustItem icon={<RefreshCcw size={20} />} title="Cancela" sub="cuando quieras" />
        <TrustItem icon={<ShieldCheck size={20} />} title="Datos" sub="protegidos" />
        <TrustItem icon={<Globe size={20} />} title="Global" sub="cualquier país" />
      </div>

      {/* Footnote */}
      <div className="text-center">
        <p className="text-xs text-text-tertiary max-w-2xl mx-auto leading-relaxed font-medium">
          Precios en COP. El equivalente en USD es referencial. 
          Mercado Pago convierte automáticamente según la tasa del día.
        </p>
      </div>
    </div>
  );
}

function TrustItem({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-background-tertiary flex items-center justify-center text-accent shadow-sm border border-border/50">
        {icon}
      </div>
      <div>
        <p className="text-xs font-black text-text-primary">{title}</p>
        <p className="text-[10px] text-text-tertiary font-bold uppercase tracking-tighter">{sub}</p>
      </div>
    </div>
  );
}
