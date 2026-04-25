"use client"

import React, { useTransition } from "react"
import { Calendar, Clock, Scissors, User2, MapPin, Phone, Trash2, CheckCircle2, XCircle, UserCircle, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointments"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Props {
  appointment: any
  onClose: () => void
  onEdit: () => void
}

export function AppointmentDetails({ appointment, onClose, onEdit }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleStatusChange = (status: string) => {
    startTransition(async () => {
      const res = await updateAppointmentStatus(appointment.id, status)
      if (res.success) {
        toast.success(`Cita marcada como ${status === 'completed' ? 'completada' : 'cancelada'}`)
        router.refresh()
        onClose()
      } else {
        toast.error("Error al actualizar estado")
      }
    })
  }

  const handleDelete = () => {
    if (!confirm("¿Seguro que quieres eliminar esta cita permanentemente?")) return
    startTransition(async () => {
      const res = await deleteAppointment(appointment.id)
      if (res.success) {
        toast.success("Cita eliminada")
        router.refresh()
        onClose()
      } else {
        toast.error("Error al eliminar")
      }
    })
  }

  const date = new Date(appointment.scheduled_at)
  const dateFormatted = date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeFormatted = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Profile */}
      <div className="flex flex-col items-center text-center gap-4">
        <Avatar initials={appointment.client?.name?.substring(0, 2).toUpperCase()} className="w-20 h-20 text-2xl" />
        <div>
          <h2 className="text-xl font-bold text-text-primary">{appointment.client?.name}</h2>
          <div className="flex items-center gap-2 mt-1 justify-center">
            {appointment.client?.phone && (
              <span className="text-sm text-text-tertiary flex items-center gap-1">
                <Phone size={12} /> {appointment.client.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-background-tertiary rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-tertiary uppercase">Fecha y Hora</p>
            <p className="text-sm font-semibold text-text-primary">{dateFormatted} · {timeFormatted}</p>
          </div>
        </div>

        <div className="p-4 bg-background-tertiary rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Scissors size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-tertiary uppercase">Servicio</p>
            <p className="text-sm font-semibold text-text-primary">{appointment.service?.name}</p>
          </div>
        </div>

        <div className="p-4 bg-background-tertiary rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <User2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-tertiary uppercase">Atendido por</p>
            <p className="text-sm font-semibold text-text-primary">{appointment.barber?.name}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 pt-4">
        {appointment.status === 'confirmed' && (
          <>
            <Button className="w-full h-12 bg-success hover:bg-success/90 text-background-primary" onClick={() => handleStatusChange('completed')} disabled={isPending}>
              <CheckCircle2 size={18} /> Marcar como completada
            </Button>
            <Button variant="secondary" className="w-full h-12 text-danger hover:bg-danger/10 hover:text-danger border-danger/10" onClick={() => handleStatusChange('cancelled')} disabled={isPending}>
              <XCircle size={18} /> Cancelar cita
            </Button>
          </>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button variant="secondary" className="h-12" onClick={onEdit} disabled={isPending}>
            <Edit3 size={16} /> Editar
          </Button>
          <Button variant="secondary" className="h-12 text-danger border-danger/10" onClick={handleDelete} disabled={isPending}>
            <Trash2 size={16} /> Eliminar
          </Button>
        </div>

        <Link href={`/dashboard/clientes/${appointment.client_id}`} className="block">
          <Button variant="secondary" className="w-full h-12">
            <UserCircle size={18} /> Ver perfil del cliente
          </Button>
        </Link>
      </div>
    </div>
  )
}
