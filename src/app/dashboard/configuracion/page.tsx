import { createClient } from '@/lib/supabase/server';
import { updateConfiguracion } from '@/app/actions/configuracion';
import { Save, Building2, Clock, Bell, User2, ChevronRight, Laptop } from 'lucide-react';
import Link from 'next/link';
import { Card, Input, Button, Badge, Avatar } from '@/components/ui/RedesignComponents';

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const negocio = user?.user_metadata?.negocio || "Barbería";
  const horario = user?.user_metadata?.horario || "09:00 - 18:00";
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Configuración</h1>
        <p className="text-sm text-text-tertiary mt-1">Personaliza tu perfil, negocio y preferencias de la aplicación.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Navegación Lateral (Falsa por ahora visualmente) */}
        <div className="lg:col-span-1 space-y-1">
           {[
             { label: 'Perfil General', icon: User2, active: true },
             { label: 'Notificaciones', icon: Bell, active: false },
             { label: 'Apariencia', icon: Laptop, active: false }
           ].map((item) => (
             <button key={item.label} className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${item.active ? 'bg-background-secondary border border-border text-text-primary shadow-sm' : 'text-text-tertiary hover:text-text-secondary hover:bg-background-secondary/50'}`}>
                <div className="flex items-center gap-3">
                   <item.icon size={18} />
                   <span className="text-sm font-medium">{item.label}</span>
                </div>
                {item.active && <div className="w-1 h-4 bg-accent rounded-full" />}
             </button>
           ))}
        </div>

        {/* Formularios */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Datos del Negocio */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 px-1">
               <Building2 size={16} className="text-accent" />
               <h2 className="text-sm font-bold text-text-primary uppercase tracking-widest">Datos del Negocio</h2>
            </div>
            
            <Card>
              <form action={updateConfiguracion} className="space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-border">
                   <Avatar initials={getInitials(negocio)} className="w-16 h-16 text-xl rounded-2xl" />
                   <div>
                      <Button variant="secondary" className="h-8 text-[11px] px-3">Cambiar Logo</Button>
                      <p className="text-[10px] text-text-tertiary mt-2">Recomendado: 400x400px, PNG o JPG</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre Comercial</label>
                    <Input id="negocio" name="negocio" defaultValue={negocio} required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Horario Central</label>
                    <Input id="horario" name="horario" defaultValue={horario} placeholder="Ej: 9am - 8pm" required />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                   <Button type="submit" className="px-8 shadow-lg shadow-accent/10">
                     <Save size={18} /> Guardar Cambios
                   </Button>
                </div>
              </form>
            </Card>
          </section>

          {/* Accesos Rápidos */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest px-1">Administración de Recursos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/dashboard/servicios" className="group">
                <Card className="hover:border-border-strong transition-all flex items-center justify-between p-4 group-hover:bg-background-secondary/50">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-background-tertiary rounded-lg text-text-secondary group-hover:text-accent group-hover:bg-accent-muted transition-all">
                        <Laptop size={18} />
                     </div>
                     <span className="text-sm font-semibold text-text-primary">Servicios y Precios</span>
                  </div>
                  <ChevronRight size={16} className="text-text-tertiary group-hover:text-text-secondary transition-all group-hover:translate-x-1" />
                </Card>
              </Link>
              <Link href="/dashboard/barberos" className="group">
                <Card className="hover:border-border-strong transition-all flex items-center justify-between p-4 group-hover:bg-background-secondary/50">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-background-tertiary rounded-lg text-text-secondary group-hover:text-accent group-hover:bg-accent-muted transition-all">
                        <User2 size={18} />
                     </div>
                     <span className="text-sm font-semibold text-text-primary">Equipo de Barberos</span>
                  </div>
                  <ChevronRight size={16} className="text-text-tertiary group-hover:text-text-secondary transition-all group-hover:translate-x-1" />
                </Card>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
