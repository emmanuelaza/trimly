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

const SUPPORT_WA = process.env.NEXT_PUBLIC_SUPPORT_WA || '573001234567';

const PLANES = [
  { id: 'Básico',    precio: '$29.900/mes',      destacado: false },
  { id: 'Filo Pro',  precio: '$79.900/mes',       destacado: true  },
  { id: 'Lifetime',  precio: '$559.000 pago único', destacado: false },
];

function SubscriptionBlockedScreen({ barbershopName }: { barbershopName: string }) {
  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8 text-center">
        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Trimly" width={64} className="mx-auto" />

        <div className="space-y-3">
          <h1 className="text-3xl font-black text-text-primary">Tu período de prueba terminó</h1>
          <p className="text-text-secondary text-base leading-relaxed">
            Activa un plan para seguir usando Trimly<br />
            y no perder tus datos ni tus clientes.
          </p>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {PLANES.map((plan) => {
            const msg = encodeURIComponent(
              `Hola, quiero activar el plan ${plan.id} para mi barbería ${barbershopName}`
            );
            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 flex flex-col gap-4 ${
                  plan.destacado
                    ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                    : 'border-border bg-background-secondary'
                }`}
              >
                {plan.destacado && (
                  <span className="text-[10px] font-black bg-accent text-white px-3 py-1 rounded-full w-fit">
                    Más popular
                  </span>
                )}
                <div>
                  <p className="text-base font-black text-text-primary">{plan.id}</p>
                  <p className="text-2xl font-black text-text-primary mt-1">{plan.precio}</p>
                </div>
                <a
                  href={`https://wa.me/${SUPPORT_WA}?text=${msg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center py-3 rounded-xl text-sm font-bold transition-colors ${
                    plan.destacado
                      ? 'bg-accent text-white hover:bg-accent/90'
                      : 'bg-background-tertiary text-text-primary hover:bg-border'
                  }`}
                >
                  Activar {plan.id}
                </a>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-text-tertiary">
          Tu página pública de reservas sigue activa mientras decides.
        </p>
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
      .select('id, name, plan, subscription_status, trial_ends_at')
      .eq('id', barbershopId)
      .maybeSingle(),
  ]);

  const bShop = bShopRes.data;

  // Auto-expire trials that have ended
  const ahora = new Date();
  if (
    bShop?.subscription_status === 'trial' &&
    bShop?.trial_ends_at &&
    new Date(bShop.trial_ends_at) < ahora
  ) {
    await supabase
      .from('barbershops')
      .update({ subscription_status: 'expired' })
      .eq('id', barbershopId)
      .lt('trial_ends_at', ahora.toISOString())
      .eq('subscription_status', 'trial');
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
