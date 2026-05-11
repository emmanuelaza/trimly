import { EmptyState } from '@/components/ui/EmptyState';

export const metadata = { title: 'Cupones | Trimly' };

export default function CuponesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">Cupones</h1>
        <p className="text-sm text-text-muted mt-0.5">Descuentos y promociones para tus clientes</p>
      </div>

      <div className="bg-background-secondary border border-border rounded-xl">
        <EmptyState
          icon="🏷️"
          title="Sin cupones activos"
          description="Crea descuentos para atraer más clientes o premiar a los frecuentes."
          action={{ label: 'Crear primer cupón', href: '/dashboard/cupones/nuevo' }}
        />
      </div>
    </div>
  );
}
