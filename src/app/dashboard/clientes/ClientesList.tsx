"use client";

import { useState } from 'react';
import { MessageCircle, Search } from 'lucide-react';

export default function ClientesList({ clientes }: { clientes: any[] }) {
  const [search, setSearch] = useState('');

  const filteredClientes = clientes.filter((c) =>
    c.nombre?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono?.includes(search)
  );

  const getRetentionStatus = (dateString?: string | null) => {
    if (!dateString) return null;
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 3600 * 24));
    if (days >= 60) return { label: 'Riesgo Alto (60+)', color: 'var(--error)' };
    if (days >= 30) return { label: 'Cuidado (30+)', color: '#F59E0B' };
    if (days >= 15) return { label: 'Toca Corte (15)', color: 'var(--primary)' };
    return { label: 'Frecuente', color: 'var(--success)' };
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Search size={20} className="text-gray" />
        <input
          type="text"
          placeholder="Buscar por nombre o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%', fontSize: '1rem' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#F9FAFB' }}>
            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--secondary)', fontWeight: 600 }}>Cliente</th>
            <th style={{ padding: '1rem 1.5rem', textAlign: 'left', color: 'var(--secondary)', fontWeight: 600 }}>Estado (Retención)</th>
            <th style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--secondary)', fontWeight: 600 }}>Contacto</th>
          </tr>
        </thead>
        <tbody>
          {filteredClientes.map((c: any) => {
            const retention = getRetentionStatus(c.ultima_visita);
            const message = `Hola ${c.nombre}, hace tiempo no nos visitas. ¡Te esperamos en Trimly para tu próximo corte! 💈`;
            const wpUrl = c.telefono ? `https://wa.me/${c.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(message)}` : '#';

            return (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '1.125rem', color: 'var(--foreground)' }}>{c.nombre}</div>
                  <div style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>{c.telefono || 'Sin número'}</div>
                  {c.notas && <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', marginTop: '0.25rem' }}>Notas: {c.notas}</div>}
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
      {filteredClientes.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--secondary)' }}>No se encontraron clientes.</div>}
    </div>
  );
}
