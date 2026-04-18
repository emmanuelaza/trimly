import { Card, StatCard, Badge } from '@/components/ui/RedesignComponents';
import { IngresosChart } from '@/components/reportes/IngresosChart';

export const revalidate = 60;

export default async function ReportesPage() {
  // En un caso real: obtener data filtrada desde Supabase
  return (
    <div className="space-y-10 max-w-[1200px] mx-auto pb-8">
      
      {/* Header & Período Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Reportes</h1>
          <p className="text-sm text-text-tertiary mt-1">Métricas y rendimiento de tu negocio.</p>
        </div>
        
        <div className="inline-flex bg-background-secondary p-1 rounded-lg border border-border">
          {['Hoy', 'Semana', 'Mes', 'Todos'].map((p, i) => (
             <button key={p} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${i === 2 ? 'bg-background-tertiary text-text-primary' : 'text-text-tertiary hover:text-text-primary'}`}>
               {p}
             </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Ingresos" value="$12.4M" trend="↑ 18%" sub="vs mes anterior" />
        <StatCard label="Citas Completadas" value="342" trend="↑ 5%" />
        <StatCard label="Ticket Promedio" value="$36,250" trend="↓ 2%" trendColor="danger" />
        <StatCard label="Nuevos Clientes" value="48" trend="↑ 12%" />
      </div>

      {/* Gráfico Principal */}
      <Card className="p-6">
         <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold text-text-primary">Evolución de Ingresos</h2>
            <div className="flex gap-4 items-center">
               <div className="flex items-center gap-2 text-xs text-text-secondary">
                 <div className="w-3 h-3 rounded-full bg-accent" /> COP Actual
               </div>
            </div>
         </div>
         <IngresosChart />
      </Card>

      {/* Rankings Section */}
      <div className="grid md:grid-cols-2 gap-6">
         
         {/* Top Servicios */}
         <Card className="p-6">
           <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-6">Servicios más rentables</h3>
           <div className="space-y-6">
             {[
               { n: 'Corte + Barba', t: '$4.2M', p: 45 },
               { n: 'Solo Corte', t: '$3.1M', p: 30 },
               { n: 'Keratina', t: '$1.5M', p: 15 },
               { n: 'Ritual Barba', t: '$800k', p: 10 }
             ].map(s => (
                <div key={s.n}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-text-primary">{s.n}</span>
                    <span className="font-mono text-text-secondary">{s.t}</span>
                  </div>
                  <div className="w-full bg-background-tertiary h-2 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: `${s.p}%` }} />
                  </div>
                </div>
             ))}
           </div>
         </Card>

         {/* Mejores Clientes */}
         <Card className="p-6">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Mejores Clientes</h3>
             <Badge variant="success">Fidelización</Badge>
           </div>
           
           <div className="space-y-5">
             {[
               { n: 'Carlos Mendoza', v: 24, t: '$840k' },
               { n: 'Alejandro Ruiz', v: 18, t: '$720k' },
               { n: 'Juan Pérez', v: 15, t: '$560k' },
               { n: 'David Gómez', v: 12, t: '$480k' },
             ].map((c, i) => (
                <div key={c.n} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <span className="text-text-tertiary font-mono text-xs w-4">{i + 1}.</span>
                      <div>
                         <p className="text-sm font-medium text-text-primary">{c.n}</p>
                         <p className="text-[10px] text-text-tertiary uppercase">{c.v} visitas</p>
                      </div>
                   </div>
                   <p className="font-mono text-sm text-accent">{c.t}</p>
                </div>
             ))}
           </div>
         </Card>

      </div>
    </div>
  );
}
