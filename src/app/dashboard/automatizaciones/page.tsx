import React from 'react';
import AutomatizacionesClient from './AutomatizacionesClient';
import { getAutomations, getAutomationStats } from '@/app/actions/barbershops';

export default async function AutomatizacionesPage() {
  const [automations, stats] = await Promise.all([
    getAutomations(),
    getAutomationStats()
  ]);

  if (!stats) {
    return <div>Cargando estadísticas...</div>;
  }

  return (
    <AutomatizacionesClient 
      initialAutomations={automations} 
      stats={stats} 
    />
  );
}
