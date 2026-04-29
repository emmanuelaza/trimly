import { getAppointments } from '@/app/actions/appointments';
import { DollarSign, ArrowUpRight, ArrowDownRight, Printer, Download } from 'lucide-react';

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota'
  });
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Bogota'
  });
}
import { StatCard, Card, Badge, Button, Avatar } from '@/components/ui/RedesignComponents';

export default async function IngresosPage() {
  const citas = await getAppointments();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Calcula el inicio de la semana (Lunes)
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
  const firstDayStr = firstDay.toISOString().split('T')[0];

  const citasHoy = citas.filter((c: any) => c.scheduled_at.startsWith(todayStr));
  const ingresosHoy = citasHoy.reduce((acc: number, c: any) => acc + (Number(c.price_charged) || 0), 0);

  const citasSemana = citas.filter((c: any) => c.scheduled_at && c.scheduled_at >= firstDayStr && c.scheduled_at <= (todayStr + 'T23:59:59'));
  const ingresosSemana = citasSemana.reduce((acc: number, c: any) => acc + (Number(c.price_charged) || 0), 0);

  const citasMes = citas.filter((c: any) => c.scheduled_at && c.scheduled_at.startsWith(currentMonthStr));
  const ingresosMes = citasMes.reduce((acc: number, c: any) => acc + (Number(c.price_charged) || 0), 0);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Reportes Financieros</h1>
          <p className="text-sm text-text-tertiary mt-1">Sigue el crecimiento de tu negocio en tiempo real.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="secondary" className="h-10">
             <Printer size={16} /> Imprimir
           </Button>
           <Button variant="primary" className="h-10">
             <Download size={16} /> Exportar CSV
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          label="Ventas Hoy" 
          value={`$${ingresosHoy.toLocaleString()}`} 
          sub={`${citasHoy.length} transacciones`}
          trend="↑ 8%" 
        />
        <StatCard 
          label="Ventas Semana" 
          value={`$${ingresosSemana.toLocaleString()}`} 
          sub={`${citasSemana.length} servicios`}
          trend="↑ 14%" 
        />
        <StatCard 
          label="Proyectado Mes" 
          value={`$${ingresosMes.toLocaleString()}`} 
          sub="Basado en citas agendadas"
          trend="↓ 2%" 
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Simple (Barra) */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="bg-background-secondary/20">
              <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-6">Canales de Ingreso</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Cortes', val: 75, color: 'bg-accent' },
                   { label: 'Barba', val: 15, color: 'bg-info' },
                   { label: 'Productos', val: 10, color: 'bg-warning' }
                 ].map((item) => (
                   <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-medium">
                         <span className="text-text-secondary">{item.label}</span>
                         <span className="text-text-primary">{item.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-background-tertiary rounded-full overflow-hidden">
                         <div className={`h-full ${item.color}`} style={{ width: `${item.val}%` }} />
                      </div>
                   </div>
                 ))}
                 <div className="pt-4 mt-4 border-t border-border flex justify-between items-center">
                    <span className="text-xs text-text-tertiary">Ticket Promedio</span>
                    <span className="text-sm font-mono text-text-primary">$42.500</span>
                 </div>
              </div>
           </Card>

           <Card className="bg-gradient-to-br from-accent-muted to-background-secondary border-accent/20">
              <div className="flex items-start justify-between">
                 <div>
                    <p className="text-xs font-bold text-accent uppercase tracking-widest">Meta Mensual</p>
                    <p className="text-2xl font-bold text-text-primary mt-1">72%</p>
                    <p className="text-[10px] text-accent/70 mt-1">Faltan $1.2M para el objetivo</p>
                 </div>
                 <div className="w-10 h-10 rounded-full border-2 border-accent border-r-transparent animate-spin-slow duration-700" />
              </div>
           </Card>
        </div>

        {/* Tabla Transacciones */}
        <div className="lg:col-span-2 space-y-4">
           <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Últimos cobros</h2>
              <Badge variant="info">Ultimos 15</Badge>
           </div>
           
           <Card className="p-0 overflow-hidden border-border bg-background-secondary/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-background-secondary/50">
                      <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Detalle</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest hidden sm:table-cell">Fecha/Hora</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-text-tertiary uppercase tracking-widest text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {citas.slice(0, 15).map((c: any) => (
                      <tr key={c.id} className="hover:bg-background-tertiary/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar initials={getInitials(c.client?.name || 'G')} className="w-8 h-8 opacity-70 group-hover:opacity-100 transition-opacity" />
                            <div>
                               <p className="text-sm font-medium text-text-primary">{c.client?.name || 'Cliente General'}</p>
                               <p className="text-xs text-text-tertiary">{c.service?.name || 'Servicio'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <p className="text-sm text-text-secondary">{formatDate(c.scheduled_at)}</p>
                          <p className="text-[10px] text-text-tertiary font-mono">{formatTime(c.scheduled_at)}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-bold text-success font-mono">+${Number(c.price_charged).toLocaleString()}</p>
                          <Badge variant="success">Efectivo</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
