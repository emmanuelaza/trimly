import { getClientes } from '@/app/actions/clientes';
import { MessageCircle } from 'lucide-react';

export default async function RetencionPage() {
  const clientes = await getClientes();

  const parseDays = (dateStr?: string | null) => {
    if (!dateStr) return 0;
    return Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
  };

  const getWpUrl = (c: any) => {
    const message = `Hola ${c.nombre}, hace tiempo no nos visitas. ¡Te esperamos en Trimly para tu próximo corte! 💈 ¿Quieres agendar?`;
    return c.telefono ? `https://wa.me/${c.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(message)}` : '#';
  };

  const c15 = clientes.filter((c: any) => {
    const d = parseDays(c.ultima_visita);
    return d >= 15 && d < 30;
  });

  const c30 = clientes.filter((c: any) => {
    const d = parseDays(c.ultima_visita);
    return d >= 30 && d < 60;
  });

  const c60 = clientes.filter((c: any) => {
    const d = parseDays(c.ultima_visita);
    return d >= 60;
  });

  const renderList = (list: any[], title: string, color: string) => (
    <div className="card" style={{ flex: '1 1 300px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color, marginBottom: '1.5rem', borderBottom: `2px solid ${color}`, paddingBottom: '0.5rem' }}>
        {title} ({list.length})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {list.length === 0 && <p className="text-gray" style={{ textAlign: 'center' }}>No hay clientes en este estado.</p>}
        {list.map((c: any) => (
          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{c.nombre}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Última visita: {c.ultima_visita}</div>
            </div>
            {c.telefono ? (
              <a href={getWpUrl(c)} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <MessageCircle size={16} /> Contactar
              </a>
            ) : (
              <span className="text-gray" style={{ fontSize: '0.875rem' }}>Sin Teléfono</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Retención de Clientes</h1>
        <p className="text-gray" style={{ marginTop: '0.5rem' }}>Recupera a los clientes que no han vuelto a la barbería.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        {renderList(c15, "Perdidos hace 15+ días", "var(--primary)")}
        {renderList(c30, "Perdidos hace 30+ días", "#F59E0B")}
        {renderList(c60, "Riesgo Alto (60+ días)", "var(--error)")}
      </div>
    </div>
  );
}
