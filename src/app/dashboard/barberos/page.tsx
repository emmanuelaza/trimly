import { getBarbers } from '@/app/actions/barbers';
import BarberosClient from './BarberosClient';

export default async function BarberosPage() {
  const barberos = await getBarbers();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Gestión de Equipo</h1>
        <p className="text-sm text-text-tertiary mt-1">Administra a los barberos y personal de tu negocio.</p>
      </div>

      <BarberosClient initialBarberos={barberos} />
    </div>
  );
}
