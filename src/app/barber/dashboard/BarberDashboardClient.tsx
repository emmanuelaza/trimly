"use client";

import React, { useTransition } from 'react';
import { 
  StatCard, 
  Card, 
  Button, 
  Badge, 
  Avatar 
} from '@/components/ui/RedesignComponents';
import { 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  MapPin
} from 'lucide-react';
import { completeAppointment } from '@/app/actions/barber-dashboard';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BarberDashboardClient({ initialData }: any) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleComplete = async (id: string) => {
    startTransition(async () => {
      const result = await completeAppointment(id);
      if (result.success) {
        toast.success('Cita completada');
        router.refresh();
      } else {
        toast.error('Error al completar');
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Citas Hoy" 
          value={initialData.stats.appointmentsToday} 
          icon={Calendar} 
          color="accent"
        />
        <StatCard 
          label="Ganancia Hoy" 
          value={`$${initialData.stats.earningsToday.toLocaleString()}`} 
          icon={DollarSign} 
          color="accent"
        />
        <StatCard 
          label="Ganancia Este Mes" 
          value={`$${initialData.stats.earningsMonth.toLocaleString()}`} 
          icon={TrendingUp} 
          color="success"
        />
      </div>

      {/* Next Appointments */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Clock size={20} className="text-accent" />
          Próximas citas del día
        </h2>

        <div className="space-y-3">
          {initialData.todayAppointments.length === 0 && (
            <Card className="py-12 border-dashed flex flex-col items-center justify-center text-center opacity-60">
              <Calendar size={40} className="mb-4 text-text-tertiary" />
              <p className="text-sm font-medium text-text-secondary">No tienes citas programadas para hoy.</p>
            </Card>
          )}

          {initialData.todayAppointments.map((app: any) => (
            <Card key={app.id} className="hover:border-border-strong transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-background-tertiary rounded-2xl flex flex-col items-center justify-center border border-border">
                    <span className="text-xs font-black text-accent uppercase">
                      {new Date(app.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                  <div>
                    <p className="text-base font-bold text-text-primary">{app.client_name || 'Cliente'}</p>
                    <p className="text-xs text-text-tertiary flex items-center gap-1">
                      {app.service_name || 'Servicio'} · {app.duration || 30} min
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border/50">
                  {app.status === 'completed' ? (
                    <Badge variant="success" className="gap-1.5 py-1.5 px-3">
                      <CheckCircle2 size={14} /> Completada
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Badge variant="warning" className="gap-1.5 py-1.5 px-3">
                        <Clock size={14} /> {app.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                      </Badge>
                      <Button 
                        size="sm" 
                        className="bg-accent hover:bg-accent/90 text-[11px] h-9"
                        onClick={() => handleComplete(app.id)}
                        disabled={isPending}
                      >
                        Marcar Completada
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
