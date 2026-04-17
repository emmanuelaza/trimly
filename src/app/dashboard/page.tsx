import { getCitas } from '@/app/actions/citas';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export const revalidate = 60;

export default async function DashboardHome() {
  const citas = await getCitas();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const citasHoy = citas.filter((c: any) => c.fecha === todayStr);
  const uniqueClientsHoy = new Set(citasHoy.map((c: any) => c.cliente_id)).size;
  const ingresosHoy = citasHoy.reduce((acc: number, c: any) => acc + (Number(c.precio_cobrado) || 0), 0);

  const citasMes = citas.filter((c: any) => c.fecha && c.fecha.startsWith(currentMonthStr));
  const ingresosMes = citasMes.reduce((acc: number, c: any) => acc + (Number(c.precio_cobrado) || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Resumen</h1>
        <Link href="/dashboard/agenda" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Plus size={20} />
          Crear Cita
        </Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ingresos Hoy</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>${ingresosHoy.toFixed(2)}</p>
        </div>
        
        <div className="card">
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ingresos Mes</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>${ingresosMes.toFixed(2)}</p>
        </div>

        <div className="card">
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Citas Hoy</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)' }}>{citasHoy.length}</p>
        </div>
        
        <div className="card">
          <h3 style={{ color: 'var(--secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Clientes Hoy</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--foreground)' }}>{uniqueClientsHoy}</p>
        </div>
      </div>
      
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '3rem', marginBottom: '1rem' }}>Próximas Citas (Hoy)</h2>
      {citasHoy.length === 0 ? (
        <p className="text-gray" style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '0.75rem', border: '1px dashed var(--border)', textAlign: 'center' }}>No hay citas registradas para hoy.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px' }}>
          {citasHoy.map((cita: any) => (
            <div key={cita.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 1.5rem', alignItems: 'center' }}>
              <div style={{ fontSize: '1.125rem' }}>
                <strong style={{ color: 'var(--primary)', display: 'inline-block', width: '60px' }}>{cita.hora.substring(0,5)}</strong> 
                <span style={{ margin: '0 1rem', color: 'var(--border)' }}>|</span> 
                {cita.cliente?.nombre}
              </div>
              <div className="text-gray" style={{ fontWeight: 500 }}>
                {cita.servicio?.nombre} (${cita.precio_cobrado})
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
