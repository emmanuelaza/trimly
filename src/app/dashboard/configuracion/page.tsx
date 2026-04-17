import { createClient } from '@/lib/supabase/server';
import { updateConfiguracion } from '@/app/actions/configuracion';
import { Save } from 'lucide-react';
import Link from 'next/link';

export default async function ConfiguracionPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const negocio = user?.user_metadata?.negocio || "Barbería";
  const horario = user?.user_metadata?.horario || "09:00 - 18:00";

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Configuración de la Barbería</h1>
      </div>

      <div className="card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Datos Generales</h2>
        <form action={updateConfiguracion} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="negocio">Nombre del Negocio</label>
            <input id="negocio" name="negocio" type="text" className="input-field" defaultValue={negocio} required />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="horario">Horario de Atención Central</label>
            <input id="horario" name="horario" type="text" className="input-field" defaultValue={horario} placeholder="Ej: Lunes a Sábado 9am - 8pm" required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Save size={20} /> Guardar Cambios
          </button>
        </form>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Sistemas Adicionales</h2>
        <p className="text-gray" style={{ marginBottom: '1.5rem' }}>Gestiona los componentes principales de tu negocio desde estos accesos rápidos.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/dashboard/servicios" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', textDecoration: 'none', color: 'var(--foreground)' }}>
            <span style={{ fontWeight: 600 }}>Gestión de Servicios y Precios</span>
            <span style={{ color: 'var(--primary)' }}>&rarr;</span>
          </Link>
          <Link href="/dashboard/barberos" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', textDecoration: 'none', color: 'var(--foreground)' }}>
            <span style={{ fontWeight: 600 }}>Gestión de Barberos / Personal</span>
            <span style={{ color: 'var(--primary)' }}>&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
