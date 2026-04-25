import { getAppointments } from '@/app/actions/appointments';
import { getClients } from '@/app/actions/clients';
import { getServices } from '@/app/actions/services';
import { getBarbershop } from '@/app/actions/barbershops';
import { AgendaTimeline } from '@/components/agenda/AgendaTimeline';

export const revalidate = 60;

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const filterDate = params.date || new Date().toISOString().split('T')[0];

  // Fetch all necessary data
  const [allCitas, clientes, servicios, barberos, barbershop] = await Promise.all([
    getAppointments(),
    getClients(),
    getServices(),
    getBarbers(),
    getBarbershop(),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Agenda</h1>
          <p className="text-sm text-text-tertiary mt-1">Navega y gestiona la programación semanal.</p>
        </div>
      </div>

      <AgendaTimeline
        allCitas={allCitas}
        clientes={clientes}
        servicios={servicios}
        barberos={barberos}
        initialDate={filterDate}
        barbershop={barbershop}
      />
    </div>
  );
}
