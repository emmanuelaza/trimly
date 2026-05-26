import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal';
import { getBarbershopId } from '@/lib/getBarbershopId';
import { getClients } from '@/app/actions/clients';
import { getServices } from '@/app/actions/services';
import { Suspense } from 'react';
import { MiloWelcome } from '@/components/milo/MiloWelcome';
import { DashboardLayoutClient } from '@/components/layout/DashboardLayoutClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const WA = '573016315482';

function SubscriptionBlockedScreen({ barbershopName }: { barbershopName: string }) {
  const msgBasico = encodeURIComponent(
    `Hola Emmanuel, quiero activar la Licencia Básica de Trimly por $499.000`
  );
  const msgPro = encodeURIComponent(
    `Hola Emmanuel, quiero activar la Licencia Pro de Trimly por $999.999`
  );
  const msgDudas = encodeURIComponent(
    `Hola Emmanuel, tengo una pregunta sobre Trimly`
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-icon.png" className="w-20 h-20 mb-6" alt="Trimly" />

      <h1 className="text-2xl font-bold text-text-primary">
        Tu período de prueba terminó
      </h1>
      <p className="text-text-muted mt-2 max-w-md">
        Activa tu licencia para seguir usando Trimly
        {barbershopName ? ` en ${barbershopName}` : ''} y conservar todos tus datos y clientes.
      </p>
      <p className="text-sm text-success mt-2 font-medium">
        ✓ Garantía de 7 días — si no estás satisfecho te devolvemos tu dinero
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 w-full max-w-2xl">
        {/* BÁSICO */}
        <div className="bg-background-3 border border-border rounded-2xl p-8">
          <h3 className="font-display font-bold text-xl text-text-primary">Licencia Básica</h3>
          <p className="text-text-muted text-sm mt-1">Para barberías que están empezando</p>
          <p className="text-4xl font-black font-display text-text-primary mt-4">
            $499.000
            <span className="text-sm font-normal text-text-muted"> único pago</span>
          </p>
          <ul className="text-sm text-text-secondary mt-6 space-y-2 text-left">
            <li>✓ 1 barbero incluido</li>
            <li>✓ Agenda online 24/7</li>
            <li>✓ Link de reservas personalizado</li>
            <li>✓ Confirmación y recordatorio automático</li>
            <li>✓ Hasta 100 citas por mes</li>
            <li>✓ Licencia de por vida</li>
            <li>✓ Garantía de 7 días</li>
          </ul>
          <a
            href={`https://wa.me/${WA}?text=${msgBasico}`}
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
          <ul className="text-sm text-text-secondary mt-6 space-y-2 text-left">
            <li>✓ Barberos ilimitados</li>
            <li>✓ Todo lo de la licencia básica</li>
            <li>✓ Citas ilimitadas</li>
            <li>✓ Nómina y comisiones</li>
            <li>✓ Todas las automatizaciones</li>
            <li>✓ Reportes y métricas avanzadas</li>
            <li>✓ Cupones y referidos</li>
            <li>✓ Soporte prioritario</li>
            <li>✓ Funciones futuras incluidas</li>
            <li>✓ Garantía de 7 días</li>
          </ul>
          <a
            href={`https://wa.me/${WA}?text=${msgPro}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-6 py-3 px-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors text-center"
          >
            Activar Licencia Pro
          </a>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-xs text-text-muted">
          🔒 Pago único · Sin mensualidades · Garantía 7 días · Soporte en español
        </p>
        <a
          href={`https://wa.me/${WA}?text=${msgDudas}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline font-medium"
        >
          ¿Tienes dudas? Escríbenos por WhatsApp →
        </a>
      </div>
    </div>
  );
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const barbershopId = await getBarbershopId();

  if (!barbershopId) {
    if (user.user_metadata?.role === 'barber') {
      redirect('/barber/dashboard');
    }
    redirect('/onboarding');
  }

  const negocio = user.user_metadata?.negocio || "Barbería";

  const [clientes, servicios, bShopRes] = await Promise.all([
    getClients(),
    getServices(),
    supabase
      .from('barbershops')
      .select('id, name, plan, subscription_status, trial_ends_at, license_number, license_activated_at')
      .eq('id', barbershopId)
      .maybeSingle(),
  ]);

  const bShop = bShopRes.data;

  // Auto-expire trials that have ended
  const ahora = new Date();
  if (
    (bShop?.subscription_status === 'trial' || bShop?.subscription_status === 'trialing') &&
    bShop?.trial_ends_at &&
    new Date(bShop.trial_ends_at) < ahora
  ) {
    await supabase
      .from('barbershops')
      .update({ subscription_status: 'expired' })
      .eq('id', barbershopId)
      .lt('trial_ends_at', ahora.toISOString());
    bShop.subscription_status = 'expired';
  }

  const trialVencido = bShop?.trial_ends_at
    ? new Date(bShop.trial_ends_at) < ahora
    : false;

  const estaExpirado =
    bShop?.subscription_status === 'expired' ||
    ((bShop?.subscription_status === 'trial' || bShop?.subscription_status === 'trialing') &&
      trialVencido);

  if (estaExpirado) {
    return <SubscriptionBlockedScreen barbershopName={bShop?.name ?? negocio} />;
  }

  const isTrial =
    bShop?.subscription_status === 'trialing' ||
    bShop?.subscription_status === 'trial';

  const trialDaysLeft = (isTrial && bShop?.trial_ends_at)
    ? Math.max(0, Math.ceil(
        (new Date(bShop.trial_ends_at).getTime() - ahora.getTime()) /
        (1000 * 60 * 60 * 24)
      ))
    : 0;

  return (
    <>
      <DashboardLayoutClient
        negocio={negocio}
        userName={user.user_metadata?.full_name || "Owner"}
        isTrial={isTrial}
        trialDaysLeft={trialDaysLeft}
        barbershopId={barbershopId}
        userId={user.id}
      >
        {children}
      </DashboardLayoutClient>

      <Suspense fallback={null}>
        <NewAppointmentModal clientes={clientes} servicios={servicios} />
      </Suspense>

      <MiloWelcome />
    </>
  );
}
