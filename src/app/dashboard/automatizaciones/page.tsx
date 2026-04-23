import React from 'react';
import AutomatizacionesClient from './AutomatizacionesClient';
import { getAutomations, getAutomationStats } from '@/app/actions/barbershops';

export default async function AutomatizacionesPage() {
  const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), ms));

  try {
    const [automations, stats] = await Promise.race([
      Promise.all([
        getAutomations(),
        getAutomationStats()
      ]),
      timeout(5000)
    ]) as [any[], any];

    if (!stats) {
      return (
        <div className="p-10 text-center bg-background-secondary/50 rounded-xl border border-border-strong">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Aún no hay estadísticas</h2>
          <p className="text-text-tertiary">Las automatizaciones comenzarán a generar datos pronto.</p>
          <AutomatizacionesClient initialAutomations={automations || []} stats={{ recordadas: 0, recuperados: 0, evitados: 0 }} />
        </div>
      );
    }

    return (
      <AutomatizacionesClient 
        initialAutomations={automations} 
        stats={stats} 
      />
    );
  } catch (error) {
    console.error("Error/Timeout in AutomatizacionesPage:", error);
    return (
      <div className="p-10 text-center bg-error/5 rounded-xl border border-error/20">
        <h2 className="text-xl font-semibold text-error mb-2">Error al cargar datos</h2>
        <p className="text-text-tertiary">No pudimos obtener las estadísticas en este momento. Por favor, intenta de nuevo.</p>
        <div className="mt-6">
          <a href="/dashboard/automatizaciones" className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-medium">Reintentar</a>
        </div>
      </div>
    );
  }
}
