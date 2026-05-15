"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  Home,
  Calendar,
  Wallet,
  LogOut,
  Scissors,
  Menu,
  X,
} from 'lucide-react';

const barberNavItems = [
  { href: '/barber/dashboard', label: 'Inicio',    shortLabel: 'Inicio',    icon: Home },
  { href: '/barber/agenda',    label: 'Mi Agenda', shortLabel: 'Agenda',    icon: Calendar },
  { href: '/barber/ganancias', label: 'Ganancias', shortLabel: 'Ganancias', icon: Wallet },
];

function getAnonClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subStatus, setSubStatus] = useState<'loading' | 'ok' | 'blocked'>('loading');
  const [blockedBarbershopName, setBlockedBarbershopName] = useState('');

  const isAccessPage = pathname.startsWith('/barber/access');

  useEffect(() => {
    if (isAccessPage) {
      setSubStatus('ok');
      return;
    }

    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('trimly_barber_session');
    if (!stored) {
      setSubStatus('ok');
      return;
    }

    let session: { barbershopId?: string } = {};
    try {
      session = JSON.parse(stored);
    } catch {
      setSubStatus('ok');
      return;
    }

    if (!session.barbershopId) {
      setSubStatus('ok');
      return;
    }

    const supabase = getAnonClient();
    supabase
      .from('barbershops')
      .select('subscription_status, trial_ends_at, name')
      .eq('id', session.barbershopId)
      .maybeSingle()
      .then(
        ({ data }) => {
          setBlockedBarbershopName(data?.name ?? '');
          const trialVencido = data?.trial_ends_at
            ? new Date(data.trial_ends_at) < new Date()
            : false;
          const bloqueado =
            data?.subscription_status === 'expired' ||
            ((data?.subscription_status === 'trial' || data?.subscription_status === 'trialing') &&
              trialVencido);
          setSubStatus(bloqueado ? 'blocked' : 'ok');
        },
        () => setSubStatus('ok'),
      );
  }, [isAccessPage]);

  // Access pages — full screen, no shell
  if (isAccessPage) {
    return <>{children}</>;
  }

  // Loading subscription status
  if (subStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Barbershop subscription expired
  if (subStatus === 'blocked') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background-primary p-8 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center mb-6">
          <Scissors size={28} className="text-warning" />
        </div>
        <h2 className="text-xl font-black text-text-primary">
          Barbería temporalmente inactiva
        </h2>
        <p className="text-sm text-text-secondary mt-3 leading-relaxed">
          {blockedBarbershopName
            ? `El dueño de ${blockedBarbershopName} necesita activar su plan en Trimly para que puedas seguir viendo tus citas.`
            : 'El dueño de la barbería necesita activar su plan en Trimly para que puedas seguir viendo tus citas.'}
        </p>
        <p className="text-xs text-text-tertiary mt-4">
          Avísale para que lo active.
        </p>
      </div>
    );
  }

  const NavItem = ({ item, onClick }: { item: (typeof barberNavItems)[0]; onClick?: () => void }) => {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        onClick={onClick}
        className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-accent-muted text-accent font-semibold'
            : 'text-text-secondary hover:bg-background-tertiary hover:text-text-primary'
        }`}
      >
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-accent/15' : 'bg-background-tertiary'
          }`}
        >
          <item.icon size={18} className={isActive ? 'text-accent' : ''} />
        </div>
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-background-primary overflow-hidden">
      {/* Sidebar — Desktop */}
      <aside className="hidden md:flex flex-col w-[240px] bg-background-primary border-r border-border">
        <div className="px-6 py-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Scissors size={18} className="text-background-primary" />
            </div>
            <p className="text-lg font-black text-text-primary">
              Trimly <span className="text-accent">Pro</span>
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {barberNavItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-border">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('trimly_barber_session');
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-border bg-background-primary/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Scissors size={20} className="text-accent" />
            <p className="font-black text-text-primary">Trimly</p>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="p-2 text-text-secondary">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-32 md:pb-0">
          <div className="max-w-[1200px] mx-auto p-5 md:p-10">
            {children}
          </div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background-primary/95 backdrop-blur-xl border-t border-border z-50"
          style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}>
          <div className="flex items-stretch justify-around px-2 py-1">
            {barberNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-4 min-w-[72px] transition-colors rounded-xl ${
                    isActive ? 'text-accent' : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-xl transition-colors ${
                    isActive ? 'bg-accent/15' : ''
                  }`}>
                    <item.icon size={20} />
                  </div>
                  <span className="text-[10px] font-semibold leading-none">{item.shortLabel}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-[70] w-72 bg-background-primary border-l border-border transition-transform duration-300 shadow-2xl ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6 border-b border-border">
          <p className="font-bold text-text-primary">Menú Barbero</p>
          <button onClick={() => setDrawerOpen(false)} className="p-2 text-text-secondary">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-1">
          {barberNavItems.map((item) => (
            <NavItem key={item.href} item={item} onClick={() => setDrawerOpen(false)} />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('trimly_barber_session');
                window.location.href = '/';
              }
            }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
