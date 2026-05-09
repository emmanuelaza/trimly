import { getBarberDashboardData } from '@/app/actions/barber-dashboard';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/RedesignComponents';
import { Calendar as CalendarIcon } from 'lucide-react';

export default async function BarberAgendaPage() {
  const data = await getBarberDashboardData();
  if (!data) redirect('/login');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-primary">Mi Agenda</h1>
        <p className="text-sm text-text-tertiary mt-1">Consulta tus citas programadas</p>
      </div>

      <Card className="min-h-[600px] flex flex-col items-center justify-center border-dashed opacity-60">
        <CalendarIcon size={48} className="text-text-tertiary mb-4" />
        <p className="text-sm font-medium text-text-secondary">El calendario completo estará disponible pronto.</p>
        <p className="text-xs text-text-tertiary mt-2 text-center max-w-xs">
          Por ahora puedes ver tus próximas citas en la pantalla de Inicio.
        </p>
      </Card>
    </div>
  );
}
