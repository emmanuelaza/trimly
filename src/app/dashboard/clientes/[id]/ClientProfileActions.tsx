"use client";

import React, { useState, useTransition } from 'react';
import { Plus, Edit2, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { NewAppointmentModal } from '@/components/agenda/NewAppointmentModal';
import { updateClient } from '@/app/actions/clients';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

interface ClientProfileActionsProps {
  cliente: any;
  allClientes: any[];
  servicios: any[];
}

export default function ClientProfileActions({ cliente, allClientes, servicios }: ClientProfileActionsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleOpenNewAppointment = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('new', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateClient(cliente.id, formData);
      if (result.success) {
        toast.success("Cliente actualizado");
        setIsEditOpen(false);
        router.refresh();
      } else {
        toast.error(result.error || "Error al actualizar");
      }
    });
  };

  return (
    <>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
          <Edit2 size={16} /> Editar
        </Button>
        <Button onClick={handleOpenNewAppointment}>
          <Plus size={16} /> Nueva cita
        </Button>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Editar Cliente">
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre Completo</label>
            <Input name="nombre" defaultValue={cliente.name} required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Teléfono</label>
            <Input name="telefono" defaultValue={cliente.phone} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Email</label>
            <Input name="email" type="email" defaultValue={cliente.email} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Cumpleaños</label>
            <Input name="birthdate" type="date" defaultValue={cliente.birthdate || cliente.birthday} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : <><Save size={16} /> Guardar Cambios</>}
            </Button>
          </div>
        </form>
      </Modal>

      {/* New Appointment Modal */}
      <NewAppointmentModal 
        clientes={allClientes} 
        servicios={servicios} 
        initialClientId={cliente.id} 
      />
    </>
  );
}
