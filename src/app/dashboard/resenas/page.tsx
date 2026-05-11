import { EmptyState } from '@/components/ui/EmptyState';

export const metadata = { title: 'Reseñas | Trimly' };

export default function ResenasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">Reseñas</h1>
        <p className="text-sm text-text-muted mt-0.5">Opiniones de tus clientes</p>
      </div>

      <div className="bg-background-secondary border border-border rounded-xl">
        <EmptyState
          icon="⭐"
          title="Todavía no tienes reseñas"
          description="Pídele a tus clientes que dejen su opinión después de cada visita. Aparecerán aquí automáticamente."
          action={{ label: 'Configurar automatizaciones', href: '/dashboard/automatizaciones' }}
        />
      </div>
    </div>
  );
}
