import { Sidebar, BottomNav } from '@/components/layout/DashboardNav';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal';
import { getClientes } from '@/app/actions/clientes';
import { getServicios } from '@/app/actions/servicios';
import { Suspense } from 'react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const negocio = user.user_metadata?.negocio || "Barbería";

  // Fetch data needed for the global new-appointment modal
  const [clientes, servicios] = await Promise.all([
    getClientes(),
    getServicios(),
  ]);

  return (
    <div className="flex min-h-screen bg-background-primary overflow-hidden">
      {/* Sidebar for Desktop */}
      <Sidebar negocio={negocio} />

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
