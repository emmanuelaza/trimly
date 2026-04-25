"use client";

import React, { useState, useTransition } from 'react';
import { Plus, UserPlus, Search, ChevronRight } from 'lucide-react';
import { Card, Input, Button, Avatar, Badge } from '@/components/ui/RedesignComponents';
import { createClient, deleteClient } from '@/app/actions/clients';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ClientesClient({ initialClientes }: { initialClientes: any[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredClientes = initialClientes.filter((c: any) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const form = e.currentTarget;

    startTransition(async () => {
      const result = await createClient(formData);
      if (result.success) {
        toast.success('Cliente creado correctamente');
        form.reset();
        router.refresh();
      } else {
        toast.error(result.error || 'Error al crear cliente');
      }
    });
  };

  const getInitials = (n: string) => n ? n.substring(0, 2).toUpperCase() : "C";

  return (
    <div className="space-y-10">
      {/* Search and Quick Add */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-background-secondary/30 border-dashed">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
            <UserPlus size={16} /> Registro Rápido
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre Completo</label>
              <Input name="nombre" placeholder="Ej. Juan Pérez" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">WhatsApp / Teléfono</label>
              <Input name="telefono" placeholder="+57 300..." />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Email (Opcional)</label>
              <Input name="email" type="email" placeholder="hola@ejemplo.com" />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'Guardando...' : <><Plus size={18} /> Guardar Cliente</>}
            </Button>
          </form>
        </Card>

        <Card className="bg-background-secondary/10 flex flex-col justify-center px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <Input 
              type="text"
              placeholder="Filtrar lista..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredClientes.length === 0 ? (
          <div className="py-20 border border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center">
            <p className="text-sm text-text-tertiary">No hay clientes registrados.</p>
          </div>
        ) : (
          filteredClientes.map((c: any) => (
            <Link key={c.id} href={`/dashboard/clientes/${c.id}`} className="group block">
              <Card className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-border-strong transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar initials={getInitials(c.name)} />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{c.name}</p>
                    <p className="text-xs text-text-tertiary mt-0.5">{c.phone || "Sin teléfono"}</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-text-tertiary group-hover:text-text-primary transition-colors" />
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
