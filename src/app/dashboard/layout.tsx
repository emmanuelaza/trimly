import { Sidebar, BottomNav } from '@/components/layout/DashboardNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal';
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

  // Check if barbershop exists - Using a fresh query
  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (!barbershop) {
    redirect('/onboarding');
  }

  const negocio = user.user_metadata?.negocio || "Barbería";

  // Fetch data needed for the global new-appointment modal
  const [clientes, servicios] = await Promise.all([
    getClients(),
    getServices(),
  ]);

  return (
    <div className="flex min-h-screen bg-background-primary overflow-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar negocio={negocio} userName={user.user_metadata?.full_name || "Owner"} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
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
