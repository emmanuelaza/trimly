import { getClientes, createCliente } from '@/app/actions/clientes';
import { MessageCircle, Plus } from 'lucide-react';

export default async function ClientesPage() {
  const clientes = await getClientes();

  const getRetentionStatus = (dateString?: string | null) => {
    if (!dateString) return null;
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
    if (days >= 60) return { label: 'Riesgo Alto (60+)', color: 'var(--error)' };
    if (days >= 30) return { label: 'Cuidado (30+)', color: '#F59E0B' };
    if (days >= 15) return { label: 'Toca Corte (15)', color: 'var(--primary)' };
    return { label: 'Frecuente', color: 'var(--success)' };
  };

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

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#F9FAFB' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--secondary)', fontWeight: 600 }}>Cliente</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--secondary)', fontWeight: 600 }}>Estado (Retención)</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--secondary)', fontWeight: 600 }}>Contacto</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c: any) => {
              const retention = getRetentionStatus(c.ultima_visita);
              const message = `Hola ${c.nombre}, hace tiempo no nos visitas. ¡Te esperamos en Trimly para tu próximo corte! 💈`;
              const wpUrl = c.telefono ? `https://wa.me/${c.telefono.replace(/\D/g,'')}?text=${encodeURIComponent(message)}` : '#';

              return (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1.5rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--foreground)' }}>{c.nombre}</div>
                    <div style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>{c.telefono || 'Sin número'}</div>
                  </td>
                  <td style={{ padding: '1.5rem' }}>
                    {retention ? (
                      <span style={{ backgroundColor: retention.color, color: 'white', padding: '0.3rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                        {retention.label}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>Nuevo</span>
                    )}
                  </td>
                  <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                    {c.telefono ? (
                      <a href={wpUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ color: '#059669', borderColor: '#10B981', textDecoration: 'none' }}>
                        <MessageCircle size={18} />
                        WhatsApp
                      </a>
                    ) : (
                      <span className="text-gray text-sm">N/A</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {clientes.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>Aún no tienes clientes registrados.</div>}
      </div>
    </div>
  );
}
