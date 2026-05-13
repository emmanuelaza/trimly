'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Wallet, FileText, CheckCircle2, Clock, Download,
  ChevronDown, ChevronUp, Banknote, Smartphone, ArrowRightLeft, CreditCard,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { markAsPaid } from '@/app/actions/nomina'
import toast from 'react-hot-toast'

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

type MetodoPago = 'efectivo' | 'nequi' | 'daviplata' | 'transferencia' | 'otro'

const METODOS: { value: MetodoPago; label: string; icon: React.ReactNode }[] = [
  { value: 'efectivo', label: 'Efectivo', icon: <Banknote size={20} /> },
  { value: 'nequi', label: 'Nequi', icon: <Smartphone size={20} /> },
  { value: 'daviplata', label: 'Daviplata', icon: <Smartphone size={20} /> },
  { value: 'transferencia', label: 'Transferencia', icon: <ArrowRightLeft size={20} /> },
  { value: 'otro', label: 'Otro', icon: <CreditCard size={20} /> },
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
}

export default function NominaClient({ initialLiquidation, initialHistory, period }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'liquidacion' | 'historial'>('liquidacion')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [payingItem, setPayingItem] = useState<LiqItem | null>(null)
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo')
  const [nota, setNota] = useState('')

  const totalPendiente = initialLiquidation.reduce((s, i) => s + (i.status === 'pending' ? i.amountBarber : 0), 0)
  const totalPagado = initialLiquidation.reduce((s, i) => s + (i.status !== 'pending' ? i.amountBarber : 0), 0)
  const totalGenerado = initialLiquidation.reduce((s, i) => s + i.amountGenerated, 0)

  const openPago = (item: LiqItem) => {
    setPayingItem(item)
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
        amountBarber: payingItem.amountBarber,
        metodoPago: metodo,
        note: nota || undefined,
      })
      if (result.success) {
        toast.success(`Pago de ${COP(payingItem.amountBarber)} registrado`)
        setPayingItem(null)
        router.refresh()
      } else {
        toast.error(result.error ?? 'Error al registrar pago')
      }
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

  const schemeLabel = (s: string) =>
    s === 'percentage' ? 'Porcentaje' : s === 'fixed_monthly' ? 'Fijo mensual' : s === 'per_service' ? 'Por servicio' : 'Sin configurar'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nómina"
        description={`Período: ${period.start} — ${period.end}`}
        badge={totalPendiente > 0 ? `${COP(totalPendiente)} pendiente` : undefined}
      />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total generado', value: COP(totalGenerado), icon: <FileText size={16} />, color: 'text-accent' },
          { label: 'Ya pagado', value: COP(totalPagado), icon: <CheckCircle2 size={16} />, color: 'text-success' },
          { label: 'Por pagar', value: COP(totalPendiente), icon: <Clock size={16} />, color: 'text-warning' },
        ].map(card => (
          <div key={card.label} className="bg-background-secondary rounded-2xl border border-border p-4 space-y-2">
            <div className={cn('flex items-center gap-2 text-xs font-bold text-text-tertiary uppercase tracking-widest', card.color)}>
              {card.icon} {card.label}
            </div>
            <p className="text-lg font-black text-text-primary tabular-nums">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-background-secondary rounded-xl w-fit border border-border">
        {(['liquidacion', 'historial'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={cn(
              'px-5 py-2 text-xs font-bold rounded-lg transition-all capitalize',
              activeTab === t ? 'bg-background-primary shadow-sm text-accent' : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {t === 'liquidacion' ? 'Liquidación actual' : 'Historial de pagos'}
          </button>
        ))}
      </div>

      {activeTab === 'liquidacion' && (
        <div className="space-y-3">
          {initialLiquidation.length === 0 && (
            <div className="bg-background-secondary rounded-2xl border border-border py-16 text-center">
              <p className="text-sm text-text-tertiary">Sin barberos configurados para este período</p>
            </div>
          )}
          {initialLiquidation.map((item) => {
            const isExpanded = expandedId === item.barber.id
            const initials = item.barber.name.substring(0, 2).toUpperCase()
            return (
              <div key={item.barber.id} className="bg-background-secondary rounded-2xl border border-border overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 p-5 hover:bg-background-tertiary/20 transition-colors text-left"
                  onClick={() => setExpandedId(isExpanded ? null : item.barber.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-accent text-background-primary flex items-center justify-center font-bold text-sm shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-text-primary">{item.barber.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-background-tertiary text-text-tertiary uppercase tracking-widest">
                        {schemeLabel(item.scheme)}
                      </span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-0.5">{item.appointmentsCount} citas · {COP(item.amountGenerated)} generado</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-black text-accent tabular-nums">{COP(item.amountBarber)}</p>
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full',
                      item.status === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                    )}>
                      {item.status === 'paid' ? '✓ Pagado' : 'Pendiente'}
                    </span>
                  </div>
                  {isExpanded ? <ChevronUp size={16} className="text-text-tertiary shrink-0" /> : <ChevronDown size={16} className="text-text-tertiary shrink-0" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-5 py-4 space-y-4 bg-background-tertiary/10">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Esquema</p>
                        <p className="text-text-primary font-medium mt-1">{schemeLabel(item.scheme)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Generado</p>
                        <p className="text-text-primary font-medium mt-1">{COP(item.amountGenerated)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">A pagar</p>
                        <p className="text-accent font-bold mt-1">{COP(item.amountBarber)}</p>
                      </div>
                    </div>
                    {item.status === 'pending' && (
                      <Button className="w-full gap-2 h-11" onClick={() => openPago(item)}>
                        <Wallet size={16} /> Registrar pago de {COP(item.amountBarber)}
                      </Button>
                    )}
                    {item.status === 'paid' && (
                      <div className="flex items-center gap-2 text-success text-sm font-medium">
                        <CheckCircle2 size={16} /> Pago ya registrado para este período
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

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
                    <p className="text-xs text-text-tertiary">{new Date(p.payment_date).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Method Modal */}
      {payingItem && (
        <Modal
          isOpen={!!payingItem}
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
            <div className="bg-background-tertiary/30 rounded-xl p-4 text-center">
              <p className="text-xs text-text-tertiary uppercase tracking-widest font-bold mb-1">Monto a pagar</p>
              <p className="text-3xl font-black text-accent">{COP(payingItem.amountBarber)}</p>
              <p className="text-xs text-text-tertiary mt-1">{period.start} — {period.end}</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-3">Método de pago</p>
              <div className="grid grid-cols-5 gap-2">
                {METODOS.map(m => (
                  <button
                    key={m.value}
                    onClick={() => setMetodo(m.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all',
                      metodo === m.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-background-secondary text-text-tertiary hover:border-border-strong hover:text-text-secondary',
                    )}
                  >
                    {m.icon}
                    <span className="text-[10px] font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Nota (opcional)</label>
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
    </div>
  )
}
