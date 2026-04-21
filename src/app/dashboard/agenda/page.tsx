import { getAppointments, createAppointment } from '@/app/actions/appointments';
import { getClients } from '@/app/actions/clients';
import { getServices } from '@/app/actions/services';
import { AgendaTimeline } from '@/components/agenda/AgendaTimeline';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Plus } from 'lucide-react';

export const revalidate = 60;

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const filterDate = params.date || new Date().toISOString().split('T')[0];

  // Fetch ALL citas so the week view has full data
  const [allCitas, clientes, servicios] = await Promise.all([
    getAppointments(),
    getClients(),
    getServices(),
  ]);

  // Day-filtered citas for the day view
  const citasForDay = allCitas.filter((c: any) => c.scheduled_at.startsWith(filterDate));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Agenda</h1>
        <p className="text-sm text-text-tertiary mt-1">Gestiona tus citas y disponibilidad.</p>
      </div>

      {/* Quick-add form */}
      <Card className="bg-background-secondary/30 border-dashed">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
          <Plus size={16} /> Agendar rápido
        </h2>
        <form action={createAppointment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Cliente</label>
            <Select name="client_id" required>
              <option value="">Seleccionar...</option>
              {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Servicio</label>
            <Select name="service_id" required>
              <option value="">Servicio...</option>
              {servicios.map((s: any) => <option key={s.id} value={s.id}>{s.name} (${Number(s.price).toLocaleString()})</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Fecha</label>
            <Input name="fecha" type="date" defaultValue={filterDate} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Hora</label>
            <Input name="hora" type="time" required />
          </div>
          <Button type="submit" className="w-full">
            <Plus size={18} /> Guardar
          </Button>
        </form>
      </Card>

      {/* Main timeline — receives all citas for week view + day-filtered for day view */}
      <AgendaTimeline
        citas={citasForDay}
        clientes={clientes}
        servicios={servicios}
        filterDate={filterDate}
        allCitas={allCitas}
      />
    </div>
  );
}
