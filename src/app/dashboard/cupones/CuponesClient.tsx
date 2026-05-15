'use client'

import { useState } from 'react'
import { Tag, Plus, Copy, Check, ToggleLeft, ToggleRight, Trash2, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { createCupon, toggleCupon, deleteCupon, type Cupon } from '@/app/actions/cupones'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function generateCode(): string {
  const words = ['CORTE', 'BARBA', 'FILO', 'PRIME', 'VIP', 'BLACK', 'ELITE', 'TOP']
  const word = words[Math.floor(Math.random() * words.length)]
  const num = Math.floor(10 + Math.random() * 90)
  return `${word}${num}`
}

interface CuponesClientProps {
  cupones: Cupon[]
}

export function CuponesClient({ cupones }: CuponesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Cupon | null>(null)
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    codigo: '',
    tipo: 'porcentaje',
    valor: '',
    usos_maximos: '0',
    fecha_vencimiento: '',
  })

  const resetForm = () => setForm({ codigo: '', tipo: 'porcentaje', valor: '', usos_maximos: '0', fecha_vencimiento: '' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    const result = await createCupon(fd)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Cupón ${result.codigo} listo para usar`)
      setIsModalOpen(false)
      resetForm()
    }
  }

  const handleToggle = async (cupon: Cupon) => {
    const result = await toggleCupon(cupon.id, !cupon.activo)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(cupon.activo ? `Cupón ${cupon.codigo} desactivado` : `Cupón ${cupon.codigo} activado`)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setLoading(true)
    const result = await deleteCupon(confirmDelete.id)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Cupón ${confirmDelete.codigo} eliminado`)
      setConfirmDelete(null)
    }
  }

  const handleCopy = async (cupon: Cupon) => {
    await navigator.clipboard.writeText(cupon.codigo)
    setCopiedId(cupon.id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success(`Código ${cupon.codigo} copiado`)
  }

  const isExpired = (cupon: Cupon) => {
    if (!cupon.fecha_vencimiento) return false
    return new Date(cupon.fecha_vencimiento) < new Date()
  }

  const isExhausted = (cupon: Cupon) => {
    if (!cupon.usos_maximos) return false
    return cupon.usos_actuales >= cupon.usos_maximos
  }

  return (
    <>
      <PageHeader
        title="Cupones"
        description="Descuentos y promociones para tus clientes"
        count={cupones.length}
        action={{ label: '+ Nuevo cupón', onClick: () => { resetForm(); setIsModalOpen(true) }, icon: <Plus size={14} /> }}
      />

      {cupones.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-xl">
          <EmptyState
            icon={<Tag size={40} className="text-primary/40" />}
            title="Crea descuentos para llenar tu agenda"
            description="Los cupones aparecen en tu página de reservas. Tus clientes los usan al agendar y tú controlas cuántas veces se pueden usar."
            action={{ label: '+ Crear mi primer cupón', onClick: () => setIsModalOpen(true) }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 pb-8">
            {[
              { icon: '🎯', title: 'Atrae clientes nuevos', desc: 'Comparte el código en redes sociales' },
              { icon: '🔒', title: 'Tú controlas el límite', desc: 'Define cuántas veces se puede usar' },
              { icon: '📈', title: 'Mide el resultado', desc: 'Ve cuántas veces se usó cada cupón' },
            ].map((b) => (
              <div key={b.title} className="flex items-start gap-3 p-4 bg-background-tertiary rounded-xl">
                <span className="text-2xl">{b.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{b.title}</p>
                  <p className="text-xs text-text-muted mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-background-secondary border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-tertiary/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Código</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Descuento</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Usos</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Vence</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cupones.map((cupon) => {
                  const expired = isExpired(cupon)
                  const exhausted = isExhausted(cupon)
                  const inactive = !cupon.activo || expired || exhausted

                  return (
                    <tr key={cupon.id} className={cn('hover:bg-background-tertiary/30 transition-colors', inactive && 'opacity-60')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-text-primary tracking-widest">{cupon.codigo}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(cupon)}
                            className="text-text-muted hover:text-primary transition-colors"
                            title="Copiar código"
                          >
                            {copiedId === cupon.id ? <Check size={13} className="text-success" /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-primary">
                        {cupon.tipo === 'porcentaje'
                          ? `${cupon.valor}% de descuento`
                          : `$${cupon.valor.toLocaleString('es-CO')} menos`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('text-sm', exhausted ? 'text-danger font-semibold' : 'text-text-secondary')}>
                          {cupon.usos_actuales}
                          {cupon.usos_maximos > 0 ? ` / ${cupon.usos_maximos}` : ' / ∞'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary text-xs">
                        {cupon.fecha_vencimiento
                          ? new Date(cupon.fecha_vencimiento).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
                          : <span className="text-text-muted">Sin vencimiento</span>}
                        {expired && <span className="ml-1.5 text-danger font-semibold">(vencido)</span>}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(cupon)}
                          title={cupon.activo ? 'Desactivar' : 'Activar'}
                          className="transition-colors"
                          disabled={expired || exhausted}
                        >
                          {cupon.activo && !expired && !exhausted
                            ? <ToggleRight size={22} className="text-success" />
                            : <ToggleLeft size={22} className="text-text-muted" />}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <ActionMenu
                          items={[
                            {
                              label: cupon.activo ? 'Desactivar' : 'Activar',
                              icon: cupon.activo ? <ToggleLeft size={14} /> : <ToggleRight size={14} />,
                              onClick: () => handleToggle(cupon),
                              disabled: expired || exhausted,
                            },
                            {
                              label: 'Copiar código',
                              icon: <Copy size={14} />,
                              onClick: () => handleCopy(cupon),
                            },
                            {
                              label: 'Eliminar',
                              icon: <Trash2 size={14} />,
                              onClick: () => setConfirmDelete(cupon),
                              variant: 'danger',
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal crear cupón */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nuevo cupón"
        footer={
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="cupon-form" size="sm" loading={loading}>
              Crear cupón
            </Button>
          </div>
        }
      >
        <form id="cupon-form" onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
              Código del cupón *
            </label>
            <div className="flex gap-2">
              <input
                required
                value={form.codigo}
                onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase() })}
                placeholder="Ej: CORTE20, AGOSTO10"
                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary font-mono uppercase"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setForm({ ...form, codigo: generateCode() })}
              >
                Generar
              </Button>
            </div>
            <p className="text-xs text-text-muted mt-1">El cliente escribe este código al reservar. Ej: CORTE20, BIENVENIDO</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                Tipo de descuento *
              </label>
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              >
                <option value="porcentaje">Porcentaje (%)</option>
                <option value="monto_fijo">Monto fijo ($)</option>
              </select>
              <p className="text-xs text-text-muted mt-1">
                {form.tipo === 'porcentaje' ? 'Ej: 20 = 20% de descuento' : 'Ej: 10000 = $10.000 menos'}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                Valor *
              </label>
              {form.tipo === 'monto_fijo' ? (
                <MoneyInput
                  required
                  value={form.valor ? Number(form.valor) : undefined}
                  onChange={v => setForm({ ...form, valor: String(v) })}
                  placeholder="10.000"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
                />
              ) : (
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={form.valor}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  placeholder="20"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                Usos máximos
              </label>
              <input
                type="number"
                min="0"
                value={form.usos_maximos}
                onChange={(e) => setForm({ ...form, usos_maximos: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-1">0 = sin límite de usos</p>
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                Fecha de vencimiento
              </label>
              <input
                type="date"
                value={form.fecha_vencimiento}
                onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-1">Dejar vacío = no expira</p>
            </div>
          </div>

        </form>
      </Modal>

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title={`¿Eliminar cupón ${confirmDelete?.codigo}?`}
        description="El cupón dejará de funcionar y no podrá ser recuperado. Los usos ya registrados no se ven afectados."
        confirmLabel="Eliminar cupón"
        loading={loading}
      />
    </>
  )
}
