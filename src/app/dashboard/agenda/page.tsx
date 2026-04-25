import { getAppointments, createAppointment } from '@/app/actions/appointments';
import { getClients } from '@/app/actions/clients';
import { getServices } from '@/app/actions/services';
import { AgendaTimeline } from '@/components/agenda/AgendaTimeline';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Plus } from 'lucide-react';

import { QuickAddAppointment } from '@/components/agenda/QuickAddAppointment';

export const revalidate = 60;

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const filterDate = params.date || new Date().toISOString().split('T')[0];

  // Fetch ALL citas
  const [allCitas, clientes, servicios] = await Promise.all([
    getAppointments(),
    getClients(),
    getServices(),
  ]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Agenda</h1>
        <p className="text-sm text-text-tertiary mt-1">Gestiona tus citas y disponibilidad.</p>
      </div>

      <QuickAddAppointment clientes={clientes} servicios={servicios} filterDate={filterDate} />

      {/* Main timeline — receives all citas for both views */}
      <AgendaTimeline
        allCitas={allCitas}
        clientes={clientes}
        servicios={servicios}
        filterDate={filterDate}
      />
    </div>
  );
}
