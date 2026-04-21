"use client";

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { IngresosChart } from '@/components/reportes/IngresosChart';

type Periodo = 'hoy' | 'semana' | 'mes' | 'todo';

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'todo', label: 'Todo' },
];

export default function ReportesClient({ stats }: { stats: any }) {
  const [periodo, setPeriodo] = useState<Periodo>('mes');

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Reportes</h1>
          <p className="text-sm text-text-tertiary mt-1">Métricas y rendimiento de tu negocio.</p>
        </div>

        <div className="inline-flex bg-background-secondary border border-border p-1 rounded-xl gap-0.5">
          {PERIODOS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodo(p.id)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                periodo === p.id
                  ? 'bg-accent text-background-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 page-fade">
        <StatCard label="Ingresos" value={`$${stats.ingresos.toLocaleString()}`} trend={`${stats.ingPrev > 0 ? (stats.ingresos >= stats.ingPrev ? '↑' : '↓') : ''} ${stats.ingPrev > 0 ? Math.abs((stats.ingresos - stats.ingPrev) / stats.ingPrev * 100).toFixed(0) + '%' : ''}`} sub="vs mes anterior" />
        <StatCard label="Citas Mes" value={stats.citas} />
        <StatCard label="Ticket Promedio" value={`$${Math.round(stats.ticket).toLocaleString()}`} />
        <StatCard label="Nuevos Clientes" value={stats.nuevos} />
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Evolución de Ingresos</h2>
            <p className="text-xs text-text-tertiary mt-0.5">Tendencia visual</p>
          </div>
        </div>
        <IngresosChart />
      </Card>
      
      <p className="text-xs text-text-tertiary text-center">Mas métricas detalladas se habilitarán a medida que se registren mas transacciones en el historial.</p>
    </div>
  );
}
