"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ReportesClient({ stats, initialPeriod }: { stats: any, initialPeriod: Periodo }) {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>(initialPeriod);

  const handlePeriodChange = (p: Periodo) => {
    setPeriodo(p);
    router.push(`/dashboard/reportes?p=${p}`);
  };

  const isEmpty = !stats || stats.citas === 0;

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
              onClick={() => handlePeriodChange(p.id)}
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
        <StatCard label="Ingresos" value={`$${(stats?.ingresos || 0).toLocaleString()}`} trend={`${stats?.ingPrev > 0 ? (stats.ingresos >= stats.ingPrev ? '↑' : '↓') : ''} ${stats?.ingPrev > 0 ? Math.abs((stats.ingresos - stats.ingPrev) / stats.ingPrev * 100).toFixed(0) + '%' : ''}`} sub="vs mes anterior" />
        <StatCard label="Citas Mes" value={stats?.citas || 0} />
        <StatCard label="Tasa No-Show" value={`${(stats?.noShowRate || 0).toFixed(1)}%`} color={stats?.noShowRate > 15 ? 'danger' : 'success'} />
        <StatCard label="Nuevos Clientes" value={stats?.nuevos || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-text-primary">Clientes Nuevos por Semana</h2>
              <p className="text-xs text-text-tertiary mt-0.5">Crecimiento mensual</p>
            </div>
          </div>
          {isEmpty ? (
            <div className="h-64 flex flex-col items-center justify-center text-text-tertiary border border-dashed border-border rounded-xl">
              <p className="text-sm">Aún no hay datos de clientes registrados</p>
            </div>
          ) : (
             <div className="h-64 flex items-end gap-2 px-4">
                {stats.clientesSemanales.map((d: any) => (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-accent rounded-t-lg transition-all hover:opacity-80" style={{ height: `${(d.value / Math.max(...stats.clientesSemanales.map((w:any) => w.value))) * 180}px` }} />
                    <span className="text-[10px] text-text-tertiary uppercase">{d.label}</span>
                  </div>
                ))}
             </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-bold text-text-primary mb-5">Servicios Populares</h2>
          <div className="space-y-4">
            {stats?.servicios?.length > 0 ? stats.servicios.map((s: any) => (
              <div key={s.n} className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-text-primary">{s.n}</p>
                  <p className="text-[10px] text-text-tertiary">{s.c} citas</p>
                </div>
                <Badge variant="accent">${s.t.toLocaleString()}</Badge>
              </div>
            )) : (
              <p className="text-xs text-text-tertiary py-10 text-center">Sin servicios este mes</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-sm font-bold text-text-primary mb-5">Productividad por Barbero</h2>
          <div className="space-y-3">
            {stats?.barberos?.length > 0 ? stats.barberos.map((b: any) => (
              <div key={b.n} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center text-[10px] font-bold text-text-primary">
                  {b.n.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-text-primary">{b.n}</span>
                    <span className="text-text-tertiary">{b.c} citas</span>
                  </div>
                  <div className="w-full bg-background-tertiary h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent h-full" style={{ width: `${(b.c / stats.citas) * 100}%` }} />
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-xs text-text-tertiary py-5 text-center">No hay barbers registrados</p>
            )}
          </div>
        </Card>
      </div>
      
      <p className="text-xs text-text-tertiary text-center">Trimly Dashboard v1.0 · Actualizado en tiempo real</p>
    </div>
  );
}
