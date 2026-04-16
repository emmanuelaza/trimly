import { getBarberos, createBarbero, deleteBarbero } from '@/app/actions/barberos';
import { Plus, Trash2 } from 'lucide-react';

export default async function BarberosPage() {
  const barberos = await getBarberos();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Equipo de Trimly</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Añadir Barbero</h2>
        <form action={createBarbero} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ marginBottom: 0, flex: 2 }}>
            <label className="input-label" htmlFor="nombre">Nombre del Barbero</label>
            <input id="nombre" name="nombre" type="text" className="input-field" placeholder="Marlon" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem' }}>
            <Plus size={20} /> Añadir
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Barberos Activos</h2>
        {barberos.length === 0 ? <p className="text-gray">No hay equipo registrado.</p> : null}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {barberos.map((b: any) => (
            <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                {b.nombre}
              </div>
              <form action={async () => { "use server"; await deleteBarbero(b.id); }}>
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
