import { TrendingUp } from 'lucide-react';

export const metadata = { title: 'Métricas | Trimly' };

export default function MetricasPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
        <TrendingUp size={28} className="text-accent" />
      </div>
      <h1 className="text-2xl font-black text-text-primary tracking-tight">Métricas</h1>
      <p className="text-text-secondary text-sm mt-3 max-w-sm leading-relaxed">
        Estadísticas avanzadas, alertas inteligentes y análisis de tendencias para tu barbería.
        Esta sección está en desarrollo.
      </p>
      <span className="mt-6 px-3 py-1 bg-accent/10 text-accent text-xs font-bold rounded-full uppercase tracking-wider">
        Próximamente
      </span>
    </div>
  );
}
