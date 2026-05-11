import React from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

interface AppointmentRowProps {
  appointment: {
    id: string
    time: string
    clientName: string
    service: string
    barberName?: string
    status: 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show'
    price?: number
  }
  className?: string
  onClick?: () => void
}

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmada', variant: 'success'  as const },
  pending:   { label: 'Pendiente',  variant: 'warning'  as const },
  completed: { label: 'Completada', variant: 'neutral'  as const },
  cancelled: { label: 'Cancelada',  variant: 'danger'   as const },
  no_show:   { label: 'No apareció', variant: 'danger'  as const },
}

const STATUS_BAR: Record<string, string> = {
  confirmed: 'bg-success',
  pending:   'bg-warning',
  completed: 'bg-border-strong',
  cancelled: 'bg-danger',
  no_show:   'bg-danger',
}

export function AppointmentRow({ appointment, className, onClick }: AppointmentRowProps) {
  const status = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.pending

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-background-2 border border-border',
        'hover:border-border-strong transition-all duration-150',
        'group',
        appointment.status === 'completed' && 'opacity-60',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {/* Time */}
      <div className="flex-shrink-0 w-12 text-center">
        <p className="text-xs font-mono font-semibold text-text-primary">
          {appointment.time}
        </p>
      </div>

      {/* Status bar */}
      <div className={cn('w-0.5 h-8 rounded-full flex-shrink-0', STATUS_BAR[appointment.status] ?? 'bg-border')} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {appointment.clientName}
        </p>
        <p className="text-xs text-text-muted truncate">
          {appointment.service}
          {appointment.barberName ? ` · ${appointment.barberName}` : ''}
        </p>
      </div>

      {/* Price */}
      {appointment.price !== undefined && (
        <p className="text-xs font-mono text-text-secondary flex-shrink-0 hidden sm:block">
          ${appointment.price.toLocaleString()}
        </p>
      )}

      {/* Badge */}
      <Badge variant={status.variant} className="flex-shrink-0 hidden sm:inline-flex">
        {status.label}
      </Badge>
    </div>
  )
}
