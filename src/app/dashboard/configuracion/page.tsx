import React from 'react';
import ConfigTabs from './ConfigTabs';
import { getBarbershop } from '@/app/actions/barbershops';
import { getServices } from '@/app/actions/services';
import { getBarbers } from '@/app/actions/barbers';

export default async function ConfiguracionPage() {
  const [barbershop, services, barbers] = await Promise.all([
    getBarbershop(),
    getServices(),
    getBarbers()
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Configuración</h1>
        <p className="text-sm text-text-tertiary mt-1">Personaliza tu perfil, negocio y preferencias.</p>
      </div>

      <ConfigTabs data={{ barbershop, services, barbers }} />
    </div>
  );
}
