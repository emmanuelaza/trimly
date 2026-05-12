'use client'

import { useState } from 'react'
import { Gift, ToggleLeft, ToggleRight, Users, CheckCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { upsertReferralProgram, type ReferralProgram, type ReferralUse } from '@/app/actions/referidos'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface ReferidosClientProps {
  program: ReferralProgram | null
  uses: ReferralUse[]
}

export function ReferidosClient({ program, uses }: ReferidosClientProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<{
    activo: boolean
    tipo_beneficio: 'porcentaje' | 'monto_fijo'
    valor_beneficio: string
    descripcion: string
  }>({
    activo: program?.activo ?? false,
    tipo_beneficio: program?.tipo_beneficio ?? 'porcentaje',
    valor_beneficio: program?.valor_beneficio?.toString() ?? '10',
    descripcion: program?.descripcion ?? '',
  })

  const handleSave = async () => {
    setLoading(true)
    const fd = new FormData()
    fd.append('activo', form.activo.toString())
    fd.append('tipo_beneficio', form.tipo_beneficio)
    fd.append('valor_beneficio', form.valor_beneficio)
    fd.append('descripcion', form.descripcion)
    const result = await upsertReferralProgram(fd)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(form.activo ? 'Programa de referidos activado' : 'Cambios guardados')
    }
  }

  return (
    <>
      <PageHeader
        title="Referidos"
        description="Tus clientes traen más clientes"
        badge={form.activo ? 'Activo' : undefined}
      />

      {!program && uses.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-xl">
          <EmptyState
            icon={<Gift size={40} className="text-primary/40" />}
            title="Tus clientes traen más clientes"
            description="Activa el programa de referidos y cada cliente tendrá un código único para compartir. Cuando alguien reserve con su código, el cliente gana un beneficio."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 pb-6">
            {[
              { icon: '📲', title: 'Sin esfuerzo', desc: 'El cliente comparte su código con amigos' },
              { icon: '💰', title: 'Define el premio', desc: 'Descuento o monto fijo por cada referido' },
              { icon: '📊', title: 'Mide el resultado', desc: 'Ve cuántos referidos llegaron y se convirtieron' },
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
      ) : null}

      {/* Config card */}
      <div className="bg-background-secondary border border-border rounded-xl p-5 mt-4 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-text-primary">Programa de referidos</p>
            <p className="text-xs text-text-muted mt-0.5">
              {form.activo ? 'Activo — los clientes pueden compartir su código' : 'Inactivo — nadie ve el código de referidos'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))}
            className="transition-colors"
          >
            {form.activo
              ? <ToggleRight size={28} className="text-success" />
              : <ToggleLeft size={28} className="text-text-muted" />}
          </button>
        </div>

        {form.activo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-border">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                Tipo de beneficio
              </label>
              <select
                value={form.tipo_beneficio}
                onChange={(e) => setForm({ ...form, tipo_beneficio: e.target.value as 'porcentaje' | 'monto_fijo' })}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              >
                <option value="porcentaje">Porcentaje de descuento</option>
                <option value="monto_fijo">Monto fijo de descuento</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                Valor del beneficio
              </label>
              <input
                type="number"
                min="1"
                value={form.valor_beneficio}
                onChange={(e) => setForm({ ...form, valor_beneficio: e.target.value })}
                placeholder={form.tipo_beneficio === 'porcentaje' ? '10' : '10000'}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                {form.tipo_beneficio === 'porcentaje'
                  ? `El cliente que refirió recibe ${form.valor_beneficio}% de descuento`
                  : `El cliente que refirió recibe $${Number(form.valor_beneficio).toLocaleString('es-CO')} de descuento`}
              </p>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                Descripción del beneficio (opcional)
              </label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Ej: Por cada amigo que traigas, ganas 10% en tu próximo corte"
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} loading={loading}>
            Guardar cambios
          </Button>
        </div>
      </div>

      {/* Activity table */}
      <div className="mt-6">
        <h2 className="text-sm font-bold text-text-primary mb-3">Actividad de referidos</h2>
        {uses.length === 0 ? (
          <div className="bg-background-secondary border border-border rounded-xl flex flex-col items-center justify-center py-12 text-center">
            <Users size={32} className="text-text-muted/40 mb-3" />
            <p className="text-sm font-medium text-text-primary">Sin actividad todavía</p>
            <p className="text-xs text-text-muted mt-1 max-w-xs">
              Cuando un cliente use el código de referido de otro, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="bg-background-secondary border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background-tertiary/50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Quien refirió</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Nuevo cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase tracking-wider">Beneficio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {uses.map((u) => (
                  <tr key={u.id} className="hover:bg-background-tertiary/30">
                    <td className="px-4 py-3 font-medium text-text-primary">{u.referrer_nombre}</td>
                    <td className="px-4 py-3 text-text-secondary">{u.referred_nombre}</td>
                    <td className="px-4 py-3 text-text-muted text-xs">
                      {new Date(u.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {u.beneficio_aplicado
                        ? <span className="flex items-center gap-1 text-success text-xs font-semibold"><CheckCircle size={13} />Aplicado</span>
                        : <span className={cn('text-xs font-semibold', 'text-text-muted')}>Pendiente</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
