'use client'

import { useState } from 'react'
import {
  Gift, ToggleLeft, ToggleRight, Copy, Check, MessageCircle,
  Users, ChevronDown, ChevronUp, Info,
} from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  upsertReferralProgram, applyCredit,
  type ReferralProgram, type ReferralActivity, type TopReferrer, type PendingCredit,
} from '@/app/actions/referidos'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(n)

interface Props {
  program: ReferralProgram | null
  activity: ReferralActivity[]
  topReferrers: TopReferrer[]
  pendingCredits: PendingCredit[]
  stats: { total: number; totalBeneficios: number; clientesActivos: number; creditosPendientes: number }
  barbershopName: string
}

const TABS = [
  { id: 'actividad', label: 'Actividad' },
  { id: 'top', label: 'Top referidores' },
  { id: 'creditos', label: 'Créditos pendientes' },
] as const
type Tab = typeof TABS[number]['id']

export function ReferidosClient({ program, activity, topReferrers, pendingCredits, stats, barbershopName }: Props) {
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('actividad')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [applyingId, setApplyingId] = useState<string | null>(null)

  const [form, setForm] = useState<{
    activo: boolean
    tipo_beneficio: 'porcentaje' | 'monto'
    valor_beneficio: string
    descripcion: string
    mensaje_personalizado: string
  }>({
    activo: program?.activo ?? false,
    tipo_beneficio: program?.tipo_beneficio ?? 'porcentaje',
    valor_beneficio: program?.valor_beneficio?.toString() ?? '20',
    descripcion: program?.descripcion ?? '',
    mensaje_personalizado: program?.mensaje_personalizado ?? '',
  })

  const previewBeneficio =
    form.tipo_beneficio === 'porcentaje'
      ? `${form.valor_beneficio}% de descuento`
      : `${COP(Number(form.valor_beneficio) || 0)} de descuento`

  const handleSave = async () => {
    setLoading(true)
    const fd = new FormData()
    fd.append('activo', form.activo.toString())
    fd.append('tipo_beneficio', form.tipo_beneficio)
    fd.append('valor_beneficio', form.valor_beneficio)
    fd.append('descripcion', form.descripcion)
    fd.append('mensaje_personalizado', form.mensaje_personalizado)
    const result = await upsertReferralProgram(fd)
    setLoading(false)
    if (result.error) toast.error(result.error)
    else toast.success(form.activo ? 'Programa de referidos activado' : 'Cambios guardados')
  }

  const copyCode = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success(`Código ${code} copiado`)
  }

  const sendWhatsApp = (phone: string | null, nombre: string, code: string) => {
    if (!phone) return
    const msg = `Hola ${nombre} 👋 Tu código de referidos de ${barbershopName} es: *${code}*. Compártelo con tus amigos y gana ${previewBeneficio} en tu próxima visita 🎉`
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const handleApplyCredit = async (uso: ReferralActivity) => {
    if (!uso.cliente_que_refirio) return
    setApplyingId(uso.id)
    const result = await applyCredit(uso.id, uso.cliente_que_refirio, uso.credito_otorgado)
    setApplyingId(null)
    if (result.error) toast.error(result.error)
    else toast.success(`Crédito de ${COP(uso.credito_otorgado)} aplicado a ${uso.nombre_referidor}`)
  }

  return (
    <>
      <PageHeader
        title="Referidos"
        description="Tus clientes traen más clientes"
        badge={form.activo ? 'Activo' : undefined}
      />

      {/* ── Configuración ── */}
      <div className="bg-background-secondary border border-border rounded-xl p-5 mb-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-text-primary">Programa de referidos</p>
            <p className="text-xs text-text-muted mt-0.5">
              {form.activo
                ? 'Activo — tus clientes ya pueden compartir su código'
                : 'Inactivo — los clientes no tienen código activo'}
            </p>
          </div>
          <button type="button" onClick={() => setForm((f) => ({ ...f, activo: !f.activo }))}>
            {form.activo
              ? <ToggleRight size={30} className="text-success" />
              : <ToggleLeft size={30} className="text-text-muted" />}
          </button>
        </div>

        {form.activo && (
          <div className="space-y-4 pt-2 border-t border-border">
            {/* Tipo de beneficio — radio cards */}
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-2">
                Tipo de beneficio
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: 'porcentaje', label: '% Porcentaje', icon: '%', desc: `Ej: 20% → el cliente paga menos en su próxima visita` },
                  { value: 'monto', label: '$ Monto fijo', icon: '$', desc: `Ej: $10.000 menos en su próxima visita` },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, tipo_beneficio: opt.value }))}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                      form.tipo_beneficio === opt.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border hover:border-primary/40',
                    )}
                  >
                    <span className="text-2xl font-black text-primary w-8 text-center flex-shrink-0">{opt.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{opt.label}</p>
                      <p className="text-xs text-text-muted mt-0.5">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Valor del beneficio
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-text-muted font-bold">
                    {form.tipo_beneficio === 'porcentaje' ? '%' : '$'}
                  </span>
                  <input
                    type="number"
                    min="1"
                    max={form.tipo_beneficio === 'porcentaje' ? '50' : undefined}
                    value={form.valor_beneficio}
                    onChange={(e) => setForm({ ...form, valor_beneficio: e.target.value })}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
                  />
                </div>
                <p className="text-xs text-primary mt-1 font-medium">{previewBeneficio}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                  Descripción (opcional)
                </label>
                <input
                  type="text"
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Ej: Gana por cada amigo que traigas"
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
                Mensaje al cliente cuando alguien usa su código
              </label>
              <textarea
                rows={3}
                value={form.mensaje_personalizado}
                onChange={(e) => setForm({ ...form, mensaje_personalizado: e.target.value })}
                placeholder={`Hola [nombre]! Alguien usó tu código [codigo] en ${barbershopName}. Tienes [beneficio] esperándote 🎉`}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary resize-none"
              />
              <p className="text-xs text-text-muted mt-1">Variables: [nombre] [codigo] [beneficio]</p>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button size="sm" onClick={handleSave} loading={loading}>Guardar cambios</Button>
        </div>
      </div>

      {/* ── Stats (solo si activo) ── */}
      {form.activo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Referidos este mes', value: stats.total.toString() },
            { label: 'Total beneficios otorgados', value: COP(stats.totalBeneficios) },
            { label: 'Clientes que refirieron', value: stats.clientesActivos.toString() },
            { label: 'Créditos pendientes', value: COP(stats.creditosPendientes) },
          ].map((s) => (
            <div key={s.label} className="bg-background-secondary border border-border rounded-xl p-4">
              <p className="text-lg font-black text-text-primary">{s.value}</p>
              <p className="text-[11px] text-text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Activity tabs ── */}
      <div className="bg-background-secondary border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 px-4 py-3 text-xs font-bold transition-colors',
                tab === t.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ACTIVIDAD */}
        {tab === 'actividad' && (
          activity.length === 0 ? (
            <EmptyState
              icon={<Gift size={36} className="text-primary/30" />}
              title="Sin actividad todavía"
              description="Cuando alguien use el código de referido de otro cliente, aparecerá aquí."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-tertiary/50 border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Quien refirió</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Nuevo cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Beneficio</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {activity.map((u) => (
                    <tr key={u.id} className="hover:bg-background-tertiary/30">
                      <td className="px-4 py-3 text-xs text-text-muted">
                        {new Date(u.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 font-medium text-text-primary">{u.nombre_referidor ?? '—'}</td>
                      <td className="px-4 py-3 text-text-secondary">{u.nombre_referido ?? '—'}</td>
                      <td className="px-4 py-3 text-text-primary">{COP(u.credito_otorgado)}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          'px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide',
                          u.estado === 'aplicado' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
                        )}>
                          {u.estado === 'aplicado' ? 'Aplicado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.estado === 'pendiente' && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleApplyCredit(u)}
                            loading={applyingId === u.id}
                          >
                            Aplicar crédito
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* TOP REFERIDORES */}
        {tab === 'top' && (
          topReferrers.length === 0 ? (
            <EmptyState
              icon={<Users size={36} className="text-primary/30" />}
              title="Sin referidores todavía"
              description="Aquí aparecerán los clientes que más referidos han traído."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-tertiary/50 border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Código</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Referidos</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Crédito acum.</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Disponible</th>
                    <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topReferrers.map((c) => (
                    <tr key={c.id} className="hover:bg-background-tertiary/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {c.name.charAt(0)}
                          </div>
                          <span className="font-medium text-text-primary">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-text-primary bg-background-tertiary px-2 py-0.5 rounded">
                            {c.referral_code}
                          </span>
                          <button type="button" onClick={() => c.referral_code && copyCode(c.referral_code, c.id)}>
                            {copiedId === c.id ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-text-muted hover:text-primary" />}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-primary font-semibold">{c.total_referidos}</td>
                      <td className="px-4 py-3 text-text-primary">{COP(c.credito_acumulado)}</td>
                      <td className="px-4 py-3 text-success font-semibold">
                        {COP(Math.max(0, c.credito_acumulado - c.credito_usado))}
                      </td>
                      <td className="px-4 py-3">
                        {c.phone && (
                          <button
                            type="button"
                            onClick={() => sendWhatsApp(c.phone, c.name, c.referral_code ?? '')}
                            title="Enviar por WhatsApp"
                            className="flex items-center gap-1 text-xs text-success hover:underline"
                          >
                            <MessageCircle size={13} />
                            WhatsApp
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* CRÉDITOS PENDIENTES */}
        {tab === 'creditos' && (
          pendingCredits.length === 0 ? (
            <EmptyState
              icon={<Gift size={36} className="text-primary/30" />}
              title="Sin créditos pendientes"
              description="Cuando un cliente acumule crédito y no lo haya usado, aparecerá aquí."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-background-tertiary/50 border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Crédito disponible</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-text-muted uppercase">Última visita</th>
                    <th className="px-4 py-3 text-xs font-bold text-text-muted uppercase">Recordar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pendingCredits.map((c) => (
                    <tr key={c.id} className="hover:bg-background-tertiary/30">
                      <td className="px-4 py-3 font-medium text-text-primary">{c.name}</td>
                      <td className="px-4 py-3 text-success font-bold">{COP(c.credito_disponible)}</td>
                      <td className="px-4 py-3 text-xs text-text-muted">
                        {c.last_visit
                          ? new Date(c.last_visit).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {c.phone && (
                          <button
                            type="button"
                            onClick={() => {
                              const msg = `Hola ${c.name} 👋 Tienes ${COP(c.credito_disponible)} de crédito disponible en ${barbershopName}. ¡Úsalo en tu próxima visita! 🎉`
                              window.open(`https://wa.me/${c.phone!.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank')
                            }}
                            className="flex items-center gap-1 text-xs text-success hover:underline"
                          >
                            <MessageCircle size={13} />
                            Recordar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </>
  )
}
