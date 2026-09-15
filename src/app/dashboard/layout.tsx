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
