import { getClients } from '@/app/actions/clients';
import { getAppointments } from '@/app/actions/appointments';
import Link from 'next/link';
import { ChevronLeft, Plus, Edit2, Calendar, Star } from 'lucide-react';
import { Card, Avatar, Button, Badge, StatCard } from '@/components/ui/RedesignComponents';

// Using dynamic route params Next.js 15+ Pattern
export default async function PerfilCliente({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  // Real apps would fetch specifically `getClientById`, but reusing `getClients` as mock:
  const clientes = await getClients();
  const cliente = clientes.find((c: any) => c.id === id);
  
  const allCitas = await getAppointments();
  const citasCliente = allCitas.filter((c: any) => c.client_id === id).sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  if (!cliente) return <div className="p-10 text-center text-text-secondary">Cliente no encontrado</div>;

  const totalGastado = citasCliente.reduce((acc: number, c: any) => acc + (Number(c.price_charged) || 0), 0);
  const getInitials = (n: string) => n ? n.substring(0, 2).toUpperCase() : "C";

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Header Back Navigation */}
      <Link href="/dashboard/clientes" className="inline-flex items-center gap-2 text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium">
        <ChevronLeft size={16} /> Volver a directorio
      </Link>

      {/* 2. Hero Profile */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-6">
          <Avatar initials={getInitials(cliente.name)} className="w-20 h-20 text-2xl" />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-text-primary">{cliente.name}</h1>
              {(cliente as any)?.vip && <Badge variant="info">VIP</Badge>}
            </div>
            <p className="text-sm text-text-secondary">{cliente.phone}</p>
            <p className="text-xs text-text-tertiary mt-2">Cliente desde Ene 2024 · 95% asistencia</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary"><Edit2 size={16} /> Editar</Button>
          <Button><Plus size={16} /> Nueva cita</Button>
        </div>
      </Card>

      {/* 3. Stats 4 cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <StatCard label="Total Visitas" value={citasCliente.length} />
         <StatCard label="Total Gastado" value={`$${totalGastado.toLocaleString()}`} />
         <StatCard label="Frecuencia Promedio" value="14 días" sub="Muy regular" color="success" />
         <StatCard label="Próx Visita Est" value="23 Abr" sub="En 5 días" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column (Preferencias) */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-4 flex items-center gap-2">
               <Star size={14} /> Preferencias
            </h3>
            
            <div className="space-y-4">
               <div>
                 <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Servicio Favorito</p>
                 <div className="inline-block bg-background-tertiary px-3 py-1.5 rounded-md text-xs font-medium text-text-primary border border-border">
                   Corte + Barba Premium
                 </div>
               </div>
               <div>
                 <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Barbero Favorito</p>
                 <div className="inline-block bg-background-tertiary px-3 py-1.5 rounded-md text-xs font-medium text-text-primary border border-border">
                   Andrés M.
                 </div>
               </div>
               <div>
                 <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mb-2">Notas del barbero</p>
                 <textarea 
                   className="w-full bg-background-tertiary border border-border rounded-lg p-3 text-sm text-text-primary focus:border-accent outline-none min-h-[100px] resize-none"
                   defaultValue={cliente.notas || "Sin notas adicionales. Click para editar..."}
                 />
               </div>
            </div>
          </Card>
        </div>

        {/* Right Column (Historial) */}
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
               <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border-strong before:to-transparent">
                  {citasCliente.map((cita: any, idx: number) => (
                     <div key={cita.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group border border-border rounded-xl p-4 bg-background-tertiary/50 hover:bg-background-tertiary transition-colors ml-6 md:ml-0 overflow-hidden">
                        
                        {/* Timeline Note / Dot */}
                        <div className="absolute left-0 w-1 h-full bg-border-strong group-hover:bg-accent transition-colors" />

                        <div className="flex-1 px-4">
                           <div className="flex justify-between md:flex-col lg:flex-row lg:justify-between items-start gap-1 mb-2">
                              <p className="text-sm font-bold text-text-primary">
                                {new Date(cita.scheduled_at).toLocaleDateString()} · {new Date(cita.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                              <Badge variant={cita.status === 'completed' ? 'success' : cita.status === 'confirmed' ? 'info' : 'warning'}>
                                 {cita.status}
                              </Badge>
                           </div>
                           <p className="text-sm text-text-secondary mb-1">
                              Servicio: {cita.service?.name || 'General'}
                           </p>
                           <p className="text-xs text-text-tertiary font-mono">
                              Billed: ${Number(cita.price_charged).toLocaleString()}
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
