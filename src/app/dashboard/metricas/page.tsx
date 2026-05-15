import { getMetricasData } from '@/app/actions/metricas'
import { TrendingUp, Users, Star, BarChart3, Clock, Target, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { MetricasGate } from './MetricasGate'

export const metadata = { title: 'Métricas | Trimly' }
export const dynamic = 'force-dynamic'

const MIN_DIAS = 14

function formatCOP(n: number) {
  return `$${n.toLocaleString('es-CO')}`
}

function Delta({ actual, anterior }: { actual: number; anterior: number }) {
  if (anterior === 0) return <span className="text-xs text-text-muted">—</span>
  const pct = Math.round(((actual - anterior) / anterior) * 100)
  if (pct > 0)
    return <span className="flex items-center gap-0.5 text-xs text-success font-semibold"><ArrowUp size={11} />+{pct}%</span>
  if (pct < 0)
    return <span className="flex items-center gap-0.5 text-xs text-danger font-semibold"><ArrowDown size={11} />{pct}%</span>
  return <span className="flex items-center gap-0.5 text-xs text-text-muted"><Minus size={11} />0%</span>
}

export default async function MetricasPage() {
  const data = await getMetricasData()

  if (!data) return null

  if (data.diasDeData < MIN_DIAS) {
    const pct = Math.min(100, Math.round((data.diasDeData / MIN_DIAS) * 100))
    return (
      <MetricasGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">Métricas</h1>
          <p className="text-sm text-text-muted mt-0.5">Estadísticas avanzadas de tu negocio</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <TrendingUp size={28} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Entiende tu negocio con datos reales</h2>
          <p className="text-sm text-text-secondary mt-3 leading-relaxed">
            Aquí verás qué días son más rentables, qué clientes son más leales y cuánto vas a ganar este mes.
            Necesitas al menos <strong>{MIN_DIAS} días</strong> de actividad para ver las métricas completas.
          </p>
          <div className="w-full mt-8 space-y-2">
            <div className="flex justify-between text-xs text-text-muted mb-1">
              <span>Progreso</span>
              <span>{data.diasDeData} de {MIN_DIAS} días de datos</span>
            </div>
            <div className="w-full h-3 bg-background-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-text-muted text-right">{pct}% completado</p>
          </div>
          <Link
            href="/dashboard/agenda"
            className="mt-6 text-sm text-primary font-semibold hover:underline"
          >
            Ir a la agenda para registrar citas →
          </Link>
        </div>
      </div>
      </MetricasGate>
    )
  }

  const maxHora = data.citasPorHora.length > 0 ? Math.max(...data.citasPorHora.map((h) => h.count)) : 1
  const maxDia = data.ingresosPorDia.length > 0 ? Math.max(...data.ingresosPorDia.map((d) => d.ingresos)) : 1

  return (
    <MetricasGate>
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary tracking-tight">Métricas</h1>
        <p className="text-sm text-text-muted mt-0.5">Estadísticas avanzadas de tu negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: TrendingUp,
            label: 'Ingresos este mes',
            value: formatCOP(data.ingresosMes),
            extra: <Delta actual={data.ingresosMes} anterior={data.ingresosMesAnterior} />,
          },
          {
            icon: Target,
            label: 'Ticket promedio',
            value: formatCOP(data.ticketPromedio),
            extra: null,
          },
          {
            icon: BarChart3,
            label: 'Tasa completación',
            value: `${data.tasaCompletacion}%`,
            extra: null,
          },
          {
            icon: Users,
            label: 'Clientes recurrentes',
            value: data.clientesRecurrentes.toString(),
            extra: <span className="text-xs text-text-muted">últimos 30 días</span>,
          },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-background-secondary border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <kpi.icon size={15} className="text-primary" />
              <p className="text-xs text-text-muted font-medium">{kpi.label}</p>
            </div>
            <p className="text-xl font-black text-text-primary">{kpi.value}</p>
            {kpi.extra && <div className="mt-1">{kpi.extra}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top servicios */}
        <div className="bg-background-secondary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Star size={15} className="text-warning" />
            <h3 className="text-sm font-bold text-text-primary">Servicios más populares</h3>
          </div>
          {data.topServicios.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {data.topServicios.map((s, i) => (
                <div key={s.nombre} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-text-muted w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-text-primary truncate">{s.nombre}</span>
                      <span className="text-xs text-text-muted ml-2 flex-shrink-0">{s.count} citas</span>
                    </div>
                    <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(s.count / data.topServicios[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-text-primary w-20 text-right flex-shrink-0">
                    {formatCOP(s.ingresos)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top clientes */}
        <div className="bg-background-secondary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users size={15} className="text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Clientes más fieles</h3>
          </div>
          {data.topClientes.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {data.topClientes.map((c, i) => (
                <div key={c.nombre + i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {c.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-text-primary">{c.nombre}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-text-primary">{c.visitas} visitas</p>
                    <p className="text-xs text-text-muted">{formatCOP(c.gasto)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Horas pico */}
        <div className="bg-background-secondary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={15} className="text-primary" />
            <h3 className="text-sm font-bold text-text-primary">Horas pico</h3>
          </div>
          {data.citasPorHora.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">Sin datos aún</p>
          ) : (
            <div className="flex items-end gap-1 h-24">
              {data.citasPorHora.map((h) => (
                <div key={h.hora} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-primary/20 rounded-t group-hover:bg-primary/40 transition-colors relative"
                    style={{ height: `${Math.max(8, (h.count / maxHora) * 80)}px` }}
                    title={`${h.hora} — ${h.count} citas`}
                  />
                  <span className="text-[9px] text-text-muted">{h.hora.split(':')[0]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ingresos últimos 14 días */}
        <div className="bg-background-secondary border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={15} className="text-success" />
            <h3 className="text-sm font-bold text-text-primary">Ingresos — últimos 14 días</h3>
          </div>
          {data.ingresosPorDia.length === 0 ? (
            <p className="text-xs text-text-muted py-4 text-center">Sin datos aún</p>
          ) : (
            <div className="flex items-end gap-1 h-24">
              {data.ingresosPorDia.map((d) => (
                <div key={d.dia} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-success/20 rounded-t group-hover:bg-success/40 transition-colors"
                    style={{ height: `${Math.max(4, (d.ingresos / maxDia) * 80)}px` }}
                    title={`${d.dia} — ${formatCOP(d.ingresos)}`}
                  />
                  <span className="text-[9px] text-text-muted truncate max-w-full">{d.dia}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total citas completadas', value: data.totalCitasHistorico.toString() },
          { label: 'Clientes nuevos este mes', value: data.clientesNuevosMes.toString() },
          { label: 'vs mes anterior', value: data.ingresosMesAnterior > 0 ? formatCOP(data.ingresosMesAnterior) : '—' },
          { label: 'Días de data registrada', value: `${data.diasDeData} días` },
        ].map((s) => (
          <div key={s.label} className="bg-background-tertiary rounded-xl p-4 text-center">
            <p className="text-lg font-black text-text-primary">{s.value}</p>
            <p className="text-[11px] text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
    </MetricasGate>
  )
}
