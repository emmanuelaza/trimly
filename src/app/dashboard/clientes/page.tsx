import { getClientes, createCliente } from '@/app/actions/clientes';
import { Plus, UserPlus } from 'lucide-react';
import ClientesList from './ClientesList';
import { Card, Input, Button } from '@/components/ui/RedesignComponents';

export const revalidate = 60;

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-text-primary">Directorio de Clientes</h1>
          <p className="text-sm text-text-tertiary mt-1">Gestiona tu base de datos y fidelización.</p>
        </div>
      </div>

      {/* Quick Add Section */}
      <Card className="bg-background-secondary/30 border-dashed">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
          <UserPlus size={16} /> Registro Rápido
        </h2>
        <form action={createCliente} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">Nombre Completo</label>
            <Input id="nombre" name="nombre" placeholder="Ej. Juan Pérez" required />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase ml-1">WhatsApp / Teléfono</label>
            <Input id="telefono" name="telefono" placeholder="+57 300 000 0000" />
          </div>
          <Button type="submit" className="w-full">
            <Plus size={18} /> Guardar Cliente
          </Button>
        </form>
      </Card>

      {/* Clientes List (Client Component) */}
      <ClientesList clientes={clientes} />
    </div>
  );
}
