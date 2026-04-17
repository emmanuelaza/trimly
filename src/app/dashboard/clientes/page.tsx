import { Plus } from 'lucide-react';
import ClientesList from './ClientesList';

export const revalidate = 60;

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Clientes y Retención</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Nuevo Cliente Rápido</h2>
        <form action={createCliente} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="input-label" htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" type="text" className="input-field" placeholder="Ej. Juan Pérez" required />
          </div>
          <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="input-label" htmlFor="telefono">WhatsApp</label>
            <input id="telefono" name="telefono" type="text" className="input-field" placeholder="+57 300 000 0000" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 1.5rem', flex: '0 0 auto' }}>
            <Plus size={20} /> Guardar
          </button>
        </form>
      </div>

      <ClientesList clientes={clientes} />
    </div>
  );
}
