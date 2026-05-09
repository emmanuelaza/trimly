import { getBarberDashboardData, completeAppointment } from '@/app/actions/barber-dashboard';
import BarberDashboardClient from './BarberDashboardClient';
import { redirect } from 'next/navigation';

export default async function BarberDashboardPage() {
  const data = await getBarberDashboardData();

  if (!data) {
    redirect('/login');
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-text-primary tracking-tight">Hola, {data.barber.name} 👋</h1>
        <p className="text-sm text-text-tertiary mt-1">Hoy es {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <BarberDashboardClient initialData={data} />
    </div>
  );
}
