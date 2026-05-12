'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  TrendingUp, TrendingDown, DollarSign, Minus, Plus, Pencil, Trash2, ChevronDown, ChevronUp,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { cn } from '@/lib/utils'
import {
  createExpense, updateExpense, deleteExpense,
  type Expense, type ExpenseCategoria, type ResumenFinanciero,
} from '@/app/actions/finanzas'
import toast from 'react-hot-toast'

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

const CATEGORIAS: { value: ExpenseCategoria; label: string }[] = [
  { value: 'arriendo', label: 'Arriendo' },
  { value: 'servicios_publicos', label: 'Servicios públicos' },
  { value: 'insumos', label: 'Insumos' },
  { value: 'nomina', label: 'Nómina' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'equipos', label: 'Equipos' },
  { value: 'impuestos', label: 'Impuestos' },
  { value: 'otro', label: 'Otro' },
]

const CAT_COLORS: Record<string, string> = {
  arriendo: 'bg-blue-500',
  servicios_publicos: 'bg-yellow-500',
  insumos: 'bg-green-500',
  nomina: 'bg-purple-500',
  marketing: 'bg-pink-500',
  equipos: 'bg-orange-500',
  impuestos: 'bg-red-500',
  otro: 'bg-gray-500',
}

const MES_LABELS: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr', '05': 'May', '06': 'Jun',
  '07': 'Jul', '08': 'Ago', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
}

function getMesesOpciones() {
  const now = new Date()
  const opciones = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    opciones.push({ value: val, label: `${MES_LABELS[mm]} ${d.getFullYear()}` })
  }
  return opciones
}

interface Props {
  resumen: ResumenFinanciero | null
  expenses: Expense[]
  mesFiltro?: string
}

const BLANK_FORM = {
  categoria: 'insumos' as ExpenseCategoria,
  descripcion: '',
  monto: '',
  fecha: new Date().toISOString().split('T')[0],
  es_recurrente: false,
}

export default function FinanzasClient({ resumen, expenses, mesFiltro }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [tab, setTab] = useState<'resumen' | 'gastos'>('resumen')
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [form, setForm] = useState(BLANK_FORM)
  const [expandedCats, setExpandedCats] = useState(false)

  const meses = getMesesOpciones()
  const mesActual = mesFiltro ?? meses[0].value

  const handleMesChange = (mes: string) => router.push(`/dashboard/reportes?mes=${mes}`)

  const openCreate = () => {
    setForm(BLANK_FORM)
    setEditingExpense(null)
    setShowForm(true)
  }

  const openEdit = (e: Expense) => {
    setForm({
      categoria: e.categoria,
      descripcion: e.descripcion,
      monto: String(e.monto),
      fecha: e.fecha,
      es_recurrente: e.es_recurrente,
    })
    setEditingExpense(e)
    setShowForm(true)
  }

  const handleSubmit = () => {
    if (!form.descripcion || !form.monto || !form.fecha) {
      toast.error('Completa los campos requeridos')
      return
    }
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.set(k, String(v)))
    startTransition(async () => {
      const result = editingExpense ? await updateExpense(editingExpense.id, fd) : await createExpense(fd)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(editingExpense ? 'Gasto actualizado' : 'Gasto registrado')
        setShowForm(false)
        router.refresh()
      }
    })
  }

  const handleDelete = () => {
    if (!deletingId) return
    startTransition(async () => {
      const result = await deleteExpense(deletingId)
      if (result.error) { toast.error(result.error) } else {
        toast.success('Gasto eliminado')
        setDeletingId(null)
        router.refresh()
      }
    })
  }

  const r = resumen
  const deltaIngresos = r && r.ingresosNetosMesAnterior > 0
    ? Math.round(((r.ingresosNetos - r.ingresosNetosMesAnterior) / r.ingresosNetosMesAnterior) * 100) : null
  const deltaEgresos = r && r.egresosMesAnterior > 0
    ? Math.round(((r.egresosMes - r.egresosMesAnterior) / r.egresosMesAnterior) * 100) : null
  const maxIngreso = Math.max(1, ...(r?.ingresosPorDia.map(d => d.ingresos) ?? [1]))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingresos y Egresos"
        description="Seguimiento financiero de tu barbería"
        action={
          <div className="flex items-center gap-2">
            <select
              value={mesActual}
              onChange={e => handleMesChange(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {meses.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <Button onClick={openCreate} className="h-9 gap-1.5">
              <Plus size={15} /> Agregar gasto
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ingresos netos" value={r ? COP(r.ingresosNetos) : '—'} delta={deltaIngresos} icon={<TrendingUp size={18} />} color="text-success" bg="bg-success/10" />
        <KpiCard label="Egresos del mes" value={r ? COP(r.egresosMes) : '—'} delta={deltaEgresos !== null ? -deltaEgresos : null} icon={<TrendingDown size={18} />} color="text-error" bg="bg-error/10" deltaInvert />
        <KpiCard label="Nómina pagada" value={r ? COP(r.gastosNomina) : '—'} icon={<DollarSign size={18} />} color="text-accent" bg="bg-accent/10" />
        <KpiCard
          label="Utilidad neta"
          value={r ? COP(r.utilidadNeta) : '—'}
          icon={!r || r.utilidadNeta >= 0 ? <TrendingUp size={18} /> : <Minus size={18} />}
          color={!r || r.utilidadNeta >= 0 ? 'text-success' : 'text-error'}
          bg={!r || r.utilidadNeta >= 0 ? 'bg-success/10' : 'bg-error/10'}
        />
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-background-secondary rounded-xl w-fit border border-border">
        {(['resumen', 'gastos'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-5 py-2 text-xs font-bold rounded-lg transition-all',
              tab === t ? 'bg-background-primary shadow-sm text-accent' : 'text-text-tertiary hover:text-text-secondary',
            )}
          >
            {t === 'resumen' ? 'Resumen de ingresos' : 'Gestión de gastos'}
          </button>
        ))}
      </div>

      {tab === 'resumen' && (
        <div className="space-y-6">
          <div className="bg-background-secondary rounded-2xl border border-border p-6">
            <p className="text-xs font-black text-text-tertiary uppercase tracking-widest mb-5">Ingresos por día</p>
            {r && r.ingresosPorDia.length > 0 ? (
              <div className="flex items-end gap-1 h-32 overflow-x-auto pb-4">
                {r.ingresosPorDia.map((d) => (
                  <div key={d.dia} className="flex flex-col items-center gap-1 flex-1 min-w-[32px]">
                    <div
                      className="w-full bg-accent rounded-t-sm transition-all hover:bg-accent/80"
                      style={{ height: `${Math.max(4, Math.round((d.ingresos / maxIngreso) * 100))}%` }}
                      title={COP(d.ingresos)}
                    />
                    <span className="text-[9px] text-text-tertiary">{d.dia}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-tertiary text-center py-8">Sin citas completadas este mes</p>
            )}
          </div>

          {r && r.ingresosPorServicio.length > 0 && (
            <div className="bg-background-secondary rounded-2xl border border-border p-6">
              <p className="text-xs font-black text-text-tertiary uppercase tracking-widest mb-5">Ingresos por servicio</p>
              <div className="space-y-3">
                {r.ingresosPorServicio.map((s) => {
                  const pct = r.ingresosNetos > 0 ? Math.round((s.ingresos / r.ingresosNetos) * 100) : 0
                  return (
                    <div key={s.nombre} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-primary font-medium">{s.nombre}</span>
                        <span className="text-text-secondary tabular-nums">{COP(s.ingresos)} <span className="text-text-tertiary">({s.count} citas)</span></span>
                      </div>
                      <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'gastos' && (
        <div className="space-y-6">
          {r && r.egresosPorCategoria.length > 0 && (
            <div className="bg-background-secondary rounded-2xl border border-border p-6">
              <button className="w-full flex items-center justify-between" onClick={() => setExpandedCats(v => !v)}>
                <p className="text-xs font-black text-text-tertiary uppercase tracking-widest">Gastos por categoría</p>
                {expandedCats ? <ChevronUp size={16} className="text-text-tertiary" /> : <ChevronDown size={16} className="text-text-tertiary" />}
              </button>
              {expandedCats && (
                <div className="mt-5 space-y-3">
                  {r.egresosPorCategoria.map((c) => {
                    const pct = r.egresosMes > 0 ? Math.round((c.monto / r.egresosMes) * 100) : 0 // egresosMes includes nomina via expenses
                    const label = CATEGORIAS.find(x => x.value === c.categoria)?.label ?? c.categoria
                    return (
                      <div key={c.categoria} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className={cn('w-2 h-2 rounded-full', CAT_COLORS[c.categoria] ?? 'bg-gray-500')} />
                            <span className="text-text-primary font-medium">{label}</span>
                          </div>
                          <span className="text-text-secondary tabular-nums">{COP(c.monto)} <span className="text-text-tertiary">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 bg-background-tertiary rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', CAT_COLORS[c.categoria] ?? 'bg-gray-500')} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div className="bg-background-secondary rounded-2xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <p className="text-sm font-bold text-text-primary">Registro de gastos</p>
              <span className="text-xs text-text-tertiary">{expenses.length} registros</span>
            </div>
            {expenses.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-text-tertiary">Sin gastos registrados este mes</p>
                <Button onClick={openCreate} variant="secondary" className="mt-4 gap-1.5">
                  <Plus size={14} /> Agregar gasto
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {expenses.map((e) => {
                  const catLabel = CATEGORIAS.find(c => c.value === e.categoria)?.label ?? e.categoria
                  return (
                    <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-background-tertiary/30 transition-colors">
                      <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', CAT_COLORS[e.categoria] ?? 'bg-gray-500')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{e.descripcion}</p>
                        <p className="text-xs text-text-tertiary mt-0.5">
                          {catLabel} · {new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-error tabular-nums shrink-0">{COP(e.monto)}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded-lg hover:bg-background-tertiary text-text-tertiary hover:text-text-primary transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeletingId(e.id)} className="p-1.5 rounded-lg hover:bg-error/10 text-text-tertiary hover:text-error transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editingExpense ? 'Editar gasto' : 'Agregar gasto'}>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Categoría *</label>
            <select
              value={form.categoria}
              onChange={e => setForm(f => ({ ...f, categoria: e.target.value as ExpenseCategoria }))}
              className="w-full h-11 px-3 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Descripción *</label>
            <input
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Ej. Arriendo local mes de mayo"
              className="w-full h-11 px-4 rounded-xl border border-border bg-background-secondary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Monto (COP) *</label>
              <input
                type="number"
                value={form.monto}
                onChange={e => setForm(f => ({ ...f, monto: e.target.value }))}
                placeholder="0"
                className="w-full h-11 px-4 rounded-xl border border-border bg-background-secondary text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background-secondary text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.es_recurrente} onChange={e => setForm(f => ({ ...f, es_recurrente: e.target.checked }))} className="w-4 h-4 rounded accent-accent" />
            <span className="text-sm text-text-secondary">Gasto recurrente</span>
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSubmit} loading={isPending}>
              {editingExpense ? 'Guardar cambios' : 'Agregar gasto'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Eliminar gasto"
        description="¿Seguro que quieres eliminar este gasto? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        confirmVariant="danger"
        loading={isPending}
      />
    </div>
  )
}

function KpiCard({
  label, value, delta, icon, color, bg, deltaInvert = false,
}: {
  label: string; value: string; delta?: number | null; icon: React.ReactNode
  color: string; bg: string; deltaInvert?: boolean
}) {
  const isPositive = delta !== null && delta !== undefined && delta >= 0
  return (
    <div className="bg-background-secondary rounded-2xl border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest">{label}</span>
        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', bg, color)}>{icon}</div>
      </div>
      <p className="text-xl font-black text-text-primary tabular-nums">{value}</p>
      {delta !== null && delta !== undefined && (
        <p className={cn('text-xs font-semibold', isPositive !== deltaInvert ? 'text-success' : 'text-error')}>
          {delta >= 0 ? '+' : ''}{delta}% vs mes anterior
        </p>
      )}
    </div>
  )
}
