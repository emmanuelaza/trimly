import React from 'react';
import AutomatizacionesClient from './AutomatizacionesClient';
import { getAutomations, getAutomationStats } from '@/app/actions/barbershops';

export default async function AutomatizacionesPage() {
  const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

  try {
    const [automations, stats] = await Promise.race([
      Promise.all([getAutomations(), getAutomationStats()]),
      timeout(5000)
    ]) as [any[], any];

    return (
      <AutomatizacionesClient
        initialAutomations={automations || []}
        stats={stats || { totalEnviados: 0, recordadas: 0, confirmaciones: 0, postVisita: 0, cumpleanos: 0, reportes: 0, recuperados: 0, porTipo: {} }}
      />
    );
  } catch (error) {
    console.error("Error/Timeout in AutomatizacionesPage:", error);
    return (
      <div className="p-10 text-center bg-error/5 rounded-xl border border-error/20">
        <h2 className="text-xl font-semibold text-error mb-2">Error al cargar datos</h2>
        <p className="text-text-tertiary">No pudimos obtener las estadísticas. Por favor, intenta de nuevo.</p>
        <div className="mt-6">
          <a href="/dashboard/automatizaciones" className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium">Reintentar</a>
        </div>
      </div>
    );
  }
}
