import { getBarbers } from '@/app/actions/barbers';
import { getServices } from '@/app/actions/services';
import BarberosClient from './BarberosClient';

export default async function BarberosPage() {
  const [barberos, servicios] = await Promise.all([
    getBarbers(),
    getServices()
  ]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Gestión de Equipo</h1>
        <p className="text-sm text-text-tertiary mt-1">Administra a los barberos, sus esquemas de pago e invitaciones.</p>
      </div>

      <BarberosClient initialBarberos={barberos} services={servicios} />
    </div>
  );
}
