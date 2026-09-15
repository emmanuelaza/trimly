'use client';

import { Check } from 'lucide-react';
import { Certificado } from '@/components/licencia/Certificado';

const WA = '573016315482';

const MSG_LICENCIA = encodeURIComponent(
  'Hola Emmanuel, quiero activar la Licencia Trimly por $399.000'
);

interface Props {
  barbershop: any;
}

function LicenseCards() {
  return (
    <div className="max-w-md">
      <div className="bg-primary/5 border-2 border-primary rounded-2xl p-8 relative">
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
          Pago único
        </span>
        <h3 className="font-display font-bold text-xl text-text-primary">Licencia Trimly</h3>
        <p className="text-text-muted text-sm mt-1">Todo el sistema, sin límites</p>
        <p className="text-4xl font-black font-display text-primary mt-4">
          $399.000
          <span className="text-sm font-normal text-text-muted"> único pago</span>
        </p>
        <ul className="text-sm text-text-secondary mt-6 space-y-2">
          {[
            'Barberos ilimitados',
            'Agenda online 24/7',
            'Link de reservas personalizado',
            'Confirmación y recordatorio automático',
            'Citas ilimitadas',
            'Nómina y comisiones',
            'Todas las automatizaciones',
            'Reportes y métricas avanzadas',
            'Cupones y referidos',
            'Soporte prioritario',
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
          href={`https://wa.me/${WA}?text=${MSG_LICENCIA}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-6 py-3 px-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors text-center"
        >
          Activar Licencia Trimly
        </a>
      </div>
    </div>
  );
}

export default function PlanesClient({ barbershop }: Props) {
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
                <span className="font-semibold text-text-primary">Trimly</span>
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
            licenseNumber={licenseNumber}
            activatedAt={licenseActivatedAt}
          />
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
