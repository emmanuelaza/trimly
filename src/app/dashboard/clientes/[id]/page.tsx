import { getClients } from '@/app/actions/clients';
import { getAppointments } from '@/app/actions/appointments';
import { getServices } from '@/app/actions/services';
import Link from 'next/link';
import { ChevronLeft, Calendar, Star } from 'lucide-react';
import { Card, Avatar, Badge, StatCard } from '@/components/ui/RedesignComponents';
import ClientProfileActions from './ClientProfileActions';

const STATUS_LABELS: Record<string, string> = {
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  pending: 'Pendiente',
  no_show: 'No asistió',
}

const STATUS_VARIANT: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
  completed: 'success',
  confirmed: 'info',
  pending: 'warning',
  cancelled: 'danger',
  no_show: 'danger',
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota',
  });
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota',
  });
}

export default async function PerfilCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const allCitas = await getAppointments();
  const servicios = await getServices();
  const allClientes = await getClients();

  const cliente = allClientes.find((c: any) => c.id === id);
  const citasCliente = allCitas
    .filter((c: any) => c.client_id === id)
    .sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  if (!cliente) return <div className="p-10 text-center text-text-secondary">Cliente no encontrado</div>;

  const totalGastado = citasCliente.reduce((acc: number, c: any) => acc + (Number(c.price_charged) || 0), 0);
  const getInitials = (n: string) => n ? n.substring(0, 2).toUpperCase() : 'C';

  // Real "Servicio Favorito"
  const serviceCount: Record<string, { name: string; count: number }> = {}
  for (const cita of citasCliente) {
    const name = (cita.service as any)?.name
    if (name) {
      if (!serviceCount[name]) serviceCount[name] = { name, count: 0 }
      serviceCount[name].count++
    }
  }
  const servicioFavorito = Object.values(serviceCount).sort((a, b) => b.count - a.count)[0]?.name ?? null

  // Real "Barbero Favorito"
  const barberCount: Record<string, { name: string; count: number }> = {}
  for (const cita of citasCliente) {
    const name = (cita.barber as any)?.name
    if (name) {
      if (!barberCount[name]) barberCount[name] = { name, count: 0 }
      barberCount[name].count++
    }
  }
  const barberoFavorito = Object.values(barberCount).sort((a, b) => b.count - a.count)[0]?.name ?? null

  // "Cliente desde"
  const clienteDesde = cliente.created_at
    ? new Date(cliente.created_at).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
    : null

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link href="/dashboard/clientes" className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium">
        <ChevronLeft size={16} /> Volver a directorio
      </Link>

      {/* Hero */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-6">
          <Avatar initials={getInitials(cliente.name)} className="w-20 h-20 text-2xl" />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-text-primary">{cliente.name}</h1>
              {(cliente as any)?.vip && <Badge variant="info">VIP</Badge>}
            </div>
            <p className="text-sm text-text-secondary">{cliente.phone}</p>
            {clienteDesde && (
              <p className="text-xs text-text-tertiary mt-1">Cliente desde {clienteDesde}</p>
            )}
          </div>
        </div>
        <ClientProfileActions
          cliente={cliente}
          allClientes={allClientes}
          servicios={servicios}
        />
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Visitas" value={citasCliente.length} />
        <StatCard label="Total Gastado" value={`$${totalGastado.toLocaleString('es-CO')}`} />
        <StatCard label="Email" value={cliente.email || '—'} />
        <StatCard label="Cumpleaños" value={cliente.birthdate ? new Date(cliente.birthdate + 'T00:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }) : '—'} />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Preferencias */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4 flex items-center gap-2">
              <Star size={14} /> Preferencias
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Servicio Favorito</p>
                <div className="inline-block bg-background-tertiary px-3 py-1.5 rounded-md text-xs font-medium text-text-primary border border-border">
                  {servicioFavorito ?? 'Sin datos'}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Barbero Favorito</p>
                <div className="inline-block bg-background-tertiary px-3 py-1.5 rounded-md text-xs font-medium text-text-primary border border-border">
                  {barberoFavorito ?? 'Sin datos'}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Notas</p>
                <p className="text-sm text-text-secondary bg-background-tertiary border border-border rounded-lg p-3 min-h-[60px] whitespace-pre-wrap">
                  {cliente.notas || <span className="italic text-text-tertiary">Sin notas. Edita el cliente para agregar.</span>}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Historial */}
        <div className="md:col-span-2 space-y-6">
          <Card className="h-full">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calendar size={14} /> Historial de Citas
            </h3>

            {citasCliente.length === 0 ? (
              <div className="text-center py-10 text-text-tertiary text-sm">
                Aún no hay historial para este cliente.
              </div>
            ) : (
              <div className="space-y-3">
                {citasCliente.map((cita: any) => (
                  <div
                    key={cita.id}
                    className="relative flex items-start gap-4 border border-border rounded-xl p-4 bg-background-tertiary/50 hover:bg-background-tertiary transition-colors overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-border-strong rounded-l-xl" />

                    <div className="flex-1 pl-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-bold text-text-primary">
                          {formatDate(cita.scheduled_at)} · {formatTime(cita.scheduled_at)}
                        </p>
                        <Badge variant={STATUS_VARIANT[cita.status] ?? 'warning'}>
                          {STATUS_LABELS[cita.status] ?? cita.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {(cita.service as any)?.name ?? 'Servicio general'}
                        {(cita.barber as any)?.name && (
                          <span className="text-text-tertiary"> · {(cita.barber as any).name}</span>
                        )}
                      </p>
                      <p className="text-xs text-text-tertiary mt-1 font-mono">
                        ${Number(cita.price_charged).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
