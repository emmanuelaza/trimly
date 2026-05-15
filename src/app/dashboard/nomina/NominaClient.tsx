'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wallet, FileText, CheckCircle2, Clock, Download,
  AlertCircle, ChevronRight, Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { markAsPaid, updateBarberPaymentScheme, updateBarberServiceRate } from '@/app/actions/nomina'
import toast from 'react-hot-toast'
import Image from 'next/image'

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

type MetodoPago = 'efectivo' | 'nequi' | 'daviplata' | 'transferencia' | 'otro'
type SchemeType = 'percentage' | 'fixed_monthly' | 'per_service'
type PeriodTab = 'current' | 'previous' | 'custom'

const METODOS: { value: MetodoPago; label: string; emoji: string }[] = [
  { value: 'efectivo',      label: 'Efectivo',       emoji: '💵' },
  { value: 'nequi',         label: 'Nequi',          emoji: '📱' },
  { value: 'daviplata',     label: 'Daviplata',      emoji: '📱' },
  { value: 'transferencia', label: 'Transferencia',  emoji: '🏦' },
  { value: 'otro',          label: 'Otro',           emoji: '📝' },
]

interface LiqItem {
  barber: { id: string; name: string; avatar_url?: string }
  appointmentsCount: number
  amountGenerated: number
  amountBarber: number
  scheme: string
  percentage?: number
  status: 'pending' | 'paid'
  paymentId?: string
}

interface Props {
  initialLiquidation: LiqItem[]
  initialHistory: any[]
  period: { start: string; end: string }
  services: { id: string; name: string; price: number }[]
}

function monthPeriod(offset: 0 | -1) {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
  return { start, end }
}

function monthLabel(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}

export default function NominaClient({ initialLiquidation, initialHistory, period, services }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [activeTab,  setActiveTab]  = useState<'liquidacion' | 'historial'>('liquidacion')
  const [periodTab,  setPeriodTab]  = useState<PeriodTab>('current')
  const [customStart, setCustomStart] = useState(period.start)
  const [customEnd,   setCustomEnd]   = useState(period.end)

  // Payment modal
  const [payingItem, setPayingItem] = useState<LiqItem | null>(null)
  const [monto,  setMonto]  = useState(0)
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [nota,   setNota]   = useState('')

  // Scheme config modal
  const [configuringItem, setConfiguringItem] = useState<LiqItem | null>(null)
  const [schemeType,   setSchemeType]   = useState<SchemeType>('percentage')
  const [schemePct,    setSchemePct]    = useState(50)
  const [schemeFixed,  setSchemeFixed]  = useState(0)
  const [serviceRates, setServiceRates] = useState<Record<string, number>>({})

  const totalPendiente = initialLiquidation.reduce((s, i) => s + (i.status === 'pending' ? i.amountBarber : 0), 0)
  const totalPagado    = initialLiquidation.reduce((s, i) => s + (i.status !== 'pending' ? i.amountBarber : 0), 0)
  const totalGenerado  = initialLiquidation.reduce((s, i) => s + i.amountGenerated, 0)

  const applyPeriod = (start: string, end: string) =>
    router.push(`/dashboard/nomina?start=${start}&end=${end}`)

  const handlePeriodTab = (tab: PeriodTab) => {
    setPeriodTab(tab)
    if (tab === 'current')  applyPeriod(...Object.values(monthPeriod(0))  as [string, string])
    if (tab === 'previous') applyPeriod(...Object.values(monthPeriod(-1)) as [string, string])
  }

  const openPago = (item: LiqItem) => {
    setPayingItem(item)
    setMonto(item.amountBarber)
    setMetodo('efectivo')
    setNota('')
  }

  const handleConfirmPago = () => {
    if (!payingItem) return
    startTransition(async () => {
      const result = await markAsPaid({
        barberId: payingItem.barber.id,
        barberName: payingItem.barber.name,
        periodStart: period.start,
        periodEnd: period.end,
        amountGenerated: payingItem.amountGenerated,
        amountBarber: monto,
        metodoPago: metodo,
        note: nota || undefined,
      })
      if (result.success) {
        toast.success(`Pago de ${COP(monto)} registrado`)
        setPayingItem(null)
        router.refresh()
      } else {
        toast.error(result.error ?? 'Error al registrar pago')
      }
    })
  }

  const openConfigureScheme = (item: LiqItem) => {
    setConfiguringItem(item)
    setSchemeType(item.scheme === 'fixed_monthly' ? 'fixed_monthly' : item.scheme === 'per_service' ? 'per_service' : 'percentage')
    setSchemePct(item.percentage ?? 50)
    setSchemeFixed(0)
    setServiceRates({})
  }

  const handleSaveScheme = () => {
    if (!configuringItem) return
    startTransition(async () => {
      const result = await updateBarberPaymentScheme(
        configuringItem.barber.id,
        schemeType,
        schemeType === 'percentage' ? schemePct : undefined,
        schemeType === 'fixed_monthly' ? schemeFixed : undefined,
      )
      if (!result.success) { toast.error(result.error ?? 'Error al guardar'); return }

      if (schemeType === 'per_service') {
        const entries = Object.entries(serviceRates).filter(([, v]) => v > 0)
        if (entries.length) {
          await Promise.all(entries.map(([svcId, amount]) =>
            updateBarberServiceRate(configuringItem.barber.id, svcId, amount)
          ))
        }
      }

      toast.success('Esquema guardado')
      setConfiguringItem(null)
      router.refresh()
    })
  }

  const exportCSV = () => {
    const rows = initialHistory.map((p: any) => [
      new Date(p.payment_date).toLocaleDateString('es-CO'),
      p.barber?.name ?? '',
      p.amount_barber,
      `${p.period_start} a ${p.period_end}`,
      p.payment_method ?? '',
      p.payment_note ?? '',
    ])
    const csv = 'data:text/csv;charset=utf-8,Fecha,Barbero,Monto,Período,Método,Nota\n'
      + rows.map((r: any[]) => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = encodeURI(csv)
    a.download = `nomina_${period.start}_${period.end}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Nómina</h1>
        <p className="text-sm text-text-tertiary mt-1">Controla lo que gana cada barbero y lleva el registro de tus pagos</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total generado', value: COP(totalGenerado),  icon: <FileText size={16} />,    color: 'text-accent'   },
          { label: 'Ya pagado',      value: COP(totalPagado),    icon: <CheckCircle2 size={16} />, color: 'text-success'  },
          { label: 'Por pagar',      value: COP(totalPendiente), icon: <Clock size={16} />,        color: 'text-warning'  },
        ].map(card => (
          <div key={card.label} className="bg-background-secondary rounded-2xl border border-border p-4 space-y-2">
            <div className={cn('flex items-center gap-2 text-xs font-bold text-text-tertiary uppercase tracking-widest', card.color)}>
              {card.icon} {card.label}
            </div>
            <p className="text-lg font-black text-text-primary tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex p-1 bg-background-secondary rounded-xl border border-border">
          {([['current', 'Este mes'], ['previous', 'Mes anterior'], ['custom', 'Personalizado']] as [PeriodTab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => handlePeriodTab(t)}
              className={cn(
                'px-4 py-2 text-xs font-bold rounded-lg transition-all',
                periodTab === t ? 'bg-background-primary shadow-sm text-accent' : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {periodTab === 'custom' && (
          <div className="flex items-center gap-2">
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border bg-background-secondary text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <span className="text-text-tertiary text-xs">—</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border bg-background-secondary text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
            <Button size="sm" className="h-9" onClick={() => applyPeriod(customStart, customEnd)}>Aplicar</Button>
          </div>
        )}

        <span className="text-xs text-text-tertiary ml-auto capitalize">{monthLabel(period.start)}</span>
      </div>

      {/* Main / History tabs */}
      <div className="flex p-1 bg-background-secondary rounded-xl w-fit border border-border">
        {([['liquidacion', 'Liquidación'], ['historial', 'Historial de pagos']] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              'px-5 py-2 text-xs font-bold rounded-lg transition-all',
              activeTab === t ? 'bg-background-primary shadow-sm text-accent' : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liquidación */}
      {activeTab === 'liquidacion' && (
        <div className="space-y-3">
          {initialLiquidation.length === 0 && (
            <div className="bg-background-secondary rounded-2xl border border-border py-16 text-center">
              <p className="text-sm text-text-tertiary">Sin barberos en este período</p>
            </div>
          )}

          {initialLiquidation.map(item => {
            const isPaid    = item.status === 'paid'
            const noScheme  = item.scheme === 'not_configured'
            const initials  = item.barber.name.substring(0, 2).toUpperCase()

            return (
              <div
                key={item.barber.id}
                className={cn(
                  'bg-background-secondary rounded-2xl border overflow-hidden',
                  isPaid ? 'border-success/20' : noScheme ? 'border-warning/30' : 'border-border',
                )}
              >
                {/* No-scheme banner */}
                {noScheme && (
                  <div className="flex items-center justify-between gap-3 px-5 py-3 bg-warning/5 border-b border-warning/20">
                    <div className="flex items-center gap-2 text-warning">
                      <AlertCircle size={14} />
                      <span className="text-xs font-semibold">Sin esquema de pago configurado</span>
                    </div>
                    <button
                      onClick={() => openConfigureScheme(item)}
                      className="text-xs font-bold text-warning flex items-center gap-1 underline underline-offset-2 hover:opacity-80 transition-opacity"
                    >
                      Configurar <ChevronRight size={12} />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-4 p-5">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 bg-accent flex items-center justify-center">
                    {item.barber.avatar_url ? (
                      <Image src={item.barber.avatar_url} alt={item.barber.name} width={48} height={48} className="w-full h-full object-cover" unoptimized />
                    ) : (
                      <span className="text-background-primary font-bold text-sm">{initials}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-bold text-text-primary">{item.barber.name}</p>
                    <p className="text-xs text-text-tertiary">Período: {period.start} — {period.end}</p>
                    <p className="text-xs text-text-secondary">{item.appointmentsCount} citas · {COP(item.amountGenerated)} generado</p>
                    <p className="text-xs text-text-secondary">
                      Le corresponde: <span className="font-bold text-accent">{COP(item.amountBarber)}</span>
                    </p>
                  </div>

                  {/* Status + action */}
                  <div className="shrink-0 flex flex-col items-end gap-2">
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-3 py-2 rounded-xl">
                        <CheckCircle2 size={14} /> Pagado
                      </span>
                    ) : noScheme ? (
                      <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => openConfigureScheme(item)}>
                        <Settings2 size={14} /> Configurar
                      </Button>
                    ) : (
                      <Button className="gap-2 whitespace-nowrap" onClick={() => openPago(item)}>
                        <Wallet size={15} />
                        Pagar {COP(item.amountBarber)}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Historial */}
      {activeTab === 'historial' && (
        <div className="bg-background-secondary rounded-2xl border border-border overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <p className="text-sm font-bold text-text-primary">Registro histórico</p>
            <Button variant="secondary" size="sm" className="gap-2 h-8 text-xs" onClick={exportCSV}>
              <Download size={13} /> Exportar CSV
            </Button>
          </div>
          {initialHistory.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm text-text-tertiary">Sin pagos registrados aún</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {initialHistory.map((p: any) => (
                <div key={p.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-9 h-9 rounded-full bg-accent text-background-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {(p.barber?.name ?? '?').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">{p.barber?.name ?? 'Barbero'}</p>
                    <p className="text-xs text-text-tertiary">{p.period_start} al {p.period_end} · {p.payment_method ?? 'efectivo'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success tabular-nums">{COP(p.amount_barber)}</p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(p.payment_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Payment Modal ───────────────────────────────────────────── */}
      {payingItem && (
        <Modal
          isOpen
          onClose={() => setPayingItem(null)}
          title={`Pagar a ${payingItem.barber.name}`}
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setPayingItem(null)}>Cancelar</Button>
              <Button className="flex-1 gap-2 bg-success hover:bg-success/90" onClick={handleConfirmPago} loading={isPending}>
                <CheckCircle2 size={16} /> Confirmar pago
              </Button>
            </div>
          }
        >
          <div className="space-y-6">
            {/* Amount */}
            <div>
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest block mb-2">Monto a pagar</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
                <input
                  type="number"
                  value={monto}
                  onChange={e => setMonto(Number(e.target.value))}
                  className="w-full h-14 pl-8 pr-4 rounded-xl border border-border bg-background-tertiary/30 text-2xl font-black text-accent tabular-nums focus:outline-none focus:ring-2 focus:ring-accent/30"
                />
              </div>
              <p className="text-xs text-text-tertiary mt-1 text-right">{period.start} — {period.end}</p>
            </div>

            {/* Method */}
            <div>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Cómo pagaste</p>
              <div className="grid grid-cols-5 gap-2">
                {METODOS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMetodo(m.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
                      metodo === m.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-background-secondary text-text-tertiary hover:border-border-strong',
                    )}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[10px] font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest block mb-2">Nota (opcional)</label>
              <input
                value={nota}
                onChange={e => setNota(e.target.value)}
                placeholder="Ej. Transferencia Bancolombia"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background-secondary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── Configure Scheme Modal ──────────────────────────────────── */}
      {configuringItem && (
        <Modal
          isOpen
          onClose={() => setConfiguringItem(null)}
          title={`Esquema de pago — ${configuringItem.barber.name}`}
          footer={
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfiguringItem(null)}>Cancelar</Button>
              <Button className="flex-1" onClick={handleSaveScheme} loading={isPending}>Guardar esquema</Button>
            </div>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">¿Cómo le pagas a este barbero?</p>

            {/* Scheme type cards */}
            {([
              { type: 'percentage'    as SchemeType, emoji: '📊', label: '% Porcentaje',   desc: 'Gana un % de cada corte' },
              { type: 'fixed_monthly' as SchemeType, emoji: '💵', label: 'Nómina fija',    desc: 'Recibe lo mismo cada mes' },
              { type: 'per_service'   as SchemeType, emoji: '✂️', label: 'Por servicio',   desc: 'Un valor fijo por cada corte' },
            ]).map(opt => (
              <button
                key={opt.type}
                onClick={() => setSchemeType(opt.type)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all',
                  schemeType === opt.type ? 'border-accent bg-accent/5' : 'border-border hover:border-border-strong',
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary">{opt.label}</p>
                  <p className="text-xs text-text-tertiary">{opt.desc}</p>
                </div>
                <div className={cn('w-4 h-4 rounded-full border-2 shrink-0 transition-colors',
                  schemeType === opt.type ? 'border-accent bg-accent' : 'border-border')} />
              </button>
            ))}

            {/* Dynamic input */}
            {schemeType === 'percentage' && (
              <div className="p-4 bg-background-tertiary/30 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-text-secondary">Porcentaje para el barbero</label>
                  <span className="text-2xl font-black text-accent">{schemePct}%</span>
                </div>
                <input
                  type="range" min={10} max={100} step={5}
                  value={schemePct} onChange={e => setSchemePct(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between text-[10px] text-text-tertiary font-medium">
                  <span>10%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            )}

            {schemeType === 'fixed_monthly' && (
              <div className="p-4 bg-background-tertiary/30 rounded-xl">
                <label className="text-xs font-bold text-text-secondary block mb-2">Monto fijo mensual</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-bold">$</span>
                  <input
                    type="number" min={0} step={10000}
                    value={schemeFixed} onChange={e => setSchemeFixed(Number(e.target.value))}
                    placeholder="1000000"
                    className="w-full h-12 pl-8 pr-4 rounded-xl border border-border bg-background-secondary text-lg font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                  />
                </div>
              </div>
            )}

            {schemeType === 'per_service' && services.length > 0 && (
              <div className="p-4 bg-background-tertiary/30 rounded-xl space-y-3">
                <p className="text-xs font-bold text-text-secondary">Valor por servicio</p>
                {services.map(svc => (
                  <div key={svc.id} className="flex items-center gap-3">
                    <span className="text-sm text-text-primary flex-1 truncate">{svc.name}</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary text-xs font-bold">$</span>
                      <input
                        type="number" min={0} step={1000}
                        value={serviceRates[svc.id] ?? 0}
                        onChange={e => setServiceRates(prev => ({ ...prev, [svc.id]: Number(e.target.value) }))}
                        className="w-36 h-9 pl-6 pr-3 rounded-lg border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {schemeType === 'per_service' && services.length === 0 && (
              <p className="text-xs text-text-tertiary text-center py-2">
                Primero agrega servicios en la sección Servicios
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
