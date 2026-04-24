import { getServices } from '@/app/actions/services';
import ServiciosClient from './ServiciosClient';

export default async function ServiciosPage() {
  const servicios = await getServices();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Catálogo de Servicios</h1>
        <p className="text-sm text-text-tertiary mt-1">Define los servicios y precios que ofreces a tus clientes.</p>
      </div>

      <ServiciosClient initialServices={servicios} />
    </div>
  );
}
