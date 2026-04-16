import Link from 'next/link';
import Image from 'next/image';
import { Home, Calendar, Users, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="dashboard-layout">
      <aside style={{ width: '260px', backgroundColor: 'var(--card-bg)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem 1.5rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '200px', height: '140px', marginBottom: '1rem' }}>
            <Image src="/logo.png" alt="Trimly" fill style={{ objectFit: 'contain', objectPosition: 'center' }} priority />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', textAlign: 'center', margin: 0, fontWeight: 500 }}>{user.user_metadata?.negocio || "Barbería"}</p>
        </div>
        
        <nav style={{ flex: 1, padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--foreground)', fontWeight: 500, transition: 'background 0.2s' }}>
            <Home size={20} />
            <span>Inicio</span>
          </Link>
          <Link href="/dashboard/agenda" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--foreground)', fontWeight: 500, transition: 'background 0.2s' }}>
            <Calendar size={20} />
            <span>Agenda</span>
          </Link>
          <Link href="/dashboard/clientes" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--foreground)', fontWeight: 500, transition: 'background 0.2s' }}>
            <Users size={20} />
            <span>Clientes</span>
          </Link>
        </nav>

        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid var(--border)' }}>
          <form action="/auth/signout" method="post">
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--error)', fontWeight: 500, background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.2s' }}>
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      </aside>

      <main className="dashboard-main">
        {children}
      </main>
    </div>
  );
}
