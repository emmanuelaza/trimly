"use client";

import React, { useTransition } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { createAppointment } from '@/app/actions/appointments';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export function QuickAddAppointment({ clientes, servicios, filterDate }: { clientes: any[], servicios: any[], filterDate: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await createAppointment(formData);
      if (result.success) {
        toast.success("Cita guardada correctamente");
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error || "Error al guardar cita");
      }
    });
  };

  return (
    <Card className="bg-background-secondary/30 border-dashed">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
        <Plus size={16} /> Agendar rápido
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Cliente</label>
          <Select name="client_id" required>
            <option value="">Seleccionar...</option>
            {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Servicio</label>
          <Select name="service_id" required>
            <option value="">Servicio...</option>
            {servicios.map((s: any) => <option key={s.id} value={s.id}>{s.name} (${Number(s.price).toLocaleString()})</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Fecha</label>
          <Input name="fecha" type="date" defaultValue={filterDate} required />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Hora</label>
          <Input name="hora" type="time" required />
        </div>
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Guardando..." : <><Plus size={18} /> Guardar</>}
        </Button>
      </form>
    </Card>
  );
}
