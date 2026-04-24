"use client";

import React, { useTransition } from 'react';
import { Plus, Trash2, UserCheck } from 'lucide-react';
import { Card, Input, Button, Avatar, Badge } from '@/components/ui/RedesignComponents';
import { createBarber, deleteBarber } from '@/app/actions/barbers';
import toast from 'react-hot-toast';

export default function BarberosClient({ initialBarberos }: { initialBarberos: any[] }) {
  const [isPending, startTransition] = useTransition();

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await createBarber(formData);
      if (result.success) {
        toast.success('Barbero añadido correctamente');
        form.reset();
      } else {
        toast.error(result.error || 'Error al añadir barbero');
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar a este barbero?')) return;
    
    startTransition(async () => {
      const result = await deleteBarber(id);
      if (result.success) {
        toast.success('Barbero eliminado');
      } else {
        toast.error(result.error || 'Error al eliminar');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
      {/* Formulario de registro */}
      <div className="lg:col-span-2">
        <Card className="bg-background-secondary/30 border-dashed sticky top-8">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
            <Plus size={16} /> Registrar nuevo barbero
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre Completo</label>
              <Input name="nombre" placeholder="Ej. Marlon Brando" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Teléfono (opcional)</label>
              <Input name="telefono" placeholder="+57 300..." />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Guardando...' : <><Plus size={18} /> Añadir al Equipo</>}
            </Button>
          </form>
        </Card>
      </div>

      {/* Lista de Barberos */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Personal Activo</h2>
          <Badge variant="success">{initialBarberos.length} Miembros</Badge>
        </div>

        <div className="space-y-3">
          {initialBarberos.length === 0 && (
            <div className="py-20 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
               <UserCheck size={32} className="text-text-tertiary mb-3 opacity-20" />
               <p className="text-sm text-text-secondary">No hay miembros registrados aún.</p>
            </div>
          )}
          {initialBarberos.map((b: any) => (
            <Card key={b.id} className="group hover:border-border-strong transition-all overflow-hidden relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar initials={getInitials(b.name)} className="w-12 h-12 bg-accent-muted text-accent" />
                  <div>
                    <p className="text-base font-semibold text-text-primary">{b.name}</p>
                    <p className="text-xs text-text-tertiary">Barbero Profesional · Activo</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleDelete(b.id)}
                    className="p-2 text-text-tertiary hover:text-danger hover:bg-danger-bg rounded-xl transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
