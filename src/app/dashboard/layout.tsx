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

  const [clientes, servicios] = await Promise.all([
    getClients(),
    getServices(),
  ]);

  const { data: bShop } = await supabase
    .from('barbershops')
    .select('subscription_status, trial_ends_at')
    .eq('id', barbershopId)
    .maybeSingle();

  const isTrial = bShop?.subscription_status === 'trialing';
  const trialDaysLeft = (isTrial && bShop?.trial_ends_at)
    ? Math.ceil(
        (new Date(bShop.trial_ends_at).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : 0;

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type')
    .eq('barbershop_id', barbershopId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isFiloPro =
    isTrial ||
    sub?.plan_type === 'filo_pro' ||
    sub?.plan_type === 'anual' ||
    sub?.plan_type === 'lifetime';

  return (
    <>
      <DashboardLayoutClient
        negocio={negocio}
        userName={user.user_metadata?.full_name || "Owner"}
        isTrial={isTrial}
        trialDaysLeft={trialDaysLeft}
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
