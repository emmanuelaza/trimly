import { getServicios, createServicio, deleteServicio } from '@/app/actions/servicios';
import { Plus, Trash2 } from 'lucide-react';

export default async function ServiciosPage() {
  const servicios = await getServicios();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Servicios</h1>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Nuevo Servicio</h2>
        <form action={createServicio} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="input-label" htmlFor="nombre">Nombre del Servicio</label>
            <input id="nombre" name="nombre" type="text" className="input-field" placeholder="Ej. Corte de Cabello" required />
          </div>
          <div className="input-group" style={{ marginBottom: 0, flex: '1 1 120px' }}>
            <label className="input-label" htmlFor="precio">Precio ($)</label>
            <input id="precio" name="precio" type="number" step="0.01" className="input-field" placeholder="15.00" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 1.5rem', flex: '0 0 auto' }}>
            <Plus size={20} /> Guardar
          </button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#F9FAFB' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--secondary)', fontWeight: 600 }}>Servicio</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--secondary)', fontWeight: 600 }}>Precio</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--secondary)', fontWeight: 600 }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {servicios.map((s: any) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--foreground)' }}>{s.nombre}</div>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ color: 'var(--success)', fontWeight: 700 }}>${Number(s.precio).toFixed(2)}</div>
                </td>
                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <form action={async () => { "use server"; await deleteServicio(s.id); }}>
                    <button type="submit" className="btn btn-outline" style={{ padding: '0.75rem', color: 'var(--error)', borderColor: 'var(--border)' }}>
                      <Trash2 size={20} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {servicios.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>Aún no tienes servicios registrados.</div>}
      </div>
    </div>
  );
}
