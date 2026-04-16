import { getCitas } from '@/app/actions/citas';
import { getClientes } from '@/app/actions/clientes';

export default async function DashboardHome() {
  const citas = await getCitas();
  const clientes = await getClientes();

  // Fecha de hoy local simplificada asumiendo uso en misma zona o estandarizando
  // Para MVP tomaremos el ISO String truncado a Date
  const todayStr = new Date().toISOString().split('T')[0];

  const citasHoy = citas.filter((c: any) => c.fecha === todayStr);
  
  // Clientes únicos agendados para hoy
  const uniqueClientsHoy = new Set(citasHoy.map((c: any) => c.cliente_id)).size;

  // Calculo real de ingresos basado en "precio_cobrado" en DB
  const ingresosHoy = citasHoy.reduce((acc: number, c: any) => acc + (Number(c.precio_cobrado) || 0), 0);

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Resumen de Hoy</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Citas Hoy</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)' }}>{citasHoy.length}</p>
        </div>
        
        <div className="card">
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clientes Atendidos</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)' }}>{uniqueClientsHoy}</p>
        </div>
        
        <div className="card">
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ingresos Hoy</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>${ingresosHoy.toFixed(2)}</p>
        </div>
      </div>
      
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '3rem', marginBottom: '1rem' }}>Próximas Citas (Hoy)</h2>
      {citasHoy.length === 0 ? (
        <p className="text-gray" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '0.75rem', border: '1px dashed var(--border)', textAlign: 'center' }}>No hay citas registradas para hoy. Ve a la Agenda para crear una.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
          {citasHoy.map((cita: any) => (
            <div key={cita.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <div style={{ fontSize: '1.125rem' }}><strong style={{ color: 'var(--primary)' }}>{cita.hora.substring(0,5)}</strong> <span style={{ margin: '0 1rem' }}>|</span> {cita.cliente?.nombre}</div>
              <div className="text-gray">{cita.servicio?.nombre} (${cita.precio_cobrado})</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
