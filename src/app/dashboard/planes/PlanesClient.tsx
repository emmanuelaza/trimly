'use client';

import { Check } from 'lucide-react';
import { Certificado } from '@/components/licencia/Certificado';

const WA = '573016315482';

const MSG_BASICO = encodeURIComponent(
  'Hola Emmanuel, quiero activar la Licencia Básica de Trimly por $499.000'
);
const MSG_PRO = encodeURIComponent(
  'Hola Emmanuel, quiero activar la Licencia Pro de Trimly por $999.999'
);
const MSG_UPGRADE = encodeURIComponent(
  'Hola Emmanuel, quiero hacer upgrade de Básico a Pro en Trimly'
);

interface Props {
  barbershop: any;
}

function LicenseCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* BÁSICO */}
      <div className="bg-background-secondary border border-border rounded-2xl p-8">
        <h3 className="font-display font-bold text-xl text-text-primary">Licencia Básica</h3>
        <p className="text-text-muted text-sm mt-1">Para barberías que están empezando</p>
        <p className="text-4xl font-black font-display text-text-primary mt-4">
          $499.000
          <span className="text-sm font-normal text-text-muted"> único pago</span>
        </p>
        <ul className="text-sm text-text-secondary mt-6 space-y-2">
          {[
            '1 barbero incluido',
            'Agenda online 24/7',
            'Link de reservas personalizado',
            'Confirmación y recordatorio automático',
            'Hasta 100 citas por mes',
            'Licencia de por vida',
            'Garantía de 7 días',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check size={14} className="text-success flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <a
          href={`https://wa.me/${WA}?text=${MSG_BASICO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-6 py-3 px-4 border-2 border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/10 transition-colors text-center"
        >
          Activar Licencia Básica
        </a>
      </div>

      {/* PRO */}
      <div className="bg-primary/5 border-2 border-primary rounded-2xl p-8 relative">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
          Más popular
        </span>
        <h3 className="font-display font-bold text-xl text-text-primary">Licencia Pro</h3>
        <p className="text-text-muted text-sm mt-1">Para barberías serias sin límites</p>
        <p className="text-4xl font-black font-display text-primary mt-4">
          $999.999
          <span className="text-sm font-normal text-text-muted"> único pago</span>
        </p>
        <ul className="text-sm text-text-secondary mt-6 space-y-2">
          {[
            'Barberos ilimitados',
            'Todo lo de la licencia básica',
            'Citas ilimitadas',
            'Nómina y comisiones',
            'Todas las automatizaciones',
            'Reportes y métricas avanzadas',
            'Cupones y referidos',
            'Soporte prioritario',
            'Funciones futuras incluidas',
            'Garantía de 7 días',
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check size={14} className="text-success flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <a
          href={`https://wa.me/${WA}?text=${MSG_PRO}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-6 py-3 px-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors text-center"
        >
          Activar Licencia Pro
        </a>
      </div>
    </div>
  );
}

export default function PlanesClient({ barbershop }: Props) {
  const plan = barbershop?.plan ?? 'basic';
  const status = barbershop?.subscription_status ?? 'trialing';
  const trialEnd = barbershop?.trial_ends_at ?? null;
  const licenseNumber = barbershop?.license_number ?? null;
  const licenseActivatedAt = barbershop?.license_activated_at ?? null;
  const barbershopName = barbershop?.name ?? 'Tu barbería';

  const isTrialing = status === 'trialing' || status === 'trial';
  const isActive = status === 'active';
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Mi licencia</h1>
        <p className="text-sm text-text-muted mt-1">Gestiona tu licencia de Trimly</p>
      </div>

      {/* TRIALING */}
      {isTrialing && (
        <div className="p-6 rounded-2xl bg-success/5 border border-success/20">
          <p className="text-lg font-bold text-success">Estás en tu prueba gratuita 🎉</p>
          <p className="text-sm text-text-secondary mt-1">
            Tienes acceso completo al plan Pro durante{' '}
            <strong>{trialDaysLeft} día{trialDaysLeft !== 1 ? 's' : ''}</strong> más.
          </p>
          <p className="text-sm text-text-muted mt-1">
            Activa tu licencia antes de que venza para no perder nada.
          </p>
        </div>
      )}

      {/* ACTIVE — license info */}
      {isActive && (
        <>
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">
              Licencia activa
            </p>
            <div className="space-y-2">
              {licenseNumber && (
                <p className="font-mono text-lg text-primary font-bold">{licenseNumber}</p>
              )}
              <p className="text-sm text-text-secondary">
                Plan:{' '}
                <span className="font-semibold text-text-primary capitalize">
                  {plan === 'pro' ? 'Pro' : 'Básico'}
                </span>
                {' '}· Estado:{' '}
                <span className="text-success font-semibold">Activo ✓</span>
              </p>
              {licenseActivatedAt && (
                <p className="text-xs text-text-muted">
                  Activada el{' '}
                  {new Date(licenseActivatedAt).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
            </div>
          </div>

          <Certificado
            barbershopName={barbershopName}
            plan={plan}
            licenseNumber={licenseNumber}
            activatedAt={licenseActivatedAt}
          />

          {/* Upgrade básico → pro */}
          {plan === 'basic' && (
            <div className="p-6 rounded-2xl bg-background-secondary border border-border">
              <p className="text-base font-bold text-text-primary">¿Quieres más funciones?</p>
              <p className="text-sm text-text-muted mt-1">
                Sube al plan Pro pagando solo la diferencia
              </p>
              <div className="mt-3">
                <p className="text-sm text-text-muted line-through">$999.999</p>
                <p className="text-3xl font-black text-primary">$500.999</p>
                <p className="text-xs text-success mt-0.5">
                  Ahorras $499.000 por ya tener la licencia básica
                </p>
              </div>
              <a
                href={`https://wa.me/${WA}?text=${MSG_UPGRADE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 py-2.5 px-6 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors"
              >
                Upgrade a Pro por WhatsApp →
              </a>
            </div>
          )}
        </>
      )}

      {/* License cards — show always */}
      <div>
        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">
          {isActive ? 'Opciones disponibles' : 'Activa tu licencia'}
        </p>
        <LicenseCards />
      </div>

      <p className="text-xs text-text-muted text-center">
        🔒 Pago único · Sin mensualidades · Garantía 7 días · Soporte en español
      </p>
    </div>
  );
}
