import { getClientes } from '@/app/actions/clientes';
import { MessageCircle, Mail, AlertCircle, Phone, ArrowRight } from 'lucide-react';
import { Card, Badge, Avatar, Button } from '@/components/ui/RedesignComponents';

export default async function RetencionPage() {
  const clientes = await getClientes();

  const parseDays = (dateStr?: string | null) => {
    if (!dateStr) return 0;
    return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
  };

  const getWpUrl = (c: any) => {
    const message = `Hola ${c.nombre}, hace tiempo no nos visitas en Trimly. ¡Te echamos de menos! 💈 Te esperamos para tu próximo servicio. ¿Te agendamos un espacio?`;
    return c.telefono ? `https://wa.me/${c.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(message)}` : '#';
  };

  const c15 = clientes.filter((c: any) => {
    const d = parseDays(c.ultima_visita);
    return d >= 15 && d < 30;
  });

  const c30 = clientes.filter((c: any) => {
    const d = parseDays(c.ultima_visita);
    return d >= 30 && d < 60;
  });

  const c60 = clientes.filter((c: any) => {
    const d = parseDays(c.ultima_visita);
    return d >= 60;
  });

  const renderSection = (list: any[], title: string, subtitle: string, variant: "info" | "warning" | "danger") => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div>
           <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest">{title}</h3>
           <p className="text-[11px] text-text-tertiary mt-0.5">{subtitle}</p>
        </div>
        <Badge variant={variant}>{list.length}</Badge>
      </div>
      
      <div className="space-y-3">
        {list.length === 0 && (
          <div className="py-10 border border-dashed border-border rounded-xl flex items-center justify-center">
            <p className="text-xs text-text-tertiary">No hay clientes aquí</p>
          </div>
        )}
        {list.map((c: any) => {
          const days = parseDays(c.ultima_visita);
          return (
            <Card key={c.id} className={`p-4 hover:border-border-strong transition-all group ${variant === 'danger' ? 'border-l-4 border-l-danger' : variant === 'warning' ? 'border-l-4 border-l-warning' : 'border-l-4 border-l-info'}`}>
              <div className="flex items-start justify-between">
                 <div className="flex items-center gap-3">
                    <Avatar initials={c.nombre.substring(0, 2).toUpperCase()} className="w-8 h-8 opacity-80" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{c.nombre}</p>
                      <p className="text-xs text-text-tertiary mt-0.5">Visto hace {days} días</p>
                    </div>
                 </div>
                 <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a 
                      href={getWpUrl(c)} 
                      target="_blank" 
                      className="p-1.5 bg-success-bg text-success rounded-lg border border-success/20 hover:bg-success hover:text-background-primary transition-colors"
                    >
                      <MessageCircle size={14} />
                    </a>
                 </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                 <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-border-strong" />
                    <div className="w-1.5 h-1.5 rounded-full bg-border-strong" />
                    <div className={`w-1.5 h-1.5 rounded-full ${variant === 'danger' ? 'bg-danger animate-pulse' : 'bg-border-strong'}`} />
                 </div>
                 <button className="text-[10px] font-bold text-text-tertiary hover:text-text-primary uppercase flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver perfil <ArrowRight size={10} />
                 </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Estrategia de Retención</h1>
          <p className="text-sm text-text-tertiary mt-1">Recupera a tus clientes antes de que se olviden de ti.</p>
        </div>
      </div>

      {/* Grid de Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
        {renderSection(c15, "Toca Corte", "15 - 30 días ausente", "info")}
        {renderSection(c30, "Cuidado", "30 - 60 días ausente", "warning")}
        {renderSection(c60, "Riesgo Crítico", "60+ días sin visita", "danger")}
      </div>
      
      {/* Footer Info */}
      <Card className="bg-accent-muted border border-accent/20 max-w-2xl mx-auto flex items-center gap-4 text-accent">
         <AlertCircle size={24} className="flex-shrink-0" />
         <div>
            <p className="text-xs font-bold uppercase tracking-widest">Consejo de experto</p>
            <p className="text-sm font-medium mt-1">Los clientes con mas de 60 días de inactividad tienen un 85% de probabilidad de no volver. ¡Es ahora o nunca!</p>
         </div>
      </Card>
    </div>
  );
}
