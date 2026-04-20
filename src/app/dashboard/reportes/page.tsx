"use client";

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { IngresosChart } from '@/components/reportes/IngresosChart';

// ─── Types ─────────────────────────────────────────────────
type Periodo = 'hoy' | 'semana' | 'mes' | 'todo';

const PERIODOS: { id: Periodo; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Esta semana' },
  { id: 'mes', label: 'Este mes' },
  { id: 'todo', label: 'Todo' },
];

// ─── Mock data per period ───────────────────────────────────
const DATA: Record<Periodo, {
  ingresos: string;
  ingTrend: string;
  citas: number;
  citasTrend: string;
  ticket: string;
  ticketTrend: string;
  ticketTrendColor: 'success' | 'danger';
  nuevos: number;
  nuevosTrend: string;
  servicios: { n: string; t: string; p: number }[];
  clientes: { n: string; v: number; t: string }[];
}> = {
  hoy: {
    ingresos: '$340.000', ingTrend: '↑ 12%',
    citas: 8, citasTrend: '↑ 1',
    ticket: '$42.500', ticketTrend: '↑ 5%', ticketTrendColor: 'success',
    nuevos: 2, nuevosTrend: '+2',
    servicios: [
      { n: 'Corte + Barba', t: '$165.000', p: 49 },
      { n: 'Solo Corte', t: '$105.000', p: 31 },
      { n: 'Afeitado', t: '$70.000', p: 20 },
    ],
    clientes: [
      { n: 'Andrés Moreno', v: 3, t: '$165.000' },
      { n: 'Carlos Ruiz', v: 2, t: '$110.000' },
      { n: 'Juan Ríos', v: 1, t: '$65.000' },
    ],
  },
  semana: {
    ingresos: '$1.84M', ingTrend: '↑ 8%',
    citas: 42, citasTrend: '↑ 5',
    ticket: '$43.800', ticketTrend: '↓ 2%', ticketTrendColor: 'danger',
    nuevos: 7, nuevosTrend: '+7',
    servicios: [
      { n: 'Corte + Barba', t: '$825.000', p: 45 },
      { n: 'Solo Corte', t: '$552.000', p: 30 },
      { n: 'Afeitado', t: '$276.000', p: 15 },
      { n: 'Keratina', t: '$184.000', p: 10 },
    ],
    clientes: [
      { n: 'Andrés Moreno', v: 4, t: '$220.000' },
      { n: 'Carlos Lozano', v: 3, t: '$165.000' },
      { n: 'Juan Ríos', v: 3, t: '$135.000' },
      { n: 'Luis Páez', v: 2, t: '$90.000' },
    ],
  },
  mes: {
    ingresos: '$12.4M', ingTrend: '↑ 18%',
    citas: 342, citasTrend: '↑ 5%',
    ticket: '$36.250', ticketTrend: '↓ 2%', ticketTrendColor: 'danger',
    nuevos: 48, nuevosTrend: '↑ 12%',
    servicios: [
      { n: 'Corte + Barba', t: '$4.2M', p: 45 },
      { n: 'Solo Corte', t: '$3.1M', p: 30 },
      { n: 'Keratina', t: '$1.5M', p: 15 },
      { n: 'Ritual Barba', t: '$800k', p: 10 },
    ],
    clientes: [
      { n: 'Carlos Mendoza', v: 24, t: '$840.000' },
      { n: 'Alejandro Ruiz', v: 18, t: '$720.000' },
      { n: 'Juan Pérez', v: 15, t: '$560.000' },
      { n: 'David Gómez', v: 12, t: '$480.000' },
    ],
  },
  todo: {
    ingresos: '$148M', ingTrend: '↑ 24%',
    citas: 4102, citasTrend: '↑ 20%',
    ticket: '$36.080', ticketTrend: '↑ 3%', ticketTrendColor: 'success',
    nuevos: 573, nuevosTrend: '↑ 18%',
    servicios: [
      { n: 'Corte + Barba', t: '$50.3M', p: 44 },
      { n: 'Solo Corte', t: '$37.2M', p: 32 },
      { n: 'Keratina', t: '$18M', p: 15 },
      { n: 'Ritual Barba', t: '$10.4M', p: 9 },
    ],
    clientes: [
      { n: 'Carlos Mendoza', v: 288, t: '$10.1M' },
      { n: 'Alejandro Ruiz', v: 216, t: '$8.6M' },
      { n: 'Juan Pérez', v: 180, t: '$6.7M' },
      { n: 'David Gómez', v: 144, t: '$5.8M' },
    ],
  },
};

// ─── Main Page ─────────────────────────────────────────────
export default function ReportesPage() {
  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const d = DATA[periodo];

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto pb-8">

      {/* Header & Período Selector */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Reportes</h1>
          <p className="text-sm text-text-tertiary mt-1">Métricas y rendimiento de tu negocio.</p>
        </div>

        {/* Period toggle */}
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

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 page-fade" key={periodo}>
        <StatCard label="Ingresos" value={d.ingresos} trend={d.ingTrend} sub="vs período anterior" />
        <StatCard label="Citas Completadas" value={d.citas} trend={d.citasTrend} />
        <StatCard label="Ticket Promedio" value={d.ticket} trend={d.ticketTrend} trendColor={d.ticketTrendColor} />
        <StatCard label="Nuevos Clientes" value={d.nuevos} trend={d.nuevosTrend} />
      </div>

      {/* Gráfico Principal */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-text-primary">Evolución de Ingresos</h2>
            <p className="text-xs text-text-tertiary mt-0.5">Tendencia del período seleccionado</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <div className="w-3 h-3 rounded-full bg-accent" />
              Ingresos COP
            </div>
          </div>
        </div>
        <IngresosChart />
      </Card>

      {/* Rankings */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Top Servicios */}
        <Card className="p-6">
          <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-6">Servicios más rentables</h3>
          <div className="space-y-5">
            {d.servicios.map((s, i) => (
              <div key={s.n}>
                <div className="flex justify-between text-sm mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-text-tertiary w-3">{i + 1}</span>
                    <span className="font-medium text-text-primary">{s.n}</span>
                  </div>
                  <span className="font-mono text-text-secondary text-xs">{s.t}</span>
                </div>
                <div className="relative w-full bg-background-tertiary h-1.5 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 top-0 h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${s.p}%` }}
                  />
                </div>
                <p className="text-[10px] text-text-tertiary mt-1 text-right font-mono">{s.p}%</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Mejores Clientes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Mejores Clientes</h3>
            <Badge variant="success">Fidelización</Badge>
          </div>
          <div className="space-y-4">
            {d.clientes.map((c, i) => (
              <div key={c.n} className="flex items-center gap-3">
                <span className="text-text-tertiary font-mono text-xs w-4 flex-shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{c.n}</p>
                  <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{c.v} visitas</p>
                </div>
                <p className="font-mono text-sm text-accent flex-shrink-0">{c.t}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
