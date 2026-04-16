import { getServicios, createServicio, deleteServicio } from '@/app/actions/servicios';
import { Plus, Trash2 } from 'lucide-react';

export default async function ConfiguracionPage() {
  const servicios = await getServicios();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Servicios y Precios</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Agregar Nuevo Servicio</h2>
        <form action={createServicio} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: 2 }}>
            <label className="input-label" htmlFor="nombre">Nombre del Servicio</label>
            <input id="nombre" name="nombre" type="text" className="input-field" placeholder="Corte Especial" required />
          </div>
          <div className="input-group" style={{ marginBottom: 0, flex: 1 }}>
            <label className="input-label" htmlFor="precio">Precio ($)</label>
            <input id="precio" name="precio" type="number" step="0.01" className="input-field" placeholder="15.00" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem' }}>
            <Plus size={20} /> Guardar
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Servicios Activos</h2>
        {servicios.length === 0 ? <p className="text-gray">Aún no hay servicios configurados. Agrega uno arriba.</p> : null}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {servicios.map((s: any) => (
            <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.125rem' }}>{s.nombre}</strong>
                <span className="text-gray" style={{ fontWeight: 500 }}>${s.precio}</span>
              </div>
              <form action={async () => { "use server"; await deleteServicio(s.id); }}>
                <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--border)' }}>
                  <Trash2 size={18} />
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
