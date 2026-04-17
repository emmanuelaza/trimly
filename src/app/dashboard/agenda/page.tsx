import { getClientes } from '@/app/actions/clientes';
import { getCitas, createCita, deleteCita } from '@/app/actions/citas';
import { getClientes } from '@/app/actions/clientes';
import { getServicios } from '@/app/actions/servicios';
import { Plus, MessageCircle, Trash2 } from 'lucide-react';

export const revalidate = 60;

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const params = await searchParams;
  const filterDate = params.date || new Date().toISOString().split('T')[0];

  const allCitas = await getCitas();
  const citas = allCitas.filter((c: any) => c.fecha === filterDate);
  const clientes = await getClientes();
  const servicios = await getServicios();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Agenda</h1>
        <form method="get" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 600 }}>Día:</label>
          <input type="date" name="date" className="input-field" defaultValue={filterDate} style={{ marginBottom: 0, padding: '0.5rem' }} />
          <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Ver</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>+ Agendar Nueva Cita</h2>
        <form action={createCita} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>

          <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="input-label" htmlFor="cliente_id">Cliente</label>
            <select id="cliente_id" name="cliente_id" className="input-field" required>
              <option value="">Selecciona un cliente</option>
              {clientes.map((c: any) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0, flex: '1 1 200px' }}>
            <label className="input-label" htmlFor="servicio_id">Servicio</label>
            <select id="servicio_id" name="servicio_id" className="input-field" required>
              <option value="">Selecciona servicio</option>
              {servicios.map((s: any) => <option key={s.id} value={s.id}>{s.nombre} (${s.precio})</option>)}
            </select>
          </div>

          <div className="input-group" style={{ marginBottom: 0, width: '130px' }}>
            <label className="input-label" htmlFor="fecha">Fecha</label>
            {/* Usamos defaultValue hoy para que sea inmediato */}
            <input id="fecha" name="fecha" type="date" className="input-field" defaultValue={new Date().toISOString().split('T')[0]} required />
          </div>

          <div className="input-group" style={{ marginBottom: 0, width: '120px' }}>
            <label className="input-label" htmlFor="hora">Hora</label>
            <input id="hora" name="hora" type="time" className="input-field" required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 1.5rem', flex: '0 0 auto' }}>
            <Plus size={20} /> Guardar
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {citas.length === 0 && <p className="text-gray">No hay citas programadas.</p>}
        {citas.map((cita: any) => {
          const horaStr = cita.hora.substring(0, 5); // Remueve los segundos
          const message = `Hola ${cita.cliente.nombre}, te recordamos tu cita el ${cita.fecha} a las ${horaStr} hrs en Trimly Barbers. ¡Te esperamos!`;
          const wpUrl = cita.cliente.telefono ? `https://wa.me/${cita.cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(message)}` : '#';

          return (
            <div key={cita.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', width: '90px' }}>{horaStr}</div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)' }}>{cita.cliente.nombre}</div>
                  <div style={{ color: 'var(--secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{cita.servicio.nombre}</span>
                    <span>•</span>
                    <span>${cita.servicio.precio}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {cita.cliente.telefono && (
                  <a href={wpUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success" style={{ padding: '0.75rem 1.5rem', textDecoration: 'none' }}>
                    <MessageCircle size={20} />
                    WhatsApp
                  </a>
                )}
                <form action={async () => { "use server"; await deleteCita(cita.id); }}>
                  <button type="submit" className="btn btn-outline" style={{ padding: '0.75rem', color: 'var(--error)', borderColor: 'var(--border)' }}>
                    <Trash2 size={20} />
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
