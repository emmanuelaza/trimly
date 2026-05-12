'use client'

import { useState } from 'react'
import { Building2, Plus, MapPin, Phone, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ActionMenu } from '@/components/ui/ActionMenu'
import { EmptyState } from '@/components/ui/EmptyState'
import { createSede, updateSede, deleteSede, type Sede } from '@/app/actions/sedes'
import toast from 'react-hot-toast'

interface SedesClientProps {
  sedes: Sede[]
}

const emptyForm = { nombre: '', direccion: '', telefono: '' }

export function SedesClient({ sedes }: SedesClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Sede | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Sede | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const openCreate = () => { setEditing(null); setForm(emptyForm); setIsModalOpen(true) }
  const openEdit = (s: Sede) => {
    setEditing(s)
    setForm({ nombre: s.nombre, direccion: s.direccion ?? '', telefono: s.telefono ?? '' })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))

    const result = editing ? await updateSede(editing.id, fd) : await createSede(fd)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(editing ? 'Sede actualizada' : `${form.nombre} agregada`)
      setIsModalOpen(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setLoading(true)
    const result = await deleteSede(confirmDelete.id)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Sede ${confirmDelete.nombre} eliminada`)
      setConfirmDelete(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Sedes"
        description="Gestiona todos tus locales desde un solo lugar"
        count={sedes.length}
        action={{ label: '+ Agregar sede', onClick: openCreate, icon: <Plus size={14} /> }}
      />

      {sedes.length === 0 ? (
        <div className="bg-background-secondary border border-border rounded-xl">
          <EmptyState
            icon={<Building2 size={40} className="text-primary/40" />}
            title="Gestiona varios locales desde un solo lugar"
            description="Si tienes más de una sede, agrégala aquí. Podrás ver los datos de cada una por separado y asignar barberos a cada local."
            action={{ label: '+ Agregar mi segunda sede', onClick: openCreate }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sedes.map((sede) => (
            <div key={sede.id} className="bg-background-secondary border border-border rounded-xl p-5 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-primary" />
                </div>
                <ActionMenu
                  items={[
                    { label: 'Editar', icon: <Pencil size={14} />, onClick: () => openEdit(sede) },
                    { label: 'Eliminar', icon: <Trash2 size={14} />, onClick: () => setConfirmDelete(sede), variant: 'danger' },
                  ]}
                />
              </div>
              <div>
                <p className="font-bold text-text-primary">{sede.nombre}</p>
                {sede.direccion && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin size={12} className="text-text-muted flex-shrink-0" />
                    <span className="text-xs text-text-muted">{sede.direccion}</span>
                  </div>
                )}
                {sede.telefono && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone size={12} className="text-text-muted flex-shrink-0" />
                    <span className="text-xs text-text-muted">{sede.telefono}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal create/edit */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Editar sede' : 'Nueva sede'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
              Nombre de la sede *
            </label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Local Centro, Sede Norte"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
              Dirección
            </label>
            <input
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Ej: Calle 72 #10-45, Bogotá"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
              Teléfono
            </label>
            <input
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              placeholder="Ej: +57 300 000 0000"
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button type="submit" size="sm" loading={loading}>{editing ? 'Guardar cambios' : 'Agregar sede'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title={`¿Eliminar la sede ${confirmDelete?.nombre}?`}
        description="Esta sede se eliminará. Los datos históricos de citas no se borrarán, pero la sede dejará de aparecer en el sistema."
        confirmLabel="Eliminar sede"
        loading={loading}
      />
    </>
  )
}
