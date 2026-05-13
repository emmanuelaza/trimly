'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard, Users, Star, Plus, ExternalLink,
  MoreVertical, CheckCircle2, XCircle, RotateCcw,
  Scissors, Gift, TrendingUp, Clock,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'
import { ScannerQR } from '@/components/pases/ScannerQR'
import { CrearPlanModal } from '@/components/pases/CrearPlanModal'
import { ActivarPaseModal } from '@/components/pases/ActivarPaseModal'
import {
  togglePlanActive, renovarPase, cancelarPase, registrarUso,
  canjearPuntos, type Plan, type ClientSub, type PaseStats,
} from '@/app/actions/pases'
import toast from 'react-hot-toast'

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

type Tab = 'planes' | 'clientes' | 'puntos'

interface Props {
  planes: Plan[]
  suscripciones: ClientSub[]
  stats: PaseStats
  puntos: { id: string; client_id: string; points: number; total_earned: number; total_redeemed: number; clients: { name: string; phone: string | null } | null }[]
  servicios: { id: string; name: string; price: number }[]
  clientes: { id: string; name: string; phone: string | null }[]
}

export default function PasesClient({ planes, suscripciones, stats, puntos, servicios, clientes }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [tab, setTab] = useState<Tab>('planes')
  const [subFilter, setSubFilter] = useState<'all' | 'active' | 'expired'>('active')
  const [planModal, setPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [activarModal, setActivarModal] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const filteredSubs = suscripciones.filter(s => {
    if (subFilter === 'active') return s.status === 'active'
    if (subFilter === 'expired') return s.status !== 'active'
    return true
  })

  const handleTogglePlan = (id: string, current: boolean) => {
    startTransition(async () => {
      const r = await togglePlanActive(id, !current)
      if (r.error) toast.error(r.error)
      else { toast.success(!current ? 'Plan activado' : 'Plan desactivado'); router.refresh() }
    })
  }

  const handleRenovar = (id: string) => {
    startTransition(async () => {
      const r = await renovarPase(id)
      if (r.error) toast.error(r.error)
      else { toast.success('Pase renovado'); router.refresh() }
    })
  }

  const handleCancelar = (id: string) => {
    startTransition(async () => {
      const r = await cancelarPase(id)
      if (r.error) toast.error(r.error)
      else { toast.success('Pase cancelado'); router.refresh() }
    })
  }

  const handleRegistrarUso = (id: string) => {
    startTransition(async () => {
      const r = await registrarUso(id)
      if (r.error) toast.error(r.error)
      else { toast.success(`Uso registrado (${r.usedCount} total)`); router.refresh() }
    })
  }

  const handleCanjear = (clientId: string, pts: number) => {
    if (pts < 1) return
    startTransition(async () => {
      const r = await canjearPuntos(clientId, pts)
      if (r.error) toast.error(r.error)
      else { toast.success(`${pts} puntos canjeados`); router.refresh() }
    })
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'planes', label: 'Mis planes', icon: CreditCard },
    { id: 'clientes', label: 'Clientes con pase', icon: Users },
    { id: 'puntos', label: 'Puntos', icon: Star },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pases"
        description="Suscripciones y carnets digitales"
        badge={stats.pasesActivos > 0 ? `${stats.pasesActivos} activos` : undefined}
        action={
          <button
            onClick={() => setActivarModal(true)}
            className="h-9 px-4 rounded-xl bg-accent text-background-primary text-xs font-bold flex items-center gap-1.5 hover:bg-accent/90 transition-colors"
          >
            <Plus size={14} /> Activar pase
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Activos', value: stats.pasesActivos, icon: CreditCard, color: 'text-accent' },
          { label: 'Ingresos recurrentes', value: COP(stats.ingresosRecurrentes), icon: TrendingUp, color: 'text-success' },
          { label: 'Cortes usados', value: stats.cortesUsados, icon: Scissors, color: 'text-text-primary' },
          { label: 'Vencen en 7 días', value: stats.renovacionesProximas, icon: Clock, color: 'text-warning' },
        ].map(card => (
          <div key={card.label} className="bg-background-secondary rounded-2xl border border-border p-4 space-y-2">
            <div className={cn('flex items-center gap-2 text-xs font-bold text-text-tertiary uppercase tracking-widest', card.color)}>
              <card.icon size={14} /> {card.label}
            </div>
            <p className="text-lg font-black text-text-primary tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Scanner */}
      <div className="bg-background-secondary rounded-2xl border border-border p-4">
        <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-3">Verificar pase</p>
        <ScannerQR />
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-background-secondary rounded-xl w-fit border border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all',
              tab === t.id ? 'bg-background-primary shadow-sm text-accent' : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {/* Planes tab */}
      {tab === 'planes' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Add plan card */}
            <button
              onClick={() => { setEditingPlan(null); setPlanModal(true) }}
              className="border-2 border-dashed border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-text-tertiary hover:border-accent hover:text-accent transition-all min-h-[160px]"
            >
              <Plus size={24} />
              <span className="text-xs font-bold">Crear plan</span>
            </button>

            {planes.map(plan => (
              <div
                key={plan.id}
                className="rounded-2xl overflow-hidden border border-border shadow-sm"
                style={{ background: `linear-gradient(135deg, ${plan.color} 0%, ${plan.color}cc 100%)` }}
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white font-black text-lg leading-tight">{plan.name}</p>
                      {plan.description && <p className="text-white/70 text-xs mt-0.5">{plan.description}</p>}
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenu(openMenu === plan.id ? null : plan.id)}
                        className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                      {openMenu === plan.id && (
                        <div className="absolute right-0 top-8 z-10 bg-background-primary border border-border rounded-xl shadow-xl py-1 w-44">
                          <button
                            onClick={() => { setEditingPlan(plan); setPlanModal(true); setOpenMenu(null) }}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-background-secondary transition-colors text-text-primary"
                          >
                            Editar plan
                          </button>
                          <button
                            onClick={() => { handleTogglePlan(plan.id, plan.is_active); setOpenMenu(null) }}
                            className="w-full text-left px-4 py-2 text-xs hover:bg-background-secondary transition-colors text-text-primary"
                          >
                            {plan.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Cortes</p>
                      <p className="text-white font-bold text-sm">{plan.unlimited_services ? 'Ilimitado' : plan.services_included}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/70 text-[10px] uppercase tracking-widest font-bold">Duración</p>
                      <p className="text-white font-bold text-sm">{plan.duration_days}d</p>
                    </div>
                    <p className="text-white font-black text-xl">{COP(plan.price)}</p>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    {plan.includes_product_discount && (
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                        {plan.product_discount_percentage}% dto productos
                      </span>
                    )}
                    {plan.priority_booking && (
                      <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                        Reserva prioritaria
                      </span>
                    )}
                    {!plan.is_active && (
                      <span className="text-[10px] bg-black/30 text-white/60 px-2 py-0.5 rounded-full font-bold">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clientes tab */}
      {tab === 'clientes' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['active', 'all', 'expired'] as const).map(f => (
              <button
                key={f}
                onClick={() => setSubFilter(f)}
                className={cn(
                  'px-4 py-1.5 rounded-full text-xs font-bold transition-all border',
                  subFilter === f ? 'bg-accent text-background-primary border-accent' : 'border-border text-text-tertiary hover:border-accent/50',
                )}
              >
                {f === 'active' ? 'Activos' : f === 'expired' ? 'Vencidos/Cancelados' : 'Todos'}
              </button>
            ))}
          </div>

          <div className="bg-background-secondary rounded-2xl border border-border overflow-hidden">
            {filteredSubs.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-text-tertiary">Sin pases en este filtro</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredSubs.map(sub => {
                  const plan = sub.subscription_plans
                  const client = sub.clients
                  const disponibles = plan?.unlimited_services ? null : (plan?.services_included ?? 0) - sub.services_used
                  const agotado = !plan?.unlimited_services && sub.services_used >= (plan?.services_included ?? 0)
                  return (
                    <div key={sub.id} className="flex items-center gap-4 px-5 py-4">
                      <div
                        className="w-3 h-10 rounded-full shrink-0"
                        style={{ background: plan?.color ?? '#6366f1' }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-text-primary truncate">{client?.name ?? '—'}</p>
                          <span className={cn(
                            'text-[10px] font-bold px-2 py-0.5 rounded-full',
                            sub.status === 'active' && !agotado ? 'bg-success/10 text-success' :
                            agotado ? 'bg-warning/10 text-warning' : 'bg-error/10 text-error',
                          )}>
                            {sub.status === 'active' ? (agotado ? 'Agotado' : 'Activo') : sub.status === 'cancelled' ? 'Cancelado' : 'Vencido'}
                          </span>
                        </div>
                        <p className="text-xs text-text-tertiary">
                          {plan?.name} · {plan?.unlimited_services ? '∞ ilimitado' : `${sub.services_used}/${plan?.services_included ?? '?'} cortes`} · Vence {sub.expires_at}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {sub.qr_code && (
                          <a
                            href={`/pase/${sub.qr_code}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-7 h-7 rounded-lg bg-background-tertiary flex items-center justify-center text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
                          >
                            <ExternalLink size={13} />
                          </a>
                        )}
                        {sub.status === 'active' && !agotado && (
                          <button
                            onClick={() => handleRegistrarUso(sub.id)}
                            title="Registrar uso"
                            className="w-7 h-7 rounded-lg bg-background-tertiary flex items-center justify-center text-text-tertiary hover:text-success hover:bg-success/10 transition-colors"
                          >
                            <CheckCircle2 size={13} />
                          </button>
                        )}
                        {sub.status !== 'active' && (
                          <button
                            onClick={() => handleRenovar(sub.id)}
                            title="Renovar"
                            className="w-7 h-7 rounded-lg bg-background-tertiary flex items-center justify-center text-text-tertiary hover:text-accent hover:bg-accent/10 transition-colors"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                        {sub.status === 'active' && (
                          <button
                            onClick={() => handleCancelar(sub.id)}
                            title="Cancelar"
                            className="w-7 h-7 rounded-lg bg-background-tertiary flex items-center justify-center text-text-tertiary hover:text-error hover:bg-error/10 transition-colors"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Puntos tab */}
      {tab === 'puntos' && (
        <div className="bg-background-secondary rounded-2xl border border-border overflow-hidden">
          {puntos.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-text-tertiary">Sin puntos registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {puntos.map(lp => (
                <div key={lp.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-yellow-400/20 flex items-center justify-center font-bold text-xs text-yellow-600 shrink-0">
                    {(lp.clients?.name ?? '?').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary">{lp.clients?.name ?? '—'}</p>
                    <p className="text-xs text-text-tertiary">{lp.total_earned} ganados · {lp.total_redeemed} canjeados</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1">
                      <Star size={13} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-black text-text-primary tabular-nums">{lp.points}</span>
                    </div>
                    {lp.points > 0 && (
                      <button
                        onClick={() => handleCanjear(lp.client_id, lp.points)}
                        className="text-xs font-bold px-3 py-1.5 rounded-full bg-accent/10 text-accent hover:bg-accent/20 transition-colors flex items-center gap-1"
                      >
                        <Gift size={11} /> Canjear todos
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CrearPlanModal
        isOpen={planModal}
        onClose={() => { setPlanModal(false); setEditingPlan(null); router.refresh() }}
        plan={editingPlan}
        servicios={servicios}
      />

      <ActivarPaseModal
        isOpen={activarModal}
        onClose={() => { setActivarModal(false); router.refresh() }}
        planes={planes}
        clientes={clientes}
      />
    </div>
  )
}
