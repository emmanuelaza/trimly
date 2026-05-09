"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Calendar, 
  Wallet, 
  LogOut, 
  UserCircle,
  Menu,
  X,
  Scissors
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';

const barberNavItems = [
  { href: '/barber/dashboard', label: 'Inicio', icon: Home },
  { href: '/barber/agenda', label: 'Mi Agenda', icon: Calendar },
  { href: '/barber/ganancias', label: 'Mis Ganancias', icon: Wallet },
];

export default function BarberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const NavItem = ({ item, onClick }: { item: any, onClick?: () => void }) => {
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
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? 'bg-accent/15' : 'bg-background-tertiary'}`}>
          <item.icon size={18} className={isActive ? 'text-accent' : ''} />
        </div>
        <span className="text-sm font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-background-primary overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-[240px] bg-background-primary border-r border-border">
        <div className="px-6 py-8 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Scissors size={18} className="text-background-primary" />
            </div>
            <p className="text-lg font-black text-text-primary">Trimly <span className="text-accent">Pro</span></p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {barberNavItems.map(item => <NavItem key={item.href} item={item} />)}
        </nav>

        <div className="px-4 py-6 border-t border-border">
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-border bg-background-primary/80 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Scissors size={20} className="text-accent" />
            <p className="font-black text-text-primary">Trimly</p>
          </div>
          <button onClick={() => setDrawerOpen(true)} className="p-2 text-text-secondary">
            <Menu size={24} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="max-w-[1200px] mx-auto p-6 md:p-10 lg:p-16">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
      )}
      <div className={`fixed inset-y-0 right-0 z-[70] w-72 bg-background-primary border-l border-border transition-transform duration-300 shadow-2xl ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-6 border-b border-border">
          <p className="font-bold text-text-primary">Menú Barbero</p>
          <button onClick={() => setDrawerOpen(false)} className="p-2 text-text-secondary">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 space-y-1">
          {barberNavItems.map(item => <NavItem key={item.href} item={item} onClick={() => setDrawerOpen(false)} />)}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <form action="/auth/signout" method="post">
            <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors">
              <LogOut size={18} />
              <span className="text-sm font-medium">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
