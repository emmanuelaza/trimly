import { getCitas } from '@/app/actions/citas';
import { DollarSign, Tremor } from 'lucide-react';

export default async function IngresosPage() {
  const citas = await getCitas();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Calcula el inicio de la semana (Lunes)
  const today = new Date();
  const firstDay = new Date(today.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)));
  const firstDayStr = firstDay.toISOString().split('T')[0];

  const citasHoy = citas.filter((c: any) => c.fecha === todayStr);
  const ingresosHoy = citasHoy.reduce((acc: number, c: any) => acc + (Number(c.precio_cobrado) || 0), 0);

  const citasSemana = citas.filter((c: any) => c.fecha && c.fecha >= firstDayStr && c.fecha <= todayStr);
  const ingresosSemana = citasSemana.reduce((acc: number, c: any) => acc + (Number(c.precio_cobrado) || 0), 0);

  const citasMes = citas.filter((c: any) => c.fecha && c.fecha.startsWith(currentMonthStr));
  const ingresosMes = citasMes.reduce((acc: number, c: any) => acc + (Number(c.precio_cobrado) || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Ingresos</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--secondary)', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hoy</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--success)' }}>${ingresosHoy.toFixed(2)}</p>
          <div style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>{citasHoy.length} citas</div>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--secondary)', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Esta Semana</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary)' }}>${ingresosSemana.toFixed(2)}</p>
          <div style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>{citasSemana.length} citas</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
          <h3 style={{ color: 'var(--secondary)', fontSize: '1rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Este Mes</h3>
          <p style={{ fontSize: '3.5rem', fontWeight: 800, color: '#F59E0B' }}>${ingresosMes.toFixed(2)}</p>
          <div style={{ color: 'var(--secondary)', marginTop: '0.5rem' }}>{citasMes.length} citas</div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '3rem', marginBottom: '1rem' }}>Últimas transacciones</h2>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#F9FAFB' }}>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--secondary)', fontWeight: 600 }}>Fecha</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--secondary)', fontWeight: 600 }}>Cliente / Servicio</th>
              <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--secondary)', fontWeight: 600 }}>Monto</th>
            </tr>
          </thead>
          <tbody>
            {citas.slice(0, 15).map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{c.fecha}</div>
                  <div style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>{c.hora.substring(0, 5)}</div>
                </td>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{c.cliente?.nombre || 'General'}</div>
                  <div style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>{c.servicio?.nombre || 'Servicio'}</div>
                </td>
                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                  <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '1.125rem' }}>${Number(c.precio_cobrado).toFixed(2)}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {citas.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>Aún no hay transacciones.</div>}
      </div>
    </div>
  );
}
