import { getBarberos, createBarbero, deleteBarbero } from '@/app/actions/barberos';
import { Plus, Trash2, UserCheck } from 'lucide-react';
import { Card, Input, Button, Avatar, Badge } from '@/components/ui/RedesignComponents';

export default async function BarberosPage() {
  const barberos = await getBarberos();

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Gestión de Equipo</h1>
        <p className="text-sm text-text-tertiary mt-1">Administra a los barberos y personal de tu negocio.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Formulario de registro */}
        <div className="lg:col-span-2">
          <Card className="bg-background-secondary/30 border-dashed sticky top-8">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
              <Plus size={16} /> Registrar nuevo barbero
            </h2>
            <form action={createBarbero} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre Completo</label>
                <Input name="nombre" placeholder="Ej. Marlon Brando" required />
              </div>
              <Button type="submit" className="w-full">
                <Plus size={18} /> Añadir al Equipo
              </Button>
            </form>
          </Card>
        </div>

        {/* Lista de Barberos */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Personal Activo</h2>
            <Badge variant="success">{barberos.length} Miembros</Badge>
          </div>

          <div className="space-y-3">
            {barberos.length === 0 && (
              <div className="py-20 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
                 <UserCheck size={32} className="text-text-tertiary mb-3 opacity-20" />
                 <p className="text-sm text-text-secondary">No hay miembros registrados aún.</p>
              </div>
            )}
            {barberos.map((b: any) => (
              <Card key={b.id} className="group hover:border-border-strong transition-all overflow-hidden relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar initials={getInitials(b.nombre)} className="w-12 h-12 bg-accent-muted text-accent" />
                    <div>
                      <p className="text-base font-semibold text-text-primary">{b.nombre}</p>
                      <p className="text-xs text-text-tertiary">Barbero Profesional · Activo</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <form action={async () => { "use server"; await deleteBarbero(b.id); }}>
                      <button type="submit" className="p-2 text-text-tertiary hover:text-danger hover:bg-danger-bg rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </form>
                  </div>
                </div>
                
                {/* Micro-stats / Decoration */}
                <div className="mt-4 pt-4 border-t border-border flex items-center gap-6">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-tighter">Productividad</span>
                      <span className="text-sm font-mono text-text-secondary">92%</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] text-text-tertiary uppercase font-bold tracking-tighter">Turnos Hoy</span>
                      <span className="text-sm font-mono text-text-secondary">8 citas</span>
                   </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
