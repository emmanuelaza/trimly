import { Sidebar, BottomNav } from '@/components/layout/DashboardNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal';
import { getBarbershopId } from '@/lib/getBarbershopId';
import { getClients } from '@/app/actions/clients';
import { getServices } from '@/app/actions/services';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // TAREA: Verificar si el usuario tiene barbershop, si no, crearlo automáticamente
  const barbershopId = await getBarbershopId();

  const negocio = user.user_metadata?.negocio || "Barbería";

  // Fetch data needed for the global new-appointment modal
  const [clientes, servicios] = await Promise.all([
    getClients(),
    getServices(),
  ]);

  const { data: bShop } = await supabase.from('barbershops').select('subscription_status, trial_ends_at').eq('id', barbershopId).maybeSingle();
  const isTrial = bShop?.subscription_status === 'trialing';
  const trialDaysLeft = isTrial ? Math.ceil((new Date(bShop.trial_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="flex min-h-screen bg-background-primary overflow-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar negocio={negocio} userName={user.user_metadata?.full_name || "Owner"} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {isTrial && (
          <div className="bg-accent/10 border-b border-accent/20 px-6 py-2 flex items-center justify-between animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <p className="text-xs font-bold text-accent uppercase tracking-wider">
                Prueba Gratis Activa: Quedan {trialDaysLeft} días
              </p>
            </div>
            <a href="/dashboard/billing" className="text-[10px] font-black bg-accent text-background-primary px-3 py-1 rounded-full hover:scale-105 transition-all">
              VER PLANES
            </a>
          </div>
        )}
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12">
            <div className="page-fade">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <BottomNav />

      {/* Global Modals */}
      <Suspense fallback={null}>
        <NewAppointmentModal clientes={clientes} servicios={servicios} />
      </Suspense>
    </div>
  );
}
