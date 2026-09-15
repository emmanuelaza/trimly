import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal';
import { getBarbershopId } from '@/lib/getBarbershopId';
import { getClients } from '@/app/actions/clients';
import { getServices } from '@/app/actions/services';
import { Suspense } from 'react';
import { MiloWelcome } from '@/components/milo/MiloWelcome';
import { DashboardLayoutClient } from '@/components/layout/DashboardLayoutClient';
import { OneSignalScript } from '@/components/notifications/OneSignalScript';

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
  const ahora = new Date();

  const isActive = bShop?.subscription_status === 'active';
  const wasTrialing =
    bShop?.subscription_status === 'trialing' || bShop?.subscription_status === 'trial';
  const trialEndsAtDate = bShop?.trial_ends_at ? new Date(bShop.trial_ends_at) : null;
  const trialVencido = trialEndsAtDate ? trialEndsAtDate < ahora : false;

  // El estado que se muestra se calcula siempre en vivo a partir de
  // trial_ends_at, sin depender de que este update de "expired" se haya
  // aplicado a tiempo — así nunca queda desincronizado con la realidad.
  if (wasTrialing && trialVencido) {
    const { error: expireError } = await supabase
      .from('barbershops')
      .update({ subscription_status: 'expired' })
      .eq('id', barbershopId)
      .lt('trial_ends_at', ahora.toISOString());
    if (expireError) console.error('Error auto-expiring trial:', expireError);
  }

  const planStatus: 'trialing' | 'active' | 'expired' = isActive
    ? 'active'
    : wasTrialing && !trialVencido
    ? 'trialing'
    : 'expired';

  const trialDaysLeft = (planStatus === 'trialing' && trialEndsAtDate)
    ? Math.max(0, Math.ceil((trialEndsAtDate.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const trialHoursLeft = (planStatus === 'trialing' && trialEndsAtDate)
    ? Math.max(0, Math.ceil((trialEndsAtDate.getTime() - ahora.getTime()) / (1000 * 60 * 60)))
    : 0;

  return (
    <>
      <OneSignalScript />
      <DashboardLayoutClient
        negocio={negocio}
        userName={user.user_metadata?.full_name || "Owner"}
        planStatus={planStatus}
        trialDaysLeft={trialDaysLeft}
        trialHoursLeft={trialHoursLeft}
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
