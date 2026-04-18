import { getClientes } from '@/app/actions/clientes';
import { getCitas, createCita } from '@/app/actions/citas';
import { getServicios } from '@/app/actions/servicios';
import { Plus } from 'lucide-react';
import { AgendaTimeline } from '@/components/agenda/AgendaTimeline';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const revalidate = 60;

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const filterDate = params.date || new Date().toISOString().split('T')[0];

  const allCitas = await getCitas();
  const citas = allCitas.filter((c: any) => c.fecha === filterDate);
  const clientes = await getClientes();
  const servicios = await getServicios();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Agenda Mensual</h1>
        <p className="text-sm text-text-tertiary mt-1">Gestiona tus citas y disponibilidad diaria.</p>
      </div>

      {/* Rápido Agendar (Optional) */}
      <Card className="bg-background-secondary/30 border-dashed">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
          <Plus size={16} /> Agendado rápido
        </h2>
        <form action={createCita} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Cliente</label>
            <select name="cliente_id" className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" required>
              <option value="">Seleccionar...</option>
              {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Servicio</label>
            <select name="servicio_id" className="w-full bg-background-tertiary border border-border rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors" required>
              <option value="">Servicio...</option>
              {servicios.map((s: any) => <option key={s.id} value={s.id}>{s.nombre} (${Number(s.precio).toLocaleString()})</option>)}
            </select>
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

      {/* Main Timeline */}
      <AgendaTimeline 
        citas={citas} 
        clientes={clientes} 
        servicios={servicios} 
        filterDate={filterDate} 
      />
    </div>
  );
}
