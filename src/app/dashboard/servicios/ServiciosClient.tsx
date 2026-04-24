"use client";

import React, { useTransition } from 'react';
import { Plus, Trash2, Scissors } from 'lucide-react';
import { Card, Input, Button, Badge } from '@/components/ui/RedesignComponents';
import { createService, deleteService } from '@/app/actions/services';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ServiciosClient({ initialServices }: { initialServices: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await createService(formData);
      if (result.success) {
        toast.success('Servicio guardado correctamente');
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error || 'Error al guardar servicio');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    
    startTransition(async () => {
      const result = await deleteService(id);
      if (result.success) {
        toast.success('Servicio eliminado');
        router.refresh();
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    });
  };

  return (
    <div className="space-y-10">
      {/* New Service Form */}
      <Card className="bg-background-secondary/30 border-dashed">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
          <Plus size={16} /> Agregar nuevo servicio
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre del Servicio</label>
            <Input name="nombre" placeholder="Ej. Corte degradado + Barba" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Precio (COP)</label>
            <Input name="precio" type="number" placeholder="35000" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Duración (min)</label>
            <Input name="duracion" type="number" placeholder="30" required />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Guardando...' : <><Plus size={18} /> Guardar</>}
          </Button>
        </form>
      </Card>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialServices.length === 0 && (
          <div className="col-span-full py-12 border border-dashed border-border rounded-xl text-center">
            <p className="text-sm text-text-tertiary">No hay servicios registrados aún.</p>
          </div>
        )}
        {initialServices.map((s: any) => (
          <Card key={s.id} className="group hover:border-border-strong transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-lg bg-background-tertiary border border-border flex items-center justify-center text-text-secondary group-hover:text-accent group-hover:bg-accent-muted group-hover:border-accent/20 transition-all">
                <Scissors size={20} />
              </div>
              <button 
                onClick={() => handleDelete(s.id)}
                className="p-2 text-text-tertiary hover:text-danger hover:bg-danger-bg rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-text-primary mb-1">{s.name}</h3>
            <div className="flex items-center justify-between mt-auto">
               <p className="text-2xl font-bold text-text-primary font-mono">${Number(s.price).toLocaleString()}</p>
               <Badge variant="info">{s.duration_minutes} min</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
