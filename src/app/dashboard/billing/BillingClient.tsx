"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, ShieldCheck, Lock, RefreshCcw, Globe, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

const PLANS = [
  {
    id: 'mensual',
    name: 'Plan Mensual',
    price: '$29.900',
    period: '/ mes',
    tag: 'Flexible',
    usd: '~$7 USD/mes',
    features: ['Agenda ilimitada', 'Hasta 3 barberos', 'Automatizaciones', 'Reportes básicos', 'Soporte por WhatsApp'],
    buttonText: 'Elegir mensual',
    popular: false,
  },
  {
    id: 'anual',
    name: 'Plan Anual',
    price: '$249.000',
    period: '/ año',
    tag: 'Más popular',
    subtext: 'Ahorras $109.800 vs mensual',
    usd: '~$59 USD/año',
    features: ['Todo lo del mensual', 'Barberos ilimitados', 'Reportes avanzados', 'Exportar a Excel', 'Soporte prioritario'],
    buttonText: 'Elegir anual',
    popular: true,
  },
  {
    id: 'lifetime',
    name: 'Plan Lifetime',
    price: '$599.000',
    period: ' pago único',
    tag: 'Mejor valor',
    subtext: 'Acceso de por vida',
    usd: '~$143 USD',
    features: ['Todo lo del anual', 'Sin pagos futuros', 'Nuevas funciones gratis', 'Onboarding 1 a 1', 'Acceso anticipado'],
    buttonText: 'Pagar una vez',
    popular: false,
  }
];

export default function BillingClient({ barbershop }: { barbershop: any }) {
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  React.useEffect(() => {
    if (status === 'success') {
      toast.success('¡Pago exitoso! Tu suscripción se está activando.');
    } else if (status === 'failed') {
      toast.error('Hubo un problema con el pago. Inténtalo de nuevo.');
    }
  }, [status]);

  const handleCheckout = async (planId: string) => {
    setLoading(planId);
    try {
      const res = await fetch(`/api/checkout/${planId}`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        throw new Error(data.error || 'Error al iniciar checkout');
      }
    } catch (error: any) {
      toast.error(error.message);
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-text-primary tracking-tight">Elige el plan ideal para tu barbería</h1>
        <p className="text-text-tertiary text-lg max-w-2xl mx-auto">
          Potencia tu negocio con todas las herramientas de Trimly. Cancela en cualquier momento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative flex flex-col p-8 border-2 transition-all hover:scale-[1.02] ${
              plan.popular ? 'border-accent shadow-2xl shadow-accent/10' : 'border-border'
            }`}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <Badge variant="accent" className="px-4 py-1 text-xs">MÁS POPULAR</Badge>
              </div>
            )}
            
            <div className="space-y-4 mb-8">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">{plan.tag}</span>
              <h3 className="text-2xl font-bold text-text-primary">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-text-primary">{plan.price}</span>
                <span className="text-text-tertiary text-sm font-medium">{plan.period}</span>
              </div>
              <div className="space-y-1">
                {plan.subtext && <p className="text-accent text-xs font-bold">{plan.subtext}</p>}
                <p className="text-text-tertiary text-[10px] font-mono">{plan.usd}</p>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center mt-0.5">
                    <Check size={12} className="text-accent" />
                  </div>
                  <span className="text-sm text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <Button 
              onClick={() => handleCheckout(plan.id)}
              loading={loading === plan.id}
              variant={plan.popular ? 'primary' : 'outline'}
              className="w-full py-4 rounded-xl font-bold text-sm shadow-lg shadow-accent/5"
            >
              <CreditCard size={18} className="mr-2" />
              {plan.buttonText}
            </Button>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6 pt-12 border-t border-border">
        <TrustItem icon={<Lock size={20} />} title="Pago con Mercado Pago" sub="100% seguro y encriptado" />
        <TrustItem icon={<ShieldCheck size={20} />} title="Datos Protegidos" sub="Privacidad garantizada" />
        <TrustItem icon={<Check size={20} />} title="7 días gratis" sub="Sin tarjeta vinculada" />
        <TrustItem icon={<RefreshCcw size={20} />} title="Sin Ataduras" sub="Cancela cuando quieras" />
        <TrustItem icon={<Globe size={20} />} title="Pago Global" sub="Cualquier país del mundo" />
      </div>

      <div className="text-center">
        <p className="text-xs text-text-tertiary max-w-2xl mx-auto leading-relaxed">
          Los precios se muestran en COP. Para clientes internacionales el equivalente aproximado en USD se muestra como referencia. 
          Mercado Pago maneja la conversión automáticamente al momento del pago. El soporte para pagos internacionales depende de tu banco.
        </p>
      </div>
    </div>
  );
}

function TrustItem({ icon, title, sub }: { icon: React.ReactNode, title: string, sub: string }) {
  return (
    <div className="flex flex-col items-center text-center space-y-2">
      <div className="w-10 h-10 rounded-2xl bg-background-tertiary flex items-center justify-center text-accent">
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-text-primary">{title}</p>
        <p className="text-[10px] text-text-tertiary">{sub}</p>
      </div>
    </div>
  );
}
