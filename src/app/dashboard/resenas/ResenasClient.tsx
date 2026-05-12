'use client'

import { useState } from 'react'
import { Star, ToggleLeft, ToggleRight, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { toggleMostrarEnPagina, deleteResena, marcarLeida, type Resena } from '@/app/actions/resenas'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const FILTERS = [
  { label: 'Todas', value: 'todas' },
  { label: '5 estrellas', value: '5' },
  { label: '4 estrellas', value: '4' },
  { label: '3 o menos', value: 'bajas' },
]

interface ResenasClientProps {
  resenas: Resena[]
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={13}
          className={s <= value ? 'fill-warning text-warning' : 'text-border-strong fill-border-strong'}
        />
      ))}
    </div>
  )
}

export function ResenasClient({ resenas }: ResenasClientProps) {
  const [filter, setFilter] = useState('todas')
  const [confirmDelete, setConfirmDelete] = useState<Resena | null>(null)
  const [loading, setLoading] = useState(false)

  const filtered = resenas.filter((r) => {
    if (filter === 'todas') return true
    if (filter === 'bajas') return r.calificacion <= 3
    return r.calificacion === Number(filter)
  })

  const promedio =
    resenas.length > 0
      ? (resenas.reduce((a, r) => a + r.calificacion, 0) / resenas.length).toFixed(1)
      : null

  const handleTogglePublico = async (resena: Resena) => {
    if (resena.calificacion < 4 && !resena.mostrar_en_pagina) {
      toast.error('Solo reseñas de 4 y 5 estrellas pueden mostrarse públicamente')
      return
    }
    const result = await toggleMostrarEnPagina(resena.id, !resena.mostrar_en_pagina)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(
        resena.mostrar_en_pagina
          ? 'Reseña ocultada de tu página'
          : `La reseña de ${resena.cliente_nombre} ya aparece en tu página`,
      )
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setLoading(true)
    const result = await deleteResena(confirmDelete.id)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Reseña eliminada')
      setConfirmDelete(null)
    }
  }

  const handleMarkRead = async (resena: Resena) => {
    if (resena.leida) return
    await marcarLeida(resena.id)
  }

  return (
    <>
      <PageHeader
        title="Reseñas"
        description="Opiniones de tus clientes"
        count={resenas.length}
      />

      {resenas.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-xl">
          <EmptyState
            icon={<Star size={40} className="text-warning/40" />}
            title="Las reseñas traen más clientes"
            description="Después de cada cita puedes pedirle a tu cliente una reseña. Las buenas aparecen en tu página pública. Las malas solo las ves tú."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8 pb-8">
            {[
              { icon: '📣', title: 'Más visibilidad', desc: 'Las reseñas 4★ y 5★ aparecen en tu página de reservas' },
              { icon: '🔒', title: 'Control total', desc: 'Tú decides qué reseñas se muestran públicamente' },
              { icon: '💬', title: 'Aprende qué mejorar', desc: 'Las reseñas bajas son privadas para que las leas tú' },
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
          <div className="px-8 pb-8">
            <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
              <AlertCircle size={18} className="text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary">
                Las reseñas se piden desde una cita completada. Ve a{' '}
                <Link href="/dashboard/agenda" className="text-primary font-semibold hover:underline">
                  tu agenda
                </Link>{' '}
                , abre una cita terminada y usa el botón &quot;Pedir reseña&quot;.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Stats bar */}
          <div className="flex flex-wrap items-center gap-4 p-4 bg-background-secondary border border-border rounded-xl">
            <div className="flex items-center gap-2">
              <Star size={18} className="fill-warning text-warning" />
              <span className="text-xl font-black text-text-primary">{promedio}</span>
              <span className="text-sm text-text-muted">promedio</span>
            </div>
            <div className="h-5 w-px bg-border hidden md:block" />
            <div className="text-sm text-text-muted">
              <span className="font-semibold text-text-primary">{resenas.filter((r) => r.calificacion >= 4).length}</span>{' '}
              positivas ·{' '}
              <span className="font-semibold text-text-primary">{resenas.filter((r) => r.mostrar_en_pagina).length}</span>{' '}
              en tu página pública
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  filter === f.value
                    ? 'bg-primary text-white'
                    : 'bg-background-secondary border border-border text-text-secondary hover:bg-background-tertiary',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <p className="text-sm text-text-muted text-center py-8">No hay reseñas con este filtro.</p>
            )}
            {filtered.map((resena) => (
              <div
                key={resena.id}
                onClick={() => handleMarkRead(resena)}
                className={cn(
                  'bg-background-secondary border border-border rounded-xl p-4 transition-all',
                  !resena.leida && 'border-primary/30 bg-primary/2',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-text-primary">{resena.cliente_nombre}</span>
                      {!resena.leida && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full">
                          Nueva
                        </span>
                      )}
                      {resena.barbers && (
                        <span className="text-xs text-text-muted">· {resena.barbers.name}</span>
                      )}
                    </div>
                    <StarRating value={resena.calificacion} />
                    {resena.comentario && (
                      <p className="text-sm text-text-secondary mt-2 leading-relaxed">&ldquo;{resena.comentario}&rdquo;</p>
                    )}
                    <p className="text-xs text-text-muted mt-2">
                      {new Date(resena.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle mostrar en página */}
                    {resena.calificacion >= 4 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleTogglePublico(resena) }}
                        title={resena.mostrar_en_pagina ? 'Ocultar de tu página' : 'Mostrar en tu página'}
                        className="text-text-muted hover:text-primary transition-colors"
                      >
                        {resena.mostrar_en_pagina
                          ? <ToggleRight size={22} className="text-success" />
                          : <ToggleLeft size={22} />}
                      </button>
                    )}
                    {resena.calificacion < 4 && (
                      <span title="Solo reseñas de 4★ y 5★ pueden mostrarse públicamente" className="text-text-muted/40">
                        <EyeOff size={16} />
                      </span>
                    )}
                    <ActionMenu
                      items={[
                        resena.calificacion >= 4
                          ? {
                              label: resena.mostrar_en_pagina ? 'Ocultar de mi página' : 'Mostrar en mi página',
                              icon: resena.mostrar_en_pagina ? <EyeOff size={14} /> : <Eye size={14} />,
                              onClick: () => handleTogglePublico(resena),
                            }
                          : {
                              label: 'Solo 4★-5★ van públicas',
                              icon: <EyeOff size={14} />,
                              onClick: () => {},
                              disabled: true,
                            },
                        {
                          label: 'Eliminar',
                          icon: <Trash2 size={14} />,
                          onClick: () => setConfirmDelete(resena),
                          variant: 'danger',
                        },
                      ]}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title={`¿Eliminar la reseña de ${confirmDelete?.cliente_nombre}?`}
        description="Esta reseña se eliminará permanentemente. Si estaba visible en tu página pública, dejará de aparecer."
        confirmLabel="Eliminar reseña"
        loading={loading}
      />
    </>
  )
}
